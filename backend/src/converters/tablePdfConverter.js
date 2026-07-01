import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

const PAGE_WIDTH  = 595.28; // A4
const PAGE_HEIGHT = 841.89;
const MARGIN      = 36;
const FONT_SIZE   = 9;
const ROW_HEIGHT  = 18;

/**
 * Converte um array de objetos (linhas) em um PDF tabular simples (grade + cabeçalho).
 * Usado por CSV/JSON → PDF e XML → PDF.
 */
export async function rowsToPdf(rows, title = 'Dados') {
  if (!Array.isArray(rows) || rows.length === 0) {
    throw new Error('Nenhuma linha de dados encontrada para gerar o PDF.');
  }
  const columns = Array.from(
    rows.reduce((set, row) => {
      Object.keys(row ?? {}).forEach((k) => set.add(k));
      return set;
    }, new Set())
  );
  if (columns.length === 0) {
    throw new Error('Não foi possível identificar colunas nos dados fornecidos.');
  }

  const pdfDoc = await PDFDocument.create();
  const font     = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const usableWidth = PAGE_WIDTH - MARGIN * 2;
  const colWidth = usableWidth / columns.length;

  let page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  let y = PAGE_HEIGHT - MARGIN;

  const drawHeader = () => {
    page.drawText(title, { x: MARGIN, y, size: 13, font: fontBold, color: rgb(0.1, 0.1, 0.1) });
    y -= ROW_HEIGHT * 1.4;
    columns.forEach((col, i) => {
      const text = truncate(col, colWidth, fontBold, FONT_SIZE);
      page.drawText(text, { x: MARGIN + i * colWidth, y, size: FONT_SIZE, font: fontBold });
    });
    y -= ROW_HEIGHT * 0.7;
    page.drawLine({
      start: { x: MARGIN, y }, end: { x: PAGE_WIDTH - MARGIN, y },
      thickness: 0.75, color: rgb(0.6, 0.6, 0.6),
    });
    y -= ROW_HEIGHT * 0.6;
  };

  drawHeader();

  for (const row of rows) {
    if (y < MARGIN + ROW_HEIGHT) {
      page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
      y = PAGE_HEIGHT - MARGIN;
      drawHeader();
    }
    columns.forEach((col, i) => {
      const raw = row?.[col];
      const text = truncate(raw === undefined || raw === null ? '' : String(raw), colWidth, font, FONT_SIZE);
      page.drawText(text, { x: MARGIN + i * colWidth, y, size: FONT_SIZE, font });
    });
    y -= ROW_HEIGHT;
  }

  return pdfDoc.save();
}

function truncate(text, maxWidth, font, size) {
  let str = text;
  while (font.widthOfTextAtSize(str, size) > maxWidth - 4 && str.length > 1) {
    str = str.slice(0, -1);
  }
  if (str !== text && str.length > 1) str = str.slice(0, -1) + '…';
  return str;
}

/** Normaliza um valor JSON arbitrário (objeto, array de objetos, array de primitivos) em linhas tabulares. */
export function jsonToRows(data) {
  if (Array.isArray(data)) {
    return data.map((item) => (item !== null && typeof item === 'object' ? item : { valor: item }));
  }
  if (data !== null && typeof data === 'object') {
    return Object.entries(data).map(([chave, valor]) => ({
      chave,
      valor: valor !== null && typeof valor === 'object' ? JSON.stringify(valor) : valor,
    }));
  }
  return [{ valor: data }];
}
