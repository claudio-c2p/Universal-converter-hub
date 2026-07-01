'use client';
import { useState } from 'react';
import ConversionStatus from '@/components/ui/ConversionStatus';
import MultiFileDropzone from '@/components/ui/MultiFileDropzone';
import ToolLayout from '@/components/ui/ToolLayout';
import ToolIcon from '@/components/ui/ToolIcon';

type Status = 'idle' | 'loading' | 'success' | 'error';

export default function PdfMergePage() {
  const [files, setFiles] = useState<File[]>([]);
  const [status, setStatus] = useState<Status>('idle');
  const [errMsg, setErrMsg] = useState('');
  const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? '';

  async function handleMerge() {
    if (files.length < 2) { setErrMsg('Selecione pelo menos 2 PDFs.'); setStatus('error'); return; }
    setStatus('loading'); setErrMsg('');
    try {
      const body = new FormData();
      files.forEach((f) => body.append('files', f));
      const res = await fetch(`${baseUrl}/api/pdf-tools/merge`, { method: 'POST', body });
      if (!res.ok) { const d = await res.json().catch(() => ({})); throw new Error(d.error ?? `Erro ${res.status}`); }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = 'merged.pdf';
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setStatus('success');
    } catch (err) { setErrMsg(err instanceof Error ? err.message : 'Erro.'); setStatus('error'); }
  }

  return (
    <ToolLayout title="Mesclar PDFs" description="Una vários PDFs em um único arquivo." category="PDF" icon={<ToolIcon d="M9 17v-2m3 2v-4m3 4v-6M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />}>
      <MultiFileDropzone
        accept=".pdf"
        maxSizeMB={100}
        onFilesSelect={(selected) => { setFiles(selected); setStatus('idle'); setErrMsg(''); }}
        label="Arraste os PDFs aqui ou clique para selecionar"
        helperText="Selecione 2 ou mais arquivos PDF. A ordem da lista define a ordem de mesclagem — use as setas para reordenar."
      />

      <button
        onClick={handleMerge}
        disabled={files.length < 2 || status === 'loading'}
        className="mt-6 w-full py-3 rounded-xl bg-brand-accent hover:bg-brand-accentHover text-white
                   font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {status === 'loading' ? 'Mesclando…' : 'Mesclar e Baixar'}
      </button>
      <ConversionStatus status={status} errorMessage={errMsg} successMessage="PDFs mesclados! Download iniciado." />
    </ToolLayout>
  );
}
