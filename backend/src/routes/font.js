import express from 'express';
import multer from 'multer';
import path from 'path';
import { convertFont } from '../converters/fontConverter.js';
import { sanitizeFilename } from '../utils/fileUtils.js';

const MIME_MAP = {
  ttf:   'font/ttf',
  woff:  'font/woff',
  woff2: 'font/woff2',
  eot:   'application/vnd.ms-fontobject',
  svg:   'image/svg+xml',
};

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 }, // 20 MB
  fileFilter: (_req, file, cb) => {
    const allowed = ['.ttf', '.woff', '.woff2', '.eot', '.svg', '.otf'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) cb(null, true);
    else cb(new Error(`Extensão não permitida: ${ext}.`));
  },
});

router.post('/convert', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Nenhum arquivo enviado.' });
    const { toFormat: toType } = req.body;
    if (!toType) return res.status(400).json({ error: 'Parâmetro "toFormat" ausente.' });
    const fromType = path.extname(req.file.originalname).slice(1).toLowerCase();
    const base = path.basename(req.file.originalname, `.${fromType}`);
    const outputBuffer = await convertFont(req.file.buffer, fromType, toType);
    const filename = sanitizeFilename(`${base}.${toType}`);
    res.setHeader('Content-Type', MIME_MAP[toType] ?? 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(outputBuffer);
  } catch (err) {
    console.error('[font/convert]', err.message);
    res.status(422).json({ error: err.message });
  }
});

export default router;
