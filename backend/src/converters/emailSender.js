// Exemplo usando Resend (camada gratuita) — trocar por nodemailer+SMTP se
// EMAIL_PROVIDER_API_KEY não estiver setado e SMTP_HOST estiver.
export async function sendResultEmail({ to, filePath, fileName }) {
  const apiKey = process.env.EMAIL_PROVIDER_API_KEY;
  if (!apiKey) throw new Error('Provedor de e-mail não configurado.');

  const fs = await import('node:fs/promises');
  const stat = await fs.stat(filePath);
  const under10MB = stat.size < 10 * 1024 * 1024;

  const payload = {
    from: 'C2P <no-reply@c2p.example.com>',
    to: [to],
    subject: 'Seu arquivo convertido no C2P',
    text: under10MB
      ? 'Segue em anexo o arquivo convertido.'
      : 'Seu arquivo é grande — baixe pelo link (válido por 24h) em vez de anexo.',
  };

  if (under10MB) {
    const content = await fs.readFile(filePath, { encoding: 'base64' });
    payload.attachments = [{ filename: fileName, content }];
  } else {
    payload.text += `\n\n${process.env.PUBLIC_BASE_URL}/api/files/temp/${fileName}`;
  }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Falha ao enviar e-mail.');
}
