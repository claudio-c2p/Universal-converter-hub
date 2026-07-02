import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import initSqlJs from 'sql.js';
import { XMLBuilder } from 'fast-xml-parser';
import { csvToCreateTable } from './schemaInferrer.js';
import { jsonToSqlInserts } from './sqlConverter.js';

let SQLPromise = null;
function getSQL() {
  if (!SQLPromise) SQLPromise = initSqlJs();
  return SQLPromise;
}

/** CSV → dump SQL (CREATE TABLE + INSERTs), reaproveitando o inferidor de schema já existente. */
export function csvToSqlDump(csvString, tableName = 'dados') {
  const createTable = csvToCreateTable(csvString, tableName);
  const parsed = Papa.parse(csvString, { header: true, skipEmptyLines: true });
  if (parsed.errors.length > 0) throw new Error(`CSV inválido: ${parsed.errors[0].message}`);
  const inserts = jsonToSqlInserts(tableName, parsed.data);
  return `${createTable}\n\n${inserts}\n`;
}

/** Lê a primeira planilha de um Excel e retorna linhas como array de objetos. */
function excelBufferToRows(buffer) {
  const wb = XLSX.read(buffer, { type: 'buffer' });
  const sheetName = wb.SheetNames[0];
  if (!sheetName) throw new Error('Planilha Excel sem nenhuma aba.');
  const sheet = wb.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json(sheet, { defval: null });
  if (rows.length === 0) throw new Error('Planilha Excel está vazia.');
  return { sheetName, rows };
}

function safeColumnName(col) {
  return String(col).replace(/[^a-zA-Z0-9_]/g, '_').replace(/^(\d)/, '_$1');
}

/** Excel (.xlsx) → SQLite (.db), criando uma tabela a partir da primeira planilha. */
export async function excelToSqlite(buffer, tableName = 'dados') {
  const { rows } = excelBufferToRows(buffer);
  const columns = [...new Set(rows.flatMap(Object.keys))].map(safeColumnName);

  const SQL = await getSQL();
  const db = new SQL.Database();
  db.run(`CREATE TABLE "${tableName}" (${columns.map((c) => `"${c}" TEXT`).join(', ')});`);

  const stmt = db.prepare(`INSERT INTO "${tableName}" (${columns.map((c) => `"${c}"`).join(', ')}) VALUES (${columns.map(() => '?').join(', ')})`);
  const rawColumns = [...new Set(rows.flatMap(Object.keys))];
  for (const row of rows) {
    stmt.run(rawColumns.map((c) => (row[c] === null || row[c] === undefined ? null : String(row[c]))));
  }
  stmt.free();

  const bytes = db.export();
  db.close();
  return Buffer.from(bytes);
}

/** SQLite (.db) → Excel (.xlsx), uma aba por tabela. */
export async function sqliteToExcel(buffer) {
  const SQL = await getSQL();
  const db = new SQL.Database(new Uint8Array(buffer));
  const tablesRes = db.exec("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'");
  const tables = tablesRes.length ? tablesRes[0].values.map((r) => r[0]) : [];
  if (tables.length === 0) throw new Error('Nenhuma tabela encontrada no banco SQLite.');

  const wb = XLSX.utils.book_new();
  for (const t of tables) {
    const res = db.exec(`SELECT * FROM "${t}"`);
    const aoa = res.length ? [res[0].columns, ...res[0].values] : [[]];
    const ws = XLSX.utils.aoa_to_sheet(aoa);
    // Nome de aba limitado a 31 caracteres pelo formato XLSX
    XLSX.utils.book_append_sheet(wb, ws, t.slice(0, 31));
  }
  db.close();
  return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
}

/** Excel → XML, um elemento <linha> por registro dentro de <dados>. */
export function excelToXml(buffer, rootElement = 'dados', rowElement = 'linha') {
  const { rows } = excelBufferToRows(buffer);
  const builder = new XMLBuilder({ format: true, ignoreAttributes: true });
  return builder.build({ [rootElement]: { [rowElement]: rows } });
}
