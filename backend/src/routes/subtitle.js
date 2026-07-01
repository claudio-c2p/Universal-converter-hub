import express from 'express';
import multer from 'multer';
import path from 'path';
import { convertSubtitle } from '../converters/subtitleConverter.js';
import { sanitizeFilename } from '../utils/fileUtils.js';

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 }, // 2 MB
  fileFilter: (_req, file, cb) => {
    const allowed = ['.srt', '.vtt'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) cb(null, true);
    else cb(new Error(`Extensão não permitida: ${ext}. Use .srt ou .vtt.`));
  },
});

router.post('/convert', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Nenhum arquivo enviado.' });
    const { toFormat: outputFormat = 'WebVTT' } = req.body;
    const content = req.file.buffer.toString('utf-8');
    const converted = convertSubtitle(content, outputFormat);
    const ext = outputFormat === 'WebVTT' ? 'vtt' : 'srt';
    const base = path.basename(req.file.originalname, path.extname(req.file.originalname));
    const filename = sanitizeFilename(`${base}.${ext}`);
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(converted);
  } catch (err) {
    console.error('[subtitle/convert]', err.message);
    res.status(422).json({ error: err.message });
  }
});

export default router;
