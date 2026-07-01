interface ToolIconProps {
  d: string;
  className?: string;
}

/**
 * Ícone SVG padrão usado no cabeçalho de cada página de ferramenta.
 * Recebe o mesmo "d" (path) usado no card correspondente da home,
 * garantindo que o ícone seja idêntico entre a listagem e a página da ferramenta.
 */
export default function ToolIcon({ d, className = 'w-5 h-5' }: ToolIconProps) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d={d} />
    </svg>
  );
}
