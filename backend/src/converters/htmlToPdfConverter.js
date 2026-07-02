let browserPromise = null;

// Reaproveita uma única instância do Chromium entre requisições — abrir um
// browser novo a cada chamada é caro (~1-2s) e desnecessário para uma tarefa
// leve como renderizar HTML estático.
async function getBrowser() {
  if (!browserPromise) {
    const puppeteer = (await import('puppeteer')).default;
    browserPromise = puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
  }
  return browserPromise;
}

/**
 * Renderiza um trecho de HTML e retorna um PDF em A4.
 * O HTML é isolado em um documento mínimo — não carrega recursos externos
 * além do que estiver embutido inline (evita SSRF via <img src="http://...">
 * apontando para redes internas do servidor).
 */
export async function htmlToPdf(htmlSnippet) {
  if (!htmlSnippet || !htmlSnippet.trim()) {
    throw new Error('Informe algum HTML para converter.');
  }
  const browser = await getBrowser();
  const page = await browser.newPage();
  try {
    const doc = `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body>${htmlSnippet}</body></html>`;
    // 'domcontentloaded' em vez de 'networkidle' — não esperamos por requisições
    // de rede externas, já que elas são propositalmente bloqueadas/ignoradas aqui.
    await page.setContent(doc, { waitUntil: 'domcontentloaded', timeout: 15_000 });
    const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true, margin: { top: '2cm', bottom: '2cm', left: '2cm', right: '2cm' } });
    return pdfBuffer;
  } finally {
    await page.close();
  }
}
