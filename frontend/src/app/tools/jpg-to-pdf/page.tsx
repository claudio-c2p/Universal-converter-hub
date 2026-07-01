'use client';
import { useState } from 'react';
import ConversionStatus from '@/components/ui/ConversionStatus';
import MultiFileDropzone from '@/components/ui/MultiFileDropzone';
import ToolLayout from '@/components/ui/ToolLayout';
import ToolIcon from '@/components/ui/ToolIcon';

type Status = 'idle' | 'loading' | 'success' | 'error';

export default function JpgToPdfPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [status, setStatus] = useState<Status>('idle');
  const [errMsg, setErrMsg] = useState('');
  const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? '';

  async function handleConvert() {
    if (files.length === 0) { setErrMsg('Selecione pelo menos uma imagem.'); setStatus('error'); return; }
    setStatus('loading'); setErrMsg('');
    try {
      const body = new FormData();
      files.forEach((f) => body.append('files', f));
      const res = await fetch(`${baseUrl}/api/pdf-tools/jpg-to-pdf`, { method: 'POST', body });
      if (!res.ok) { const d = await res.json().catch(() => ({})); throw new Error(d.error ?? `Erro ${res.status}`); }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = 'imagens.pdf';
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setStatus('success');
    } catch (err) { setErrMsg(err instanceof Error ? err.message : 'Erro.'); setStatus('error'); }
  }

  return (
    <ToolLayout title="JPG/PNG → PDF" description="Converta imagens em um único PDF." category="PDF" icon={<ToolIcon d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />}>
      <MultiFileDropzone
        accept=".jpg,.jpeg,.png,.webp,.bmp"
        maxSizeMB={50}
        onFilesSelect={(selected) => { setFiles(selected); setStatus('idle'); setErrMsg(''); }}
        label="Arraste as imagens aqui ou clique para selecionar"
        helperText="Selecione uma ou mais imagens. A ordem da lista define a ordem no PDF — use as setas para reordenar."
      />

      <button
        onClick={handleConvert}
        disabled={files.length === 0 || status === 'loading'}
        className="mt-6 w-full py-3 rounded-xl bg-brand-accent hover:bg-brand-accentHover text-white
                   font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {status === 'loading' ? 'Convertendo…' : 'Converter para PDF'}
      </button>
      <ConversionStatus status={status} errorMessage={errMsg} successMessage="PDF criado! Download iniciado." />
    </ToolLayout>
  );
}
