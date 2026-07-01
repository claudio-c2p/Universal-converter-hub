# Deploy — Universal Converter Hub (C2P)

## Visão geral

- **Frontend** (Next.js) → Vercel
- **Backend** (Express) → Render ou Railway

## 1. Backend (Render ou Railway)

### Configuração do serviço

- **Root directory:** `backend/`
- **Build command:** `npm install`
- **Start command:** `npm start`
- **Node version:** ≥ 18 (defina via `engines` no `package.json`, já configurado)

### Variáveis de ambiente obrigatórias

| Variável | Valor de exemplo | Observação |
|---|---|---|
| `PORT` | (geralmente injetada automaticamente pela plataforma) | Render/Railway definem isso por conta própria — não force um valor fixo |
| `FRONTEND_URL` | `https://seu-projeto.vercel.app` | Usado pelo CORS — deve ser a URL exata do frontend em produção |
| `TMP_DIR` | `/tmp` | Diretório de escrita temporária; `/tmp` já funciona como fallback no Render/Railway |

### Dependências nativas

`pdf-to-img` (usado em `/api/pdf-image`) depende de `@napi-rs/canvas`, que usa binários pré-compilados — não requer `node-gyp`/Cairo/Pango no servidor. Nenhuma dependência de sistema extra é necessária além do Node.js padrão.

> ⚠️ Fique atento à versão do `pdf-to-img` no `package.json`: versões `4.x` (e anteriores) dependem de `pdfjs-dist` antigo, que por sua vez usa o pacote `canvas` clássico (compilado via `node-gyp`, requer Cairo/Pango no sistema). Mantenha a dependência fixada em `^6.0.0` ou superior.

## 2. Frontend (Vercel)

### Configuração do projeto

- **Root directory:** `frontend/`
- **Framework preset:** Next.js (detectado automaticamente)
- **Build command:** `next build` (padrão)
- **Output directory:** `.next` (padrão)

### Variáveis de ambiente obrigatórias

Configure em **Settings → Environment Variables**:

| Variável | Valor de exemplo |
|---|---|
| `NEXT_PUBLIC_API_URL` | `https://seu-backend.onrender.com` (ou domínio do Railway) |

> Esta variável precisa estar disponível em **Build Time** (prefixo `NEXT_PUBLIC_` já garante isso), então configure antes do primeiro deploy ou force um novo build após adicioná-la.

## 3. Checklist pós-deploy

```
☐ Backend responde em GET / com { status: "ok", rotas: 13 }
☐ CORS aceita requisições do domínio da Vercel (sem erro no console do navegador)
☐ Cada uma das 13 ferramentas novas faz uma conversão de teste com sucesso
☐ Headers customizados (X-Replacements-Count) chegam corretamente no frontend
☐ Upload de arquivo grande (próximo do limite de cada rota) retorna erro tratado, não timeout cru
☐ Variáveis de ambiente conferidas em ambas as plataformas
```

## 4. Atualizações de dependências de sistema

Nenhuma dependência de sistema operacional (apt/brew) é necessária para este pacote de ferramentas — todas as bibliotecas usadas (`pdf-to-img`, `fonteditor-core`, `mammoth`, `exifr`, etc.) funcionam com binários Node puros ou pré-compilados multiplataforma.
