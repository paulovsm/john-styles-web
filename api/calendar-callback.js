import { verifyState, exchangeCode } from './_googleOAuth.js';
import { saveRefreshToken } from './_calendarStore.js';

/**
 * Public Google OAuth redirect target. Verifies the signed state, exchanges the
 * code for tokens, stores the refresh token server-side, then bounces the user
 * back into the app. No Firebase token here — trust comes from the signed state.
 */
export default async function handler(req, res) {
    const appBase = (process.env.APP_BASE_URL || 'http://localhost:5173').replace(/\/$/, '');
    let returnPath = '/dashboard';
    const back = (status) => {
        res.writeHead(302, { Location: `${appBase}${returnPath}?calendar=${status}` });
        res.end();
    };

    try {
        if (req.method !== 'GET') return res.status(405).end();

        const { code, state, error } = req.query || {};
        if (error) return back('denied');

        const verified = verifyState(state);
        if (!verified || !code) return back('error');
        returnPath = verified.returnPath;

        const tokens = await exchangeCode(code);
        if (!tokens.refresh_token) {
            // Happens if the user previously consented without revoking; ask them
            // to reconnect (prompt=consent should normally force a new one).
            return back('noRefresh');
        }

        await saveRefreshToken(verified.uid, tokens.refresh_token);
        return back('connected');
    } catch (err) {
        console.error('calendar-callback error:', err);
        return back('error');
    }
}
