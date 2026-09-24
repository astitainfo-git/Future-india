# Future India Expo — API

Express 5 + MySQL API that replaces the CodeIgniter 4 controllers. It reads the **same database schema**, so the PHP site and this API can run against one database during the switchover. See `../MIGRATION-MAP.md` for the controller-by-controller mapping.

## Setup

```bash
cp .env.example .env        # DB credentials and a long random JWT_SECRET
mysql -u USER -p DB_NAME < migrations/001_node_migration.sql
npm install
npm run dev                 # http://localhost:5000
```

### Assets (required for the UI to look like the PHP site)

Copy the PHP site's **entire `public/assets/` folder** (from the production server — it is not in the local PHP project) into `assets/` here:

```
futureindiaexpo-server/assets/welcome/css/…      theme stylesheets
futureindiaexpo-server/assets/welcome/js/…       jQuery, plugins, main.js
futureindiaexpo-server/assets/welcome/images/…   logo, banners, products, categories, …
futureindiaexpo-server/assets/admin/…            admin theme
```

It is served at `/assets`, the same URL the PHP site used, and admin uploads are written back into the same sub-folders `Store.php` used (`welcome/images/products`, `…/category`, `…/subcategory`, `…/homeimages`, `…/sideimages`, and `welcome/images` itself for the About/Customization/FAQ image). Set `ASSETS_DIR` to point somewhere else.

### Database migration

`migrations/001_node_migration.sql` is additive only:

- widens `users.password` and `adminusers.password` to `VARCHAR(255)` so bcrypt hashes fit;
- adds `orders.special_note` (the checkout "Order notes" field, which PHP posted but never saved).

No existing rows are changed or removed.

## Production

Build the client (`npm run build` in `../futureindiaexpo-client`) and set `CLIENT_DIST=../futureindiaexpo-client/dist`. This server then serves the storefront, the admin panel, `/assets` and `/api` from one origin, as PHP did.

## Auth

- `POST /api/auth/login` and `POST /api/auth/admin/login` return a JWT, sent as `Authorization: Bearer <token>`. It carries what the PHP session held: user id, role and chosen currency.
- Legacy base64 passwords still work and are re-hashed with bcrypt on the next successful login.
- reCAPTCHA v3 is enforced when `RECAPTCHA_SECRET` is set (same ≥ 0.5 score rule as `Login.php`).
- Validation messages are the PHP flash messages, word for word.

## Endpoints

| Area | Routes |
| --- | --- |
| Public | `GET /api/site`, `/api/home`, `/api/pages/:about\|customization\|faq`, `/api/policies/:slug`, `/api/categories/:alias/subcategories`, `/api/subcategories/:alias/products`, `/api/products/:alias`, `/api/search?srch=`, `POST /api/newsletter`, `POST /api/contact` |
| Auth | `POST /api/auth/register`, `/api/auth/login`, `/api/auth/admin/login`, `GET /api/auth/me` |
| Customer (client JWT) | `GET/PUT /api/account/profile`, `PUT /api/account/password`, `GET/POST/PUT /api/account/cart`, `DELETE /api/account/cart/:id`, `GET/POST /api/account/wishlist`, `DELETE /api/account/wishlist/:id`, `GET/POST /api/account/orders`, `GET /api/account/orders/:id` |
| Admin (admin JWT) | CRUD under `/api/admin/`: `categories`, `subcategories`, `filters?type=`, `products`, `users`, `testimonials`, `home-images`, `side-images`, `sliders`, `pages`, `policies`, `contacts`, `headlines`, `newsletters`. Also `products/:id/images` (GET, POST multipart `images`, PUT `/order`), `DELETE product-images/:id`, `GET dashboard`, `GET/PUT orders`, `GET carts`, `GET carts/:userId`, `GET/PUT profile`, `PUT password` |

Admin routes that take an image accept `multipart/form-data` with an `image` field; the others accept JSON.

## Not ported yet

- Google / Facebook OAuth login (`Home::google*`; Facebook was already a stub in PHP)
- Contact form delivery — `Home::contact_info_send` did nothing; `/api/contact` validates and acknowledges but does not send
