import alasql from 'alasql';
import Papa from 'papaparse';

/** Valida o nome da tabela: apenas letras, números e underscore. */
function validateTableName(tableName) {
  if (!tableName || typeof tableName !== 'string' || tableName.trim().length === 0) {
    throw new Error('Nome de tabela obrigatório.');
  }
  if (/[^a-zA-Z0-9_]/.test(tableName)) {
    throw new Error('Nome de tabela inválido. Use apenas letras, números e underscore.');
  }
}

export function sqlDumpToJson(sqlDump, tableName) {
  if (!sqlDump || sqlDump.trim().length === 0) {
    throw new Error('Dump SQL vazio.');
  }
  validateTableName(tableName);

  // Executa o dump em uma instância isolada para não poluir sessões anteriores
  try {
    alasql(sqlDump);
  } catch (err) {
    throw new Error(
      `Erro ao executar o dump SQL: ${err.message}. ` +
      'Verifique se o SQL é válido e auto-contido (CREATE TABLE + INSERT INTO).',
    );
  }

  let rows;
  try {
    rows = alasql(`SELECT * FROM \`${tableName}\``);
  } catch {
    throw new Error(
      `Tabela "${tableName}" não encontrada no dump. Verifique o nome exato da tabela.`,
    );
  }

  if (!Array.isArray(rows) || rows.length === 0) {
    throw new Error(`A tabela "${tableName}" existe mas não contém dados.`);
  }
  return rows;
}

export function sqlDumpToCsv(sqlDump, tableName) {
  const rows = sqlDumpToJson(sqlDump, tableName);
  return Papa.unparse(rows);
}

export function jsonToSqlInserts(tableName, rows) {
  validateTableName(tableName);
  if (!Array.isArray(rows) || rows.length === 0) {
    throw new Error('Array de dados vazio. Nenhum INSERT gerado.');
  }

  return rows
    .map((row, index) => {
      if (typeof row !== 'object' || row === null || Array.isArray(row)) {
        throw new Error(`Item no índice ${index} não é um objeto válido.`);
      }
      const columns = Object.keys(row);
      if (columns.length === 0) throw new Error(`Item no índice ${index} é um objeto vazio.`);

      const safeColumns = columns.map((c) => `\`${c.replace(/`/g, '``')}\``);
      const values = Object.values(row).map((v) => {
        if (v === null || v === undefined) return 'NULL';
        if (typeof v === 'boolean')        return v ? '1' : '0';
        if (typeof v === 'number')         return isFinite(v) ? String(v) : 'NULL';
        // Escapa aspas simples dobrando-as (padrão ANSI SQL)
        return `'${String(v).replace(/'/g, "''")}'`;
      });

      return `INSERT INTO \`${tableName}\` (${safeColumns.join(', ')}) VALUES (${values.join(', ')});`;
    })
    .join('\n');
}
