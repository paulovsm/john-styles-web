# Google Calendar integration — setup

The "outfit of the day" can read the user's Google Calendar to suggest a look
that matches their day. This uses a **server-side OAuth 2.0 flow** (offline
access + refresh token), separate from Firebase's Google sign-in.

## 1. Create an OAuth 2.0 Web client

1. Go to **Google Cloud Console → APIs & Services**.
2. **Enable the Google Calendar API** for the project.
3. **OAuth consent screen**: configure it (External is fine for testing; add your
   test users while in "Testing" mode). Add the scope
   `https://www.googleapis.com/auth/calendar.readonly`.
4. **Credentials → Create credentials → OAuth client ID → Web application**.
5. Add **Authorized redirect URIs**:
   - Dev: `http://localhost:3000/api/calendar-callback`
   - Prod: `https://<your-domain>/api/calendar-callback`
6. Copy the **Client ID** and **Client secret**.

## 2. Environment variables

Add to `.env.local` (dev) and to the Vercel project (prod):

```
GOOGLE_OAUTH_CLIENT_ID=<client id>
GOOGLE_OAUTH_CLIENT_SECRET=<client secret>
GOOGLE_OAUTH_REDIRECT_URI=http://localhost:3000/api/calendar-callback   # prod: https://<domain>/api/calendar-callback
OAUTH_STATE_SECRET=<a long random string>
APP_BASE_URL=http://localhost:5173                                       # prod: https://<domain>
```

`OAUTH_STATE_SECRET` signs the OAuth `state` so the public callback can trust the
user id. Use any long random value (e.g. `openssl rand -hex 32`).

## 3. How it works

- **Connect**: the dashboard shows "Connect Google Calendar". It calls
  `POST /api/calendar-connect` (authenticated), which returns the Google consent
  URL with a signed `state`, and the browser is redirected to Google.
- **Callback**: Google redirects to `/api/calendar-callback` with a `code`. The
  server verifies the `state`, exchanges the code for tokens, and stores the
  **refresh token** at `users/{uid}/private/googleCalendar` (Admin SDK only —
  Firestore rules deny client access). The user is bounced back to
  `/dashboard?calendar=connected`.
- **Daily context**: `POST /api/calendar-today` refreshes an access token, lists
  today's events, and asks Gemini to classify the day
  (`occasion`, `formality` 1–5, a short `headline`). The result is cached once
  per day per user. The dashboard uses `formality` to bias the outfit pick and
  shows the headline.

## Notes / limitations

- This is an on-open experience (no background "morning scan"); a scheduled scan
  + push notifications would need a cron job and is a future enhancement.
- On Vercel Hobby, functions cap at 60s; the classification call is quick and
  cached daily, so this is not a concern in practice.
- To fully disconnect, delete `users/{uid}/private/googleCalendar` (a
  `calendar-disconnect` endpoint can be added if needed).
