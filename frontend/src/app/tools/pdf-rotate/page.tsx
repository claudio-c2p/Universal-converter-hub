'use client';
import { useState } from 'react';
import { useConverter } from '@/hooks/useConverter';
import FileDropzone from '@/components/ui/FileDropzone';
import ConversionStatus from '@/components/ui/ConversionStatus';
import ToolLayout from '@/components/ui/ToolLayout';
import ToolIcon from '@/components/ui/ToolIcon';

const DEGREES = [
  { value: '90',  label: '90° →' },
  { value: '180', label: '180°' },
  { value: '270', label: '← 90°' },
];

export default function PdfRotatePage() {
  const [file, setFile] = useState<File | null>(null);
  const [deg, setDeg] = useState('90');

  const { status, errorMsg, convert } = useConverter({
    endpoint: '/api/pdf-tools/rotate',
    outputFilename: () => 'rotated.pdf',
  });

  return (
    <ToolLayout title="Girar PDF" description="Rotacione todas as páginas do seu PDF." category="PDF" icon={<ToolIcon d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />}>
      <FileDropzone accept=".pdf" maxSizeMB={50} onFileSelect={setFile} label="Arraste o arquivo .pdf aqui" />

      <div className="mt-4">
        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Rotação</label>
        <div className="flex gap-3">
          {DEGREES.map((d) => (
            <button
              key={d.value}
              onClick={() => setDeg(d.value)}
              className={`flex-1 py-2 rounded-lg border text-sm font-medium transition-colors
                ${deg === d.value
                  ? 'bg-brand-accent text-white border-brand-accent'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-brand-accent dark:bg-gray-800 dark:text-gray-200'}`}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={() => file && convert(file, { degrees: deg })}
        disabled={!file || status === 'loading'}
        className="mt-6 w-full py-3 rounded-xl bg-brand-accent hover:bg-brand-accentHover text-white
                   font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {status === 'loading' ? 'Girando…' : 'Girar PDF'}
      </button>

      <ConversionStatus status={status} errorMessage={errorMsg} successMessage="PDF girado! Download iniciado." />
    </ToolLayout>
  );
}
