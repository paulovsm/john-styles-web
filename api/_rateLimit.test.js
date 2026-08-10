import { describe, expect, it, vi } from 'vitest';

vi.mock('./_firebaseAdmin.js', () => ({ getAdminDb: vi.fn() }));
vi.mock('firebase-admin/firestore', () => ({
    FieldValue: { serverTimestamp: () => 'ts' },
}));

import {
    RATE_LIMITS,
    RateLimitError,
    clientIp,
    consumeRateLimit,
    handleRateLimitError,
    rateLimitKey,
} from './_rateLimit.js';

/** Minimal in-memory stand-in for the Firestore transaction API. */
function fakeDb(store = new Map()) {
    return {
        store,
        collection: () => ({ doc: (id) => ({ id }) }),
        runTransaction: async (fn) => fn({
            get: async (ref) => {
                const data = store.get(ref.id);
                return { exists: data !== undefined, data: () => data };
            },
            set: (ref, value) => store.set(ref.id, { ...(store.get(ref.id) || {}), ...value }),
        }),
    };
}

describe('clientIp', () => {
    it('takes the first entry of x-forwarded-for', () => {
        expect(clientIp({ headers: { 'x-forwarded-for': '203.0.113.7, 70.41.3.18' } })).toBe('203.0.113.7');
    });

    it('falls back to x-real-ip and then the socket', () => {
        expect(clientIp({ headers: { 'x-real-ip': '198.51.100.4' } })).toBe('198.51.100.4');
        expect(clientIp({ headers: {}, socket: { remoteAddress: '::1' } })).toBe('::1');
        expect(clientIp({})).toBe('');
    });
});

describe('rateLimitKey', () => {
    it('hashes the identifier instead of storing it', () => {
        const key = rateLimitKey('blogComment', '203.0.113.7');
        expect(key.startsWith('blogComment_')).toBe(true);
        expect(key).not.toContain('203.0.113.7');
    });

    it('separates buckets for the same address', () => {
        expect(rateLimitKey('blogComment', '203.0.113.7')).not.toBe(rateLimitKey('blogView', '203.0.113.7'));
    });
});

describe('consumeRateLimit', () => {
    it('allows up to the limit and then rejects', async () => {
        const db = fakeDb();
        const { limit } = RATE_LIMITS.blogComment;

        for (let i = 0; i < limit; i += 1) {
            const result = await consumeRateLimit('blogComment', '203.0.113.7', { db, now: 1_000_000 });
            expect(result.remaining).toBe(limit - (i + 1));
        }

        await expect(consumeRateLimit('blogComment', '203.0.113.7', { db, now: 1_000_000 }))
            .rejects.toMatchObject({ name: 'RateLimitError', status: 429, code: 'RATE_LIMITED' });
    });

    it('starts a fresh window once the old one elapses', async () => {
        const db = fakeDb();
        const { limit, windowSeconds } = RATE_LIMITS.blogComment;
        const start = 1_000_000;

        for (let i = 0; i < limit; i += 1) {
            await consumeRateLimit('blogComment', '203.0.113.7', { db, now: start });
        }
        await expect(consumeRateLimit('blogComment', '203.0.113.7', { db, now: start }))
            .rejects.toBeInstanceOf(RateLimitError);

        const next = start + (windowSeconds * 1_000) * 2;
        await expect(consumeRateLimit('blogComment', '203.0.113.7', { db, now: next }))
            .resolves.toMatchObject({ remaining: limit - 1 });
    });

    it('keeps separate counters per address and per bucket', async () => {
        const db = fakeDb();
        await consumeRateLimit('blogComment', '203.0.113.7', { db, now: 1_000_000 });

        await expect(consumeRateLimit('blogComment', '198.51.100.4', { db, now: 1_000_000 }))
            .resolves.toMatchObject({ remaining: RATE_LIMITS.blogComment.limit - 1 });
        await expect(consumeRateLimit('blogView', '203.0.113.7', { db, now: 1_000_000 }))
            .resolves.toMatchObject({ remaining: RATE_LIMITS.blogView.limit - 1 });
    });

    it('pools unattributable requests instead of letting them through unlimited', async () => {
        const db = fakeDb();
        const { limit } = RATE_LIMITS.blogView;

        for (let i = 0; i < limit; i += 1) {
            await consumeRateLimit('blogView', '', { db, now: 1_000_000 });
        }
        await expect(consumeRateLimit('blogView', undefined, { db, now: 1_000_000 }))
            .rejects.toBeInstanceOf(RateLimitError);
    });

    it('rejects an unknown bucket', async () => {
        await expect(consumeRateLimit('nope', '203.0.113.7', { db: fakeDb() })).rejects.toThrow(/Unknown rate limit bucket/);
    });
});

describe('handleRateLimitError', () => {
    it('sets Retry-After and the 429 body', () => {
        const res = { setHeader: vi.fn() };
        const sendError = vi.fn();

        expect(handleRateLimitError(res, new RateLimitError(5, 42), sendError)).toBe(true);
        expect(res.setHeader).toHaveBeenCalledWith('Retry-After', '42');
        expect(sendError).toHaveBeenCalledWith(res, 429, 'RATE_LIMITED', expect.any(String));
    });

    it('ignores unrelated errors', () => {
        const sendError = vi.fn();
        expect(handleRateLimitError({ setHeader: vi.fn() }, new Error('boom'), sendError)).toBe(false);
        expect(sendError).not.toHaveBeenCalled();
    });
});
