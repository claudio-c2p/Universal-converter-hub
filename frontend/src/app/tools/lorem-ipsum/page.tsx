'use client';
import { useMemo, useState } from 'react';
import ToolLayout from '@/components/ui/ToolLayout';

const WORDS = 'lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua ut enim ad minim veniam quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat'.split(' ');

function pick<T>(arr: T[]) { return arr[Math.floor(Math.random() * arr.length)]; }

function makeSentence() {
  const len = 6 + Math.floor(Math.random() * 10);
  const words = Array.from({ length: len }, () => pick(WORDS));
  const sentence = words.join(' ');
  return sentence[0].toUpperCase() + sentence.slice(1) + '.';
}
function makeParagraph() {
  const sentences = 3 + Math.floor(Math.random() * 4);
  return Array.from({ length: sentences }, makeSentence).join(' ');
}

type Mode = 'palavras' | 'frases' | 'parágrafos';

export default function LoremIpsumPage() {
  const [mode, setMode] = useState<Mode>('parágrafos');
  const [count, setCount] = useState(3);
  const [seed, setSeed] = useState(0);

  const output = useMemo(() => {
    if (mode === 'palavras') return Array.from({ length: count }, () => pick(WORDS)).join(' ');
    if (mode === 'frases') return Array.from({ length: count }, makeSentence).join(' ');
    return Array.from({ length: count }, makeParagraph).join('\n\n');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, count, seed]);

  return (
    <ToolLayout title="Gerador de Lorem Ipsum" description="Gere parágrafos, frases ou palavras de texto placeholder." category="Texto">
      <div className="flex flex-wrap items-end gap-3">
        <div className="flex gap-2">
          {(['palavras', 'frases', 'parágrafos'] as Mode[]).map((m) => (
            <button key={m} onClick={() => setMode(m)}
              className={`rounded-md px-3 py-1.5 text-sm border capitalize ${mode === m ? 'bg-brand-accent text-white border-brand-accent' : 'border-brand-border dark:border-gray-700'}`}>
              {m}
            </button>
          ))}
        </div>
        <label className="text-sm">
          <span className="block mb-1 text-brand-muted dark:text-gray-400">Quantidade</span>
          <input type="number" min={1} max={50} value={count} onChange={(e) => setCount(Number(e.target.value) || 1)}
            className="w-24 rounded-md border border-brand-border dark:border-gray-700 bg-transparent px-3 py-2" />
        </label>
        <button onClick={() => setSeed((s) => s + 1)}
          className="rounded-md bg-[var(--brand-accent,#E84E1B)] px-3 py-2 text-sm text-white">Gerar de novo</button>
      </div>
      <textarea readOnly value={output} rows={12}
        className="mt-4 w-full rounded-md border border-brand-border dark:border-gray-700 bg-transparent p-3 text-sm" />
      <button onClick={() => output && navigator.clipboard.writeText(output)}
        className="mt-2 rounded-md border border-brand-border dark:border-gray-700 px-3 py-2 text-sm">Copiar</button>
    </ToolLayout>
  );
}
