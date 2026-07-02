#!/bin/bash
# deploy/server-auto-update.sh — roda NO SERVIDOR (VPS/container com acesso ao git).
# Função: mantém o backend sempre na última versão do branch principal, sem
# precisar de deploy manual. Feito para rodar a cada 30 min via cron.
#
# Como agendar (no servidor, via `crontab -e`):
#   */30 * * * * /caminho/do/projeto/deploy/server-auto-update.sh >> /caminho/do/projeto/deploy/logs/server-update.log 2>&1
#
# Pré-requisitos no servidor:
#   - git configurado com acesso de leitura ao repositório (deploy key ou HTTPS+token)
#   - pm2 instalado globalmente (`npm install -g pm2`) e o backend já iniciado
#     uma vez com: pm2 start npm --name c2p-backend -- start  (dentro de backend/)
#   - Se não usar pm2, troque a seção "reiniciar o processo" no fim do script
#     pelo comando equivalente da sua plataforma (systemctl restart, docker restart, etc.)

set -uo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
LOG_DIR="$SCRIPT_DIR/logs"
STATUS_FILE="$SCRIPT_DIR/status.json"
PM2_APP_NAME="${PM2_APP_NAME:-c2p-backend}"

mkdir -p "$LOG_DIR"
cd "$REPO_DIR" || { echo "❌ Não foi possível entrar em $REPO_DIR"; exit 1; }

TIMESTAMP_ISO="$(date -u '+%Y-%m-%dT%H:%M:%SZ')"
TIMESTAMP_HUMAN="$(date '+%Y-%m-%d %H:%M:%S')"

write_status() {
  # status: ok | up-to-date | failed
  local status="$1"
  local message="$2"
  cat > "$STATUS_FILE" << JSON
{
  "status": "$status",
  "message": "$message",
  "checkedAt": "$TIMESTAMP_ISO"
}
JSON
}

fail() {
  echo "[$TIMESTAMP_HUMAN] ❌ $1"
  write_status "failed" "$1"
  exit 1
}

if ! git rev-parse --is-inside-work-tree > /dev/null 2>&1; then
  fail "Esta pasta não é um repositório git: $REPO_DIR"
fi

BRANCH="$(git rev-parse --abbrev-ref HEAD)"
BEFORE_HASH="$(git rev-parse HEAD)"

git fetch origin "$BRANCH" || fail "Não foi possível buscar atualizações no GitHub (rede/credenciais)."

# Descarta qualquer alteração local não commitada no servidor antes do pull —
# o servidor deve ser sempre um espelho exato do branch remoto, nunca editado
# manualmente. Se você precisa editar direto no servidor, isso não é pra você.
git reset --hard "origin/$BRANCH" || fail "Falha ao sincronizar com origin/$BRANCH."

AFTER_HASH="$(git rev-parse HEAD)"

if [ "$BEFORE_HASH" = "$AFTER_HASH" ]; then
  echo "[$TIMESTAMP_HUMAN] ℹ️  Já estava atualizado (commit $AFTER_HASH)."
  write_status "up-to-date" "Nenhuma mudança nova — já estava na última versão."
  exit 0
fi

echo "[$TIMESTAMP_HUMAN] 🔄 Atualização encontrada: $BEFORE_HASH → $AFTER_HASH"

# Só reinstala dependências se package.json/package-lock.json do backend mudaram
# nesse pull — evita um `npm install` (lento) a cada 30 min sem necessidade.
if git diff --name-only "$BEFORE_HASH" "$AFTER_HASH" | grep -q '^backend/package.*\.json$'; then
  echo "[$TIMESTAMP_HUMAN] 📦 package.json do backend mudou — rodando npm install..."
  (cd backend && npm install --omit=dev) || fail "npm install falhou após o pull."
fi

# Reinicia o processo do backend. Ajuste esta seção conforme o gerenciador de
# processos real do seu servidor, se não usar pm2.
if command -v pm2 > /dev/null 2>&1; then
  pm2 restart "$PM2_APP_NAME" --update-env || fail "pm2 restart falhou para '$PM2_APP_NAME'."
else
  fail "pm2 não encontrado no PATH — instale com 'npm install -g pm2' ou adapte esta seção do script."
fi

echo "[$TIMESTAMP_HUMAN] ✔️  Atualizado e reiniciado com sucesso (commit $AFTER_HASH)."
write_status "ok" "Atualizado para o commit ${AFTER_HASH:0:7} e reiniciado com sucesso."
