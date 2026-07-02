'use client';
import { useState } from 'react';
import ToolLayout from '@/components/ui/ToolLayout';
import FileDropzone from '@/components/ui/FileDropzone';
import ResultActions from '@/components/ui/ResultActions';
import { pushHistoryEntry } from '@/components/ui/HistoryPanel';

export default function PngToWebpPage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ fileId: string; downloadUrl: string; fileName: string } | null>(null);

  async function handleConvert() {
    if (!file) return;
    setLoading(true);
    setError(null);
    try {
      const form = new FormData();
      form.append('file', file);
      form.append('to', 'webp');
      const res = await fetch('/api/image/convert', { method: 'POST', body: form });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.error ?? 'Falha ao converter a imagem.');
        return;
      }
      const blob = await res.blob();
      const downloadUrl = URL.createObjectURL(blob);
      const fileName = file.name.replace(/\.[^.]+$/, '.webp');
      setResult({ fileId: crypto.randomUUID(), downloadUrl, fileName });
      pushHistoryEntry({ toolTitle: 'PNG → WEBP', fileName, downloadUrl });
    } catch {
      setError('Falha ao converter a imagem.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <ToolLayout title="PNG → WEBP" description="Converta imagens PNG para WEBP" category="Imagem">
      <FileDropzone accept=".png" maxSizeMB={25} onFileSelect={setFile} />
      <button
        onClick={handleConvert}
        disabled={!file || loading}
        className="mt-4 rounded-md bg-[var(--brand-accent,#E84E1B)] px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
      >
        {loading ? 'Convertendo…' : 'Converter'}
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
