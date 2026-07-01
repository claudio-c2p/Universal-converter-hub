import { execFile } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import { saveTempFile, removeFileSafe } from '../utils/fileUtils.js';

const run = promisify(execFile);

const QPDF       = process.env.QPDF_PATH       || 'qpdf';
const GHOSTSCRIPT = process.env.GHOSTSCRIPT_PATH || 'gs';
const TESSERACT   = process.env.TESSERACT_PATH   || 'tesseract';

/** Remove a senha de um PDF protegido usando qpdf (decrypt real, diferente do pdf-lib). */
export async function removePdfPassword(buffer, password = '') {
  const inPath  = await saveTempFile(buffer, '.pdf');
  const outPath = inPath.replace(/\.pdf$/, '_out.pdf');
  try {
    const args = password
      ? ['--password=' + password, '--decrypt', inPath, outPath]
      : ['--decrypt', inPath, outPath];
    await run(QPDF, args);
    return await fs.readFile(outPath);
  } catch (err) {
    if (/invalid password|failed to be decrypted|wrong password/i.test(err.stderr || err.message)) {
      throw new Error('Senha incorreta para este PDF.');
    }
    throw new Error(`Falha ao remover a senha do PDF: ${err.stderr || err.message}`);
  } finally {
    await removeFileSafe(inPath);
    await removeFileSafe(outPath);
  }
}

/** Converte EPS ou PS para PDF usando Ghostscript. */
export async function epsOrPsToPdf(buffer, extension) {
  const inPath  = await saveTempFile(buffer, extension);
  const outPath = inPath.replace(new RegExp(`${extension}$`), '.pdf');
  try {
    await run(GHOSTSCRIPT, [
      '-q', '-dNOPAUSE', '-dBATCH', '-dSAFER',
      '-sDEVICE=pdfwrite', `-sOutputFile=${outPath}`, inPath,
    ]);
    return await fs.readFile(outPath);
  } catch (err) {
    throw new Error(`Falha ao converter para PDF via Ghostscript: ${err.stderr || err.message}`);
  } finally {
    await removeFileSafe(inPath);
    await removeFileSafe(outPath);
  }
}

/** Converte EPS/PS/PDF para PNG usando Ghostscript (primeira página apenas). */
export async function toPngWithGhostscript(buffer, extension) {
  const inPath  = await saveTempFile(buffer, extension);
  const outPath = inPath.replace(new RegExp(`${extension}$`), '.png');
  try {
    await run(GHOSTSCRIPT, [
      '-q', '-dNOPAUSE', '-dBATCH', '-dSAFER', '-r150',
      '-sDEVICE=png16m', `-sOutputFile=${outPath}`, inPath,
    ]);
    return await fs.readFile(outPath);
  } catch (err) {
    throw new Error(`Falha ao converter para PNG via Ghostscript: ${err.stderr || err.message}`);
  } finally {
    await removeFileSafe(inPath);
    await removeFileSafe(outPath);
  }
}

/** OCR de imagem → texto puro, usando Tesseract CLI. */
export async function imageToText(buffer, extension = '.png', lang = 'por+eng') {
  const inPath = await saveTempFile(buffer, extension);
  const outBase = inPath.replace(new RegExp(`${extension}$`), '');
  try {
    await run(TESSERACT, [inPath, outBase, '-l', lang]);
    return await fs.readFile(`${outBase}.txt`, 'utf-8');
  } catch (err) {
    throw new Error(`Falha no OCR (Tesseract): ${err.stderr || err.message}`);
  } finally {
    await removeFileSafe(inPath);
    await removeFileSafe(`${outBase}.txt`);
  }
}

/** OCR de imagem → PDF pesquisável (imagem original + camada de texto invisível), via Tesseract CLI. */
export async function imageToSearchablePdf(buffer, extension = '.png', lang = 'por+eng') {
  const inPath = await saveTempFile(buffer, extension);
  const outBase = inPath.replace(new RegExp(`${extension}$`), '');
  try {
    await run(TESSERACT, [inPath, outBase, '-l', lang, 'pdf']);
    return await fs.readFile(`${outBase}.pdf`);
  } catch (err) {
    throw new Error(`Falha no OCR (Tesseract, modo PDF): ${err.stderr || err.message}`);
  } finally {
    await removeFileSafe(inPath);
    await removeFileSafe(`${outBase}.pdf`);
  }
}
