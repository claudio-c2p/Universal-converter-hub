import express from 'express';
import multer from 'multer';
import path from 'path';
import { convertConfig } from '../converters/configConverter.js';
import { sanitizeFilename } from '../utils/fileUtils.js';

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 512 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ['.json', '.toml', '.ini', '.env', '.txt', '.properties', '.yaml', '.yml', '.xml'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext) || file.originalname.startsWith('.env')) cb(null, true);
    else cb(new Error(`Extensão não permitida: ${ext}.`));
  },
});

const EXT_MAP = { json: '.json', toml: '.toml', ini: '.ini', env: '', properties: '.properties', yaml: '.yaml', xml: '.xml' };

router.post('/convert', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Nenhum arquivo enviado.' });
    const { toFormat, fromFormat } = req.body;
    if (!toFormat || !fromFormat) {
      return res.status(400).json({ error: 'Parâmetros "fromFormat" e "toFormat" são obrigatórios.' });
    }
    const content   = req.file.buffer.toString('utf-8');
    const converted = convertConfig(content, fromFormat, toFormat);
    const base      = path.basename(req.file.originalname, path.extname(req.file.originalname));
    const outExt    = EXT_MAP[toFormat] ?? `.${toFormat}`;
    const filename  = sanitizeFilename(toFormat === 'env' ? `.env.${base}` : `${base}${outExt}`);

    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(converted);
  } catch (err) {
    console.error('[config/convert]', err.message);
    res.status(422).json({ error: err.message });
  }
});

export default router;
