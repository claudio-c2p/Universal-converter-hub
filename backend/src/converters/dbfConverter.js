import { DBFFile } from 'dbffile';
import { saveTempFile, removeFileSafe } from '../utils/fileUtils.js';

/** Lê todas as linhas de um arquivo .dbf (recebido como Buffer) e retorna um array de objetos. */
async function readDbfRows(buffer) {
  const tmpPath = await saveTempFile(buffer, '.dbf');
  try {
    const dbf = await DBFFile.open(tmpPath);
    const rows = await dbf.readRecords();
    return rows;
  } finally {
    await removeFileSafe(tmpPath);
  }
}

export async function dbfToJson(buffer) {
  const rows = await readDbfRows(buffer);
  return JSON.stringify(rows, null, 2);
}

export async function dbfToCsv(buffer) {
  const rows = await readDbfRows(buffer);
  if (rows.length === 0) throw new Error('Arquivo DBF não contém registros.');
  const columns = Object.keys(rows[0]);
  const escape = (v) => {
    const s = v === null || v === undefined ? '' : String(v);
    return /[,"\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const lines = [columns.join(','), ...rows.map((r) => columns.map((c) => escape(r[c])).join(','))];
  return lines.join('\n');
}

export async function dbfToSql(buffer, tableName = 'tabela') {
  const rows = await readDbfRows(buffer);
  if (rows.length === 0) throw new Error('Arquivo DBF não contém registros.');
  const columns = Object.keys(rows[0]);
  const lines = rows.map((row) => {
    const vals = columns.map((c) => {
      const v = row[c];
      if (v === null || v === undefined) return 'NULL';
      if (typeof v === 'number' || typeof v === 'boolean') return String(v);
      if (v instanceof Date) return `'${v.toISOString().slice(0, 10)}'`;
      return `'${String(v).replace(/'/g, "''")}'`;
    });
    return `INSERT INTO "${tableName}" (${columns.map((c) => `"${c}"`).join(', ')}) VALUES (${vals.join(', ')});`;
  });
  return lines.join('\n');
}
