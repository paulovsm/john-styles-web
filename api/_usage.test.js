import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock Firestore FieldValue + the Admin DB accessor before importing the module.
vi.mock('firebase-admin/firestore', () => ({
    FieldValue: { serverTimestamp: () => 'TS' },
}));

const state = { profile: { plan: 'free' }, usage: null };

function makeDb() {
    const makeRef = (path) => ({
        path,
        get: async () => {
            if (path.endsWith('/profile')) return { exists: true, data: () => state.profile };
            return { exists: state.usage != null, data: () => state.usage };
        },
    });
    return {
        doc: (path) => makeRef(path),
        runTransaction: async (cb) => cb({
            get: (ref) => ref.get(),
            set: (ref, data) => { state.usage = { ...(state.usage || {}), ...data }; },
        }),
    };
}

vi.mock('./_firebaseAdmin.js', () => ({ getAdminDb: () => makeDb() }));

import { consumeUsage, UsageLimitError } from './_usage.js';

const today = new Date().toISOString().split('T')[0];

beforeEach(() => {
    state.profile = { plan: 'free' };
    state.usage = null;
});

describe('consumeUsage', () => {
    it('consumes one unit on a fresh day and reports remaining', async () => {
        const res = await consumeUsage('u1', 'lookGeneration');
        expect(res).toEqual({ remaining: 4, limit: 5 });
        expect(state.usage.lookGeneration).toBe(1);
        expect(state.usage.lastReset).toBe(today);
    });

    it('throws UsageLimitError when the daily limit is reached', async () => {
        state.usage = { lastReset: today, lookGeneration: 5 };
        await expect(consumeUsage('u1', 'lookGeneration')).rejects.toBeInstanceOf(UsageLimitError);
        // The counter is not incremented past the limit.
        expect(state.usage.lookGeneration).toBe(5);
    });

    it('resets counters when the day rolls over', async () => {
        state.usage = { lastReset: '2000-01-01', lookGeneration: 5 };
        const res = await consumeUsage('u1', 'lookGeneration');
        expect(res).toEqual({ remaining: 4, limit: 5 });
        expect(state.usage.lookGeneration).toBe(1);
        expect(state.usage.lastReset).toBe(today);
    });

    it('uses the higher pro-plan limits', async () => {
        state.profile = { plan: 'pro' };
        const res = await consumeUsage('u1', 'lookGeneration');
        expect(res.limit).toBe(100);
        expect(res.remaining).toBe(99);
    });
});
