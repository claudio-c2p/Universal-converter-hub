interface DiffPart {
  value:   string;
  added:   boolean;
  removed: boolean;
}

interface DiffStats {
  additions: number;
  deletions: number;
  unchanged: number;
  identical: boolean;
}

interface DiffViewerProps {
  parts:      DiffPart[];
  stats:      DiffStats;
  filenameA?: string;
  filenameB?: string;
  className?: string;
}

export default function DiffViewer({ parts, stats, filenameA = 'A', filenameB = 'B', className = '' }: DiffViewerProps) {
  if (stats.identical) {
    return (
      <div className={`p-4 rounded-xl bg-green-50 border border-green-200 dark:bg-green-900/20 dark:border-green-800 ${className}`}>
        <p className="text-sm font-medium text-green-700 dark:text-green-300">
          ✓ Os arquivos são idênticos — nenhuma diferença encontrada.
        </p>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="flex gap-4 mb-3 text-xs font-mono">
        <span className="text-green-600 dark:text-green-400">+{stats.additions} adições</span>
        <span className="text-red-600 dark:text-red-400">−{stats.deletions} remoções</span>
        <span className="text-gray-400">{stats.unchanged} sem alteração</span>
      </div>

      <div className="grid grid-cols-2 gap-px text-xs font-mono mb-1">
        <div className="bg-red-100 dark:bg-red-900/30 px-3 py-1 rounded-tl-lg text-red-700 dark:text-red-300 truncate">
          − {filenameA}
        </div>
        <div className="bg-green-100 dark:bg-green-900/30 px-3 py-1 rounded-tr-lg text-green-700 dark:text-green-300 truncate">
          + {filenameB}
        </div>
      </div>

      <div className="overflow-auto max-h-[500px] rounded-b-lg border border-brand-border dark:border-gray-700
                      bg-brand-surface dark:bg-gray-900 font-mono text-xs leading-relaxed">
        {parts.map((part, i) => {
          const lines = part.value.split('\n');
          const bg = part.added
            ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200'
            : part.removed
              ? 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200'
              : 'text-gray-600 dark:text-gray-400';
          const prefix = part.added ? '+' : part.removed ? '−' : ' ';

          return lines
            .filter((l, li) => !(li === lines.length - 1 && l === ''))
            .map((line, j) => (
              <div key={`${i}-${j}`} className={`flex gap-2 px-3 py-0.5 ${bg}`}>
                <span className="select-none w-4 shrink-0 opacity-60">{prefix}</span>
                <span className="whitespace-pre-wrap break-all">{line}</span>
              </div>
            ));
        })}
      </div>
    </div>
  );
}
