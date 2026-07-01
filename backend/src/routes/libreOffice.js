import express from 'express';
import multer from 'multer';
import path from 'path';
import { sanitizeFilename } from '../utils/fileUtils.js';
import { convertWithLibreOffice } from '../converters/libreOfficeConverter.js';
import { translateExternalError } from '../utils/errorHandler.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 25 * 1024 * 1024 } });

const MIME = {
  pdf: 'application/pdf',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  doc: 'application/msword',
  odt: 'application/vnd.oasis.opendocument.text',
  rtf: 'application/rtf',
  epub: 'application/epub+zip',
  txt: 'text/plain',
  html: 'text/html',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  xls: 'application/vnd.ms-excel',
  ods: 'application/vnd.oasis.opendocument.spreadsheet',
  csv: 'text/csv',
  pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  ppt: 'application/vnd.ms-powerpoint',
  odp: 'application/vnd.oasis.opendocument.presentation',
  jpg: 'image/jpeg',
  png: 'image/png',
};

/** Endpoint genérico — recebe o arquivo e o formato de destino, delega ao LibreOffice headless. */
router.post('/libreoffice-convert', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Nenhum arquivo enviado.' });
    const { toFormat } = req.body;
    if (!toFormat) return res.status(400).json({ error: 'Parâmetro "toFormat" é obrigatório.' });
    const ext = path.extname(req.file.originalname).toLowerCase();
    const out = await convertWithLibreOffice(req.file.buffer, ext, toFormat.toLowerCase());
    const base = path.basename(req.file.originalname, ext);
    const filename = sanitizeFilename(`${base}.${toFormat.toLowerCase()}`);
    res.setHeader('Content-Type', MIME[toFormat.toLowerCase()] ?? 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(out);
  } catch (err) {
    console.error('[office/libreoffice-convert]', err.message);
    res.status(422).json({ error: translateExternalError(err.message) ?? err.message });
  }
});

// Atalhos nomeados (mesma lógica do endpoint genérico, só fixando o par de conversão —
// facilita o uso direto no frontend sem precisar mandar "toFormat" manualmente).
const SHORTCUTS = {
  'word-to-pdf':  { from: ['.docx', '.doc'], to: 'pdf' },
  'word-to-odt':  { from: ['.docx', '.doc'], to: 'odt' },
  'word-to-epub': { from: ['.docx', '.doc'], to: 'epub' },
  'word-to-rtf':  { from: ['.docx', '.doc'], to: 'rtf' },
  'excel-to-pdf': { from: ['.xlsx', '.xls'], to: 'pdf' },
  'excel-to-ods': { from: ['.xlsx', '.xls'], to: 'ods' },
  'ppt-to-pdf':   { from: ['.pptx', '.ppt'], to: 'pdf' },
  'ppt-to-jpg':   { from: ['.pptx', '.ppt'], to: 'jpg' },
  'ppt-to-png':   { from: ['.pptx', '.ppt'], to: 'png' },
  'ppt-to-html':  { from: ['.pptx', '.ppt'], to: 'html' },
  'odt-to-pdf':   { from: ['.odt'], to: 'pdf' },
  'odt-to-docx':  { from: ['.odt'], to: 'docx' },
  'odt-to-html':  { from: ['.odt'], to: 'html' },
  'odt-to-txt':   { from: ['.odt'], to: 'txt' },
  'odt-to-epub':  { from: ['.odt'], to: 'epub' },
  'ods-to-xlsx':  { from: ['.ods'], to: 'xlsx' },
  'ods-to-csv':   { from: ['.ods'], to: 'csv' },
  'ods-to-pdf':   { from: ['.ods'], to: 'pdf' },
  'odp-to-pptx':  { from: ['.odp'], to: 'pptx' },
  'odp-to-pdf':   { from: ['.odp'], to: 'pdf' },
};

for (const [route, { to }] of Object.entries(SHORTCUTS)) {
  router.post(`/${route}`, upload.single('file'), async (req, res) => {
    try {
      if (!req.file) return res.status(400).json({ error: 'Nenhum arquivo enviado.' });
      const ext = path.extname(req.file.originalname).toLowerCase();
      const out = await convertWithLibreOffice(req.file.buffer, ext, to);
      const base = path.basename(req.file.originalname, ext);
      res.setHeader('Content-Type', MIME[to] ?? 'application/octet-stream');
      res.setHeader('Content-Disposition', `attachment; filename="${sanitizeFilename(`${base}.${to}`)}"`);
      res.send(out);
    } catch (err) {
      console.error(`[office/${route}]`, err.message);
      res.status(422).json({ error: translateExternalError(err.message) ?? err.message });
    }
  });
}

export default router;
