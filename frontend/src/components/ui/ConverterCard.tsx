import Link from 'next/link';
import CategoryBadge from './CategoryBadge';
import { getToolColor } from '@/lib/toolColors';

interface ConverterCardProps {
  title: string;
  description: string;
  href: string;
  category: string;
  icon: React.ReactNode;
  isNew?: boolean;
  className?: string;
}

export default function ConverterCard({
  title, description, href, category, icon, isNew = false, className = '',
}: ConverterCardProps) {
  const color = getToolColor(title, category);
  return (
    <Link href={href} className={`
      group relative flex flex-col gap-3 p-5 rounded-xl
      border border-[var(--border-color)] bg-[var(--bg-card)]
      hover:border-brand-accent hover:shadow-lg hover:shadow-brand-accent/10
      transition-all duration-200 ${className}
    `}>
      {isNew && (
        <span className="absolute top-3 right-3 bg-brand-accent text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest">
          Novo
        </span>
      )}
      <div className={`w-10 h-10 rounded-[11px] ${color.box} ${color.text}
                      flex items-center justify-center
                      transition-transform duration-200 group-hover:scale-105 shrink-0`}>
        {icon}
      </div>
      <div>
        <h3 className="font-semibold text-[var(--text-primary)] text-sm leading-tight mb-1 group-hover:text-brand-accent transition-colors">
          {title}
        </h3>
        <p className="text-xs text-[var(--text-secondary)] line-clamp-2 leading-relaxed">{description}</p>
      </div>
      <CategoryBadge category={category} className="self-start mt-auto" />
    </Link>
  );
}
