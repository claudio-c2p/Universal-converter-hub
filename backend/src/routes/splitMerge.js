import express from 'express';
import multer from 'multer';
import path from 'path';
import archiver from 'archiver';
import { splitCsv, mergeCsv, splitJson, mergeJson } from '../converters/splitMergeConverter.js';
import { sanitizeFilename } from '../utils/fileUtils.js';

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 },
});

router.post('/split', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Nenhum arquivo enviado.' });

    const ext       = path.extname(req.file.originalname).toLowerCase();
    const base      = path.basename(req.file.originalname, ext);
    const content   = req.file.buffer.toString('utf-8');
    // Aceita "chunkSize" (nome do prompt v2) ou "linesPerPart" (nome antigo)
    const chunkSize = parseInt(req.body.chunkSize ?? req.body.linesPerPart ?? '100', 10);

    if (!chunkSize || chunkSize < 1) {
      return res.status(400).json({ error: 'Parâmetro "chunkSize" inválido.' });
    }

    let chunks;
    if (ext === '.csv') {
      chunks = splitCsv(content, chunkSize);
    } else if (ext === '.json') {
      chunks = splitJson(content, chunkSize);
    } else {
      // Fallback: split por linhas para TXT/MD/etc.
      const lines = content.split('\n');
      chunks = [];
      for (let i = 0; i < lines.length; i += chunkSize) {
        chunks.push(lines.slice(i, i + chunkSize).join('\n'));
      }
    }

    if (chunks.length === 1) {
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="${sanitizeFilename(req.file.originalname)}"`);
      return res.send(chunks[0]);
    }

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${sanitizeFilename(`${base}-partes.zip`)}"`);
    const archive = archiver('zip', { zlib: { level: 6 } });
    archive.pipe(res);
    chunks.forEach((chunk, i) => {
      archive.append(Buffer.from(chunk, 'utf-8'), {
        name: `${base}-parte${String(i + 1).padStart(3, '0')}${ext}`,
      });
    });
    await archive.finalize();
  } catch (err) {
    console.error('[splitMerge/split]', err.message);
    if (!res.headersSent) res.status(422).json({ error: err.message });
  }
});

router.post('/merge', upload.array('files', 50), async (req, res) => {
  try {
    const files = req.files;
    if (!files || files.length < 2) {
      return res.status(400).json({ error: 'Envie pelo menos 2 arquivos para mesclar.' });
    }

    const exts = [...new Set(files.map((f) => path.extname(f.originalname).toLowerCase()))];
    if (exts.length > 1) {
      return res.status(400).json({ error: `Todos os arquivos devem ser do mesmo tipo. Encontrado: ${exts.join(', ')}.` });
    }

    const ext      = exts[0];
    const fileData = files.map((f) => ({ name: f.originalname, content: f.buffer.toString('utf-8') }));
    let merged;

    if (ext === '.csv') {
      merged = mergeCsv(fileData);
    } else if (ext === '.json') {
      merged = mergeJson(fileData);
    } else {
      // Fallback para texto
      const separator = req.body.separator ?? '\n\n';
      merged = fileData.map((f) => f.content).join(separator);
    }

    const base     = path.basename(files[0].originalname, ext);
    const filename = sanitizeFilename(`${base}-merged${ext}`);
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(merged);
  } catch (err) {
    console.error('[splitMerge/merge]', err.message);
    res.status(422).json({ error: err.message });
  }
});

export default router;
