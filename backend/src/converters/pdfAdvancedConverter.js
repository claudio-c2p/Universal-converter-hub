import { PDFDocument, rgb } from 'pdf-lib';
import { diffLinesDetailed } from './diffConverter.js';

export async function cropPdf(buffer, { top = 0, right = 0, bottom = 0, left = 0 } = {}) {
  const pdf = await PDFDocument.load(buffer);
  for (const page of pdf.getPages()) {
    const { width, height } = page.getSize();
    const newWidth = width - left - right;
    const newHeight = height - top - bottom;
    if (newWidth <= 0 || newHeight <= 0) {
      throw new Error('As margens informadas são maiores que o próprio PDF.');
    }
    page.setCropBox(left, bottom, newWidth, newHeight);
  }
  return pdf.save();
}

/**
 * Preenche campos de um formulário PDF (AcroForm) e opcionalmente achata o
 * resultado (torna os campos não editáveis). Campos desconhecidos são
 * ignorados silenciosamente para não quebrar em PDFs com nomes diferentes
 * do que o usuário digitou.
 */
export async function fillPdfForm(buffer, fieldValues = {}, { flatten = true } = {}) {
  const pdf = await PDFDocument.load(buffer);
  const form = pdf.getForm();
  const fields = form.getFields();
  if (fields.length === 0) {
    throw new Error('Este PDF não possui campos de formulário preenchíveis.');
  }

  for (const [name, value] of Object.entries(fieldValues)) {
    const field = fields.find((f) => f.getName() === name);
    if (!field) continue;
    const ctorName = field.constructor.name;
    try {
      if (ctorName === 'PDFCheckBox') {
        value ? field.check() : field.uncheck();
      } else if (ctorName === 'PDFTextField') {
        field.setText(String(value));
      } else if (ctorName === 'PDFDropdown' || ctorName === 'PDFOptionList') {
        field.select(String(value));
      } else if (ctorName === 'PDFRadioGroup') {
        field.select(String(value));
      }
    } catch {
      // valor incompatível com o tipo do campo — ignora esse campo específico
      // em vez de derrubar o preenchimento inteiro dos demais.
    }
  }

  if (flatten) form.flatten();
  return pdf.save();
}

/**
 * Assinatura visual: sobrepõe uma imagem PNG (assinatura desenhada/enviada pelo
 * cliente) em uma posição do PDF. Não é assinatura digital certificada (ICP-Brasil)
 * — apenas um carimbo visual, deixado explícito na UI da ferramenta.
 */
export async function signPdfVisual(buffer, { pageIndex = 0, x, y, width, height, signatureImageBuffer }) {
  const pdf = await PDFDocument.load(buffer);
  const pages = pdf.getPages();
  if (pageIndex < 0 || pageIndex >= pages.length) {
    throw new Error(`Página ${pageIndex + 1} não existe neste PDF (total: ${pages.length}).`);
  }
  const page = pages[pageIndex];
  const img = await pdf.embedPng(signatureImageBuffer);
  page.drawImage(img, { x, y, width, height });
  return pdf.save();
}

/**
 * Redação: desenha um retângulo preto opaco sobre a área indicada e achata o
 * resultado. Diferente de só desenhar por cima (o que deixaria o texto original
 * ainda selecionável/copiável por trás), este fluxo remove essa possibilidade.
 */
export async function redactPdf(buffer, { pageIndex = 0, rects = [] }) {
  if (!Array.isArray(rects) || rects.length === 0) {
    throw new Error('Informe ao menos uma área para censurar.');
  }
  const pdf = await PDFDocument.load(buffer);
  const pages = pdf.getPages();
  if (pageIndex < 0 || pageIndex >= pages.length) {
    throw new Error(`Página ${pageIndex + 1} não existe neste PDF (total: ${pages.length}).`);
  }
  const page = pages[pageIndex];
  for (const r of rects) {
    page.drawRectangle({ x: r.x, y: r.y, width: r.width, height: r.height, color: rgb(0, 0, 0) });
  }
  const form = pdf.getForm?.();
  form?.flatten?.();
  return pdf.save();
}

/**
 * Compara o texto de dois PDFs (extração simples via pdf-parse) e retorna as
 * "parts" no mesmo formato de diffLinesDetailed — a rota monta stats/diffs
 * exatamente como /api/diff/compare já faz, para reaproveitar o DiffViewer.
 */
export async function comparePdfs(bufferA, bufferB) {
  const pdfParse = (await import('pdf-parse')).default;
  const [textA, textB] = await Promise.all([
    pdfParse(bufferA).then((r) => r.text),
    pdfParse(bufferB).then((r) => r.text),
  ]);
  return diffLinesDetailed(textA || ' ', textB || ' ');
}
