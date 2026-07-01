'use client';
import { useEffect, useState } from 'react';

export type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
  message: string;
  type?: ToastType;
  duration?: number;
  onClose: () => void;
}

export default function Toast({ message, type = 'success', duration = 3500, onClose }: ToastProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Trigger enter animation
    requestAnimationFrame(() => setVisible(true));
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 300);
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const styles: Record<ToastType, string> = {
    success: 'bg-green-50 border-green-300 text-green-800 dark:bg-green-900/30 dark:border-green-700 dark:text-green-300',
    error:   'bg-red-50 border-red-300 text-red-800 dark:bg-red-900/30 dark:border-red-700 dark:text-red-300',
    info:    'bg-blue-50 border-blue-300 text-blue-800 dark:bg-blue-900/30 dark:border-blue-700 dark:text-blue-300',
  };

  const icons: Record<ToastType, string> = {
    success: 'M5 13l4 4L19 7',
    error:   'M6 18L18 6M6 6l12 12',
    info:    'M13 16h-1v-4h-1m1-4h.01',
  };

  return (
    <div
      role="alert"
      aria-live="assertive"
      className={`
        fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3
        rounded-xl border shadow-lg text-sm font-medium
        transition-all duration-300
        ${styles[type]}
        ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}
      `}
    >
      <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icons[type]} />
      </svg>
      {message}
      <button onClick={() => { setVisible(false); setTimeout(onClose, 300); }}
        className="ml-2 opacity-60 hover:opacity-100 transition-opacity" aria-label="Fechar">
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

// Hook conveniente para usar toast em qualquer página
export function useToast() {
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);
  const show = (message: string, type: ToastType = 'success') => setToast({ message, type });
  const hide = () => setToast(null);
  return { toast, show, hide };
}
