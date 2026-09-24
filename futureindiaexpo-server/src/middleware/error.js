import multer from 'multer';
import { HttpError } from '../utils/helpers.js';

export function notFound(req, _res, next) {
  next(new HttpError(404, `Route not found: ${req.method} ${req.originalUrl}`));
}

export function errorHandler(err, _req, res, _next) {
  if (err instanceof HttpError) return res.status(err.status).json({ message: err.message });
  if (err instanceof multer.MulterError) return res.status(400).json({ message: err.message });
  if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ message: 'This record already exists' });
  if (err.type === 'entity.parse.failed') return res.status(400).json({ message: 'Invalid JSON body' });

  console.error(err);
  const message = process.env.NODE_ENV === 'production' ? 'Something went wrong' : err.message || err.code || 'Server error';
  res.status(500).json({ message });
}
