#!/usr/bin/env bash
# Sobe backend (Express) e frontend (Next.js) simultaneamente em modo dev.
# Uso: ./start-dev.sh

set -e

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

cleanup() {
  echo ""
  echo "Encerrando processos..."
  kill "$BACKEND_PID" "$FRONTEND_PID" 2>/dev/null || true
  exit 0
}
trap cleanup SIGINT SIGTERM

echo "🚀 Iniciando backend (porta 4000)..."
cd "$ROOT_DIR/backend"
if [ ! -f .env ]; then
  echo "   (criando backend/.env a partir do .env.example)"
  cp .env.example .env
fi
npm run dev &
BACKEND_PID=$!

echo "🚀 Iniciando frontend (porta 3000)..."
cd "$ROOT_DIR/frontend"
if [ ! -f .env.local ]; then
  echo "   (criando frontend/.env.local a partir do .env.example)"
  cp .env.example .env.local
fi
npm run dev &
FRONTEND_PID=$!

echo ""
echo "Backend:  http://localhost:4000"
echo "Frontend: http://localhost:3000"
echo "Pressione Ctrl+C para encerrar ambos."

wait
