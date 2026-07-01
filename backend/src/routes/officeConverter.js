import express from 'express';
import multer from 'multer';
import mammoth from 'mammoth';
import * as XLSX from 'xlsx';
import TurndownService from 'turndown';
import { sanitizeFilename } from '../utils/fileUtils.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 20 * 1024 * 1024 } });
const td = new TurndownService({ headingStyle: 'atx', bulletListMarker: '-' });

// WORD → HTML
router.post('/docx-to-html', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Nenhum arquivo enviado.' });
    const { value: html } = await mammoth.convertToHtml({ buffer: req.file.buffer });
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${sanitizeFilename(req.file.originalname.replace(/\.docx?$/i, '.html'))}"`);
    res.send(`<!DOCTYPE html><html lang="pt-BR"><meta charset="UTF-8"><body>${html}</body></html>`);
  } catch (err) { res.status(422).json({ error: err.message }); }
});

// WORD → MARKDOWN
router.post('/docx-to-md', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Nenhum arquivo enviado.' });
    const { value: html } = await mammoth.convertToHtml({ buffer: req.file.buffer });
    const md = td.turndown(html);
    res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${sanitizeFilename(req.file.originalname.replace(/\.docx?$/i, '.md'))}"`);
    res.send(md);
  } catch (err) { res.status(422).json({ error: err.message }); }
});

// EXCEL → CSV
router.post('/excel-to-csv', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Nenhum arquivo enviado.' });
    const wb = XLSX.read(req.file.buffer, { type: 'buffer' });
    const sheet = wb.Sheets[wb.SheetNames[0]];
    const csv = XLSX.utils.sheet_to_csv(sheet);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${sanitizeFilename(req.file.originalname.replace(/\.xlsx?$/i, '.csv'))}"`);
    res.send(csv);
  } catch (err) { res.status(422).json({ error: err.message }); }
});

// EXCEL → JSON
router.post('/excel-to-json', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Nenhum arquivo enviado.' });
    const wb = XLSX.read(req.file.buffer, { type: 'buffer' });
    const result = {};
    wb.SheetNames.forEach(name => { result[name] = XLSX.utils.sheet_to_json(wb.Sheets[name]); });
    const json = JSON.stringify(wb.SheetNames.length === 1 ? result[wb.SheetNames[0]] : result, null, 2);
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="${sanitizeFilename(req.file.originalname.replace(/\.xlsx?$/i, '.json'))}"`);
    res.send(json);
  } catch (err) { res.status(422).json({ error: err.message }); }
});

// EXCEL → HTML
router.post('/excel-to-html', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Nenhum arquivo enviado.' });
    const wb = XLSX.read(req.file.buffer, { type: 'buffer' });
    const sheet = wb.Sheets[wb.SheetNames[0]];
    const html = XLSX.utils.sheet_to_html(sheet);
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${sanitizeFilename(req.file.originalname.replace(/\.xlsx?$/i, '.html'))}"`);
    res.send(`<!DOCTYPE html><html lang="pt-BR"><meta charset="UTF-8"><style>table{border-collapse:collapse}td,th{border:1px solid #ccc;padding:6px 12px}</style><body>${html}</body></html>`);
  } catch (err) { res.status(422).json({ error: err.message }); }
});

// CSV → EXCEL
router.post('/csv-to-excel', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Nenhum arquivo enviado.' });
    const csv = req.file.buffer.toString('utf-8');
    const wb = XLSX.read(csv, { type: 'string' });
    const out = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${sanitizeFilename(req.file.originalname.replace(/\.csv$/i, '.xlsx'))}"`);
    res.send(out);
  } catch (err) { res.status(422).json({ error: err.message }); }
});

// CSV → JSON
router.post('/csv-to-json', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Nenhum arquivo enviado.' });
    const csv = req.file.buffer.toString('utf-8');
    const wb = XLSX.read(csv, { type: 'string' });
    const rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="${sanitizeFilename(req.file.originalname.replace(/\.csv$/i, '.json'))}"`);
    res.send(JSON.stringify(rows, null, 2));
  } catch (err) { res.status(422).json({ error: err.message }); }
});

// CSV → HTML
router.post('/csv-to-html', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Nenhum arquivo enviado.' });
    const csv = req.file.buffer.toString('utf-8');
    const wb = XLSX.read(csv, { type: 'string' });
    const html = XLSX.utils.sheet_to_html(wb.Sheets[wb.SheetNames[0]]);
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${sanitizeFilename(req.file.originalname.replace(/\.csv$/i, '.html'))}"`);
    res.send(`<!DOCTYPE html><html lang="pt-BR"><meta charset="UTF-8"><style>table{border-collapse:collapse;width:100%}td,th{border:1px solid #ccc;padding:6px 12px;text-align:left}th{background:#f5f5f5}</style><body>${html}</body></html>`);
  } catch (err) { res.status(422).json({ error: err.message }); }
});

// MARKDOWN → HTML
router.post('/md-to-html', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Nenhum arquivo enviado.' });
    const md = req.file.buffer.toString('utf-8');
    let html = md
      .replace(/^### (.+)$/gm, '<h3>$1</h3>')
      .replace(/^## (.+)$/gm, '<h2>$1</h2>')
      .replace(/^# (.+)$/gm, '<h1>$1</h1>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/`(.+?)`/g, '<code>$1</code>')
      .replace(/^\- (.+)$/gm, '<li>$1</li>')
      .replace(/(<li>[\s\S]+?<\/li>)/g, '<ul>$1</ul>')
      .replace(/\n\n/g, '</p><p>')
      .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>');
    html = `<p>${html}</p>`;
    const out = `<!DOCTYPE html><html lang="pt-BR"><meta charset="UTF-8"><style>body{font-family:sans-serif;max-width:800px;margin:2rem auto;padding:0 1rem;line-height:1.6}code{background:#f5f5f5;padding:2px 6px;border-radius:3px}</style><body>${html}</body></html>`;
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${sanitizeFilename(req.file.originalname.replace(/\.md$/i, '.html'))}"`);
    res.send(out);
  } catch (err) { res.status(422).json({ error: err.message }); }
});

// HTML → MARKDOWN
router.post('/html-to-md', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Nenhum arquivo enviado.' });
    const html = req.file.buffer.toString('utf-8');
    const md = td.turndown(html);
    res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${sanitizeFilename(req.file.originalname.replace(/\.html?$/i, '.md'))}"`);
    res.send(md);
  } catch (err) { res.status(422).json({ error: err.message }); }
});

// HTML → TXT
router.post('/html-to-txt', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Nenhum arquivo enviado.' });
    const html = req.file.buffer.toString('utf-8');
    const txt = html.replace(/<[^>]+>/g, '').replace(/\n{3,}/g, '\n\n').trim();
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${sanitizeFilename(req.file.originalname.replace(/\.html?$/i, '.txt'))}"`);
    res.send(txt);
  } catch (err) { res.status(422).json({ error: err.message }); }
});

// JSON → CSV
router.post('/json-to-csv', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Nenhum arquivo enviado.' });
    const data = JSON.parse(req.file.buffer.toString('utf-8'));
    const arr = Array.isArray(data) ? data : [data];
    const ws = XLSX.utils.json_to_sheet(arr);
    const csv = XLSX.utils.sheet_to_csv(ws);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${sanitizeFilename(req.file.originalname.replace(/\.json$/i, '.csv'))}"`);
    res.send(csv);
  } catch (err) { res.status(422).json({ error: err.message }); }
});

// JSON → EXCEL
router.post('/json-to-excel', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Nenhum arquivo enviado.' });
    const data = JSON.parse(req.file.buffer.toString('utf-8'));
    const arr = Array.isArray(data) ? data : [data];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(arr), 'Dados');
    const out = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${sanitizeFilename(req.file.originalname.replace(/\.json$/i, '.xlsx'))}"`);
    res.send(out);
  } catch (err) { res.status(422).json({ error: err.message }); }
});

// TXT → HTML
router.post('/txt-to-html', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Nenhum arquivo enviado.' });
    const txt = req.file.buffer.toString('utf-8');
    const html = txt.split('\n').map(l => `<p>${l.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}</p>`).join('\n');
    const out = `<!DOCTYPE html><html lang="pt-BR"><meta charset="UTF-8"><style>body{font-family:sans-serif;max-width:800px;margin:2rem auto;padding:0 1rem;line-height:1.8}</style><body>${html}</body></html>`;
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${sanitizeFilename(req.file.originalname.replace(/\.txt$/i, '.html'))}"`);
    res.send(out);
  } catch (err) { res.status(422).json({ error: err.message }); }
});

// WORD → TXT
router.post('/docx-to-txt', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Nenhum arquivo enviado.' });
    const { value: html } = await mammoth.convertToHtml({ buffer: req.file.buffer });
    const txt = html.replace(/<[^>]+>/g, '').replace(/\n{3,}/g, '\n\n').trim();
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${sanitizeFilename(req.file.originalname.replace(/\.docx?$/i, '.txt'))}"`);
    res.send(txt);
  } catch (err) { res.status(422).json({ error: err.message }); }
});

// RTF → TXT
router.post('/rtf-to-txt', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Nenhum arquivo enviado.' });
    const rtf = req.file.buffer.toString('latin1');
    const txt = rtf
      .replace(/\{[^{}]*\}/g, '')
      .replace(/\\[a-z]+\d* ?/gi, '')
      .replace(/[{}\\]/g, '')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${sanitizeFilename(req.file.originalname.replace(/\.rtf$/i, '.txt'))}"`);
    res.send(txt);
  } catch (err) { res.status(422).json({ error: err.message }); }
});

export default router;
