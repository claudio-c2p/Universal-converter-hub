'use client';
import { useEffect, useState } from 'react';
import ToolLayout from '@/components/ui/ToolLayout';
import ResultActions from '@/components/ui/ResultActions';
import { pushHistoryEntry } from '@/components/ui/HistoryPanel';
import { fetchFormatsGraph } from '@/lib/formatsGraph';
import ChainBuilder, { type ChainStepConfig } from '@/components/chain/ChainBuilder';

export default function CadeiaPage() {
  const [formatsGraph, setFormatsGraph] = useState<Record<string, string[]>>({});
  const [loadingGraph, setLoadingGraph] = useState(true);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ fileId: string; downloadUrl: string; fileName: string } | null>(null);

  useEffect(() => {
    fetchFormatsGraph()
      .then(setFormatsGraph)
      .catch((e) => setError(e.message))
      .finally(() => setLoadingGraph(false));
  }, []);

  async function handleSubmit(file: File, steps: ChainStepConfig[]) {
    setRunning(true);
    setError(null);
    setResult(null);
    try {
      const form = new FormData();
      form.append('file', file);
      form.append('steps', JSON.stringify(steps.map((s) => `${s.from}->${s.to}`)));
      const res = await fetch('/api/chain-convert', { method: 'POST', body: form });
      const data = await res.json();
      if (!data.success) {
        setError(data.error ?? 'Falha ao executar a cadeia de conversão.');
        return;
      }
      const fileName = file.name.replace(/\.[^.]+$/, `.${data.finalFormat}`);
      setResult({ fileId: data.downloadUrl.split('/').pop(), downloadUrl: data.downloadUrl, fileName });
      pushHistoryEntry({ toolTitle: 'Converter em cadeia', fileName, downloadUrl: data.downloadUrl });
    } catch {
      setError('Falha ao executar a cadeia de conversão.');
    } finally {
      setRunning(false);
    }
  }

  return (
    <ToolLayout
      title="Converter em cadeia"
      description="Encadeie até 5 conversões sucessivas em um único arquivo"
      category="Dev"
    >
      {loadingGraph && <p className="text-sm text-[var(--text-secondary)]">Carregando formatos disponíveis…</p>}
      {!loadingGraph && (
        <ChainBuilder formatsGraph={formatsGraph} onSubmit={handleSubmit} />
      )}
      {running && <p className="mt-3 text-sm text-[var(--text-secondary)]">Executando cadeia…</p>}
      {error && <p className="mt-3 text-sm text-red-500">{error}</p>}
      {result && (
        <div className="mt-4">
          <ResultActions {...result} />
        </div>
      )}
    </ToolLayout>
  );
}
