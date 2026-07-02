import sharp from 'sharp';

const FORMATS = ['png', 'jpg', 'jpeg', 'webp', 'gif', 'bmp', 'avif'];

// Assinatura de magic bytes do container HEIC/HEIF ("ftyp" + brand heic/mif1/...)
// — usada só para dar uma mensagem de erro melhor, apontando para a ferramenta certa.
function looksLikeHeic(buffer) {
  if (!Buffer.isBuffer(buffer) || buffer.length < 12) return false;
  const brand = buffer.toString('ascii', 8, 12);
  return buffer.toString('ascii', 4, 8) === 'ftyp' && ['heic', 'heix', 'mif1', 'msf1'].includes(brand);
}

export async function convertImage(buffer, toFormat, opts = {}) {
  if (!FORMATS.includes(toFormat)) {
    const err = new Error(`Formato de saída não suportado: ${toFormat}`);
    err.isValidation = true;
    throw err;
  }
  if (looksLikeHeic(buffer)) {
    // sharp não decodifica HEIC nesta build (sem libheif) — em vez de deixar o
    // erro genérico do sharp confundir o usuário, aponta para a ferramenta certa.
    const err = new Error('Arquivos HEIC não são suportados aqui — use a ferramenta "HEIC → JPG".');
    err.isValidation = true;
    throw err;
  }
  let pipeline = sharp(buffer, { failOn: 'none' });
  if (opts.resizeWidth) pipeline = pipeline.resize({ width: opts.resizeWidth });
  const format = toFormat === 'jpg' ? 'jpeg' : toFormat;
  return pipeline.toFormat(format, opts.quality ? { quality: opts.quality } : undefined).toBuffer();
}
