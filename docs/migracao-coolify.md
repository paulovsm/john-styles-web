# Migração Vercel → Coolify (VPS)

## Contexto

Hoje o app roda na Vercel em dois planos separados: a CDN serve `dist/` estático e
aplica os rewrites de [`vercel.json`](../vercel.json), enquanto cada arquivo `api/*.js`
vira uma serverless function isolada. O objetivo é passar tudo para um **único container
Node de vida longa** no Coolify, numa VPS própria.

A boa notícia do levantamento: **não existe nenhum acoplamento a `@vercel/*`, a globais
`VERCEL_*` ou a APIs proprietárias**. Os handlers usam só `req.query` / `req.body` /
`res.status().json()` — tudo nativo do Express. E [`server.js`](../server.js) já replica
o roteamento por arquivo da Vercel (`api/<nome>.js` → `/api/<nome>`).

O que a Vercel fazia implicitamente e some na migração:

1. **Servir estáticos + rewrites.** `server.js` não tem `express.static`, nem as rotas
   `/blog`, `/blog/:slug`, `/sitemap.xml`, nem o fallback SPA → `index.html`.
2. **Normalizar `x-forwarded-for` na edge.** O rate limit confia no *primeiro* item do
   header — correto atrás da Vercel, **inseguro** atrás do Traefik do Coolify.
3. **CDN compartilhada.** `s-maxage` / `stale-while-revalidate` viram no-op sem CDN.
4. **Injetar env vars no build.** As `VITE_*` são compiladas no bundle; num Dockerfile
   elas precisam ser *build args*, não variáveis de runtime.

Premissas deste plano: Coolify **já instalado e rodando**; empacotamento via **Dockerfile
no repo**; **cutover direto** em `fleekauthority.com` (sem subdomínio de validação).

---

## Parte 1 — Transformar `server.js` no servidor de produção

Arquivo: [`server.js`](../server.js). Hoje ele é "só para dev" (o README diz isso). Passa
a ser o entrypoint único. Mantém a função `registerRoutes()` e o `wrapHandler()` que já
existem — só acrescenta camadas em volta, **nesta ordem**:

1. `app.set('trust proxy', 1)` — um único hop (Traefik). Sem isso o passo 2 não resolve.
2. `express.json({ limit: '15mb' })` — hoje é `10mb`, mas `api/_validate.js:6` aceita
   imagem de 8 MB decodificada, que em base64 dá ~10.9 MB e estoura o limite atual. Some
   também o teto de 4.5 MB da Vercel.
3. Rotas `/api/*` via `registerRoutes()` (código atual, inalterado).
4. **Rewrites** que hoje vivem em `vercel.json:5-16`, reusando os handlers já importados:
   - `/blog` e `/blog/:slug` → handler de [`api/blog-page.js`](../api/blog-page.js),
     setando `req.query.slug` a partir de `req.params.slug`.
   - `/sitemap.xml` → handler de [`api/sitemap.js`](../api/sitemap.js).
5. `express.static(dist)` com `index: false` e cache diferenciado via `setHeaders`:
   `dist/assets/**` (nomes com hash do Vite, ex. `index-BC7iK-6f.js`) →
   `public, max-age=31536000, immutable`; o resto (`og.jpg`, `robots.txt`, `landing/`,
   copiados de `public/` sem hash) → `max-age` curto.
6. **Fallback SPA** → `dist/index.html` com `Cache-Control: no-cache`.

> ⚠️ O rewrite `/__/auth/(.*)` → `https://john-styles-web-78cc0.firebaseapp.com/__/auth/$1`
> (`vercel.json:3-6`) é um **proxy para host externo** e precisa ser reimplementado no
> Traefik/Coolify ou no `server.js` (ex.: `fetch` + pipe, ou `http-proxy-middleware`) antes
> do passo 5 — senão ele cai no `express.static`/fallback SPA e o login social quebra em
> webviews de app assim que `VITE_FIREBASE_AUTH_DOMAIN` apontar para o domínio próprio.
> Ver README, seção "Login social e o Safari do iPhone".

> ⚠️ **Express 5.1.0** (versão em uso): `app.get('*', ...)` **quebra** — o path-to-regexp
> v8 rejeita `*` puro. O fallback tem que ser `app.use((req, res) => ...)` como último
> middleware, ou a sintaxe nomeada `/*splat`.

Ainda em `server.js`:

- `const PORT = process.env.PORT || 3000` (hoje é `3000` fixo) e `app.listen(PORT, '0.0.0.0')`.
- Handler de `SIGTERM`/`SIGINT` com `server.close()` — o Coolify manda SIGTERM no deploy.
- Tornar o `dotenv.config({ path: '.env.local' })` condicional a
  `NODE_ENV !== 'production'`. No container não existe `.env.local` (é no-op hoje, mas
  deixa a intenção explícita).

**Healthcheck:** criar `api/health.js` com um handler trivial (`res.json({ ok: true })`).
Ele é registrado automaticamente pelo loop de `registerRoutes()` como `/api/health` —
zero fiação extra — e vira o Health Check Path do Coolify.

---

## Parte 2 — Correções obrigatórias de segurança

Estas **não são opcionais**: são regressões reais criadas pela troca de plataforma.

### 2.1 Spoofing de IP no rate limit — `api/_rateLimit.js`

`api/_rateLimit.js:40-51` faz `forwarded.split(',')[0].trim()`, e o comentário em
`:36-38` explica o porquê: *"Vercel sets x-forwarded-for at the edge and overwrites
whatever the client sent"*.

O Traefik do Coolify **não sobrescreve — ele acrescenta**. O primeiro item passa a ser o
valor que o cliente mandou, então qualquer um contorna o rate limit com um header
forjado. Afeta `api/business-contact.js:126` e os buckets de comentário/view do blog.

Correção: com `trust proxy` ligado (Parte 1), preferir `req.ip` — o Express já resolve o
hop confiável a partir da direita — e manter o parse manual apenas como fallback.
Atualizar o comentário para refletir o Traefik.

### 2.2 Gate do CMS por hostname — `api/_blog.js`

`api/_blog.js:78-79` (`isLocalCmsRequest()`) libera escrita no CMS quando
`NODE_ENV !== 'production'` **e** o host está em `LOCAL_CMS_HOSTS`. O host vem de
`x-forwarded-host` (`api/_blog.js:58-75`), que é atacável.

O `NODE_ENV !== 'production'` é a única barreira real. No Dockerfile isso precisa ser
`ENV NODE_ENV=production` **na imagem**, não só uma variável do Coolify que alguém pode
apagar sem querer. Vale também um `throw` na inicialização se o servidor subir com
`NODE_ENV !== 'production'` fora de dev — falha barulhenta em vez de CMS aberto.

### 2.3 Fixar o domínio público

Definir `PUBLIC_SITE_URL=https://fleekauthority.com`. Sem ela, `api/sitemap.js:5-6` e
`api/blog-page.js:38-39` montam canonical/Open Graph a partir do header `Host`, que o
cliente controla.

---

## Parte 3 — Dockerfile + `.dockerignore`

`Dockerfile` multi-stage na raiz, `node:22-alpine` (o `package.json` pede `node: 22.x`):

**Stage `build`** — `npm ci` completo (o Vite e o `@vitejs/plugin-react` estão em
devDependencies), copia o source, declara os `ARG VITE_*` e roda `npm run build`.

**Stage `runtime`** — `npm ci --omit=dev`, copia `dist/`, `api/`, `server.js`,
`package.json`. `ENV NODE_ENV=production`, usuário não-root, `EXPOSE 3000`,
`CMD ["node", "server.js"]`.

### ⚠️ O ponto que mais quebra essa migração: `VITE_*` são build-time

As seis `VITE_FIREBASE_*` são **inlineadas no bundle** pelo Vite durante `npm run build`.
Se forem passadas só como variável de runtime do Coolify, o build gera um bundle com
`undefined` em toda a config do Firebase e **o login quebra por inteiro** — sem erro no
build, só um app morto em produção.

No Coolify: marcar cada `VITE_*` com a flag **"Build Variable"**, e no Dockerfile
declará-las como `ARG` + `ENV` dentro do stage de build.

### `.dockerignore`

Crítico — a raiz do repo tem **`service-account.json`** (credencial do Firebase Admin,
gitignorada mas presente no disco). Precisa estar no `.dockerignore` junto com
`node_modules`, `.env.local`, `.env`, `dist`, `.git`, `.vercel`, `*.test.js`.

---

## Parte 4 — Configuração no Coolify

- **Application** do tipo Dockerfile, apontando pro repo Git, branch `main`.
- **Port**: `3000`. **Health Check Path**: `/api/health`.
- **Domain**: `https://fleekauthority.com` (Traefik emite o Let's Encrypt). Se `www` for
  usado hoje, configurar o redirect `www` → apex — a Vercel fazia isso sozinha.
- **Env vars (runtime)**: `NODE_ENV`, `GOOGLE_AI_API_KEY`, `FIREBASE_SERVICE_ACCOUNT`,
  `N8N_WEBHOOK_URL`, `ALLOWED_ORIGINS=https://fleekauthority.com`, `PUBLIC_SITE_URL`,
  `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `CONTACT_EMAIL`, `GOOGLE_OAUTH_CLIENT_ID`,
  `GOOGLE_OAUTH_CLIENT_SECRET`, `GOOGLE_OAUTH_REDIRECT_URI`, `OAUTH_STATE_SECRET`,
  `APP_BASE_URL`.
- **Env vars (build)**: as seis `VITE_FIREBASE_*` marcadas como Build Variable.
- `FIREBASE_SERVICE_ACCOUNT`: usar a variante **base64**. O código já aceita as duas
  (ver [`.env.example`](../.env.example)), e a UI do Coolify lida mal com JSON multi-linha.

### Timeout do `/api/chat` — ganho real

`api/chat.js:10` usa `N8N_TIMEOUT_MS = 120000`, mas `vercel.json:18` declara
`maxDuration: 60`. Hoje a Vercel mata a função aos 60 s e o `504 CHAT_TIMEOUT` de
`api/chat.js:73-75` nunca dispara em produção. Sem esse teto, o timeout de 120 s
finalmente vale — desde que o `respondingTimeouts` do Traefik não corte antes. Verificar
no proxy do Coolify.

---

## Parte 5 — Cutover

Como a escolha foi **cutover direto** e o domínio **não muda**, algumas coisas ficam de
graça: `GOOGLE_OAUTH_REDIRECT_URI`, os Authorized Domains do Firebase Auth e o
[`cors.json`](../cors.json) do bucket do Storage **continuam válidos, sem alteração**.

Ordem:

1. Subir no Coolify e validar pelo IP/domínio temporário antes de mexer no DNS.
2. Remover `fleekauthority.com` do projeto Vercel (evita conflito de emissão de certificado).
3. Apontar o A record para o IP da VPS. Baixar o TTL algumas horas antes.
4. Confirmar o certificado e rodar a verificação da próxima seção.

**Rollback**: manter o projeto Vercel e o [`vercel.json`](../vercel.json) **intactos** — o
plano de volta é reapontar o DNS. Não deletar nada na Vercel por algumas semanas.

**CDN**: `s-maxage` / `stale-while-revalidate` em `api/sitemap.js:35` e
`api/blog-page.js:205` são ignorados por Express/Node — só uma cache compartilhada os
entende. Como nenhum dos dois define `max-age`, **toda** visita ao blog passa a bater no
Firestore e re-renderizar. Recomendo pôr o Cloudflare (DNS proxied, plano free) na frente:
ele respeita `s-maxage`, restaura o comportamento de borda e ainda tira carga de TLS da
VPS. Não é bloqueante pro cutover, mas sem isso o `/blog` fica mensuravelmente mais lento
e mais caro em leituras.

---

## Parte 6 — Endurecimento (recomendado, não bloqueante)

- **`fetch` sem timeout**: `api/business-contact.js:138` (Resend),
  `api/calendar-today.js:38` (Google Calendar) e `api/_googleOAuth.js:69` não passam
  `signal`. Antes o kill de 60 s da lambda limitava o estrago; num processo longo a
  requisição pendura indefinidamente. Adicionar `AbortSignal.timeout(...)`, como
  `api/chat.js:57` já faz.
- **`cachedAppAssets`**: `api/blog-page.js:11` memoiza o parse de `dist/index.html` pela
  vida do módulo. No container isso é *melhor* que na Vercel (o `dist` é imutável na
  imagem e o processo reinicia no deploy). Mas o `catch` em `:21-23` cacheia o fallback
  vazio **permanentemente** se a leitura falhar — o blog serviria HTML sem CSS/JS até um
  restart. Não cachear no caminho de erro.
- **`blog-media.js`**: escreve em `public/blog-uploads/` (`api/blog-media.js:17`), que não
  é servido em produção e está atrás do gate de localhost. Continua retornando `501` — sem
  mudança. Se um dia for habilitado no servidor, precisa de volume persistente no Coolify.
- **`package.json`**: `tailwindcss`, `postcss`, `autoprefixer` e `concurrently` estão em
  `dependencies` em vez de `devDependencies`, então entram no `npm ci --omit=dev` do
  runtime. Só peso de imagem, não quebra nada.
- **Deploy automático**: o [`ci.yml`](../.github/workflows/ci.yml) só faz lint/test/build.
  Dá pra chamar o webhook de deploy do Coolify após o CI passar no `main`.
- **README**: a seção "Deploy (Vercel)" e a linha "Express só para dev" ficam incorretas.

---

## Verificação

Local, antes de qualquer DNS:

```bash
npm run build
docker build -t jsw --build-arg VITE_FIREBASE_API_KEY=... .   # todas as VITE_*
docker run --rm -p 3000:3000 --env-file .env.local -e NODE_ENV=production jsw
```

Checar em `http://localhost:3000`:

- `/api/health` → `200`.
- `/` e uma rota profunda tipo `/dashboard` → servem o `index.html` (fallback SPA).
- `/assets/index-*.js` → `200` com `Cache-Control: immutable`.
- `/blog` e `/blog/<slug>` → HTML **server-rendered** com as tags de CSS/JS presentes
  (se vierem sem elas, o `cachedAppAssets` pegou o fallback vazio) e canonical em
  `fleekauthority.com`, não em `localhost`.
- `/sitemap.xml` → XML com `Content-Type: application/xml`.
- `/robots.txt`, `/og.jpg` → servidos do estático.
- `curl -H 'X-Forwarded-For: 1.2.3.4' .../api/business-contact` repetidas vezes → o rate
  limit **não** pode ser burlado trocando o header.
- Um `POST /api/blog-posts` com `X-Forwarded-Host: localhost` → tem que dar `401/403`,
  nunca passar pelo `isLocalCmsRequest`.

Suíte existente: `npm run lint && npm test` (Vitest cobre `_auth`, `_rateLimit`,
`_validate`, `_blog*`, `_usage`).

Depois do cutover, no domínio real: login Google, upload no guarda-roupa, **prova
virtual** (é o fluxo que quebra se o CORS do bucket estiver errado — ver
[`cors.json`](../cors.json)), `/api/chat` com uma pergunta longa (>60 s, pra confirmar o
ganho de timeout) e o fluxo OAuth da agenda em `/api/calendar-callback`.
