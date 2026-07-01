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
    endpoint: '/api/data-convert/json-to-xml',
    outputFilename: (name) => name.replace(/\.[^.]+$/, '.xml'),
  });
  return (
    <ToolLayout title="JSON → XML" description="Converta seu arquivo de forma rápida e gratuita." category="Dados" icon={<ToolIcon d="M10 20l4-16M6 16l-4-4 4-4M18 8l4 4-4 4" />}>
      <FileDropzone accept=".json" maxSizeMB={20} onFileSelect={setFile} label="Arraste o arquivo aqui" />
      <button onClick={() => file && convert(file)}
        disabled={!file || status === 'loading'}
        className="mt-6 w-full py-3 rounded-xl bg-brand-accent hover:bg-brand-accentHover text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
        {status === 'loading' ? 'Convertendo…' : 'Converter'}
      </button>
      <ConversionStatus status={status} errorMessage={errorMsg} successMessage="Pronto! Download iniciado." />
    </ToolLayout>
  );
}
