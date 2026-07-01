import { execFile } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';
import { saveTempFile, removeFileSafe } from '../utils/fileUtils.js';

const run = promisify(execFile);

const EBOOK_CONVERT = process.env.EBOOK_CONVERT_PATH || 'ebook-convert';
const MDB_TABLES     = process.env.MDB_TABLES_PATH     || 'mdb-tables';
const MDB_EXPORT      = process.env.MDB_EXPORT_PATH      || 'mdb-export';
const PANDOC          = process.env.PANDOC_PATH          || 'pandoc';
const PDFLATEX        = process.env.PDFLATEX_PATH        || 'pdflatex';
const FFMPEG          = process.env.FFMPEG_PATH          || 'ffmpeg';

// O motor de renderização HTML do Calibre (Qt WebEngine/Chromium) recusa rodar como root
// sem essa flag — necessário em containers Docker, que tipicamente rodam como root.
const EBOOK_ENV = { ...process.env, QTWEBENGINE_CHROMIUM_FLAGS: '--no-sandbox' };

// ── eBooks (Calibre) ──
const EBOOK_TIMEOUT_MS = 120_000;

export async function convertEbook(buffer, inputExt, outputExt) {
  const inPath  = await saveTempFile(buffer, inputExt);
  const outPath = inPath.replace(new RegExp(`\\${inputExt}$`), `.${outputExt}`);
  try {
    await run(EBOOK_CONVERT, [inPath, outPath], { timeout: EBOOK_TIMEOUT_MS, env: EBOOK_ENV });
    return await fs.readFile(outPath);
  } catch (err) {
    if (err.killed) throw new Error('Conversão de eBook excedeu o tempo limite (Calibre).');
    throw new Error(`Falha na conversão via Calibre: ${err.stderr || err.message}`);
  } finally {
    await removeFileSafe(inPath);
    await removeFileSafe(outPath);
  }
}

// ── Access / MDB (mdbtools) ──
export async function mdbListTables(buffer) {
  const inPath = await saveTempFile(buffer, '.mdb');
  try {
    const { stdout } = await run(MDB_TABLES, ['-1', inPath]);
    return stdout.split('\n').map((t) => t.trim()).filter(Boolean);
  } catch (err) {
    throw new Error(`Falha ao listar tabelas do MDB: ${err.stderr || err.message}`);
  } finally {
    await removeFileSafe(inPath);
  }
}

export async function mdbTableToCsv(buffer, tableName) {
  const inPath = await saveTempFile(buffer, '.mdb');
  try {
    const tables = await mdbListTablesFromPath(inPath);
    const target = tableName && tables.includes(tableName) ? tableName : tables[0];
    if (!target) throw new Error('Nenhuma tabela encontrada no arquivo Access (MDB).');
    const { stdout } = await run(MDB_EXPORT, ['-D', '%Y-%m-%d', inPath, target]);
    return stdout;
  } catch (err) {
    throw new Error(`Falha ao exportar tabela do MDB: ${err.stderr || err.message}`);
  } finally {
    await removeFileSafe(inPath);
  }
}

export async function mdbTableToSql(buffer, tableName) {
  const inPath = await saveTempFile(buffer, '.mdb');
  try {
    const tables = await mdbListTablesFromPath(inPath);
    const target = tableName && tables.includes(tableName) ? tableName : tables[0];
    if (!target) throw new Error('Nenhuma tabela encontrada no arquivo Access (MDB).');
    const { stdout } = await run(MDB_EXPORT, ['-I', 'postgres', '-D', '%Y-%m-%d', inPath, target]);
    return stdout;
  } catch (err) {
    throw new Error(`Falha ao exportar tabela do MDB para SQL: ${err.stderr || err.message}`);
  } finally {
    await removeFileSafe(inPath);
  }
}

export async function mdbTableToExcelBuffer(buffer, tableName) {
  const XLSX = await import('xlsx');
  const csv = await mdbTableToCsv(buffer, tableName);
  const workbook = XLSX.read(csv, { type: 'string' });
  return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
}

async function mdbListTablesFromPath(inPath) {
  const { stdout } = await run(MDB_TABLES, ['-1', inPath]);
  return stdout.split('\n').map((t) => t.trim()).filter(Boolean);
}

// ── LaTeX (pandoc para TEX<->HTML/Markdown, pdflatex para TEX->PDF) ──
export async function texToFormat(content, toFormat) {
  const binaryFormats = new Set(['docx', 'odt', 'epub', 'pptx']);
  const inPath = await saveTempFile(Buffer.from(content, 'utf-8'), '.tex');
  const outPath = inPath.replace(/\.tex$/, `.${toFormat}`);
  try {
    await run(PANDOC, ['-f', 'latex', '-t', toFormat, inPath, '-o', outPath]);
    return binaryFormats.has(toFormat)
      ? await fs.readFile(outPath)
      : await fs.readFile(outPath, 'utf-8');
  } catch (err) {
    throw new Error(`Falha ao converter TEX via Pandoc: ${err.stderr || err.message}`);
  } finally {
    await removeFileSafe(inPath);
    await removeFileSafe(outPath);
  }
}

export async function texToPdf(content) {
  // Aceita tanto um documento .tex completo (com \documentclass) quanto um fragmento de corpo —
  // neste último caso, envolve automaticamente em um documento mínimo.
  const fullDoc = /\\documentclass/.test(content)
    ? content
    : `\\documentclass{article}\n\\usepackage[utf8]{inputenc}\n\\begin{document}\n${content}\n\\end{document}\n`;

  const inPath  = await saveTempFile(Buffer.from(fullDoc, 'utf-8'), '.tex');
  const dir     = path.dirname(inPath);
  const base    = path.basename(inPath, '.tex');
  const outPath = path.join(dir, `${base}.pdf`);
  try {
    // Roda duas vezes para resolver referências cruzadas/sumário (padrão do LaTeX)
    await run(PDFLATEX, ['-interaction=nonstopmode', '-halt-on-error', `-output-directory=${dir}`, inPath]);
    await run(PDFLATEX, ['-interaction=nonstopmode', '-halt-on-error', `-output-directory=${dir}`, inPath]);
    return await fs.readFile(outPath);
  } catch (err) {
    throw new Error(`Falha ao compilar TEX para PDF: ${err.stderr || err.message}`);
  } finally {
    await removeFileSafe(inPath);
    await removeFileSafe(outPath);
    for (const ext of ['.aux', '.log', '.out', '.toc']) {
      await removeFileSafe(path.join(dir, `${base}${ext}`));
    }
  }
}

// ── Áudio / Vídeo (FFmpeg) ──
const FFMPEG_TIMEOUT_MS = 120_000;

export async function convertMedia(buffer, inputExt, outputExt) {
  const inPath  = await saveTempFile(buffer, inputExt);
  const outPath = inPath.replace(new RegExp(`\\${inputExt}$`), `.${outputExt}`);
  try {
    await run(FFMPEG, ['-y', '-i', inPath, outPath], { timeout: FFMPEG_TIMEOUT_MS });
    return await fs.readFile(outPath);
  } catch (err) {
    if (err.killed) throw new Error('Conversão de mídia excedeu o tempo limite (FFmpeg).');
    throw new Error(`Falha na conversão via FFmpeg: ${err.stderr || err.message}`);
  } finally {
    await removeFileSafe(inPath);
    await removeFileSafe(outPath);
  }
}
