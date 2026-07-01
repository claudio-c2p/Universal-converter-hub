import { parseSync, stringifySync } from 'subtitle';

const VALID_FORMATS = ['SRT', 'WebVTT'];

function detectFormat(content) {
  if (/^\s*WEBVTT/i.test(content)) return 'vtt';
  // SRT começa com um número de sequência seguido de quebra de linha
  if (/^\s*\d+\s*\r?\n/.test(content)) return 'srt';
  return null;
}

function validateSubtitleContent(content) {
  if (typeof content !== 'string' || content.trim().length === 0) {
    throw new Error('Conteúdo de legenda vazio ou inválido.');
  }
  if (!detectFormat(content)) {
    throw new Error(
      'Formato de legenda não reconhecido. Envie um arquivo .srt ou .vtt válido.'
    );
  }
}

export function convertSubtitle(content, outputFormat = 'WebVTT') {
  if (!VALID_FORMATS.includes(outputFormat)) {
    throw new Error(
      `Formato de saída inválido: "${outputFormat}". Use ${VALID_FORMATS.join(' ou ')}.`
    );
  }
  validateSubtitleContent(content);

  const inputFormat = detectFormat(content);
  const outputFormatLower = outputFormat === 'WebVTT' ? 'vtt' : 'srt';

  if (inputFormat === outputFormatLower) {
    throw new Error(
      `O arquivo já está no formato ${outputFormat}. Nenhuma conversão necessária.`
    );
  }

  try {
    const nodes = parseSync(content);
    if (!nodes || nodes.length === 0) {
      throw new Error('Nenhuma entrada de legenda encontrada no arquivo.');
    }
    return stringifySync(nodes, { format: outputFormat });
  } catch (err) {
    if (err.message.startsWith('Formato') || err.message.startsWith('Nenhuma') || err.message.startsWith('O arquivo')) {
      throw err;
    }
    throw new Error(`Falha ao converter legenda: ${err.message}`);
  }
}
