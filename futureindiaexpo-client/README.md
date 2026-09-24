# Future India Expo — React frontend

A component-by-component port of the PHP views to React. The markup, class names and asset paths are the PHP templates', so the original "Molla" storefront theme and "DASHMIN" admin theme style it unchanged. See `../MIGRATION-MAP.md` for the view → component mapping.

## Run

```bash
cp .env.example .env
npm install
npm run dev          # http://localhost:5173 — needs the API on :5000
```

The dev server proxies `/api` and `/assets` to the API. **The site is unstyled until the PHP `public/assets/` folder is copied into `../futureindiaexpo-server/assets/`** — every stylesheet, script and image is loaded from there, at the same URL the PHP site used.

## Two entry points

| Document | URLs | Theme |
| --- | --- | --- |
| `index.html` → `src/main.jsx` | everything public, `/myaccount/*` | Molla (Bootstrap 4 + jQuery) |
| `admin.html` → `src/admin-main.jsx` | `/admin/*`, `/login/future-admin-access` | DASHMIN (Bootstrap 5) |

They were separate PHP layouts loading incompatible Bootstrap versions, so they stay separate documents; moving between them is a full page load, as before.

## Theme JavaScript

`src/theme/theme.js` loads the original theme scripts from `/assets` in the PHP order, after React's first render, and re-runs the per-page plugin set-up that `main.js` only does on a full page load (Owl carousels, elevateZoom, input spinners). The admin side does the same for DataTables and CKEditor in `src/admin/shared.jsx`.

## Build

```bash
npm run build        # dist/, bundle under dist/static (the /assets path belongs to the theme)
```

Serve `dist/` from the API with `CLIENT_DIST` (see the server README).
