'use client';
import { useCallback, useState } from 'react';

type ConversionStatus = 'idle' | 'loading' | 'success' | 'error';

interface UseConverterOptions {
  endpoint: string;
  outputFilename: (inputName: string, blob?: Blob) => string;
  /** Chamado após download bem-sucedido */
  onSuccess?: (filename: string) => void;
  /** Campos extras além do "file" no FormData (multi-arquivo) */
  multipleFiles?: boolean;
}

interface UseConverterReturn {
  status:   ConversionStatus;
  errorMsg: string;
  convert:  (file: File | File[], extraFields?: Record<string, string>) => Promise<void>;
  reset:    () => void;
}

export function useConverter({
  endpoint,
  outputFilename,
  onSuccess,
  multipleFiles = false,
}: UseConverterOptions): UseConverterReturn {
  const [status,   setStatus]   = useState<ConversionStatus>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? '';

  const convert = useCallback(
    async (file: File | File[], extraFields: Record<string, string> = {}) => {
      setStatus('loading');
      setErrorMsg('');

      const body = new FormData();

      if (Array.isArray(file)) {
        // Múltiplos arquivos: usa o campo "files" (ex: batch-rename, split-merge)
        file.forEach((f) => body.append('files', f));
      } else {
        body.append('file', file);
      }

      Object.entries(extraFields).forEach(([k, v]) => body.append(k, v));

      try {
        const res = await fetch(`${baseUrl}${endpoint}`, {
          method:  'POST',
          body,
          // Sem Content-Type: o browser define boundary correto para multipart
        });

        if (!res.ok) {
          let message = `Erro ${res.status}`;
          try {
            const data = await res.json();
            if (data?.error) message = data.error;
          } catch {
            // Resposta não é JSON — usa mensagem HTTP padrão
          }
          throw new Error(message);
        }

        // Tenta extrair o nome de arquivo do Content-Disposition
        const disposition = res.headers.get('Content-Disposition') ?? '';
        const cdMatch = disposition.match(/filename[^;=\n]*=(?:(['"])([^'"]+)\1|([^;\n]+))/i);
        const serverFilename = cdMatch ? (cdMatch[2] ?? cdMatch[3] ?? '').trim() : '';

        const blob     = await res.blob();
        const filename = serverFilename || outputFilename(
          Array.isArray(file) ? file[0].name : file.name,
          blob,
        );

        const url    = URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href     = url;
        anchor.download = filename;
        document.body.appendChild(anchor);
        anchor.click();
        document.body.removeChild(anchor);
        URL.revokeObjectURL(url);

        setStatus('success');
        onSuccess?.(filename);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Erro desconhecido.';
        setErrorMsg(msg);
        setStatus('error');
      }
    },
    [baseUrl, endpoint, outputFilename, onSuccess],
  );

  const reset = useCallback(() => {
    setStatus('idle');
    setErrorMsg('');
  }, []);

  return { status, errorMsg, convert, reset };
}
