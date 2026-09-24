import { Router } from 'express';
import { one, pool, query } from '../config/db.js';
import { requireClient } from '../middleware/auth.js';
import { HttpError, currencyFor, decodeSymbol, hashPassword, pick, verifyPassword } from '../utils/helpers.js';

const router = Router();
router.use(requireClient);

const PROFILE_FIELDS = ['fname', 'lname', 'contact_no', 'gender', 'dob', 'address', 'city', 'state', 'country', 'pincode'];

const withSymbol = (rows, key) => rows.map((r) => ({ ...r, symbol: decodeSymbol(r[key]) }));

router.get('/profile', async (req, res) => {
  const { password, ...user } = await one('SELECT * FROM users WHERE id = ?', [req.user.id]);
  res.json(user);
});

router.put('/profile', async (req, res) => {
  const data = pick(req.body, PROFILE_FIELDS);
  if (!Object.keys(data).length) throw new HttpError(400, 'Nothing to update');
  await query('UPDATE users SET ?, updated_at = NOW() WHERE id = ?', [data, req.user.id]);
  res.json({ message: 'Your Details Updated Successfully' });
});

router.put('/password', async (req, res) => {
  // Field names, check order and messages follow Login::update_muser_password.
  const current = String(req.body.curr_password ?? '').trim();
  const next = String(req.body.new_password ?? '').trim();
  const confirm = String(req.body.cfm_password ?? '').trim();
  if (next.length < 8) throw new HttpError(400, 'Password length should be 8.');
  if (!current || !next || !confirm) {
    throw new HttpError(400, 'All fields are required. Please complete the form and try again.');
  }
  if (next !== confirm) throw new HttpError(400, 'New password and confirm password Not Match.');

  const user = await one('SELECT password FROM users WHERE id = ?', [req.user.id]);
  if (!(await verifyPassword(current, user.password)).ok) throw new HttpError(400, 'Current Password Not Match');

  await query('UPDATE users SET password = ?, updated_at = NOW() WHERE id = ?', [await hashPassword(next), req.user.id]);
  res.json({ message: 'Password changed successfully.' });
});

// ---- cart ----

const loadCart = async (userId) =>
  withSymbol(
    await query(
      `SELECT carts.*, products.pro_name, products.pro_alias FROM carts
       JOIN products ON products.id = carts.pro_id WHERE carts.usr_id = ?`,
      [userId],
    ),
    'curr_symbol',
  );

router.get('/cart', async (req, res) => res.json(await loadCart(req.user.id)));

router.post('/cart', async (req, res) => {
  const qty = Math.max(1, parseInt(req.body.qty, 10) || 1);
  const product = await one("SELECT * FROM products WHERE pro_alias = ? AND status = 'Active'", [req.body.alias]);
  if (!product) throw new HttpError(404, 'Product not found');

  const existing = await one('SELECT * FROM carts WHERE pro_id = ? AND usr_id = ?', [product.id, req.user.id]);
  if (existing) {
    await query('UPDATE carts SET qty = qty + ?, updated_at = NOW() WHERE id = ?', [qty, existing.id]);
  } else {
    const image = await one('SELECT image FROM product_images WHERE pro_id = ? AND order_no = 1', [product.id]);
    const currency = currencyFor(req.user.currency);
    await query(
      `INSERT INTO carts (usr_id, pro_id, qty, curr_symbol, price, pro_image, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [req.user.id, product.id, qty, currency.entity, product[currency.column], image?.image ?? null],
    );
  }
  res.status(201).json(await loadCart(req.user.id));
});

router.put('/cart', async (req, res) => {
  const items = Array.isArray(req.body.items) ? req.body.items : [];
  for (const item of items) {
    const qty = parseInt(item.qty, 10);
    if (qty > 0) {
      await query('UPDATE carts SET qty = ?, updated_at = NOW() WHERE id = ? AND usr_id = ?', [qty, item.id, req.user.id]);
    }
  }
  res.json(await loadCart(req.user.id));
});

router.delete('/cart/:id', async (req, res) => {
  await query('DELETE FROM carts WHERE id = ? AND usr_id = ?', [req.params.id, req.user.id]);
  res.json(await loadCart(req.user.id));
});

// ---- wishlist ----

const loadWishlist = (userId) =>
  query(
    `SELECT wishlists.*, products.pro_name, products.pro_alias, products.qty FROM wishlists
     JOIN products ON products.id = wishlists.pro_id WHERE wishlists.usr_id = ?`,
    [userId],
  );

router.get('/wishlist', async (req, res) => res.json(await loadWishlist(req.user.id)));

router.post('/wishlist', async (req, res) => {
  const product = await one('SELECT id FROM products WHERE pro_alias = ?', [req.body.alias]);
  if (!product) throw new HttpError(404, 'Product not found');

  const exists = await one('SELECT id FROM wishlists WHERE pro_id = ? AND usr_id = ?', [product.id, req.user.id]);
  if (!exists) {
    const image = await one('SELECT image FROM product_images WHERE pro_id = ? AND order_no = 1', [product.id]);
    await query('INSERT INTO wishlists (pro_id, usr_id, pro_image) VALUES (?, ?, ?)', [
      product.id,
      req.user.id,
      image?.image ?? null,
    ]);
  }
  res.status(201).json(await loadWishlist(req.user.id));
});

router.delete('/wishlist/:id', async (req, res) => {
  await query('DELETE FROM wishlists WHERE id = ? AND usr_id = ?', [req.params.id, req.user.id]);
  res.json(await loadWishlist(req.user.id));
});

// ---- orders ----

router.get('/orders', async (req, res) => {
  const orders = await query('SELECT * FROM orders WHERE usr_id = ? ORDER BY id DESC', [req.user.id]);
  res.json(withSymbol(orders, 'curn_symbol'));
});

router.get('/orders/:id', async (req, res) => {
  const order = await one('SELECT * FROM orders WHERE id = ? AND usr_id = ?', [req.params.id, req.user.id]);
  if (!order) throw new HttpError(404, 'Order not found');
  const items = await query(
    `SELECT order_products.*, products.pro_name, products.pro_alias, products.sku FROM order_products
     JOIN products ON products.id = order_products.pro_id WHERE order_products.ord_id = ?`,
    [order.id],
  );
  res.json({ order: { ...order, symbol: decodeSymbol(order.curn_symbol) }, items: withSymbol(items, 'cur_symbol') });
});

router.post('/orders', async (req, res) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [cart] = await conn.query('SELECT * FROM carts WHERE usr_id = ? FOR UPDATE', [req.user.id]);
    if (!cart.length) throw new HttpError(400, 'Your cart is empty');

    const shipping = pick(req.body, PROFILE_FIELDS);
    if (Object.keys(shipping).length) {
      await conn.query('UPDATE users SET ?, updated_at = NOW() WHERE id = ?', [shipping, req.user.id]);
    }

    const totalQty = cart.reduce((sum, c) => sum + Number(c.qty), 0);
    const totalAmount = cart.reduce((sum, c) => sum + Number(c.price) * Number(c.qty), 0);

    const [order] = await conn.query('INSERT INTO orders SET ?', {
      order_date: new Date().toISOString().slice(0, 10),
      total_qty: totalQty,
      total_amount: totalAmount,
      curn_symbol: cart[0].curr_symbol,
      usr_id: req.user.id,
      ship_amount: 0,
      payment_status: 'pending',
      payment_way: 'bank transfer',
      order_status: 'pending',
      special_note: String(req.body.special_note ?? ''),
    });

    await conn.query('INSERT INTO order_products (pro_id, ord_id, qty, cur_symbol, price, proimage) VALUES ?', [
      cart.map((c) => [c.pro_id, order.insertId, c.qty, c.curr_symbol, c.price, c.pro_image]),
    ]);
    await conn.query('DELETE FROM carts WHERE usr_id = ?', [req.user.id]);

    await conn.commit();
    res.status(201).json({ orderId: order.insertId, message: 'Your order has been placed' });
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
});

export default router;
