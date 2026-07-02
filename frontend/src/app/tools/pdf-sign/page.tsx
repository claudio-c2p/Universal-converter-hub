'use client';
import { useState } from 'react';
import ToolLayout from '@/components/ui/ToolLayout';
import ToolIcon from '@/components/ui/ToolIcon';
import FileDropzone from '@/components/ui/FileDropzone';
import ConversionStatus from '@/components/ui/ConversionStatus';

type Status = 'idle' | 'loading' | 'success' | 'error';

export default function PdfSignPage() {
  const [file, setFile] = useState<File | null>(null);
  const [signature, setSignature] = useState<File | null>(null);
  const [pageIndex, setPageIndex] = useState('0');
  const [x, setX] = useState('50');
  const [y, setY] = useState('50');
  const [width, setWidth] = useState('150');
  const [height, setHeight] = useState('60');
  const [status, setStatus] = useState<Status>('idle');
  const [errMsg, setErrMsg] = useState('');

  async function handleSign() {
    if (!file || !signature) return;
    setStatus('loading');
    setErrMsg('');
    try {
      const body = new FormData();
      body.append('file', file);
      body.append('signature', signature);
      body.append('pageIndex', pageIndex);
      body.append('x', x);
      body.append('y', y);
      body.append('width', width);
      body.append('height', height);
      const res = await fetch('/api/pdf-advanced/sign', { method: 'POST', body });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? `Erro ${res.status}`);
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name.replace(/\.pdf$/i, '-assinado.pdf');
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setStatus('success');
    } catch (err: unknown) {
      setErrMsg(err instanceof Error ? err.message : 'Erro desconhecido.');
      setStatus('error');
    }
  }

  return (
    <ToolLayout title="Assinar PDF" description="Sobreponha uma imagem de assinatura em um PDF (assinatura visual, não certificada)." category="PDF"
      icon={<ToolIcon d="M9 12h6m-6 4h3m6-13H6a2 2 0 00-2 2v14a2 2 0 002 2h12a2 2 0 002-2V8l-5-5z" />}>
      <p className="mb-2 text-xs text-brand-muted dark:text-gray-400">1. PDF a assinar</p>
      <FileDropzone accept=".pdf" maxSizeMB={40} onFileSelect={setFile} label="Arraste o PDF aqui" />
      <p className="mt-4 mb-2 text-xs text-brand-muted dark:text-gray-400">2. Imagem da assinatura (PNG com fundo transparente funciona melhor)</p>
      <FileDropzone accept=".png" maxSizeMB={5} onFileSelect={setSignature} label="Arraste a assinatura (PNG) aqui" />
      <p className="mt-4 mb-2 text-xs text-brand-muted dark:text-gray-400">3. Posição na página (em pontos, origem no canto inferior esquerdo)</p>
      <div className="grid grid-cols-2 gap-3">
        {[
          ['Página (0 = primeira)', pageIndex, setPageIndex],
          ['X', x, setX], ['Y', y, setY],
          ['Largura', width, setWidth], ['Altura', height, setHeight],
        ].map(([label, value, setter]: any) => (
          <label key={label} className="text-sm">
            <span className="block mb-1 text-brand-muted dark:text-gray-400">{label}</span>
            <input type="number" value={value} onChange={(e) => setter(e.target.value)}
              className="w-full rounded-md border border-brand-border dark:border-gray-700 bg-transparent px-3 py-2" />
          </label>
        ))}
      </div>
      <button onClick={handleSign}
        disabled={!file || !signature || status === 'loading'}
        className="mt-6 w-full py-3 rounded-xl bg-brand-accent hover:bg-brand-accentHover text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
        {status === 'loading' ? 'Assinando…' : 'Assinar PDF'}
      </button>
      <ConversionStatus status={status} errorMessage={errMsg} successMessage="Pronto! Download iniciado." />
    </ToolLayout>
  );
}
