import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SERVER_ROOT = path.dirname(__dirname);

export const FOODS_UPLOAD_DIR = path.join(SERVER_ROOT, 'uploads', 'foods');
export const FOODS_UPLOAD_URL_PREFIX = '/uploads/foods/';

const MIME_EXT = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/gif': 'gif',
  'image/webp': 'webp',
  'image/svg+xml': 'svg',
  'image/avif': 'avif',
  'image/bmp': 'bmp'
};

function ensureDir() {
  fs.mkdirSync(FOODS_UPLOAD_DIR, { recursive: true });
  return FOODS_UPLOAD_DIR;
}

/**
 * Converts a base64 data URL into a static file under server/uploads/foods
 * and returns its public path (/uploads/foods/xxx). Non-data values are
 * returned unchanged so this is safe to call on any string field.
 */
export function imageToFile(dataUrl, baseName = 'food') {
  if (!dataUrl || typeof dataUrl !== 'string') return dataUrl;
  if (!dataUrl.startsWith('data:')) return dataUrl;

  const m = dataUrl.match(/^data:([^;,]+);base64,(.+)$/s);
  if (!m) return dataUrl;

  const mime = m[1].toLowerCase();
  const ext = MIME_EXT[mime] || 'png';
  const buf = Buffer.from(m[2], 'base64');
  const fileName = `${baseName}-${Date.now()}-${crypto.randomBytes(4).toString('hex')}.${ext}`;
  const filePath = path.join(ensureDir(), fileName);
  fs.writeFileSync(filePath, buf);
  return `/uploads/foods/${fileName}`;
}

/**
 * Converts a possibly-base64 food image field to a static file
 * (main image, additional images, ingredient images, extra images, size images).
 */
function normalizeIngredientImages(arr, baseName, kind) {
  return (arr || []).map((el, i) => {
    if (!el || typeof el !== 'object') return el;
    if (typeof el.image === 'string') {
      el.image = imageToFile(el.image, `${baseName}-${kind}${i}`);
    }
    return el;
  });
}

/** Idempotent: converts every base64 data URL in a food body into a file path. */
export function normalizeFoodImages(body, baseName = 'food') {
  if (!body || typeof body !== 'object') return body;

  if (typeof body.image === 'string') {
    body.image = imageToFile(body.image, baseName);
  }

  if (Array.isArray(body.images)) {
    body.images = body.images.map((img, i) =>
      typeof img === 'string' ? imageToFile(img, `${baseName}-img${i}`) : img
    );
  }

  if (Array.isArray(body.ingredients)) {
    body.ingredients = normalizeIngredientImages(body.ingredients, baseName, 'ing');
  }

  if (Array.isArray(body.extras)) {
    body.extras = normalizeIngredientImages(body.extras, baseName, 'ex');
  }

  if (Array.isArray(body.sizes)) {
    body.sizes = normalizeIngredientImages(body.sizes, baseName, 'sz');
  }

  return body;
}
