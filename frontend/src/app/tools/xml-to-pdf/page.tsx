'use client';
import { useState } from 'react';
import FileDropzone from '@/components/ui/FileDropzone';
import ConversionStatus from '@/components/ui/ConversionStatus';
import ToolLayout from '@/components/ui/ToolLayout';
import ToolIcon from '@/components/ui/ToolIcon';
import { useConverter } from '@/hooks/useConverter';

export default function Page() {
  const [file, setFile] = useState<File | null>(null);
  const { status, errorMsg, convert } = useConverter({
    endpoint: '/api/data-convert/xml-to-pdf',
    outputFilename: (name) => name.replace(/\.[^.]+$/, '.pdf'),
  });
  return (
    <ToolLayout title="XML → PDF" description="Converta seu arquivo XML para PDF de forma rápida e gratuita." category="Dados"
      icon={<ToolIcon d="M9 17v-6h6v6m-9-6V7a2 2 0 012-2h8a2 2 0 012 2v4M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2h-3.586a1 1 0 01-.707-.293L13 3.293A1 1 0 0012.293 3H5a2 2 0 00-2 2v14a2 2 0 002 2z" />}>
      <FileDropzone accept=".xml" maxSizeMB={5} onFileSelect={setFile} label="Arraste o arquivo aqui" />
      <button onClick={() => file && convert(file)}
        disabled={!file || status === 'loading'}
        className="mt-6 w-full py-3 rounded-xl bg-brand-accent hover:bg-brand-accentHover text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
        {status === 'loading' ? 'Convertendo…' : 'Converter'}
      </button>
      <ConversionStatus status={status} errorMessage={errorMsg} successMessage="Pronto! Download iniciado." />
    </ToolLayout>
  );
}
