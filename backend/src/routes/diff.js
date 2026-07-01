import express from 'express';
import multer from 'multer';
import path from 'path';
import { diffLinesDetailed, diffJsonContent, diffToPatch, diffStats } from '../converters/diffConverter.js';

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 500 * 1024 },
  fileFilter: (_req, file, cb) => {
    const textExts = ['.txt', '.md', '.json', '.xml', '.yaml', '.yml', '.csv', '.html', '.js', '.ts', '.py', '.sql', '.toml', '.ini', '.env'];
    const ext = file.originalname.slice(file.originalname.lastIndexOf('.')).toLowerCase();
    if (textExts.includes(ext)) cb(null, true);
    else cb(new Error(`Extensão não permitida: ${ext}. Use arquivos de texto.`));
  },
});

// POST /api/diff/compare — retorna diff estruturado para o frontend renderizar
router.post('/compare', upload.fields([{ name: 'fileA', maxCount: 1 }, { name: 'fileB', maxCount: 1 }]), (req, res) => {
  try {
    const fileA = req.files?.fileA?.[0];
    const fileB = req.files?.fileB?.[0];
    if (!fileA) return res.status(400).json({ error: 'Arquivo A não enviado.' });
    if (!fileB) return res.status(400).json({ error: 'Arquivo B não enviado.' });

    const contentA = fileA.buffer.toString('utf-8');
    const contentB = fileB.buffer.toString('utf-8');
    const extA     = path.extname(fileA.originalname).toLowerCase();

    const parts = extA === '.json'
      ? diffJsonContent(contentA, contentB)
      : diffLinesDetailed(contentA, contentB);

    const stats = diffStats(parts);

    res.json({
      filenameA: fileA.originalname,
      filenameB: fileB.originalname,
      stats,
      // "diffs" mantido para compatibilidade com frontend atual
      diffs: parts.map((p) => ({ value: p.value, added: p.added ?? false, removed: p.removed ?? false })),
    });
  } catch (err) {
    console.error('[diff/compare]', err.message);
    res.status(422).json({ error: err.message });
  }
});

// POST /api/diff/patch — retorna arquivo .patch para download
router.post('/patch', upload.fields([{ name: 'fileA', maxCount: 1 }, { name: 'fileB', maxCount: 1 }]), (req, res) => {
  try {
    const fileA = req.files?.fileA?.[0];
    const fileB = req.files?.fileB?.[0];
    if (!fileA || !fileB) return res.status(400).json({ error: 'Envie os dois arquivos.' });

    const patch = diffToPatch(
      fileA.buffer.toString('utf-8'),
      fileB.buffer.toString('utf-8'),
      fileA.originalname,
      fileB.originalname,
    );

    if (!patch) {
      return res.status(200).json({ identical: true, message: 'Os arquivos são idênticos.' });
    }

    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="diff.patch"');
    res.send(patch);
  } catch (err) {
    console.error('[diff/patch]', err.message);
    res.status(422).json({ error: err.message });
  }
});

export default router;
