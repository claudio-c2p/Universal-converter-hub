'use client';
import { useState } from 'react';

interface ResultActionsProps {
  fileId: string;
  fileName: string;
  downloadUrl: string;
}

export default function ResultActions({ fileId, fileName, downloadUrl }: ResultActionsProps) {
  const [emailOpen, setEmailOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  async function sendEmail(captchaToken: string) {
    setSending(true);
    setFeedback(null);
    try {
      const res = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileId, to: email, captchaToken }),
      });
      const data = await res.json();
      setFeedback(data.success ? 'E-mail enviado.' : data.error);
      if (data.success) setEmailOpen(false);
    } catch {
      setFeedback('Falha ao enviar. Tente novamente.');
    } finally {
      setSending(false);
    }
  }

  const whatsappHref = `https://wa.me/?text=${encodeURIComponent(
    `Convertido no C2P: ${fileName} — ${downloadUrl}`,
  )}`;

  return (
    <div className="flex flex-wrap gap-2">
      <a
        href={downloadUrl}
        download={fileName}
        className="rounded-md bg-[var(--brand-accent,#E84E1B)] px-4 py-2 text-sm font-medium text-white"
      >
        Baixar
      </a>
      <button
        onClick={() => setEmailOpen(true)}
        className="rounded-md border border-[var(--border-color)] px-4 py-2 text-sm"
      >
        Enviar por e-mail
      </button>
      <a
        href={whatsappHref}
        target="_blank"
        rel="noopener noreferrer"
        className="rounded-md border border-[var(--border-color)] px-4 py-2 text-sm"
      >
        Compartilhar no WhatsApp
      </a>

      {emailOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="w-full max-w-sm rounded-lg bg-[var(--bg-header)] p-4">
            <h3 className="mb-2 text-sm font-semibold">Enviar por e-mail</h3>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              className="mb-2 w-full rounded-md border border-[var(--border-color)] px-3 py-2 text-sm"
            />
            {/* Renderizar widget hCaptcha aqui e obter captchaToken antes de chamar sendEmail */}
            {feedback && <p className="mb-2 text-xs text-[var(--text-secondary)]">{feedback}</p>}
            <div className="flex justify-end gap-2">
              <button onClick={() => setEmailOpen(false)} className="px-3 py-1.5 text-sm">
                Cancelar
              </button>
              <button
                disabled={sending || !email}
                onClick={() => sendEmail('TOKEN_DO_HCAPTCHA')}
                className="rounded-md bg-[var(--brand-accent,#E84E1B)] px-3 py-1.5 text-sm text-white disabled:opacity-50"
              >
                {sending ? 'Enviando…' : 'Enviar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
