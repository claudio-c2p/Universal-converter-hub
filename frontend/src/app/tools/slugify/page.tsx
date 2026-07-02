'use client';
import { useMemo, useState } from 'react';
import ToolLayout from '@/components/ui/ToolLayout';

function slugify(text: string) {
  return text
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // remove acentos
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export default function SlugifyPage() {
  const [text, setText] = useState('Meu Título com Acentuação & Símbolos!');
  const slug = useMemo(() => slugify(text), [text]);

  return (
    <ToolLayout title="Gerador de Slug" description="Transforme qualquer texto em um slug amigável para URLs." category="Texto">
      <label className="block text-sm">
        <span className="block mb-1 text-brand-muted dark:text-gray-400">Texto</span>
        <textarea value={text} onChange={(e) => setText(e.target.value)} rows={3}
          className="w-full rounded-md border border-brand-border dark:border-gray-700 bg-transparent p-3 text-sm" />
      </label>
      <div className="mt-4 flex gap-2">
        <input readOnly value={slug} className="flex-1 rounded-md border border-brand-border dark:border-gray-700 bg-transparent px-3 py-2 text-sm font-mono" />
        <button onClick={() => slug && navigator.clipboard.writeText(slug)} disabled={!slug}
          className="rounded-md border border-brand-border dark:border-gray-700 px-3 py-2 text-sm disabled:opacity-50">Copiar</button>
      </div>
    </ToolLayout>
  );
}
