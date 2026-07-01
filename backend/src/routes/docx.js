import express from 'express';
import multer from 'multer';
import path from 'path';
import { docxToHtml, docxToMarkdown } from '../converters/docxConverter.js';
import { sanitizeFilename, saveTempFile, removeFileSafe, validateMagicBytes } from '../utils/fileUtils.js';

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 }, // 20 MB
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext === '.docx') cb(null, true);
    else cb(new Error('Apenas arquivos .docx são aceitos.'));
  },
});

router.post('/convert', upload.single('file'), async (req, res) => {
  let tmpPath = null;
  try {
    if (!req.file) return res.status(400).json({ error: 'Nenhum arquivo enviado.' });
    if (!validateMagicBytes(req.file.buffer, 'docx')) {
      return res.status(422).json({ error: 'O arquivo enviado não é um .docx válido (assinatura de arquivo não corresponde).' });
    }
    const { toFormat = 'html' } = req.body;
    if (!['html', 'markdown'].includes(toFormat)) {
      return res.status(400).json({ error: 'Parâmetro "toFormat" deve ser "html" ou "markdown".' });
    }
    tmpPath = await saveTempFile(req.file.buffer, '.docx');
    const base = path.basename(req.file.originalname, '.docx');
    let content, outExt;

    if (toFormat === 'html') {
      const { html } = await docxToHtml(tmpPath);
      content = html; outExt = '.html';
    } else {
      const { markdown } = await docxToMarkdown(tmpPath);
      content = markdown; outExt = '.md';
    }

    const filename = sanitizeFilename(`${base}${outExt}`);
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(content);
  } catch (err) {
    console.error('[docx/convert]', err.message);
    if (!res.headersSent) res.status(422).json({ error: err.message });
  } finally {
    if (tmpPath) await removeFileSafe(tmpPath);
  }
});

export default router;
