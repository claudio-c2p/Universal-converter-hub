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

export default function PdfComparePage() {
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
      const res  = await fetch(`${baseUrl}/api/pdf-advanced/compare`, { method: 'POST', body });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? `Erro ${res.status}`);
      setResult(data);
      setStatus('success');
    } catch (err: unknown) {
      setErrMsg(err instanceof Error ? err.message : 'Erro desconhecido.');
      setStatus('error');
    }
  }

  return (
    <ToolLayout title="Comparar PDFs" description="Compare o texto de dois arquivos PDF e veja as diferenças linha a linha." category="PDF"
      icon={<ToolIcon d="M9 12h6m-6 4h3m6-13H6a2 2 0 00-2 2v14a2 2 0 002 2h12a2 2 0 002-2V8l-5-5z" />}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <p className="mb-2 text-xs text-brand-muted dark:text-gray-400">PDF A</p>
          <FileDropzone accept=".pdf" maxSizeMB={40} onFileSelect={setFileA} label="Arraste o primeiro PDF" />
        </div>
        <div>
          <p className="mb-2 text-xs text-brand-muted dark:text-gray-400">PDF B</p>
          <FileDropzone accept=".pdf" maxSizeMB={40} onFileSelect={setFileB} label="Arraste o segundo PDF" />
        </div>
      </div>
      <button onClick={handleCompare}
        disabled={!fileA || !fileB || status === 'loading'}
        className="mt-6 w-full py-3 rounded-xl bg-brand-accent hover:bg-brand-accentHover text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
        {status === 'loading' ? 'Comparando…' : 'Comparar'}
      </button>
      <ConversionStatus status={status === 'success' ? 'idle' : status} errorMessage={errMsg} />
      {result && (
        <div className="mt-6">
          <DiffViewer
            parts={result.diffs}
            stats={result.stats}
            filenameA={result.filenameA}
            filenameB={result.filenameB}
          />
        </div>
      )}
    </ToolLayout>
  );
}
