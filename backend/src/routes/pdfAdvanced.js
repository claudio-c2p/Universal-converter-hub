import express from 'express';
import multer from 'multer';
import { sanitizeFilename } from '../utils/fileUtils.js';
import { diffStats } from '../converters/diffConverter.js';
import {
  cropPdf,
  fillPdfForm,
  signPdfVisual,
  redactPdf,
  comparePdfs,
} from '../converters/pdfAdvancedConverter.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 40 * 1024 * 1024 } });

function sendPdf(res, buffer, filename) {
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${sanitizeFilename(filename)}"`);
  res.send(Buffer.from(buffer));
}

router.post('/crop', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Nenhum arquivo enviado.' });
    const { top, right, bottom, left } = req.body;
    const out = await cropPdf(req.file.buffer, {
      top: Number(top) || 0, right: Number(right) || 0, bottom: Number(bottom) || 0, left: Number(left) || 0,
    });
    sendPdf(res, out, 'recortado.pdf');
  } catch (err) {
    res.status(422).json({ error: err.message || 'Falha ao recortar o PDF.' });
  }
});

router.post('/fill-form', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Nenhum arquivo enviado.' });
    let fieldValues = {};
    try {
      fieldValues = req.body.fields ? JSON.parse(req.body.fields) : {};
    } catch {
      return res.status(400).json({ error: 'Campo "fields" deve ser um JSON válido: {"nomeDoCampo": "valor"}.' });
    }
    const out = await fillPdfForm(req.file.buffer, fieldValues, { flatten: req.body.flatten !== 'false' });
    sendPdf(res, out, 'preenchido.pdf');
  } catch (err) {
    res.status(422).json({ error: err.message || 'Falha ao preencher o formulário.' });
  }
});

router.post('/sign', upload.fields([{ name: 'file', maxCount: 1 }, { name: 'signature', maxCount: 1 }]), async (req, res) => {
  try {
    const file = req.files?.file?.[0];
    const signature = req.files?.signature?.[0];
    if (!file) return res.status(400).json({ error: 'Nenhum PDF enviado.' });
    if (!signature) return res.status(400).json({ error: 'Nenhuma imagem de assinatura enviada.' });
    const { pageIndex, x, y, width, height } = req.body;
    const out = await signPdfVisual(file.buffer, {
      pageIndex: Number(pageIndex) || 0,
      x: Number(x) || 50,
      y: Number(y) || 50,
      width: Number(width) || 150,
      height: Number(height) || 60,
      signatureImageBuffer: signature.buffer,
    });
    sendPdf(res, out, 'assinado.pdf');
  } catch (err) {
    res.status(422).json({ error: err.message || 'Falha ao assinar o PDF.' });
  }
});

router.post('/redact', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Nenhum arquivo enviado.' });
    let rects = [];
    try {
      rects = req.body.rects ? JSON.parse(req.body.rects) : [];
    } catch {
      return res.status(400).json({ error: 'Campo "rects" deve ser um JSON válido: [{"x":..,"y":..,"width":..,"height":..}].' });
    }
    const out = await redactPdf(req.file.buffer, { pageIndex: Number(req.body.pageIndex) || 0, rects });
    sendPdf(res, out, 'censurado.pdf');
  } catch (err) {
    res.status(422).json({ error: err.message || 'Falha ao censurar o PDF.' });
  }
});

// Retorna o mesmo formato de /api/diff/compare, para reaproveitar o DiffViewer no frontend
router.post('/compare', upload.fields([{ name: 'fileA', maxCount: 1 }, { name: 'fileB', maxCount: 1 }]), async (req, res) => {
  try {
    const fileA = req.files?.fileA?.[0];
    const fileB = req.files?.fileB?.[0];
    if (!fileA) return res.status(400).json({ error: 'PDF A não enviado.' });
    if (!fileB) return res.status(400).json({ error: 'PDF B não enviado.' });

    const parts = await comparePdfs(fileA.buffer, fileB.buffer);
    const stats = diffStats(parts);

    res.json({
      filenameA: fileA.originalname,
      filenameB: fileB.originalname,
      stats,
      diffs: parts.map((p) => ({ value: p.value, added: p.added ?? false, removed: p.removed ?? false })),
    });
  } catch (err) {
    res.status(422).json({ error: err.message || 'Falha ao comparar os PDFs.' });
  }
});

export default router;
