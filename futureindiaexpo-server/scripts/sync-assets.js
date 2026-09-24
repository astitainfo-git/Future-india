import fs from 'node:fs/promises';
import path from 'node:path';
import { isRemote, MIME_BY_EXTENSION, putObject } from '../src/config/storage.js';
import { ASSETS_ROOT } from '../src/middleware/upload.js';

/**
 * Uploads the local `assets` folder (the PHP site's public/assets: theme CSS and JS, the logo,
 * and every existing product, category, banner and side image) to the storage bucket, keeping
 * the same paths. Run it once after copying the folder from the live server, and again whenever
 * you add files to it by hand.
 *
 *   npm run sync-assets            upload everything
 *   npm run sync-assets -- --dry   list what would be uploaded, change nothing
 */
const dryRun = process.argv.includes('--dry');

if (!isRemote && !dryRun) {
  console.error('No bucket configured. Set S3_BUCKET, S3_ACCESS_KEY_ID and S3_SECRET_ACCESS_KEY first.');
  process.exit(1);
}

async function* walk(dir) {
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(full);
    else if (entry.isFile()) yield full;
  }
}

let count = 0;
let bytes = 0;

try {
  await fs.access(ASSETS_ROOT);
} catch {
  console.error(`No assets folder at ${ASSETS_ROOT}. Copy the PHP site's public/assets here first.`);
  process.exit(1);
}

for await (const file of walk(ASSETS_ROOT)) {
  const key = path.relative(ASSETS_ROOT, file).split(path.sep).join('/');
  if (key === 'README.txt') continue;

  const body = await fs.readFile(file);
  const type = MIME_BY_EXTENSION[path.extname(file).toLowerCase()] ?? 'application/octet-stream';

  if (!dryRun) await putObject(key, body, type);
  count += 1;
  bytes += body.length;
  if (count % 50 === 0) console.log(`${count} files...`);
}

console.log(`${dryRun ? 'Would upload' : 'Uploaded'} ${count} files (${(bytes / 1024 / 1024).toFixed(1)} MB).`);
