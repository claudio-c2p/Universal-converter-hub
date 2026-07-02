'use client';
import { useState } from 'react';
import ToolLayout from '@/components/ui/ToolLayout';

export default function UrlEncodeDecodePage() {
  const [input, setInput] = useState('');
  const [error, setError] = useState<string | null>(null);

  let encoded = '';
  let decoded = '';
  try {
    encoded = encodeURIComponent(input);
  } catch {
    encoded = '';
  }
  try {
    decoded = decodeURIComponent(input);
    if (error) setError(null);
  } catch {
    decoded = '';
  }

  return (
    <ToolLayout title="URL Encode / Decode" description="Codifique ou decodifique texto para uso seguro em URLs." category="Texto">
      <label className="block text-sm">
        <span className="block mb-1 text-brand-muted dark:text-gray-400">Texto de entrada</span>
        <textarea value={input} onChange={(e) => setInput(e.target.value)} rows={4}
          className="w-full rounded-md border border-brand-border dark:border-gray-700 bg-transparent p-3 text-sm font-mono" />
      </label>

      <div className="mt-4">
        <span className="block mb-1 text-xs text-brand-muted dark:text-gray-400">Codificado (encodeURIComponent)</span>
        <div className="flex gap-2">
          <textarea readOnly value={encoded} rows={3}
            className="flex-1 rounded-md border border-brand-border dark:border-gray-700 bg-transparent p-3 text-sm font-mono" />
          <button onClick={() => encoded && navigator.clipboard.writeText(encoded)} disabled={!encoded}
            className="self-start rounded-md border border-brand-border dark:border-gray-700 px-3 py-2 text-sm disabled:opacity-50">
            Copiar
          </button>
        </div>
      </div>

      <div className="mt-4">
        <span className="block mb-1 text-xs text-brand-muted dark:text-gray-400">Decodificado (decodeURIComponent)</span>
        <div className="flex gap-2">
          <textarea readOnly value={decoded} rows={3}
            className="flex-1 rounded-md border border-brand-border dark:border-gray-700 bg-transparent p-3 text-sm font-mono" />
          <button onClick={() => decoded && navigator.clipboard.writeText(decoded)} disabled={!decoded}
            className="self-start rounded-md border border-brand-border dark:border-gray-700 px-3 py-2 text-sm disabled:opacity-50">
            Copiar
          </button>
        </div>
        {!decoded && input && (
          <p className="mt-1 text-xs text-red-500">O texto de entrada não é uma sequência %XX válida para decodificar.</p>
        )}
      </div>
    </ToolLayout>
  );
}
