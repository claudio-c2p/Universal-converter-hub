import Link from 'next/link';
import Image from 'next/image';
import CategoryBadge from './CategoryBadge';
import ThemeToggle from './ThemeToggle';
import { getToolColor } from '@/lib/toolColors';

interface ToolLayoutProps {
  title: string;
  description: string;
  category: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export default function ToolLayout({
  title, description, category, icon, children, className = '',
}: ToolLayoutProps) {
  const color = getToolColor(title, category);
  return (
    <div className="min-h-screen flex flex-col bg-brand-surface dark:bg-gray-950">
      <header className="h-16 bg-white dark:bg-gray-900 border-b border-brand-border dark:border-gray-800
                         flex items-center px-4 md:px-8 gap-4 sticky top-0 z-50">
        <Link href="/" aria-label="Início" className="flex items-center shrink-0">
          <Image src="/c2p_logo_light.webp" alt="C2P" width={120} height={46}
            className="block dark:hidden" style={{ objectFit: 'contain', height: '46px', width: 'auto' }} priority />
          <Image src="/c2p_logo_dark.webp" alt="C2P" width={120} height={46}
            className="hidden dark:block" style={{ objectFit: 'contain', height: '46px', width: 'auto' }} priority />
        </Link>
        <div className="w-px h-5 bg-brand-border dark:bg-gray-700" />
        <span className="hidden md:block text-xs font-medium text-brand-muted dark:text-gray-400">
          Universal Converter Hub
        </span>
        <nav className="ml-auto flex items-center gap-3">
          <Link href="/" className="text-xs text-brand-muted hover:text-brand-accent dark:text-gray-400 transition-colors flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Ferramentas
          </Link>
          <ThemeToggle />
        </nav>
      </header>

      <main className="flex-1 w-full max-w-2xl mx-auto px-4 py-8 md:py-10">
        <div className="flex items-start gap-4 mb-6">
          {icon && (
            <div className={`w-11 h-11 rounded-xl ${color.box} flex items-center justify-center ${color.text} shrink-0`}>
              {icon}
            </div>
          )}
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">{title}</h1>
              <CategoryBadge category={category} />
            </div>
            <p className="text-sm text-brand-muted dark:text-gray-400">{description}</p>
          </div>
        </div>

        <div className={`bg-white dark:bg-gray-900 rounded-2xl border border-brand-border dark:border-gray-800 p-6 ${className}`}>
          {children}
        </div>

        <div className="mt-3 flex flex-col items-center gap-2 text-xs text-brand-muted dark:text-gray-500">
          <div className="flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 10-8 0v4h8z" />
            </svg>
            <span>Seus arquivos são excluídos automaticamente do servidor em até 15 minutos.</span>
          </div>
          <Link
            href={`/?category=${encodeURIComponent(category)}`}
            className="text-brand-accent hover:underline font-medium"
          >
            Ver outras ferramentas de {category} →
          </Link>
        </div>
      </main>

      <footer className="py-4 px-8 border-t border-brand-border dark:border-gray-800 flex items-center justify-center gap-2">
        <Image src="/c2p_logo_light.webp" alt="C2P" width={50} height={20}
          className="block dark:hidden" style={{ objectFit: 'contain', height: '20px', width: 'auto', opacity: 0.5 }} />
        <Image src="/c2p_logo_dark.webp" alt="C2P" width={50} height={20}
          className="hidden dark:block" style={{ objectFit: 'contain', height: '20px', width: 'auto', opacity: 0.5 }} />
        <span className="text-xs text-brand-muted">Um produto C2P</span>
      </footer>
    </div>
  );
}
