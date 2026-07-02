'use client';
import { useState } from 'react';
import FileDropzone from '@/components/ui/FileDropzone';
import ConversionStatus from '@/components/ui/ConversionStatus';
import ToolLayout from '@/components/ui/ToolLayout';
import ToolIcon from '@/components/ui/ToolIcon';
import { useConverter } from '@/hooks/useConverter';

export default function PdfCropPage() {
  const [file, setFile] = useState<File | null>(null);
  const [top, setTop] = useState('0');
  const [right, setRight] = useState('0');
  const [bottom, setBottom] = useState('0');
  const [left, setLeft] = useState('0');
  const { status, errorMsg, convert } = useConverter({
    endpoint: '/api/pdf-advanced/crop',
    outputFilename: (name) => name.replace(/\.pdf$/i, '-recortado.pdf'),
  });

  return (
    <ToolLayout title="Recortar PDF" description="Ajuste as margens (crop box) de todas as páginas de um PDF." category="PDF"
      icon={<ToolIcon d="M9 12h6m-6 4h3m6-13H6a2 2 0 00-2 2v14a2 2 0 002 2h12a2 2 0 002-2V8l-5-5z" />}>
      <FileDropzone accept=".pdf" maxSizeMB={40} onFileSelect={setFile} label="Arraste o PDF aqui" />
      <p className="mt-4 mb-2 text-xs text-brand-muted dark:text-gray-400">Margens a remover (em pontos, 72pt ≈ 2,54cm):</p>
      <div className="grid grid-cols-2 gap-3">
        {[
          ['Topo', top, setTop], ['Direita', right, setRight],
          ['Baixo', bottom, setBottom], ['Esquerda', left, setLeft],
        ].map(([label, value, setter]: any) => (
          <label key={label} className="text-sm">
            <span className="block mb-1 text-brand-muted dark:text-gray-400">{label}</span>
            <input type="number" min={0} value={value} onChange={(e) => setter(e.target.value)}
              className="w-full rounded-md border border-brand-border dark:border-gray-700 bg-transparent px-3 py-2" />
          </label>
        ))}
      </div>
      <button onClick={() => file && convert(file, { top, right, bottom, left })}
        disabled={!file || status === 'loading'}
        className="mt-6 w-full py-3 rounded-xl bg-brand-accent hover:bg-brand-accentHover text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
        {status === 'loading' ? 'Recortando…' : 'Recortar'}
      </button>
      <ConversionStatus status={status} errorMessage={errorMsg} successMessage="Pronto! Download iniciado." />
    </ToolLayout>
  );
}
