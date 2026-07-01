import Link from 'next/link';

export const metadata = { title: 'Sobre — C2P' };

export default function SobrePage() {
  return (
    <div className="min-h-screen bg-[var(--bg-page)]">
      <main className="max-w-2xl mx-auto px-4 py-14">
        <Link href="/" className="text-xs text-brand-accent hover:underline">← Voltar</Link>
        <h1 className="text-2xl font-bold text-[var(--text-primary)] mt-4 mb-4">Sobre o C2P</h1>
        <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-4">
          O C2P (Universal Converter Hub) é um conjunto de ferramentas gratuitas de conversão
          de arquivos — PDF, Office, dados, eBooks, geo, mídia e mais — pensado para resolver
          conversões do dia a dia sem anúncios, sem cadastro e sem letras miúdas.
        </p>
        <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
          Os arquivos enviados são processados e excluídos automaticamente do servidor em
          até 15 minutos.
        </p>
      </main>
    </div>
  );
}
