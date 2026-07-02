import express from 'express';
import multer from 'multer';
import path from 'path';
import archiver from 'archiver';
import { sanitizeFilename } from '../utils/fileUtils.js';
import { convertSingleFile, mergePdfBuffers } from '../converters/batchConverter.js';

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 40 * 1024 * 1024, files: 30 },
});

router.post('/convert', upload.array('files', 30), async (req, res) => {
  try {
    if (!req.files || req.files.length < 2) {
      return res.status(400).json({ error: 'Envie pelo menos 2 arquivos.' });
    }
    const to = (req.body.to || '').toLowerCase().replace(/^\./, '');
    if (!to) return res.status(400).json({ error: 'Informe o formato de destino ("to").' });
    // "merge" só faz sentido combinado com to=pdf — mesclar os resultados em um único arquivo
    // em vez de devolver um ZIP com um arquivo por entrada.
    const merge = req.body.merge === 'true' && to === 'pdf';

    const results = [];
    const errors = [];

    // Sequencial, não Promise.all: LibreOffice já tem fila própria de concorrência
    // (libreOfficeConverter.js), então converter em paralelo aqui só empilharia
    // requisições esperando o mesmo semáforo sem ganho real de velocidade.
    for (const file of req.files) {
      try {
        const out = await convertSingleFile(file.buffer, file.originalname, to);
        const base = path.basename(file.originalname, path.extname(file.originalname));
        results.push({ name: sanitizeFilename(`${base}.${to === 'jpeg' ? 'jpg' : to}`), buffer: out });
      } catch (err) {
        errors.push({ file: file.originalname, error: err.message });
      }
    }

    if (results.length === 0) {
      return res.status(422).json({
        error: 'Nenhum dos arquivos enviados pôde ser convertido.',
        details: errors,
      });
    }

    if (merge) {
      const mergedBuf = await mergePdfBuffers(results.map((r) => r.buffer));
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename="convertido-mesclado.pdf"');
      if (errors.length) res.setHeader('X-Batch-Errors', encodeURIComponent(JSON.stringify(errors)));
      return res.send(mergedBuf);
    }

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', 'attachment; filename="convertidos.zip"');
    if (errors.length) res.setHeader('X-Batch-Errors', encodeURIComponent(JSON.stringify(errors)));

    const archive = archiver('zip', { zlib: { level: 6 } });
    archive.on('error', (err) => { throw err; });
    archive.pipe(res);
    for (const r of results) archive.append(r.buffer, { name: r.name });
    if (errors.length) {
      const report = errors.map((e) => `${e.file}: ${e.error}`).join('\n');
      archive.append(Buffer.from(report, 'utf-8'), { name: '_erros.txt' });
    }
    await archive.finalize();
  } catch (err) {
    console.error('[batch/convert]', err.message);
    if (!res.headersSent) res.status(500).json({ error: err.message || 'Falha na conversão em lote.' });
  }
});

export default router;
