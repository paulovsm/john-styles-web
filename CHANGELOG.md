# Changelog

## V2 — Hardening + Revamp completo

Reescrita de segurança, arquitetura e produto sobre a V1. Destaques por fase:

### Segurança (P0)
- Autenticação Firebase (Admin SDK) em **todos** os endpoints `/api/*`.
- Limites de uso movidos para o **servidor** (transação atômica) — antes eram só no cliente e burláveis.
- Chat via proxy autenticado `/api/chat` (URL do n8n deixa de ir no bundle).
- CORS restrito por origem; `firestore.rules` versionado; validação de input e mitigação de prompt-injection.

### Arquitetura & débito (P1)
- Remoção de código morto (subsistema de agents), deploy unificado na Vercel.
- Estado unificado (corrige vazamento de dados entre usuários no mesmo navegador).
- Imagens do guarda-roupa no Firebase Storage (não mais base64 inline).

### Design system & UI (P2)
- Tokens de marca, remoção de widgets MUI (spinner próprio), sistema de toasts.
- Acessibilidade (focus trap em modais, `aria-*`, seletor de idioma operável por teclado), responsividade mobile, rota 404.

### i18n & produto (P3)
- i18n completo com paridade en/pt/es e **idioma persistente**.
- Base de planos `free`/`pro` e contador de uso na UI.

### Qualidade & CI (P4)
- Testes com Vitest + React Testing Library (50 testes), incluindo regressões de isolamento de usuário e gate de onboarding.
- Remoção de `console.*` no build de produção; GitHub Actions (lint + test + build).

### Revamp de produto (P5)
- **Cold start**: foto-modelo persistente, closet de exemplo (opt-in, curado por perfil), "look" como objeto reutilizável.
- **Recorrência**: dashboard como hub diário, "look do dia" com clima, assistente que age (ações clicáveis no chat).
- **Redesign**: dark mode (preferência do sistema + toggle), nova identidade (ink/paper + acento conhaque, display Fraunces), prova virtual image-first com compartilhar, onboarding guiado em passos visuais.
- **Insights**: análise de lacunas do guarda-roupa + sugestões de compra.
- **Agenda (calendar-aware)**: "look do dia" integrado ao Google Calendar (OAuth server-side + classificação por IA) — em modo Testing.

### Novas variáveis de ambiente
`FIREBASE_SERVICE_ACCOUNT`, `N8N_WEBHOOK_URL` (server), `ALLOWED_ORIGINS`,
`VITE_FIREBASE_MESSAGING_SENDER_ID`, `VITE_FIREBASE_APP_ID`,
`GOOGLE_OAUTH_CLIENT_ID`, `GOOGLE_OAUTH_CLIENT_SECRET`, `GOOGLE_OAUTH_REDIRECT_URI`,
`OAUTH_STATE_SECRET`, `APP_BASE_URL`. Veja `.env.example`.

## V1
Versão inicial: chat com assistente, gestão de guarda-roupa, análise de peças por IA, prova virtual e multilíngue.
