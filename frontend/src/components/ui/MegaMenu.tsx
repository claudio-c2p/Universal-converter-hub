'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import type { MegaMenuColumn } from '@/lib/groupToolsByCategory';

interface MegaMenuProps {
  label: string;
  columns: MegaMenuColumn[];
}

export default function MegaMenu({ label, columns }: MegaMenuProps) {
  const [open, setOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  const openMenu = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setOpen(true), 150);
  };
  const closeMenu = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpen(false);
  };

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    function onClickOutside(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('keydown', onKey);
    document.addEventListener('click', onClickOutside);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('click', onClickOutside);
    };
  }, []);

  if (columns.length === 0) return null;

  return (
    <div ref={rootRef} className="relative" onMouseEnter={openMenu} onMouseLeave={closeMenu}>
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((v) => !v)}
        className="px-3 py-2 text-sm font-medium text-[var(--text-primary)] hover:text-[var(--brand-accent,#E84E1B)]"
      >
        {label}
      </button>
      {open && (
        <div
          role="menu"
          className="absolute left-0 top-full z-50 mt-2 grid gap-6 rounded-xl border border-[var(--border-color)] bg-[var(--bg-header)] p-6 shadow-xl"
          style={{ gridTemplateColumns: `repeat(${columns.length}, minmax(180px, 1fr))` }}
        >
          {columns.map((col) => (
            <div key={col.heading}>
              <p className="mb-2 text-xs font-semibold uppercase text-[var(--text-secondary)]">
                {col.heading}
              </p>
              <ul className="space-y-1">
                {col.items.map((item) => (
                  <li key={item.href}>
                    <Link
                      role="menuitem"
                      href={item.href}
                      className="block rounded-md px-2 py-1.5 text-sm hover:bg-[var(--brand-accentLight,#FFF0EC)]"
                      onClick={() => setOpen(false)}
                    >
                      {item.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
