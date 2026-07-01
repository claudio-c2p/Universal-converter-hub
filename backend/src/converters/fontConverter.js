import { createFont, woff2 } from 'fonteditor-core';

const VALID_READ_TYPES  = ['ttf', 'woff', 'woff2', 'eot', 'svg', 'otf'];
const VALID_WRITE_TYPES = ['ttf', 'woff', 'woff2', 'eot', 'svg'];
let woff2Initialized = false;

export async function initFontEngine() {
  if (!woff2Initialized) {
    await woff2.init();
    woff2Initialized = true;
  }
}

export async function convertFont(inputBuffer, fromType, toType) {
  if (!Buffer.isBuffer(inputBuffer) || inputBuffer.length === 0) {
    throw new Error('Buffer de fonte vazio ou inválido.');
  }
  if (!VALID_READ_TYPES.includes(fromType)) {
    throw new Error(`Formato de entrada inválido: "${fromType}". Use: ${VALID_READ_TYPES.join(', ')}.`);
  }
  if (!VALID_WRITE_TYPES.includes(toType)) {
    throw new Error(
      toType === 'otf'
        ? 'OTF não é suportado como saída. Use TTF, WOFF, WOFF2, EOT ou SVG.'
        : `Formato de saída inválido: "${toType}".`
    );
  }
  if (fromType === toType) {
    throw new Error(`Os formatos de entrada e saída são iguais. Nenhuma conversão necessária.`);
  }
  if (fromType === 'woff2' || toType === 'woff2') {
    await initFontEngine();
  }
  try {
    const font = createFont(inputBuffer, { type: fromType });
    const output = font.write({ type: toType });
    return Buffer.isBuffer(output) ? output : Buffer.from(output);
  } catch (err) {
    throw new Error(`Falha na conversão de fonte (${fromType} → ${toType}): ${err.message}`);
  }
}
