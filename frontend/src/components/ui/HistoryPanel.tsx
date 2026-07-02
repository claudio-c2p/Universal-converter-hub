'use client';
import { useEffect, useState } from 'react';

export interface HistoryEntry {
  id: string;
  toolTitle: string;
  fileName: string;
  timestamp: number;
  downloadUrl?: string;
}

const STORAGE_KEY = 'c2p:history';
const MAX_ENTRIES = 50;

export function pushHistoryEntry(entry: Omit<HistoryEntry, 'id' | 'timestamp'>) {
  if (typeof window === 'undefined') return;
  const list = readHistory();
  const newEntry: HistoryEntry = { ...entry, id: crypto.randomUUID(), timestamp: Date.now() };
  const next = [newEntry, ...list].slice(0, MAX_ENTRIES);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}

function readHistory(): HistoryEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as HistoryEntry[]) : [];
  } catch {
    return [];
  }
}

export default function HistoryPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [entries, setEntries] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    if (open) setEntries(readHistory());
  }, [open]);

  function clearAll() {
    localStorage.removeItem(STORAGE_KEY);
    setEntries([]);
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/30" onClick={onClose}>
      <aside
        className="h-full w-full max-w-sm bg-[var(--bg-header)] p-4 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold">Histórico de conversões</h2>
          <button onClick={onClose} aria-label="Fechar">✕</button>
        </div>
        {entries.length === 0 && (
          <p className="text-sm text-[var(--text-secondary)]">Nenhuma conversão ainda.</p>
        )}
        <ul className="space-y-2">
          {entries.map((e) => (
            <li key={e.id} className="rounded-md border border-[var(--border-color)] p-2 text-sm">
              <p className="font-medium">{e.toolTitle}</p>
              <p className="truncate text-[var(--text-secondary)]">{e.fileName}</p>
              <p className="text-xs text-[var(--text-secondary)]">
                {new Date(e.timestamp).toLocaleString('pt-BR')}
              </p>
              {e.downloadUrl && (
                <a href={e.downloadUrl} className="text-[var(--brand-accent,#E84E1B)]">
                  Baixar novamente
                </a>
              )}
            </li>
          ))}
        </ul>
        {entries.length > 0 && (
          <button onClick={clearAll} className="mt-4 text-xs text-[var(--text-secondary)] underline">
            Limpar histórico
          </button>
        )}
      </aside>
    </div>
  );
}
