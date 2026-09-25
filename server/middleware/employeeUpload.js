import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadDir = path.join(__dirname, '../uploads/employees');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
    cb(null, `emp-${uniqueSuffix}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|gif|webp|avif|pdf/;
  const extOk = allowed.test(path.extname(file.originalname).toLowerCase());
  const mime = file.mimetype || '';
  const mimeOk = allowed.test(mime.split('/')[1] || mime);
  if (extOk || mimeOk) cb(null, true);
  else cb(new Error('Only image files and PDF are allowed'), false);
};

const uploadEmployeeDocs = multer({
  storage,
  fileFilter,
  limits: { fileSize: 15 * 1024 * 1024 },
}).fields([
  { name: 'nationalIdFront', maxCount: 1 },
  { name: 'nationalIdBack', maxCount: 1 },
  { name: 'experienceDocument', maxCount: 1 },
  { name: 'avatar', maxCount: 1 }
]);

export default uploadEmployeeDocs;