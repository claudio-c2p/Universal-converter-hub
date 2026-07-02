'use client';
import { useMemo, useState } from 'react';
import ToolLayout from '@/components/ui/ToolLayout';

function base64UrlDecode(input: string) {
  const padded = input.replace(/-/g, '+').replace(/_/g, '/').padEnd(input.length + ((4 - (input.length % 4)) % 4), '=');
  return decodeURIComponent(
    atob(padded)
      .split('')
      .map((c) => '%' + c.charCodeAt(0).toString(16).padStart(2, '0'))
      .join(''),
  );
}

export default function JwtDecoderPage() {
  const [token, setToken] = useState('');

  const parsed = useMemo(() => {
    const parts = token.trim().split('.');
    if (parts.length < 2) return null;
    try {
      const header = JSON.parse(base64UrlDecode(parts[0]));
      const payload = JSON.parse(base64UrlDecode(parts[1]));
      return { header, payload };
    } catch {
      return { error: 'Token inválido ou mal formado.' };
    }
  }, [token]);

  return (
    <ToolLayout title="Decodificador de JWT" description="Leia o header e o payload de um token JWT (não valida assinatura)." category="Texto">
      <textarea
        value={token}
        onChange={(e) => setToken(e.target.value)}
        placeholder="Cole o token JWT aqui (eyJhbGci...)"
        rows={4}
        className="w-full rounded-md border border-brand-border dark:border-gray-700 bg-transparent p-3 text-sm font-mono"
      />
      <p className="mt-2 text-xs text-brand-muted dark:text-gray-500">
        Isto é apenas uma leitura local do conteúdo — a assinatura não é verificada.
      </p>
      {parsed && 'error' in parsed && <p className="mt-3 text-sm text-red-500">{parsed.error}</p>}
      {parsed && !('error' in parsed) && (
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <p className="mb-1 text-xs text-brand-muted dark:text-gray-400">Header</p>
            <pre className="rounded-md border border-brand-border dark:border-gray-700 bg-black/5 dark:bg-white/5 p-3 text-xs overflow-auto">
{JSON.stringify(parsed.header, null, 2)}
            </pre>
          </div>
          <div>
            <p className="mb-1 text-xs text-brand-muted dark:text-gray-400">Payload</p>
            <pre className="rounded-md border border-brand-border dark:border-gray-700 bg-black/5 dark:bg-white/5 p-3 text-xs overflow-auto">
{JSON.stringify(parsed.payload, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </ToolLayout>
  );
}
