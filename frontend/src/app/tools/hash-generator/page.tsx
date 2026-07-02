'use client';
import { useEffect, useState } from 'react';
import ToolLayout from '@/components/ui/ToolLayout';

async function digest(algorithm: 'SHA-1' | 'SHA-256', text: string) {
  const enc = new TextEncoder().encode(text);
  const buf = await crypto.subtle.digest(algorithm, enc);
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

export default function HashGeneratorPage() {
  const [text, setText] = useState('');
  const [sha1, setSha1] = useState('');
  const [sha256, setSha256] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!text) { setSha1(''); setSha256(''); return; }
      const [a, b] = await Promise.all([digest('SHA-1', text), digest('SHA-256', text)]);
      if (!cancelled) { setSha1(a); setSha256(b); }
    })();
    return () => { cancelled = true; };
  }, [text]);

  return (
    <ToolLayout title="Gerador de Hash" description="Gere hashes SHA-1 e SHA-256 de um texto via Web Crypto API." category="Texto">
      <label className="block text-sm">
        <span className="block mb-1 text-brand-muted dark:text-gray-400">Texto</span>
        <textarea value={text} onChange={(e) => setText(e.target.value)} rows={5}
          className="w-full rounded-md border border-brand-border dark:border-gray-700 bg-transparent p-3 text-sm font-mono" />
      </label>
      {[['SHA-1', sha1], ['SHA-256', sha256]].map(([label, value]) => (
        <div key={label} className="mt-4">
          <span className="block mb-1 text-xs text-brand-muted dark:text-gray-400">{label}</span>
          <div className="flex gap-2">
            <input readOnly value={value} className="flex-1 rounded-md border border-brand-border dark:border-gray-700 bg-transparent px-3 py-2 text-sm font-mono" />
            <button onClick={() => value && navigator.clipboard.writeText(value)}
              disabled={!value}
              className="rounded-md border border-brand-border dark:border-gray-700 px-3 py-2 text-sm disabled:opacity-50">
              Copiar
            </button>
          </div>
        </div>
      ))}
    </ToolLayout>
  );
}
