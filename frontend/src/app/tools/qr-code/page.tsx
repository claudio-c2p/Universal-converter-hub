'use client';
import { useEffect, useRef, useState } from 'react';
import ToolLayout from '@/components/ui/ToolLayout';

export default function QrCodePage() {
  const [text, setText] = useState('https://c2p.com.br');
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let cancelled = false;
    async function render() {
      if (!text.trim()) { setDataUrl(null); return; }
      try {
        const QRCode = (await import('qrcode')).default;
        const url = await QRCode.toDataURL(text, { width: 320, margin: 1 });
        if (!cancelled) { setDataUrl(url); setError(null); }
      } catch {
        if (!cancelled) setError('Não foi possível gerar o QR Code para esse texto.');
      }
    }
    render();
    return () => { cancelled = true; };
  }, [text]);

  return (
    <ToolLayout title="Gerador de QR Code" description="Gere um QR Code a partir de um texto ou URL, 100% no navegador." category="Texto">
      <label className="block text-sm">
        <span className="block mb-1 text-brand-muted dark:text-gray-400">Texto ou URL</span>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={3}
          className="w-full rounded-md border border-brand-border dark:border-gray-700 bg-transparent p-3 text-sm"
        />
      </label>
      {error && <p className="mt-3 text-sm text-red-500">{error}</p>}
      {dataUrl && (
        <div className="mt-6 flex flex-col items-center gap-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={dataUrl} alt="QR Code gerado" width={320} height={320} className="rounded-lg border border-brand-border dark:border-gray-700" />
          <a href={dataUrl} download="qrcode.png"
            className="rounded-md bg-[var(--brand-accent,#E84E1B)] px-4 py-2 text-sm font-medium text-white">
            Baixar PNG
          </a>
        </div>
      )}
      <canvas ref={canvasRef} className="hidden" />
    </ToolLayout>
  );
}
