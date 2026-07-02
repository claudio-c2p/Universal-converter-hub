# Auto-update — manter o servidor sempre na última versão

Este projeto tem dois scripts que trabalham em conjunto para manter o servidor
sempre atualizado, sem deploy manual:

```
Você edita o código
        │
        ▼
update.sh / update.ps1   (roda no SEU computador, a cada 30 min)
  → git add + commit + push para o GitHub
        │
        ▼
deploy/server-auto-update.sh   (roda NO SERVIDOR, a cada 30 min)
  → git fetch + reset --hard + npm install (se preciso) + pm2 restart
        │
        ▼
/status no site mostra ✔️ ou ❌ do último ciclo
```

Se o seu backend já está em Render/Railway (ver `deploy.md`), essas plataformas
**já fazem isso sozinhas** a cada push (auto-deploy nativo) — você só precisa do
`update.sh` do lado do dev. O `server-auto-update.sh` é para quem hospeda em
VPS próprio (ex: rodando o `Dockerfile` da pasta `backend/` manualmente).

## 1. Lado do desenvolvedor (Windows)

O arquivo `update.sh` (raiz do projeto) já está pronto — ele descobre sozinho
em qual pasta está, então não precisa editar caminho nenhum nele.

**Agendar no Task Scheduler do Windows:**

1. Abra o *Agendador de Tarefas* → *Criar Tarefa Básica*.
2. Disparador: *Diariamente*, repetir a cada **30 minutos**, indefinidamente.
3. Ação: *Iniciar um programa*.
   - Se você tem Git Bash instalado:
     - Programa/script: `C:\Program Files\Git\bin\bash.exe`
     - Argumentos: `"C:\Users\Claudio Luiz\OneDrive\Desktop\c2p projeto claudio\update.sh"`
   - Se preferir PowerShell puro (não precisa do Git Bash), use `update.ps1`:
     - Programa/script: `powershell.exe`
     - Argumentos: `-NoProfile -ExecutionPolicy Bypass -File "C:\Users\Claudio Luiz\OneDrive\Desktop\c2p projeto claudio\update.ps1"`
4. Salve. Teste rodando a tarefa manualmente uma vez (botão direito → Executar).

O script só commita e envia se **houver alterações locais** — rodando sem
mudanças pendentes, ele não faz nada (sem commits vazios).

## 2. Lado do servidor (VPS)

Copie a pasta `deploy/` para o servidor junto com o resto do repositório
(ela já faz parte do projeto). Depois:

```bash
# 1. Garanta que o pm2 está instalado e o backend já rodando por ele:
npm install -g pm2
cd backend && pm2 start npm --name c2p-backend -- start && cd ..
pm2 save

# 2. Torne o script executável (se ainda não estiver):
chmod +x deploy/server-auto-update.sh

# 3. Agende via cron a cada 30 min:
crontab -e
# adicione a linha (ajustando o caminho):
*/30 * * * * /caminho/do/projeto/deploy/server-auto-update.sh >> /caminho/do/projeto/deploy/logs/server-update.log 2>&1
```

O script:
- Busca o branch atual no GitHub (`git fetch` + `git reset --hard origin/<branch>`).
- Só roda `npm install` se o `package.json`/`package-lock.json` do backend mudou nesse pull.
- Reinicia o processo via `pm2 restart c2p-backend`.
- Grava o resultado em `deploy/status.json` (✔️ sucesso, ❌ falha, ℹ️ já atualizado).

## 3. Visualizando o status

O backend expõe `GET /api/health/auto-update`, que lê `deploy/status.json`.
A página **`/status`** do site já mostra isso no topo, com ✔️/❌ e a hora da
última verificação — sem precisar entrar no servidor pra saber se a última
atualização automática funcionou.

Se o arquivo `deploy/status.json` ainda não existe (cron nunca rodou nesse
servidor), a página mostra "Não configurado" em vez de erro.

## Observações importantes

- `deploy/status.json` e `deploy/logs/` **não vão para o git** (estão no
  `.gitignore`) — são estado de execução, não código-fonte.
- O `server-auto-update.sh` faz `git reset --hard`: qualquer edição feita
  diretamente no servidor (fora do git) **será descartada** no próximo ciclo.
  O servidor deve ser sempre um espelho do repositório — edite localmente,
  rode `update.sh`, deixe o servidor puxar sozinho.
- Se você não usa `pm2`, troque a última seção de `server-auto-update.sh`
  (a chamada `pm2 restart ...`) pelo comando de reinício do seu ambiente
  (`systemctl restart c2p-backend`, `docker restart <container>`, etc.).
