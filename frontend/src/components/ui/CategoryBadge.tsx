const CATEGORY_COLORS: Record<string, string> = {
  PDF:        'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400',
  Office:     'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400',
  Dados:      'bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400',
  Documento:  'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400',
  Geo:        'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400',
  Mídia:      'bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400',
  Fonte:      'bg-pink-50 text-pink-700 dark:bg-pink-900/20 dark:text-pink-400',
  Utilitário: 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400',
  Dev:        'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  eBook:      'bg-teal-50 text-teal-700 dark:bg-teal-900/20 dark:text-teal-400',
  'Banco de Dados': 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-400',
  OCR:        'bg-cyan-50 text-cyan-700 dark:bg-cyan-900/20 dark:text-cyan-400',
  IA:         'bg-violet-50 text-violet-700 dark:bg-violet-900/20 dark:text-violet-400',
  Config:     'bg-slate-50 text-slate-700 dark:bg-slate-900/20 dark:text-slate-400',
  Imagem:     'bg-fuchsia-50 text-fuchsia-700 dark:bg-fuchsia-900/20 dark:text-fuchsia-400',
  'Áudio e Vídeo': 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400',
  Texto:      'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400',
};

export default function CategoryBadge({ category, className = '' }: { category: string; className?: string }) {
  const colorClass = CATEGORY_COLORS[category] ?? CATEGORY_COLORS['Dev'];
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium ${colorClass} ${className}`}>
      {category}
    </span>
  );
}
