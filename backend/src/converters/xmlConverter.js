import { XMLParser, XMLBuilder } from 'fast-xml-parser';
import * as yaml from 'js-yaml';
import Papa from 'papaparse';

const PARSER_OPTIONS = {
  ignoreDeclaration:   true,
  ignoreAttributes:    false,
  attributeNamePrefix: '@_',
  parseAttributeValue: true,
  allowBooleanAttributes: true,
};
const BUILDER_OPTIONS = {
  format:             true,
  indentBy:           '  ',
  ignoreAttributes:   false,
  attributeNamePrefix: '@_',
  suppressEmptyNode:  true,
};

const parser  = new XMLParser(PARSER_OPTIONS);
const builder = new XMLBuilder(BUILDER_OPTIONS);

function safeParseXml(xmlString) {
  if (typeof xmlString !== 'string' || xmlString.trim().length === 0) {
    throw new Error('Conteúdo XML vazio.');
  }
  try { return parser.parse(xmlString); }
  catch (err) { throw new Error(`XML inválido: ${err.message}`); }
}

export function xmlToYaml(xmlString) {
  const obj = safeParseXml(xmlString);
  try {
    return yaml.dump(obj, { indent: 2, lineWidth: 120, noRefs: true });
  } catch (err) {
    throw new Error(`Falha ao serializar YAML: ${err.message}`);
  }
}

export function beautifyXml(xmlString) {
  const obj = safeParseXml(xmlString);
  try {
    const result = builder.build(obj);
    // Garante declaração XML no topo se o original a tinha
    const hasDecl = /^\s*<\?xml/i.test(xmlString);
    return hasDecl
      ? `<?xml version="1.0" encoding="UTF-8"?>\n${result}`
      : result;
  } catch (err) {
    throw new Error(`Falha ao formatar XML: ${err.message}`);
  }
}

export function minifyXml(xmlString) {
  safeParseXml(xmlString); // valida antes de modificar
  return xmlString
    .replace(/<!--[\s\S]*?-->/g, '')   // remove comentários
    .replace(/>\s+</g, '><')           // remove espaços entre tags
    .trim();
}

export function xmlToCsv(xmlString, listElementPath) {
  if (!listElementPath || typeof listElementPath !== 'string' || listElementPath.trim().length === 0) {
    throw new Error('Parâmetro "listElementPath" ausente. Ex: "root.item".');
  }
  const obj  = safeParseXml(xmlString);
  const keys = listElementPath.trim().split('.');

  const rows = keys.reduce((current, key) => {
    if (current === null || current === undefined) return undefined;
    if (typeof current !== 'object')               return undefined;
    return current[key];
  }, obj);

  if (rows === undefined || rows === null) {
    throw new Error(
      `O caminho "${listElementPath}" não existe no XML. ` +
      'Use XML→YAML para descobrir a estrutura correta.',
    );
  }
  if (!Array.isArray(rows)) {
    // Tenta coerção: se for um objeto único, embrulha em array
    if (typeof rows === 'object') {
      return Papa.unparse([rows]);
    }
    throw new Error(
      `O caminho "${listElementPath}" não leva a uma lista. ` +
      'Verifique o caminho ou use XML→YAML para estruturas irregulares.',
    );
  }
  if (rows.length === 0) throw new Error('A lista encontrada está vazia.');
  return Papa.unparse(rows);
}
