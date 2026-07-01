import safeRegex from 'safe-regex2';

const MAX_SIZE         = 5 * 1024 * 1024; // 5 MB
const MAX_REGEX_LENGTH = 200; // padrões muito longos são mais propensos a backtracking custoso

/**
 * Compila um RegExp de forma segura contra ataques de negação de serviço (ReDoS).
 * Valida o termo de busca BRUTO do usuário (antes de qualquer wrapper como \b ou
 * lookaround de wholeWord) com análise estática de backtracking, e limita seu tamanho.
 *
 * @param {string}  searchTerm
 * @param {boolean} useRegex
 * @param {boolean} caseSensitive
 * @param {boolean} wholeWord
 * @returns {RegExp}
 */
function compileSafePattern(searchTerm, { useRegex, caseSensitive, wholeWord }) {
  const flags = caseSensitive ? 'g' : 'gi';

  if (useRegex) {
    if (searchTerm.length > MAX_REGEX_LENGTH) {
      throw new Error(`Expressão regular muito longa. Máximo: ${MAX_REGEX_LENGTH} caracteres.`);
    }
    // Valida sintaxe antes de qualquer outra checagem, para dar um erro claro de sintaxe
    try {
      new RegExp(searchTerm);
    } catch (err) {
      throw new Error(`Expressão regular inválida: ${err.message}`);
    }
    // Análise estática de backtracking catastrófico — roda sobre o termo ORIGINAL do
    // usuário, sem o wrapper de wholeWord (lookaround confunde a análise estática).
    if (!safeRegex(searchTerm)) {
      throw new Error(
        'Expressão regular potencialmente perigosa (risco de travamento por backtracking ' +
        'catastrófico). Simplifique o padrão — evite grupos quantificados aninhados como (a+)+.',
      );
    }
    const src = wholeWord ? `(?<![\\w])(?:${searchTerm})(?![\\w])` : searchTerm;
    try {
      return new RegExp(src, flags);
    } catch (err) {
      throw new Error(`Expressão regular inválida: ${err.message}`);
    }
  }

  const escaped = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(wholeWord ? `\\b${escaped}\\b` : escaped, flags);
}

/**
 * Executa find & replace em um texto.
 * @param {string}  content
 * @param {string}  searchTerm
 * @param {string}  replacement
 * @param {{ useRegex?: boolean; caseSensitive?: boolean; wholeWord?: boolean }} options
 * @returns {{ result: string; count: number }}
 */
export function findAndReplace(content, searchTerm, replacement, options = {}) {
  const { useRegex = false, caseSensitive = true, wholeWord = false } = options;

  if (typeof content !== 'string' || content.length === 0)
    throw new Error('Conteúdo do arquivo vazio.');
  if (!searchTerm || searchTerm.length === 0)
    throw new Error('Termo de busca vazio.');
  if (replacement === undefined || replacement === null)
    throw new Error('Texto de substituição inválido.');
  if (Buffer.byteLength(content, 'utf8') > MAX_SIZE)
    throw new Error(`Arquivo muito grande. Máximo: ${MAX_SIZE / (1024 * 1024)} MB.`);

  const pattern = compileSafePattern(searchTerm, { useRegex, caseSensitive, wholeWord });

  let count = 0;
  const result = content.replace(pattern, (match) => {
    count++;
    // Preserva $1, $2, etc. somente para regex; para texto literal, escapa o $
    return useRegex ? replacement : replacement.replace(/\$/g, '$$$$');
  });
  return { result, count };
}

/**
 * Pré-visualização: retorna as primeiras N ocorrências com contexto.
 * @param {string} content
 * @param {string} searchTerm
 * @param {{ useRegex?: boolean; caseSensitive?: boolean }} options
 * @param {number} maxMatches
 * @returns {Array<{ line: number; context: string; match: string }>}
 */
export function previewMatches(content, searchTerm, options = {}, maxMatches = 20) {
  const { useRegex = false, caseSensitive = true } = options;
  if (!searchTerm) return [];
  if (typeof content !== 'string') return [];

  let pattern;
  try {
    pattern = compileSafePattern(searchTerm, { useRegex, caseSensitive, wholeWord: false });
  } catch {
    // Preview é tolerante: regex inválido ou potencialmente catastrófico apenas
    // resulta em nenhuma ocorrência mostrada, em vez de propagar o erro.
    return [];
  }

  const lines = content.split('\n');
  const matches = [];
  for (let i = 0; i < lines.length && matches.length < maxMatches; i++) {
    pattern.lastIndex = 0;
    const line = lines[i];
    if (pattern.test(line)) {
      pattern.lastIndex = 0;
      const firstMatch = line.match(pattern)?.[0] ?? '';
      matches.push({
        line:    i + 1,
        context: line.trim().slice(0, 120),
        match:   firstMatch,
      });
    }
  }
  return matches;
}
