'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import ThemeToggle from './ThemeToggle';
import MoreMenu from './MoreMenu';
import MegaMenu from './MegaMenu';
import MobileMenu from './MobileMenu';
import HistoryPanel from './HistoryPanel';
import { groupToolsByCategory } from '@/lib/groupToolsByCategory';
import type { Tool } from '@/lib/tools';

interface HeaderProps {
  query: string;
  onQueryChange: (value: string) => void;
  tools: Tool[];
}

export default function Header({ query, onQueryChange, tools }: HeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchRef.current?.focus();
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const pdfCols = groupToolsByCategory(tools, ['PDF']);
  const docCols = groupToolsByCategory(tools, ['Office', 'Documento', 'eBook']);
  const mediaCols = groupToolsByCategory(tools, ['Imagem', 'Áudio e Vídeo', 'Mídia']);
  const devCols = groupToolsByCategory(tools, ['Dados', 'Dev', 'Config', 'Banco de Dados', 'Geo', 'Fonte']);
  const textCols = groupToolsByCategory(tools, ['Texto', 'Utilitário']);

  return (
    <header className="sticky top-0 z-40 h-16 border-b border-[var(--border-color)] bg-[var(--bg-header)]/90 backdrop-blur">
      <div className="mx-auto flex h-full max-w-7xl items-center gap-4 px-4">
        <Link href="/" aria-label="C2P — página inicial" className="flex items-center gap-2 shrink-0">
          <Image src="/c2p_logo_light.webp" alt="C2P" width={120} height={46}
            className="block dark:hidden" style={{ objectFit: 'contain', height: '40px', width: 'auto' }} priority />
          <Image src="/c2p_logo_dark.webp" alt="C2P" width={120} height={46}
            className="hidden dark:block" style={{ objectFit: 'contain', height: '40px', width: 'auto' }} priority />
          <span className="hidden md:inline text-xs font-medium text-[var(--text-secondary)] self-end mb-1">
            Universal converter hub
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-1" role="menubar">
          <MegaMenu label="PDF" columns={pdfCols} />
          <MegaMenu label="Documentos" columns={docCols} />
          <MegaMenu label="Imagem & Mídia" columns={mediaCols} />
          <MegaMenu label="Dados & Dev" columns={devCols} />
          <MegaMenu label="Texto & Utilidades" columns={textCols} />
          <Link href="/ferramentas" className="px-3 py-2 text-sm font-medium">Todas as ferramentas</Link>
          <Link href="/cadeia" className="px-3 py-2 text-sm font-medium flex items-center gap-1.5">
            Converter em cadeia
            <span className="rounded-full bg-[var(--brand-accent,#E84E1B)] px-1.5 py-0.5 text-[10px] font-bold text-white">novo</span>
          </Link>
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <input
            ref={searchRef}
            type="search"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Buscar ferramenta…  (Ctrl+K)"
            className="hidden sm:block w-56 rounded-md border border-[var(--border-color)] bg-transparent px-3 py-1.5 text-sm"
          />
          <button aria-label="Histórico" onClick={() => setHistoryOpen(true)} className="p-2">
            {/* ícone de relógio */}
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <circle cx="12" cy="12" r="9" strokeWidth="2" />
              <path d="M12 7v5l3 3" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
          <ThemeToggle />
          <MoreMenu />
          <button
            aria-label="Abrir menu"
            className="md:hidden p-2"
            onClick={() => setMobileOpen((v) => !v)}
          >
            ☰
          </button>
        </div>
      </div>

      {mobileOpen && (
        <MobileMenu
          tools={tools}
          onClose={() => setMobileOpen(false)}
        />
      )}
      <HistoryPanel open={historyOpen} onClose={() => setHistoryOpen(false)} />
    </header>
  );
}
