'use client';
import { useState } from 'react';
import { useConverter } from '@/hooks/useConverter';
import FileDropzone from '@/components/ui/FileDropzone';
import ConversionStatus from '@/components/ui/ConversionStatus';
import ToolLayout from '@/components/ui/ToolLayout';
import ToolIcon from '@/components/ui/ToolIcon';

export default function PdfRemovePagesPage() {
  const [file, setFile] = useState<File | null>(null);
  const [pages, setPages] = useState('');

  const { status, errorMsg, convert } = useConverter({
    endpoint: '/api/pdf-tools/remove-pages',
    outputFilename: () => 'sem_paginas.pdf',
  });

  return (
    <ToolLayout title="Remover Páginas" description="Apague páginas específicas do seu PDF." category="PDF" icon={<ToolIcon d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />}>
      <FileDropzone accept=".pdf" maxSizeMB={50} onFileSelect={setFile} label="Arraste o arquivo .pdf aqui" />

      <div className="mt-4">
        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
          Páginas a remover (ex: &quot;1,3,5&quot;)
        </label>
        <input
          value={pages}
          onChange={(e) => setPages(e.target.value)}
          placeholder="1,3,5"
          className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-sm
                     focus:border-brand-accent outline-none dark:bg-gray-700 dark:text-gray-100"
        />
        <p className="mt-1 text-xs text-gray-400">Separe os números por vírgula. Exemplo: 1,3,5 remove as páginas 1, 3 e 5.</p>
      </div>

      <button
        onClick={() => file && pages && convert(file, { pages })}
        disabled={!file || !pages || status === 'loading'}
        className="mt-6 w-full py-3 rounded-xl bg-brand-accent hover:bg-brand-accentHover text-white
                   font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {status === 'loading' ? 'Removendo…' : 'Remover Páginas'}
      </button>

      <ConversionStatus status={status} errorMessage={errorMsg} successMessage="Páginas removidas! Download iniciado." />
    </ToolLayout>
  );
}
