import { auth } from '../auth/firebaseConfig';

/**
 * fetch wrapper that attaches the current user's Firebase ID token as a
 * Bearer Authorization header. All calls to our /api endpoints must be
 * authenticated, so this is the single place that adds the token.
 *
 * @param {string} url
 * @param {RequestInit} [options]
 */
export async function authFetch(url, options = {}) {
    const user = auth.currentUser;
    if (!user) {
        throw new Error('Not authenticated');
    }

    const token = await user.getIdToken();

    const headers = {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
        Authorization: `Bearer ${token}`,
    };

    return fetch(url, { ...options, headers });
}
