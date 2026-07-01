import mammoth from 'mammoth';
import TurndownService from 'turndown';
import fs from 'fs/promises';
import path from 'path';

const turndownService = new TurndownService({
  headingStyle: 'atx',
  bulletListMarker: '-',
  codeBlockStyle: 'fenced',
});

export async function docxToHtml(docxPath) {
  try { await fs.access(docxPath); }
  catch { throw new Error(`Arquivo DOCX não encontrado: ${path.basename(docxPath)}`); }

  const result = await mammoth.convertToHtml({ path: docxPath });
  if (result.messages?.length) {
    result.messages.forEach((m) => { if (m.type === 'warning') console.warn('[docxToHtml]', m.message); });
  }
  if (!result.value || result.value.trim().length === 0) {
    throw new Error('O arquivo DOCX parece estar vazio ou não contém conteúdo convertível.');
  }
  return {
    html:     result.value,
    warnings: result.messages?.filter((m) => m.type === 'warning').map((m) => m.message) ?? [],
  };
}

export async function docxToMarkdown(docxPath) {
  const { html, warnings } = await docxToHtml(docxPath);
  const markdown = turndownService.turndown(html);
  return { markdown, warnings };
}
