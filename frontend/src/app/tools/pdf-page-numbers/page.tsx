'use client';
import { useState } from 'react';
import { useConverter } from '@/hooks/useConverter';
import FileDropzone from '@/components/ui/FileDropzone';
import ConversionStatus from '@/components/ui/ConversionStatus';
import ToolLayout from '@/components/ui/ToolLayout';
import ToolIcon from '@/components/ui/ToolIcon';

const POSITIONS = [
  { value: 'bottom-center', label: 'Rodapé Centro' },
  { value: 'bottom-right',  label: 'Rodapé Direita' },
  { value: 'bottom-left',   label: 'Rodapé Esquerda' },
  { value: 'top-center',    label: 'Cabeçalho Centro' },
  { value: 'top-right',     label: 'Cabeçalho Direita' },
];

export default function PdfPageNumbersPage() {
  const [file, setFile] = useState<File | null>(null);
  const [position, setPosition] = useState('bottom-center');
  const [startAt, setStartAt] = useState('1');
  const [prefix, setPrefix] = useState('');

  const { status, errorMsg, convert } = useConverter({
    endpoint: '/api/pdf-tools/page-numbers',
    outputFilename: () => 'paginado.pdf',
  });

  return (
    <ToolLayout title="Inserir Números de Página" description="Adicione numeração automática ao seu PDF." category="PDF" icon={<ToolIcon d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />}>
      <FileDropzone accept=".pdf" maxSizeMB={50} onFileSelect={setFile} label="Arraste o arquivo .pdf aqui" />

      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Posição</label>
          <select value={position} onChange={(e) => setPosition(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-sm
                       focus:border-brand-accent outline-none dark:bg-gray-700 dark:text-gray-100">
            {POSITIONS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Começar em</label>
          <input type="number" min="1" value={startAt} onChange={(e) => setStartAt(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-sm
                       focus:border-brand-accent outline-none dark:bg-gray-700 dark:text-gray-100" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
            Prefixo (opcional, ex: &quot;Página &quot;)
          </label>
          <input value={prefix} onChange={(e) => setPrefix(e.target.value)} placeholder="Página "
            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-sm
                       focus:border-brand-accent outline-none dark:bg-gray-700 dark:text-gray-100" />
        </div>
      </div>

      <button
        onClick={() => file && convert(file, { position, startAt, prefix })}
        disabled={!file || status === 'loading'}
        className="mt-6 w-full py-3 rounded-xl bg-brand-accent hover:bg-brand-accentHover text-white
                   font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {status === 'loading' ? 'Numerando…' : 'Inserir Números de Página'}
      </button>

      <ConversionStatus status={status} errorMessage={errorMsg} successMessage="Pronto! Download iniciado." />
    </ToolLayout>
  );
}
