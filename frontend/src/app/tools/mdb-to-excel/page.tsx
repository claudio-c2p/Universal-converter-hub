'use client';
import { useState } from 'react';
import FileDropzone from '@/components/ui/FileDropzone';
import ConversionStatus from '@/components/ui/ConversionStatus';
import ToolLayout from '@/components/ui/ToolLayout';
import ToolIcon from '@/components/ui/ToolIcon';
import { useConverter } from '@/hooks/useConverter';

const ICON_D = 'M4 7c0-1.657 3.582-3 8-3s8 1.343 8 3-3.582 3-8 3-8-1.343-8-3zm0 0v10c0 1.657 3.582 3 8 3s8-1.343 8-3V7m-16 5c0 1.657 3.582 3 8 3s8-1.343 8-3';

export default function Page() {
  const [file, setFile] = useState<File | null>(null);
  const [tables, setTables] = useState<string[] | null>(null);
  const [tableName, setTableName] = useState('');
  const [loadingTables, setLoadingTables] = useState(false);
  const [tablesError, setTablesError] = useState('');

  const { status, errorMsg, convert } = useConverter({
    endpoint: '/api/extra/mdb-to-excel',
    outputFilename: (name) => name.replace(/\.[^.]+$/, '.xlsx'),
  });

  const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? '';

  async function handleFileSelect(f: File | null) {
    setFile(f);
    setTables(null);
    setTableName('');
    setTablesError('');
    if (!f) return;

    // Banco MDB pode ter mais de uma tabela — busca a lista antes de habilitar
    // o botão de conversão, para a pessoa escolher qual tabela exportar.
    setLoadingTables(true);
    try {
      const body = new FormData();
      body.append('file', f);
      const res = await fetch(`${baseUrl}/api/extra/mdb-tables`, { method: 'POST', body });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(data?.error || 'Não foi possível ler as tabelas do arquivo.');
      }
      const list: string[] = data?.tables ?? data?.tableNames ?? [];
      setTables(list);
      if (list.length > 0) setTableName(list[0]);
    } catch (err) {
      setTablesError(err instanceof Error ? err.message : 'Erro ao listar tabelas.');
    } finally {
      setLoadingTables(false);
    }
  }

  return (
    <ToolLayout title="MDB → Excel" description="Converta uma tabela de um banco Access (.mdb/.accdb) para uma planilha Excel (.xlsx)."
      category="Banco de Dados" icon={<ToolIcon d={ICON_D} />}>
      <FileDropzone accept=".mdb" maxSizeMB={40} onFileSelect={handleFileSelect} label="Arraste o arquivo .mdb aqui" />

      {loadingTables && (
        <p className="mt-4 text-sm text-brand-muted dark:text-gray-400">Lendo tabelas do banco…</p>
      )}
      {tablesError && (
        <p role="alert" className="mt-4 text-xs text-red-600 dark:text-red-400">{tablesError}</p>
      )}
      {tables && tables.length > 0 && (
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Tabela a exportar</label>
          <select
            value={tableName}
            onChange={(e) => setTableName(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-brand-border dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent/50"
          >
            {tables.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
      )}

      <button onClick={() => file && convert(file, { tableName })}
        disabled={!file || !tableName || status === 'loading'}
        className="mt-6 w-full py-3 rounded-xl bg-brand-accent hover:bg-brand-accentHover text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
        {status === 'loading' ? 'Convertendo…' : 'Converter'}
      </button>
      <ConversionStatus status={status} errorMessage={errorMsg} successMessage="Pronto! Download iniciado." />
    </ToolLayout>
  );
}
