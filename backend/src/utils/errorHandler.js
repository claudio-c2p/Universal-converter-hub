/**
 * Detecta padrões comuns de erro vindos de processos externos (spawn de
 * binários como LibreOffice, Calibre, Ghostscript etc.) e devolve uma
 * mensagem amigável em português. Se nenhum padrão bater, devolve null
 * (quem chamar decide o fallback).
 */
const EXTERNAL_ERROR_PATTERNS = [
  { test: /ENOENT/i, message: 'Ferramenta externa necessária para essa conversão não está disponível no servidor no momento. Tente novamente mais tarde ou contate o suporte.' },
  { test: /ETIMEDOUT|timed?\s?out/i, message: 'A conversão demorou demais e foi interrompida. Tente novamente com um arquivo menor.' },
  { test: /command not found|not recognized as an internal/i, message: 'Ferramenta externa necessária para essa conversão não está instalada no servidor.' },
  { test: /EACCES|permission denied/i, message: 'O servidor não teve permissão para processar esse arquivo. Tente novamente ou contate o suporte.' },
  { test: /ENOSPC|no space left/i, message: 'Não há espaço suficiente no servidor para concluir essa conversão. Tente novamente mais tarde.' },
  { test: /ENOMEM/i, message: 'O arquivo é grande demais para ser processado no momento. Tente um arquivo menor.' },
];

export function translateExternalError(rawMessage) {
  if (!rawMessage) return null;
  const match = EXTERNAL_ERROR_PATTERNS.find((p) => p.test.test(rawMessage));
  return match ? match.message : null;
}

/**
 * Handler global de erros do Express.
 * Ordem de verificação:
 *  1. Erros do multer (LIMIT_FILE_SIZE, LIMIT_UNEXPECTED_FILE)
 *  2. Erros marcados como validação (isValidation / status 400)
 *  3. Erros genéricos com mensagem (ex: fileFilter rejeita extensão)
 *  4. Fallback 500 para erros sem mensagem
 */
export function globalErrorHandler(err, _req, res, _next) {
  // 1. Erros do multer com código known
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ error: 'Arquivo muito grande. Verifique o limite desta ferramenta.' });
  }
  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(400).json({ error: 'Campo de arquivo inesperado na requisição.' });
  }
  if (err.code === 'LIMIT_FILE_COUNT') {
    return res.status(400).json({ error: 'Número máximo de arquivos excedido.' });
  }

  // 2. Erros marcados explicitamente como validação
  if (err.isValidation || err.status === 400) {
    return res.status(400).json({ error: err.message });
  }

  // 3. Erros com mensagem (fileFilter, erros não tratados em rotas)
  if (err instanceof Error && err.message) {
    // Mensagens cruas de processos externos (ENOENT, timeout etc.) viram
    // texto amigável em português; o erro técnico original continua só no log.
    const translated = translateExternalError(err.message);
    if (translated) {
      console.error('[globalErrorHandler] Erro técnico (traduzido para usuário):', err.message);
      return res.status(502).json({ error: translated });
    }

    // Determina se parece um erro de validação/usuário (não loga como warn se for 4xx)
    const isUserError = /não (é|suportado|permitido|válido|aceito|encontrado)|inválid|empty|vazio|ausente|obrigatório/i
      .test(err.message);
    if (isUserError) {
      return res.status(400).json({ error: err.message });
    }
    console.warn('[globalErrorHandler] Erro não tratado (400):', err.message);
    return res.status(400).json({ error: err.message });
  }

  // 4. Fallback genuíno para erros inesperados
  console.error('[globalErrorHandler] Erro inesperado:', err);
  res.status(500).json({ error: 'Erro interno do servidor. Tente novamente.' });
}

/**
 * Cria um erro marcado como validação (400) para uso em middlewares e rotas.
 */
export function validationError(message) {
  const err = new Error(message);
  err.isValidation = true;
  err.status       = 400;
  return err;
}
