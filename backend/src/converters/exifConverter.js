import exifr from 'exifr';

const SUPPORTED_TYPES = ['.jpg', '.jpeg', '.tiff', '.heic', '.heif', '.png', '.webp'];

/**
 * Lê todos os metadados EXIF de uma imagem (buffer).
 * @param {Buffer} imageBuffer
 * @param {string} extension — ex: '.jpg'
 * @returns {Promise<object>}
 */
export async function readExif(imageBuffer, extension) {
  if (!Buffer.isBuffer(imageBuffer) || imageBuffer.length === 0) {
    throw new Error('Buffer de imagem vazio.');
  }
  if (!SUPPORTED_TYPES.includes(extension.toLowerCase())) {
    throw new Error(`Formato não suportado para leitura EXIF: ${extension}. Use: ${SUPPORTED_TYPES.join(', ')}.`);
  }
  try {
    const data = await exifr.parse(imageBuffer, { tiff: true, exif: true, gps: true, icc: true, iptc: true });
    if (!data || Object.keys(data).length === 0) {
      return { _info: 'Nenhum metadado EXIF encontrado nesta imagem.' };
    }
    if (data.latitude !== undefined && data.longitude !== undefined) {
      data._gpsFormatted  = `${data.latitude.toFixed(6)}, ${data.longitude.toFixed(6)}`;
      data._googleMapsUrl = `https://maps.google.com/?q=${data.latitude},${data.longitude}`;
    }
    return data;
  } catch (err) {
    throw new Error(`Falha ao ler EXIF: ${err.message}`);
  }
}

/**
 * Extrai apenas os metadados mais úteis de forma organizada por seção.
 * @param {object} rawExif
 * @returns {{ câmera: object; imagem: object; captura: object; localização: object; outros: object }}
 */
export function summarizeExif(rawExif) {
  const pick = (obj, keys) =>
    keys.reduce((acc, k) => { if (obj[k] !== undefined) acc[k] = obj[k]; return acc; }, {});
  return {
    câmera:      pick(rawExif, ['Make', 'Model', 'LensModel', 'Software']),
    imagem:      pick(rawExif, ['ImageWidth', 'ImageHeight', 'Orientation', 'ColorSpace']),
    captura:     pick(rawExif, ['DateTimeOriginal', 'CreateDate', 'ExposureTime', 'FNumber', 'ISO', 'FocalLength', 'Flash']),
    localização: pick(rawExif, ['latitude', 'longitude', '_gpsFormatted', '_googleMapsUrl', 'GPSAltitude']),
    outros:      pick(rawExif, ['Copyright', 'Artist', 'ImageDescription']),
  };
}
