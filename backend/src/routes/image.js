import express from 'express';
import multer from 'multer';
import { sanitizeFilename } from '../utils/fileUtils.js';
import { convertImage } from '../converters/imageConverter.js';

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 },
});

router.post('/convert', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Nenhum arquivo enviado.' });
    const { to } = req.body;
    if (!to) return res.status(400).json({ error: 'Parâmetro "to" é obrigatório.' });

    // A validação real do conteúdo é feita pelo próprio sharp ao decodificar o
    // buffer (falha em 422 se não for uma imagem válida) — ver catch abaixo.
    const outBuffer = await convertImage(req.file.buffer, to, {
      quality: req.body.quality ? Number(req.body.quality) : undefined,
      resizeWidth: req.body.resizeWidth ? Number(req.body.resizeWidth) : undefined,
    });

    const outName = sanitizeFilename(`convertido.${to}`);
    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${outName}"`);
    res.send(outBuffer);
  } catch (err) {
    res.status(err.isValidation ? 400 : 422).json({ error: err.message || 'Arquivo não parece ser uma imagem válida.' });
  }
});

export default router;
