'use client';
import { useState } from 'react';
import FileDropzone from '@/components/ui/FileDropzone';
import ConversionStatus from '@/components/ui/ConversionStatus';
import ToolLayout from '@/components/ui/ToolLayout';
import ToolIcon from '@/components/ui/ToolIcon';
import { useConverter } from '@/hooks/useConverter';

export default function Page() {
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState('');
  const { status, errorMsg, convert } = useConverter({
    endpoint: '/api/binary-tools/pdf-remove-password',
    outputFilename: (name) => name.replace(/\.[^.]+$/, '.pdf'),
  });
  return (
    <ToolLayout title="Remover senha de PDF" description="Remova a senha de um PDF protegido, informando a senha atual."
      category="PDF" icon={<ToolIcon d="M12 11c0 1.105-.895 2-2 2s-2-.895-2-2 .895-2 2-2 2 .895 2 2zm6 0a8 8 0 11-16 0 8 8 0 0116 0z" />}>
      <FileDropzone accept=".pdf" maxSizeMB={20} onFileSelect={setFile} label="Arraste o arquivo PDF aqui" />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Senha atual do PDF"
        className="mt-4 w-full px-4 py-2.5 rounded-xl border border-brand-border dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent/50"
      />
      <button onClick={() => file && convert(file, { password })}
        disabled={!file || !password || status === 'loading'}
        className="mt-6 w-full py-3 rounded-xl bg-brand-accent hover:bg-brand-accentHover text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
        {status === 'loading' ? 'Removendo senha…' : 'Remover senha'}
      </button>
      <ConversionStatus status={status} errorMessage={errorMsg} successMessage="Pronto! Download iniciado." />
    </ToolLayout>
  );
}
