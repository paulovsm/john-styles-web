import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

/**
 * Lazily initialize the Firebase Admin SDK from a service account.
 *
 * Provide the service account JSON via the FIREBASE_SERVICE_ACCOUNT env var
 * (the full JSON string, or a base64-encoded version of it). This is required
 * for verifying ID tokens and for server-side Firestore writes (usage limits).
 *
 * Never expose these credentials to the client — this module runs only in the
 * serverless functions / dev proxy.
 */
let adminApp = null;

function parseServiceAccount() {
    const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
    if (!raw) return null;

    let jsonStr = raw.trim();
    // Support base64-encoded service accounts (convenient for env vars).
    if (!jsonStr.startsWith('{')) {
        try {
            jsonStr = Buffer.from(jsonStr, 'base64').toString('utf8');
        } catch {
            return null;
        }
    }

    try {
        const parsed = JSON.parse(jsonStr);
        // Handle escaped newlines in the private key when set via env.
        if (parsed.private_key) {
            parsed.private_key = parsed.private_key.replace(/\\n/g, '\n');
        }
        return parsed;
    } catch {
        return null;
    }
}

/**
 * @returns {import('firebase-admin/app').App}
 * @throws {Error} if FIREBASE_SERVICE_ACCOUNT is missing/invalid
 */
export function getAdminApp() {
    if (adminApp) return adminApp;

    const existing = getApps();
    if (existing.length > 0) {
        adminApp = existing[0];
        return adminApp;
    }

    const serviceAccount = parseServiceAccount();
    if (!serviceAccount) {
        throw new Error(
            'FIREBASE_SERVICE_ACCOUNT is not configured or is invalid. ' +
            'Set it to the service account JSON (or base64 of it) in your environment.'
        );
    }

    adminApp = initializeApp({ credential: cert(serviceAccount) });
    return adminApp;
}

export function getAdminAuth() {
    return getAuth(getAdminApp());
}

export function getAdminDb() {
    return getFirestore(getAdminApp());
}
