import { createHash } from 'node:crypto';
import { FieldValue } from 'firebase-admin/firestore';
import { getAdminDb } from './_firebaseAdmin.js';

/**
 * Fixed-window rate limiting for the endpoints anyone can call without signing
 * in. `_usage.js` covers the authenticated AI routes and keys off the uid;
 * these callers are anonymous, so the bucket key is the client address.
 *
 * IP limiting is a speed bump, not a wall — it does not stop a distributed
 * flood or rotating addresses. It does stop a single client from filling the
 * moderation queue or inflating a view counter in a loop, which is the gap it
 * exists to close.
 */
export const RATE_LIMITS_COLLECTION = 'rateLimits';

/** Anonymous writes: bucket -> { limit, windowSeconds }. */
export const RATE_LIMITS = {
    blogComment: { limit: 5, windowSeconds: 3_600 },
    blogView: { limit: 30, windowSeconds: 3_600 },
};

export class RateLimitError extends Error {
    constructor(limit, retryAfterSeconds) {
        super('Too many requests. Try again shortly.');
        this.name = 'RateLimitError';
        this.status = 429;
        this.code = 'RATE_LIMITED';
        this.limit = limit;
        this.retryAfterSeconds = retryAfterSeconds;
    }
}

/**
 * Best-effort client address. Vercel sets x-forwarded-for at the edge and
 * overwrites whatever the client sent, so the first entry is trustworthy
 * there; the local Express server falls back to the socket.
 */
export function clientIp(req) {
    const headers = req?.headers || {};
    const forwarded = headers['x-forwarded-for'] || headers['X-Forwarded-For'];
    const raw = Array.isArray(forwarded) ? forwarded[0] : forwarded;
    const first = typeof raw === 'string' ? raw.split(',')[0].trim() : '';
    if (first) return first;

    const realIp = headers['x-real-ip'];
    if (typeof realIp === 'string' && realIp.trim()) return realIp.trim();

    return req?.socket?.remoteAddress || '';
}

/**
 * Hashes the identifier so a raw address never lands in Firestore, and keeps
 * the result safe to use as a document id.
 */
export function rateLimitKey(bucket, identifier) {
    const digest = createHash('sha256').update(`${bucket}:${identifier}`).digest('hex');
    return `${bucket}_${digest.slice(0, 32)}`;
}

/**
 * Atomically consumes one unit of an anonymous bucket.
 * Throws RateLimitError(429) once the window is exhausted.
 *
 * Requests we cannot attribute share a single 'unknown' bucket rather than
 * going unlimited, so stripping headers cannot buy a free pass.
 */
export async function consumeRateLimit(bucket, identifier, { now = Date.now(), db } = {}) {
    const config = RATE_LIMITS[bucket];
    if (!config) throw new Error(`Unknown rate limit bucket: ${bucket}`);

    const { limit, windowSeconds } = config;
    const windowMs = windowSeconds * 1_000;
    const windowStart = Math.floor(now / windowMs) * windowMs;
    const database = db || getAdminDb();
    const ref = database.collection(RATE_LIMITS_COLLECTION).doc(rateLimitKey(bucket, identifier || 'unknown'));

    return database.runTransaction(async (tx) => {
        const snapshot = await tx.get(ref);
        const data = snapshot.exists ? snapshot.data() : {};
        const count = data.windowStart === windowStart ? (data.count || 0) : 0;

        if (count >= limit) {
            throw new RateLimitError(limit, Math.max(1, Math.ceil((windowStart + windowMs - now) / 1_000)));
        }

        tx.set(ref, { windowStart, count: count + 1, updatedAt: FieldValue.serverTimestamp() }, { merge: true });
        return { remaining: limit - (count + 1), limit };
    });
}

/** Applies the 429 response shape, including Retry-After. */
export function handleRateLimitError(res, error, sendError) {
    if (!(error instanceof RateLimitError)) return false;
    res.setHeader('Retry-After', String(error.retryAfterSeconds));
    sendError(res, error.status, error.code, error.message);
    return true;
}
