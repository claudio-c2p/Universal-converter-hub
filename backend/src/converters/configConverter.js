import * as TOML from '@iarna/toml';
import ini from 'ini';
import dotenv from 'dotenv';
import yaml from 'js-yaml';
import { XMLParser, XMLBuilder } from 'fast-xml-parser';

const SUPPORTED_FROM = ['json', 'toml', 'ini', 'env', 'properties', 'yaml', 'xml'];
const SUPPORTED_TO   = ['json', 'toml', 'ini', 'env', 'properties', 'yaml', 'xml'];

// .properties (Java-style) é essencialmente chave=valor linha a linha, sem seções.
function parseProperties(content) {
  const obj = {};
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#') || line.startsWith('!')) continue;
    const idx = line.search(/[=:]/);
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    const val = line.slice(idx + 1).trim();
    obj[key] = val;
  }
  return obj;
}

function serializeProperties(obj) {
  const lines = [];
  for (const [key, val] of Object.entries(flatten(obj))) {
    lines.push(`${key}=${val}`);
  }
  return lines.join('\n');
}

// Achata objetos aninhados em chaves "a.b.c" — necessário para .properties/.env,
// que não suportam estruturas hierárquicas nativamente.
function flatten(obj, prefix = '') {
  const out = {};
  for (const [key, val] of Object.entries(obj ?? {})) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (val !== null && typeof val === 'object' && !Array.isArray(val)) {
      Object.assign(out, flatten(val, fullKey));
    } else {
      out[fullKey] = Array.isArray(val) ? val.join(',') : String(val ?? '');
    }
  }
  return out;
}

const xmlParser  = new XMLParser({ ignoreAttributes: false, trimValues: true });
const xmlBuilder = new XMLBuilder({ ignoreAttributes: false, format: true });

function parseConfig(content, fromFormat) {
  if (!content || content.trim().length === 0) {
    throw new Error('Arquivo de configuração vazio.');
  }
  switch (fromFormat) {
    case 'json':
      try { return JSON.parse(content); }
      catch (err) { throw new Error(`JSON inválido: ${err.message}`); }
    case 'toml':
      try { return TOML.parse(content); }
      catch (err) { throw new Error(`TOML inválido: ${err.message}`); }
    case 'ini':
      try { return ini.parse(content); }
      catch (err) { throw new Error(`INI inválido: ${err.message}`); }
    case 'env':
      try { return dotenv.parse(content); }
      catch (err) { throw new Error(`ENV inválido: ${err.message}`); }
    case 'properties':
      try { return parseProperties(content); }
      catch (err) { throw new Error(`Properties inválido: ${err.message}`); }
    case 'yaml':
      try { return yaml.load(content) ?? {}; }
      catch (err) { throw new Error(`YAML inválido: ${err.message}`); }
    case 'xml':
      try { return xmlParser.parse(content); }
      catch (err) { throw new Error(`XML inválido: ${err.message}`); }
    default:
      throw new Error(
        `Formato de entrada desconhecido: "${fromFormat}". Use: ${SUPPORTED_FROM.join(', ')}.`
      );
  }
}

function serializeConfig(obj, toFormat) {
  switch (toFormat) {
    case 'json':
      return JSON.stringify(obj, null, 2);
    case 'toml':
      try { return TOML.stringify(obj); }
      catch (err) {
        throw new Error(
          `Falha ao serializar TOML: ${err.message}. ` +
          'Estruturas aninhadas complexas podem não ser suportadas pelo formato TOML.'
        );
      }
    case 'ini':
      return ini.stringify(obj);
    case 'env': {
      const lines = [];
      for (const [key, val] of Object.entries(obj)) {
        if (val !== null && typeof val === 'object') {
          throw new Error(
            'O formato .env não suporta valores aninhados. ' +
            'Use JSON ou TOML para estruturas complexas.'
          );
        }
        // Valores com espaços ou caracteres especiais recebem aspas
        const strVal = String(val ?? '');
        const needsQuotes = /[\s"'#]/.test(strVal);
        lines.push(`${key}=${needsQuotes ? `"${strVal.replace(/"/g, '\\"')}"` : strVal}`);
      }
      return lines.join('\n');
    }
    case 'properties':
      return serializeProperties(obj);
    case 'yaml':
      return yaml.dump(obj);
    case 'xml':
      return xmlBuilder.build(obj);
    default:
      throw new Error(
        `Formato de saída desconhecido: "${toFormat}". Use: ${SUPPORTED_TO.join(', ')}.`
      );
  }
}

export function convertConfig(content, fromFormat, toFormat) {
  if (!SUPPORTED_FROM.includes(fromFormat)) {
    throw new Error(`Formato de entrada inválido: "${fromFormat}". Use: ${SUPPORTED_FROM.join(', ')}.`);
  }
  if (!SUPPORTED_TO.includes(toFormat)) {
    throw new Error(`Formato de saída inválido: "${toFormat}". Use: ${SUPPORTED_TO.join(', ')}.`);
  }
  if (fromFormat === toFormat) {
    throw new Error('Formatos de entrada e saída são iguais. Nenhuma conversão necessária.');
  }
  const obj = parseConfig(content, fromFormat);
  return serializeConfig(obj, toFormat);
}
