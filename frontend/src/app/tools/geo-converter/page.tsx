'use client';
import { useState } from 'react';
import { useConverter } from '@/hooks/useConverter';
import FileDropzone from '@/components/ui/FileDropzone';
import ConversionStatus from '@/components/ui/ConversionStatus';
import ToolLayout from '@/components/ui/ToolLayout';
import ToolIcon from '@/components/ui/ToolIcon';

const CONVERSIONS = [
  { label: 'KML → GeoJSON', accept: '.kml', toFormat: 'geojson', outExt: '.geojson' },
  { label: 'GPX → GeoJSON', accept: '.gpx', toFormat: 'geojson', outExt: '.geojson' },
  { label: 'GeoJSON → KML', accept: '.geojson,.json', toFormat: 'kml', outExt: '.kml' },
];

export default function GeoConverterPage() {
  const [file, setFile]     = useState<File | null>(null);
  const [mode, setMode]     = useState(0);
  const current = CONVERSIONS[mode];

  const { status, errorMsg, convert } = useConverter({
    endpoint: '/api/geo/convert',
    outputFilename: (name) => name.replace(/\.[^.]+$/, current.outExt),
  });

  return (
    <ToolLayout title="Conversor Geoespacial" description="KML ↔ GeoJSON · GPX → GeoJSON" category="Geo" icon={<ToolIcon d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />}>
      <div className="flex flex-wrap gap-2 mb-5">
        {CONVERSIONS.map((c, i) => (
          <button key={i} onClick={() => { setMode(i); setFile(null); }}
            aria-pressed={mode === i}
            className={`px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors
              ${mode === i ? 'bg-brand-accent text-white border-brand-accent'
                           : 'bg-white text-gray-700 border-gray-300 hover:border-brand-accent dark:bg-gray-800 dark:text-gray-200'}`}>
            {c.label}
          </button>
        ))}
      </div>

      <FileDropzone accept={current.accept} maxSizeMB={10} onFileSelect={setFile}
        label={`Arraste o arquivo ${current.accept} aqui`} />

      <button onClick={() => file && convert(file, { toFormat: current.toFormat })}
        disabled={!file || status === 'loading'}
        className="mt-6 w-full py-3 rounded-xl bg-brand-accent hover:bg-brand-accentHover text-white font-semibold
                   disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
        {status === 'loading' ? 'Convertendo…' : 'Converter'}
      </button>

      <ConversionStatus status={status} errorMessage={errorMsg}
        successMessage="Arquivo geoespacial convertido com sucesso!" />
    </ToolLayout>
  );
}
