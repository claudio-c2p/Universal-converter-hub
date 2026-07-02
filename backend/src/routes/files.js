import express from 'express';
import path from 'node:path';
import fs from 'node:fs/promises';
import { sanitizeFilename } from '../utils/fileUtils.js';

const router = express.Router();

// Serve apenas arquivos temporários gerados pelo próprio backend (prefixo "c2p_"
// criado por saveTempFile) — nunca aceita caminho arbitrário do cliente.
router.get('/temp/:filename', async (req, res) => {
  const filename = sanitizeFilename(req.params.filename);
  if (!filename.startsWith('c2p_')) {
    return res.status(404).json({ error: 'Arquivo não encontrado.' });
  }
  const tmpDir = process.env.TMP_DIR ?? '/tmp';
  const filePath = path.join(tmpDir, filename);
  try {
    await fs.access(filePath);
  } catch {
    return res.status(404).json({ error: 'Arquivo não encontrado ou expirado.' });
  }
  res.download(filePath, filename);
});

export default router;
