'use client';
import { useCallback, useRef, useState } from 'react';

interface FileDropzoneProps {
  accept: string;
  maxSizeMB: number;
  onFileSelect: (file: File | null) => void;
  label?: string;
  className?: string;
}

export default function FileDropzone({
  accept, maxSizeMB, onFileSelect,
  label = 'Arraste o arquivo aqui ou clique para selecionar',
  className = '',
}: FileDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging]   = useState(false);
  const [selected, setSelected]   = useState<File | null>(null);
  const [sizeError, setSizeError] = useState('');

  const handleFile = useCallback((file: File | null) => {
    setSizeError('');
    if (!file) { setSelected(null); onFileSelect(null); return; }

    // Validação de extensão — necessária aqui porque o atributo `accept` do
    // <input> só filtra a seleção via clique; arrastar-e-soltar ignora `accept`.
    // accept="*" (ou vazio) significa "qualquer arquivo" — não valida extensão.
    const allowedExts = accept.split(',').map((s) => s.trim().toLowerCase()).filter(Boolean);
    const acceptsAny = allowedExts.length === 0 || allowedExts.includes('*');
    const fileExt = '.' + (file.name.split('.').pop()?.toLowerCase() ?? '');
    if (!acceptsAny && !allowedExts.includes(fileExt)) {
      setSizeError(`Tipo de arquivo não suportado. Aceita: ${accept}`);
      setSelected(null); onFileSelect(null);
      if (inputRef.current) inputRef.current.value = '';
      return;
    }

    if (file.size > maxSizeMB * 1024 * 1024) {
      setSizeError(`Arquivo muito grande. Máximo: ${maxSizeMB} MB.`);
      setSelected(null); onFileSelect(null);
      // Limpa o valor do input — sem isso, selecionar o mesmo arquivo de novo
      // não dispararia onChange, deixando o erro "travado" na tela.
      if (inputRef.current) inputRef.current.value = '';
      return;
    }
    setSelected(file);
    onFileSelect(file);
  }, [accept, maxSizeMB, onFileSelect]);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragging(false);
    handleFile(e.dataTransfer.files[0] ?? null);
  }, [handleFile]);

  const formatSize = (bytes: number) =>
    bytes < 1024 * 1024
      ? `${(bytes / 1024).toFixed(1)} KB`
      : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;

  return (
    <div className={className}>
      <div
        role="button" tabIndex={0} aria-label={label}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={`
          group relative flex flex-col items-center justify-center gap-2
          w-full min-h-[160px] rounded-xl border-2 border-dashed cursor-pointer
          transition-all duration-200 select-none
          ${dragging
            ? 'border-brand-accent bg-brand-accent/5 scale-[1.015] shadow-inner'
            : selected
              ? 'border-brand-accent/70 bg-brand-accent/5 dark:border-brand-accent/50'
              : 'border-brand-border bg-brand-surface hover:border-brand-accent hover:bg-brand-accent/[0.03] dark:bg-gray-800/50 dark:border-gray-600'
          }
        `}
      >
        <input ref={inputRef} type="file" accept={accept} className="sr-only"
          onChange={(e) => handleFile(e.target.files?.[0] ?? null)} aria-hidden="true" />

        {selected ? (
          <>
            <span className="relative flex items-center justify-center w-12 h-12 rounded-full bg-brand-accent/10 animate-scale-in">
              <svg className="w-6 h-6 text-brand-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 12l2 2 4-4M7 12a5 5 0 1110 0 5 5 0 01-10 0z" />
              </svg>
            </span>
            <span className="text-sm font-medium text-gray-800 dark:text-gray-100 text-center px-4 break-all">
              {selected.name}
            </span>
            <span className="text-xs text-gray-400">{formatSize(selected.size)}</span>
            <button
              onClick={(e) => { e.stopPropagation(); handleFile(null); inputRef.current && (inputRef.current.value = ''); }}
              className="absolute top-2 right-2 p-1.5 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              aria-label="Remover arquivo selecionado"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </>
        ) : (
          <>
            <svg className="w-10 h-10 text-gray-300 dark:text-gray-500 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:text-brand-accent/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <span className="text-sm text-gray-500 dark:text-gray-400 text-center px-4">{label}</span>
            <span className="text-xs text-gray-400">Aceita: {accept} · Máx: {maxSizeMB} MB</span>
          </>
        )}
      </div>
      {sizeError && (
        <p role="alert" className="mt-2 text-xs text-red-600 dark:text-red-400 animate-fade-in">{sizeError}</p>
      )}
    </div>
  );
}
