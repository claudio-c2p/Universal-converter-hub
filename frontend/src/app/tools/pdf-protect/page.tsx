'use client';
import { useState } from 'react';
import { useConverter } from '@/hooks/useConverter';
import FileDropzone from '@/components/ui/FileDropzone';
import ConversionStatus from '@/components/ui/ConversionStatus';
import ToolLayout from '@/components/ui/ToolLayout';
import ToolIcon from '@/components/ui/ToolIcon';

export default function PdfProtectPage() {
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState('');

  const { status, errorMsg, convert } = useConverter({
    endpoint: '/api/pdf-tools/protect',
    outputFilename: () => 'protected.pdf',
  });

  return (
    <ToolLayout title="Proteger PDF" description="Adicione proteção básica ao seu PDF." category="PDF" icon={<ToolIcon d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />}>
      {/* Aviso de limitação */}
      <div className="mb-4 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 text-xs text-amber-700 dark:text-amber-300 flex gap-2">
        <span>⚠️</span>
        <span><strong>Proteção básica</strong> — esta ferramenta não criptografa o arquivo com senha real. Use para fluxos internos; não garante segurança contra leitores PDF avançados.</span>
      </div>

      <FileDropzone accept=".pdf" maxSizeMB={50} onFileSelect={setFile} label="Arraste o arquivo .pdf aqui" />

      <div className="mt-4">
        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Senha desejada</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Digite a senha desejada"
          className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-sm
                     focus:border-brand-accent outline-none dark:bg-gray-700 dark:text-gray-100"
        />
      </div>

      <button
        onClick={() => file && password && convert(file, { password })}
        disabled={!file || !password || status === 'loading'}
        className="mt-6 w-full py-3 rounded-xl bg-brand-accent hover:bg-brand-accentHover text-white
                   font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {status === 'loading' ? 'Processando…' : 'Proteger PDF'}
      </button>

      <ConversionStatus status={status} errorMessage={errorMsg} successMessage="PDF processado! Download iniciado." />
    </ToolLayout>
  );
}
