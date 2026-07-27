import crypto from 'crypto';

/**
 * Server-side Google OAuth 2.0 (Authorization Code + offline access) to read the
 * user's Google Calendar. Separate from Firebase Auth's Google sign-in: this
 * flow yields a REFRESH token we store server-side so we can read the calendar
 * any time (and, later, run a scheduled "morning scan").
 *
 * Required env:
 *  - GOOGLE_OAUTH_CLIENT_ID / GOOGLE_OAUTH_CLIENT_SECRET  (a Web OAuth client)
 *  - GOOGLE_OAUTH_REDIRECT_URI  (must match the client's authorized redirect)
 *  - OAUTH_STATE_SECRET  (HMAC secret to sign the OAuth `state`)
 *  - APP_BASE_URL  (where to send the user back after the callback)
 */
export const CALENDAR_SCOPE = 'https://www.googleapis.com/auth/calendar.readonly';

export function oauthConfigured() {
    return Boolean(
        process.env.GOOGLE_OAUTH_CLIENT_ID &&
        process.env.GOOGLE_OAUTH_CLIENT_SECRET &&
        process.env.GOOGLE_OAUTH_REDIRECT_URI
    );
}

// --- state signing (so the public callback can trust the uid) ---
export function signState(uid) {
    const payload = `${uid}.${Date.now()}`;
    const sig = crypto
        .createHmac('sha256', process.env.OAUTH_STATE_SECRET || 'dev-secret')
        .update(payload)
        .digest('base64url');
    return `${Buffer.from(payload).toString('base64url')}.${sig}`;
}

export function verifyState(state) {
    if (!state || typeof state !== 'string') return null;
    const [b64, sig] = state.split('.');
    if (!b64 || !sig) return null;
    const payload = Buffer.from(b64, 'base64url').toString('utf8');
    const expected = crypto
        .createHmac('sha256', process.env.OAUTH_STATE_SECRET || 'dev-secret')
        .update(payload)
        .digest('base64url');
    if (sig !== expected) return null;
    const [uid, ts] = payload.split('.');
    // Reject states older than 15 minutes.
    if (!uid || Date.now() - Number(ts) > 15 * 60 * 1000) return null;
    return uid;
}

export function buildAuthUrl(state) {
    const params = new URLSearchParams({
        client_id: process.env.GOOGLE_OAUTH_CLIENT_ID,
        redirect_uri: process.env.GOOGLE_OAUTH_REDIRECT_URI,
        response_type: 'code',
        scope: CALENDAR_SCOPE,
        access_type: 'offline',
        include_granted_scopes: 'true',
        prompt: 'consent',
        state,
    });
    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

export async function exchangeCode(code) {
    const res = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            code,
            client_id: process.env.GOOGLE_OAUTH_CLIENT_ID,
            client_secret: process.env.GOOGLE_OAUTH_CLIENT_SECRET,
            redirect_uri: process.env.GOOGLE_OAUTH_REDIRECT_URI,
            grant_type: 'authorization_code',
        }),
    });
    if (!res.ok) throw new Error(`Token exchange failed: ${res.status}`);
    return res.json(); // { access_token, refresh_token, expires_in, ... }
}

export async function refreshAccessToken(refreshToken) {
    const res = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            refresh_token: refreshToken,
            client_id: process.env.GOOGLE_OAUTH_CLIENT_ID,
            client_secret: process.env.GOOGLE_OAUTH_CLIENT_SECRET,
            grant_type: 'refresh_token',
        }),
    });
    if (!res.ok) throw new Error(`Token refresh failed: ${res.status}`);
    return res.json(); // { access_token, expires_in, ... }
}
