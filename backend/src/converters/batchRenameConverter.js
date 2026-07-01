// backend/src/converters/batchRenameConverter.js

/**
 * Gera um novo nome de arquivo a partir de um padrão com variáveis.
 *
 * Variáveis suportadas no padrão:
 *   {name}    — nome original sem extensão
 *   {ext}     — extensão original (sem ponto)
 *   {index}   — número sequencial (começa em 1)
 *   {index0N} — sequencial com zero-padding de N dígitos (ex: {index03} → 001, 002)
 *   {date}    — data atual no formato YYYY-MM-DD
 *
 * @param {string} pattern   — padrão de nome (sem extensão)
 * @param {string} original  — nome original do arquivo (com extensão)
 * @param {number} index     — índice 0-based na lista
 * @returns {string} novo nome com extensão
 */
export function applyRenamePattern(pattern, original, index) {
  if (typeof pattern !== 'string' || pattern.trim().length === 0) {
    throw new Error('Padrão de nome vazio.');
  }
  if (typeof original !== 'string' || original.trim().length === 0) {
    throw new Error('Nome de arquivo original inválido.');
  }

  const dot  = original.lastIndexOf('.');
  const name = dot > 0 ? original.slice(0, dot) : original;
  const ext  = dot > 0 ? original.slice(dot + 1) : '';
  const date = new Date().toISOString().slice(0, 10);
  const i    = index + 1;

  const newName = pattern
    .replace(/{name}/g,                name)
    .replace(/{ext}/g,                 ext)
    // {index03}, {index2}, etc. — deve vir ANTES de {index} para não sobrescrever
    .replace(/{index0*(\d+)}/g, (_, d) => String(i).padStart(Number(d), '0'))
    .replace(/{index}/g,               String(i))
    .replace(/{date}/g,                date)
    // Remove caracteres proibidos no sistema de arquivos
    .replace(/[/\\:*?"<>|]/g, '_');

  if (!newName || newName.trim().length === 0) {
    throw new Error(`Padrão "${pattern}" gerou nome vazio para o arquivo "${original}".`);
  }

  return ext ? `${newName}.${ext}` : newName;
}

/**
 * Pré-visualiza os nomes gerados para uma lista de arquivos.
 * @param {string[]} filenames — nomes originais
 * @param {string}   pattern
 * @returns {Array<{ original: string; renamed: string }>}
 */
export function previewRename(filenames, pattern) {
  if (!Array.isArray(filenames)) throw new Error('"filenames" deve ser um array.');
  return filenames.map((name, i) => ({
    original: name,
    renamed:  applyRenamePattern(pattern, name, i),
  }));
}
