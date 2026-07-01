import express from 'express';
import multer from 'multer';
import path from 'path';
import { readExif, summarizeExif } from '../converters/exifConverter.js';

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 30 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ['.jpg', '.jpeg', '.png', '.tiff', '.heic', '.heif', '.webp'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) cb(null, true);
    else cb(new Error(`Formato não suportado: ${ext}.`));
  },
});

router.post('/read', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Nenhum arquivo enviado.' });

    const ext  = path.extname(req.file.originalname).toLowerCase();
    const raw  = await readExif(req.file.buffer, ext);

    if (raw._info) {
      // Sem EXIF — mantém resposta compatível com frontend atual
      return res.json({ data: null, message: raw._info });
    }

    const summary       = summarizeExif(raw);
    const googleMapsUrl = raw._googleMapsUrl ?? null;

    // "data" mantido para compatibilidade com frontend atual
    res.json({ filename: req.file.originalname, data: raw, summary, googleMapsUrl });
  } catch (err) {
    console.error('[exif/read]', err.message);
    res.status(422).json({ error: err.message });
  }
});

export default router;
