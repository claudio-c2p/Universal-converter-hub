'use client';
import { useState } from 'react';
import FileDropzone from '@/components/ui/FileDropzone';
import MultiFileDropzone from '@/components/ui/MultiFileDropzone';
import ConversionStatus from '@/components/ui/ConversionStatus';
import ToolLayout from '@/components/ui/ToolLayout';
import ToolIcon from '@/components/ui/ToolIcon';

type Mode   = 'split' | 'merge';
type Status = 'idle' | 'loading' | 'success' | 'error';

const SPLIT_ACCEPT_EXTS = ['.csv', '.json', '.txt', '.md'];
const MERGE_ACCEPT_EXTS = ['.csv', '.json'];
const MAX_SIZE_MB = 50;

function getExt(name: string): string {
  const dot = name.lastIndexOf('.');
  return dot >= 0 ? name.slice(dot).toLowerCase() : '';
}

export default function SplitMergePage() {
  const [mode,       setMode]       = useState<Mode>('split');
  const [file,       setFile]       = useState<File | null>(null);
  const [mergeFiles, setMergeFiles] = useState<File[]>([]);
  const [chunkSize,  setChunkSize]  = useState('1000');
  const [status,     setStatus]     = useState<Status>('idle');
  const [errMsg,     setErrMsg]     = useState('');

  const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? '';

  function switchMode(m: Mode) {
    setMode(m);
    setStatus('idle');
    setErrMsg('');
    setFile(null);
    setMergeFiles([]);
  }

  function handleMergeFilesChange(selected: File[]) {
    setErrMsg('');

    const invalidExt = selected.find((f) => !MERGE_ACCEPT_EXTS.includes(getExt(f.name)));
    if (invalidExt) {
      setErrMsg(`Extensão não suportada: "${invalidExt.name}". Use apenas .csv ou .json.`);
      setMergeFiles([]);
      return;
    }
    const exts = new Set(selected.map((f) => getExt(f.name)));
    if (exts.size > 1) {
      setErrMsg(`Todos os arquivos devem ser do mesmo tipo. Encontrado: ${[...exts].join(', ')}.`);
      setMergeFiles([]);
      return;
    }
    const tooBig = selected.find((f) => f.size > MAX_SIZE_MB * 1024 * 1024);
    if (tooBig) {
      setErrMsg(`"${tooBig.name}" excede o limite de ${MAX_SIZE_MB} MB.`);
      setMergeFiles([]);
      return;
    }
    setMergeFiles(selected);
  }

  function handleSplitFileSelect(selected: File | null) {
    setErrMsg('');
    if (selected && !SPLIT_ACCEPT_EXTS.includes(getExt(selected.name))) {
      setErrMsg(`Extensão não suportada: "${selected.name}". Use .csv, .json, .txt ou .md.`);
      setFile(null);
      return;
    }
    if (selected && selected.size > MAX_SIZE_MB * 1024 * 1024) {
      setErrMsg(`Arquivo excede o limite de ${MAX_SIZE_MB} MB.`);
      setFile(null);
      return;
    }
    setFile(selected);
  }

  async function handleAction() {
    if (mode === 'split') {
      if (!file) { setErrMsg('Selecione um arquivo.'); return; }
      const size = parseInt(chunkSize, 10);
      if (!Number.isInteger(size) || size < 1) {
        setErrMsg('Informe um número inteiro positivo de linhas/itens por parte.');
        return;
      }
    } else {
      if (mergeFiles.length < 2) { setErrMsg('Selecione pelo menos 2 arquivos.'); return; }
    }

    setStatus('loading'); setErrMsg('');
    try {
      const body = new FormData();
      let url: string;

      if (mode === 'split') {
        body.append('file', file as File);
        body.append('chunkSize', chunkSize);
        url = `${baseUrl}/api/split-merge/split`;
      } else {
        mergeFiles.forEach((f) => body.append('files', f));
        url = `${baseUrl}/api/split-merge/merge`;
      }

      const res = await fetch(url, { method: 'POST', body });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error ?? `Erro ${res.status}`);
      }

      // O nome real vem do servidor via Content-Disposition
      const disposition = res.headers.get('Content-Disposition') ?? '';
      const cdMatch = disposition.match(/filename[^;=\n]*=(?:(['"])([^'"]+)\1|([^;\n]+))/i);
      const serverName = cdMatch ? (cdMatch[2] ?? cdMatch[3] ?? '').trim() : '';

      const blob = await res.blob();
      const fallbackName = mode === 'split'
        ? (file as File).name.replace(/(\.[^.]+)$/, '_partes.zip')
        : `merged${getExt(mergeFiles[0].name)}`;

      const url2 = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href     = url2;
      a.download = serverName || fallbackName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url2);
      setStatus('success');
    } catch (err: unknown) {
      setErrMsg(err instanceof Error ? err.message : 'Erro desconhecido.');
      setStatus('error');
    }
  }

  return (
    <ToolLayout title="Dividir / Mesclar" description="Divida arquivos grandes em partes ou mescle vários em um." category="Dados" icon={<ToolIcon d="M4 7h16M4 7l4-4M4 7l4 4M20 17H4M20 17l-4 4M20 17l-4-4" />}>
      <div className="flex gap-2 mb-6">
        {(['split', 'merge'] as Mode[]).map((m) => (
          <button
            key={m}
            onClick={() => switchMode(m)}
            aria-pressed={mode === m}
            className={`flex-1 py-2 rounded-xl border text-sm font-semibold transition-colors
              ${mode === m
                ? 'bg-brand-accent text-white border-brand-accent'
                : 'bg-white text-gray-600 border-gray-300 hover:border-brand-accent dark:bg-gray-800 dark:text-gray-300'}`}
          >
            {m === 'split' ? '✂ Dividir' : '⊕ Mesclar'}
          </button>
        ))}
      </div>

      {mode === 'split' ? (
        <>
          <FileDropzone
            accept=".csv,.json,.txt,.md"
            maxSizeMB={MAX_SIZE_MB}
            onFileSelect={handleSplitFileSelect}
            label="Arraste o arquivo CSV, JSON, TXT ou MD a dividir"
          />
          <div className="mt-4">
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
              Linhas / itens por parte
            </label>
            <input
              type="number"
              min="1"
              value={chunkSize}
              onChange={(e) => setChunkSize(e.target.value)}
              className="w-32 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-sm
                         focus:border-brand-accent outline-none dark:bg-gray-700 dark:text-gray-100"
            />
          </div>
        </>
      ) : (
        <div className="space-y-2">
          <MultiFileDropzone
            accept=".csv,.json"
            maxSizeMB={MAX_SIZE_MB}
            files={mergeFiles}
            onFilesSelect={handleMergeFilesChange}
            label="Arraste os arquivos .csv ou .json a mesclar"
            helperText={`Selecione 2 ou mais arquivos do mesmo tipo (.csv ou .json), até ${MAX_SIZE_MB} MB cada.`}
          />
        </div>
      )}

      <button
        onClick={handleAction}
        disabled={
          status === 'loading' ||
          (mode === 'split' && !file) ||
          (mode === 'merge' && mergeFiles.length < 2)
        }
        className="mt-6 w-full py-3 rounded-xl bg-brand-accent hover:bg-brand-accentHover text-white font-semibold
                   disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {status === 'loading'
          ? 'Processando…'
          : mode === 'split' ? 'Dividir e baixar' : 'Mesclar e baixar'}
      </button>

      <ConversionStatus
        status={status}
        errorMessage={errMsg}
        successMessage={mode === 'split' ? 'Arquivo dividido! Download iniciado.' : 'Arquivos mesclados com sucesso!'}
      />
    </ToolLayout>
  );
}
