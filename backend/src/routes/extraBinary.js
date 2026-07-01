import express from 'express';
import multer from 'multer';
import path from 'path';
import { sanitizeFilename } from '../utils/fileUtils.js';
import {
  convertEbook, mdbListTables, mdbTableToCsv, mdbTableToSql, mdbTableToExcelBuffer,
  texToFormat, texToPdf, convertMedia,
} from '../converters/extraBinaryConverter.js';
import { translateExternalError } from '../utils/errorHandler.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 40 * 1024 * 1024 } });

const MIME = {
  epub: 'application/epub+zip', mobi: 'application/x-mobipocket-ebook',
  azw3: 'application/vnd.amazon.ebook', pdf: 'application/pdf',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  txt: 'text/plain', html: 'text/html', md: 'text/markdown',
  csv: 'text/csv', json: 'application/json',
  mp3: 'audio/mpeg', wav: 'audio/wav', ogg: 'audio/ogg', m4a: 'audio/mp4',
  mp4: 'video/mp4', webm: 'video/webm', avi: 'video/x-msvideo', mov: 'video/quicktime',
};

// ── eBooks (Calibre) — endpoint genérico ──
router.post('/ebook-convert', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Nenhum arquivo enviado.' });
    const { toFormat } = req.body;
    if (!toFormat) return res.status(400).json({ error: 'Parâmetro "toFormat" é obrigatório.' });
    const ext = path.extname(req.file.originalname).toLowerCase();
    const out = await convertEbook(req.file.buffer, ext, toFormat.toLowerCase());
    const base = path.basename(req.file.originalname, ext);
    res.setHeader('Content-Type', MIME[toFormat.toLowerCase()] ?? 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${sanitizeFilename(`${base}.${toFormat.toLowerCase()}`)}"`);
    res.send(out);
  } catch (err) {
    console.error('[ebooks/ebook-convert]', err.message);
    res.status(422).json({ error: translateExternalError(err.message) ?? err.message });
  }
});

// Atalhos nomeados para os pares de eBook mais comuns (cobre seção 2.3 do escopo do cliente)
const EBOOK_SHORTCUTS = {
  'epub-to-pdf': 'pdf', 'epub-to-docx': 'docx', 'epub-to-html': 'html', 'epub-to-txt': 'txt',
  'epub-to-mobi': 'mobi', 'epub-to-azw3': 'azw3',
  'mobi-to-epub': 'epub', 'mobi-to-pdf': 'pdf', 'mobi-to-docx': 'docx',
  'azw3-to-epub': 'epub', 'azw3-to-pdf': 'pdf', 'azw3-to-docx': 'docx',
  'fb2-to-epub': 'epub', 'fb2-to-pdf': 'pdf', 'fb2-to-mobi': 'mobi',
  'cbr-to-pdf': 'pdf', 'cbr-to-epub': 'epub', 'cbz-to-pdf': 'pdf', 'cbz-to-epub': 'epub',
  'djvu-to-pdf': 'pdf', 'djvu-to-txt': 'txt', 'chm-to-pdf': 'pdf', 'chm-to-epub': 'epub',
};
for (const [route, to] of Object.entries(EBOOK_SHORTCUTS)) {
  router.post(`/${route}`, upload.single('file'), async (req, res) => {
    try {
      if (!req.file) return res.status(400).json({ error: 'Nenhum arquivo enviado.' });
      const ext = path.extname(req.file.originalname).toLowerCase();
      const out = await convertEbook(req.file.buffer, ext, to);
      const base = path.basename(req.file.originalname, ext);
      res.setHeader('Content-Type', MIME[to] ?? 'application/octet-stream');
      res.setHeader('Content-Disposition', `attachment; filename="${sanitizeFilename(`${base}.${to}`)}"`);
      res.send(out);
    } catch (err) {
      console.error(`[ebooks/${route}]`, err.message);
      res.status(422).json({ error: translateExternalError(err.message) ?? err.message });
    }
  });
}

// ── Access / MDB (mdbtools) ──
router.post('/mdb-tables', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Nenhum arquivo enviado.' });
    const tables = await mdbListTables(req.file.buffer);
    res.json({ tables });
  } catch (err) { res.status(422).json({ error: translateExternalError(err.message) ?? err.message }); }
});

router.post('/mdb-to-csv', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Nenhum arquivo enviado.' });
    const csv = await mdbTableToCsv(req.file.buffer, req.body.tableName);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${sanitizeFilename(req.file.originalname.replace(/\.mdb$/i, '.csv'))}"`);
    res.send(csv);
  } catch (err) { res.status(422).json({ error: translateExternalError(err.message) ?? err.message }); }
});

router.post('/mdb-to-sql', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Nenhum arquivo enviado.' });
    const sql = await mdbTableToSql(req.file.buffer, req.body.tableName);
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${sanitizeFilename(req.file.originalname.replace(/\.mdb$/i, '.sql'))}"`);
    res.send(sql);
  } catch (err) { res.status(422).json({ error: translateExternalError(err.message) ?? err.message }); }
});

router.post('/mdb-to-excel', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Nenhum arquivo enviado.' });
    const xlsx = await mdbTableToExcelBuffer(req.file.buffer, req.body.tableName);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${sanitizeFilename(req.file.originalname.replace(/\.mdb$/i, '.xlsx'))}"`);
    res.send(xlsx);
  } catch (err) { res.status(422).json({ error: translateExternalError(err.message) ?? err.message }); }
});

// ── LaTeX (Pandoc + pdflatex) ──
router.post('/tex-to-pdf', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Nenhum arquivo enviado.' });
    const out = await texToPdf(req.file.buffer.toString('utf-8'));
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${sanitizeFilename(req.file.originalname.replace(/\.tex$/i, '.pdf'))}"`);
    res.send(out);
  } catch (err) { res.status(422).json({ error: translateExternalError(err.message) ?? err.message }); }
});

router.post('/tex-to-html', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Nenhum arquivo enviado.' });
    const out = await texToFormat(req.file.buffer.toString('utf-8'), 'html');
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${sanitizeFilename(req.file.originalname.replace(/\.tex$/i, '.html'))}"`);
    res.send(out);
  } catch (err) { res.status(422).json({ error: translateExternalError(err.message) ?? err.message }); }
});

router.post('/tex-to-markdown', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Nenhum arquivo enviado.' });
    const out = await texToFormat(req.file.buffer.toString('utf-8'), 'markdown');
    res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${sanitizeFilename(req.file.originalname.replace(/\.tex$/i, '.md'))}"`);
    res.send(out);
  } catch (err) { res.status(422).json({ error: translateExternalError(err.message) ?? err.message }); }
});

router.post('/tex-to-docx', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Nenhum arquivo enviado.' });
    const out = await texToFormat(req.file.buffer.toString('utf-8'), 'docx');
    res.setHeader('Content-Type', MIME.docx);
    res.setHeader('Content-Disposition', `attachment; filename="${sanitizeFilename(req.file.originalname.replace(/\.tex$/i, '.docx'))}"`);
    res.send(out);
  } catch (err) { res.status(422).json({ error: translateExternalError(err.message) ?? err.message }); }
});

// ── Áudio / Vídeo (FFmpeg) — categoria extra sugerida na seção 13 do escopo ──
router.post('/media-convert', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Nenhum arquivo enviado.' });
    const { toFormat } = req.body;
    if (!toFormat) return res.status(400).json({ error: 'Parâmetro "toFormat" é obrigatório.' });
    const ext = path.extname(req.file.originalname).toLowerCase();
    const out = await convertMedia(req.file.buffer, ext, `.${toFormat.toLowerCase()}`);
    const base = path.basename(req.file.originalname, ext);
    res.setHeader('Content-Type', MIME[toFormat.toLowerCase()] ?? 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${sanitizeFilename(`${base}.${toFormat.toLowerCase()}`)}"`);
    res.send(out);
  } catch (err) {
    console.error('[ebooks/media-convert]', err.message);
    res.status(422).json({ error: translateExternalError(err.message) ?? err.message });
  }
});

export default router;
