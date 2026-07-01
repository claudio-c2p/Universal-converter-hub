import vCard from 'vcf';
import ical from 'node-ical';

/** A lib `vcf` exige terminadores de linha CRLF estritos — normaliza antes de parsear. */
function normalizeCrlf(content) {
  return content.replace(/\r\n/g, '\n').replace(/\n/g, '\r\n');
}

/** VCF (vCard) → array de objetos simples (JSON-friendly). */
export function vcfToContacts(content) {
  const cards = vCard.parse(normalizeCrlf(content));
  if (!cards.length) throw new Error('Nenhum contato (VCARD) encontrado no arquivo.');
  return cards.map((card) => {
    const get = (prop) => {
      const field = card.get(prop);
      if (!field) return undefined;
      const value = Array.isArray(field) ? field.map((f) => f.valueOf()) : field.valueOf();
      return value;
    };
    return {
      nome: get('fn'),
      telefone: get('tel'),
      email: get('email'),
      organizacao: get('org'),
      endereco: get('adr'),
      aniversario: get('bday'),
    };
  });
}

export function vcfToJson(content) {
  return JSON.stringify(vcfToContacts(content), null, 2);
}

export function vcfToCsv(content) {
  const contacts = vcfToContacts(content);
  const columns = ['nome', 'telefone', 'email', 'organizacao', 'endereco', 'aniversario'];
  const escape = (v) => {
    const s = v === undefined || v === null ? '' : Array.isArray(v) ? v.join('; ') : String(v);
    return /[,"\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const lines = [columns.join(','), ...contacts.map((c) => columns.map((col) => escape(c[col])).join(','))];
  return lines.join('\n');
}

/** ICS (iCalendar) → array de eventos (JSON-friendly). */
export function icsToEvents(content) {
  const data = ical.parseICS(content);
  const events = Object.values(data).filter((item) => item.type === 'VEVENT');
  if (!events.length) throw new Error('Nenhum evento (VEVENT) encontrado no arquivo .ics.');
  return events.map((ev) => ({
    titulo: ev.summary,
    inicio: ev.start,
    fim: ev.end,
    local: ev.location,
    descricao: ev.description,
  }));
}

export function icsToJson(content) {
  return JSON.stringify(icsToEvents(content), null, 2);
}

export function icsToCsv(content) {
  const events = icsToEvents(content);
  const columns = ['titulo', 'inicio', 'fim', 'local', 'descricao'];
  const escape = (v) => {
    const s = v === undefined || v === null ? '' : String(v);
    return /[,"\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const lines = [columns.join(','), ...events.map((e) => columns.map((col) => escape(e[col])).join(','))];
  return lines.join('\n');
}
