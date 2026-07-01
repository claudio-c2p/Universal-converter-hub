import express from 'express';
import multer from 'multer';
import path from 'path';
import { findAndReplace, previewMatches } from '../converters/findReplaceConverter.js';
import { sanitizeFilename } from '../utils/fileUtils.js';

const router = express.Router();
const TEXT_EXTS = ['.txt', '.md', '.json', '.xml', '.yaml', '.yml', '.csv', '.html', '.js', '.ts', '.py', '.sql', '.toml', '.ini', '.env'];

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ext = file.originalname.slice(file.originalname.lastIndexOf('.')).toLowerCase();
    if (TEXT_EXTS.includes(ext)) cb(null, true);
    else cb(new Error(`Extensão não permitida: ${ext}.`));
  },
});

// POST /api/find-replace/preview — retorna ocorrências sem modificar o arquivo
router.post('/preview', upload.single('file'), (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Nenhum arquivo enviado.' });
    const { searchTerm, search, useRegex = 'false', caseSensitive = 'true' } = req.body;
    const term = searchTerm || search; // aceita os dois nomes para compatibilidade
    if (!term) return res.status(400).json({ error: 'Parâmetro "searchTerm" obrigatório.' });

    const content = req.file.buffer.toString('utf-8');
    const matches = previewMatches(content, term, {
      useRegex:      useRegex === 'true',
      caseSensitive: caseSensitive === 'true',
    });
    res.json({ total: matches.length, matches });
  } catch (err) {
    console.error('[find-replace/preview]', err.message);
    res.status(422).json({ error: err.message });
  }
});

// POST /api/find-replace/apply — aplica substituição e retorna arquivo modificado
router.post('/apply', upload.single('file'), (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Nenhum arquivo enviado.' });
    // Aceita tanto "search" (nome atual) quanto "searchTerm" (nome do prompt v2)
    const { search, searchTerm, replace = '', replacement = '', useRegex = 'false', caseSensitive = 'true', wholeWord = 'false' } = req.body;
    const term        = searchTerm || search;
    const replaceWith = replacement || replace;
    if (!term) return res.status(400).json({ error: 'Parâmetro "search" obrigatório.' });

    const content = req.file.buffer.toString('utf-8');
    const { result, count } = findAndReplace(content, term, replaceWith, {
      useRegex:      useRegex === 'true',
      caseSensitive: caseSensitive === 'true',
      wholeWord:     wholeWord === 'true',
    });

    if (count === 0) {
      return res.status(200).json({ noMatches: true, message: 'Nenhuma ocorrência encontrada.' });
    }

    const ext      = path.extname(req.file.originalname);
    const base     = path.basename(req.file.originalname, ext);
    const filename = sanitizeFilename(`${base}_modificado${ext}`);
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('X-Replacements-Count', String(count));
    res.send(result);
  } catch (err) {
    console.error('[findReplace/apply]', err.message);
    res.status(422).json({ error: err.message });
  }
});

export default router;
