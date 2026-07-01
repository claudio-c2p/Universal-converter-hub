import path from 'path';
import fs from 'fs/promises';
import crypto from 'crypto';

/**
 * Sanitiza um nome de arquivo removendo caracteres perigosos.
 * Preserva pontos e hifens legítimos, colapsa múltiplos underscores.
 */
export function sanitizeFilename(filename) {
  if (typeof filename !== 'string') return 'arquivo';
  const sanitized = path
    .basename(filename)
    .replace(/[^\w.\- ]/g, '_')
    .replace(/\.{2,}/g, '.')    // colapsa ".." em "."
    .replace(/_{2,}/g, '_')     // colapsa "__" em "_"
    .trim();
  return sanitized || 'arquivo';
}

/** Remove um arquivo sem lançar exceção se ele já não existir. */
export async function removeFileSafe(filePath) {
  try {
    await fs.unlink(filePath);
  } catch {
    // silencioso — arquivo já removido ou inexistente
  }
}

/**
 * Salva um buffer em um arquivo temporário com nome único e retorna o caminho.
 * Usa crypto.randomBytes para maior entropia (evita colisão em alta concorrência).
 */
export async function saveTempFile(buffer, extension, tmpDir = process.env.TMP_DIR ?? '/tmp') {
  const rand     = crypto.randomBytes(8).toString('hex');
  const name     = `c2p_${Date.now()}_${rand}${extension}`;
  const filePath = path.join(tmpDir, name);
  await fs.writeFile(filePath, buffer);
  return filePath;
}

/** Mapa de assinaturas de magic bytes para validação de tipo real do arquivo. */
const MAGIC_BYTES = {
  pdf:  { bytes: [0x25, 0x50, 0x44, 0x46], offset: 0 },          // %PDF
  docx: { bytes: [0x50, 0x4B, 0x03, 0x04], offset: 0 },          // PK (ZIP)
  zip:  { bytes: [0x50, 0x4B, 0x03, 0x04], offset: 0 },          // PK (ZIP)
  png:  { bytes: [0x89, 0x50, 0x4E, 0x47], offset: 0 },          // PNG
  jpg:  { bytes: [0xFF, 0xD8, 0xFF],        offset: 0 },          // JPEG SOI
};

/**
 * Valida os magic bytes de um buffer contra um tipo esperado.
 * Retorna true se o tipo não for reconhecido (fail-open para tipos não mapeados).
 */
export function validateMagicBytes(buffer, type) {
  if (!Buffer.isBuffer(buffer) || buffer.length < 4) return false;
  const entry = MAGIC_BYTES[type];
  if (!entry) return true; // tipo não mapeado — não bloqueia
  const { bytes, offset } = entry;
  return bytes.every((byte, i) => buffer[offset + i] === byte);
}

/**
 * Inicia um job periódico que remove arquivos temporários antigos (prefixo "c2p_")
 * do diretório de temporários, evitando acúmulo em disco.
 *
 * @param {object} options
 * @param {string} options.tmpDir     — diretório a varrer (padrão: TMP_DIR ou /tmp)
 * @param {number} options.maxAgeMs   — idade máxima antes de remover (padrão: 15 min)
 * @param {number} options.intervalMs — intervalo entre varreduras (padrão: 15 min)
 * @returns {NodeJS.Timeout} handle do interval (para clearInterval no shutdown)
 */
export function startTempCleanupJob({
  tmpDir     = process.env.TMP_DIR ?? '/tmp',
  maxAgeMs   = 15 * 60 * 1000,
  intervalMs = 15 * 60 * 1000,
} = {}) {
  const sweep = async () => {
    try {
      const entries = await fs.readdir(tmpDir);
      const now     = Date.now();
      await Promise.allSettled(
        entries
          .filter((name) => name.startsWith('c2p_'))
          .map(async (name) => {
            const filePath = path.join(tmpDir, name);
            try {
              const stat = await fs.stat(filePath);
              if (now - stat.mtimeMs > maxAgeMs) {
                await fs.unlink(filePath);
              }
            } catch {
              // arquivo removido entre readdir e stat — ignorar
            }
          }),
      );
    } catch (err) {
      console.error('[tempCleanupJob]', err.message);
    }
  };

  sweep(); // varredura inicial ao subir
  return setInterval(sweep, intervalMs);
}
