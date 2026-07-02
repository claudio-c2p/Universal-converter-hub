'use client';
import { useRef, useState } from 'react';
import ToolLayout from '@/components/ui/ToolLayout';
import FileDropzone from '@/components/ui/FileDropzone';
import ResultActions from '@/components/ui/ResultActions';
import { pushHistoryEntry } from '@/components/ui/HistoryPanel';

type Phase = 'idle' | 'uploading' | 'processing' | 'done' | 'error';

export default function VideoToGifPage() {
  const [file, setFile] = useState<File | null>(null);
  const [startSeconds, setStartSeconds] = useState('0');
  const [durationSeconds, setDurationSeconds] = useState('5');
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
      form.append('startSeconds', startSeconds);
      form.append('durationSeconds', durationSeconds);
      const res = await fetch('/api/audio-video/video-to-gif', { method: 'POST', body: form });
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
          const fileName = file.name.replace(/\.[^.]+$/, '.gif');
          setResult({ fileId: jobId, downloadUrl, fileName });
          pushHistoryEntry({ toolTitle: 'Vídeo → GIF', fileName, downloadUrl });
          setPhase('done');
        } else if (status.status === 'error') {
          stopPolling();
          setError(status.error ?? 'Falha ao processar o vídeo.');
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
    <ToolLayout title="Vídeo → GIF" description="Corte e converta um trecho de vídeo em GIF animado" category="Áudio e Vídeo">
      <FileDropzone accept=".mp4,.mov,.webm,.mkv,.avi" maxSizeMB={100} onFileSelect={setFile} />
      <div className="mt-4 grid grid-cols-2 gap-3">
        <label className="text-sm">
          <span className="block mb-1 text-brand-muted dark:text-gray-400">Início (segundos)</span>
          <input type="number" min={0} value={startSeconds} onChange={(e) => setStartSeconds(e.target.value)}
            className="w-full rounded-md border border-brand-border dark:border-gray-700 bg-transparent px-3 py-2" />
        </label>
        <label className="text-sm">
          <span className="block mb-1 text-brand-muted dark:text-gray-400">Duração (segundos)</span>
          <input type="number" min={1} max={30} value={durationSeconds} onChange={(e) => setDurationSeconds(e.target.value)}
            className="w-full rounded-md border border-brand-border dark:border-gray-700 bg-transparent px-3 py-2" />
        </label>
      </div>
      <button
        onClick={handleConvert}
        disabled={!file || loading}
        className="mt-4 rounded-md bg-[var(--brand-accent,#E84E1B)] px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
      >
        {phase === 'uploading' ? 'Enviando…' : phase === 'processing' ? 'Processando (pode levar até 1 min)…' : 'Converter'}
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
