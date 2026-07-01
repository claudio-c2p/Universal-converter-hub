'use client';
import { useState } from 'react';
import FileDropzone from '@/components/ui/FileDropzone';
import ConversionStatus from '@/components/ui/ConversionStatus';
import ToolLayout from '@/components/ui/ToolLayout';
import ToolIcon from '@/components/ui/ToolIcon';

type Status = 'idle' | 'loading' | 'success' | 'error';

export default function PdfInsertPagesPage() {
  const [baseFile, setBaseFile] = useState<File | null>(null);
  const [insertFile, setInsertFile] = useState<File | null>(null);
  const [position, setPosition] = useState('0');
  const [status, setStatus] = useState<Status>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? '';

  const canSubmit = !!baseFile && !!insertFile && status !== 'loading';

  const handleConvert = async () => {
    if (!baseFile || !insertFile) {
      setErrorMsg('Selecione os dois arquivos PDF antes de continuar.');
      setStatus('error');
      return;
    }
    setStatus('loading');
    setErrorMsg('');
    try {
      const body = new FormData();
      // Ordem importa: o backend lê req.files[0] como base e req.files[1] como o PDF a inserir.
      body.append('files', baseFile);
      body.append('files', insertFile);
      body.append('position', position);

      const res = await fetch(`${baseUrl}/api/pdf-convert/pdf-insert-pages`, {
        method: 'POST',
        body,
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: `Erro ${res.status}` }));
        throw new Error(err.error ?? 'Falha na conversão.');
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'com_paginas_inseridas.pdf';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setStatus('success');
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Erro desconhecido.');
      setStatus('error');
    }
  };

  return (
    <ToolLayout
      title="Inserir Páginas no PDF"
      description="Insira todas as páginas de um PDF dentro de outro, na posição que você escolher."
      category="PDF"
      icon={<ToolIcon d="M12 4v16m8-8H4" />}
    >
      <div className="space-y-5">
        <div>
          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
            1. PDF base (principal)
          </label>
          <FileDropzone
            accept=".pdf"
            maxSizeMB={50}
            onFileSelect={(f) => { setBaseFile(f); setStatus('idle'); setErrorMsg(''); }}
            label="Arraste o PDF base aqui"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
            2. PDF a inserir
          </label>
          <FileDropzone
            accept=".pdf"
            maxSizeMB={50}
            onFileSelect={(f) => { setInsertFile(f); setStatus('idle'); setErrorMsg(''); }}
            label="Arraste o PDF a inserir aqui"
          />
        </div>

        <div>
          <label htmlFor="insert-position" className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
            Posição de inserção <span className="text-gray-400">(0 = no início do PDF base)</span>
          </label>
          <input
            id="insert-position"
            type="number"
            min="0"
            value={position}
            onChange={(e) => setPosition(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-brand-border dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 text-sm focus:outline-none focus:border-brand-accent transition-colors"
          />
          <p className="mt-1 text-xs text-gray-400">
            As páginas do segundo PDF serão inseridas a partir desta posição (contando do 0).
          </p>
        </div>
      </div>

      <button
        onClick={handleConvert}
        disabled={!canSubmit}
        className="mt-6 w-full py-3 rounded-xl bg-brand-accent hover:bg-brand-accentHover text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {status === 'loading' ? 'Processando…' : 'Inserir Páginas'}
      </button>

      <ConversionStatus status={status} errorMessage={errorMsg} successMessage="Pronto! Download iniciado." />
    </ToolLayout>
  );
}
