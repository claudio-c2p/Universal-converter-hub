'use client';
import { useState, useEffect, useRef } from 'react';
import ConversionStatus from '@/components/ui/ConversionStatus';
import MultiFileDropzone from '@/components/ui/MultiFileDropzone';
import ToolLayout from '@/components/ui/ToolLayout';
import ToolIcon from '@/components/ui/ToolIcon';

interface PreviewItem { original: string; renamed: string; }
type Status = 'idle' | 'loading' | 'success' | 'error';

const PATTERN_EXAMPLES = [
  { label: 'Sequencial',      value: 'arquivo_{index03}' },
  { label: 'Data + original', value: '{date}_{name}'     },
  { label: 'Prefixo + seq.',  value: 'projeto_{index03}_{name}' },
  { label: 'Só sequencial',   value: '{index03}'         },
];

const DEBOUNCE_MS = 400;

export default function BatchRenamePage() {
  const [files,   setFiles]   = useState<File[]>([]);
  const [pattern, setPattern] = useState('arquivo_{index03}');
  const [preview, setPreview] = useState<PreviewItem[]>([]);
  const [status,  setStatus]  = useState<Status>('idle');
  const [errMsg,  setErrMsg]  = useState('');

  const baseUrl  = process.env.NEXT_PUBLIC_API_URL ?? '';
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Preview com debounce para não disparar um fetch a cada tecla
  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (files.length === 0 || !pattern.trim()) { setPreview([]); return; }

    timerRef.current = setTimeout(() => {
      fetch(`${baseUrl}/api/batch-rename/preview`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ filenames: files.map((f) => f.name), pattern }),
      })
        .then((r) => r.json())
        .then((d) => setPreview(d.preview ?? []))
        .catch(() => setPreview([]));
    }, DEBOUNCE_MS);

    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [files, pattern, baseUrl]);

  async function handleApply() {
    if (files.length === 0) return;
    setStatus('loading'); setErrMsg('');
    try {
      const body = new FormData();
      body.append('pattern', pattern);
      files.forEach((f) => body.append('files', f));

      const res = await fetch(`${baseUrl}/api/batch-rename/apply`, { method: 'POST', body });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error ?? `Erro ${res.status}`);
      }

      const blob = await res.blob();
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href     = url;
      a.download = 'renomeados.zip';
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
    <ToolLayout title="Renomeador em Lote" description="Renomeie dezenas de arquivos de uma vez com um padrão." category="Dev" icon={<ToolIcon d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />}>
      <div className="mb-5">
        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
          Selecione os arquivos
        </label>
        <MultiFileDropzone
          accept="*"
          maxSizeMB={200}
          onFilesSelect={(selected) => setFiles(selected)}
          label="Arraste os arquivos aqui ou clique para selecionar"
        />
      </div>

      <div className="mb-3">
        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
          Padrão de nome
        </label>
        <input
          value={pattern}
          onChange={(e) => setPattern(e.target.value)}
          className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-sm font-mono
                     focus:border-brand-accent outline-none dark:bg-gray-700 dark:text-gray-100"
        />
        <p className="mt-1 text-xs text-gray-400">
          Variáveis:{' '}
          <code className="font-mono">{'{name}'}</code>{' '}
          <code className="font-mono">{'{index03}'}</code>{' '}
          <code className="font-mono">{'{date}'}</code>{' '}
          <code className="font-mono">{'{ext}'}</code>
        </p>
      </div>

      <div className="flex flex-wrap gap-2 mb-5">
        {PATTERN_EXAMPLES.map((ex) => (
          <button
            key={ex.value}
            onClick={() => setPattern(ex.value)}
            className="px-2.5 py-1 rounded-lg border border-gray-300 dark:border-gray-600 text-xs
                       hover:border-brand-accent dark:text-gray-300 transition-colors font-mono"
          >
            {ex.label}
          </button>
        ))}
      </div>

      {preview.length > 0 && (
        <div className="mb-5 rounded-xl border border-brand-border dark:border-gray-700 overflow-hidden">
          <div className="bg-brand-surface dark:bg-gray-800 px-3 py-2 text-xs font-medium text-gray-500 grid grid-cols-2 gap-2">
            <span>Original</span><span>Novo nome</span>
          </div>
          <div className="max-h-48 overflow-y-auto divide-y divide-brand-border dark:divide-gray-700">
            {preview.slice(0, 50).map((item, i) => (
              <div key={i} className="grid grid-cols-2 gap-2 px-3 py-1.5 text-xs font-mono">
                <span className="text-gray-500 truncate" title={item.original}>{item.original}</span>
                <span className="text-brand-accent dark:text-brand-accent font-medium truncate" title={item.renamed}>
                  {item.renamed}
                </span>
              </div>
            ))}
            {preview.length > 50 && (
              <div className="px-3 py-1.5 text-xs text-gray-400 italic">
                + {preview.length - 50} arquivo(s) não exibidos…
              </div>
            )}
          </div>
        </div>
      )}

      <button
        onClick={handleApply}
        disabled={files.length === 0 || !pattern.trim() || status === 'loading'}
        className="w-full py-3 rounded-xl bg-brand-accent hover:bg-brand-accentHover text-white font-semibold
                   disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {status === 'loading' ? 'Gerando ZIP…' : `Renomear ${files.length} arquivo(s) e baixar`}
      </button>

      <ConversionStatus
        status={status}
        errorMessage={errMsg}
        successMessage="ZIP com os arquivos renomeados baixado com sucesso!"
      />
    </ToolLayout>
  );
}
