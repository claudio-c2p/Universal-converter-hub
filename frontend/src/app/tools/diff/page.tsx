'use client';
import { useState } from 'react';
import ConversionStatus from '@/components/ui/ConversionStatus';
import DiffViewer from '@/components/ui/DiffViewer';
import FileDropzone from '@/components/ui/FileDropzone';
import ToolLayout from '@/components/ui/ToolLayout';
import ToolIcon from '@/components/ui/ToolIcon';

interface DiffStats   { additions: number; deletions: number; unchanged: number; identical: boolean; }
interface DiffPart    { value: string; added: boolean; removed: boolean; }
interface DiffResult  { filenameA: string; filenameB: string; stats: DiffStats; diffs: DiffPart[]; }

type Status = 'idle' | 'loading' | 'success' | 'error';

const ACCEPT = '.txt,.md,.json,.csv,.xml,.yaml,.yml,.html,.js,.ts,.py,.sql,.toml,.ini,.env';

export default function DiffPage() {
  const [fileA,  setFileA]  = useState<File | null>(null);
  const [fileB,  setFileB]  = useState<File | null>(null);
  const [result, setResult] = useState<DiffResult | null>(null);
  const [status, setStatus] = useState<Status>('idle');
  const [errMsg, setErrMsg] = useState('');

  const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? '';

  async function handleCompare() {
    if (!fileA || !fileB) return;
    setStatus('loading'); setResult(null); setErrMsg('');
    try {
      const body = new FormData();
      body.append('fileA', fileA);
      body.append('fileB', fileB);
      const res  = await fetch(`${baseUrl}/api/diff/compare`, { method: 'POST', body });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? `Erro ${res.status}`);
      setResult(data);
      setStatus('success');
    } catch (err: unknown) {
      setErrMsg(err instanceof Error ? err.message : 'Erro desconhecido.');
      setStatus('error');
    }
  }

  async function handleDownloadPatch() {
    if (!fileA || !fileB) return;
    try {
      const body = new FormData();
      body.append('fileA', fileA);
      body.append('fileB', fileB);
      const res = await fetch(`${baseUrl}/api/diff/patch`, { method: 'POST', body });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error ?? `Erro ${res.status}`);
      }
      // Backend retorna JSON { identical: true } se arquivos forem iguais
      const ct = res.headers.get('Content-Type') ?? '';
      if (ct.includes('application/json')) {
        const d = await res.json();
        if (d.identical) { alert('Os arquivos são idênticos — nenhum patch gerado.'); return; }
        return;
      }
      const blob = await res.blob();
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href     = url;
      a.download = 'diff.patch';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Erro ao baixar patch.');
    }
  }

  const FileInput = ({
    label, onChange,
  }: { label: string; onChange: (f: File | null) => void }) => (
    <div className="flex-1">
      <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">{label}</label>
      <FileDropzone
        accept={ACCEPT}
        maxSizeMB={50}
        onFileSelect={onChange}
        label="Arraste o arquivo aqui ou clique"
      />
    </div>
  );

  return (
    <ToolLayout title="Comparador de Arquivos (Diff)" description="Veja exatamente o que mudou entre dois arquivos de texto." category="Dev" icon={<ToolIcon d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2M9 12h.01M13 16h6m-6-4h6" />}>
      <div className="flex flex-col sm:flex-row gap-4 mb-5">
        <FileInput label="Arquivo A (original)"   onChange={setFileA} />
        <FileInput label="Arquivo B (modificado)" onChange={setFileB} />
      </div>

      <button
        onClick={handleCompare}
        disabled={!fileA || !fileB || status === 'loading'}
        className="w-full py-3 rounded-xl bg-brand-accent hover:bg-brand-accentHover text-white font-semibold
                   disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {status === 'loading' ? 'Comparando…' : 'Comparar arquivos'}
      </button>

      {/* Só mostra erro; sucesso é mostrado pelo DiffViewer */}
      <ConversionStatus status={status === 'success' ? 'idle' : status} errorMessage={errMsg} />

      {result && (
        <div className="mt-6">
          <DiffViewer
            parts={result.diffs}
            stats={result.stats}
            filenameA={result.filenameA}
            filenameB={result.filenameB}
          />
          {!result.stats.identical && (
            <button
              onClick={handleDownloadPatch}
              className="mt-3 text-sm text-brand-accent hover:underline"
            >
              Baixar como .patch
            </button>
          )}
        </div>
      )}
    </ToolLayout>
  );
}
