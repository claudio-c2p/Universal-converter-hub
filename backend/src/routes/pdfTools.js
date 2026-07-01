// ARQUIVO: backend/src/routes/pdfTools.js
import express from 'express';
import multer from 'multer';
import archiver from 'archiver';
import { PDFDocument, degrees, rgb, StandardFonts } from 'pdf-lib';
import sharp from 'sharp';
import { sanitizeFilename } from '../utils/fileUtils.js';

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.originalname.toLowerCase().endsWith('.pdf')) cb(null, true);
    else cb(new Error('Apenas arquivos .pdf são aceitos.'));
  },
});

const uploadAny = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 },
});

// ── MESCLAR ──────────────────────────────────────────────────────────────────
router.post('/merge', upload.array('files', 20), async (req, res) => {
  try {
    if (!req.files || req.files.length < 2)
      return res.status(400).json({ error: 'Envie pelo menos 2 arquivos PDF.' });

    const merged = await PDFDocument.create();
    for (const file of req.files) {
      const doc = await PDFDocument.load(file.buffer);
      const pages = await merged.copyPages(doc, doc.getPageIndices());
      pages.forEach((p) => merged.addPage(p));
    }
    const out = await merged.save();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="merged.pdf"');
    res.send(Buffer.from(out));
  } catch (err) {
    res.status(422).json({ error: err.message });
  }
});

// ── DIVIDIR ───────────────────────────────────────────────────────────────────
router.post('/split', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Nenhum arquivo enviado.' });
    const doc = await PDFDocument.load(req.file.buffer);
    const total = doc.getPageCount();
    const { mode, pages: pagesParam } = req.body;

    let pageIndices = [];
    if (mode === 'all' || !pagesParam) {
      pageIndices = doc.getPageIndices();
    } else {
      const segments = pagesParam.split(',');
      for (const seg of segments) {
        const [a, b] = seg.split('-').map((n) => parseInt(n.trim(), 10) - 1);
        if (isNaN(a) || a < 0 || a >= total) continue;
        if (b === undefined || isNaN(b)) {
          pageIndices.push(a);
        } else {
          const end = Math.min(b, total - 1);
          for (let i = a; i <= end; i++) pageIndices.push(i);
        }
      }
      if (pageIndices.length === 0)
        return res.status(400).json({ error: 'Nenhuma página válida no intervalo informado.' });
    }

    if (mode === 'all' || pageIndices.length > 1) {
      res.setHeader('Content-Type', 'application/zip');
      res.setHeader('Content-Disposition', 'attachment; filename="split_pages.zip"');
      const archive = archiver('zip', { zlib: { level: 6 } });
      archive.pipe(res);
      for (const idx of pageIndices) {
        const single = await PDFDocument.create();
        const [copied] = await single.copyPages(doc, [idx]);
        single.addPage(copied);
        const buf = await single.save();
        archive.append(Buffer.from(buf), { name: `page_${idx + 1}.pdf` });
      }
      await archive.finalize();
    } else {
      const single = await PDFDocument.create();
      const [copied] = await single.copyPages(doc, pageIndices);
      single.addPage(copied);
      const out = await single.save();
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="page_${pageIndices[0] + 1}.pdf"`);
      res.send(Buffer.from(out));
    }
  } catch (err) {
    res.status(422).json({ error: err.message });
  }
});

// ── REMOVER PÁGINAS ───────────────────────────────────────────────────────────
router.post('/remove-pages', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Nenhum arquivo enviado.' });
    const { pages: pagesParam } = req.body;
    if (!pagesParam) return res.status(400).json({ error: 'Informe as páginas a remover (ex: "1,3,5").' });

    const doc = await PDFDocument.load(req.file.buffer);
    const total = doc.getPageCount();
    const toRemove = new Set(
      pagesParam.split(',')
        .map((n) => parseInt(n.trim(), 10) - 1)
        .filter((n) => n >= 0 && n < total)
    );
    if (toRemove.size === 0) return res.status(400).json({ error: 'Nenhuma página válida para remover.' });
    if (toRemove.size >= total) return res.status(400).json({ error: 'Não é possível remover todas as páginas.' });

    const keepIndices = doc.getPageIndices().filter((i) => !toRemove.has(i));
    const newDoc = await PDFDocument.create();
    const pages = await newDoc.copyPages(doc, keepIndices);
    pages.forEach((p) => newDoc.addPage(p));

    const out = await newDoc.save();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="sem_paginas.pdf"');
    res.send(Buffer.from(out));
  } catch (err) {
    res.status(422).json({ error: err.message });
  }
});

// ── EXTRAIR PÁGINAS ───────────────────────────────────────────────────────────
router.post('/extract-pages', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Nenhum arquivo enviado.' });
    const { pages: pagesParam } = req.body;
    if (!pagesParam) return res.status(400).json({ error: 'Informe as páginas a extrair (ex: "2-5" ou "1,3,5").' });

    const doc = await PDFDocument.load(req.file.buffer);
    const total = doc.getPageCount();
    const pageIndices = [];
    for (const seg of pagesParam.split(',')) {
      const [a, b] = seg.split('-').map((n) => parseInt(n.trim(), 10) - 1);
      if (isNaN(a) || a < 0 || a >= total) continue;
      if (b === undefined || isNaN(b)) {
        pageIndices.push(a);
      } else {
        for (let i = a; i <= Math.min(b, total - 1); i++) pageIndices.push(i);
      }
    }
    if (pageIndices.length === 0) return res.status(400).json({ error: 'Nenhuma página válida.' });

    const newDoc = await PDFDocument.create();
    const pages = await newDoc.copyPages(doc, pageIndices);
    pages.forEach((p) => newDoc.addPage(p));

    const out = await newDoc.save();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="extraido.pdf"');
    res.send(Buffer.from(out));
  } catch (err) {
    res.status(422).json({ error: err.message });
  }
});

// ── REORDENAR PÁGINAS ────────────────────────────────────────────────────────
router.post('/reorder', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Nenhum arquivo enviado.' });
    const { order } = req.body;
    if (!order) return res.status(400).json({ error: 'Informe a nova ordem (ex: "3,1,2").' });

    const doc = await PDFDocument.load(req.file.buffer);
    const total = doc.getPageCount();
    const newOrder = order.split(',')
      .map((n) => parseInt(n.trim(), 10) - 1)
      .filter((n) => n >= 0 && n < total);

    if (newOrder.length !== total)
      return res.status(400).json({ error: `Informe exatamente ${total} números na nova ordem.` });

    const newDoc = await PDFDocument.create();
    const pages = await newDoc.copyPages(doc, newOrder);
    pages.forEach((p) => newDoc.addPage(p));

    const out = await newDoc.save();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="reordenado.pdf"');
    res.send(Buffer.from(out));
  } catch (err) {
    res.status(422).json({ error: err.message });
  }
});

// ── COMPRIMIR ────────────────────────────────────────────────────────────────
router.post('/compress', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Nenhum arquivo enviado.' });
    const doc = await PDFDocument.load(req.file.buffer, { updateMetadata: false });
    const out = await doc.save({ useObjectStreams: true });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${sanitizeFilename('compressed_' + req.file.originalname)}"`);
    res.setHeader('X-Original-Size', String(req.file.buffer.length));
    res.setHeader('X-Compressed-Size', String(out.length));
    res.send(Buffer.from(out));
  } catch (err) {
    res.status(422).json({ error: err.message });
  }
});

// ── GIRAR ────────────────────────────────────────────────────────────────────
router.post('/rotate', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Nenhum arquivo enviado.' });
    const deg = parseInt(req.body.degrees ?? '90', 10);
    if (![90, 180, 270].includes(deg))
      return res.status(400).json({ error: 'Graus inválidos. Use 90, 180 ou 270.' });

    const doc = await PDFDocument.load(req.file.buffer);
    doc.getPages().forEach((p) => {
      const current = p.getRotation().angle;
      p.setRotation(degrees((current + deg) % 360));
    });
    const out = await doc.save();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="rotated.pdf"');
    res.send(Buffer.from(out));
  } catch (err) {
    res.status(422).json({ error: err.message });
  }
});

// ── MARCA D'ÁGUA ──────────────────────────────────────────────────────────────
router.post('/watermark', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Nenhum arquivo enviado.' });
    const { text = 'CONFIDENCIAL', opacity = '0.3', color = 'gray' } = req.body;
    const op = Math.min(1, Math.max(0, parseFloat(opacity)));
    const COLOR_MAP = {
      gray: rgb(0.5, 0.5, 0.5),
      red:  rgb(0.8, 0.1, 0.1),
      blue: rgb(0.1, 0.2, 0.7),
    };
    const fontColor = COLOR_MAP[color] ?? COLOR_MAP.gray;

    const doc = await PDFDocument.load(req.file.buffer);
    const font = await doc.embedFont(StandardFonts.Helvetica);
    doc.getPages().forEach((page) => {
      const { width, height } = page.getSize();
      const fontSize = Math.max(24, Math.min(width / Math.max(text.length, 1), 80));
      page.drawText(text, {
        x: width / 2 - (fontSize * text.length * 0.3),
        y: height / 2,
        size: fontSize,
        font,
        opacity: op,
        rotate: degrees(45),
        color: fontColor,
      });
    });
    const out = await doc.save();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="watermarked.pdf"');
    res.send(Buffer.from(out));
  } catch (err) {
    res.status(422).json({ error: err.message });
  }
});

// ── NÚMEROS DE PÁGINA ─────────────────────────────────────────────────────────
router.post('/page-numbers', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Nenhum arquivo enviado.' });
    const {
      position = 'bottom-center',
      startAt = '1',
      prefix = '',
    } = req.body;
    const startNum = parseInt(startAt, 10) || 1;

    const doc = await PDFDocument.load(req.file.buffer);
    const font = await doc.embedFont(StandardFonts.Helvetica);
    const fontSize = 11;
    const margin = 24;

    doc.getPages().forEach((page, i) => {
      const { width, height } = page.getSize();
      const label = `${prefix}${startNum + i}`;
      const textWidth = font.widthOfTextAtSize(label, fontSize);

      let x, y;
      switch (position) {
        case 'bottom-right':  x = width - textWidth - margin; y = margin; break;
        case 'bottom-left':   x = margin;                      y = margin; break;
        case 'top-center':    x = (width - textWidth) / 2;     y = height - margin - fontSize; break;
        case 'top-right':     x = width - textWidth - margin;  y = height - margin - fontSize; break;
        default:              x = (width - textWidth) / 2;     y = margin;
      }

      page.drawText(label, { x, y, size: fontSize, font, color: rgb(0.3, 0.3, 0.3) });
    });

    const out = await doc.save();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="paginado.pdf"');
    res.send(Buffer.from(out));
  } catch (err) {
    res.status(422).json({ error: err.message });
  }
});

// ── PROTEGER ──────────────────────────────────────────────────────────────────
router.post('/protect', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Nenhum arquivo enviado.' });
    const { password } = req.body;
    if (!password?.trim()) return res.status(400).json({ error: 'Informe a senha desejada.' });
    const doc = await PDFDocument.load(req.file.buffer);
    const out = await doc.save({ userPassword: password, ownerPassword: password });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="protected.pdf"');
    res.send(Buffer.from(out));
  } catch (err) {
    res.status(422).json({ error: err.message });
  }
});

// ── DESBLOQUEAR ───────────────────────────────────────────────────────────────
router.post('/unlock', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Nenhum arquivo enviado.' });
    const { password = '' } = req.body;
    const doc = await PDFDocument.load(req.file.buffer, { password });
    const out = await doc.save();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="unlocked.pdf"');
    res.send(Buffer.from(out));
  } catch (err) {
    res.status(422).json({
      error: err.message.includes('password') || err.message.includes('encrypt')
        ? 'Senha incorreta ou arquivo não está protegido.'
        : err.message,
    });
  }
});

// ── JPG / PNG → PDF ───────────────────────────────────────────────────────────
router.post('/jpg-to-pdf', uploadAny.array('files', 30), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0)
      return res.status(400).json({ error: 'Envie pelo menos uma imagem.' });

    const doc = await PDFDocument.create();
    for (const file of req.files) {
      const mime = file.mimetype;
      let imgBuf = file.buffer;

      if (!['image/jpeg', 'image/png'].includes(mime)) {
        imgBuf = await sharp(file.buffer).jpeg({ quality: 90 }).toBuffer();
      }

      const img = mime === 'image/png'
        ? await doc.embedPng(imgBuf)
        : await doc.embedJpg(imgBuf);

      const page = doc.addPage([img.width, img.height]);
      page.drawImage(img, { x: 0, y: 0, width: img.width, height: img.height });
    }

    const out = await doc.save();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="imagens.pdf"');
    res.send(Buffer.from(out));
  } catch (err) {
    res.status(422).json({ error: err.message });
  }
});

export default router;
