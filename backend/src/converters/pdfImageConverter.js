import { pdf } from 'pdf-to-img';
import fs from 'fs/promises';
import path from 'path';

const MAX_PAGES = 20;

export async function pdfToImages(pdfPath, scale = 2) {
  try {
    await fs.access(pdfPath);
  } catch {
    throw new Error(`Arquivo PDF não encontrado: ${path.basename(pdfPath)}`);
  }
  if (scale < 1 || scale > 4) {
    throw new Error('Escala inválida. Use um valor entre 1 e 4.');
  }

  const document = await pdf(pdfPath, { scale });
  const results  = [];
  let pageNum    = 0;

  for await (const pageBuffer of document) {
    pageNum++;
    if (pageNum > MAX_PAGES) {
      console.warn(`[pdfToImages] PDF com mais de ${MAX_PAGES} páginas — processamento interrompido.`);
      break;
    }
    results.push({ buffer: pageBuffer, page: pageNum });
  }

  if (results.length === 0) {
    throw new Error('Nenhuma página pôde ser renderizada. O PDF pode estar corrompido ou protegido.');
  }
  return results;
}
