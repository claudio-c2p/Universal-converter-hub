'use client';
import { useState } from 'react';
import Link from 'next/link';
import type { Tool } from '@/lib/tools';

const GROUPS: { label: string; categories: string[] }[] = [
  { label: 'PDF', categories: ['PDF'] },
  { label: 'Documentos', categories: ['Office', 'Documento', 'eBook'] },
  { label: 'Imagem & Mídia', categories: ['Imagem', 'Áudio e Vídeo', 'Mídia'] },
  { label: 'Dados & Dev', categories: ['Dados', 'Dev', 'Config', 'Banco de Dados', 'Geo', 'Fonte'] },
  { label: 'Texto & Utilidades', categories: ['Texto', 'Utilitário'] },
];

export default function MobileMenu({ tools, onClose }: { tools: Tool[]; onClose: () => void }) {
  const [openGroup, setOpenGroup] = useState<string | null>(null);

  return (
    <div className="fixed inset-0 top-16 z-30 overflow-y-auto bg-[var(--bg-header)] md:hidden">
      {GROUPS.map((g) => {
        const items = tools.filter((t) => g.categories.includes(t.category));
        if (items.length === 0) return null;
        const isOpen = openGroup === g.label;
        return (
          <div key={g.label} className="border-b border-[var(--border-color)]">
            <button
              className="flex w-full items-center justify-between px-4 py-3 text-left font-medium"
              onClick={() => setOpenGroup(isOpen ? null : g.label)}
            >
              {g.label}
              <span className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}>⌄</span>
            </button>
            <div
              className={`grid overflow-hidden transition-[grid-template-rows] duration-200 ${
                isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
              }`}
            >
              <ul className="min-h-0 px-4 pb-3">
                {items.map((t) => (
                  <li key={t.href}>
                    <Link href={t.href} onClick={onClose} className="block py-1.5 text-sm">
                      {t.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        );
      })}
      <Link href="/ferramentas" onClick={onClose} className="block px-4 py-3 font-medium">
        Todas as ferramentas
      </Link>
      <Link href="/cadeia" onClick={onClose} className="block px-4 py-3 font-medium">
        Converter em cadeia
      </Link>
    </div>
  );
}
