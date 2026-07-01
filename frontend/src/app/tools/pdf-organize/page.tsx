'use client';
import { useState } from 'react';
import { useConverter } from '@/hooks/useConverter';
import FileDropzone from '@/components/ui/FileDropzone';
import ConversionStatus from '@/components/ui/ConversionStatus';
import ToolLayout from '@/components/ui/ToolLayout';
import ToolIcon from '@/components/ui/ToolIcon';

export default function PdfOrganizePage() {
  const [file, setFile] = useState<File | null>(null);
  const [order, setOrder] = useState('');

  const { status, errorMsg, convert } = useConverter({
    endpoint: '/api/pdf-tools/reorder',
    outputFilename: () => 'reordenado.pdf',
  });

  return (
    <ToolLayout title="Organizar PDF" description="Reordene as páginas do seu PDF." category="PDF" icon={<ToolIcon d="M4 6h16M4 10h16M4 14h16M4 18h16" />}>
      <FileDropzone accept=".pdf" maxSizeMB={50} onFileSelect={setFile} label="Arraste o arquivo .pdf aqui" />

      <div className="mt-4">
        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
          Nova ordem das páginas (ex: &quot;3,1,2&quot;)
        </label>
        <input
          value={order}
          onChange={(e) => setOrder(e.target.value)}
          placeholder="3,1,2"
          className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-sm
                     focus:border-brand-accent outline-none dark:bg-gray-700 dark:text-gray-100"
        />
        <p className="mt-1 text-xs text-gray-400">
          Informe todos os números de página na nova ordem. Se o PDF tem 3 páginas, informe os 3 números (ex: &quot;3,1,2&quot;).
        </p>
      </div>

      <button
        onClick={() => file && order && convert(file, { order })}
        disabled={!file || !order || status === 'loading'}
        className="mt-6 w-full py-3 rounded-xl bg-brand-accent hover:bg-brand-accentHover text-white
                   font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {status === 'loading' ? 'Reordenando…' : 'Reordenar Páginas'}
      </button>

      <ConversionStatus status={status} errorMessage={errorMsg} successMessage="PDF reordenado! Download iniciado." />
    </ToolLayout>
  );
}
