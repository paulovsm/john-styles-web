import { getAdminDb } from './_firebaseAdmin.js';
import { FieldValue } from 'firebase-admin/firestore';

/**
 * Server-side daily usage limits. This is the single source of truth —
 * the client only displays what the server returns and can no longer
 * bypass limits by calling the API directly or editing its own doc.
 *
 * Limits can later become a function of the user's plan (free/paid) by
 * reading a `plan` field from the profile; the shape is kept ready for that.
 */
export const DEFAULT_LIMITS = {
    wardrobeAnalysis: 5,
    lookGeneration: 5,
    chat: 100,
};

function todayKey() {
    return new Date().toISOString().split('T')[0]; // YYYY-MM-DD (UTC)
}

/**
 * Atomically checks and consumes one unit of the given limit type.
 * Throws UsageLimitError(429) when the daily limit is exhausted.
 *
 * @param {string} uid
 * @param {keyof typeof DEFAULT_LIMITS} limitType
 * @returns {Promise<{remaining: number, limit: number}>}
 */
export async function consumeUsage(uid, limitType) {
    const limit = DEFAULT_LIMITS[limitType];
    if (limit === undefined) {
        throw new Error(`Unknown limit type: ${limitType}`);
    }

    const db = getAdminDb();
    const ref = db.doc(`users/${uid}/data/usageLimits`);
    const today = todayKey();

    return db.runTransaction(async (tx) => {
        const snap = await tx.get(ref);
        const data = snap.exists ? snap.data() : {};

        // Reset counters when the day rolls over.
        const isNewDay = data.lastReset !== today;
        const current = isNewDay ? 0 : (data[limitType] || 0);

        if (current >= limit) {
            throw new UsageLimitError(limitType, limit);
        }

        const updated = {
            lastReset: today,
            [limitType]: current + 1,
        };
        // On a new day, zero out the other counters too.
        if (isNewDay) {
            for (const key of Object.keys(DEFAULT_LIMITS)) {
                if (key !== limitType) updated[key] = 0;
            }
        }

        tx.set(ref, { ...updated, updatedAt: FieldValue.serverTimestamp() }, { merge: true });

        return { remaining: limit - (current + 1), limit };
    });
}

export class UsageLimitError extends Error {
    constructor(limitType, limit) {
        super(`Daily limit reached for ${limitType} (${limit}/${limit})`);
        this.name = 'UsageLimitError';
        this.status = 429;
        this.limitType = limitType;
        this.limit = limit;
    }
}
