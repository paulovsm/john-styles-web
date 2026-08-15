import { describe, it, expect, vi } from 'vitest';

// The module pulls in the Firebase SDK at import time; the unit under test is
// pure, so stub the app/config module rather than booting Firebase.
vi.mock('../auth/firebaseConfig', () => ({ db: {}, storage: {}, auth: {} }));

import { isUnchanged } from './firestoreService';

/**
 * isUnchanged() decides whether a wardrobe write can be skipped during sync.
 * A wrong "true" silently drops a user's edit, so these tests focus on it
 * failing safe.
 */
describe('isUnchanged', () => {
    const item = { id: '1', name: 'Camisa branca', category: 'tops', colors: ['Branco'] };

    it('skips the write when the stored item is identical', () => {
        expect(isUnchanged(item, { ...item })).toBe(true);
    });

    it('ignores the server-written updatedAt', () => {
        expect(isUnchanged(item, { ...item, updatedAt: 'anything' })).toBe(true);
        expect(isUnchanged({ ...item, updatedAt: 'x' }, { ...item, updatedAt: 'y' })).toBe(true);
    });

    it('writes when a value changed', () => {
        expect(isUnchanged(item, { ...item, name: 'Camisa azul' })).toBe(false);
        expect(isUnchanged(item, { ...item, colors: ['Azul'] })).toBe(false);
    });

    it('writes when a field was added or removed', () => {
        expect(isUnchanged({ ...item, brand: 'Fleek' }, item)).toBe(false);
        const { colors, ...withoutColors } = item;
        expect(isUnchanged(withoutColors, item)).toBe(false);
    });

    it('writes when the item is not in the cloud yet', () => {
        expect(isUnchanged(item, undefined)).toBe(false);
        expect(isUnchanged(item, null)).toBe(false);
    });

    it('writes when a value cannot be compared reliably (e.g. a Timestamp)', () => {
        // Firestore hands back rich objects; they must never be assumed equal.
        expect(isUnchanged({ ...item, createdAt: {} }, { ...item, createdAt: {} })).toBe(false);
        expect(isUnchanged(item, { ...item, createdAt: { toDate: () => new Date() } })).toBe(false);
    });

    it('never throws — an unusable input means "write it"', () => {
        expect(isUnchanged(item, 'not-an-object')).toBe(false);
        expect(isUnchanged(Object.create(null), undefined)).toBe(false);
    });
});
