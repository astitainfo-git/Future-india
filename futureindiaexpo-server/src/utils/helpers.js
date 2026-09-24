import bcrypt from 'bcryptjs';

export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

export const slugify = (text) =>
  String(text).trim().toLowerCase().replace(/ /g, '-').replace(/[^a-z0-9-]/g, '');

export const pick = (source = {}, fields) =>
  Object.fromEntries(fields.filter((f) => source[f] !== undefined).map((f) => [f, source[f]]));

// Entity strings match what the PHP site wrote to carts/orders, so both apps can share the DB during migration.
const CURRENCIES = {
  inr: { column: 'inr_price', entity: '&#8377;', symbol: '₹' },
  usd: { column: 'usd_price', entity: '$', symbol: '$' },
  gbp: { column: 'gbp_price', entity: '&#163;', symbol: '£' },
  aud: { column: 'aud_price', entity: '&#36;', symbol: '$' },
  euro: { column: 'euro_price', entity: '&euro;', symbol: '€' },
};

export const currencyFor = (code) => CURRENCIES[code] ?? CURRENCIES.inr;

const ENTITY_TO_SYMBOL = Object.fromEntries(Object.values(CURRENCIES).map((c) => [c.entity, c.symbol]));
export const decodeSymbol = (value) => ENTITY_TO_SYMBOL[value] ?? value;

export const hashPassword = (plain) => bcrypt.hash(plain, 12);

// Legacy PHP rows store base64(password); callers should rehash on success when needsRehash is true.
export async function verifyPassword(plain, stored) {
  if (!stored) return { ok: false };
  if (/^\$2[aby]\$/.test(stored)) return { ok: await bcrypt.compare(plain, stored), needsRehash: false };
  return { ok: Buffer.from(plain).toString('base64') === stored, needsRehash: true };
}

export async function verifyRecaptcha(token) {
  const secret = process.env.RECAPTCHA_SECRET;
  if (!secret) return true;
  if (!token) return false;
  const res = await fetch('https://www.google.com/recaptcha/api/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ secret, response: token }),
  });
  const data = await res.json();
  return data.success && (data.score === undefined || data.score >= 0.5);
}
