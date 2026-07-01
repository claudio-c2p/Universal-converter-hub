'use client';
import { useState } from 'react';
import { useConverter } from '@/hooks/useConverter';
import FileDropzone from '@/components/ui/FileDropzone';
import ConversionStatus from '@/components/ui/ConversionStatus';
import ToolLayout from '@/components/ui/ToolLayout';
import ToolIcon from '@/components/ui/ToolIcon';

export default function PdfSplitPage() {
  const [file, setFile] = useState<File | null>(null);
  const [mode, setMode] = useState<'all' | 'range'>('all');
  const [pages, setPages] = useState('');

  const { status, errorMsg, convert } = useConverter({
    endpoint: '/api/pdf-tools/split',
    outputFilename: () => 'split_pages.zip',
  });

  return (
    <ToolLayout title="Dividir PDF" description="Separe cada página em um arquivo ou extraia um intervalo." category="PDF" icon={<ToolIcon d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414A1 1 0 0120 8.414V19a2 2 0 01-2 2h-8a2 2 0 01-2-2" />}>
      <FileDropzone accept=".pdf" maxSizeMB={50} onFileSelect={setFile} label="Arraste o arquivo .pdf aqui" />

      <div className="mt-4 space-y-3">
        <div className="flex gap-3">
          {[
            { value: 'all', label: 'Todas as páginas (ZIP)' },
            { value: 'range', label: 'Intervalo específico' },
          ].map((opt) => (
            <button
              key={opt.value}
              onClick={() => setMode(opt.value as 'all' | 'range')}
              className={`flex-1 py-2 rounded-lg border text-sm font-medium transition-colors
                ${mode === opt.value
                  ? 'bg-brand-accent text-white border-brand-accent'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-brand-accent dark:bg-gray-800 dark:text-gray-200'}`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {mode === 'range' && (
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
              Páginas (ex: &quot;1-3,5,7&quot;)
            </label>
            <input
              value={pages}
              onChange={(e) => setPages(e.target.value)}
              placeholder="1-3,5,7"
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-sm
                         focus:border-brand-accent outline-none dark:bg-gray-700 dark:text-gray-100"
            />
          </div>
        )}
      </div>

      <button
        onClick={() => file && convert(file, { mode, pages })}
        disabled={!file || status === 'loading'}
        className="mt-6 w-full py-3 rounded-xl bg-brand-accent hover:bg-brand-accentHover text-white
                   font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {status === 'loading' ? 'Dividindo…' : 'Dividir PDF'}
      </button>

      <ConversionStatus status={status} errorMessage={errorMsg} successMessage="PDF dividido! Download iniciado." />
    </ToolLayout>
  );
}
