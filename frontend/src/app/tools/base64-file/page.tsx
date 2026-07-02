'use client';
import { useState } from 'react';
import ToolLayout from '@/components/ui/ToolLayout';
import FileDropzone from '@/components/ui/FileDropzone';

export default function Base64FilePage() {
  const [base64, setBase64] = useState('');
  const [fileName, setFileName] = useState('');
  const [decodeInput, setDecodeInput] = useState('');
  const [decodeError, setDecodeError] = useState<string | null>(null);
  const [decodedUrl, setDecodedUrl] = useState<string | null>(null);

  function handleFile(file: File | null) {
    if (!file) { setBase64(''); return; }
    const reader = new FileReader();
    reader.onload = () => setBase64(String(reader.result));
    reader.readAsDataURL(file);
    setFileName(file.name);
  }

  function handleDecode() {
    setDecodeError(null);
    setDecodedUrl(null);
    try {
      const isDataUrl = decodeInput.trim().startsWith('data:');
      const url = isDataUrl ? decodeInput.trim() : `data:application/octet-stream;base64,${decodeInput.trim()}`;
      // valida decodificando de fato antes de oferecer o link
      const base64Part = url.split(',')[1] ?? '';
      atob(base64Part);
      setDecodedUrl(url);
    } catch {
      setDecodeError('Base64 inválido — verifique se colou o conteúdo completo.');
    }
  }

  return (
    <ToolLayout title="Base64 de Arquivo" description="Converta qualquer arquivo para Base64 (e volte), 100% no navegador." category="Texto">
      <p className="mb-2 text-sm font-medium text-gray-800 dark:text-gray-200">Arquivo → Base64</p>
      <FileDropzone accept="*" maxSizeMB={15} onFileSelect={handleFile} label="Arraste qualquer arquivo aqui" />
      {base64 && (
        <div className="mt-3">
          <textarea readOnly value={base64} rows={6}
            className="w-full rounded-md border border-brand-border dark:border-gray-700 bg-transparent p-3 text-xs font-mono" />
          <button onClick={() => navigator.clipboard.writeText(base64)}
            className="mt-2 rounded-md border border-brand-border dark:border-gray-700 px-3 py-2 text-sm">
            Copiar ({fileName})
          </button>
        </div>
      )}

      <hr className="my-8 border-brand-border dark:border-gray-800" />

      <p className="mb-2 text-sm font-medium text-gray-800 dark:text-gray-200">Base64 → Arquivo</p>
      <textarea
        value={decodeInput}
        onChange={(e) => setDecodeInput(e.target.value)}
        placeholder="Cole aqui um data URL (data:...;base64,...) ou apenas o base64 puro"
        rows={6}
        className="w-full rounded-md border border-brand-border dark:border-gray-700 bg-transparent p-3 text-xs font-mono"
      />
      <button onClick={handleDecode} disabled={!decodeInput.trim()}
        className="mt-2 rounded-md bg-[var(--brand-accent,#E84E1B)] px-4 py-2 text-sm font-medium text-white disabled:opacity-50">
        Decodificar
      </button>
      {decodeError && <p className="mt-2 text-sm text-red-500">{decodeError}</p>}
      {decodedUrl && (
        <a href={decodedUrl} download="arquivo-decodificado"
          className="mt-3 inline-block rounded-md border border-brand-border dark:border-gray-700 px-3 py-2 text-sm">
          Baixar arquivo decodificado
        </a>
      )}
    </ToolLayout>
  );
}
