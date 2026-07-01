import { createTwoFilesPatch, diffLines, diffJson } from 'diff';

const MAX_SIZE = 500 * 1024; // 500 KB por arquivo

function validateInputs(a, b) {
  if (typeof a !== 'string' || a.trim().length === 0) throw new Error('Arquivo A está vazio.');
  if (typeof b !== 'string' || b.trim().length === 0) throw new Error('Arquivo B está vazio.');
  const sizeA = Buffer.byteLength(a, 'utf8');
  const sizeB = Buffer.byteLength(b, 'utf8');
  if (sizeA > MAX_SIZE) throw new Error(`Arquivo A muito grande (${Math.round(sizeA/1024)} KB). Máximo: ${MAX_SIZE / 1024} KB.`);
  if (sizeB > MAX_SIZE) throw new Error(`Arquivo B muito grande (${Math.round(sizeB/1024)} KB). Máximo: ${MAX_SIZE / 1024} KB.`);
}

/**
 * Diff linha a linha com metadados (adicionado/removido/igual).
 */
export function diffLinesDetailed(contentA, contentB) {
  validateInputs(contentA, contentB);
  return diffLines(contentA, contentB);
}

/**
 * Diff semântico de dois JSONs (ignora diferenças de formatação).
 */
export function diffJsonContent(jsonA, jsonB) {
  validateInputs(jsonA, jsonB);
  let objA, objB;
  try { objA = JSON.parse(jsonA); } catch (e) { throw new Error(`JSON A inválido: ${e.message}`); }
  try { objB = JSON.parse(jsonB); } catch (e) { throw new Error(`JSON B inválido: ${e.message}`); }
  return diffJson(objA, objB);
}

/**
 * Gera diff no formato unified patch (.patch file).
 * Retorna string vazia se os arquivos forem idênticos.
 */
export function diffToPatch(
  contentA,
  contentB,
  filenameA = 'original',
  filenameB = 'modificado',
  context = 3,
) {
  validateInputs(contentA, contentB);
  if (typeof context !== 'number' || context < 0 || context > 10) {
    throw new Error('Contexto deve ser um número entre 0 e 10.');
  }
  const patch = createTwoFilesPatch(
    filenameA, filenameB, contentA, contentB, '', '', { context }
  );
  // O patch gerado tem sempre pelo menos 2 linhas de cabeçalho; se não houver
  // blocos de diff além delas, os arquivos são idênticos.
  const lines = patch.trim().split('\n');
  return lines.length <= 2 ? '' : patch;
}

/**
 * Resumo estatístico do diff.
 * @param {Array<{ value: string; added?: boolean; removed?: boolean }>} parts
 * @returns {{ additions: number; deletions: number; unchanged: number; identical: boolean }}
 */
export function diffStats(parts) {
  if (!Array.isArray(parts)) throw new Error('Parts deve ser um array.');
  let additions = 0, deletions = 0, unchanged = 0;
  for (const part of parts) {
    // Conta linhas não-vazias por parte
    const lines = String(part.value ?? '').split('\n').filter(Boolean).length;
    if (part.added)        additions += lines;
    else if (part.removed) deletions += lines;
    else                   unchanged += lines;
  }
  return { additions, deletions, unchanged, identical: additions === 0 && deletions === 0 };
}
