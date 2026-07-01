'use client';
import { useState } from 'react';
import FileDropzone from '@/components/ui/FileDropzone';
import ConversionStatus from '@/components/ui/ConversionStatus';
import ToolLayout from '@/components/ui/ToolLayout';
import ToolIcon from '@/components/ui/ToolIcon';
import { useConverter } from '@/hooks/useConverter';

type ToFormat = 'yaml' | 'beautify' | 'minify' | 'csv';

const OPTIONS: { value: ToFormat; label: string }[] = [
  { value: 'yaml',     label: 'XML → YAML'       },
  { value: 'beautify', label: 'Formatar XML'      },
  { value: 'minify',   label: 'Minificar XML'     },
  { value: 'csv',      label: 'XML → CSV (lista)' },
];

const EXT_MAP: Record<ToFormat, string> = { yaml: '.yaml', beautify: '.xml', minify: '.min.xml', csv: '.csv' };

export default function XmlConverterPage() {
  const [file,            setFile]            = useState<File | null>(null);
  const [toFormat,        setToFormat]        = useState<ToFormat>('yaml');
  const [listElementPath, setListElementPath] = useState('');

  const { status, errorMsg, convert } = useConverter({
    endpoint: '/api/xml/convert',
    outputFilename: (inputName) => inputName.replace(/\.xml$/i, EXT_MAP[toFormat]),
  });

  function handleConvert() {
    if (!file) return;
    const extra: Record<string, string> = { toFormat };
    if (toFormat === 'csv') extra.listElementPath = listElementPath;
    convert(file, extra);
  }

  return (
    <ToolLayout title="Conversor XML" description="XML → YAML · Formatar · Minificar · XML → CSV" category="Dados" icon={<ToolIcon d="M10 20l4-16M6 16l-4-4 4-4M18 8l4 4-4 4" />}>
      <FileDropzone accept=".xml" maxSizeMB={5} onFileSelect={setFile} label="Arraste o arquivo .xml aqui" />

      <div className="mt-4 flex flex-wrap gap-2">
        {OPTIONS.map((o) => (
          <button key={o.value} onClick={() => setToFormat(o.value)} aria-pressed={toFormat === o.value}
            className={`px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors
              ${toFormat === o.value ? 'bg-brand-accent text-white border-brand-accent'
                                     : 'bg-white text-gray-700 border-gray-300 hover:border-brand-accent dark:bg-gray-800 dark:text-gray-200'}`}>
            {o.label}
          </button>
        ))}
      </div>

      {toFormat === 'csv' && (
        <div className="mt-3">
          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
            Caminho do elemento lista (ex: <code className="font-mono">usuarios.usuario</code>)
          </label>
          <input value={listElementPath} onChange={(e) => setListElementPath(e.target.value)}
            placeholder="root.item"
            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-sm font-mono
                       focus:border-brand-accent outline-none dark:bg-gray-700 dark:text-gray-100" />
        </div>
      )}

      <button onClick={handleConvert}
        disabled={!file || status === 'loading' || (toFormat === 'csv' && !listElementPath)}
        className="mt-6 w-full py-3 rounded-xl bg-brand-accent hover:bg-brand-accentHover text-white font-semibold
                   disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
        {status === 'loading' ? 'Convertendo…' : 'Converter'}
      </button>

      <ConversionStatus status={status} errorMessage={errorMsg}
        successMessage="Arquivo convertido com sucesso!" />
    </ToolLayout>
  );
}
