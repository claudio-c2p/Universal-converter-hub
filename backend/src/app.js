import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cors from 'cors';
import { globalErrorHandler } from './utils/errorHandler.js';
import { startTempCleanupJob } from './utils/fileUtils.js';

// ── Parte 2 ──
import subtitleRouter    from './routes/subtitle.js';
import geoRouter         from './routes/geo.js';
import fontRouter        from './routes/font.js';

// ── Parte 3 ──
import pdfImageRouter    from './routes/pdfImage.js';
import docxRouter        from './routes/docx.js';
import xmlRouter         from './routes/xml.js';

// ── Parte 4 ──
import sqlRouter         from './routes/sql.js';
import configRouter      from './routes/config.js';

// ── Parte 5 ──
import diffRouter        from './routes/diff.js';
import findReplaceRouter from './routes/findReplace.js';
import splitMergeRouter  from './routes/splitMerge.js';
import exifRouter        from './routes/exif.js';
import batchRenameRouter from './routes/batchRename.js';

// ── Novas rotas PDF ──
import pdfToolsRouter from './routes/pdfTools.js';

// ── v4: Novas rotas ──
import officeConverterRouter from './routes/officeConverter.js';
import dataConverterRouter   from './routes/dataConverter.js';
import pdfConvertRouter      from './routes/pdfConvert.js';
import fileDbRouter          from './routes/fileDb.js';
import binaryToolsRouter     from './routes/binaryTools.js';
import libreOfficeRouter     from './routes/libreOffice.js';
import extraBinaryRouter     from './routes/extraBinary.js';
import healthRouter          from './routes/health.js';

// ── Anexo v3 (1/3): Imagem, cadeia de conversão e e-mail ──
import imageRouter        from './routes/image.js';
import formatsGraphRouter from './routes/formatsGraph.js';
import chainRouter        from './routes/chain.js';
import filesRouter        from './routes/files.js';
import emailRouter        from './routes/email.js';

// ── Anexo v3 (2/3): imagem extra (PSD/ICO/HEIC) + HTML→PDF, PDF avançado,
// áudio/vídeo (ffmpeg, async) e reforço Dados/Dev ──
import imageExtraRouter   from './routes/imageExtra.js';
import pdfAdvancedRouter  from './routes/pdfAdvanced.js';
import audioVideoRouter   from './routes/audioVideo.js';
import dataToolsRouter    from './routes/dataTools.js';

// ── Anexo v3 (3/3): API keys ──
import apiKeysRouter      from './routes/apiKeys.js';

// Conversão em lote: 2+ arquivos, tipos mistos, todos para o mesmo formato de destino
import batchConvertRouter from './routes/batch.js';

const app = express();

// Segurança
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL ?? 'http://localhost:3000',
  credentials: true,
  exposedHeaders: ['X-Replacements-Count', 'X-Conversion-Warnings', 'X-Original-Size', 'X-Compressed-Size', 'X-Warning'],
}));
app.use(express.json({ limit: '1mb' }));

// Rate limiters
const lightLimiter  = rateLimit({ windowMs: 60_000, max: 30 });
const mediumLimiter = rateLimit({ windowMs: 60_000, max: 15 });
const heavyLimiter  = rateLimit({ windowMs: 60_000, max: 10 });
const emailLimiter  = rateLimit({ windowMs: 60 * 60_000, max: 5 }); // 5/hora por IP

// Leves (texto puro)
app.use('/api/subtitle',     lightLimiter);
app.use('/api/geo',          lightLimiter);
app.use('/api/xml',          lightLimiter);
app.use('/api/sql',          lightLimiter);
app.use('/api/config',       lightLimiter);
app.use('/api/diff',         lightLimiter);
app.use('/api/find-replace', lightLimiter);
app.use('/api/batch-rename', lightLimiter);
app.use('/api/data-convert', lightLimiter);
app.use('/api/file-db',      lightLimiter);

// Médios (binários leves)
app.use('/api/split-merge',  mediumLimiter);
app.use('/api/exif',         mediumLimiter);
app.use('/api/docx',         mediumLimiter);
app.use('/api/office',       mediumLimiter);
app.use('/api/image',        mediumLimiter); // sharp é leve → mediumLimiter, não heavyLimiter

// Pesados (processamento intensivo)
app.use('/api/font',         heavyLimiter);
app.use('/api/pdf-image',    heavyLimiter);
app.use('/api/pdf-tools',    heavyLimiter);
app.use('/api/pdf-convert',  heavyLimiter);
app.use('/api/binary-tools', heavyLimiter);
app.use('/api/libreoffice',  heavyLimiter);
app.use('/api/extra',        heavyLimiter);
app.use('/api/chain-convert', heavyLimiter); // cada passo pode chamar soffice/sharp
app.use('/api/batch',        heavyLimiter); // vários arquivos, cada um pode passar pelo LibreOffice

// Formatos disponíveis para a cadeia (leitura simples)
app.use('/api/formats-graph', lightLimiter);

// E-mail — limite estrito específico (5/hora)
app.use('/api/send-email',   emailLimiter);

// Anexo v3 (2/3)
app.use('/api/image-extra',   mediumLimiter); // psd/ico/heic — sharp/libs leves
app.use('/api/pdf-advanced',  heavyLimiter);  // pdf-lib + puppeteer (html-to-pdf) + pdf-parse
app.use('/api/audio-video',   heavyLimiter);  // ffmpeg
app.use('/api/data-tools',    lightLimiter);  // sql.js roda em memória, é leve

// Anexo v3 (3/3)
app.use('/api/api-keys',      lightLimiter);

// ── Registrar rotas ──
app.use('/api/subtitle',     subtitleRouter);
app.use('/api/geo',          geoRouter);
app.use('/api/font',         fontRouter);
app.use('/api/pdf-image',    pdfImageRouter);
app.use('/api/docx',         docxRouter);
app.use('/api/xml',          xmlRouter);
app.use('/api/sql',          sqlRouter);
app.use('/api/config',       configRouter);
app.use('/api/diff',         diffRouter);
app.use('/api/find-replace', findReplaceRouter);
app.use('/api/split-merge',  splitMergeRouter);
app.use('/api/exif',         exifRouter);
app.use('/api/batch-rename', batchRenameRouter);
app.use('/api/pdf-tools',    pdfToolsRouter);

// v4 novas rotas
app.use('/api/office',       officeConverterRouter);
app.use('/api/data-convert', dataConverterRouter);
app.use('/api/pdf-convert',  pdfConvertRouter);
app.use('/api/file-db',      fileDbRouter);
app.use('/api/binary-tools', binaryToolsRouter);
app.use('/api/libreoffice',  libreOfficeRouter);
app.use('/api/extra',        extraBinaryRouter);
app.use('/api/health',       healthRouter);

// Anexo v3 (1/3)
app.use('/api/image',         imageRouter);
app.use('/api/formats-graph', formatsGraphRouter);
app.use('/api', chainRouter);          // expõe POST /api/chain-convert
app.use('/api/files',         filesRouter); // expõe GET /api/files/temp/:filename
app.use('/api', emailRouter);          // expõe POST /api/send-email

// Anexo v3 (2/3)
app.use('/api/image-extra',   imageExtraRouter);
app.use('/api/pdf-advanced',  pdfAdvancedRouter);
app.use('/api/audio-video',   audioVideoRouter);
app.use('/api/data-tools',    dataToolsRouter);

// Anexo v3 (3/3)
app.use('/api/api-keys',      apiKeysRouter);

// Conversão em lote (multi-arquivo, tipos mistos)
app.use('/api/batch',         batchConvertRouter);

// Health check
app.get('/', (_req, res) => {
  res.json({
    status: 'ok',
    nome: 'Universal Converter Hub — Motor de Conversão v4',
    versao: '4.0.0',
    rotas: 17,
  });
});

// Error handler global
app.use(globalErrorHandler);

const PORT = process.env.PORT ?? 4000;

const cleanupHandle = startTempCleanupJob();

const server = app.listen(PORT, () => {
  console.log(`🚀 Backend rodando na porta ${PORT}`);
});

function gracefulShutdown(signal) {
  console.log(`\n${signal} recebido — encerrando servidor...`);
  clearInterval(cleanupHandle);
  server.close(() => {
    console.log('Servidor encerrado.');
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 10_000).unref();
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT',  () => gracefulShutdown('SIGINT'));

export default app;
