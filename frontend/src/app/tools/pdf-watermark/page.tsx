'use client';
import { useState } from 'react';
import { useConverter } from '@/hooks/useConverter';
import FileDropzone from '@/components/ui/FileDropzone';
import ConversionStatus from '@/components/ui/ConversionStatus';
import ToolLayout from '@/components/ui/ToolLayout';
import ToolIcon from '@/components/ui/ToolIcon';

export default function PdfWatermarkPage() {
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState('CONFIDENCIAL');
  const [opacity, setOpacity] = useState('0.3');
  const [color, setColor] = useState('gray');

  const { status, errorMsg, convert } = useConverter({
    endpoint: '/api/pdf-tools/watermark',
    outputFilename: () => 'watermarked.pdf',
  });

  return (
    <ToolLayout title="Marca d'Água em PDF" description="Adicione texto de marca d'água em todas as páginas." category="PDF" icon={<ToolIcon d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />}>
      <FileDropzone accept=".pdf" maxSizeMB={50} onFileSelect={setFile} label="Arraste o arquivo .pdf aqui" />

      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Texto</label>
          <input
            value={text} onChange={(e) => setText(e.target.value)}
            placeholder="CONFIDENCIAL"
            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-sm
                       focus:border-brand-accent outline-none dark:bg-gray-700 dark:text-gray-100"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
            Opacidade: {Math.round(parseFloat(opacity) * 100)}%
          </label>
          <input
            type="range" min="0.1" max="1" step="0.05"
            value={opacity} onChange={(e) => setOpacity(e.target.value)}
            className="w-full accent-brand-accent"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Cor</label>
          <div className="flex gap-2">
            {[{ v: 'gray', label: 'Cinza' }, { v: 'red', label: 'Vermelho' }, { v: 'blue', label: 'Azul' }].map((c) => (
              <button key={c.v} onClick={() => setColor(c.v)}
                className={`flex-1 py-1.5 rounded-lg border text-xs font-medium transition-colors
                  ${color === c.v ? 'bg-brand-accent text-white border-brand-accent'
                                  : 'bg-white text-gray-700 border-gray-300 hover:border-brand-accent dark:bg-gray-800 dark:text-gray-200'}`}>
                {c.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <button
        onClick={() => file && convert(file, { text, opacity, color })}
        disabled={!file || !text || status === 'loading'}
        className="mt-6 w-full py-3 rounded-xl bg-brand-accent hover:bg-brand-accentHover text-white
                   font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {status === 'loading' ? 'Adicionando…' : "Adicionar Marca d'Água"}
      </button>

      <ConversionStatus status={status} errorMessage={errorMsg} successMessage="Pronto! Download iniciado." />
    </ToolLayout>
  );
}
