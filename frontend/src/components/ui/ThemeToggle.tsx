'use client';
import { useTheme } from './ThemeProvider';

const OPTIONS = [
  {
    id: 'light' as const,
    label: 'Modo claro',
    activeClass: 'text-white',
    activeBg: 'bg-gradient-to-br from-amber-400 to-orange-500 shadow-sm shadow-orange-500/30',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M12 5a7 7 0 000 14 7 7 0 000-14z" />
      </svg>
    ),
  },
  {
    id: 'dark' as const,
    label: 'Modo escuro',
    activeClass: 'text-white',
    activeBg: 'bg-gradient-to-br from-indigo-500 to-violet-700 shadow-sm shadow-indigo-900/30',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
      </svg>
    ),
  },
  {
    id: 'rain' as const,
    label: 'Modo chuva',
    activeClass: 'text-white',
    activeBg: 'bg-gradient-to-br from-sky-400 to-blue-600 shadow-sm shadow-blue-900/30',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M3 15a4 4 0 014-4h.34a5.5 5.5 0 0110.6 1.5A3.5 3.5 0 0117.5 19H7a4 4 0 01-4-4z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 19l-1 2M12 19l-1 2M16 19l-1 2" />
      </svg>
    ),
  },
];

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const active = OPTIONS.find((o) => o.id === theme);
  return (
    <div className="relative flex items-center gap-0.5 p-0.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-input)]">
      {OPTIONS.map((opt) => (
        <button
          key={opt.id}
          onClick={() => setTheme(opt.id)}
          aria-label={opt.label}
          aria-pressed={theme === opt.id}
          className={`relative z-10 w-8 h-8 flex items-center justify-center rounded-lg transition-all duration-300 ${
            theme === opt.id
              ? `${opt.activeBg} ${opt.activeClass}`
              : 'text-[var(--text-secondary)] hover:text-brand-accent'
          }`}
        >
          {opt.icon}
        </button>
      ))}
    </div>
  );
}
