import express from 'express';
import multer from 'multer';
import path from 'path';
import { xmlToYaml, beautifyXml, minifyXml, xmlToCsv } from '../converters/xmlConverter.js';
import { sanitizeFilename } from '../utils/fileUtils.js';

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (['.xml'].includes(ext)) cb(null, true);
    else cb(new Error(`Apenas arquivos .xml são aceitos.`));
  },
});

router.post('/convert', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Nenhum arquivo enviado.' });
    const { toFormat, listElementPath } = req.body;
    const content = req.file.buffer.toString('utf-8');
    const base    = path.basename(req.file.originalname, '.xml');
    let result, outExt, mime;

    switch (toFormat) {
      case 'yaml':
        result = xmlToYaml(content); outExt = '.yaml'; mime = 'text/yaml'; break;
      case 'beautify':
        result = beautifyXml(content); outExt = '.xml'; mime = 'application/xml'; break;
      case 'minify':
        result = minifyXml(content); outExt = '.min.xml'; mime = 'application/xml'; break;
      case 'csv':
        result = xmlToCsv(content, listElementPath); outExt = '.csv'; mime = 'text/csv'; break;
      default:
        return res.status(400).json({ error: `Formato de saída inválido: "${toFormat}". Use yaml, beautify, minify ou csv.` });
    }

    const filename = sanitizeFilename(`${base}${outExt}`);
    res.setHeader('Content-Type', `${mime}; charset=utf-8`);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(result);
  } catch (err) {
    console.error('[xml/convert]', err.message);
    res.status(422).json({ error: err.message });
  }
});

export default router;
