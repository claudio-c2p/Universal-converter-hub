'use client';
import { useCallback, useRef, useState } from 'react';

interface MultiFileDropzoneProps {
  accept: string;
  maxSizeMB: number;
  onFilesSelect: (files: File[]) => void;
  label?: string;
  helperText?: string;
  className?: string;
  /** Modo controlado: se informado, a lista exibida é esta (em vez do estado interno). */
  files?: File[];
}

export default function MultiFileDropzone({
  accept, maxSizeMB, onFilesSelect,
  label = 'Arraste os arquivos aqui ou clique para selecionar',
  helperText,
  className = '',
  files: controlledFiles,
}: MultiFileDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [internalFiles, setInternalFiles] = useState<File[]>([]);
  const isControlled = controlledFiles !== undefined;
  const files = isControlled ? controlledFiles : internalFiles;

  const formatSize = (bytes: number) =>
    bytes < 1024 * 1024
      ? `${(bytes / 1024).toFixed(1)} KB`
      : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;

  const handleFiles = useCallback((incoming: File[]) => {
    if (incoming.length === 0) return;
    // Acrescenta aos já selecionados (em vez de substituir), permitindo
    // múltiplas rodadas de seleção/drop antes de processar.
    const next = [...files, ...incoming];
    if (isControlled) {
      onFilesSelect(next);
    } else {
      setInternalFiles(next);
      onFilesSelect(next);
    }
  }, [files, isControlled, onFilesSelect]);

  const removeFile = useCallback((index: number) => {
    const next = files.filter((_, i) => i !== index);
    if (isControlled) {
      onFilesSelect(next);
    } else {
      setInternalFiles(next);
      onFilesSelect(next);
    }
  }, [files, isControlled, onFilesSelect]);

  const moveFile = useCallback((index: number, dir: -1 | 1) => {
    const target = index + dir;
    if (target < 0 || target >= files.length) return;
    const next = [...files];
    [next[index], next[target]] = [next[target], next[index]];
    if (isControlled) {
      onFilesSelect(next);
    } else {
      setInternalFiles(next);
      onFilesSelect(next);
    }
  }, [files, isControlled, onFilesSelect]);

  const clearAll = useCallback(() => {
    if (!isControlled) setInternalFiles([]);
    onFilesSelect([]);
    if (inputRef.current) inputRef.current.value = '';
  }, [isControlled, onFilesSelect]);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    handleFiles(Array.from(e.dataTransfer.files ?? []));
  }, [handleFiles]);

  const onInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(Array.from(e.target.files ?? []));
    // Limpa o input para permitir re-selecionar (ou adicionar) os mesmos arquivos depois.
    e.target.value = '';
  }, [handleFiles]);

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
            : files.length > 0
              ? 'border-brand-accent/70 bg-brand-accent/5 dark:border-brand-accent/50'
              : 'border-brand-border bg-brand-surface hover:border-brand-accent hover:bg-brand-accent/[0.03] dark:bg-gray-800/50 dark:border-gray-600'
          }
        `}
      >
        <input ref={inputRef} type="file" accept={accept} multiple className="sr-only"
          onChange={onInputChange} aria-hidden="true" />

        {files.length > 0 ? (
          <>
            <span className="relative flex items-center justify-center w-12 h-12 rounded-full bg-brand-accent/10 animate-scale-in">
              <svg className="w-6 h-6 text-brand-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 12l2 2 4-4M7 12a5 5 0 1110 0 5 5 0 01-10 0z" />
              </svg>
            </span>
            <span className="text-sm font-medium text-gray-800 dark:text-gray-100 text-center px-4">
              {files.length} arquivo{files.length > 1 ? 's' : ''} selecionado{files.length > 1 ? 's' : ''}
            </span>
            <span className="text-xs text-gray-400">Clique ou arraste para adicionar mais</span>
            <button
              onClick={(e) => { e.stopPropagation(); clearAll(); }}
              className="absolute top-2 right-2 p-1.5 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              aria-label="Remover todos os arquivos selecionados"
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
            <span className="text-xs text-gray-400">Aceita: {accept} · Máx: {maxSizeMB} MB cada</span>
          </>
        )}
      </div>

      {helperText && (
        <p className="mt-2 text-xs text-gray-400">{helperText}</p>
      )}

      {files.length > 0 && (
        <ul className="mt-3 divide-y divide-brand-border dark:divide-gray-700 rounded-xl border border-brand-border dark:border-gray-700 overflow-hidden">
          {files.map((f, i) => (
            <li
              key={`${f.name}-${f.lastModified}-${i}`}
              className="flex items-center gap-2 px-3 py-2 bg-brand-surface dark:bg-gray-800/50 animate-fade-in"
            >
              <span className="text-xs text-gray-400 font-mono w-5 shrink-0 text-right">{i + 1}.</span>
              <span className="flex-1 text-sm text-gray-700 dark:text-gray-200 truncate" title={f.name}>
                {f.name}
              </span>
              <span className="text-xs text-gray-400 shrink-0">{formatSize(f.size)}</span>
              <div className="flex items-center gap-0.5 shrink-0">
                <button
                  onClick={(e) => { e.stopPropagation(); moveFile(i, -1); }}
                  disabled={i === 0}
                  className="p-1 rounded-md text-gray-400 hover:text-brand-accent hover:bg-brand-accent/10 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                  aria-label={`Mover ${f.name} para cima`}
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); moveFile(i, 1); }}
                  disabled={i === files.length - 1}
                  className="p-1 rounded-md text-gray-400 hover:text-brand-accent hover:bg-brand-accent/10 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                  aria-label={`Mover ${f.name} para baixo`}
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); removeFile(i); }}
                  className="p-1 rounded-md text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  aria-label={`Remover ${f.name}`}
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
