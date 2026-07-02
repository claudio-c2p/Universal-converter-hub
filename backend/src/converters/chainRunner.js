import { CONVERTERS } from './registry.js';

/**
 * @param {Buffer} initialBuffer
 * @param {{from: string, to: string}[]} steps
 * @returns {Promise<{ buffer: Buffer, finalFormat: string }>}
 */
export async function runChain(initialBuffer, steps) {
  let buffer = initialBuffer;
  let finalFormat = steps[0]?.from;

  for (let i = 0; i < steps.length; i++) {
    const { from, to } = steps[i];
    const key = `${from}->${to}`;
    const converter = CONVERTERS[key];
    if (!converter) {
      const err = new Error(`Formato de saída inválido para este arquivo.`);
      err.failedStep = i;
      throw err;
    }
    try {
      buffer = await converter.fn(buffer);
      finalFormat = to;
    } catch (innerErr) {
      const err = new Error(innerErr.message || 'Falha na conversão deste passo.');
      err.failedStep = i;
      throw err;
    }
  }
  return { buffer, finalFormat };
}
