'use client';
import { useState } from 'react';
import FileDropzone from '@/components/ui/FileDropzone';
import ConversionStatus from '@/components/ui/ConversionStatus';
import ToolLayout from '@/components/ui/ToolLayout';
import ToolIcon from '@/components/ui/ToolIcon';
import { useConverter } from '@/hooks/useConverter';

export default function PdfRedactPage() {
  const [file, setFile] = useState<File | null>(null);
  const [pageIndex, setPageIndex] = useState('0');
  const [rectsJson, setRectsJson] = useState('[\n  { "x": 50, "y": 700, "width": 200, "height": 20 }\n]');
  const [jsonError, setJsonError] = useState<string | null>(null);
  const { status, errorMsg, convert } = useConverter({
    endpoint: '/api/pdf-advanced/redact',
    outputFilename: (name) => name.replace(/\.pdf$/i, '-censurado.pdf'),
  });

  function handleSubmit() {
    if (!file) return;
    try {
      JSON.parse(rectsJson);
      setJsonError(null);
    } catch {
      setJsonError('O JSON das áreas é inválido.');
      return;
    }
    convert(file, { pageIndex, rects: rectsJson });
  }

  return (
    <ToolLayout title="Censurar PDF" description="Cubra permanentemente uma área de uma página do PDF (redação)." category="PDF"
      icon={<ToolIcon d="M9 12h6m-6 4h3m6-13H6a2 2 0 00-2 2v14a2 2 0 002 2h12a2 2 0 002-2V8l-5-5z" />}>
      <FileDropzone accept=".pdf" maxSizeMB={40} onFileSelect={setFile} label="Arraste o PDF aqui" />
      <label className="block mt-4 text-sm">
        <span className="block mb-1 text-brand-muted dark:text-gray-400">Página (0 = primeira)</span>
        <input type="number" min={0} value={pageIndex} onChange={(e) => setPageIndex(e.target.value)}
          className="w-40 rounded-md border border-brand-border dark:border-gray-700 bg-transparent px-3 py-2" />
      </label>
      <label className="block mt-4 text-sm">
        <span className="block mb-1 text-brand-muted dark:text-gray-400">
          Áreas a censurar (JSON, em pontos, origem no canto inferior esquerdo)
        </span>
        <textarea
          value={rectsJson}
          onChange={(e) => setRectsJson(e.target.value)}
          rows={6}
          className="w-full rounded-md border border-brand-border dark:border-gray-700 bg-transparent p-3 text-sm font-mono"
        />
      </label>
      {jsonError && <p className="mt-2 text-sm text-red-500">{jsonError}</p>}
      <p className="mt-2 text-xs text-brand-muted dark:text-gray-500">
        Esta ação é permanente: o texto por trás da área censurada é removido, não apenas coberto visualmente.
      </p>
      <button onClick={handleSubmit}
        disabled={!file || status === 'loading'}
        className="mt-6 w-full py-3 rounded-xl bg-brand-accent hover:bg-brand-accentHover text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
        {status === 'loading' ? 'Censurando…' : 'Censurar'}
      </button>
      <ConversionStatus status={status} errorMessage={errorMsg} successMessage="Pronto! Download iniciado." />
    </ToolLayout>
  );
}
