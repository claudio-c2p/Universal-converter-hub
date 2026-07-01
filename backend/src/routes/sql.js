import express from 'express';
import multer from 'multer';
import path from 'path';
import { sqlDumpToJson, sqlDumpToCsv, jsonToSqlInserts } from '../converters/sqlConverter.js';
import { jsonToCreateTable, csvToCreateTable } from '../converters/schemaInferrer.js';
import { sanitizeFilename } from '../utils/fileUtils.js';

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ['.sql', '.json', '.csv', '.txt'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) cb(null, true);
    else cb(new Error(`Extensão não permitida: ${ext}.`));
  },
});

router.post('/convert', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Nenhum arquivo enviado.' });
    const { toFormat, tableName = 'tabela' } = req.body;
    const content = req.file.buffer.toString('utf-8');
    const ext     = path.extname(req.file.originalname).toLowerCase();
    const base    = path.basename(req.file.originalname, ext);
    let result, outExt, mime;

    if (ext === '.sql' && toFormat === 'json') {
      result = JSON.stringify(sqlDumpToJson(content, tableName), null, 2);
      outExt = '.json'; mime = 'application/json';
    } else if (ext === '.sql' && toFormat === 'csv') {
      result = sqlDumpToCsv(content, tableName);
      outExt = '.csv'; mime = 'text/csv';
    } else if (ext === '.json' && toFormat === 'sql') {
      const rows = JSON.parse(content);
      result = jsonToSqlInserts(tableName, Array.isArray(rows) ? rows : [rows]);
      outExt = '.sql'; mime = 'text/plain';
    } else if (ext === '.json' && toFormat === 'create-table') {
      result = jsonToCreateTable(content, tableName);
      outExt = '.sql'; mime = 'text/plain';
    } else if (ext === '.csv' && toFormat === 'create-table') {
      result = csvToCreateTable(content, tableName);
      outExt = '.sql'; mime = 'text/plain';
    } else if (ext === '.csv' && toFormat === 'sql') {
      const Papa = (await import('papaparse')).default;
      const parsed = Papa.parse(content, { header: true, skipEmptyLines: true });
      if (parsed.errors?.length) throw new Error(`CSV inválido: ${parsed.errors[0].message}`);
      result = jsonToSqlInserts(tableName, parsed.data);
      outExt = '.sql'; mime = 'text/plain';
    } else {
      return res.status(400).json({ error: `Conversão não suportada: ${ext} → ${toFormat}` });
    }

    const filename = sanitizeFilename(`${base}${outExt}`);
    res.setHeader('Content-Type', `${mime}; charset=utf-8`);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(result);
  } catch (err) {
    console.error('[sql/convert]', err.message);
    res.status(422).json({ error: err.message });
  }
});

export default router;
