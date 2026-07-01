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
    endpoint: '/api/office/excel-to-json',
    outputFilename: (name) => name.replace(/\.[^.]+$/, '.json'),
  });
  return (
    <ToolLayout title="Excel → JSON" description="Converta seu arquivo de forma rápida e gratuita." category="Office" icon={<ToolIcon d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />}>
      <FileDropzone accept=".xlsx,.xls" maxSizeMB={20} onFileSelect={setFile} label="Arraste o arquivo aqui" />
      <button onClick={() => file && convert(file)}
        disabled={!file || status === 'loading'}
        className="mt-6 w-full py-3 rounded-xl bg-brand-accent hover:bg-brand-accentHover text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
        {status === 'loading' ? 'Convertendo…' : 'Converter'}
      </button>
      <ConversionStatus status={status} errorMessage={errorMsg} successMessage="Pronto! Download iniciado." />
    </ToolLayout>
  );
}
