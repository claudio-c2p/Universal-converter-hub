'use client';
import { useState } from 'react';
import { useConverter } from '@/hooks/useConverter';
import FileDropzone from '@/components/ui/FileDropzone';
import ConversionStatus from '@/components/ui/ConversionStatus';
import ToolLayout from '@/components/ui/ToolLayout';
import ToolIcon from '@/components/ui/ToolIcon';

export default function PdfUnlockPage() {
  const [file, setFile] = useState<File | null>(null);

  const { status, errorMsg, convert } = useConverter({
    endpoint: '/api/pdf-tools/unlock',
    outputFilename: () => 'unlocked.pdf',
  });

  return (
    <ToolLayout title="Desbloquear PDF" description="Remova a proteção básica de um PDF." category="PDF" icon={<ToolIcon d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />}>
      {/* Aviso de limitação */}
      <div className="mb-4 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 text-xs text-amber-700 dark:text-amber-300 flex gap-2">
        <span>⚠️</span>
        <span><strong>Funciona apenas em PDFs sem criptografia forte.</strong> PDFs protegidos com AES-256 não podem ser desbloqueados por esta ferramenta.</span>
      </div>

      <FileDropzone accept=".pdf" maxSizeMB={50} onFileSelect={setFile} label="Arraste o arquivo .pdf aqui" />

      <button
        onClick={() => file && convert(file)}
        disabled={!file || status === 'loading'}
        className="mt-6 w-full py-3 rounded-xl bg-brand-accent hover:bg-brand-accentHover text-white
                   font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {status === 'loading' ? 'Processando…' : 'Desbloquear PDF'}
      </button>

      <ConversionStatus status={status} errorMessage={errorMsg} successMessage="PDF desbloqueado! Download iniciado." />
    </ToolLayout>
  );
}
