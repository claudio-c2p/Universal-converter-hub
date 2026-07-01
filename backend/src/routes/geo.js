import express from 'express';
import multer from 'multer';
import path from 'path';
import { kmlToGeojson, gpxToGeojson, geojsonToKml } from '../converters/geoConverter.js';
import { sanitizeFilename } from '../utils/fileUtils.js';

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: (_req, file, cb) => {
    const allowed = ['.kml', '.gpx', '.geojson', '.json'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) cb(null, true);
    else cb(new Error(`Extensão não permitida: ${ext}.`));
  },
});

router.post('/convert', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Nenhum arquivo enviado.' });
    const { toFormat } = req.body;
    const content = req.file.buffer.toString('utf-8');
    const ext = path.extname(req.file.originalname).toLowerCase();
    const base = path.basename(req.file.originalname, ext);
    let result, outExt, mimeType;

    if ((ext === '.kml') && toFormat === 'geojson') {
      result = JSON.stringify(kmlToGeojson(content), null, 2);
      outExt = '.geojson'; mimeType = 'application/geo+json';
    } else if (ext === '.gpx' && toFormat === 'geojson') {
      result = JSON.stringify(gpxToGeojson(content), null, 2);
      outExt = '.geojson'; mimeType = 'application/geo+json';
    } else if ((ext === '.geojson' || ext === '.json') && toFormat === 'kml') {
      result = geojsonToKml(JSON.parse(content));
      outExt = '.kml'; mimeType = 'application/vnd.google-earth.kml+xml';
    } else {
      return res.status(400).json({ error: `Conversão não suportada: ${ext} → ${toFormat}` });
    }

    const filename = sanitizeFilename(`${base}${outExt}`);
    res.setHeader('Content-Type', `${mimeType}; charset=utf-8`);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(result);
  } catch (err) {
    console.error('[geo/convert]', err.message);
    res.status(422).json({ error: err.message });
  }
});

export default router;
