import app from './app.js';
import { pool } from './config/db.js';

if (!process.env.JWT_SECRET) {
  console.error('JWT_SECRET is not set. Copy .env.example to .env and fill it in.');
  process.exit(1);
}

const port = Number(process.env.PORT || 5000);

app.listen(port, () => console.log(`API listening on http://localhost:${port}`));

pool
  .query('SELECT 1')
  .then(() => console.log(`MySQL connected: ${process.env.DB_NAME}@${process.env.DB_HOST}`))
  .catch((err) =>
    console.warn(`MySQL is not reachable (${err.code || err.message}). API routes that use the database will fail.`),
  );
