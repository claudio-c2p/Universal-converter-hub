import express from 'express';
import multer from 'multer';
import { sanitizeFilename } from '../utils/fileUtils.js';
import {
  csvToSqlDump,
  excelToSqlite,
  sqliteToExcel,
  excelToXml,
} from '../converters/dataToolsConverter.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 30 * 1024 * 1024 } });

router.post('/csv-to-sql', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Nenhum arquivo enviado.' });
    const { tableName } = req.body;
    const sql = csvToSqlDump(req.file.buffer.toString('utf8'), tableName || 'dados');
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${sanitizeFilename('insert.sql')}"`);
    res.send(sql);
  } catch (err) {
    res.status(422).json({ error: err.message });
  }
});

router.post('/excel-to-sqlite', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Nenhum arquivo enviado.' });
    const out = await excelToSqlite(req.file.buffer, req.body.tableName || 'dados');
    res.setHeader('Content-Disposition', `attachment; filename="${sanitizeFilename('dados.sqlite')}"`);
    res.send(out);
  } catch (err) {
    res.status(422).json({ error: err.message });
  }
});

router.post('/sqlite-to-excel', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Nenhum arquivo enviado.' });
    const out = await sqliteToExcel(req.file.buffer);
    res.setHeader('Content-Disposition', `attachment; filename="${sanitizeFilename('dados.xlsx')}"`);
    res.send(out);
  } catch (err) {
    res.status(422).json({ error: err.message });
  }
});

router.post('/excel-to-xml', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Nenhum arquivo enviado.' });
    const out = excelToXml(req.file.buffer);
    res.setHeader('Content-Type', 'application/xml');
    res.setHeader('Content-Disposition', `attachment; filename="${sanitizeFilename('dados.xml')}"`);
    res.send(out);
  } catch (err) {
    res.status(422).json({ error: err.message });
  }
});

export default router;
