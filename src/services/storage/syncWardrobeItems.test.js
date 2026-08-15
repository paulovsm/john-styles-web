import { describe, it, expect, beforeEach, vi } from 'vitest';

/**
 * syncWardrobeItems now skips unchanged documents and batches the rest. The
 * optimisation is only safe if the cloud still ends up matching the local list
 * exactly, so these drive the whole function against a fake Firestore and
 * assert on the operations it emits.
 */

vi.mock('../auth/firebaseConfig', () => ({ db: {}, storage: {}, auth: { currentUser: null } }));

// Records every batched operation so a test can assert what was actually sent.
const batches = [];

vi.mock('firebase/firestore', () => ({
    collection: (...path) => ({ path }),
    doc: (_db, ...path) => ({ id: path[path.length - 1], path: path.join('/') }),
    getDoc: vi.fn(),
    getDocs: vi.fn(),
    setDoc: vi.fn(),
    deleteDoc: vi.fn(),
    addDoc: vi.fn(),
    serverTimestamp: () => '__serverTimestamp__',
    query: (ref, ...constraints) => ({ ref, constraints }),
    orderBy: (f) => ({ type: 'orderBy', f }),
    limit: (n) => ({ type: 'limit', n }),
    writeBatch: () => {
        const ops = [];
        batches.push(ops);
        return {
            set: (ref, data) => ops.push({ type: 'set', id: ref.id, data }),
            delete: (ref) => ops.push({ type: 'delete', id: ref.id }),
            commit: vi.fn().mockResolvedValue(undefined),
        };
    },
}));

import { getDocs } from 'firebase/firestore';
import { firestoreService } from './firestoreService';

/** Shapes a fake querySnapshot over the given id -> data map. */
const snapshotOf = (docsBysId) => ({
    forEach: (fn) => Object.entries(docsBysId).forEach(([id, data]) => fn({ id, data: () => data })),
});

const allOps = () => batches.flat();

describe('syncWardrobeItems', () => {
    beforeEach(() => {
        batches.length = 0;
        vi.clearAllMocks();
    });

    const shirt = { id: 'a', name: 'Camisa branca', category: 'tops', colors: ['Branco'] };
    const pants = { id: 'b', name: 'Calça chino', category: 'bottoms', colors: ['Bege'] };

    it('writes nothing when every item already matches the cloud', async () => {
        getDocs.mockResolvedValue(snapshotOf({ a: { ...shirt }, b: { ...pants } }));

        await firestoreService.syncWardrobeItems([shirt, pants], 'u1');

        expect(allOps()).toEqual([]);
    });

    it('writes only the item that changed, leaving the rest untouched', async () => {
        getDocs.mockResolvedValue(snapshotOf({ a: { ...shirt }, b: { ...pants } }));

        const edited = { ...pants, name: 'Calça alfaiataria' };
        await firestoreService.syncWardrobeItems([shirt, edited], 'u1');

        const ops = allOps();
        expect(ops).toHaveLength(1);
        expect(ops[0].type).toBe('set');
        expect(ops[0].id).toBe('b');
        expect(ops[0].data.name).toBe('Calça alfaiataria');
    });

    it('writes an item the cloud has never seen', async () => {
        getDocs.mockResolvedValue(snapshotOf({ a: { ...shirt } }));

        await firestoreService.syncWardrobeItems([shirt, pants], 'u1');

        expect(allOps()).toEqual([
            expect.objectContaining({ type: 'set', id: 'b' }),
        ]);
    });

    it('deletes cloud items that are gone locally', async () => {
        getDocs.mockResolvedValue(snapshotOf({ a: { ...shirt }, b: { ...pants } }));

        await firestoreService.syncWardrobeItems([shirt], 'u1');

        expect(allOps()).toEqual([{ type: 'delete', id: 'b' }]);
    });

    it('converges: an edit, an addition and a deletion in one sync', async () => {
        getDocs.mockResolvedValue(snapshotOf({ a: { ...shirt }, b: { ...pants } }));

        const edited = { ...shirt, colors: ['Azul'] };
        const shoes = { id: 'c', name: 'Derby', category: 'shoes', colors: ['Marrom'] };
        await firestoreService.syncWardrobeItems([edited, shoes], 'u1');

        const ops = allOps();
        expect(ops.filter((o) => o.type === 'set').map((o) => o.id).sort()).toEqual(['a', 'c']);
        expect(ops.filter((o) => o.type === 'delete').map((o) => o.id)).toEqual(['b']);
    });

    it('stamps updatedAt server-side on every write', async () => {
        getDocs.mockResolvedValue(snapshotOf({}));

        await firestoreService.syncWardrobeItems([shirt], 'u1');

        expect(allOps()[0].data.updatedAt).toBe('__serverTimestamp__');
    });

    it('splits past Firestore\'s 500-operation batch cap', async () => {
        getDocs.mockResolvedValue(snapshotOf({}));

        const many = Array.from({ length: 501 }, (_, i) => ({ id: `i${i}`, name: `Peça ${i}` }));
        await firestoreService.syncWardrobeItems(many, 'u1');

        expect(batches).toHaveLength(2);
        expect(batches[0]).toHaveLength(500);
        expect(batches[1]).toHaveLength(1);
        expect(allOps()).toHaveLength(501);
    });

    it('refuses to sync without a user rather than writing anywhere', async () => {
        const result = await firestoreService.syncWardrobeItems([shirt], null);

        expect(result).toBe(false);
        expect(allOps()).toEqual([]);
    });
});
