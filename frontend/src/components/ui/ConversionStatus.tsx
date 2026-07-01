'use client';
import { useEffect, useState } from 'react';

interface ConversionStatusProps {
  status: 'idle' | 'loading' | 'success' | 'error';
  successMessage?: string;
  errorMessage?: string;
  className?: string;
}

export default function ConversionStatus({
  status,
  successMessage = 'Conversão concluída!',
  errorMessage   = 'Ocorreu um erro.',
  className = '',
}: ConversionStatusProps) {
  // Depois de alguns segundos em "loading", avisa que conversões pesadas
  // (LibreOffice, Calibre etc.) podem demorar mais — evita a sensação de
  // que o app travou em arquivos grandes ou formatos complexos.
  const [showSlowHint, setShowSlowHint] = useState(false);

  useEffect(() => {
    if (status !== 'loading') {
      setShowSlowHint(false);
      return;
    }
    const timer = setTimeout(() => setShowSlowHint(true), 5000);
    return () => clearTimeout(timer);
  }, [status]);

  if (status === 'idle') return null;

  const configs = {
    loading: {
      bg:   'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800',
      icon: (
        <svg className="w-5 h-5 text-blue-500 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      ),
      text: 'text-blue-700 dark:text-blue-300',
      msg:  showSlowHint
        ? 'Isso pode levar até 1 minuto para arquivos grandes ou formatos complexos.'
        : 'Convertendo, aguarde…',
    },
    success: {
      bg:   'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800',
      icon: (
        <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      ),
      text: 'text-green-700 dark:text-green-300',
      msg:  successMessage,
    },
    error: {
      bg:   'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800',
      icon: (
        <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      text: 'text-red-700 dark:text-red-300',
      msg:  errorMessage,
    },
  };

  const c = configs[status];

  return (
    <div role="status" aria-live="polite"
      className={`mt-4 flex items-start gap-3 p-4 rounded-xl border ${c.bg} ${className}`}>
      <span className="mt-0.5 shrink-0">{c.icon}</span>
      <p className={`text-sm font-medium ${c.text}`}>{c.msg}</p>
    </div>
  );
}
