'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

interface MenuItem {
  label: string;
  icon: React.ReactNode;
  href?: string;
  onClick?: () => void;
}

function Icon({ d }: { d: string }) {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d={d} />
    </svg>
  );
}

export default function MoreMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onEsc(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', onClickOutside);
    document.addEventListener('keydown', onEsc);
    return () => {
      document.removeEventListener('mousedown', onClickOutside);
      document.removeEventListener('keydown', onEsc);
    };
  }, []);

  const items: MenuItem[] = [
    {
      label: 'Sobre o C2P',
      icon: <Icon d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />,
      href: '/sobre',
    },
    {
      label: 'Documentação da API',
      icon: <Icon d="M10 20l4-16M6 16l-4-4 4-4M18 8l4 4-4 4" />,
      href: '/tools/api-docs',
    },
    {
      label: 'Status do sistema',
      icon: <Icon d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />,
      href: '/status',
    },
    {
      label: 'Privacidade e segurança',
      icon: <Icon d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 10-8 0v4h8z" />,
      href: '/privacidade',
    },
    {
      label: 'Enviar feedback',
      icon: <Icon d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-6l-4 4v-4z" />,
      href: 'mailto:contato@c2p.app?subject=Feedback%20C2P',
    },
    {
      label: 'Copiar link da página',
      icon: <Icon d="M13.828 10.172a4 4 0 010 5.656l-3 3a4 4 0 01-5.656-5.656l1.5-1.5M10.172 13.828a4 4 0 010-5.656l3-3a4 4 0 015.656 5.656l-1.5 1.5" />,
      onClick: () => {
        navigator.clipboard?.writeText(window.location.href);
      },
    },
  ];

  return (
    <div className="relative" ref={ref}>
      <button
        aria-label="Mais opções"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={`hidden md:flex w-8 h-8 items-center justify-center rounded-lg transition-colors
          ${open ? 'text-brand-accent bg-[var(--bg-input)]' : 'text-[var(--text-secondary)] hover:text-brand-accent'}`}
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <circle cx="5" cy="12" r="1.6" /><circle cx="12" cy="12" r="1.6" /><circle cx="19" cy="12" r="1.6" />
        </svg>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full mt-2 w-56 py-1.5 rounded-xl border border-[var(--border-color)]
                     bg-[var(--bg-card)] shadow-xl shadow-black/10 z-50 overflow-hidden"
        >
          {items.map((item) => {
            const isInternal = item.href?.startsWith('/');
            const content = (
              <>
                <span className="text-[var(--text-secondary)]">{item.icon}</span>
                {item.label}
              </>
            );
            const className =
              'flex items-center gap-2.5 px-3.5 py-2 text-sm text-left text-[var(--text-primary)] w-full ' +
              'hover:bg-[var(--bg-input)] hover:text-brand-accent transition-colors';

            if (isInternal) {
              return (
                <Link key={item.label} href={item.href!} role="menuitem" onClick={() => setOpen(false)} className={className}>
                  {content}
                </Link>
              );
            }
            if (item.href) {
              return (
                <a key={item.label} href={item.href} role="menuitem" onClick={() => setOpen(false)} className={className}>
                  {content}
                </a>
              );
            }
            return (
              <button
                key={item.label}
                role="menuitem"
                onClick={() => {
                  item.onClick?.();
                  setOpen(false);
                }}
                className={className}
              >
                {content}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
