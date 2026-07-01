'use client';
import { useState } from 'react';
import { useConverter } from '@/hooks/useConverter';
import FileDropzone from '@/components/ui/FileDropzone';
import ConversionStatus from '@/components/ui/ConversionStatus';
import ToolLayout from '@/components/ui/ToolLayout';
import ToolIcon from '@/components/ui/ToolIcon';

const OUTPUT_FORMATS = ['ttf', 'woff', 'woff2', 'eot', 'svg'] as const;
type FontFormat = typeof OUTPUT_FORMATS[number];

export default function FontConverterPage() {
  const [file, setFile]     = useState<File | null>(null);
  const [toType, setToType] = useState<FontFormat>('woff2');

  const { status, errorMsg, convert } = useConverter({
    endpoint: '/api/font/convert',
    outputFilename: (name) => name.replace(/\.[^.]+$/, `.${toType}`),
  });

  return (
    <ToolLayout title="Conversor de Fontes" description="TTF ↔ WOFF ↔ WOFF2 ↔ EOT ↔ SVG" category="Fonte" icon={<ToolIcon d="M4 7V4h16v3M9 20h6M12 4v16" />}>
      <FileDropzone accept=".ttf,.woff,.woff2,.eot,.svg,.otf" maxSizeMB={20} onFileSelect={setFile}
        label="Arraste a fonte (.ttf, .woff, .woff2, .eot, .otf, .svg)" />

      <div className="mt-4">
        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
          Formato de saída
        </label>
        <div className="flex flex-wrap gap-2">
          {OUTPUT_FORMATS.map((f) => (
            <button key={f} onClick={() => setToType(f)} aria-pressed={toType === f}
              className={`px-3 py-1.5 rounded-lg border text-sm font-mono font-medium transition-colors
                ${toType === f ? 'bg-brand-accent text-white border-brand-accent'
                               : 'bg-white text-gray-700 border-gray-300 hover:border-brand-accent dark:bg-gray-800 dark:text-gray-200'}`}>
              .{f}
            </button>
          ))}
        </div>
      </div>

      <button onClick={() => file && convert(file, { toFormat: toType })}
        disabled={!file || status === 'loading'}
        className="mt-6 w-full py-3 rounded-xl bg-brand-accent hover:bg-brand-accentHover text-white font-semibold
                   disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
        {status === 'loading' ? 'Convertendo…' : 'Converter Fonte'}
      </button>

      <ConversionStatus status={status} errorMessage={errorMsg}
        successMessage="Fonte convertida! O download começou automaticamente." />
    </ToolLayout>
  );
}
