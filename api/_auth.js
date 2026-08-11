import { getAdminAuth } from './_firebaseAdmin.js';

/**
 * Verifies the Firebase ID token from the Authorization header.
 *
 * @param {import('http').IncomingMessage} req
 * @returns {Promise<{uid: string, token: import('firebase-admin/auth').DecodedIdToken}>}
 * @throws {AuthError} with a `.status` when auth fails
 */
export async function requireAuth(req) {
    const header = req.headers.authorization || req.headers.Authorization || '';
    const match = /^Bearer\s+(.+)$/i.exec(header);

    if (!match) {
        throw new AuthError(401, 'Missing or malformed Authorization header');
    }

    const idToken = match[1].trim();

    let adminAuth;
    try {
        adminAuth = getAdminAuth();
    } catch (err) {
        // Misconfiguration is a server error, but its details must stay in server logs.
        console.error('Firebase Admin authentication is unavailable:', err);
        throw new AuthError(500, 'Authentication service unavailable');
    }

    try {
        const decoded = await adminAuth.verifyIdToken(idToken);
        return { uid: decoded.uid, token: decoded };
    } catch {
        throw new AuthError(401, 'Invalid or expired token');
    }
}

export class AuthError extends Error {
    constructor(status, message) {
        super(message);
        this.name = 'AuthError';
        this.status = status;
    }
}

/**
 * Helper to turn an AuthError (or any error) into a JSON response.
 * @returns {boolean} true if a response was sent
 */
export function handleAuthError(res, err) {
    if (err instanceof AuthError) {
        res.status(err.status).json({ error: 'UNAUTHORIZED', message: err.message });
        return true;
    }
    return false;
}
