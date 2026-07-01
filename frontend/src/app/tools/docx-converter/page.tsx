'use client';
import { useState } from 'react';
import { useConverter } from '@/hooks/useConverter';
import FileDropzone from '@/components/ui/FileDropzone';
import ConversionStatus from '@/components/ui/ConversionStatus';
import ToolLayout from '@/components/ui/ToolLayout';
import ToolIcon from '@/components/ui/ToolIcon';

type ToFormat = 'html' | 'markdown';

export default function DocxConverterPage() {
  const [file, setFile]       = useState<File | null>(null);
  const [toFormat, setFormat] = useState<ToFormat>('html');

  const { status, errorMsg, convert } = useConverter({
    endpoint: '/api/docx/convert',
    outputFilename: (name) => name.replace(/\.docx$/i, toFormat === 'html' ? '.html' : '.md'),
  });

  return (
    <ToolLayout title="Word → HTML / Markdown" description="Converta documentos .docx para HTML ou Markdown." category="Documento" icon={<ToolIcon d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z M9 9h6M9 13h6M9 17h3" />}>
      <FileDropzone accept=".docx" maxSizeMB={20} onFileSelect={setFile} label="Arraste o arquivo .docx aqui" />

      <div className="mt-4 flex gap-3">
        {(['html', 'markdown'] as ToFormat[]).map((f) => (
          <button key={f} onClick={() => setFormat(f)} aria-pressed={toFormat === f}
            className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors
              ${toFormat === f ? 'bg-brand-accent text-white border-brand-accent'
                               : 'bg-white text-gray-700 border-gray-300 hover:border-brand-accent dark:bg-gray-800 dark:text-gray-200'}`}>
            {f === 'html' ? 'HTML' : 'Markdown (.md)'}
          </button>
        ))}
      </div>

      <button onClick={() => file && convert(file, { toFormat })}
        disabled={!file || status === 'loading'}
        className="mt-6 w-full py-3 rounded-xl bg-brand-accent hover:bg-brand-accentHover text-white font-semibold
                   disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
        {status === 'loading' ? 'Convertendo…' : 'Converter'}
      </button>

      <ConversionStatus status={status} errorMessage={errorMsg}
        successMessage="Documento convertido! O download começou." />

      {/* D3/D4/D5 — Em breve */}
      <div className="mt-8 border-t border-brand-border dark:border-gray-700 pt-6 space-y-3">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Em breve nesta categoria</p>
        {[
          { title: 'OCR em PDF', reason: 'Requer processamento assíncrono, lento em planos gratuitos.' },
          { title: 'Word ↔ ODT', reason: 'Requer LibreOffice instalado no servidor.' },
          { title: 'PDF ↔ HTML com layout', reason: 'Requer solução paga ou Java.' },
        ].map((item) => (
          <div key={item.title} className="flex items-start gap-2 p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
            <span className="text-xs font-medium text-gray-400 bg-gray-200 dark:bg-gray-600 px-2 py-0.5 rounded-full shrink-0">Em breve</span>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-300">{item.title}</p>
              <p className="text-xs text-gray-400">{item.reason}</p>
            </div>
          </div>
        ))}
      </div>
    </ToolLayout>
  );
}
