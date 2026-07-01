'use client';
import { useState } from 'react';
import { useConverter } from '@/hooks/useConverter';
import FileDropzone from '@/components/ui/FileDropzone';
import ConversionStatus from '@/components/ui/ConversionStatus';
import ToolLayout from '@/components/ui/ToolLayout';
import ToolIcon from '@/components/ui/ToolIcon';

export default function PdfExtractPagesPage() {
  const [file, setFile] = useState<File | null>(null);
  const [pages, setPages] = useState('');

  const { status, errorMsg, convert } = useConverter({
    endpoint: '/api/pdf-tools/extract-pages',
    outputFilename: () => 'extraido.pdf',
  });

  return (
    <ToolLayout title="Extrair Páginas" description="Salve páginas específicas em um novo PDF." category="PDF" icon={<ToolIcon d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />}>
      <FileDropzone accept=".pdf" maxSizeMB={50} onFileSelect={setFile} label="Arraste o arquivo .pdf aqui" />

      <div className="mt-4">
        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
          Páginas a extrair (ex: &quot;2-5&quot; ou &quot;1,3,5&quot;)
        </label>
        <input
          value={pages}
          onChange={(e) => setPages(e.target.value)}
          placeholder="2-5 ou 1,3,5"
          className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-sm
                     focus:border-brand-accent outline-none dark:bg-gray-700 dark:text-gray-100"
        />
        <p className="mt-1 text-xs text-gray-400">Use intervalos (2-5) ou lista separada por vírgula (1,3,5).</p>
      </div>

      <button
        onClick={() => file && pages && convert(file, { pages })}
        disabled={!file || !pages || status === 'loading'}
        className="mt-6 w-full py-3 rounded-xl bg-brand-accent hover:bg-brand-accentHover text-white
                   font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {status === 'loading' ? 'Extraindo…' : 'Extrair Páginas'}
      </button>

      <ConversionStatus status={status} errorMessage={errorMsg} successMessage="Páginas extraídas! Download iniciado." />
    </ToolLayout>
  );
}
