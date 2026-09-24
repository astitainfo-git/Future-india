import { Router } from 'express';
import { one, query } from '../config/db.js';
import { requireAdmin } from '../middleware/auth.js';
import { imageUpload, removeImage, saveImage } from '../middleware/upload.js';
import { HttpError, hashPassword, pick, slugify, verifyPassword } from '../utils/helpers.js';

const router = Router();
router.use(requireAdmin);

const FILTER_TYPES = ['size', 'color', 'fabric', 'tags'];

function resource(path, config) {
  const { table, fields, timestamps = false, alias, image, create = true, remove = true } = config;
  const { required = [], hidden = [], listFilter, listSql, beforeSave, validate } = config;

  const strip = (row) => (row ? Object.fromEntries(Object.entries(row).filter(([k]) => !hidden.includes(k))) : row);
  const upload = image ? [imageUpload.single('image')] : [];

  const prepare = async (body) => {
    const data = pick(body, fields);
    if (alias && data[alias.from] !== undefined) data[alias.to] = slugify(data[alias.from]);
    validate?.(data);
    await beforeSave?.(data, body);
    if (timestamps) data.updated_at = new Date();
    return data;
  };

  const attachImage = async (id, file) => {
    if (!image || !file) return;
    const row = await one(`SELECT * FROM ${table} WHERE id = ?`, [id]);
    const name = await saveImage(file, image.folder, image.name(row));
    if (row.image && row.image !== name) await removeImage(image.folder, row.image);
    await query(`UPDATE ${table} SET image = ? WHERE id = ?`, [name, id]);
  };

  router.get(path, async (req, res) => {
    const value = listFilter && req.query[listFilter.param];
    // findAll() order, as the PHP list screens used; listSql adds the joins some screens showed.
    const rows = value
      ? await query(`SELECT * FROM ${table} WHERE ${listFilter.column} = ? ORDER BY id ASC`, [value])
      : await query(listSql ?? `SELECT * FROM ${table} ORDER BY id ASC`);
    res.json(rows.map(strip));
  });

  router.get(`${path}/:id`, async (req, res) => {
    const row = await one(`SELECT * FROM ${table} WHERE id = ?`, [req.params.id]);
    if (!row) throw new HttpError(404, 'Record not found');
    res.json(strip(row));
  });

  router.put(`${path}/:id`, ...upload, async (req, res) => {
    const existing = await one(`SELECT id FROM ${table} WHERE id = ?`, [req.params.id]);
    if (!existing) throw new HttpError(404, 'Record not found');
    const data = await prepare(req.body);
    if (Object.keys(data).length) await query(`UPDATE ${table} SET ? WHERE id = ?`, [data, existing.id]);
    await attachImage(existing.id, req.file);
    res.json(strip(await one(`SELECT * FROM ${table} WHERE id = ?`, [existing.id])));
  });

  if (create) {
    router.post(path, ...upload, async (req, res) => {
      const data = await prepare(req.body);
      const missing = required.filter((f) => !data[f]);
      if (missing.length) throw new HttpError(400, `Missing required fields: ${missing.join(', ')}`);
      if (timestamps) data.created_at = data.updated_at;
      const result = await query(`INSERT INTO ${table} SET ?`, [data]);
      await attachImage(result.insertId, req.file);
      res.status(201).json(strip(await one(`SELECT * FROM ${table} WHERE id = ?`, [result.insertId])));
    });
  }

  if (remove) {
    router.delete(`${path}/:id`, async (req, res) => {
      const row = await one(`SELECT * FROM ${table} WHERE id = ?`, [req.params.id]);
      if (!row) throw new HttpError(404, 'Record not found');
      await query(`DELETE FROM ${table} WHERE id = ?`, [row.id]);
      if (image) await removeImage(image.folder, row.image);
      res.json({ message: 'Deleted' });
    });
  }
}

const SEO = ['meta_tag', 'meta_keywords', 'meta_description'];

resource('/categories', {
  table: 'categories',
  fields: ['category_name', 'description', 'status', ...SEO],
  required: ['category_name'],
  alias: { from: 'category_name', to: 'category_alias' },
  image: { folder: 'category', name: (row) => row.category_alias },
  timestamps: true,
});

resource('/subcategories', {
  table: 'subcategories',
  fields: ['subcategory_name', 'cat_id', 'description', 'status', ...SEO],
  required: ['subcategory_name', 'cat_id'],
  listSql: `SELECT subcategories.*, categories.category_name FROM subcategories
    JOIN categories ON categories.id = subcategories.cat_id ORDER BY subcategories.id ASC`,
  alias: { from: 'subcategory_name', to: 'subcategory_alias' },
  image: { folder: 'subcategory', name: (row) => row.subcategory_alias },
  timestamps: true,
});

resource('/filters', {
  table: 'filters',
  fields: ['filter_name', 'color_code', 'filter_type'],
  required: ['filter_name', 'filter_type'],
  alias: { from: 'filter_name', to: 'filter_alias' },
  listFilter: { param: 'type', column: 'filter_type' },
  validate: (data) => {
    if (data.filter_type !== undefined && !FILTER_TYPES.includes(data.filter_type)) {
      throw new HttpError(400, `filter_type must be one of ${FILTER_TYPES.join(', ')}`);
    }
  },
  timestamps: true,
});

resource('/products', {
  table: 'products',
  fields: [
    'pro_name', 'sku', 'qty', 'min_ord_qty', 'inr_price', 'usd_price', 'gbp_price', 'aud_price', 'euro_price',
    'video_link', 'short_description', 'description', 'cat_id', 'subcat_id', 'color_id', 'size_id', 'fabric_id',
    'tags_id', 'gender', 'feature_pros', 'new_arrivals', 'best_sellers', 'star_rating', 'show_without_login',
    'status', ...SEO,
  ],
  required: ['pro_name'],
  listSql: `SELECT products.id, products.pro_name, products.sku, products.qty, products.inr_price, products.usd_price,
      products.gbp_price, products.aud_price, products.euro_price, products.status, categories.category_name,
      subcategories.subcategory_name
    FROM products JOIN categories ON products.cat_id = categories.id
    JOIN subcategories ON products.subcat_id = subcategories.id ORDER BY products.id ASC`,
  alias: { from: 'pro_name', to: 'pro_alias' },
  timestamps: true,
  remove: false,
});

resource('/users', {
  table: 'users',
  fields: ['fname', 'lname', 'email', 'contact_no', 'gender', 'dob', 'address', 'city', 'state', 'country', 'currency', 'pincode', 'status'],
  required: ['fname', 'email'],
  hidden: ['password'],
  beforeSave: async (data, body) => {
    if (body.password) data.password = await hashPassword(String(body.password));
  },
  timestamps: true,
  remove: false,
});

resource('/testimonials', { table: 'testimonials', fields: ['title', 'review', 'name', 'country'], required: ['review'] });

resource('/home-images', {
  table: 'homeimages',
  fields: ['first_line', 'second_line', 'pglink'],
  image: { folder: 'homeimages', name: (row) => `homeimage_${row.id}` },
  create: false,
  remove: false,
});

resource('/side-images', {
  table: 'subcat_images',
  fields: ['subcat_id', 'title', 'url', 'order_no', 'status'],
  required: ['subcat_id'],
  listSql: `SELECT subcat_images.*, subcategories.subcategory_name FROM subcat_images
    JOIN subcategories ON subcat_images.subcat_id = subcategories.id ORDER BY subcat_images.id ASC`,
  image: { folder: 'sideimages', name: (row) => `side-image-${row.id}` },
});

// Store.php wrote these straight into assets/welcome/images, so folder is the image root.
resource('/pages', {
  table: 'abouts',
  fields: ['title', 'content'],
  image: { folder: '', name: (row) => `about-${row.id}` },
  create: false,
  remove: false,
});

resource('/sliders', { table: 'sliders', fields: ['slide_name', 'status'], create: false, remove: false });

resource('/policies', { table: 'policy_pages', fields: ['title', 'content'], create: false, remove: false });

resource('/contacts', {
  table: 'contacts',
  fields: ['mobile_no', 'address', 'email', 'home_aboutus', 'facebook', 'instagram', 'youtube', 'pinterest'],
  create: false,
  remove: false,
});

resource('/headlines', { table: 'headlines', fields: ['content', 'status'], create: false, remove: false });

router.get('/newsletters', async (_req, res) => res.json(await query('SELECT * FROM newsletters ORDER BY id ASC')));
router.delete('/newsletters/:id', async (req, res) => {
  await query('DELETE FROM newsletters WHERE id = ?', [req.params.id]);
  res.json({ message: 'Email Delete Successfully' });
});

// ---- product images ----

router.get('/products/:id/images', async (req, res) => {
  res.json(await query('SELECT * FROM product_images WHERE pro_id = ? ORDER BY order_no ASC', [req.params.id]));
});

router.post('/products/:id/images', imageUpload.array('images', 10), async (req, res) => {
  const product = await one('SELECT id, pro_alias FROM products WHERE id = ?', [req.params.id]);
  if (!product) throw new HttpError(404, 'Product not found');
  if (!req.files?.length) throw new HttpError(400, 'Please choose at least one image');

  const last = await one('SELECT MAX(order_no) AS max FROM product_images WHERE pro_id = ?', [product.id]);
  let order = Number(last?.max ?? 0);
  for (const file of req.files) {
    order += 1;
    const name = await saveImage(file, 'products', `${product.pro_alias}_${order}`);
    await query('INSERT INTO product_images (pro_id, image, order_no) VALUES (?, ?, ?)', [product.id, name, order]);
  }
  res.status(201).json(await query('SELECT * FROM product_images WHERE pro_id = ? ORDER BY order_no ASC', [product.id]));
});

router.put('/products/:id/images/order', async (req, res) => {
  const items = Array.isArray(req.body.items) ? req.body.items : [];
  for (const item of items) {
    await query('UPDATE product_images SET order_no = ? WHERE id = ? AND pro_id = ?', [
      parseInt(item.order_no, 10) || 0,
      item.id,
      req.params.id,
    ]);
  }
  res.json(await query('SELECT * FROM product_images WHERE pro_id = ? ORDER BY order_no ASC', [req.params.id]));
});

router.delete('/product-images/:id', async (req, res) => {
  const image = await one('SELECT * FROM product_images WHERE id = ?', [req.params.id]);
  if (!image) throw new HttpError(404, 'Image not found');
  await query('DELETE FROM product_images WHERE id = ?', [image.id]);
  await removeImage('products', image.image);
  res.json({ message: 'Image Delete Successfully' });
});

// ---- orders & carts ----

// Admin::index counted categories, products and users; the staff tile was hard-coded.
router.get('/dashboard', async (_req, res) => {
  const [counts] = await query(`SELECT
    (SELECT COUNT(*) FROM categories) AS cats,
    (SELECT COUNT(*) FROM products) AS pros,
    (SELECT COUNT(*) FROM users) AS user`);
  res.json(counts);
});

router.get('/orders', async (req, res) => {
  const status = String(req.query.status ?? '');
  const rows = await query(
    `SELECT orders.*, users.fname, users.lname, users.email FROM orders
     LEFT JOIN users ON users.id = orders.usr_id
     WHERE (? = '' OR orders.order_status = ?) ORDER BY orders.id ASC`,
    [status, status],
  );
  res.json(rows);
});

router.get('/orders/:id', async (req, res) => {
  const order = await one('SELECT * FROM orders WHERE id = ?', [req.params.id]);
  if (!order) throw new HttpError(404, 'Order not found');
  const [user, items] = await Promise.all([
    one('SELECT id, fname, lname, email, gender, contact_no, address, city, state, country, pincode FROM users WHERE id = ?', [order.usr_id]),
    query(
      `SELECT order_products.*, products.pro_name, products.pro_alias, products.sku FROM order_products
       JOIN products ON products.id = order_products.pro_id WHERE order_products.ord_id = ?`,
      [order.id],
    ),
  ]);
  res.json({ order, user, items });
});

router.put('/orders/:id', async (req, res) => {
  const data = pick(req.body, ['order_status', 'payment_status', 'ship_amount']);
  if (!Object.keys(data).length) throw new HttpError(400, 'Nothing to update');
  await query('UPDATE orders SET ? WHERE id = ?', [data, req.params.id]);
  res.json(await one('SELECT * FROM orders WHERE id = ?', [req.params.id]));
});

// Admin::cart_details: one row per client, carts.* of the first row plus the summed quantity.
router.get('/carts', async (_req, res) => {
  res.json(
    await query(
      `SELECT MIN(carts.id) AS id, carts.usr_id, MIN(carts.created_at) AS created_at, SUM(carts.qty) AS total_qty,
         users.fname, users.lname, users.email, users.currency
       FROM carts JOIN users ON users.id = carts.usr_id GROUP BY carts.usr_id ORDER BY MIN(carts.id) ASC`,
    ),
  );
});

router.get('/carts/:userId', async (req, res) => {
  const user = await one('SELECT id, fname, lname, email, gender, city, state, country FROM users WHERE id = ?', [req.params.userId]);
  res.json({
    user,
    items: await query(
      `SELECT carts.*, products.pro_name, products.pro_alias, products.sku FROM carts
       JOIN products ON products.id = carts.pro_id WHERE carts.usr_id = ?`,
      [req.params.userId],
    ),
  });
});

// ---- admin profile ----

router.get('/profile', async (req, res) => {
  res.json(await one('SELECT id, name, email FROM adminusers WHERE id = ?', [req.user.id]));
});

router.put('/profile', async (req, res) => {
  const data = pick(req.body, ['name', 'email']);
  if (!Object.keys(data).length) throw new HttpError(400, 'Nothing to update');
  await query('UPDATE adminusers SET ? WHERE id = ?', [data, req.user.id]);
  res.json({
    message: 'Admin Profile Updated Successfully',
    admin: await one('SELECT id, name, email FROM adminusers WHERE id = ?', [req.user.id]),
  });
});

// Store::update_adminpassword: field names, check order and messages as in PHP (whose own
// comparison was broken, so it never reached the success branch).
router.put('/password', async (req, res) => {
  const current = String(req.body.currpassword ?? '').trim();
  const next = String(req.body.newpassword ?? '').trim();
  const confirm = String(req.body.confirmpassword ?? '').trim();

  const admin = await one('SELECT password FROM adminusers WHERE id = ?', [req.user.id]);
  if (!(await verifyPassword(current, admin.password)).ok) {
    throw new HttpError(400, 'Entered old password do not match with currnet password');
  }
  if (next === current) throw new HttpError(400, 'Entered new password do not match with old password');
  if (next !== confirm) throw new HttpError(400, 'Entered New Password and Confirm Password Not Match');

  await query('UPDATE adminusers SET password = ? WHERE id = ?', [await hashPassword(next), req.user.id]);
  res.json({ message: 'Change Password Successfully' });
});

export default router;
