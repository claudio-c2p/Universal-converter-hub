import { execFile } from 'child_process';
import crypto from 'crypto';
import { saveTempFile, removeFileSafe } from '../utils/fileUtils.js';
import fs from 'fs/promises';

const FFMPEG = process.env.FFMPEG_PATH || 'ffmpeg';
const TIMEOUT_MS = 5 * 60_000; // vídeo pode demorar bem mais que documentos
const MAX_CONCURRENT = 1; // ffmpeg é pesado em CPU — só uma conversão por vez neste servidor

// ── Fila simples, mesmo padrão de libreOfficeConverter.js ──
let running = 0;
const queue = [];

function acquireSlot() {
  return new Promise((resolve) => {
    const tryRun = () => {
      if (running < MAX_CONCURRENT) {
        running++;
        resolve();
      } else {
        queue.push(tryRun);
      }
    };
    tryRun();
  });
}

function releaseSlot() {
  running--;
  const next = queue.shift();
  if (next) next();
}

function runFfmpeg(args) {
  return new Promise((resolve, reject) => {
    execFile(FFMPEG, args, { timeout: TIMEOUT_MS, maxBuffer: 1024 * 1024 * 20 }, (err, stdout, stderr) => {
      if (err) {
        if (err.killed) return reject(new Error('Conversão excedeu o tempo limite (ffmpeg).'));
        return reject(new Error(stderr?.slice(-2000) || err.message));
      }
      resolve(stdout);
    });
  });
}

/** Corta um trecho de vídeo (opcional) e converte para GIF animado. */
export async function videoToGif(buffer, { startSeconds = 0, durationSeconds = 5, width = 480, fps = 12 } = {}) {
  const inPath = await saveTempFile(buffer, '.mp4');
  const outPath = inPath.replace(/\.mp4$/, '.gif');
  await acquireSlot();
  try {
    // Paleta gerada em memória via filtro complexo — evita um segundo arquivo temporário de paleta
    const filter = `fps=${fps},scale=${width}:-1:flags=lanczos,split[a][b];[a]palettegen[p];[b][p]paletteuse`;
    await runFfmpeg([
      '-y', '-ss', String(startSeconds), '-t', String(durationSeconds),
      '-i', inPath, '-filter_complex', filter, outPath,
    ]);
    return await fs.readFile(outPath);
  } finally {
    releaseSlot();
    await removeFileSafe(inPath);
    await removeFileSafe(outPath);
  }
}

/** Extrai a trilha de áudio de um vídeo (mp3 ou wav). */
export async function videoToAudio(buffer, toFormat = 'mp3') {
  if (!['mp3', 'wav'].includes(toFormat)) {
    throw new Error(`Formato de áudio de saída não suportado: ${toFormat}`);
  }
  const inPath = await saveTempFile(buffer, '.mp4');
  const outPath = inPath.replace(/\.mp4$/, `.${toFormat}`);
  await acquireSlot();
  try {
    const codecArgs = toFormat === 'mp3' ? ['-vn', '-acodec', 'libmp3lame', '-q:a', '2'] : ['-vn', '-acodec', 'pcm_s16le'];
    await runFfmpeg(['-y', '-i', inPath, ...codecArgs, outPath]);
    return await fs.readFile(outPath);
  } finally {
    releaseSlot();
    await removeFileSafe(inPath);
    await removeFileSafe(outPath);
  }
}

/** Converte entre formatos de áudio (MP3, WAV, OGG). */
export async function convertAudio(buffer, inputExt, toFormat) {
  const FORMATS = { mp3: ['-acodec', 'libmp3lame', '-q:a', '2'], wav: ['-acodec', 'pcm_s16le'], ogg: ['-acodec', 'libvorbis', '-q:a', '5'] };
  if (!FORMATS[toFormat]) throw new Error(`Formato de áudio de saída não suportado: ${toFormat}`);
  const inPath = await saveTempFile(buffer, inputExt);
  const outPath = inPath.replace(new RegExp(`${inputExt}$`), `.${toFormat}`);
  await acquireSlot();
  try {
    await runFfmpeg(['-y', '-i', inPath, ...FORMATS[toFormat], outPath]);
    return await fs.readFile(outPath);
  } finally {
    releaseSlot();
    await removeFileSafe(inPath);
    await removeFileSafe(outPath);
  }
}

/** Converte entre formatos de vídeo (MP4, WEBM, MOV). */
export async function convertVideo(buffer, inputExt, toFormat) {
  const FORMATS = {
    mp4: ['-c:v', 'libx264', '-preset', 'fast', '-crf', '23', '-c:a', 'aac'],
    webm: ['-c:v', 'libvpx-vp9', '-crf', '32', '-b:v', '0', '-c:a', 'libopus'],
    mov: ['-c:v', 'libx264', '-preset', 'fast', '-crf', '23', '-c:a', 'aac'],
  };
  if (!FORMATS[toFormat]) throw new Error(`Formato de vídeo de saída não suportado: ${toFormat}`);
  const inPath = await saveTempFile(buffer, inputExt);
  const outPath = inPath.replace(new RegExp(`${inputExt}$`), `.${toFormat}`);
  await acquireSlot();
  try {
    await runFfmpeg(['-y', '-i', inPath, ...FORMATS[toFormat], outPath]);
    return await fs.readFile(outPath);
  } finally {
    releaseSlot();
    await removeFileSafe(inPath);
    await removeFileSafe(outPath);
  }
}

// ── Job store em memória: as rotas de áudio/vídeo usam o padrão assíncrono
// (POST cria o job e retorna 202 + id; GET consulta status; GET .../download baixa
// o resultado) porque ffmpeg pode passar bem do timeout comum de requisição HTTP
// em proxies/CDNs na frente do backend. ──
const jobs = new Map(); // id -> { status, resultBuffer, filename, error, createdAt }
const JOB_TTL_MS = 15 * 60_000;

function cleanupOldJobs() {
  const now = Date.now();
  for (const [id, job] of jobs) {
    if (now - job.createdAt > JOB_TTL_MS) jobs.delete(id);
  }
}
setInterval(cleanupOldJobs, 5 * 60_000).unref?.();

export function createJob(runner, filename) {
  const id = crypto.randomBytes(12).toString('hex');
  const job = { status: 'pending', resultBuffer: null, filename, error: null, createdAt: Date.now() };
  jobs.set(id, job);

  runner()
    .then((buffer) => {
      job.status = 'done';
      job.resultBuffer = buffer;
    })
    .catch((err) => {
      job.status = 'error';
      job.error = err.message || 'Falha ao processar o arquivo.';
    });

  return id;
}

export function getJob(id) {
  return jobs.get(id) ?? null;
}
