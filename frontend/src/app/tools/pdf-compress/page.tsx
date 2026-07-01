'use client';
import { useState } from 'react';
import FileDropzone from '@/components/ui/FileDropzone';
import ConversionStatus from '@/components/ui/ConversionStatus';
import ToolLayout from '@/components/ui/ToolLayout';
import ToolIcon from '@/components/ui/ToolIcon';

type Status = 'idle' | 'loading' | 'success' | 'error';

export default function PdfCompressPage() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<Status>('idle');
  const [errMsg, setErrMsg] = useState('');
  const [originalSize, setOriginalSize] = useState<number | null>(null);
  const [compressedSize, setCompressedSize] = useState<number | null>(null);
  const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? '';

  async function handleCompress() {
    if (!file) return;
    setStatus('loading');
    setErrMsg('');
    setOriginalSize(null);
    setCompressedSize(null);
    try {
      const body = new FormData();
      body.append('file', file);
      const res = await fetch(`${baseUrl}/api/pdf-tools/compress`, { method: 'POST', body });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error ?? `Erro ${res.status}`);
      }
      const orig = Number(res.headers.get('X-Original-Size'));
      const comp = Number(res.headers.get('X-Compressed-Size'));
      if (orig) setOriginalSize(orig);
      if (comp) setCompressedSize(comp);

      const blob = await res.blob();
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'compressed_' + file.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(a.href);
      setStatus('success');
    } catch (err: unknown) {
      setErrMsg(err instanceof Error ? err.message : 'Erro desconhecido.');
      setStatus('error');
    }
  }

  const fmt = (b: number) => b < 1024 * 1024
    ? `${(b / 1024).toFixed(1)} KB`
    : `${(b / 1024 / 1024).toFixed(2)} MB`;

  return (
    <ToolLayout
      title="Comprimir PDF"
      description="Reduz o tamanho do arquivo PDF usando reescrita de objetos."
      category="PDF"
      icon={<ToolIcon d="M19 14l-7 7m0 0l-7-7m7 7V3" />}
    >
      <FileDropzone accept=".pdf" maxSizeMB={50} onFileSelect={(f) => { setFile(f); setStatus('idle'); }} label="Arraste o arquivo .pdf aqui" />

      <button
        onClick={handleCompress}
        disabled={!file || status === 'loading'}
        className="mt-6 w-full py-3 rounded-xl bg-brand-accent hover:bg-brand-accentHover text-white
                   font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {status === 'loading' ? 'Comprimindo…' : 'Comprimir PDF'}
      </button>

      {status === 'success' && originalSize && compressedSize && (
        <div className="mt-4 p-4 rounded-xl bg-green-50 dark:bg-green-900/20 text-sm text-green-700 dark:text-green-300 space-y-1">
          <p>✅ PDF comprimido! Download iniciado.</p>
          <p className="text-xs">
            Original: <strong>{fmt(originalSize)}</strong> → Comprimido: <strong>{fmt(compressedSize)}</strong>
            {' '}({Math.round((1 - compressedSize / originalSize) * 100)}% menor)
          </p>
        </div>
      )}

      {status !== 'success' && (
        <ConversionStatus status={status} errorMessage={errMsg} successMessage="" />
      )}
    </ToolLayout>
  );
}
