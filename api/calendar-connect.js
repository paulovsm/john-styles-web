import { applyCors } from './_cors.js';
import { requireAuth, handleAuthError } from './_auth.js';
import { oauthConfigured, signState, buildAuthUrl } from './_googleOAuth.js';

/**
 * Returns the Google consent URL for connecting the user's calendar.
 * The uid is signed into `state` so the (public) callback can trust it.
 */
export default async function handler(req, res) {
    if (applyCors(req, res)) return;
    if (req.method !== 'POST' && req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    if (!oauthConfigured()) {
        return res.status(500).json({ error: 'Calendar OAuth not configured' });
    }
    try {
        const { uid } = await requireAuth(req);
        const url = buildAuthUrl(signState(uid));
        return res.status(200).json({ url });
    } catch (error) {
        if (handleAuthError(res, error)) return;
        console.error('calendar-connect error:', error);
        return res.status(500).json({ error: 'Failed to build auth URL' });
    }
}
