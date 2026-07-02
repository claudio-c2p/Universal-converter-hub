import express from 'express';
import { execFile } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const router = express.Router();

// deploy/status.json fica na raiz do repo, dois níveis acima de src/routes/
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const STATUS_FILE = path.resolve(__dirname, '../../../deploy/status.json');

// Cada entrada: nome amigável + comando + arg que tenta um retorno rápido
// (geralmente --version). Alguns binários (ex: mdb-tables) não têm uma flag
// de versão e exigem um arquivo como argumento — nesse caso o processo ainda
// assim é encontrado e executado (só falha por causa do argumento errado),
// então a checagem abaixo não trata isso como "binário ausente".
const BINARIES = [
  { key: 'libreoffice', label: 'LibreOffice (Office → PDF/ODT/etc.)', cmd: 'soffice',       args: ['--version'] },
  { key: 'calibre',     label: 'Calibre (eBooks)',                    cmd: 'ebook-convert',  args: ['--version'] },
  { key: 'ghostscript', label: 'Ghostscript (EPS/PS → PDF)',          cmd: 'gs',             args: ['--version'] },
  { key: 'tesseract',   label: 'Tesseract (OCR)',                     cmd: 'tesseract',      args: ['--version'] },
  { key: 'mdbtools',    label: 'mdbtools (Access/MDB)',                cmd: 'mdb-tables',     args: ['--version'] },
  { key: 'pandoc',      label: 'Pandoc (LaTeX/TEX)',                  cmd: 'pandoc',         args: ['--version'] },
  { key: 'qpdf',        label: 'qpdf (PDF, senha)',                   cmd: 'qpdf',           args: ['--version'] },
  { key: 'ffmpeg',      label: 'FFmpeg (mídia, opcional)',            cmd: 'ffmpeg',         args: ['-version'] },
];

function checkBinary({ cmd, args }) {
  return new Promise((resolve) => {
    execFile(cmd, args, { timeout: 5000 }, (err) => {
      // ENOENT/EACCES = binário realmente ausente/sem permissão. Timeout
      // (`err.killed`) tratamos como indisponível também, pois um binário
      // que trava ao ser chamado é tão inútil pro usuário quanto um ausente.
      // Qualquer outro erro (ex: exit code != 0 por flag não suportada, como
      // mdb-tables sem --version, que exige um arquivo) ainda prova que o
      // processo foi encontrado e rodou — conta como "disponível".
      if (err && (err.code === 'ENOENT' || err.code === 'EACCES' || err.killed)) {
        resolve(false);
        return;
      }
      resolve(true);
    });
  });
}

router.get('/binaries', async (_req, res) => {
  const results = await Promise.all(
    BINARIES.map(async (bin) => ({
      key: bin.key,
      label: bin.label,
      available: await checkBinary(bin),
    })),
  );

  const summary = {};
  for (const r of results) summary[r.key] = r.available;

  res.json({
    checkedAt: new Date().toISOString(),
    binaries: results,
    // formato simples { libreoffice: true, calibre: false, ... } pedido na spec
    ...summary,
  });
});

// Lê o status escrito por deploy/server-auto-update.sh (roda a cada 30 min
// via cron no servidor). Se o arquivo não existe ainda — servidor sem o cron
// configurado, ou primeira execução ainda não rodou — retorna um estado neutro
// em vez de erro, pra não quebrar a página de status por causa disso.
router.get('/auto-update', async (_req, res) => {
  try {
    const raw = await fs.readFile(STATUS_FILE, 'utf-8');
    res.json(JSON.parse(raw));
  } catch {
    res.json({ status: 'unknown', message: 'Auto-update ainda não configurado ou nunca rodou neste servidor.', checkedAt: null });
  }
});

export default router;
