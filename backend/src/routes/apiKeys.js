import express from 'express';
import crypto from 'crypto';

const router = express.Router();

// LIMITAÇÃO CONHECIDA: chaves ficam em memória (Map), não em banco de dados —
// o projeto não tem persistência ainda. Isso significa que todas as chaves são
// invalidadas a cada deploy/reinício do processo. Foi o motivo do adiamento
// original (conflito entre "shippar rápido com algo simples" vs "fazer certo
// com uma tabela no banco"). Revisar antes de expor isso como feature paga —
// por ora serve para diferenciar clientes na documentação da API (/tools/api-docs).
const keys = new Map(); // id -> { hash, label, createdAt, lastUsedAt }

const SALT = process.env.API_KEY_SALT || 'dev-only-insecure-salt';

function hashKey(rawKey) {
  return crypto.createHmac('sha256', SALT).update(rawKey).digest('hex');
}

function generateRawKey() {
  return `c2p_${crypto.randomBytes(24).toString('hex')}`;
}

router.post('/', express.json(), (req, res) => {
  const label = (req.body?.label || 'sem nome').toString().slice(0, 80);
  const rawKey = generateRawKey();
  const id = crypto.randomBytes(8).toString('hex');
  keys.set(id, { hash: hashKey(rawKey), label, createdAt: Date.now(), lastUsedAt: null });
  // A chave completa só é retornada nesta resposta — depois disso, só o prefixo fica visível.
  res.status(201).json({ id, key: rawKey, label, prefix: rawKey.slice(0, 10) });
});

router.get('/', (_req, res) => {
  const list = [...keys.entries()].map(([id, k]) => ({
    id, label: k.label, createdAt: k.createdAt, lastUsedAt: k.lastUsedAt,
  }));
  res.json({ keys: list });
});

router.delete('/:id', (req, res) => {
  const existed = keys.delete(req.params.id);
  if (!existed) return res.status(404).json({ error: 'Chave não encontrada.' });
  res.status(204).end();
});

/** Middleware opcional para futuras rotas que exijam autenticação por API key. */
export function requireApiKey(req, res, next) {
  const rawKey = req.header('X-API-Key');
  if (!rawKey) return res.status(401).json({ error: 'Cabeçalho X-API-Key ausente.' });
  const hash = hashKey(rawKey);
  const match = [...keys.values()].find((k) => k.hash === hash);
  if (!match) return res.status(401).json({ error: 'API key inválida.' });
  match.lastUsedAt = Date.now();
  next();
}

export default router;
