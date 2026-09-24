import jwt from 'jsonwebtoken';
import { HttpError } from '../utils/helpers.js';

export const signToken = (payload) =>
  jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

function readToken(req) {
  const header = req.headers.authorization || '';
  if (!header.startsWith('Bearer ')) return null;
  try {
    return jwt.verify(header.slice(7), process.env.JWT_SECRET);
  } catch {
    return null;
  }
}

export function optionalAuth(req, _res, next) {
  req.user = readToken(req);
  next();
}

export const requireRole = (role) => (req, _res, next) => {
  const user = readToken(req);
  if (!user) throw new HttpError(401, 'Please log in to continue');
  if (user.role !== role) throw new HttpError(403, 'You do not have access to this resource');
  req.user = user;
  next();
};

export const requireClient = requireRole('client');
export const requireAdmin = requireRole('admin');
