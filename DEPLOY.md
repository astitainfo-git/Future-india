# Deploying to Hostinger (Node.js web app + GitHub)

Written for: whoever administers the Hostinger account and the GitHub repository.

The whole site — home page, shop, admin panel and API — runs as **one** Node.js app. Express
serves the built React pages, the `/api` routes and `/assets`, exactly as the PHP site served
everything from one domain.

---

## 1. Put the project on GitHub

The repository is already prepared locally (`git` is initialised and everything is committed).
Nothing has been pushed yet.

```bash
cd D:\Harsh\personal\FutureIndiawebapp

gh auth login                 # sign in to your own GitHub account, once
gh repo create futureindiaexpo --private --source=. --push
```

If you would rather create the repository on github.com by hand, do that and then:

```bash
git remote add origin https://github.com/<your-user>/futureindiaexpo.git
git push -u origin main
```

**Never commit `.env`.** `.gitignore` already blocks it. Production values live in hPanel.

---

## 2. Image storage (do this before going live)

Hostinger rebuilds the app's filesystem on every deploy, so product photos uploaded through the
admin panel would be **deleted on the next deploy**. Images therefore live in an S3-compatible
bucket. Cloudflare R2 is the cheapest fit (no charge for downloads).

1. Create a bucket (Cloudflare R2 → Create bucket, or Amazon S3).
2. Turn on public read access, or connect a custom domain such as `images.yourdomain.com`.
3. Create an API token / access key with read + write on that bucket.
4. Copy the PHP site's `public/assets/` folder into `futureindiaexpo-server/assets/`.
5. Upload it once:

```bash
cd futureindiaexpo-server
# put the S3_* values in .env first
npm run sync-assets -- --dry     # check what it would upload
npm run sync-assets              # upload
```

From then on the admin panel writes new uploads straight to the bucket, and they survive deploys.
`/assets/...` URLs stay exactly as they were: files still on disk are served directly, anything
else redirects to the bucket.

With no `S3_*` variables set, everything falls back to the local `assets` folder, so local
development is unchanged.

---

## 3. Create the app in hPanel

**Websites → Node.js app → Deploy Your Web App → Connect with GitHub**, then pick the
repository and the `main` branch.

Settings:

| Field | Value |
| --- | --- |
| Framework | Other |
| Node version | 22.x (20 or newer is required) |
| Build command | `npm run build` |
| Start command | `npm start` |
| Entry file | `futureindiaexpo-server/src/server.js` |
| Output directory | leave empty — the app is served by Node, not as static files |

The build installs the React app, builds it, then installs the server's production dependencies.

---

## 4. Environment variables (hPanel → Environment Variables)

Set once; they survive deploys and are applied to both build and runtime.

| Name | Value |
| --- | --- |
| `NODE_ENV` | `production` |
| `JWT_SECRET` | a long random string — **change it from the development value** |
| `CLIENT_DIST` | `futureindiaexpo-client/dist` |
| `ASSETS_DIR` | `futureindiaexpo-server/assets` |
| `DB_HOST` | from hPanel → Databases → MySQL (usually `localhost`) |
| `DB_PORT` | `3306` |
| `DB_NAME` / `DB_USER` / `DB_PASSWORD` | the MySQL database you create in hPanel |
| `S3_BUCKET`, `S3_REGION`, `S3_ENDPOINT`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY` | the bucket from step 2 |
| `ASSET_PUBLIC_URL` | public address of that bucket |
| `RECAPTCHA_SECRET` | from the PHP `.env` (`recaptcha.secretkey`), or leave empty to skip the check |

`PORT` is provided by Hostinger — do not set it.

The reCAPTCHA **site** key is a build-time value for the browser. To enable the widget, put
`VITE_RECAPTCHA_SITE_KEY=<site key>` in `futureindiaexpo-client/.env.production` and commit it
(a site key is public, unlike the secret key).

---

## 5. Database

1. hPanel → Databases → MySQL → create a database and user.
2. Import your existing data (export from the current live database first).
3. Run the one migration, which only adds to the schema:

```sql
-- futureindiaexpo-server/migrations/001_node_migration.sql
```

It widens the two password columns so bcrypt hashes fit, and adds `orders.special_note`.
Existing rows are not modified.

---

## 6. Domain

Point the domain (or a subdomain such as `new.yourdomain.com` for a trial run) at the Node app in
hPanel. Keeping the PHP site on the main domain until the new one is checked end to end is the
safer order.

---

## 7. Updating the site afterwards

```bash
git add -A
git commit -m "describe the change"
git push
```

Hostinger rebuilds and redeploys automatically on every push to `main`.

Do **not** edit files on the server through File Manager, FTP or SSH: the next deploy overwrites
them. Change the code, commit, push.

---

## Before the first real launch

- [ ] Copy `public/assets/` from the live PHP server and run `npm run sync-assets` — until then the
      shop and admin pages have no styling and no product images.
- [ ] Compress `futureindiaexpo-client/public/images/home/` (currently ~16 MB, several 2 MB PNGs).
- [ ] Rotate the credentials in the old PHP `.env` (database password, Google OAuth secret,
      reCAPTCHA secret) if that file has ever been shared.
- [ ] Test on a subdomain first: log in, add to cart, place an order, and upload an image in the
      admin panel, then redeploy and confirm the image is still there.
