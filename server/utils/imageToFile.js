import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const FOODS_UPLOAD_DIR = path.join(path.dirname(__dirname), 'uploads', 'foods');

const MIME_EXT = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/gif': 'gif',
  'image/webp': 'webp',
  'image/svg+xml': 'svg',
  'image/avif': 'avif',
  'image/bmp': 'bmp'
};

export function ensureFoodsUploadDir() {
  fs.mkdirSync(FOODS_UPLOAD_DIR, { recursive: true });
  return FOODS_UPLOAD_DIR;
}

function toFile(dataUrl, baseName) {
  ensureFoodsUploadDir();
  const m = String(dataUrl).match(/^data:([^;,]+);base64,(.*)$/);
  if (!m) return dataUrl;
  const mime = m[1] || 'image/png';
  const ext = MIME_EXT[mime.toLowerCase()] || 'png';
  const buf = Buffer.from(m[2], 'base64');
  const fileName = `${baseName}-${crypto.randomBytes(4).toString('hex')}.${ext}`;
  const filePath = path.join(FOODS_UPLOAD_DIR, fileName);
  fs.writeFileSync(filePath, buf);
  return `/uploads/foods/${fileName}`;
}

export function imageToString(value, baseName) {
  if (!value) return value;
  if (typeof value === 'string') return String(value).startsWith('data:') ? toFile(value, baseName) : value;
  return value;
}

export function normalizeFoodImages(body, baseName) {
  if (!body || typeof body !== 'object') return body;

  if (typeof body.image === 'string') body.image = toFile(body.image, baseName);

  if (Array.isArray(body.images)) {
    body.images = body.images.map((im, i) =>
      typeof im === 'string' && String(im).startsWith('data:') ? toFile(im, `${baseName}-img${i}`) : im
    );
  }

  if (Array.isArray(body.ingredients)) {
    body.ingredients = body.ingredients.map((ing, i) => {
      if (!ing || typeof ing !== 'object') return ing;
      if (typeof ing.image === 'string' && String(ing.image).startsWith('data:')) {
        ing.image = toFile(ing.image, `${baseName}-ing${i}`);
      }
      return ing;
    });
  }

  if (Array.isArray(body.extras)) {
    body.extras = body.extras.map((ex, i) => {
      if (!ex || typeof ex !== 'object') return ex;
      if (typeof ex.image === 'string' && String(ex.image).startsWith('data:')) {
        ex.image = toFile(ex.image, `${baseName}-ex${i}`);
      }
      return ex;
    });
  }

  return body;
}
