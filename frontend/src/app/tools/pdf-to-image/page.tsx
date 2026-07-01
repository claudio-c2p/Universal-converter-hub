'use client';
import { useState } from 'react';
import FileDropzone from '@/components/ui/FileDropzone';
import ConversionStatus from '@/components/ui/ConversionStatus';
import ToolLayout from '@/components/ui/ToolLayout';
import ToolIcon from '@/components/ui/ToolIcon';
import { useConverter } from '@/hooks/useConverter';

export default function PdfToImagePage() {
  const [file,  setFile]  = useState<File | null>(null);
  const [scale, setScale] = useState('2');

  const { status, errorMsg, convert } = useConverter({
    endpoint: '/api/pdf-image/convert',
    outputFilename: (inputName, blob) => {
      const isZip    = blob?.type === 'application/zip';
      const basename = inputName.replace(/\.pdf$/i, '');
      return `${basename}-pages${isZip ? '.zip' : '.png'}`;
    },
  });

  function handleConvert() {
    if (!file) return;
    convert(file, { scale });
  }

  return (
    <ToolLayout title="PDF → Imagem" description="Converta páginas de PDF em PNG (até 20 páginas, entregues em ZIP)." category="PDF" icon={<ToolIcon d="M9 17v-6h6v6M9 7h1M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" />}>
      <FileDropzone accept=".pdf" maxSizeMB={50} onFileSelect={setFile} label="Arraste o PDF aqui" />

      <div className="mt-4">
        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Qualidade (escala)</label>
        <div className="flex gap-2">
          {[{ v: '1', l: 'Baixa (72 dpi)' }, { v: '2', l: 'Média (144 dpi)' }, { v: '3', l: 'Alta (216 dpi)' }].map((o) => (
            <button key={o.v} onClick={() => setScale(o.v)} aria-pressed={scale === o.v}
              className={`px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors
                ${scale === o.v ? 'bg-brand-accent text-white border-brand-accent'
                                : 'bg-white text-gray-700 border-gray-300 hover:border-brand-accent dark:bg-gray-800 dark:text-gray-200'}`}>
              {o.l}
            </button>
          ))}
        </div>
      </div>

      <button onClick={handleConvert} disabled={!file || status === 'loading'}
        className="mt-6 w-full py-3 rounded-xl bg-brand-accent hover:bg-brand-accentHover text-white font-semibold
                   disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
        {status === 'loading' ? 'Convertendo…' : 'Converter para PNG'}
      </button>

      <ConversionStatus status={status} errorMessage={errorMsg}
        successMessage="PDF convertido! 1 página = PNG direto. Múltiplas = ZIP com todos os PNGs." />
    </ToolLayout>
  );
}
