import express from 'express';
import multer from 'multer';
import path from 'path';
import { sanitizeFilename } from '../utils/fileUtils.js';
import {
  removePdfPassword, epsOrPsToPdf, toPngWithGhostscript,
  imageToText, imageToSearchablePdf,
} from '../converters/binaryToolsConverter.js';
import { translateExternalError } from '../utils/errorHandler.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 20 * 1024 * 1024 } });

function sendBinary(res, buffer, mime, filename) {
  res.setHeader('Content-Type', mime);
  res.setHeader('Content-Disposition', `attachment; filename="${sanitizeFilename(filename)}"`);
  res.send(buffer);
}

// ── PDF: remover senha (decrypt real via qpdf) ──
router.post('/pdf-remove-password', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Nenhum arquivo enviado.' });
    const out = await removePdfPassword(req.file.buffer, req.body.password ?? '');
    sendBinary(res, out, 'application/pdf', req.file.originalname.replace(/\.pdf$/i, '_sem_senha.pdf'));
  } catch (err) { res.status(422).json({ error: translateExternalError(err.message) ?? err.message }); }
});

// ── EPS/PS → PDF (Ghostscript) ──
router.post('/eps-to-pdf', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Nenhum arquivo enviado.' });
    const ext = path.extname(req.file.originalname).toLowerCase();
    if (!['.eps', '.ps'].includes(ext)) return res.status(400).json({ error: 'Envie um arquivo .eps ou .ps.' });
    const out = await epsOrPsToPdf(req.file.buffer, ext);
    sendBinary(res, out, 'application/pdf', req.file.originalname.replace(/\.(eps|ps)$/i, '.pdf'));
  } catch (err) { res.status(422).json({ error: translateExternalError(err.message) ?? err.message }); }
});

// ── EPS/PS → PNG (Ghostscript) ──
router.post('/eps-to-png', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Nenhum arquivo enviado.' });
    const ext = path.extname(req.file.originalname).toLowerCase();
    if (!['.eps', '.ps'].includes(ext)) return res.status(400).json({ error: 'Envie um arquivo .eps ou .ps.' });
    const out = await toPngWithGhostscript(req.file.buffer, ext);
    sendBinary(res, out, 'image/png', req.file.originalname.replace(/\.(eps|ps)$/i, '.png'));
  } catch (err) { res.status(422).json({ error: translateExternalError(err.message) ?? err.message }); }
});

// ── OCR: imagem → texto ──
router.post('/ocr-to-text', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Nenhum arquivo enviado.' });
    const ext = path.extname(req.file.originalname).toLowerCase() || '.png';
    const lang = req.body.lang || 'por+eng';
    const text = await imageToText(req.file.buffer, ext, lang);
    sendBinary(res, text, 'text/plain; charset=utf-8', req.file.originalname.replace(/\.\w+$/i, '.txt'));
  } catch (err) { res.status(422).json({ error: translateExternalError(err.message) ?? err.message }); }
});

// ── OCR: imagem → PDF pesquisável ──
router.post('/ocr-to-searchable-pdf', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Nenhum arquivo enviado.' });
    const ext = path.extname(req.file.originalname).toLowerCase() || '.png';
    const lang = req.body.lang || 'por+eng';
    const out = await imageToSearchablePdf(req.file.buffer, ext, lang);
    sendBinary(res, out, 'application/pdf', req.file.originalname.replace(/\.\w+$/i, '.pdf'));
  } catch (err) { res.status(422).json({ error: translateExternalError(err.message) ?? err.message }); }
});

export default router;
