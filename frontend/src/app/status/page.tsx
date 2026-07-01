'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

interface BinaryStatus {
  key: string;
  label: string;
  available: boolean;
}

export default function StatusPage() {
  const [data, setData] = useState<BinaryStatus[] | null>(null);
  const [error, setError] = useState('');
  const [checkedAt, setCheckedAt] = useState('');
  const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? '';

  useEffect(() => {
    fetch(`${baseUrl}/api/health/binaries`)
      .then((res) => {
        if (!res.ok) throw new Error('Não foi possível consultar o status.');
        return res.json();
      })
      .then((json) => {
        setData(json.binaries);
        setCheckedAt(json.checkedAt);
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Erro desconhecido.'));
  }, [baseUrl]);

  return (
    <div className="min-h-screen bg-brand-surface dark:bg-gray-950 px-4 py-10">
      <div className="max-w-xl mx-auto">
        <Link href="/" className="text-sm text-brand-muted hover:text-brand-accent dark:text-gray-400 transition-colors">
          ← Voltar
        </Link>
        <h1 className="mt-4 text-2xl font-bold text-gray-900 dark:text-gray-100">Status do sistema</h1>
        <p className="mt-1 text-sm text-brand-muted dark:text-gray-400">
          Disponibilidade das ferramentas externas usadas em algumas conversões. Se algo aparecer
          como indisponível, as ferramentas dessa categoria podem falhar temporariamente.
        </p>

        {error && (
          <p role="alert" className="mt-6 text-sm text-red-600 dark:text-red-400">{error}</p>
        )}

        {!data && !error && (
          <p className="mt-6 text-sm text-brand-muted dark:text-gray-400">Consultando status…</p>
        )}

        {data && (
          <ul className="mt-6 divide-y divide-brand-border dark:divide-gray-800 rounded-xl border border-brand-border dark:border-gray-800 overflow-hidden">
            {data.map((bin) => (
              <li key={bin.key} className="flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-900">
                <span className="text-sm text-gray-800 dark:text-gray-200">{bin.label}</span>
                <span className={`flex items-center gap-2 text-xs font-medium ${bin.available ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  <span className={`w-2 h-2 rounded-full ${bin.available ? 'bg-green-500' : 'bg-red-500'}`} />
                  {bin.available ? 'Disponível' : 'Indisponível'}
                </span>
              </li>
            ))}
          </ul>
        )}

        {checkedAt && (
          <p className="mt-4 text-xs text-gray-400">Última checagem: {new Date(checkedAt).toLocaleString('pt-BR')}</p>
        )}
      </div>
    </div>
  );
}
