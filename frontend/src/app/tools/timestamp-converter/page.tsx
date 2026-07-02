'use client';
import { useEffect, useState } from 'react';
import ToolLayout from '@/components/ui/ToolLayout';

export default function TimestampConverterPage() {
  const [unixInput, setUnixInput] = useState(String(Math.floor(Date.now() / 1000)));
  const [dateInput, setDateInput] = useState(() => new Date().toISOString().slice(0, 19));
  const [now, setNow] = useState(Math.floor(Date.now() / 1000));

  useEffect(() => {
    const id = setInterval(() => setNow(Math.floor(Date.now() / 1000)), 1000);
    return () => clearInterval(id);
  }, []);

  const unixToDate = (() => {
    const n = Number(unixInput);
    if (!Number.isFinite(n)) return null;
    // aceita segundos ou milissegundos automaticamente
    const ms = String(unixInput).length > 10 ? n : n * 1000;
    const d = new Date(ms);
    return Number.isNaN(d.getTime()) ? null : d;
  })();

  const dateToUnix = (() => {
    const d = new Date(dateInput);
    return Number.isNaN(d.getTime()) ? null : Math.floor(d.getTime() / 1000);
  })();

  return (
    <ToolLayout title="Conversor de Timestamp" description="Converta entre timestamp Unix e data legível, nos dois sentidos." category="Texto">
      <div className="rounded-md border border-brand-border dark:border-gray-700 p-3 text-sm">
        <span className="text-brand-muted dark:text-gray-400">Agora: </span>
        <span className="font-mono">{now}</span>
        <span className="text-brand-muted dark:text-gray-400"> — </span>
        <span className="font-mono">{new Date(now * 1000).toLocaleString('pt-BR')}</span>
      </div>

      <label className="block mt-6 text-sm">
        <span className="block mb-1 text-brand-muted dark:text-gray-400">Timestamp Unix → Data</span>
        <input value={unixInput} onChange={(e) => setUnixInput(e.target.value)}
          className="w-full rounded-md border border-brand-border dark:border-gray-700 bg-transparent px-3 py-2 text-sm font-mono" />
      </label>
      <p className="mt-2 text-sm">
        {unixToDate ? unixToDate.toLocaleString('pt-BR') : <span className="text-red-500">Timestamp inválido.</span>}
      </p>

      <label className="block mt-6 text-sm">
        <span className="block mb-1 text-brand-muted dark:text-gray-400">Data → Timestamp Unix</span>
        <input type="datetime-local" step="1" value={dateInput} onChange={(e) => setDateInput(e.target.value)}
          className="w-full rounded-md border border-brand-border dark:border-gray-700 bg-transparent px-3 py-2 text-sm" />
      </label>
      <p className="mt-2 text-sm font-mono">
        {dateToUnix !== null ? dateToUnix : <span className="text-red-500 font-sans">Data inválida.</span>}
      </p>
    </ToolLayout>
  );
}
