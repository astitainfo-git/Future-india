import fs from 'node:fs';
import path from 'node:path';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { objectUrl } from './config/storage.js';
import { ASSETS_ROOT } from './middleware/upload.js';
import { errorHandler, notFound } from './middleware/error.js';
import authRoutes from './routes/auth.js';
import catalogRoutes from './routes/catalog.js';
import accountRoutes from './routes/account.js';
import adminRoutes from './routes/admin.js';

const app = express();

// No CSP: the pages load the same third-party scripts the PHP site did (jQuery/Bootstrap/DataTables
// CDNs, reCAPTCHA, ShareThis, Google Maps, YouTube embeds in product videos) and it had none.
app.use(helmet({ contentSecurityPolicy: false, crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({ origin: process.env.CLIENT_ORIGIN?.split(',') ?? true }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use((req, _res, next) => {
  req.body ??= {};
  next();
});

// Same public path the PHP site used, so every image, stylesheet and script reference
// in the ported templates resolves unchanged. Files present on disk are served directly;
// anything else (admin uploads, and the theme files once synced) comes from the bucket.
app.use('/assets', express.static(ASSETS_ROOT, { maxAge: '7d', fallthrough: true }));
app.get('/assets/*splat', (req, res, next) => {
  const url = objectUrl(req.path.replace(/^\/assets\//, ''));
  if (!url) return next();
  res.redirect(302, url);
});

app.get('/api/health', (_req, res) => res.json({ ok: true }));
app.use('/api/auth', authRoutes);
app.use('/api/account', accountRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api', catalogRoutes);

// Production: serve the built React app from this same origin, as PHP served its pages. The
// storefront and the admin panel are separate documents (see the client's vite.config.js).
const CLIENT_DIST = process.env.CLIENT_DIST && path.resolve(process.env.CLIENT_DIST);
if (CLIENT_DIST && fs.existsSync(path.join(CLIENT_DIST, 'index.html'))) {
  app.use(express.static(CLIENT_DIST, { index: false, maxAge: '7d' }));
  app.get(/^\/(?!api\/|assets\/|static\/).*/, (req, res) => {
    const admin = req.path === '/login/future-admin-access' || req.path === '/admin' || req.path.startsWith('/admin/');
    res.sendFile(path.join(CLIENT_DIST, admin ? 'admin.html' : 'index.html'));
  });
}

app.use(notFound);
app.use(errorHandler);

export default app;
