import path from 'path';
import sharp from 'sharp';
import { PDFDocument } from 'pdf-lib';
import { convertWithLibreOffice } from './libreOfficeConverter.js';
import { convertImage } from './imageConverter.js';

const IMAGE_EXTS = ['.png', '.jpg', '.jpeg', '.webp', '.gif', '.bmp', '.avif'];
const IMAGE_TARGETS = ['png', 'jpg', 'jpeg', 'webp', 'gif', 'bmp', 'avif'];
// Formatos que o LibreOffice headless sabe ler/escrever (ver libreOfficeConverter.js)
const OFFICE_EXTS = ['.docx', '.doc', '.odt', '.rtf', '.epub', '.txt', '.html',
  '.xlsx', '.xls', '.ods', '.csv', '.pptx', '.ppt', '.odp'];

async function imageToPdfPage(buffer, ext) {
  const doc = await PDFDocument.create();
  const isPng = ext === '.png';
  // pdf-lib só embute PNG/JPG nativamente — outros formatos de imagem passam
  // por uma conversão intermediária via sharp antes de virar página do PDF.
  const imgBuf = isPng || ext === '.jpg' || ext === '.jpeg' ? buffer : await sharp(buffer).jpeg({ quality: 90 }).toBuffer();
  const img = isPng ? await doc.embedPng(imgBuf) : await doc.embedJpg(imgBuf);
  const page = doc.addPage([img.width, img.height]);
  page.drawImage(img, { x: 0, y: 0, width: img.width, height: img.height });
  return Buffer.from(await doc.save());
}

/**
 * Converte um único arquivo do lote para o formato de destino, escolhendo a
 * estratégia certa pela extensão de origem. Lança erro com mensagem amigável
 * quando o par origem→destino não é suportado — a rota captura isso por
 * arquivo, sem derrubar o lote inteiro.
 */
export async function convertSingleFile(buffer, originalname, toFormat) {
  const ext = path.extname(originalname).toLowerCase();
  const target = toFormat.toLowerCase().replace(/^\./, '');
  const normalizedExt = ext === '.jpeg' ? '.jpg' : ext;

  const targetExt = target === 'jpeg' ? 'jpg' : target;

  if (normalizedExt === `.${targetExt}`) {
    throw new Error(`"${originalname}" já está no formato .${target} — não há o que converter.`);
  }

  if (target === 'pdf') {
    if (IMAGE_EXTS.includes(ext)) return imageToPdfPage(buffer, ext);
    if (OFFICE_EXTS.includes(ext)) return convertWithLibreOffice(buffer, ext, 'pdf');
    throw new Error(`Formato de origem "${ext || '(sem extensão)'}" não suportado para conversão em lote para PDF.`);
  }

  if (ext === '.pdf') {
    // PDF -> outro formato depende de OCR/extração de layout, fora do escopo
    // desta ferramenta de lote — direciona para as ferramentas específicas de PDF.
    throw new Error(`Conversão de PDF para .${target} não é suportada aqui — use uma ferramenta específica de PDF para "${originalname}".`);
  }

  if (IMAGE_TARGETS.includes(target)) {
    if (!IMAGE_EXTS.includes(ext)) {
      throw new Error(`"${originalname}" não é uma imagem — não é possível converter para .${target}.`);
    }
    return convertImage(buffer, target === 'jpg' ? 'jpeg' : target);
  }

  if (OFFICE_EXTS.includes(ext) && OFFICE_EXTS.includes(`.${target}`)) {
    return convertWithLibreOffice(buffer, ext, target);
  }

  throw new Error(`Não é possível converter "${originalname}" (${ext || 'sem extensão'}) para .${target}.`);
}

/** Mescla vários PDFs (já convertidos) em um único arquivo, na ordem enviada. */
export async function mergePdfBuffers(buffers) {
  const merged = await PDFDocument.create();
  for (const buf of buffers) {
    const doc = await PDFDocument.load(buf);
    const pages = await merged.copyPages(doc, doc.getPageIndices());
    pages.forEach((p) => merged.addPage(p));
  }
  return Buffer.from(await merged.save());
}
