import { convertImage } from './imageConverter.js';
// import demais conversores conforme forem sendo criados

// chave = "formatoOrigem->formatoDestino"
export const CONVERTERS = {
  'png->webp': { fn: (buf) => convertImage(buf, 'webp'), module: 'imageConverter' },
  'png->jpg': { fn: (buf) => convertImage(buf, 'jpg'), module: 'imageConverter' },
  'jpg->png': { fn: (buf) => convertImage(buf, 'png'), module: 'imageConverter' },
  'webp->png': { fn: (buf) => convertImage(buf, 'png'), module: 'imageConverter' },
  // ... acrescentar 1 linha por par suportado, nunca duplicar lógica de conversão aqui
};

export function buildFormatsGraph() {
  const graph = {};
  for (const key of Object.keys(CONVERTERS)) {
    const [from, to] = key.split('->');
    if (!graph[from]) graph[from] = [];
    if (!graph[from].includes(to)) graph[from].push(to);
  }
  return graph;
}
