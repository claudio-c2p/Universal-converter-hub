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
    endpoint: '/api/file-db/vcf-to-csv',
    outputFilename: (name) => name.replace(/\.[^.]+$/, '.csv'),
  });
  return (
    <ToolLayout title="VCF → CSV" description="Converta seu arquivo VCF para CSV de forma rápida e gratuita." category="Utilitário"
      icon={<ToolIcon d="M11 4a7 7 0 00-7 7c0 1.36.39 2.62 1.06 3.69L4 19l4.31-1.06A6.96 6.96 0 0011 18a7 7 0 100-14z" />}>
      <FileDropzone accept=".vcf" maxSizeMB={10} onFileSelect={setFile} label="Arraste o arquivo aqui" />
      <button onClick={() => file && convert(file)}
        disabled={!file || status === 'loading'}
        className="mt-6 w-full py-3 rounded-xl bg-brand-accent hover:bg-brand-accentHover text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
        {status === 'loading' ? 'Convertendo…' : 'Converter'}
      </button>
      <ConversionStatus status={status} errorMessage={errorMsg} successMessage="Pronto! Download iniciado." />
    </ToolLayout>
  );
}
