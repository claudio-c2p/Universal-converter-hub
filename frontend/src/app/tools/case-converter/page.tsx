'use client';
import { useMemo, useState } from 'react';
import ToolLayout from '@/components/ui/ToolLayout';

function toWords(text: string) {
  return text
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[_\-]+/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
}

function toCamel(words: string[]) {
  return words
    .map((w, i) => (i === 0 ? w.toLowerCase() : w[0].toUpperCase() + w.slice(1).toLowerCase()))
    .join('');
}
function toPascal(words: string[]) {
  return words.map((w) => w[0].toUpperCase() + w.slice(1).toLowerCase()).join('');
}
function toSnake(words: string[]) {
  return words.map((w) => w.toLowerCase()).join('_');
}
function toKebab(words: string[]) {
  return words.map((w) => w.toLowerCase()).join('-');
}
function toTitle(words: string[]) {
  return words.map((w) => w[0].toUpperCase() + w.slice(1).toLowerCase()).join(' ');
}

export default function CaseConverterPage() {
  const [text, setText] = useState('exemplo de texto para converter');

  const results = useMemo(() => {
    const words = toWords(text);
    if (words.length === 0) return null;
    return {
      'MAIÚSCULAS': text.toUpperCase(),
      'minúsculas': text.toLowerCase(),
      'Title Case': toTitle(words),
      'camelCase': toCamel(words),
      'PascalCase': toPascal(words),
      'snake_case': toSnake(words),
      'kebab-case': toKebab(words),
    };
  }, [text]);

  return (
    <ToolLayout title="Conversor de Case" description="Converta texto entre maiúsculas, minúsculas, camelCase, snake_case e mais." category="Texto">
      <label className="block text-sm">
        <span className="block mb-1 text-brand-muted dark:text-gray-400">Texto</span>
        <textarea value={text} onChange={(e) => setText(e.target.value)} rows={3}
          className="w-full rounded-md border border-brand-border dark:border-gray-700 bg-transparent p-3 text-sm" />
      </label>
      {results && (
        <div className="mt-4 space-y-2">
          {Object.entries(results).map(([label, value]) => (
            <div key={label} className="flex items-center gap-2">
              <span className="w-28 shrink-0 text-xs text-brand-muted dark:text-gray-400">{label}</span>
              <input readOnly value={value} className="flex-1 rounded-md border border-brand-border dark:border-gray-700 bg-transparent px-3 py-2 text-sm font-mono" />
              <button onClick={() => navigator.clipboard.writeText(value)}
                className="rounded-md border border-brand-border dark:border-gray-700 px-3 py-2 text-xs">Copiar</button>
            </div>
          ))}
        </div>
      )}
    </ToolLayout>
  );
}
