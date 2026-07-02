import express from 'express';
import multer from 'multer';
import { sanitizeFilename } from '../utils/fileUtils.js';
import { psdToPng, icoToPng, pngToIco, heicToJpg } from '../converters/imageExtraConverter.js';
import { htmlToPdf } from '../converters/htmlToPdfConverter.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 40 * 1024 * 1024 } });

router.post('/psd-to-png', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Nenhum arquivo enviado.' });
    const out = await psdToPng(req.file.buffer);
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Content-Disposition', `attachment; filename="${sanitizeFilename('convertido.png')}"`);
    res.send(out);
  } catch (err) {
    res.status(422).json({ error: err.message || 'Falha ao converter o PSD.' });
  }
});

router.post('/ico-to-png', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Nenhum arquivo enviado.' });
    const out = await icoToPng(req.file.buffer);
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Content-Disposition', `attachment; filename="${sanitizeFilename('convertido.png')}"`);
    res.send(out);
  } catch (err) {
    res.status(422).json({ error: err.message || 'Falha ao converter o ICO.' });
  }
});

router.post('/png-to-ico', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Nenhum arquivo enviado.' });
    const out = await pngToIco(req.file.buffer);
    res.setHeader('Content-Type', 'image/x-icon');
    res.setHeader('Content-Disposition', `attachment; filename="${sanitizeFilename('convertido.ico')}"`);
    res.send(out);
  } catch (err) {
    res.status(422).json({ error: err.message || 'Falha ao gerar o ICO.' });
  }
});

router.post('/heic-to-jpg', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Nenhum arquivo enviado.' });
    const out = await heicToJpg(req.file.buffer, req.body.quality ? Number(req.body.quality) : undefined);
    res.setHeader('Content-Type', 'image/jpeg');
    res.setHeader('Content-Disposition', `attachment; filename="${sanitizeFilename('convertido.jpg')}"`);
    res.send(out);
  } catch (err) {
    res.status(422).json({ error: err.message || 'Falha ao converter o HEIC.' });
  }
});

router.post('/html-to-pdf', express.json({ limit: '2mb' }), async (req, res) => {
  try {
    const { html } = req.body ?? {};
    const out = await htmlToPdf(html);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${sanitizeFilename('convertido.pdf')}"`);
    res.send(out);
  } catch (err) {
    res.status(422).json({ error: err.message || 'Falha ao gerar o PDF.' });
  }
});

export default router;
