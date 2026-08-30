import { beforeEach, describe, it, expect, vi } from 'vitest';

const storageMocks = vi.hoisted(() => ({
    ref: vi.fn((_storage, path) => ({ path })),
    uploadBytes: vi.fn(),
    getDownloadURL: vi.fn((storageRef) => Promise.resolve(`https://storage.test/${storageRef.path}`)),
    deleteObject: vi.fn(),
}));

// The module pulls in the Firebase SDK at import time; the unit under test is
// pure, so stub the app/config module rather than booting Firebase.
vi.mock('../auth/firebaseConfig', () => ({ db: {}, storage: {}, auth: { currentUser: null } }));
vi.mock('firebase/storage', () => storageMocks);

import { firestoreService, isUnchanged } from './firestoreService';

beforeEach(() => {
    vi.clearAllMocks();
    storageMocks.ref.mockImplementation((_storage, path) => ({ path }));
    storageMocks.uploadBytes.mockResolvedValue(undefined);
    storageMocks.getDownloadURL.mockImplementation((storageRef) => Promise.resolve(`https://storage.test/${storageRef.path}`));
    storageMocks.deleteObject.mockResolvedValue(undefined);
});

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

describe('wardrobe image storage', () => {
    it('uploads thumbnails to a separate WebP object', async () => {
        const thumbnail = new Blob(['thumb'], { type: 'image/webp' });

        const url = await firestoreService.uploadThumbnail(thumbnail, 'item-1', 'user-1');

        expect(storageMocks.ref).toHaveBeenCalledWith({}, 'users/user-1/wardrobe/item-1-thumb.webp');
        expect(storageMocks.uploadBytes).toHaveBeenCalledWith(
            { path: 'users/user-1/wardrobe/item-1-thumb.webp' },
            thumbnail,
            { contentType: 'image/webp' },
        );
        expect(url).toBe('https://storage.test/users/user-1/wardrobe/item-1-thumb.webp');
    });

    it('deletes both the original and thumbnail and tolerates a missing legacy thumbnail', async () => {
        storageMocks.deleteObject
            .mockResolvedValueOnce(undefined)
            .mockRejectedValueOnce({ code: 'storage/object-not-found' });

        await expect(firestoreService.deleteImage('item-1', 'user-1')).resolves.toBe(true);
        expect(storageMocks.deleteObject).toHaveBeenCalledTimes(2);
        expect(storageMocks.ref).toHaveBeenCalledWith({}, 'users/user-1/wardrobe/item-1.jpg');
        expect(storageMocks.ref).toHaveBeenCalledWith({}, 'users/user-1/wardrobe/item-1-thumb.webp');
    });
});
