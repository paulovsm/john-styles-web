# John Styles — Personal Fashion Assistant

Assistente pessoal de moda: organize seu guarda-roupa, receba recomendações de
estilo por IA, prove looks (prova virtual) e converse com o "John". Powered by
Google Gemini + Firebase.

## Features

- **Onboarding guiado**: passos visuais (arquétipos, cores, ocasiões, tipo de corpo).
- **Guarda-roupa**: upload + análise automática de peças por IA; closet de exemplo opt-in.
- **Prova virtual (image-first)**: foto-modelo persistente, geração do look e compartilhamento.
- **Looks salvos**: combinações reutilizáveis + galeria.
- **Dashboard/hub**: "look do dia" (com clima e, opcionalmente, sua Google Agenda), atividade recente e insights do guarda-roupa.
- **Chat com o John**: assistente (via n8n) que pode sugerir ações (provar um look, etc.).
- **Dark mode** (sistema + toggle) e **multilíngue** (en/pt/es).

## Tech stack

- **Frontend**: React 19, Vite, Tailwind CSS, react-i18next.
- **Backend**: Vercel Serverless Functions (`api/*.js`), Express só para dev (`server.js`).
- **Dados/Auth**: Firebase (Auth, Firestore, Storage) + Firebase Admin no servidor.
- **IA**: Google Gemini (`@google/genai`); chat via webhook n8n.
- **Testes**: Vitest + React Testing Library.

## Arquitetura (resumo)

- Os endpoints `api/*.js` exigem um **Firebase ID token** (`Authorization: Bearer`),
  aplicam **limites de uso server-side** e mantêm segredos (chave Gemini, webhook
  n8n) fora do cliente. Helpers compartilhados começam com `_` (ex.: `api/_auth.js`).
- Regras de acesso versionadas em `firestore.rules` / `storage.rules`
  (`firebase.json`). O caminho `users/{uid}/private/**` é somente-servidor.
- Integração de agenda: OAuth 2.0 server-side (ver `docs/google-calendar-setup.md`).

## Getting started

### Pré-requisitos
- Node.js 18+ (dev usa Node 22).

### Instalação
```bash
npm install
cp .env.example .env.local   # preencha os valores (ver abaixo)
npm run dev                  # sobe Vite + o proxy de API (server.js)
```

### Variáveis de ambiente
Preencha `.env.local` a partir de `.env.example`. Server-side (nunca com prefixo `VITE_`):
- `GOOGLE_AI_API_KEY` — chave do Gemini.
- `FIREBASE_SERVICE_ACCOUNT` — JSON (ou base64) da service account do Firebase Admin. **Obrigatório** para auth dos endpoints + limites.
- `N8N_WEBHOOK_URL` — webhook do agente de chat (proxied por `/api/chat`).
- `ALLOWED_ORIGINS` — origens permitidas para CORS em produção.
- Agenda (opcional): `GOOGLE_OAUTH_CLIENT_ID`, `GOOGLE_OAUTH_CLIENT_SECRET`, `GOOGLE_OAUTH_REDIRECT_URI`, `OAUTH_STATE_SECRET`, `APP_BASE_URL` — ver `docs/google-calendar-setup.md`.

Client-side (`VITE_` — vão no bundle; chaves Firebase web não são segredo): `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_STORAGE_BUCKET`, `VITE_FIREBASE_MESSAGING_SENDER_ID`, `VITE_FIREBASE_APP_ID`.

## Scripts
- `npm run dev` — frontend + proxy de API.
- `npm run build` — build de produção.
- `npm run lint` — ESLint.
- `npm test` / `npm run test:watch` — testes (Vitest).

## Deploy (Vercel)
1. Configure as variáveis de ambiente no projeto Vercel (mesmos nomes acima; use a URL de produção em `ALLOWED_ORIGINS`/`APP_BASE_URL`/`GOOGLE_OAUTH_REDIRECT_URI`).
2. Publique as regras do Firebase: `firebase deploy --only firestore:rules,storage`.
3. Se usar a agenda, adicione `https://<seu-domínio>/api/calendar-callback` aos redirect URIs do OAuth Client.

## Licença
[MIT](LICENSE)
