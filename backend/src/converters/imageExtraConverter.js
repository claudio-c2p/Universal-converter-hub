import sharp from 'sharp';

/** Converte a imagem composta (flattened) de um arquivo PSD para PNG. */
export async function psdToPng(buffer) {
  const { readPsd } = await import('ag-psd');
  // ag-psd precisa de um ArrayBuffer, não de um Buffer do Node diretamente
  const arrayBuffer = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
  const psd = readPsd(arrayBuffer, { skipLayerImageData: true });
  if (!psd.canvas) {
    throw new Error('Não foi possível extrair a imagem composta deste PSD (arquivo sem preview renderizável).');
  }
  const raw = psd.canvas.toBuffer ? psd.canvas.toBuffer('image/png') : null;
  if (raw) return raw;
  // Fallback: node-canvas não disponível — reconstrói via sharp a partir dos pixels RGBA
  const { width, height, imageData } = psd;
  if (!imageData) throw new Error('PSD sem dados de imagem legíveis.');
  return sharp(Buffer.from(imageData.data), { raw: { width, height, channels: 4 } }).png().toBuffer();
}

/** Extrai a maior imagem contida em um arquivo .ico e converte para PNG. */
export async function icoToPng(buffer) {
  const icoEndec = (await import('ico-endec')).default ?? (await import('ico-endec'));
  const parsed = icoEndec.parse(buffer);
  if (!parsed || parsed.length === 0) throw new Error('Arquivo .ico inválido ou vazio.');
  const largest = parsed.reduce((a, b) => (a.width * a.height >= b.width * b.height ? a : b));
  return sharp(largest.buffer ?? largest.data).png().toBuffer();
}

/** Gera um .ico a partir de uma imagem PNG, com os tamanhos padrão de ícone. */
export async function pngToIco(buffer) {
  const pngToIcoLib = (await import('png-to-ico')).default;
  const sizes = [16, 24, 32, 48, 64, 128, 256];
  const resized = await Promise.all(
    sizes.map((size) => sharp(buffer).resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer()),
  );
  return pngToIcoLib(resized);
}

/** Converte uma foto HEIC (formato padrão do iPhone) para JPG. */
export async function heicToJpg(buffer, quality = 85) {
  const heicConvert = (await import('heic-convert')).default;
  const outputBuffer = await heicConvert({ buffer, format: 'JPEG', quality: quality / 100 });
  return Buffer.from(outputBuffer);
}
