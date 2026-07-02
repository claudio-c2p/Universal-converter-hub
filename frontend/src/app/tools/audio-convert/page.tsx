'use client';
import { useRef, useState } from 'react';
import ToolLayout from '@/components/ui/ToolLayout';
import FileDropzone from '@/components/ui/FileDropzone';
import ResultActions from '@/components/ui/ResultActions';
import { pushHistoryEntry } from '@/components/ui/HistoryPanel';

type Phase = 'idle' | 'uploading' | 'processing' | 'done' | 'error';
const FORMATS = ['mp3', 'wav', 'ogg'] as const;

export default function AudioConvertPage() {
  const [file, setFile] = useState<File | null>(null);
  const [to, setTo] = useState<(typeof FORMATS)[number]>('mp3');
  const [phase, setPhase] = useState<Phase>('idle');
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ fileId: string; downloadUrl: string; fileName: string } | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  function stopPolling() {
    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = null;
  }

  async function handleConvert() {
    if (!file) return;
    setPhase('uploading');
    setError(null);
    setResult(null);
    try {
      const form = new FormData();
      form.append('file', file);
      form.append('to', to);
      const res = await fetch('/api/audio-video/audio-convert', { method: 'POST', body: form });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.error ?? 'Falha ao iniciar a conversão.');
        setPhase('error');
        return;
      }
      const { jobId } = await res.json();
      setPhase('processing');
      pollRef.current = setInterval(async () => {
        const statusRes = await fetch(`/api/audio-video/jobs/${jobId}`);
        const status = await statusRes.json();
        if (status.status === 'done') {
          stopPolling();
          const dlRes = await fetch(`/api/audio-video/jobs/${jobId}/download`);
          const blob = await dlRes.blob();
          const downloadUrl = URL.createObjectURL(blob);
          const fileName = file.name.replace(/\.[^.]+$/, `.${to}`);
          setResult({ fileId: jobId, downloadUrl, fileName });
          pushHistoryEntry({ toolTitle: 'Conversor de Áudio', fileName, downloadUrl });
          setPhase('done');
        } else if (status.status === 'error') {
          stopPolling();
          setError(status.error ?? 'Falha ao converter o áudio.');
          setPhase('error');
        }
      }, 2000);
    } catch {
      setError('Falha ao iniciar a conversão.');
      setPhase('error');
    }
  }

  const loading = phase === 'uploading' || phase === 'processing';

  return (
    <ToolLayout title="Conversor de Áudio" description="Converta entre MP3, WAV e OGG" category="Áudio e Vídeo">
      <FileDropzone accept=".mp3,.wav,.ogg,.m4a,.flac" maxSizeMB={100} onFileSelect={setFile} />
      <div className="mt-4 flex gap-2">
        {FORMATS.map((fmt) => (
          <button key={fmt} onClick={() => setTo(fmt)}
            className={`rounded-md px-3 py-1.5 text-sm border ${to === fmt ? 'bg-brand-accent text-white border-brand-accent' : 'border-brand-border dark:border-gray-700'}`}>
            {fmt.toUpperCase()}
          </button>
        ))}
      </div>
      <button
        onClick={handleConvert}
        disabled={!file || loading}
        className="mt-4 rounded-md bg-[var(--brand-accent,#E84E1B)] px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
      >
        {phase === 'uploading' ? 'Enviando…' : phase === 'processing' ? 'Processando…' : 'Converter'}
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
