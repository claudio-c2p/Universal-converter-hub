import Papa from 'papaparse';

const ISO_DATE = /^\d{4}-\d{2}-\d{2}(T[\d:.Z+-]+)?$/;

function inferColumnType(values) {
  const nonNull = values.filter((v) => v !== null && v !== undefined && v !== '');
  if (nonNull.length === 0) return 'TEXT';

  const types = new Set(
    nonNull.map((v) => {
      const s = String(v).trim();
      if (v === true  || v === false)         return 'BOOLEAN';
      if (s === 'true' || s === 'false')      return 'BOOLEAN';
      if (ISO_DATE.test(s))                   return 'DATETIME';
      const num = Number(s);
      if (!isNaN(num) && s !== '') {
        return Number.isInteger(num) && !s.includes('.') ? 'INTEGER' : 'FLOAT';
      }
      return s.length > 255 ? 'TEXT' : 'VARCHAR(255)';
    }),
  );

  // Se há mistura de tipos, usa o tipo mais permissivo
  if (types.size > 1) {
    // INTEGER + FLOAT → FLOAT
    if (types.has('INTEGER') && types.has('FLOAT') && types.size === 2) return 'FLOAT';
    return 'TEXT';
  }
  return [...types][0];
}

/** Sanitiza o nome de uma coluna para uso seguro em SQL. */
function safeColumnName(col) {
  return col.replace(/[^a-zA-Z0-9_]/g, '_').replace(/^(\d)/, '_$1');
}

function rowsToCreateTable(tableName, rows) {
  if (!Array.isArray(rows) || rows.length === 0) {
    throw new Error('Nenhum dado encontrado para inferir o schema.');
  }
  const allColumns = [...new Set(rows.flatMap(Object.keys))];
  if (allColumns.length === 0) {
    throw new Error('Nenhuma coluna encontrada nos dados.');
  }
  const columns = allColumns.map((col) => {
    const values   = rows.map((r) => r[col] ?? null);
    const type     = inferColumnType(values);
    const hasNull  = values.some((v) => v === null || v === undefined || v === '');
    const nullable = hasNull ? 'NULL' : 'NOT NULL';
    const safeName = safeColumnName(col);
    return `  \`${safeName}\` ${type} ${nullable}`;
  });
  return [`CREATE TABLE \`${tableName}\` (`, columns.join(',\n'), ');'].join('\n');
}

/** Valida o nome da tabela: apenas letras, números e underscore, não pode começar com dígito. */
function validateTableName(name) {
  if (!name || typeof name !== 'string') throw new Error('Nome de tabela obrigatório.');
  if (/[^a-zA-Z0-9_]/.test(name))       throw new Error('Nome de tabela inválido. Use apenas letras, números e underscore.');
  if (/^\d/.test(name))                  throw new Error('Nome de tabela não pode começar com dígito.');
}

export function jsonToCreateTable(jsonString, tableName) {
  validateTableName(tableName);
  let rows;
  try { rows = JSON.parse(jsonString); }
  catch (err) { throw new Error(`JSON inválido: ${err.message}`); }
  if (!Array.isArray(rows)) {
    throw new Error('O JSON deve ser um array de objetos (ex: [{"col": "valor"}]).');
  }
  if (rows.length === 0) throw new Error('Array JSON vazio — nenhum dado para inferir schema.');
  return rowsToCreateTable(tableName, rows);
}

export function csvToCreateTable(csvString, tableName) {
  validateTableName(tableName);
  const result = Papa.parse(csvString, { header: true, skipEmptyLines: true });
  if (result.errors.length > 0) {
    throw new Error(`CSV inválido: ${result.errors[0].message}`);
  }
  if (!result.data || result.data.length === 0) {
    throw new Error('CSV vazio — nenhum dado para inferir schema.');
  }
  return rowsToCreateTable(tableName, result.data);
}
