import express from 'express';
import path from 'node:path';
import { sendResultEmail } from '../converters/emailSender.js';
import { sanitizeFilename } from '../utils/fileUtils.js';

const router = express.Router();

async function verifyCaptcha(token) {
  const secret = process.env.HCAPTCHA_SECRET;
  if (!secret) return false;
  const res = await fetch('https://hcaptcha.com/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `secret=${secret}&response=${token}`,
  });
  const data = await res.json();
  return data.success === true;
}

router.post('/send-email', async (req, res) => {
  try {
    const { fileId, to, captchaToken } = req.body;
    if (!fileId || !to || !captchaToken) {
      return res.status(400).json({ success: false, error: 'Campos obrigatórios ausentes.' });
    }
    const captchaOk = await verifyCaptcha(captchaToken);
    if (!captchaOk) return res.status(422).json({ success: false, error: 'Captcha inválido.' });

    // fileId referencia um arquivo já salvo em TMP_DIR por saveTempFile — nunca aceitar
    // caminho arbitrário do cliente; sempre montar o path no servidor a partir de um
    // nome sanitizado e restrito ao prefixo "c2p_".
    const safeName = sanitizeFilename(fileId);
    if (!safeName.startsWith('c2p_')) {
      return res.status(400).json({ success: false, error: 'Identificador de arquivo inválido.' });
    }
    const tmpDir = process.env.TMP_DIR ?? '/tmp';
    const filePath = path.join(tmpDir, safeName);
    await sendResultEmail({ to, filePath, fileName: safeName });

    res.json({ success: true, message: 'E-mail enviado.' });
  } catch (err) {
    res.status(422).json({ success: false, error: err.message });
  }
});

export default router;
