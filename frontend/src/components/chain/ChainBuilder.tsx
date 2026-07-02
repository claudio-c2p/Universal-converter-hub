'use client';
import { useState } from 'react';
import ChainStep from './ChainStep';

export interface ChainStepConfig {
  id: string;
  from: string;
  to: string;
}

interface ChainBuilderProps {
  formatsGraph: Record<string, string[]>;
  onSubmit: (file: File, steps: ChainStepConfig[]) => void;
}

export default function ChainBuilder({ formatsGraph, onSubmit }: ChainBuilderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [steps, setSteps] = useState<ChainStepConfig[]>([]);

  function currentFormat(): string | null {
    if (!file) return null;
    const ext = file.name.split('.').pop()?.toLowerCase() ?? null;
    return steps.length > 0 ? steps[steps.length - 1].to : ext;
  }

  function addStep(to: string) {
    const from = currentFormat();
    if (!from || steps.length >= 5) return;
    setSteps((s) => [...s, { id: crypto.randomUUID(), from, to }]);
  }

  function removeStep(id: string) {
    setSteps((s) => s.filter((step) => step.id !== id));
  }

  const from = currentFormat();
  const options = from ? formatsGraph[from] ?? [] : [];

  return (
    <div className="space-y-4">
      <input
        type="file"
        onChange={(e) => {
          setFile(e.target.files?.[0] ?? null);
          setSteps([]);
        }}
        className="text-sm"
      />
      {steps.length > 0 && (
        <ul className="space-y-2">
          {steps.map((step, i) => (
            <ChainStep key={step.id} index={i} step={step} onRemove={() => removeStep(step.id)} />
          ))}
        </ul>
      )}
      {file && steps.length < 5 && (
        options.length > 0 ? (
          <select
            onChange={(e) => e.target.value && addStep(e.target.value)}
            value=""
            className="rounded-md border border-[var(--border-color)] px-2 py-1.5 text-sm"
          >
            <option value="" disabled>
              Adicionar passo: converter para…
            </option>
            {options.map((fmt) => (
              <option key={fmt} value={fmt}>
                {fmt.toUpperCase()}
              </option>
            ))}
          </select>
        ) : (
          <p className="text-xs text-[var(--text-secondary)]">
            Nenhuma conversão disponível a partir de &quot;{from?.toUpperCase()}&quot; ainda.
          </p>
        )
      )}
      <button
        disabled={!file || steps.length === 0}
        onClick={() => file && onSubmit(file, steps)}
        className="rounded-md bg-[var(--brand-accent,#E84E1B)] px-4 py-2 text-sm text-white disabled:opacity-50"
      >
        Executar cadeia
      </button>
    </div>
  );
}
