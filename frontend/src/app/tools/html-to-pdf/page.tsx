'use client';
import { useState } from 'react';
import ToolLayout from '@/components/ui/ToolLayout';
import ResultActions from '@/components/ui/ResultActions';
import { pushHistoryEntry } from '@/components/ui/HistoryPanel';

export default function HtmlToPdfPage() {
  const [html, setHtml] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ fileId: string; downloadUrl: string; fileName: string } | null>(null);

  async function handleConvert() {
    if (!html.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/image-extra/html-to-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ html }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.error ?? 'Falha ao gerar o PDF.');
        return;
      }
      const blob = await res.blob();
      const downloadUrl = URL.createObjectURL(blob);
      const fileName = 'convertido.pdf';
      setResult({ fileId: crypto.randomUUID(), downloadUrl, fileName });
      pushHistoryEntry({ toolTitle: 'HTML → PDF', fileName, downloadUrl });
    } catch {
      setError('Falha ao gerar o PDF.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <ToolLayout title="HTML → PDF" description="Cole um trecho de HTML e gere um PDF formatado (A4)" category="PDF">
      <textarea
        value={html}
        onChange={(e) => setHtml(e.target.value)}
        placeholder="<h1>Olá mundo</h1><p>Cole seu HTML aqui...</p>"
        rows={10}
        className="w-full rounded-md border border-brand-border dark:border-gray-700 bg-transparent p-3 text-sm font-mono
                   focus:outline-none focus:ring-2 focus:ring-brand-accent/40"
      />
      <p className="mt-2 text-xs text-brand-muted dark:text-gray-500">
        Recursos externos (imagens/scripts remotos) não são carregados — use apenas HTML e CSS embutidos.
      </p>
      <button
        onClick={handleConvert}
        disabled={!html.trim() || loading}
        className="mt-4 rounded-md bg-[var(--brand-accent,#E84E1B)] px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
      >
        {loading ? 'Gerando…' : 'Gerar PDF'}
      </button>
      {error && <p className="mt-3 text-sm text-red-500">{error}</p>}
      {result && (
        <div className="mt-4">
          <ResultActions {...result} />
        </div>
      )}
    </ToolLayout>
  );
}
