'use client';
import { useMemo, useState } from 'react';
import Link from 'next/link';
import { TOOLS, CATEGORY_ORDER } from '@/lib/tools';
import CategoryBadge from '@/components/ui/CategoryBadge';

export default function FerramentasPage() {
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const categories = useMemo(
    () => CATEGORY_ORDER.filter((c) => TOOLS.some((t) => t.category === c)),
    [],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return TOOLS.filter((t) => {
      const matchesQuery = !q || t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q);
      const matchesCategory = !activeCategory || t.category === activeCategory;
      return matchesQuery && matchesCategory;
    });
  }, [query, activeCategory]);

  return (
    <div className="min-h-screen bg-brand-surface dark:bg-gray-950 px-4 py-10">
      <div className="max-w-6xl mx-auto">
        <Link href="/" className="text-sm text-brand-muted hover:text-brand-accent dark:text-gray-400 transition-colors">
          ← Voltar
        </Link>
        <h1 className="mt-4 text-2xl font-bold text-gray-900 dark:text-gray-100">Todas as ferramentas</h1>
        <p className="mt-1 text-sm text-brand-muted dark:text-gray-400">
          {TOOLS.length} ferramentas de conversão e utilitários, gratuitas e sem cadastro.
        </p>

        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar ferramenta (ex: PDF, HEIC, QR Code...)"
            className="flex-1 rounded-md border border-brand-border dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2.5 text-sm
                       focus:outline-none focus:ring-2 focus:ring-brand-accent/40"
          />
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            onClick={() => setActiveCategory(null)}
            className={`rounded-full px-3 py-1 text-xs font-medium border transition-colors ${
              activeCategory === null
                ? 'bg-brand-accent text-white border-brand-accent'
                : 'border-brand-border dark:border-gray-700 text-brand-muted dark:text-gray-400'
            }`}
          >
            Todas
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`rounded-full px-3 py-1 text-xs font-medium border transition-colors ${
                activeCategory === cat
                  ? 'bg-brand-accent text-white border-brand-accent'
                  : 'border-brand-border dark:border-gray-700 text-brand-muted dark:text-gray-400'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <p className="mt-10 text-center text-sm text-brand-muted dark:text-gray-400">
            Nenhuma ferramenta encontrada para &quot;{query}&quot;.
          </p>
        ) : (
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filtered.map((tool) => (
              <Link
                key={tool.href}
                href={tool.href}
                className="group flex items-start gap-3 rounded-xl border border-brand-border dark:border-gray-800 bg-white dark:bg-gray-900 p-4
                           hover:border-brand-accent/50 hover:shadow-sm transition-all"
              >
                <span className="mt-0.5 text-brand-accent">{tool.icon}</span>
                <span className="flex-1 min-w-0">
                  <span className="flex items-center gap-2">
                    <span className="font-medium text-sm text-gray-900 dark:text-gray-100 group-hover:text-brand-accent transition-colors">
                      {tool.title}
                    </span>
                    {tool.isNew && (
                      <span className="rounded-full bg-brand-accent/10 px-1.5 py-0.5 text-[10px] font-semibold text-brand-accent">
                        NOVO
                      </span>
                    )}
                  </span>
                  <span className="block mt-0.5 text-xs text-brand-muted dark:text-gray-400 line-clamp-2">
                    {tool.description}
                  </span>
                  <span className="block mt-2">
                    <CategoryBadge category={tool.category} />
                  </span>
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
