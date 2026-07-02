'use client';
import { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import ConverterCard from '@/components/ui/ConverterCard';
import AmbientEffects from '@/components/ui/AmbientEffects';
import Header from '@/components/ui/Header';
import { TOOLS } from '@/lib/tools';


const CATEGORY_ORDER = [
  'PDF', 'Office', 'Dados', 'Documento', 'eBook', 'Banco de Dados',
  'Geo', 'Mídia', 'Config', 'Dev', 'Fonte', 'Utilitário',
  'Imagem', 'Áudio e Vídeo', 'Texto', // ← acrescentadas ao final, ordem não muda as existentes
];

const CATEGORY_META: Record<string, { icon: string; color: string }> = {
  PDF:              { icon: 'M9 12h6m-6 4h3m6-13H6a2 2 0 00-2 2v14a2 2 0 002 2h12a2 2 0 002-2V8l-5-5z', color: 'text-red-500' },
  Office:           { icon: 'M3 7a2 2 0 012-2h3l2-2h4l2 2h3a2 2 0 012 2v12a2 2 0 01-2 2H5a2 2 0 01-2-2V7z', color: 'text-blue-500' },
  Dados:            { icon: 'M4 7c0-1.66 3.58-3 8-3s8 1.34 8 3-3.58 3-8 3-8-1.34-8-3zm0 0v10c0 1.66 3.58 3 8 3s8-1.34 8-3V7M4 12c0 1.66 3.58 3 8 3s8-1.34 8-3', color: 'text-purple-500' },
  Documento:        { icon: 'M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z', color: 'text-blue-500' },
  eBook:            { icon: 'M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25', color: 'text-teal-500' },
  'Banco de Dados': { icon: 'M4 7c0-1.657 3.582-3 8-3s8 1.343 8 3-3.582 3-8 3-8-1.343-8-3zm0 0v10c0 1.657 3.582 3 8 3s8-1.343 8-3V7m-16 5c0 1.657 3.582 3 8 3s8-1.343 8-3', color: 'text-indigo-500' },
  Geo:              { icon: 'M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7', color: 'text-green-500' },
  Mídia:            { icon: 'M7 8h10M7 12h6m-6 4h10M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z', color: 'text-orange-500' },
  Config:           { icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z', color: 'text-slate-500' },
  Dev:              { icon: 'M10 20l4-16M6 16l-4-4 4-4M18 8l4 4-4 4', color: 'text-gray-500' },
  Fonte:            { icon: 'M4 7V4h16v3M9 20h6M12 4v16', color: 'text-pink-500' },
  Utilitário:       { icon: 'M11 4a7 7 0 00-7 7c0 1.36.39 2.62 1.06 3.69L4 19l4.31-1.06A6.96 6.96 0 0011 18a7 7 0 100-14z', color: 'text-yellow-500' },
  // categoria nova — câmera
  Imagem:           { icon: 'M4 7h3l1.5-2h7L17 7h3a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1z M12 10a4 4 0 1 0 0 8 4 4 0 0 0 0-8z', color: 'text-cyan-500' },
  // categoria nova — play + ondas
  'Áudio e Vídeo':  { icon: 'M9 6v12l9-6-9-6z M3 10c1.2 1.2 1.2 3.8 0 5 M21 10c-1.2 1.2-1.2 3.8 0 5', color: 'text-rose-500' },
  // categoria nova — cursor de texto
  Texto:            { icon: 'M8 4h8 M12 4v16 M9 20h6', color: 'text-lime-600' },
};
const ALL_META = { icon: 'M4 6h16M4 6a2 2 0 012-2h2a2 2 0 012 2m-6 0a2 2 0 002 2h2a2 2 0 002-2m6 0a2 2 0 00-2-2h-2a2 2 0 00-2 2m6 0a2 2 0 002 2h2a2 2 0 002-2M4 18h16M4 18a2 2 0 002 2h2a2 2 0 002-2m-6 0a2 2 0 012-2h2a2 2 0 012 2m6 0a2 2 0 01-2-2h-2a2 2 0 01-2 2m6 0a2 2 0 002-2h2a2 2 0 002 2' };

const STOP_WORDS = new Set(['para', 'pra', 'pro', 'to', 'de', 'do', 'da', 'em', 'no', 'na', 'o', 'a', 'e', '2']);

function normalizeSearch(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove acentos
    .toLowerCase()
    .replace(/[→\-_/]/g, ' ') // seta e separadores de slug contam como espaço
    .replace(/\s+/g, ' ')
    .trim();
}

export default function HomePage() {
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  useEffect(() => {
    const fromUrl = new URLSearchParams(window.location.search).get('category');
    if (fromUrl && CATEGORY_ORDER.includes(fromUrl)) setActiveCategory(fromUrl);
  }, []);

  const filtered = useMemo(() => {
    const tokens = normalizeSearch(query)
      .split(' ')
      .filter((w) => w && !STOP_WORDS.has(w));

    return TOOLS.filter((t) => {
      const corpus = normalizeSearch(`${t.title} ${t.description} ${t.category} ${t.href}`);
      const matchesSearch = tokens.length === 0 || tokens.every((tok) => corpus.includes(tok));
      const matchesCategory = !activeCategory || t.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [query, activeCategory]);

  const byCategory = useMemo(() =>
    CATEGORY_ORDER
      .map((cat) => ({ category: cat, tools: filtered.filter((t) => t.category === cat) }))
      .filter((g) => g.tools.length > 0),
    [filtered]
  );

  const categories = CATEGORY_ORDER.filter((c) => TOOLS.some((t) => t.category === c));

  return (
    <div className="relative min-h-screen flex flex-col bg-[var(--bg-page)]">
      <AmbientEffects />
      <Header query={query} onQueryChange={setQuery} tools={TOOLS} />

      <main className="relative z-10 flex-1 w-full max-w-6xl mx-auto px-4 py-10 md:py-14">
        <div className="hero-glow" aria-hidden="true" />
        {/* Badge */}
        <div className="flex justify-center mb-6">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium
                           text-brand-accent border border-brand-accent/40 bg-brand-accent/10">
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M13 2L4.5 14h6l-1.5 8L19 10h-6l1.5-8z" />
            </svg>
            100% gratuito, sem anúncios, sem cadastro — só escolher e converter.
          </span>
        </div>

        {/* Hero */}
        <div className="mb-8 text-center">
          <h1 className="text-2xl md:text-3xl font-bold text-[var(--text-primary)] mb-2">
            Conversões que você não encontra em <span className="text-brand-accent">outro lugar</span>
          </h1>
          <p className="text-sm md:text-base text-[var(--text-secondary)] max-w-2xl mx-auto">
            {TOOLS.length} ferramentas — PDF, Word, dados, geo, dev e muito mais.
          </p>
        </div>

        {/* Busca mobile */}
        <div className="sm:hidden mb-6 flex items-center gap-2 px-3 h-10 rounded-xl border border-[var(--border-color)]
                        bg-[var(--bg-input)] focus-within:border-brand-accent transition-colors">
          <svg className="w-4 h-4 text-[var(--text-secondary)] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" />
          </svg>
          <input
            type="search"
            placeholder="Buscar ferramenta…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 text-sm bg-transparent text-[var(--text-primary)] outline-none placeholder:text-[var(--text-secondary)]"
          />
        </div>

        {/* Filtros de categoria */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          <button
            onClick={() => setActiveCategory(null)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold transition-all
              ${!activeCategory
                ? 'bg-brand-accent text-white shadow-sm'
                : 'bg-[var(--bg-pill)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:border-brand-accent'
              }`}
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d={ALL_META.icon} />
            </svg>
            Todas {TOOLS.length}
          </button>
          {categories.map((cat) => {
            const count = TOOLS.filter((t) => t.category === cat).length;
            const meta = CATEGORY_META[cat];
            const isActive = activeCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(isActive ? null : cat)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold transition-all
                  ${isActive
                    ? 'bg-brand-accent text-white shadow-sm'
                    : 'bg-[var(--bg-pill)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:border-brand-accent'
                  }`}
              >
                {meta && (
                  <svg className={`w-3.5 h-3.5 ${isActive ? 'text-white' : meta.color}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d={meta.icon} />
                  </svg>
                )}
                {cat} {count}
              </button>
            );
          })}
        </div>

        {/* Resultados */}
        {byCategory.length === 0 ? (
          <div className="text-center py-16 text-[var(--text-secondary)]">
            <svg className="w-12 h-12 mx-auto mb-3 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" />
            </svg>
            <p className="text-sm">Nenhuma ferramenta encontrada para <strong>&quot;{query}&quot;</strong></p>
            <button onClick={() => { setQuery(''); setActiveCategory(null); }}
              className="mt-3 text-xs text-brand-accent hover:underline">
              Limpar filtros
            </button>
          </div>
        ) : (
          byCategory.map(({ category, tools }) => (
            <section key={category} className="mb-10">
              <h2 className="flex items-center gap-2 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wide mb-3">
                <span className={`w-1 h-4 rounded-full ${CATEGORY_META[category]?.color.replace('text-', 'bg-') ?? 'bg-brand-accent'}`} />
                {category}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {tools.map((tool) => (
                  <ConverterCard
                    key={tool.href}
                    title={tool.title}
                    description={tool.description}
                    href={tool.href}
                    category={tool.category}
                    icon={tool.icon}
                    isNew={tool.isNew}
                  />
                ))}
              </div>
            </section>
          ))
        )}
      </main>

      <footer className="relative z-10 py-4 px-8 border-t border-[var(--border-color)] flex items-center justify-center gap-2">
        <Image src="/c2p_logo_light.webp" alt="C2P" width={75} height={30}
          className="block dark:hidden" style={{ objectFit: 'contain', height: '30px', width: 'auto', opacity: 0.7 }} />
        <Image src="/c2p_logo_dark.webp" alt="C2P" width={75} height={30}
          className="hidden dark:block" style={{ objectFit: 'contain', height: '30px', width: 'auto', opacity: 0.7 }} />
        <span className="text-xs text-[var(--text-secondary)]">Um produto C2P · {TOOLS.length} ferramentas disponíveis</span>
      </footer>
    </div>
  );
}
