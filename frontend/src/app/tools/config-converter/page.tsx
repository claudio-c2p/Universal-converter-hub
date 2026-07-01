'use client';
import { useState } from 'react';
import { useConverter } from '@/hooks/useConverter';
import FileDropzone from '@/components/ui/FileDropzone';
import ConversionStatus from '@/components/ui/ConversionStatus';
import ToolLayout from '@/components/ui/ToolLayout';
import ToolIcon from '@/components/ui/ToolIcon';

type ConfigFormat = 'json' | 'toml' | 'ini' | 'env';

const FORMAT_OPTIONS: { value: ConfigFormat; label: string; ext: string }[] = [
  { value: 'json', label: 'JSON', ext: '.json' },
  { value: 'toml', label: 'TOML', ext: '.toml' },
  { value: 'ini',  label: 'INI',  ext: '.ini'  },
  { value: 'env',  label: '.ENV', ext: ''       },
];

const EXT_TO_FORMAT: Record<string, ConfigFormat> = {
  '.json': 'json', '.toml': 'toml', '.ini': 'ini', '.env': 'env', '.txt': 'env',
};

export default function ConfigConverterPage() {
  const [file,       setFile]       = useState<File | null>(null);
  const [fromFormat, setFromFormat] = useState<ConfigFormat>('json');
  const [toFormat,   setToFormat]   = useState<ConfigFormat>('toml');

  function handleFileSelect(f: File | null) {
    setFile(f);
    if (!f) return;
    const ext = f.name.includes('.env') ? '.env' : f.name.slice(f.name.lastIndexOf('.')).toLowerCase();
    const detected = EXT_TO_FORMAT[ext];
    if (detected) setFromFormat(detected);
  }

  const { status, errorMsg, convert } = useConverter({
    endpoint: '/api/config/convert',
    outputFilename: (name) => {
      const base   = name.replace(/\.[^.]+$/, '');
      const outExt = FORMAT_OPTIONS.find((f) => f.value === toFormat)?.ext ?? '';
      return toFormat === 'env' ? `.env.${base}` : `${base}${outExt}`;
    },
  });

  const FormatSelector = ({ label, value, onChange }: {
    label: string; value: ConfigFormat; onChange: (v: ConfigFormat) => void;
  }) => (
    <div>
      <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">{label}</label>
      <div className="flex gap-2 flex-wrap">
        {FORMAT_OPTIONS.map((opt) => (
          <button key={opt.value} onClick={() => onChange(opt.value)} aria-pressed={value === opt.value}
            className={`px-3 py-1.5 rounded-lg border text-sm font-mono font-medium transition-colors
              ${value === opt.value
                ? 'bg-brand-accent text-white border-brand-accent'
                : 'bg-white text-gray-700 border-gray-300 hover:border-brand-accent dark:bg-gray-800 dark:text-gray-200'}`}>
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <ToolLayout title="Conversor de Config" description="Converta entre .env, JSON, TOML e INI instantaneamente." category="Dev" icon={<ToolIcon d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />}>
      <FileDropzone accept=".json,.toml,.ini,.env,.txt" maxSizeMB={0.5} onFileSelect={handleFileSelect}
        label="Arraste seu arquivo .env, .json, .toml ou .ini" />

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormatSelector label="Formato de entrada" value={fromFormat} onChange={setFromFormat} />
        <FormatSelector label="Formato de saída"   value={toFormat}   onChange={setToFormat}   />
      </div>

      {fromFormat === toFormat && (
        <p className="mt-3 text-xs text-amber-600 dark:text-amber-400">
          ⚠️ Os formatos de entrada e saída são iguais. Escolha formatos diferentes.
        </p>
      )}

      <button
        onClick={() => file && convert(file, { fromFormat, toFormat })}
        disabled={!file || status === 'loading' || fromFormat === toFormat}
        className="mt-6 w-full py-3 rounded-xl bg-brand-accent hover:bg-brand-accentHover text-white font-semibold
                   disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
        {status === 'loading' ? 'Convertendo…' : 'Converter'}
      </button>

      <ConversionStatus status={status} errorMessage={errorMsg} />
    </ToolLayout>
  );
}
