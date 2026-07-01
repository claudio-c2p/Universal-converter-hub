import { execFile } from 'child_process';
import fs from 'fs/promises';
import path from 'path';
import { saveTempFile, removeFileSafe } from '../utils/fileUtils.js';

const SOFFICE = process.env.SOFFICE_PATH || 'soffice';
const TIMEOUT_MS = 90_000;
const MAX_CONCURRENT = 2; // LibreOffice headless é pesado em CPU/RAM — evita estourar o servidor com várias instâncias

// Fila simples: só deixa MAX_CONCURRENT conversões rodando em paralelo, o resto espera.
let running = 0;
const queue = [];

function acquireSlot() {
  return new Promise((resolve) => {
    const tryRun = () => {
      if (running < MAX_CONCURRENT) {
        running++;
        resolve();
      } else {
        queue.push(tryRun);
      }
    };
    tryRun();
  });
}

function releaseSlot() {
  running--;
  const next = queue.shift();
  if (next) next();
}

function runSoffice(args) {
  return new Promise((resolve, reject) => {
    const child = execFile(SOFFICE, args, { timeout: TIMEOUT_MS }, (err, stdout, stderr) => {
      if (err) {
        if (err.killed) return reject(new Error('Conversão excedeu o tempo limite (LibreOffice).'));
        return reject(new Error(stderr || err.message));
      }
      resolve(stdout);
    });
    void child;
  });
}

// Formatos suportados pelo --convert-to do LibreOffice e o filtro correto a usar quando ambíguo.
const FORMAT_FILTERS = {
  pdf: 'pdf', docx: 'docx', doc: 'doc', odt: 'odt', rtf: 'rtf', epub: 'epub',
  txt: 'txt:Text', html: 'html',
  xlsx: 'xlsx', xls: 'xls', ods: 'ods', csv: 'csv:Text - txt - csv (StarCalc)',
  pptx: 'pptx', ppt: 'ppt', odp: 'odp',
  jpg: 'jpg', png: 'png',
};

/**
 * Converte um buffer de documento de escritório para outro formato usando LibreOffice headless.
 * @param {Buffer} buffer        — conteúdo do arquivo original
 * @param {string} inputExt      — extensão de entrada, com ponto (ex: '.docx')
 * @param {string} outputFormat  — formato de saída, sem ponto (ex: 'pdf')
 * @returns {Promise<Buffer>}
 */
export async function convertWithLibreOffice(buffer, inputExt, outputFormat) {
  const filter = FORMAT_FILTERS[outputFormat];
  if (!filter) {
    throw new Error(`Formato de saída não suportado pelo LibreOffice: "${outputFormat}".`);
  }
  const inPath = await saveTempFile(buffer, inputExt);
  const outDir = path.dirname(inPath);
  const outBase = path.basename(inPath, path.extname(inPath));
  const outExtMap = { csv: '.csv', txt: '.txt' };
  const expectedOutPath = path.join(outDir, `${outBase}${outExtMap[outputFormat] ?? `.${outputFormat}`}`);

  await acquireSlot();
  const profileDir = `${inPath}_profile`;
  try {
    await runSoffice([
      '--headless', '--norestore',
      `-env:UserInstallation=file://${profileDir}`,
      '--convert-to', filter, '--outdir', outDir, inPath,
    ]);
    const out = await fs.readFile(expectedOutPath);
    return out;
  } catch (err) {
    throw new Error(`Falha na conversão via LibreOffice: ${err.message}`);
  } finally {
    releaseSlot();
    await removeFileSafe(inPath);
    await removeFileSafe(expectedOutPath);
    await fs.rm(profileDir, { recursive: true, force: true }).catch(() => {});
  }
}
