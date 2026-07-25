import { getAdminDb } from './_firebaseAdmin.js';
import { FieldValue } from 'firebase-admin/firestore';

/**
 * Server-side daily usage limits. This is the single source of truth —
 * the client only displays what the server returns and can no longer
 * bypass limits by calling the API directly or editing its own doc.
 *
 * Limits are a function of the user's plan (read from the profile's `plan`
 * field, default 'free'). Adding a paid tier later is just a matter of
 * assigning the plan and, eventually, wiring billing — no shape changes.
 */
export const PLAN_LIMITS = {
    free: { wardrobeAnalysis: 5, lookGeneration: 5, chat: 100 },
    pro: { wardrobeAnalysis: 100, lookGeneration: 100, chat: 1000 },
};

export const DEFAULT_LIMITS = PLAN_LIMITS.free;

function todayKey() {
    return new Date().toISOString().split('T')[0]; // YYYY-MM-DD (UTC)
}

async function getPlanLimits(db, uid) {
    try {
        const snap = await db.doc(`users/${uid}/data/profile`).get();
        const plan = (snap.exists && snap.data().plan) || 'free';
        return PLAN_LIMITS[plan] || PLAN_LIMITS.free;
    } catch {
        return PLAN_LIMITS.free;
    }
}

/**
 * Atomically checks and consumes one unit of the given limit type.
 * Throws UsageLimitError(429) when the daily limit is exhausted.
 *
 * @param {string} uid
 * @param {'wardrobeAnalysis'|'lookGeneration'|'chat'} limitType
 * @returns {Promise<{remaining: number, limit: number}>}
 */
export async function consumeUsage(uid, limitType) {
    const db = getAdminDb();
    const limits = await getPlanLimits(db, uid);
    const limit = limits[limitType];
    if (limit === undefined) {
        throw new Error(`Unknown limit type: ${limitType}`);
    }

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
