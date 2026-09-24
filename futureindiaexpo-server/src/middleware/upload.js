import fs from 'node:fs/promises';
import path from 'node:path';
import multer from 'multer';
import { deleteObject, isRemote, putObject } from '../config/storage.js';
import { HttpError } from '../utils/helpers.js';

// The PHP site served everything from public/assets and Store.php moved uploads into
// assets/welcome/images/<folder>. Keeping that layout means every <img src> in the ported
// templates stays exactly as it was — on disk locally, and as bucket keys in production.
export const ASSETS_ROOT = path.resolve(process.env.ASSETS_DIR || 'assets');
export const IMAGE_ROOT = path.join(ASSETS_ROOT, 'welcome', 'images');

const ALLOWED = new Map([
  ['image/jpeg', 'jpg'],
  ['image/png', 'png'],
  ['image/webp', 'webp'],
  ['image/gif', 'gif'],
]);

export const imageUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) =>
    ALLOWED.has(file.mimetype) ? cb(null, true) : cb(new HttpError(400, 'Only JPG, PNG, WEBP or GIF images are allowed')),
});

// folder '' means assets/welcome/images itself, which is where about/customization/faq
// images went in Store.php.
const folderPath = (folder) => (folder ? path.join(IMAGE_ROOT, folder) : IMAGE_ROOT);
const objectKey = (folder, name) => ['welcome', 'images', folder, name].filter(Boolean).join('/');

export async function saveImage(file, folder, baseName) {
  const name = `${baseName}.${ALLOWED.get(file.mimetype)}`;

  if (isRemote) {
    await putObject(objectKey(folder, name), file.buffer, file.mimetype);
    return name;
  }

  const dir = folderPath(folder);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(path.join(dir, name), file.buffer);
  return name;
}

export async function removeImage(folder, name) {
  if (!name) return;
  const file = path.basename(name);

  if (isRemote) {
    await deleteObject(objectKey(folder, file));
    return;
  }

  await fs.rm(path.join(folderPath(folder), file), { force: true });
}
