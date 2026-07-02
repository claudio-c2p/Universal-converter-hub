import express from 'express';
import multer from 'multer';
import { saveTempFile, sanitizeFilename } from '../utils/fileUtils.js';
import { runChain } from '../converters/chainRunner.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 50 * 1024 * 1024 } });

router.post('/chain-convert', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, error: 'Nenhum arquivo enviado.' });

    let steps;
    try {
      steps = JSON.parse(req.body.steps).map((s) => {
        const [from, to] = s.split('->');
        return { from, to };
      });
    } catch {
      return res.status(400).json({ success: false, error: 'Campo "steps" inválido.' });
    }
    if (!Array.isArray(steps) || steps.length === 0 || steps.length > 5) {
      return res.status(400).json({ success: false, error: 'A cadeia deve ter entre 1 e 5 passos.' });
    }

    const { buffer, finalFormat } = await runChain(req.file.buffer, steps);

    const tempPath = await saveTempFile(buffer, `.${finalFormat}`);
    const downloadUrl = `/api/files/temp/${sanitizeFilename(tempPath.split('/').pop())}`;

    res.json({ success: true, finalFormat, downloadUrl });
  } catch (err) {
    res.status(422).json({
      success: false,
      failedStep: err.failedStep ?? null,
      error: err.message,
    });
  }
});

export default router;
