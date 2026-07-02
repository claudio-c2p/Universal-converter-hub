#!/bin/bash
# update.sh — roda na SUA máquina (dev), não no servidor.
# Função: a cada execução, envia qualquer alteração local para o GitHub.
# Combinado com o auto-deploy do Render/Vercel (que já reagem a cada push),
# ou com deploy/server-auto-update.sh num VPS próprio, isso fecha o ciclo:
# você edita -> update.sh sobe pro GitHub -> o servidor puxa e reinicia sozinho.
#
# Como agendar a cada 30 min:
#   Windows (Task Scheduler): Ação = "Iniciar um programa"
#     Programa: C:\Program Files\Git\bin\bash.exe
#     Argumentos: "C:\Users\Claudio Luiz\OneDrive\Desktop\c2p projeto claudio\update.sh"
#     Disparador: repetir a cada 30 minutos, indefinidamente
#   Linux/Mac (crontab -e):
#     */30 * * * * /caminho/para/o/projeto/update.sh >> /caminho/para/o/projeto/deploy/logs/update.log 2>&1

set -uo pipefail

# Descobre a pasta do próprio script, então funciona não importa de onde for
# chamado (Task Scheduler roda com working directory diferente às vezes).
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR" || { echo "❌ Não foi possível entrar em $SCRIPT_DIR"; exit 1; }

TIMESTAMP="$(date '+%Y-%m-%d %H:%M:%S')"

if ! git rev-parse --is-inside-work-tree > /dev/null 2>&1; then
  echo "[$TIMESTAMP] ❌ Esta pasta não é um repositório git: $SCRIPT_DIR"
  exit 1
fi

git add -A

# Se não há nada para commitar, encerra silenciosamente (sem erro) — evita
# commits vazios toda vez que o script roda sem mudanças pendentes.
if git diff --cached --quiet; then
  echo "[$TIMESTAMP] ℹ️  Nada para atualizar (sem alterações locais)."
  exit 0
fi

if ! git commit -m "auto update ($TIMESTAMP)" > /dev/null; then
  echo "[$TIMESTAMP] ❌ Falha ao commitar as alterações."
  exit 1
fi

BRANCH="$(git rev-parse --abbrev-ref HEAD)"

if git push origin "$BRANCH"; then
  echo "[$TIMESTAMP] ✔️  Alterações enviadas para origin/$BRANCH com sucesso."
else
  echo "[$TIMESTAMP] ❌ Falha ao enviar para o GitHub (verifique sua conexão/credenciais)."
  exit 1
fi
