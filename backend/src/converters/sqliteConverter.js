import initSqlJs from 'sql.js';

let SQLPromise = null;
function getSQL() {
  if (!SQLPromise) SQLPromise = initSqlJs();
  return SQLPromise;
}

/** Abre um banco SQLite (.db/.sqlite) a partir de um Buffer e retorna a instância sql.js. */
async function openDb(buffer) {
  const SQL = await getSQL();
  return new SQL.Database(new Uint8Array(buffer));
}

function listTables(db) {
  const res = db.exec("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'");
  if (!res.length) return [];
  return res[0].values.map((row) => row[0]);
}

function tableToRows(db, tableName) {
  const res = db.exec(`SELECT * FROM "${tableName}"`);
  if (!res.length) return { columns: [], rows: [] };
  const { columns, values } = res[0];
  const rows = values.map((row) => Object.fromEntries(columns.map((col, i) => [col, row[i]])));
  return { columns, rows };
}

/** SQLite → JSON: { tabela1: [...linhas...], tabela2: [...] } */
export async function sqliteToJson(buffer) {
  const db = await openDb(buffer);
  const tables = listTables(db);
  if (tables.length === 0) throw new Error('Nenhuma tabela encontrada no banco SQLite.');
  const out = {};
  for (const t of tables) out[t] = tableToRows(db, t).rows;
  db.close();
  return out;
}

/** SQLite → CSV (apenas a primeira tabela, ou a indicada). Retorna string CSV. */
export async function sqliteToCsv(buffer, tableName) {
  const db = await openDb(buffer);
  const tables = listTables(db);
  if (tables.length === 0) throw new Error('Nenhuma tabela encontrada no banco SQLite.');
  const target = tableName && tables.includes(tableName) ? tableName : tables[0];
  const { columns, rows } = tableToRows(db, target);
  db.close();
  const escape = (v) => {
    const s = v === null || v === undefined ? '' : String(v);
    return /[,"\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const lines = [columns.join(','), ...rows.map((r) => columns.map((c) => escape(r[c])).join(','))];
  return lines.join('\n');
}

/** SQLite → SQL (dump de INSERTs de todas as tabelas). */
export async function sqliteToSql(buffer) {
  const db = await openDb(buffer);
  const tables = listTables(db);
  if (tables.length === 0) throw new Error('Nenhuma tabela encontrada no banco SQLite.');
  const lines = [];
  for (const t of tables) {
    const { columns, rows } = tableToRows(db, t);
    for (const row of rows) {
      const vals = columns.map((c) => {
        const v = row[c];
        if (v === null || v === undefined) return 'NULL';
        if (typeof v === 'number') return String(v);
        return `'${String(v).replace(/'/g, "''")}'`;
      });
      lines.push(`INSERT INTO "${t}" (${columns.map((c) => `"${c}"`).join(', ')}) VALUES (${vals.join(', ')});`);
    }
  }
  db.close();
  return lines.join('\n');
}
