import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { one, query } from '../config/db.js';
import { signToken, requireClient } from '../middleware/auth.js';
import { HttpError, hashPassword, verifyPassword, verifyRecaptcha } from '../utils/helpers.js';

const router = Router();
router.use(rateLimit({ windowMs: 15 * 60 * 1000, limit: 30, standardHeaders: true, legacyHeaders: false }));

const CURRENCIES = ['inr', 'usd', 'gbp', 'aud', 'euro'];

const publicUser = ({ password, ...rest }) => rest;

// Login::store_user_details. Checks run in the PHP order with the PHP messages. A 400 means
// the form stays on /registration; every other outcome (created, duplicate, reCAPTCHA failure)
// was a redirect to /login in PHP, and the client follows that.
router.post('/register', async (req, res) => {
  const fname = String(req.body.first_name ?? '').trim();
  const lname = String(req.body.last_name ?? '').trim();
  const email = String(req.body.emailId ?? req.body.email ?? '').trim().toLowerCase();
  const password = String(req.body.password ?? '').trim();
  const currency = String(req.body.currency ?? '').trim();

  if (password.length < 8) throw new HttpError(400, 'Password length should be 8.');
  if (!fname || !email || !password || !currency) {
    throw new HttpError(400, 'All fields are required. Please complete the form and try again.');
  }
  if (!CURRENCIES.includes(currency)) throw new HttpError(400, 'All fields are required. Please complete the form and try again.');
  if (await one('SELECT id FROM users WHERE email = ?', [email])) throw new HttpError(409, 'Enter Email are already registered.');
  if (!(await verifyRecaptcha(req.body.recaptchaToken))) {
    throw new HttpError(403, 'Error: reCAPTCHA Verification Failed. Please Try Again.');
  }

  const result = await query(
    'INSERT INTO users (fname, lname, email, currency, password, created_at, updated_at) VALUES (?, ?, ?, ?, ?, NOW(), NOW())',
    [fname, lname, email, currency, await hashPassword(password)],
  );
  res.status(201).json({ message: 'Thanks for Registration with Us.', userId: result.insertId });
});

// Login::check_users_login_details
router.post('/login', async (req, res) => {
  const email = String(req.body.email ?? '').trim().toLowerCase();
  const password = String(req.body.password ?? '').trim();

  const user = await one('SELECT * FROM users WHERE email = ?', [email]);
  if (!user) throw new HttpError(401, 'Entered Email Not Registered With Us.');
  if (!(await verifyRecaptcha(req.body.recaptchaToken))) {
    throw new HttpError(403, 'Error: reCAPTCHA Verification Failed. Please Try Again.');
  }

  const check = await verifyPassword(password, user.password);
  if (!check.ok) throw new HttpError(401, 'Email & Password Not Match. Please Try Again.');

  if (check.needsRehash) await query('UPDATE users SET password = ? WHERE id = ?', [await hashPassword(password), user.id]);

  const token = signToken({ id: user.id, role: 'client', currency: user.currency });
  res.json({ token, user: publicUser(user) });
});

router.post('/admin/login', async (req, res) => {
  const email = String(req.body.email ?? '').trim();
  const password = String(req.body.password ?? '').trim();

  // Login::check_admin_access messages.
  const admin = await one('SELECT * FROM adminusers WHERE email = ?', [email]);
  if (!admin) throw new HttpError(401, 'Please Enter Valid Email & Password.');
  const check = await verifyPassword(password, admin.password);
  if (!check.ok) throw new HttpError(401, 'Email & Password Not Match. Please Try Again.');

  if (check.needsRehash) await query('UPDATE adminusers SET password = ? WHERE id = ?', [await hashPassword(password), admin.id]);

  const token = signToken({ id: admin.id, role: 'admin' });
  res.json({ token, admin: publicUser(admin) });
});

router.get('/me', requireClient, async (req, res) => {
  const user = await one('SELECT * FROM users WHERE id = ?', [req.user.id]);
  if (!user) throw new HttpError(404, 'User not found');
  res.json(publicUser(user));
});

export default router;
