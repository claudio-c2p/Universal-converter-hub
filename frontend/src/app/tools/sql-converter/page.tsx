'use client';
import { useState } from 'react';
import FileDropzone from '@/components/ui/FileDropzone';
import ConversionStatus from '@/components/ui/ConversionStatus';
import ToolLayout from '@/components/ui/ToolLayout';
import ToolIcon from '@/components/ui/ToolIcon';
import { useConverter } from '@/hooks/useConverter';

const CONVERSIONS = [
  { label: 'SQL Dump → JSON',     ext: '.sql',  toFormat: 'json',         needsTable: true },
  { label: 'SQL Dump → CSV',      ext: '.sql',  toFormat: 'csv',          needsTable: true },
  { label: 'JSON → SQL INSERT',   ext: '.json', toFormat: 'sql',          needsTable: true },
  { label: 'JSON → CREATE TABLE', ext: '.json', toFormat: 'create-table', needsTable: true },
  { label: 'CSV → CREATE TABLE',  ext: '.csv',  toFormat: 'create-table', needsTable: true },
] as const;

const OUT_EXT_MAP: Record<string, string> = { json: '.json', csv: '.csv', sql: '.sql', 'create-table': '.sql' };

export default function SqlConverterPage() {
  const [file,      setFile]      = useState<File | null>(null);
  const [mode,      setMode]      = useState(0);
  const [tableName, setTableName] = useState('minha_tabela');

  const current = CONVERSIONS[mode];

  const { status, errorMsg, convert } = useConverter({
    endpoint: '/api/sql/convert',
    outputFilename: (inputName) => inputName.replace(/\.[^.]+$/, OUT_EXT_MAP[current.toFormat]),
  });

  function handleConvert() {
    if (!file) return;
    const extra: Record<string, string> = { toFormat: current.toFormat };
    if (current.needsTable) extra.tableName = tableName;
    convert(file, extra);
  }

  return (
    <ToolLayout title="Conversor SQL" description="Dump SQL ↔ JSON ↔ CSV · Inferir CREATE TABLE" category="Dados" icon={<ToolIcon d="M4 7c0-1.66 3.58-3 8-3s8 1.34 8 3-3.58 3-8 3-8-1.34-8-3zm0 0v10c0 1.66 3.58 3 8 3s8-1.34 8-3V7M4 12c0 1.66 3.58 3 8 3s8-1.34 8-3" />}>
      <div className="flex flex-wrap gap-2 mb-5">
        {CONVERSIONS.map((c, i) => (
          <button key={i} onClick={() => { setMode(i); setFile(null); }} aria-pressed={mode === i}
            className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors
              ${mode === i ? 'bg-brand-accent text-white border-brand-accent'
                           : 'bg-white text-gray-700 border-gray-300 hover:border-brand-accent dark:bg-gray-800 dark:text-gray-200'}`}>
            {c.label}
          </button>
        ))}
      </div>

      <FileDropzone accept={current.ext} maxSizeMB={5} onFileSelect={setFile}
        label={`Arraste o arquivo ${current.ext} aqui`} />

      {current.needsTable && (
        <div className="mt-3">
          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
            Nome da tabela
          </label>
          <input value={tableName} onChange={(e) => setTableName(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-sm font-mono
                       focus:border-brand-accent outline-none dark:bg-gray-700 dark:text-gray-100" />
        </div>
      )}

      <button onClick={handleConvert} disabled={!file || status === 'loading'}
        className="mt-6 w-full py-3 rounded-xl bg-brand-accent hover:bg-brand-accentHover text-white font-semibold
                   disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
        {status === 'loading' ? 'Convertendo…' : 'Converter'}
      </button>

      <ConversionStatus status={status} errorMessage={errorMsg} successMessage="Arquivo convertido com sucesso!" />

      <p className="mt-4 text-xs text-gray-400">
        ⚠️ Conversão entre dialetos SQL (MySQL → PostgreSQL, etc.) não é suportada por limitação técnica.
      </p>
    </ToolLayout>
  );
}
