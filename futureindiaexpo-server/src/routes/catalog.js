import { Router } from 'express';
import { one, query } from '../config/db.js';
import { optionalAuth } from '../middleware/auth.js';
import { HttpError, currencyFor } from '../utils/helpers.js';

const router = Router();
router.use(optionalAuth);

const isClient = (req) => req.user?.role === 'client';

const CARD_FIELDS = `products.id, products.pro_name, products.pro_alias, products.sku, products.inr_price, products.usd_price,
  products.gbp_price, products.aud_price, products.euro_price, products.gender, products.star_rating,
  img1.image AS image1, img2.image AS image2`;

const CARD_JOINS = `LEFT JOIN product_images img1 ON img1.pro_id = products.id AND img1.order_no = 1
  LEFT JOIN product_images img2 ON img2.pro_id = products.id AND img2.order_no = 2`;

const flaggedProducts = (flag) =>
  query(
    `SELECT ${CARD_FIELDS} FROM products ${CARD_JOINS}
     WHERE products.${flag} = 'Yes' AND products.status = 'Active' GROUP BY products.id`,
  );

router.get('/site', async (_req, res) => {
  const [categories, subcategories, contact, headline] = await Promise.all([
    query("SELECT * FROM categories WHERE status = 'Active'"),
    query("SELECT * FROM subcategories WHERE status = 'Active'"),
    one('SELECT * FROM contacts LIMIT 1'),
    one("SELECT * FROM headlines WHERE status = 'Active' LIMIT 1"),
  ]);
  res.json({ categories, subcategories, contact, headline });
});

router.get('/home', async (_req, res) => {
  const [homeImages, featured, newArrivals, bestSellers, testimonials] = await Promise.all([
    query('SELECT * FROM homeimages'),
    flaggedProducts('feature_pros'),
    flaggedProducts('new_arrivals'),
    flaggedProducts('best_sellers'),
    query('SELECT * FROM testimonials'),
  ]);
  res.json({ homeImages, featured, newArrivals, bestSellers, testimonials });
});

const PAGE_IDS = { about: 1, customization: 2, faq: 3 };
router.get('/pages/:slug', async (req, res) => {
  const id = PAGE_IDS[req.params.slug];
  const page = id && (await one('SELECT * FROM abouts WHERE id = ?', [id]));
  if (!page) throw new HttpError(404, 'Page not found');
  res.json(page);
});

const POLICY_IDS = { 'privacy-policy': 1, 'terms-conditions': 2, 'return-policy': 3 };
router.get('/policies/:slug', async (req, res) => {
  const id = POLICY_IDS[req.params.slug];
  const policy = id && (await one('SELECT * FROM policy_pages WHERE id = ?', [id]));
  if (!policy) throw new HttpError(404, 'Policy not found');
  res.json(policy);
});

router.get('/categories/:alias/subcategories', async (req, res) => {
  const category = await one('SELECT * FROM categories WHERE category_alias = ?', [req.params.alias]);
  if (!category) throw new HttpError(404, 'Category not found');
  const subcategories = await query("SELECT * FROM subcategories WHERE cat_id = ? AND status = 'Active'", [category.id]);
  res.json({ category, subcategories });
});

router.get('/subcategories/:alias/products', async (req, res) => {
  const subcategory = await one("SELECT * FROM subcategories WHERE subcategory_alias = ? AND status = 'Active'", [
    req.params.alias,
  ]);
  if (!subcategory) throw new HttpError(404, 'Collection not found');

  const loginFilter = isClient(req) ? '' : "AND products.show_without_login = 'Yes'";
  const [sideImages, products] = await Promise.all([
    query("SELECT * FROM subcat_images WHERE subcat_id = ? AND status = 'Active' ORDER BY order_no ASC", [subcategory.id]),
    query(
      `SELECT products.*, MIN(pi.image) AS image FROM products
       LEFT JOIN product_images pi ON pi.pro_id = products.id
       WHERE products.subcat_id = ? AND products.status = 'Active' AND pi.order_no = 1 ${loginFilter}
       GROUP BY products.id`,
      [subcategory.id],
    ),
  ]);

  const filterIds = [...new Set(products.flatMap((p) => [p.fabric_id, p.size_id, p.tags_id]).filter(Boolean))];
  const filters = filterIds.length ? await query('SELECT * FROM filters WHERE id IN (?)', [filterIds]) : [];
  const byType = (type) => filters.filter((f) => f.filter_type === type);

  res.json({
    subcategory,
    sideImages,
    products,
    filters: { fabric: byType('fabric'), size: byType('size'), tags: byType('tags') },
  });
});

router.get('/products/:alias', async (req, res) => {
  const product = await one("SELECT * FROM products WHERE pro_alias = ? AND status = 'Active'", [req.params.alias]);
  if (!product) throw new HttpError(404, 'Product not found');
  // product_details() does not check show_without_login: a guest with a direct link sees the
  // product (without prices). Only the listings hide those products.

  const currency = currencyFor(req.user?.currency);
  const [images, attributes, category, related, prev, next] = await Promise.all([
    query('SELECT * FROM product_images WHERE pro_id = ? ORDER BY order_no ASC', [product.id]),
    query('SELECT * FROM filters WHERE id IN (?)', [[product.size_id, product.fabric_id, product.tags_id || 0]]),
    one('SELECT * FROM categories WHERE id = ?', [product.cat_id]),
    query(
      `SELECT products.pro_name, products.pro_alias, products.sku, products.star_rating,
         products.${currency.column} AS price, MIN(pi.image) AS image
       FROM products LEFT JOIN product_images pi ON pi.pro_id = products.id
       WHERE products.subcat_id = ? AND products.status = 'Active' AND products.show_without_login = 'Yes' AND products.id <> ?
       GROUP BY products.id LIMIT 6`,
      [product.subcat_id, product.id],
    ),
    // PHP looked up exactly id - 1 and id + 1; a gap or inactive neighbour disables the link.
    one("SELECT pro_alias FROM products WHERE id = ? AND status = 'Active'", [product.id - 1]),
    one("SELECT pro_alias FROM products WHERE id = ? AND status = 'Active'", [product.id + 1]),
  ]);

  const attr = (type) => attributes.find((a) => a.filter_type === type) ?? null;
  res.json({
    product,
    images,
    size: attr('size'),
    fabric: attr('fabric'),
    tags: attr('tags'),
    category,
    related: related.map((r) => ({ ...r, symbol: currency.symbol })),
    prev: prev?.pro_alias ?? null,
    next: next?.pro_alias ?? null,
  });
});

router.get('/search', async (req, res) => {
  // search.php read ?srch=; ?q= is accepted too.
  const term = String(req.query.srch ?? req.query.q ?? '').trim();
  if (!term) return res.json([]);
  const like = `%${term}%`;
  const loginFilter = isClient(req) ? '' : "AND products.show_without_login = 'Yes'";
  const products = await query(
    `SELECT products.*, MIN(pi.image) AS image FROM products
     LEFT JOIN product_images pi ON pi.pro_id = products.id
     WHERE (products.pro_name LIKE ? OR products.sku LIKE ?) AND products.status = 'Active' AND pi.order_no = 1 ${loginFilter}
     GROUP BY products.id`,
    [like, like],
  );
  res.json(products);
});

router.post('/newsletter', async (req, res) => {
  const email = String(req.body.email ?? '').trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new HttpError(400, 'Please enter a valid email');
  await query('INSERT INTO newsletters (email) VALUES (?)', [email]);
  res.status(201).json({ message: 'Your email was added successfully' });
});

// Home::contact_info_send read the post and returned a redirect without sending or storing
// anything. This validates the same fields and acknowledges the submission; add an SMTP
// or ticketing call here when the address to deliver to is decided.
router.post('/contact', async (req, res) => {
  const name = String(req.body.name ?? '').trim();
  const email = String(req.body.email ?? '').trim();
  const message = String(req.body.message ?? '').trim();
  if (!name || !message) throw new HttpError(400, 'Please enter your name and message');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new HttpError(400, 'Please enter a valid email');
  res.json({ message: 'Thanks for getting in touch. Our sales team will reply shortly.' });
});

export default router;
