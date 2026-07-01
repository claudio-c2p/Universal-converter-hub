'use client';
import { useState } from 'react';
import { useConverter } from '@/hooks/useConverter';
import FileDropzone from '@/components/ui/FileDropzone';
import ConversionStatus from '@/components/ui/ConversionStatus';
import ToolLayout from '@/components/ui/ToolLayout';
import ToolIcon from '@/components/ui/ToolIcon';
import Toast, { useToast } from '@/components/ui/Toast';

type OutputFormat = 'WebVTT' | 'SRT';

export default function SubtitleConverterPage() {
  const [file,   setFile]   = useState<File | null>(null);
  const [format, setFormat] = useState<OutputFormat>('WebVTT');
  const ext = format === 'WebVTT' ? 'vtt' : 'srt';
  const { toast, show: showToast, hide: hideToast } = useToast();

  const { status, errorMsg, convert } = useConverter({
    endpoint: '/api/subtitle/convert',
    outputFilename: (name) => name.replace(/\.(srt|vtt)$/i, `.${ext}`),
    onSuccess: (filename) => showToast(`✓ ${filename} baixado com sucesso!`),
  });

  return (
    <ToolLayout title="Conversor de Legendas" description="Converta entre SRT e WebVTT gratuitamente." category="Mídia" icon={<ToolIcon d="M7 8h10M7 12h6m-6 4h10M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />}>
      <FileDropzone accept=".srt,.vtt" maxSizeMB={2} onFileSelect={setFile}
        label="Arraste o arquivo .srt ou .vtt aqui" />

      <div className="mt-4 flex gap-3">
        {(['WebVTT', 'SRT'] as OutputFormat[]).map((f) => (
          <button key={f} onClick={() => setFormat(f)} aria-pressed={format === f}
            className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors
              ${format === f ? 'bg-brand-accent text-white border-brand-accent'
                             : 'bg-white text-gray-700 border-gray-300 hover:border-brand-accent dark:bg-gray-800 dark:text-gray-200'}`}>
            {f}
          </button>
        ))}
      </div>

      <button onClick={() => file && convert(file, { toFormat: format })}
        disabled={!file || status === 'loading'}
        className="mt-6 w-full py-3 rounded-xl bg-brand-accent hover:bg-brand-accentHover text-white font-semibold
                   disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        aria-label="Converter legenda">
        {status === 'loading' ? 'Convertendo…' : 'Converter'}
      </button>

      <ConversionStatus status={status} errorMessage={errorMsg}
        successMessage="Conversão concluída! O download começou automaticamente." />

      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}
    </ToolLayout>
  );
}
