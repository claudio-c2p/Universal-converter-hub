import express from 'express';
import multer from 'multer';
import path from 'path';
import archiver from 'archiver';
import { pdfToImages } from '../converters/pdfImageConverter.js';
import { sanitizeFilename, saveTempFile, removeFileSafe } from '../utils/fileUtils.js';

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext === '.pdf') cb(null, true);
    else cb(new Error('Apenas arquivos .pdf são aceitos.'));
  },
});

router.post('/convert', upload.single('file'), async (req, res) => {
  let tmpPath = null;
  try {
    if (!req.file) return res.status(400).json({ error: 'Nenhum arquivo enviado.' });
    const scale = Math.min(4, Math.max(1, parseInt(req.body.scale ?? '2', 10)));
    tmpPath = await saveTempFile(req.file.buffer, '.pdf');
    const pages = await pdfToImages(tmpPath, scale);
    const base  = path.basename(req.file.originalname, '.pdf');

    if (pages.length === 1) {
      const filename = sanitizeFilename(`${base}-page1.png`);
      res.setHeader('Content-Type', 'image/png');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      return res.send(pages[0].buffer);
    }

    // Múltiplas páginas → ZIP
    const zipName = sanitizeFilename(`${base}-pages.zip`);
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${zipName}"`);
    const archive = archiver('zip', { zlib: { level: 6 } });
    archive.pipe(res);
    for (const { buffer, page } of pages) {
      archive.append(buffer, { name: `${base}-page${page}.png` });
    }
    await archive.finalize();
  } catch (err) {
    console.error('[pdfImage/convert]', err.message);
    if (!res.headersSent) res.status(422).json({ error: err.message });
  } finally {
    if (tmpPath) await removeFileSafe(tmpPath);
  }
});

export default router;
