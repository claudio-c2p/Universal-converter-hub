import type { ChainStepConfig } from './ChainBuilder';

export default function ChainStep({
  index,
  step,
  onRemove,
}: {
  index: number;
  step: ChainStepConfig;
  onRemove: () => void;
}) {
  return (
    <li className="flex items-center justify-between rounded-md border border-[var(--border-color)] px-3 py-2 text-sm">
      <span>
        Passo {index + 1}: {step.from.toUpperCase()} → {step.to.toUpperCase()}
      </span>
      <button onClick={onRemove} aria-label={`Remover passo ${index + 1}`}>
        ✕
      </button>
    </li>
  );
}
