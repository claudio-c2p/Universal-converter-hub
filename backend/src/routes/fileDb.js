import express from 'express';
import multer from 'multer';
import path from 'path';
import { sanitizeFilename } from '../utils/fileUtils.js';
import { sqliteToJson, sqliteToCsv, sqliteToSql } from '../converters/sqliteConverter.js';
import { dbfToJson, dbfToCsv, dbfToSql } from '../converters/dbfConverter.js';
import { vcfToJson, vcfToCsv, icsToJson, icsToCsv } from '../converters/contactsCalendarConverter.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

function sendText(res, content, mime, filename) {
  res.setHeader('Content-Type', `${mime}; charset=utf-8`);
  res.setHeader('Content-Disposition', `attachment; filename="${sanitizeFilename(filename)}"`);
  res.send(content);
}

// ── SQLite ──
router.post('/sqlite-to-json', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Nenhum arquivo enviado.' });
    const data = await sqliteToJson(req.file.buffer);
    sendText(res, JSON.stringify(data, null, 2), 'application/json', req.file.originalname.replace(/\.(db|sqlite3?)$/i, '.json'));
  } catch (err) { res.status(422).json({ error: err.message }); }
});

router.post('/sqlite-to-csv', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Nenhum arquivo enviado.' });
    const csv = await sqliteToCsv(req.file.buffer, req.body.tableName);
    sendText(res, csv, 'text/csv', req.file.originalname.replace(/\.(db|sqlite3?)$/i, '.csv'));
  } catch (err) { res.status(422).json({ error: err.message }); }
});

router.post('/sqlite-to-sql', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Nenhum arquivo enviado.' });
    const sql = await sqliteToSql(req.file.buffer);
    sendText(res, sql, 'text/plain', req.file.originalname.replace(/\.(db|sqlite3?)$/i, '.sql'));
  } catch (err) { res.status(422).json({ error: err.message }); }
});

// ── DBF ──
router.post('/dbf-to-json', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Nenhum arquivo enviado.' });
    const json = await dbfToJson(req.file.buffer);
    sendText(res, json, 'application/json', req.file.originalname.replace(/\.dbf$/i, '.json'));
  } catch (err) { res.status(422).json({ error: err.message }); }
});

router.post('/dbf-to-csv', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Nenhum arquivo enviado.' });
    const csv = await dbfToCsv(req.file.buffer);
    sendText(res, csv, 'text/csv', req.file.originalname.replace(/\.dbf$/i, '.csv'));
  } catch (err) { res.status(422).json({ error: err.message }); }
});

router.post('/dbf-to-sql', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Nenhum arquivo enviado.' });
    const sql = await dbfToSql(req.file.buffer, req.body.tableName || path.basename(req.file.originalname, '.dbf'));
    sendText(res, sql, 'text/plain', req.file.originalname.replace(/\.dbf$/i, '.sql'));
  } catch (err) { res.status(422).json({ error: err.message }); }
});

// ── Contatos (VCF) ──
router.post('/vcf-to-json', upload.single('file'), (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Nenhum arquivo enviado.' });
    const json = vcfToJson(req.file.buffer.toString('utf-8'));
    sendText(res, json, 'application/json', req.file.originalname.replace(/\.vcf$/i, '.json'));
  } catch (err) { res.status(422).json({ error: err.message }); }
});

router.post('/vcf-to-csv', upload.single('file'), (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Nenhum arquivo enviado.' });
    const csv = vcfToCsv(req.file.buffer.toString('utf-8'));
    sendText(res, csv, 'text/csv', req.file.originalname.replace(/\.vcf$/i, '.csv'));
  } catch (err) { res.status(422).json({ error: err.message }); }
});

// ── Calendário (ICS) ──
router.post('/ics-to-json', upload.single('file'), (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Nenhum arquivo enviado.' });
    const json = icsToJson(req.file.buffer.toString('utf-8'));
    sendText(res, json, 'application/json', req.file.originalname.replace(/\.ics$/i, '.json'));
  } catch (err) { res.status(422).json({ error: err.message }); }
});

router.post('/ics-to-csv', upload.single('file'), (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Nenhum arquivo enviado.' });
    const csv = icsToCsv(req.file.buffer.toString('utf-8'));
    sendText(res, csv, 'text/csv', req.file.originalname.replace(/\.ics$/i, '.csv'));
  } catch (err) { res.status(422).json({ error: err.message }); }
});

export default router;
