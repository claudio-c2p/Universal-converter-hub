import Link from 'next/link';

export const metadata = { title: 'Privacidade e segurança — C2P' };

export default function PrivacidadePage() {
  return (
    <div className="min-h-screen bg-[var(--bg-page)]">
      <main className="max-w-2xl mx-auto px-4 py-14">
        <Link href="/" className="text-xs text-brand-accent hover:underline">← Voltar</Link>
        <h1 className="text-2xl font-bold text-[var(--text-primary)] mt-4 mb-4">Privacidade e segurança</h1>
        <ul className="space-y-3 text-sm text-[var(--text-secondary)] leading-relaxed list-disc pl-5">
          <li>Seus arquivos são usados apenas para realizar a conversão solicitada.</li>
          <li>Todo arquivo enviado é excluído automaticamente do servidor em até 15 minutos.</li>
          <li>Não vendemos nem compartilhamos arquivos ou dados pessoais com terceiros.</li>
          <li>Não exigimos cadastro ou login para usar as ferramentas.</li>
        </ul>
      </main>
    </div>
  );
}
