import express from 'express';
import multer from 'multer';
import yaml from 'js-yaml';
import TOML from '@iarna/toml';
import { XMLBuilder, XMLParser } from 'fast-xml-parser';
import { sanitizeFilename } from '../utils/fileUtils.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

// JSON → YAML
router.post('/json-to-yaml', upload.single('file'), (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Nenhum arquivo enviado.' });
    const data = JSON.parse(req.file.buffer.toString('utf-8'));
    res.setHeader('Content-Type', 'text/yaml; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${sanitizeFilename(req.file.originalname.replace(/\.json$/i, '.yaml'))}"`);
    res.send(yaml.dump(data, { indent: 2 }));
  } catch (err) { res.status(422).json({ error: err.message }); }
});

// YAML → JSON
router.post('/yaml-to-json', upload.single('file'), (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Nenhum arquivo enviado.' });
    const data = yaml.load(req.file.buffer.toString('utf-8'));
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="${sanitizeFilename(req.file.originalname.replace(/\.ya?ml$/i, '.json'))}"`);
    res.send(JSON.stringify(data, null, 2));
  } catch (err) { res.status(422).json({ error: err.message }); }
});

// YAML → TOML
router.post('/yaml-to-toml', upload.single('file'), (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Nenhum arquivo enviado.' });
    const data = yaml.load(req.file.buffer.toString('utf-8'));
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${sanitizeFilename(req.file.originalname.replace(/\.ya?ml$/i, '.toml'))}"`);
    res.send(TOML.stringify(data));
  } catch (err) { res.status(422).json({ error: err.message }); }
});

// YAML → XML
router.post('/yaml-to-xml', upload.single('file'), (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Nenhum arquivo enviado.' });
    const data = yaml.load(req.file.buffer.toString('utf-8'));
    const builder = new XMLBuilder({ format: true, indentBy: '  ' });
    const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<root>${builder.build(data)}</root>`;
    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${sanitizeFilename(req.file.originalname.replace(/\.ya?ml$/i, '.xml'))}"`);
    res.send(xml);
  } catch (err) { res.status(422).json({ error: err.message }); }
});

// TOML → JSON
router.post('/toml-to-json', upload.single('file'), (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Nenhum arquivo enviado.' });
    const data = TOML.parse(req.file.buffer.toString('utf-8'));
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="${sanitizeFilename(req.file.originalname.replace(/\.toml$/i, '.json'))}"`);
    res.send(JSON.stringify(data, null, 2));
  } catch (err) { res.status(422).json({ error: err.message }); }
});

// TOML → YAML
router.post('/toml-to-yaml', upload.single('file'), (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Nenhum arquivo enviado.' });
    const data = TOML.parse(req.file.buffer.toString('utf-8'));
    res.setHeader('Content-Type', 'text/yaml; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${sanitizeFilename(req.file.originalname.replace(/\.toml$/i, '.yaml'))}"`);
    res.send(yaml.dump(data, { indent: 2 }));
  } catch (err) { res.status(422).json({ error: err.message }); }
});

// TOML → XML
router.post('/toml-to-xml', upload.single('file'), (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Nenhum arquivo enviado.' });
    const data = TOML.parse(req.file.buffer.toString('utf-8'));
    const builder = new XMLBuilder({ format: true, indentBy: '  ' });
    const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<root>${builder.build(data)}</root>`;
    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${sanitizeFilename(req.file.originalname.replace(/\.toml$/i, '.xml'))}"`);
    res.send(xml);
  } catch (err) { res.status(422).json({ error: err.message }); }
});

// JSON → XML
router.post('/json-to-xml', upload.single('file'), (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Nenhum arquivo enviado.' });
    const data = JSON.parse(req.file.buffer.toString('utf-8'));
    const builder = new XMLBuilder({ format: true, indentBy: '  ' });
    const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<root>${builder.build(data)}</root>`;
    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${sanitizeFilename(req.file.originalname.replace(/\.json$/i, '.xml'))}"`);
    res.send(xml);
  } catch (err) { res.status(422).json({ error: err.message }); }
});

// XML → YAML
router.post('/xml-to-yaml', upload.single('file'), (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Nenhum arquivo enviado.' });
    const parser = new XMLParser({ ignoreAttributes: false });
    const data = parser.parse(req.file.buffer.toString('utf-8'));
    res.setHeader('Content-Type', 'text/yaml; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${sanitizeFilename(req.file.originalname.replace(/\.xml$/i, '.yaml'))}"`);
    res.send(yaml.dump(data, { indent: 2 }));
  } catch (err) { res.status(422).json({ error: err.message }); }
});

// JSON → TOML
router.post('/json-to-toml', upload.single('file'), (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Nenhum arquivo enviado.' });
    const data = JSON.parse(req.file.buffer.toString('utf-8'));
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${sanitizeFilename(req.file.originalname.replace(/\.json$/i, '.toml'))}"`);
    res.send(TOML.stringify(data));
  } catch (err) { res.status(422).json({ error: err.message }); }
});

export default router;

// ── Novas conversões (lote 1, sem binários externos) ──
import Papa from 'papaparse';
import XLSX from 'xlsx';
import { rowsToPdf, jsonToRows } from '../converters/tablePdfConverter.js';

// JSON → PDF
router.post('/json-to-pdf', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Nenhum arquivo enviado.' });
    const data = JSON.parse(req.file.buffer.toString('utf-8'));
    const rows = jsonToRows(data);
    const pdfBytes = await rowsToPdf(rows, 'Dados JSON');
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${sanitizeFilename(req.file.originalname.replace(/\.json$/i, '.pdf'))}"`);
    res.send(Buffer.from(pdfBytes));
  } catch (err) { res.status(422).json({ error: err.message }); }
});

// CSV → PDF
router.post('/csv-to-pdf', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Nenhum arquivo enviado.' });
    const parsed = Papa.parse(req.file.buffer.toString('utf-8'), { header: true, skipEmptyLines: true });
    if (parsed.errors?.length) {
      throw new Error(`CSV inválido: ${parsed.errors[0].message}`);
    }
    const pdfBytes = await rowsToPdf(parsed.data, 'Dados CSV');
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${sanitizeFilename(req.file.originalname.replace(/\.csv$/i, '.pdf'))}"`);
    res.send(Buffer.from(pdfBytes));
  } catch (err) { res.status(422).json({ error: err.message }); }
});

// XML → Excel
router.post('/xml-to-excel', upload.single('file'), (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Nenhum arquivo enviado.' });
    const parser = new XMLParser({ ignoreAttributes: false });
    const data = parser.parse(req.file.buffer.toString('utf-8'));
    const rows = jsonToRows(data);
    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Dados');
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${sanitizeFilename(req.file.originalname.replace(/\.xml$/i, '.xlsx'))}"`);
    res.send(buffer);
  } catch (err) { res.status(422).json({ error: err.message }); }
});

// XML → PDF
router.post('/xml-to-pdf', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Nenhum arquivo enviado.' });
    const parser = new XMLParser({ ignoreAttributes: false });
    const data = parser.parse(req.file.buffer.toString('utf-8'));
    const rows = jsonToRows(data);
    const pdfBytes = await rowsToPdf(rows, 'Dados XML');
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${sanitizeFilename(req.file.originalname.replace(/\.xml$/i, '.pdf'))}"`);
    res.send(Buffer.from(pdfBytes));
  } catch (err) { res.status(422).json({ error: err.message }); }
});
