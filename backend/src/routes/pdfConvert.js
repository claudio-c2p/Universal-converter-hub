import express from 'express';
import multer from 'multer';
import { PDFDocument } from 'pdf-lib';
import { sanitizeFilename } from '../utils/fileUtils.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 50 * 1024 * 1024 } });

// PDF → METADADOS (JSON)
router.post('/pdf-to-metadata', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Nenhum arquivo enviado.' });
    const doc = await PDFDocument.load(req.file.buffer);
    const meta = {
      titulo:    doc.getTitle()    ?? null,
      autor:     doc.getAuthor()   ?? null,
      assunto:   doc.getSubject()  ?? null,
      criador:   doc.getCreator()  ?? null,
      produtor:  doc.getProducer() ?? null,
      palavras:  doc.getKeywords() ?? null,
      criado:    doc.getCreationDate()?.toISOString() ?? null,
      modificado:doc.getModificationDate()?.toISOString() ?? null,
      paginas:   doc.getPageCount(),
    };
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="${sanitizeFilename(req.file.originalname.replace(/\.pdf$/i, '_metadados.json'))}"`);
    res.send(JSON.stringify(meta, null, 2));
  } catch (err) { res.status(422).json({ error: err.message }); }
});

// PDF REPARAR
router.post('/pdf-repair', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Nenhum arquivo enviado.' });
    const doc = await PDFDocument.load(req.file.buffer, { ignoreEncryption: true });
    const out = await doc.save();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${sanitizeFilename('reparado_' + req.file.originalname)}"`);
    res.send(Buffer.from(out));
  } catch (err) { res.status(422).json({ error: err.message }); }
});

// INSERIR PÁGINAS
router.post('/pdf-insert-pages', upload.array('files', 2), async (req, res) => {
  try {
    if (!req.files || req.files.length < 2)
      return res.status(400).json({ error: 'Envie 2 PDFs: o base e o que será inserido.' });
    const position = parseInt(req.body.position ?? '0', 10);
    const base  = await PDFDocument.load(req.files[0].buffer);
    const extra = await PDFDocument.load(req.files[1].buffer);
    const merged = await PDFDocument.create();
    const basePages  = await merged.copyPages(base,  base.getPageIndices());
    const extraPages = await merged.copyPages(extra, extra.getPageIndices());
    const all = [...basePages];
    all.splice(position, 0, ...extraPages);
    all.forEach(p => merged.addPage(p));
    const out = await merged.save();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="com_paginas_inseridas.pdf"');
    res.send(Buffer.from(out));
  } catch (err) { res.status(422).json({ error: err.message }); }
});

export default router;
