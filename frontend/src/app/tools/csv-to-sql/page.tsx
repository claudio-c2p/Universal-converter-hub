'use client';
import { useState } from 'react';
import FileDropzone from '@/components/ui/FileDropzone';
import ConversionStatus from '@/components/ui/ConversionStatus';
import ToolLayout from '@/components/ui/ToolLayout';
import ToolIcon from '@/components/ui/ToolIcon';
import { useConverter } from '@/hooks/useConverter';

export default function CsvToSqlPage() {
  const [file, setFile] = useState<File | null>(null);
  const [tableName, setTableName] = useState('dados');
  const { status, errorMsg, convert } = useConverter({
    endpoint: '/api/data-tools/csv-to-sql',
    outputFilename: () => 'insert.sql',
  });
  return (
    <ToolLayout title="CSV → SQL" description="Gere um dump SQL (CREATE TABLE + INSERTs) a partir de um CSV." category="Dados"
      icon={<ToolIcon d="M4 7c0-1.66 3.58-3 8-3s8 1.34 8 3-3.58 3-8 3-8-1.34-8-3zm0 0v10c0 1.66 3.58 3 8 3s8-1.34 8-3V7M4 12c0 1.66 3.58 3 8 3s8-1.34 8-3" />}>
      <FileDropzone accept=".csv" maxSizeMB={20} onFileSelect={setFile} label="Arraste o CSV aqui" />
      <label className="block mt-4 text-sm">
        <span className="block mb-1 text-brand-muted dark:text-gray-400">Nome da tabela</span>
        <input value={tableName} onChange={(e) => setTableName(e.target.value)}
          className="w-full rounded-md border border-brand-border dark:border-gray-700 bg-transparent px-3 py-2" />
      </label>
      <button onClick={() => file && convert(file, { tableName })}
        disabled={!file || status === 'loading'}
        className="mt-6 w-full py-3 rounded-xl bg-brand-accent hover:bg-brand-accentHover text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
        {status === 'loading' ? 'Gerando…' : 'Gerar SQL'}
      </button>
      <ConversionStatus status={status} errorMessage={errorMsg} successMessage="Pronto! Download iniciado." />
    </ToolLayout>
  );
}
