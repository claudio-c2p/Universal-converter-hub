'use client';
import { useState } from 'react';
import FileDropzone from '@/components/ui/FileDropzone';
import ConversionStatus from '@/components/ui/ConversionStatus';
import ToolLayout from '@/components/ui/ToolLayout';
import ToolIcon from '@/components/ui/ToolIcon';

type Status = 'idle' | 'loading' | 'success' | 'error';

interface ExifSummary {
  câmera:      Record<string, unknown>;
  imagem:      Record<string, unknown>;
  captura:     Record<string, unknown>;
  localização: Record<string, unknown>;
  outros:      Record<string, unknown>;
}

const SECTION_LABELS: Record<keyof ExifSummary, string> = {
  câmera:      '📷 Câmera',
  imagem:      '🖼 Imagem',
  captura:     '⚙️ Captura',
  localização: '📍 Localização GPS',
  outros:      '📝 Outros',
};

function MetaSection({ title, data }: { title: string; data: Record<string, unknown> }) {
  const entries = Object.entries(data).filter(([, v]) => v !== undefined && v !== null);
  if (entries.length === 0) return null;
  return (
    <div className="mb-4">
      <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">{title}</h3>
      <div className="rounded-xl border border-brand-border dark:border-gray-700 overflow-hidden">
        {entries.map(([key, value], i) => (
          <div
            key={key}
            className={`flex justify-between gap-4 px-3 py-2 text-sm
              ${i % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-brand-surface dark:bg-gray-900'}`}
          >
            <span className="text-gray-500 dark:text-gray-400 shrink-0 font-medium">{key}</span>
            <span className="text-gray-800 dark:text-gray-200 text-right break-all font-mono text-xs">
              {key === '_googleMapsUrl' ? (
                <a
                  href={String(value)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand-accent hover:underline"
                >
                  Abrir no Maps
                </a>
              ) : (
                String(value)
              )}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ExifPage() {
  const [file,      setFile]      = useState<File | null>(null);
  const [summary,   setSummary]   = useState<ExifSummary | null>(null);
  const [rawData,   setRawData]   = useState<Record<string, unknown> | null>(null);
  const [showRaw,   setShowRaw]   = useState(false);
  const [noExifMsg, setNoExifMsg] = useState('');
  const [status,    setStatus]    = useState<Status>('idle');
  const [errMsg,    setErrMsg]    = useState('');

  const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? '';

  async function handleRead() {
    if (!file) return;
    setStatus('loading');
    setErrMsg('');
    setSummary(null);
    setRawData(null);
    setNoExifMsg('');
    setShowRaw(false);
    try {
      const body = new FormData();
      body.append('file', file);
      const res  = await fetch(`${baseUrl}/api/exif/read`, { method: 'POST', body });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? `Erro ${res.status}`);

      if (!data.summary) {
        setNoExifMsg(data.message ?? 'Nenhum metadado EXIF encontrado nesta imagem.');
      } else {
        setSummary(data.summary);
        setRawData(data.data ?? null);
      }
      setStatus('success');
    } catch (err: unknown) {
      setErrMsg(err instanceof Error ? err.message : 'Erro desconhecido.');
      setStatus('error');
    }
  }

  function downloadJson(data: unknown, label: string) {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `${file?.name ?? 'exif'}_${label}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  return (
    <ToolLayout title="Leitor de EXIF" description="Veja câmera, data, GPS e outros metadados da sua imagem." category="Utilitário" icon={<ToolIcon d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z M12 13a3 3 0 100 6 3 3 0 000-6z" />}>
      <FileDropzone
        accept=".jpg,.jpeg,.png,.tiff,.heic,.heif,.webp"
        maxSizeMB={30}
        onFileSelect={setFile}
        label="Arraste a imagem aqui (.jpg, .png, .tiff, .heic, .webp)"
      />

      <button
        onClick={handleRead}
        disabled={!file || status === 'loading'}
        className="mt-5 w-full py-3 rounded-xl bg-brand-accent hover:bg-brand-accentHover text-white font-semibold
                   disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {status === 'loading' ? 'Lendo metadados…' : 'Ler metadados EXIF'}
      </button>

      <ConversionStatus status={status === 'success' ? 'idle' : status} errorMessage={errMsg} />

      {status === 'success' && noExifMsg && (
        <p className="mt-4 text-sm text-gray-500 dark:text-gray-400 text-center">{noExifMsg}</p>
      )}

      {summary && (
        <div className="mt-6">
          {(Object.keys(SECTION_LABELS) as (keyof ExifSummary)[]).map((key) => (
            <MetaSection key={key} title={SECTION_LABELS[key]} data={summary[key] as Record<string, unknown>} />
          ))}

          <div className="flex items-center gap-4 mt-2 flex-wrap">
            <button
              onClick={() => downloadJson(summary, 'resumo')}
              className="text-sm text-brand-accent hover:underline"
            >
              Baixar resumo como JSON
            </button>
            {rawData && (
              <>
                <button
                  onClick={() => downloadJson(rawData, 'completo')}
                  className="text-sm text-brand-accent hover:underline"
                >
                  Baixar dados completos como JSON
                </button>
                <button
                  onClick={() => setShowRaw((v) => !v)}
                  className="text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {showRaw ? 'Ocultar dados brutos' : 'Ver dados brutos'}
                </button>
              </>
            )}
          </div>

          {showRaw && rawData && (
            <pre className="mt-3 p-3 rounded-xl bg-brand-surface dark:bg-gray-900 border border-brand-border dark:border-gray-700
                            text-xs font-mono overflow-x-auto max-h-[400px] text-gray-700 dark:text-gray-300">
              {JSON.stringify(rawData, null, 2)}
            </pre>
          )}
        </div>
      )}
    </ToolLayout>
  );
}
