import { DeleteObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';

/**
 * Image storage.
 *
 * Hostinger's Node.js hosting rebuilds the app's filesystem on every deploy, so anything the
 * admin panel uploads to disk is lost. When the S3 variables below are set, uploads go to a
 * bucket instead (Cloudflare R2, Amazon S3 or any S3-compatible service) and survive deploys.
 *
 * With no S3 variables set, everything falls back to the local `assets` folder, which is what
 * local development and the old PHP layout use. Keys mirror the PHP paths exactly, e.g.
 * `welcome/images/products/saree_1.jpg`, so image URLs never change.
 */
const { S3_BUCKET, S3_REGION, S3_ENDPOINT, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY } = process.env;

export const isRemote = Boolean(S3_BUCKET && S3_ACCESS_KEY_ID && S3_SECRET_ACCESS_KEY);

// Public base URL of the bucket (R2 public bucket URL, S3 website URL or a CDN in front of it).
const PUBLIC_URL = (process.env.ASSET_PUBLIC_URL || '').replace(/\/$/, '');

const client = isRemote
  ? new S3Client({
      region: S3_REGION || 'auto',
      endpoint: S3_ENDPOINT || undefined,
      credentials: { accessKeyId: S3_ACCESS_KEY_ID, secretAccessKey: S3_SECRET_ACCESS_KEY },
    })
  : null;

export async function putObject(key, body, contentType) {
  await client.send(
    new PutObjectCommand({
      Bucket: S3_BUCKET,
      Key: key,
      Body: body,
      ContentType: contentType,
      CacheControl: 'public, max-age=604800',
    }),
  );
}

export async function deleteObject(key) {
  await client.send(new DeleteObjectCommand({ Bucket: S3_BUCKET, Key: key }));
}

// Used by the /assets route to send browsers to the bucket for files that are not on disk.
export const objectUrl = (key) => (PUBLIC_URL ? `${PUBLIC_URL}/${key}` : null);

export const MIME_BY_EXTENSION = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.eot': 'application/vnd.ms-fontobject',
  '.ico': 'image/x-icon',
  '.webmanifest': 'application/manifest+json',
  '.xml': 'application/xml',
  '.txt': 'text/plain',
};
