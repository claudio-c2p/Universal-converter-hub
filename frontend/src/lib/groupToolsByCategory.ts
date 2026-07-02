import type { Tool } from '@/lib/tools';

export interface MegaMenuColumn {
  heading: string;
  items: { title: string; description: string; href: string; icon: React.ReactNode }[];
}

export function groupToolsByCategory(tools: Tool[], categories: string[]): MegaMenuColumn[] {
  return categories
    .map((cat) => ({
      heading: cat,
      items: tools
        .filter((t) => t.category === cat)
        .map((t) => ({ title: t.title, description: t.description, href: t.href, icon: t.icon })),
    }))
    .filter((col) => col.items.length > 0);
}
