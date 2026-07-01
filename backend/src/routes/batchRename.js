// backend/src/routes/batchRename.js

import express from 'express';
import multer from 'multer';
import archiver from 'archiver';
import { applyRenamePattern, previewRename } from '../converters/batchRenameConverter.js';
import { sanitizeFilename } from '../utils/fileUtils.js';

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits:  { fileSize: 20 * 1024 * 1024 }, // 20 MB por arquivo
});

// POST /api/batch-rename/preview — retorna pré-visualização sem baixar nada
router.post('/preview', express.json(), (req, res) => {
  try {
    const { filenames, pattern } = req.body;
    if (!Array.isArray(filenames) || filenames.length === 0) {
      return res.status(400).json({ error: 'Envie a lista de nomes de arquivo em "filenames".' });
    }
    if (!pattern) return res.status(400).json({ error: 'Parâmetro "pattern" obrigatório.' });

    // Detecta e resolve nomes duplicados adicionando sufixo, igual ao /apply
    const usedNames = new Map();
    const preview = previewRename(filenames, pattern).map((item) => {
      let { renamed } = item;
      const key   = renamed.toLowerCase();
      const count = usedNames.get(key) ?? 0;
      if (count > 0) {
        const dot = renamed.lastIndexOf('.');
        renamed   = dot > 0
          ? `${renamed.slice(0, dot)}_${count}${renamed.slice(dot)}`
          : `${renamed}_${count}`;
      }
      usedNames.set(key, count + 1);
      return { original: item.original, renamed: sanitizeFilename(renamed) };
    });

    res.json({ preview });
  } catch (err) {
    res.status(422).json({ error: err.message });
  }
});

// POST /api/batch-rename/apply — renomeia e retorna ZIP
router.post('/apply', upload.array('files', 500), async (req, res) => {
  try {
    const files   = req.files;
    const pattern = req.body.pattern;

    if (!files || files.length === 0) return res.status(400).json({ error: 'Nenhum arquivo enviado.' });
    if (!pattern) return res.status(400).json({ error: 'Parâmetro "pattern" obrigatório.' });

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', 'attachment; filename="renomeados.zip"');

    const archive = archiver('zip', { zlib: { level: 6 } });
    archive.pipe(res);

    // Detecta e resolve nomes duplicados adicionando sufixo
    const usedNames = new Map();
    files.forEach((file, i) => {
      let newName = applyRenamePattern(pattern, file.originalname, i);
      const key   = newName.toLowerCase();
      const count = usedNames.get(key) ?? 0;
      if (count > 0) {
        const dot = newName.lastIndexOf('.');
        newName   = dot > 0
          ? `${newName.slice(0, dot)}_${count}${newName.slice(dot)}`
          : `${newName}_${count}`;
      }
      usedNames.set(key, count + 1);
      archive.append(file.buffer, { name: sanitizeFilename(newName) });
    });

    await archive.finalize();
  } catch (err) {
    console.error('[batch-rename/apply]', err.message);
    if (!res.headersSent) res.status(422).json({ error: err.message });
  }
});

export default router;
