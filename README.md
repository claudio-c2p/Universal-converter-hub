# Universal Converter Hub (C2P)

Hub de conversão de arquivos — produto da marca **C2P**. Oferece conversões raras, que praticamente não existem gratuitamente em outros sites, além das ferramentas comuns de conversão de arquivos.

## Stack

- **Frontend:** Next.js 14 (App Router) + Tailwind CSS — pasta `frontend/`
- **Backend:** Express.js + Node.js ≥ 18, ESM (`"type": "module"`) — pasta `backend/`
- **Deploy:** Frontend na Vercel · Backend no Render ou Railway

## Segurança implementada

- Helmet.js
- Rate limiting por categoria (leve / médio / pesado)
- CORS restrito ao domínio do frontend, com `exposedHeaders` para headers customizados
- Validação de MIME/extensão e magic bytes em uploads
- Sanitização de nomes de arquivo
- Limite de tamanho por rota (documentado em cada multer)
- Limpeza automática de temporários (varredura a cada 15 min)
- Graceful shutdown (SIGTERM/SIGINT)

## Ferramentas

### Novas (v2) — 13 ferramentas raras

| Ferramenta | Categoria | Rota da API | Página |
|---|---|---|---|
| Conversor de Legendas (SRT ↔ VTT) | Mídia | `/api/subtitle` | `/tools/subtitle` |
| Conversor Geoespacial (KML ↔ GeoJSON, GPX → GeoJSON) | Geo | `/api/geo` | `/tools/geo-converter` |
| Conversor de Fontes (TTF ↔ WOFF ↔ WOFF2 ↔ EOT ↔ SVG) | Fonte | `/api/font` | `/tools/font-converter` |
| PDF → Imagem (PNG por página) | Documento | `/api/pdf-image` | `/tools/pdf-to-image` |
| Word (.docx) → HTML / Markdown | Documento | `/api/docx` | `/tools/docx-converter` |
| Conversor XML (→ YAML, formatar, minificar, → CSV) | Dados | `/api/xml` | `/tools/xml-converter` |
| Conversor SQL (Dump ↔ JSON/CSV, inferir CREATE TABLE) | Dados | `/api/sql` | `/tools/sql-converter` |
| Conversor de Config (.env ↔ JSON ↔ TOML ↔ INI) | Dev | `/api/config` | `/tools/config-converter` |
| Comparador de Arquivos (Diff) | Dev | `/api/diff` | `/tools/diff` |
| Find & Replace em massa | Dev | `/api/find-replace` | `/tools/find-replace` |
| Dividir / Mesclar CSV/JSON | Dados | `/api/split-merge` | `/tools/split-merge` |
| Leitor de Metadados EXIF | Utilitário | `/api/exif` | `/tools/exif` |
| Renomeador em Lote | Dev | `/api/batch-rename` | `/tools/batch-rename` |

### Itens avaliados como "Em breve" (documentados na interface)

- **OCR em PDF escaneado** — viável, mas requer avaliação de custo/dependência (Tesseract.js) antes de implementar.
- **Word ↔ ODT** — sem biblioteca Node confiável e mantida encontrada na pesquisa inicial.
- **PDF ↔ HTML com layout preservado** — conversão de alta complexidade; risco de qualidade inconsistente sem investigação mais profunda.
- **SQL entre dialetos (MySQL → PostgreSQL etc.)** — não suportado por limitação técnica das bibliotecas disponíveis; a interface exibe um aviso explícito.

### Ferramentas existentes (25 — pré-v2, não incluídas neste pacote)

Imagem (Conversor, Compressor) · Documento (PDF→Word, Word→PDF, Juntar/Dividir PDF, Extrair Texto) · Planilha (XLSX↔CSV) · Dados (JSON, CSV↔JSON, YAML↔JSON, XML↔JSON, Markdown↔HTML, Formatador, Encoding) · Utilitário (Base64, Números, QR Code, Leitor QR, Unidades, Datas, Cores) · Segurança (Hash, Gerador de Senhas).

> Este pacote contém apenas o código das 13 ferramentas novas e a infraestrutura do projeto. O código das 25 ferramentas pré-existentes não fazia parte do material fornecido para esta etapa.

## Estrutura do projeto

```
.
├── backend/
│   ├── src/
│   │   ├── app.js                 # entrypoint Express, registro de rotas, segurança
│   │   ├── converters/            # lógica pura de conversão (sem Express)
│   │   ├── routes/                # rotas Express (validação, multer, resposta HTTP)
│   │   └── utils/                 # fileUtils.js, errorHandler.js
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx         # layout raiz (obrigatório no App Router)
│   │   │   ├── page.tsx           # home — listagem de ferramentas
│   │   │   ├── globals.css
│   │   │   └── tools/<slug>/page.tsx
│   │   ├── components/ui/         # ConverterCard, FileDropzone, MultiFileDropzone, ConversionStatus, ToolLayout, CategoryBadge, DiffViewer
│   │   ├── hooks/useConverter.ts  # hook centralizado de fetch para conversões
│   │   └── lib/design-tokens.ts
│   ├── public/c2p_logo_light.webp, c2p_logo_dark.webp
│   ├── package.json
│   ├── next.config.js
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   ├── postcss.config.js
│   └── .env.example
├── start-dev.sh
├── deploy.md
└── .gitignore
```

## Como rodar localmente

```bash
# Backend
cd backend
cp .env.example .env
npm install
npm run dev      # http://localhost:4000

# Frontend (em outro terminal)
cd frontend
cp .env.example .env.local
npm install
npm run dev      # http://localhost:3000
```

Ou use o script de conveniência na raiz: `./start-dev.sh` (sobe os dois ao mesmo tempo).

Veja `deploy.md` para instruções de deploy em produção (Vercel + Render/Railway).

## Changelog — Auditoria e correções

Revisão completa do código com build de produção testado (`npm run build` + `tsc --noEmit`, ambos limpos):

- **Build de produção corrigido**: aspas não escapadas em JSX (`react/no-unescaped-entities`) em 5 páginas de PDF impediam `next build` de compilar.
- **Variável de ambiente incorreta**: `pdf-insert-pages` usava `NEXT_PUBLIC_BACKEND_URL` (inexistente) em vez de `NEXT_PUBLIC_API_URL`, quebrando a ferramenta em produção. Página reescrita para seguir o mesmo padrão visual e técnico das demais.
- **Cor de marca inconsistente**: 17 arquivos usavam `brand-primary` (preto) em estados ativos/selecionados onde o resto do app usa `brand-accent` (laranja). Padronizado.
- **Ícones ausentes**: nenhuma das 54 páginas de ferramenta passava `icon` para `ToolLayout`. Criado o componente `ToolIcon` e aplicado o ícone correspondente (mesmo da home) em todas as páginas.
- **Logo sem transparência**: o `.webp` original tinha fundo branco sólido, criando uma caixa branca no header em dark mode, com o texto preto do logo ilegível sobre fundo escuro. Substituído por duas variantes (`c2p_logo_light.webp` / `c2p_logo_dark.webp`) trocadas via CSS conforme o tema.
- **Fonte Inter nunca carregava**: declarada via CSS mas sem nenhum `@font-face` real — o site renderizava na fonte padrão do sistema. Corrigido com `@fontsource/inter` e `@fontsource/jetbrains-mono` (self-hosted, sem dependência de rede em build time).
- **Selo "Novo" sem sentido**: 41 das 54 ferramentas estavam marcadas como novas. Reduzido para as 15 ferramentas do lançamento mais recente.
- **Bug no `FileDropzone`**: ao rejeitar um arquivo por tamanho, o `<input>` não limpava seu valor — selecionar o mesmo arquivo de novo não disparava o evento de erro.
- **`design-tokens.ts` desincronizado**: tinha uma paleta de cores completamente diferente da usada de fato no `tailwind.config.js`. Sincronizado.
- **SEO/PWA ausentes**: adicionados favicons, `manifest.json`, Open Graph, Twitter Card e `viewport`/`themeColor`.
- Pequenas melhorias de interação: transições mais vivas no `ThemeToggle`, `FileDropzone` e nos cards da home; suporte a `prefers-reduced-motion`.
- **Redesign visual da homepage**: header com sombra sutil ao scroll (`backdrop-blur`), hero reformulado com faixa de estatísticas reais do catálogo (ferramentas, categorias), badge de proposta de valor ("sem cadastro · sem anúncios"), filtros de categoria com melhor contraste/feedback, e entrada escalonada (fade-up) nos cards de resultado.
- **Uploads de múltiplos arquivos padronizados**: `pdf-merge`, `jpg-to-pdf`, `batch-rename` e o modo "mesclar" de `split-merge` usavam um `<input type="file" multiple>` nativo, destoando visualmente do resto do app. Criado o componente `MultiFileDropzone` (mesmo visual do `FileDropzone`, com lista de arquivos reordenável/removível) e aplicado nessas 4 páginas. `diff` (que recebe 2 arquivos avulsos, não uma lista) passou a usar 2× `FileDropzone` lado a lado, no mesmo padrão já usado em `pdf-insert-pages`.

### v4.1 — Finalização para produção (este pacote)

- **Nomenclatura de parâmetro padronizada**: `font.js` (`toType`) e `subtitle.js` (`outputFormat`) agora usam `toFormat`, igual ao resto das rotas. Páginas `font-converter` e `subtitle` atualizadas para enviar `toFormat`.
- **Validação de extensão no drag-and-drop**: `FileDropzone.tsx` agora valida a extensão do arquivo contra `accept` também quando o arquivo é arrastado e solto (antes só validava no clique do seletor nativo).
- **Mensagens de erro técnico traduzidas**: `errorHandler.js` ganhou `translateExternalError()`, que reconhece padrões comuns de erro de processos externos (`ENOENT`, timeout, permissão, falta de espaço/memória) e devolve uma mensagem amigável em português; o erro técnico original continua só no log do servidor.
- **77 novas páginas de ferramenta** (Blocos A–F do prompt de finalização): Office via LibreOffice, eBooks via Calibre, bancos de arquivo (SQLite/DBF/VCF/ICS/MDB — com seleção de tabela em duas etapas para MDB), Dados→PDF/Excel, EPS/OCR/remoção de senha de PDF via Ghostscript/Tesseract/qpdf, e LaTeX via Pandoc. Todas seguem o padrão da seção 3 do prompt e foram adicionadas ao array `TOOLS` da home.
- **Indicador de progresso em conversões pesadas**: `ConversionStatus.tsx` agora troca a mensagem de "Convertendo…" para um aviso de que pode levar até 1 minuto, depois de 5s em loading.
- **Página e endpoint de status do sistema**: `GET /api/health/binaries` testa `soffice`, `ebook-convert`, `gs`, `tesseract`, `mdb-tables`, `pandoc`, `qpdf` e `ffmpeg` via `--version`; `/status` no frontend mostra um indicador verde/vermelho por ferramenta.

#### O que NÃO foi feito nesta etapa (e por quê)

- **Teste com arquivo real dos binários externos** (LibreOffice, Calibre, Ghostscript, Tesseract, mdbtools, Pandoc): o ambiente onde este pacote foi montado não tem esses binários instalados nem acesso de rede para instalá-los. O código e as páginas estão prontos e seguem exatamente os contratos de rota documentados, mas **é obrigatório validar com arquivo real em um ambiente com os binários instalados** (local com Docker do projeto, ou já em produção) antes de divulgar essas ferramentas como disponíveis — especialmente Calibre e Tectonic/pdflatex (TEX→PDF), que já estavam marcados como não confirmados no prompt original.
- **`npm run build` do frontend**: não foi possível rodar (sem `node_modules` e sem acesso de rede neste ambiente para `npm install`). Foi feita uma checagem estrutural manual (chaves balanceadas, sintaxe `node --check` no backend, contagem de páginas batendo com o array `TOOLS`), mas isso **não substitui** um build real — rode `npm run build` localmente antes do deploy.
- **Bloco H (Mídia/FFmpeg)**: não implementado, pois o prompt original marca como escopo não aprovado pelo cliente.
- **Itens da seção 6 (IA via Anthropic, TTS via ElevenLabs, DWG via CloudConvert)**: não implementados, conforme instrução explícita de não habilitar sem confirmação de orçamento.
- **Sugestões de "conversão relacionada" pós-sucesso (item 4.4)**: não implementado nesta rodada — é incremento de UX de menor prioridade comparado ao resto da lista.
- **Seleção de tabela em duas etapas para SQLite/DBF com múltiplas tabelas (extensão do item 4.3)**: implementado apenas para MDB, que é o caso explicitamente descrito no prompt original como tendo `tableName` opcional + múltiplas tabelas sem forma de descobrir o nome antemão.

**Total de ferramentas com página própria após esta etapa: 123** (54 anteriores + 69 novas: 65 do gerador padrão dos Blocos A–D/F + `pdf-remove-password` + `mdb-to-csv`/`mdb-to-sql`/`mdb-to-excel` com fluxo de seleção de tabela).

### Revisão de conferência (após a entrega inicial)

Reauditoria completa item a item do prompt original, cruzando cada endpoint novo com a definição real da rota no backend (não só com a tabela do prompt) e validando sintaxe de 100% dos arquivos `.js` do backend (`node --check`) e estrutura de todas as 123 páginas do frontend. Dois problemas reais foram encontrados e corrigidos nessa passada:

- **`maxSizeMB` errado em todas as 69 páginas novas**: o gerador usou 50MB para tudo, mas os limites reais de `multer` por rota são diferentes (`/api/libreoffice` = 25MB, `/api/extra` = 40MB, `/api/file-db` = 10MB, `/api/data-convert` = 5MB, `/api/binary-tools` = 20MB). Corrigido por bloco para bater exatamente com o backend — sem isso, um arquivo entre o limite mostrado na tela e o limite real do servidor seria aceito pelo frontend e rejeitado com 413 pelo backend.
- **Validação de extensão do item 1.2 quebrava a página com `accept="*"`** (`batch-rename`, que aceita qualquer tipo de arquivo): a lógica nova tratava `"*"` como uma extensão literal, rejeitando 100% dos arquivos arrastados nessa página. Corrigido para tratar `"*"` (ou `accept` vazio) como "aceita qualquer extensão".
- Confirmado também: `.mdb` (não `.accdb`) é o único formato que o `accept` das 3 páginas MDB deveria anunciar, já que o backend usa `mdbtools`, que não tem suporte confirmado a `.accdb`.

Ainda não testado de ponta a ponta (mesma limitação já registrada acima): execução real dos binários externos e `npm run build`, por falta de rede/binários neste ambiente de sandbox.

### Segunda revisão de conferência

Auditoria adicional focada em pontos que a primeira revisão não cobriu (listas auxiliares fora do array `TOOLS` que dependem de estarem sincronizadas com ele). Encontrado e corrigido um bug crítico:

- **As 32 ferramentas das categorias `eBook` e `Banco de Dados` (23 + 9) tinham página funcionando, mas eram invisíveis na home.** A grade da home (`byCategory`, em `frontend/src/app/page.tsx`) não itera sobre todas as categorias presentes em `TOOLS` — ela itera sobre uma constante separada, `CATEGORY_ORDER`, que definia apenas as categorias antigas. Como `eBook` e `Banco de Dados` não estavam nessa lista, nenhuma ferramenta desses dois blocos aparecia em nenhuma seção da home (e também não apareciam nos chips de filtro de categoria) — apesar de a página de cada ferramenta funcionar normalmente se acessada por URL direta. Corrigido adicionando as duas categorias a `CATEGORY_ORDER`.
- Como consequência do mesmo problema, a categoria `Banco de Dados` também não tinha cor própria em `CategoryBadge.tsx` (caía no cinza genérico do fallback `Dev`). Adicionada cor própria (índigo).
- Texto descritivo da hero atualizado para mencionar as novas categorias (Office, eBooks, OCR, bancos de dados, LaTeX), que antes só citava o catálogo anterior à v4.1.

Este tipo de bug — onde algo passa em todo teste local de uma rota/componente isolado mas falha porque uma segunda lista auxiliar em outro arquivo não foi atualizada junto — é exatamente o tipo de coisa que só aparece numa auditoria cruzada, então vale considerar isso como aprendizado para futuras adições de categoria: sempre que uma categoria nova for introduzida em `TOOLS`, ela precisa ser adicionada também em `CATEGORY_ORDER` (`page.tsx`) e em `CATEGORY_COLORS` (`CategoryBadge.tsx`).

### Terceira revisão — o item 1.3 não estava de fato corrigido

Na auditoria anterior eu tinha validado `translateExternalError()` isoladamente e dado como resolvido o item 1.3 (mensagens técnicas em inglês vazando pro usuário). Era verificação incompleta: testei a função em isolamento, mas não confirmei que ela era de fato chamada no caminho real da requisição.

**O bug:** `translateExternalError()` só era usado dentro de `globalErrorHandler`, o middleware de erro do Express (`app.use(globalErrorHandler)`, registrado no fim de `app.js`). Só que as rotas que de fato chamam binários externos — `libreOffice.js`, `extraBinary.js` (Calibre/MDB/TEX) e `binaryTools.js` (Ghostscript/Tesseract/qpdf) — **capturam o erro com `try/catch` e respondem direto** com `res.status(422).json({ error: err.message })`, sem nunca chamar `next(err)`. Ou seja, o erro nunca chegava no `globalErrorHandler`, e a mensagem crua (`spawn ebook-convert ENOENT`, exatamente o exemplo citado no prompt original) continuava vazando pro usuário sem tradução — apesar do código de tradução existir e estar correto.

**A correção real:** `translateExternalError` agora é importado e aplicado diretamente no `catch` de cada rota desses 3 arquivos (`res.status(422).json({ error: translateExternalError(err.message) ?? err.message })`), que é o caminho que essas rotas realmente usam. Testado isoladamente com os exemplos reais que o prompt citou (`spawn ebook-convert ENOENT`, `spawn soffice ENOENT`, `spawn tesseract ENOENT`, `spawn gs ENOENT`) — todos agora traduzidos. O caso de senha incorreta em `pdf-remove-password` já tinha tratamento específico em português antes de chegar nesse ponto (`removePdfPassword` em `binaryToolsConverter.js` intercepta `invalid password`/`wrong password` e relança com mensagem própria), então não precisava de tradução adicional.

`fileDb.js` (SQLite/DBF/VCF/ICS) não foi alterado nesta correção porque não chama nenhum binário externo — usa só bibliotecas JS puras (`sql.js`, `dbffile`, `node-ical`), então os erros que ele lança já nascem em condições previsíveis, não em stderr de processo externo.

### Quarta revisão

- **`GET /api/health/binaries` tinha um falso negativo em potencial**: a checagem original considerava qualquer falha ao rodar `<binário> --version` como "indisponível". Só que nem todo binário do mdbtools aceita `--version` sem um arquivo como argumento (`mdb-tables`, por exemplo, é tipicamente invocado como `mdb-tables arquivo.mdb`) — então mesmo com o mdbtools instalado e funcionando, a página de status poderia mostrar "indisponível" incorretamente. Corrigido: agora só `ENOENT`/`EACCES` (binário realmente não encontrado/sem permissão) e timeout contam como indisponível; qualquer outro erro (como exit code != 0 por falta de argumento) prova que o processo foi encontrado e executado, então conta como disponível. **Testado de verdade** neste ambiente, que por acaso já tem `soffice`, `pandoc`, `qpdf`, `tesseract` e `ffmpeg` instalados (mas não `gs`, `mdb-tables` nem `ebook-convert`) — os 8 binários foram checados um a um e todos os resultados bateram com o esperado.
- **Fluxo de seleção de tabela do MDB (item 4.3) descartava a mensagem de erro real**: se `mdb-tables` falhasse, as 3 páginas mostravam sempre o mesmo texto genérico ("Não foi possível ler as tabelas do arquivo"), em vez da mensagem específica que o backend já devolve (ex: arquivo corrompido, mdbtools indisponível). Corrigido para extrair `data.error` da resposta antes de cair no texto genérico — mesmo padrão que `useConverter.ts` já usa para o resto do app.






