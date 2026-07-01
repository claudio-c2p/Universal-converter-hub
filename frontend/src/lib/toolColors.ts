// Cada categoria tem um ícone em quadrado com gradiente sólido e ícone branco,
// no estilo "PDF vermelho / Excel verde / Word azul" preferido pelo cliente.
const RAMPS: Record<string, { box: string; text: string; hover: string }> = {
  red:     { box: 'bg-gradient-to-br from-red-500 to-red-700 shadow-sm shadow-red-900/20',         text: 'text-white', hover: '' },
  green:   { box: 'bg-gradient-to-br from-green-500 to-green-700 shadow-sm shadow-green-900/20',     text: 'text-white', hover: '' },
  blue:    { box: 'bg-gradient-to-br from-blue-500 to-blue-700 shadow-sm shadow-blue-900/20',       text: 'text-white', hover: '' },
  orange:  { box: 'bg-gradient-to-br from-orange-500 to-orange-700 shadow-sm shadow-orange-900/20', text: 'text-white', hover: '' },
  amber:   { box: 'bg-gradient-to-br from-amber-500 to-amber-700 shadow-sm shadow-amber-900/20',   text: 'text-white', hover: '' },
  teal:    { box: 'bg-gradient-to-br from-teal-500 to-teal-700 shadow-sm shadow-teal-900/20',       text: 'text-white', hover: '' },
  indigo:  { box: 'bg-gradient-to-br from-indigo-500 to-indigo-700 shadow-sm shadow-indigo-900/20', text: 'text-white', hover: '' },
  emerald: { box: 'bg-gradient-to-br from-emerald-500 to-emerald-700 shadow-sm shadow-emerald-900/20', text: 'text-white', hover: '' },
  purple:  { box: 'bg-gradient-to-br from-purple-500 to-purple-700 shadow-sm shadow-purple-900/20', text: 'text-white', hover: '' },
  pink:    { box: 'bg-gradient-to-br from-pink-500 to-pink-700 shadow-sm shadow-pink-900/20',       text: 'text-white', hover: '' },
  fuchsia: { box: 'bg-gradient-to-br from-fuchsia-500 to-fuchsia-700 shadow-sm shadow-fuchsia-900/20', text: 'text-white', hover: '' },
  slate:   { box: 'bg-gradient-to-br from-slate-500 to-slate-700 shadow-sm shadow-slate-900/20',     text: 'text-white', hover: '' },
  cyan:    { box: 'bg-gradient-to-br from-cyan-500 to-cyan-700 shadow-sm shadow-cyan-900/20',       text: 'text-white', hover: '' },
  gray:    { box: 'bg-gradient-to-br from-gray-500 to-gray-700 shadow-sm shadow-gray-900/20',       text: 'text-white', hover: '' },
  violet:  { box: 'bg-gradient-to-br from-violet-500 to-violet-700 shadow-sm shadow-violet-900/20', text: 'text-white', hover: '' },
  yellow:  { box: 'bg-gradient-to-br from-yellow-500 to-yellow-700 shadow-sm shadow-yellow-900/20', text: 'text-white', hover: '' },
};

// Ordem importa: regras mais específicas primeiro, pois o título pode conter
// mais de uma palavra-chave (ex: "PDF → imagem" não deve virar cor de imagem).
const RULES: { kw: RegExp; ramp: keyof typeof RAMPS }[] = [
  { kw: /\bPDF\b/i,                                              ramp: 'red' },
  { kw: /EXCEL|XLSX|XLS\b|PLANILHA|CSV/i,                        ramp: 'green' },
  { kw: /\bWORD\b|DOCX|\bDOC\b|\bRTF\b|\bODT\b/i,                 ramp: 'blue' },
  { kw: /PPT|POWERPOINT|APRESENTA/i,                             ramp: 'orange' },
  { kw: /\bJSON\b/i,                                             ramp: 'amber' },
  { kw: /\bXML\b/i,                                              ramp: 'teal' },
  { kw: /\bSQL\b|SQLITE|\bMDB\b|\bDBF\b|BANCO DE DADOS/i,        ramp: 'indigo' },
  { kw: /GEO|\bKML\b|\bGPX\b|GEOJSON/i,                          ramp: 'emerald' },
  { kw: /EPUB|MOBI|AZW|FB2|CBR|CBZ|DJVU|\bCHM\b|EBOOK/i,         ramp: 'purple' },
  { kw: /FONTE|\bTTF\b|\bWOFF\b|\bEOT\b/i,                       ramp: 'pink' },
  { kw: /EXIF|JPG|PNG|IMAGEM/i,                                  ramp: 'fuchsia' },
  { kw: /CONFIG|\bENV\b|\bTOML\b|\bINI\b|\bYAML\b|\bYML\b/i,      ramp: 'slate' },
  { kw: /LEGENDA|\bSRT\b|\bVTT\b|SUBTITLE/i,                     ramp: 'cyan' },
  { kw: /DIFF|FIND|REPLACE|RENOME|LOTE/i,                        ramp: 'gray' },
  { kw: /\bTEX\b|LATEX/i,                                        ramp: 'violet' },
  { kw: /\bVCF\b|\bICS\b/i,                                      ramp: 'yellow' },
];

// Fallback por categoria: caso o título não bata com nenhuma palavra-chave acima,
// a ferramenta ainda recebe uma caixinha de cor sólida (igual ao PDF vermelho),
// só que baseada na cor da categoria, em vez do estilo "clarinho" só com borda.
const CATEGORY_RAMP: Record<string, keyof typeof RAMPS> = {
  PDF: 'red',
  Office: 'blue',
  Dados: 'purple',
  Documento: 'blue',
  eBook: 'teal',
  'Banco de Dados': 'indigo',
  Geo: 'green',
  Mídia: 'orange',
  Config: 'slate',
  Dev: 'gray',
  Fonte: 'pink',
  Utilitário: 'yellow',
};

export function getToolColor(title: string, category?: string) {
  for (const rule of RULES) {
    if (rule.kw.test(title)) return RAMPS[rule.ramp];
  }
  if (category && CATEGORY_RAMP[category]) return RAMPS[CATEGORY_RAMP[category]];
  return RAMPS.gray;
}
