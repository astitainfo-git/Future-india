# PHP → Node.js / React migration map

Source: `D:\Harsh\personal\futureindiaexpo` (CodeIgniter 4)
Target: `futureindiaexpo-server` (Express 5 + mysql2) and `futureindiaexpo-client` (React 19 + Vite)

The database is unchanged. Both applications read and write the same MySQL tables, so
the PHP site and the Node site can run side by side during the switchover.

---

## 1. What the PHP application is

| Layer | Technology |
| --- | --- |
| Framework | CodeIgniter 4 (MVC, PHP sessions) |
| Storefront theme | "Molla" — Bootstrap 4 + jQuery, skin `demo-7` |
| Admin theme | "DASHMIN" — Bootstrap 5, jQuery, DataTables, CKEditor |
| Database | MySQL (21 tables) |
| 3D / WebGL | **None.** No Three.js, no `<canvas>`, no `.glb`/`.gltf`, no WebGL anywhere. |

The absence of 3D content is why the ported frontend contains no Three.js: reproducing the
existing UI and adding a 3D layer are mutually exclusive, and the instruction to preserve the
existing screen takes priority. See "Three.js" at the end of this document.

---

## 2. Assets

The local copy of the PHP project has **no `public/` folder**. All theme CSS, JavaScript,
fonts, icons, and images live on the production server under `public/assets/`. Nothing was
recreated or replaced: the React app references the same files at the same paths and needs
that folder copied across once.

```
public/assets/welcome/css/bootstrap.min.css        → /assets/welcome/css/bootstrap.min.css
public/assets/welcome/css/style.css                → /assets/welcome/css/style.css
public/assets/welcome/css/skins/skin-demo-7.css    → …unchanged…
public/assets/welcome/css/demos/demo-7.css
public/assets/welcome/js/*.js  (jQuery, owl, superfish, elevateZoom, main.js, demo-7.js)
public/assets/welcome/images/**                    (logo, banners, products, subcategory, …)
public/assets/admin/**                             (admin theme CSS/JS/img)
```

Copy that whole folder to `futureindiaexpo-server/assets/`. The Express app serves it at
`/assets`, and admin uploads are written back into the same tree, exactly like PHP did:

| Upload | Folder (unchanged from `Store.php`) |
| --- | --- |
| About / Customization / FAQ | `assets/welcome/images` |
| Home banners | `assets/welcome/images/homeimages` |
| Category | `assets/welcome/images/category` |
| Sub-category | `assets/welcome/images/subcategory` |
| Product | `assets/welcome/images/products` |
| Side images | `assets/welcome/images/sideimages` |

---

## 3. Backend: PHP controller → Express route

`app/Controllers/BaseController.php` loaded category, sub-category, contact, headline, cart and
wishlist data into every view. That became one endpoint, `GET /api/site`, which the React layout
fetches once.

### Public (`src/routes/catalog.js`)

| PHP | Express |
| --- | --- |
| `Home::index` | `GET /api/home` |
| `Home::about_us`, `::customization`, `::faq` | `GET /api/pages/:slug` |
| `Home::policy_pages` | `GET /api/policies/:slug` |
| `Home::show_subcategories` | `GET /api/categories/:alias/subcategories` |
| `Home::show_all_products` | `GET /api/subcategories/:alias/products` |
| `Home::product_details` | `GET /api/products/:alias` |
| `Home::search` | `GET /api/search?q=` |
| `Home::newsletter_store` | `POST /api/newsletter` |
| `Home::contact_info_send` | `POST /api/contact` |
| *(BaseController globals)* | `GET /api/site` |

### Authentication (`src/routes/auth.js`)

| PHP | Express |
| --- | --- |
| `Login::store_user_details` | `POST /api/auth/register` |
| `Login::check_users_login_details` | `POST /api/auth/login` |
| `Login::check_admin_access` | `POST /api/auth/admin/login` |
| *(PHP session)* | `GET /api/auth/me` |

PHP kept login state in a server session (`isLoggedIn`, `role`, `CltId`, `mycurr`). The API is
stateless and issues a JWT carrying the same three facts: user id, role, and selected currency.

### Customer account (`src/routes/account.js`)

| PHP | Express |
| --- | --- |
| `Home::myaccount` | `GET /api/account/profile`, `GET /api/account/orders` |
| `Home::update_user_details` | `PUT /api/account/profile` |
| `Login::update_muser_password` | `PUT /api/account/password` |
| `Home::addtocart` | `POST /api/account/cart` |
| `Home::updatecart` | `PUT /api/account/cart` |
| `Home::delete_cart_item` | `DELETE /api/account/cart/:id` |
| `Home::cart_page`, `::checkout_page` | `GET /api/account/cart` |
| `Home::addtowishlist` | `POST /api/account/wishlist` |
| `Home::wishlist` | `GET /api/account/wishlist` |
| `Home::delete_wishlist_item` | `DELETE /api/account/wishlist/:id` |
| `Home::order_placed` | `POST /api/account/orders` |
| `Home::print_proforma_invoice` | `GET /api/account/orders/:id` |

### Admin (`src/routes/admin.js`)

`Admin.php` (read) and `Store.php` (write) held roughly a dozen near-identical CRUD handlers.
They are replaced by one `resource()` factory, called once per table:

| PHP screens | Express |
| --- | --- |
| categories, sub-categories | `/api/admin/categories`, `/api/admin/subcategories` |
| colors, sizes, fabrics, tags | `/api/admin/filters?type=` |
| products | `/api/admin/products` |
| product images | `/api/admin/products/:id/images`, `/api/admin/product-images/:id` |
| users | `/api/admin/users` |
| sliders, home images, side images | `/api/admin/sliders`, `/api/admin/home-images`, `/api/admin/side-images` |
| about / customization / FAQ | `/api/admin/pages` |
| privacy, terms, return policy | `/api/admin/policies` |
| testimonials, contact, headline | `/api/admin/testimonials`, `/api/admin/contacts`, `/api/admin/headlines` |
| newsletter emails | `/api/admin/newsletters` |
| cart details | `/api/admin/carts`, `/api/admin/carts/:userId` |
| pending / complete / cancelled orders | `/api/admin/orders?status=` |
| proforma invoice | `/api/admin/orders/:id` |
| dashboard counters | `/api/admin/dashboard` |
| profile / password | `/api/admin/profile`, `/api/admin/password` |

### Business logic preserved exactly

- **Currency.** The five-way `switch` on `session('mycurr')` that picks `inr_price` … `euro_price`
  and the matching symbol is reproduced verbatim, including the fallback to INR.
- **Symbols in the database.** `carts.curr_symbol` and `orders.curn_symbol` keep the HTML entity
  strings PHP wrote (`&#8377;`, `&#163;`, `&euro;`, …) so rows stay readable by both apps.
- **Price visibility.** Prices are hidden from guests; `show_without_login = 'Yes'` still controls
  which products a guest may open at all.
- **Cart totals.** `qty × price`, free shipping, no tax — unchanged.
- **Order placement.** Inserts `orders` + `order_products` and clears the cart, as before (now
  inside one transaction).

### Deliberate fixes to defects carried by the PHP code

These change behaviour only in cases that were bugs:

1. Cart update and wishlist delete did not check row ownership — any logged-in user could edit
   another user's rows by id. Both are now scoped by `usr_id`.
2. Admin forms passed `$this->request->getVar()` straight into the model, so any posted key was
   writable. Each endpoint now has an explicit field allowlist.
3. Uploads used the client-supplied filename and no type check. Filenames are now generated
   server-side and only JPG/PNG/WEBP/GIF are accepted.
4. Passwords were `base64_encode()`, which is encoding, not hashing. They are now bcrypt. Existing
   base64 rows still log in and are silently re-hashed on the next successful login.
5. Order placement was two unguarded inserts plus a delete; a failure mid-way left a broken order.
6. `Store::update_adminpassword` compared the wrong variables and could never succeed.
7. The checkout "Order notes" field was posted but never stored (`orders.special_note` added).

---

## 4. Frontend: PHP view → React component

Every component reproduces the template's DOM and class names as-is, so the theme's CSS applies
unchanged.

| PHP view | React | Route |
| --- | --- | --- |
| `welcome/layout.php` | `components/Layout.jsx` | — |
| `welcome/home.php` → **replaced** by the owner's new design (`future-india-export-final.html`) | `pages/home/Home.jsx` + `home.css`, photos in `public/images/home/` | `/` |
| `welcome/show-subcategories.php` | `pages/ShowSubcategories.jsx` | `/category/:alias` |
| `welcome/show-all-products.php` | `pages/ShowAllProducts.jsx` | `/products/:alias` |
| `welcome/product-details.php` | `pages/ProductDetails.jsx` | `/product/:alias` |
| `welcome/search.php` | `pages/Search.jsx` | `/search` |
| `welcome/cart-page.php` | `pages/CartPage.jsx` | `/myaccount/cart` |
| `welcome/checkout.php` | `pages/Checkout.jsx` | `/myaccount/checkout` |
| `welcome/thankspage.php` | `pages/ThanksPage.jsx` | `/myaccount/thanks-page` |
| `welcome/wishlist.php` | `pages/Wishlist.jsx` | `/myaccount/wishlist` |
| `welcome/myaccount.php` | `pages/MyAccount.jsx` | `/myaccount/dashboard` |
| `welcome/proforma-invoice.php` | `pages/ProformaInvoice.jsx` | `/myaccount/print-pi-details/:id` |
| `welcome/login.php` | `pages/Login.jsx` | `/login` |
| `welcome/registration.php` | `pages/Registration.jsx` | `/registration` |
| `welcome/getcurrency_page.php` | `pages/GetCurrency.jsx` | `/complete-info/select-currency` |
| `welcome/contact.php` | `pages/Contact.jsx` | `/contact-us` |
| `welcome/aboutus.php` | `pages/AboutUs.jsx` | `/about-us` |
| `welcome/customization.php` | `pages/Customization.jsx` | `/customization` |
| `welcome/faq.php` | `pages/Faq.jsx` | `/faq` |
| `welcome/policy-page.php` | `pages/PolicyPage.jsx` | `/privacy-policy`, `/terms-conditions`, `/return-policy` |
| `welcome/adminlogin.php` | `admin/AdminLogin.jsx` | `/login/future-admin-access` |
| `admin/adlayout.php` | `admin/AdLayout.jsx` | — |
| `admin/*.php` | `admin/*.jsx` | `/admin/*` |

Every public URL is byte-for-byte the one PHP served, so existing links and search rankings hold.

### Theme JavaScript

`main.js`, `demo-7.js` and the jQuery plugins are loaded from the copied asset folder, in the
original order, after React's first paint (the theme binds to `.header`, `.mobile-menu-container`
and `#scroll-top`, which React must render first). Because the header, footer, mobile menu and
sign-in modal mount once and stay mounted, those bindings survive navigation.

Bootstrap 4's own widgets — tabs, modal, collapse, dropdown — work off delegated document
handlers, so the markup drives them without any per-page wiring.

The plugins `main.js` only sets up on a full page load are re-initialised after each page renders
(`src/theme/theme.js`, `src/admin/shared.jsx`), with the options `main.js` / `adlayout.php` used:

- `owl.carousel` on `[data-toggle="owl"]`, reading the same `data-owl-options` JSON.
- `elevateZoom` and the Magnific Popup gallery button on the product page.
- `bootstrap-input-spinner` on quantity inputs (product page, cart).
- DataTables on `#datatable` and CKEditor on `textarea.ckeditor` in the admin panel.

Two pieces of page JavaScript are reimplemented in React rather than driven by the original
plugin, because a jQuery plugin that mutates the DOM fights React's rendering:

- `jquery.demano.js` — the sidebar filter on the product listing. The React version toggles the
  same `.off` class on the same `.filterable` elements from the same `data-*` attributes.
- `myjs.js` — the add-to-cart call on the product page. It renders the same `.msgAlrt` / `#AltMsg`
  alert markup.

---

## 5. Three.js

The PHP application has no 3D, WebGL or animated canvas content. Adding a Three.js scene would
change how the site looks, which the migration brief rules out. The dependency is therefore not
installed, and `react-three-fiber` / `drei` were removed from the earlier scaffold along with the
invented hero and product viewer.

If 3D product previews are wanted later they are a feature request, not part of this migration,
and would need `.glb` models per product plus a decision about where the viewer sits in the
product page.

---

## 6. Deliberate differences and gaps

### Behaviour that differs from PHP on purpose

| Where | PHP | Now | Why |
| --- | --- | --- | --- |
| Admin → Edit user | Password field pre-filled with the stored value (base64, so readable in page source) | Blank; leave it empty to keep the current password | Stored passwords are never sent to the browser |
| Account Details / checkout | Gender select never pre-selected, so saving reset every user to Male | Pre-selects the saved gender | Data-corrupting bug |
| Contact form | Inputs had no `name`, and the handler did nothing | Values go to `POST /api/contact`, which validates them and shows a thank-you alert; nothing is emailed | A form that silently dropped input |
| Product listing filter counts | Printed as `0`, then updated by `jquery.demano.js` | Counted in React | Plugin reimplemented (section 4) |
| Unknown storefront URLs | CodeIgniter's bare 404 page | The theme's own 404 page (`welcome/404.html`) inside the layout | Stays inside the site |

Every other intentional change is a security or data-integrity fix from section 3.

### Not ported

| Feature | Status |
| --- | --- |
| Google / Facebook OAuth login | The buttons keep their markup and link to `/auth/google`; there is no OAuth flow on the Node side yet. `Home::facebook` was already a stub. The follow-on "Select Currency" page is ported but only reachable once OAuth exists. |
| reCAPTCHA | Implemented on both sides. Set `RECAPTCHA_SECRET` (server) and `VITE_RECAPTCHA_SITE_KEY` (client) from the PHP `.env`. |
| Contact email | See above. |

### Kept exactly as PHP had them, quirks included

- The dashboard "Total staffs" tile shows the hard-coded `1234`; the Staffs screen shows the template's placeholder rows.
- The sidebar link `/admin/out-of-stock-products` and the slider edit link `/admin/edit-silder/:id` have no route in PHP either; both land on the admin 404.
- The order list's "Detail" button (`href=""`) and the cart page's coupon box do nothing.
- The two product reviews are hard-coded text.
- Checkout's "Total" column shows the unit price.
- The My Account and Cart headers use a relative background URL that does not resolve, so they show no header image, same as PHP.
- Product listing and search hide products with no `order_no = 1` image (the PHP query's `where('pi.order_no', 1)`).

---

## 7. Verification status

Checked:

- Client production build and lint (only fast-refresh advisories remain).
- API against a local MySQL copy, read-only: site data, home sections, pages and policies, product detail, listing, search, auth guards (401 on account and admin routes without a token), the PHP validation messages for login and registration, 404s.
- Single-origin serving: storefront URLs return `index.html`; `/admin/*` and `/login/future-admin-access` return `admin.html`; `/assets/*` comes from the asset folder.

Not yet checked, because the theme assets are not in the local project:

- Visual comparison with the PHP site, and every jQuery-driven interaction (carousels, zoom, spinners, DataTables, CKEditor, mobile menu, sticky header). Copy `public/assets/` into `futureindiaexpo-server/assets/`, then compare page by page.
- Write paths (cart, checkout, admin saves and uploads) against a real database. They were not exercised, to avoid changing data.

The local dev database has no `sliders` table (it was built from `000_base_schema.sql`), so `/admin/show-sliders` errors there; production has the table.
