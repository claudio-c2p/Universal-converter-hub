import Papa from 'papaparse';

const MAX_SIZE = 50 * 1024 * 1024; // 50 MB

function validateSize(content, label = 'Arquivo') {
  const size = Buffer.byteLength(content, 'utf8');
  if (size > MAX_SIZE) {
    throw new Error(`${label} muito grande (${Math.round(size / (1024 * 1024))} MB). Máximo: ${MAX_SIZE / (1024 * 1024)} MB.`);
  }
}

/** Divide CSV em partes de N linhas (mantém cabeçalho em cada parte). */
export function splitCsv(csvContent, linesPerChunk) {
  validateSize(csvContent);
  if (!Number.isInteger(linesPerChunk) || linesPerChunk < 1) {
    throw new Error('Linhas por parte deve ser um número inteiro positivo.');
  }
  const { data, meta, errors } = Papa.parse(csvContent, { header: true, skipEmptyLines: true });
  if (errors.length) throw new Error(`CSV inválido: ${errors[0].message}`);
  if (data.length === 0) throw new Error('CSV vazio — nenhuma linha de dados.');

  const chunks = [];
  for (let i = 0; i < data.length; i += linesPerChunk) {
    chunks.push(
      Papa.unparse(data.slice(i, i + linesPerChunk), { columns: meta.fields })
    );
  }
  return chunks;
}

/** Mescla múltiplos CSVs em um. Usa colunas do primeiro como referência e avisa sobre colunas extras. */
export function mergeCsv(files) {
  if (!Array.isArray(files) || files.length < 2) {
    throw new Error('Envie pelo menos 2 arquivos CSV para mesclar.');
  }
  const allRows = [];
  let referenceFields = null;

  for (const { name, content } of files) {
    validateSize(content, `Arquivo "${name}"`);
    const { data, meta, errors } = Papa.parse(content, { header: true, skipEmptyLines: true });
    if (errors.length) throw new Error(`CSV inválido em "${name}": ${errors[0].message}`);
    if (!referenceFields) {
      referenceFields = meta.fields;
    } else {
      // Avisa se colunas diferem, mas não bloqueia — papa deixa campos ausentes como undefined
      const extra = (meta.fields ?? []).filter((f) => !referenceFields.includes(f));
      if (extra.length > 0) {
        console.warn(`[mergeCsv] "${name}" possui colunas extras ignoradas: ${extra.join(', ')}`);
      }
    }
    allRows.push(...data);
  }
  return Papa.unparse(allRows, { columns: referenceFields });
}

/** Divide JSON (array) em partes de N itens. */
export function splitJson(jsonContent, itemsPerChunk) {
  validateSize(jsonContent);
  if (!Number.isInteger(itemsPerChunk) || itemsPerChunk < 1) {
    throw new Error('Itens por parte deve ser um número inteiro positivo.');
  }
  let data;
  try { data = JSON.parse(jsonContent); }
  catch (e) { throw new Error(`JSON inválido: ${e.message}`); }
  if (!Array.isArray(data)) throw new Error('O JSON deve ser um array de objetos.');
  if (data.length === 0)    throw new Error('Array JSON vazio.');

  const chunks = [];
  for (let i = 0; i < data.length; i += itemsPerChunk) {
    chunks.push(JSON.stringify(data.slice(i, i + itemsPerChunk), null, 2));
  }
  return chunks;
}

/** Mescla múltiplos JSONs (arrays) em um único array. */
export function mergeJson(files) {
  if (!Array.isArray(files) || files.length < 2) {
    throw new Error('Envie pelo menos 2 arquivos JSON para mesclar.');
  }
  const merged = [];
  for (const { name, content } of files) {
    validateSize(content, `Arquivo "${name}"`);
    let data;
    try { data = JSON.parse(content); }
    catch (e) { throw new Error(`JSON inválido em "${name}": ${e.message}`); }
    if (!Array.isArray(data)) {
      throw new Error(`"${name}" não é um array JSON. Apenas arrays podem ser mesclados.`);
    }
    merged.push(...data);
  }
  return JSON.stringify(merged, null, 2);
}
