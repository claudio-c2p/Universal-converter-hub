'use client';
import { useEffect, useState } from 'react';
import ToolLayout from '@/components/ui/ToolLayout';

const SETS = {
  lower: 'abcdefghijklmnopqrstuvwxyz',
  upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  digits: '0123456789',
  symbols: '!@#$%^&*()-_=+[]{};:,.<>?',
};

function generate(length: number, opts: Record<keyof typeof SETS, boolean>) {
  const pool = (Object.keys(SETS) as (keyof typeof SETS)[]).filter((k) => opts[k]).map((k) => SETS[k]).join('');
  if (!pool) return '';
  const bytes = new Uint32Array(length);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => pool[b % pool.length]).join('');
}

export default function PasswordGeneratorPage() {
  const [length, setLength] = useState(16);
  const [opts, setOpts] = useState({ lower: true, upper: true, digits: true, symbols: true });
  const [password, setPassword] = useState('');

  useEffect(() => { setPassword(generate(length, opts)); }, [length, opts]);

  return (
    <ToolLayout title="Gerador de Senha" description="Gere senhas aleatórias com aleatoriedade criptográfica." category="Texto">
      <div className="flex gap-2">
        <input readOnly value={password} className="flex-1 rounded-md border border-brand-border dark:border-gray-700 bg-transparent px-3 py-2 text-sm font-mono" />
        <button onClick={() => password && navigator.clipboard.writeText(password)}
          className="rounded-md border border-brand-border dark:border-gray-700 px-3 py-2 text-sm">Copiar</button>
        <button onClick={() => setPassword(generate(length, opts))}
          className="rounded-md bg-[var(--brand-accent,#E84E1B)] px-3 py-2 text-sm text-white">Gerar</button>
      </div>
      <label className="block mt-6 text-sm">
        <span className="block mb-1 text-brand-muted dark:text-gray-400">Comprimento: {length}</span>
        <input type="range" min={6} max={64} value={length} onChange={(e) => setLength(Number(e.target.value))} className="w-full" />
      </label>
      <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
        {([
          ['lower', 'Minúsculas (a-z)'], ['upper', 'Maiúsculas (A-Z)'],
          ['digits', 'Números (0-9)'], ['symbols', 'Símbolos (!@#…)'],
        ] as const).map(([key, label]) => (
          <label key={key} className="flex items-center gap-2">
            <input type="checkbox" checked={opts[key]} onChange={(e) => setOpts((o) => ({ ...o, [key]: e.target.checked }))} />
            {label}
          </label>
        ))}
      </div>
    </ToolLayout>
  );
}
