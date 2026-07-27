import { getAdminDb } from './_firebaseAdmin.js';
import { FieldValue } from 'firebase-admin/firestore';

// Refresh token + cached daily context live under a server-only path
// (users/{uid}/private/**), which Firestore rules deny to clients.
const ref = (uid) => getAdminDb().doc(`users/${uid}/private/googleCalendar`);

export async function saveRefreshToken(uid, refreshToken) {
    await ref(uid).set(
        { refreshToken, connectedAt: FieldValue.serverTimestamp() },
        { merge: true }
    );
}

export async function getRefreshToken(uid) {
    const snap = await ref(uid).get();
    return snap.exists ? snap.data().refreshToken || null : null;
}

export async function disconnect(uid) {
    await ref(uid).delete();
}

/** Cache the classified day context so we only hit the LLM once per day. */
export async function getCachedContext(uid, dayKey) {
    const snap = await ref(uid).get();
    if (!snap.exists) return null;
    const data = snap.data();
    return data.contextDay === dayKey ? data.context : null;
}

export async function setCachedContext(uid, dayKey, context) {
    await ref(uid).set({ contextDay: dayKey, context }, { merge: true });
}
