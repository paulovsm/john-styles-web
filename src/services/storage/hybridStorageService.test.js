import { describe, it, expect, beforeEach, vi } from 'vitest';

// The service registers an auth listener on import; give it a no-op auth.
vi.mock('../auth/firebaseConfig', () => ({
    auth: { currentUser: null, onAuthStateChanged: () => () => {} },
}));
vi.mock('./firestoreService', () => ({ firestoreService: {} }));

import { storageService } from './hybridStorageService';
import { STORAGE_KEYS, storageService as local } from './localStorageService';

describe('HybridStorageService local-data clearing (cross-user isolation)', () => {
    beforeEach(() => {
        window.localStorage.clear();
    });

    it('clearLocalData resets wardrobe/chat but NOT the profile', () => {
        // The profile is owned by UserProfileContext; clearing it here too was
        // the race that forced onboarding on every login.
        local.setItem(STORAGE_KEYS.WARDROBE, [{ id: 'a' }]);
        local.setItem(STORAGE_KEYS.CHAT_HISTORY, [{ role: 'user' }]);
        local.setItem(STORAGE_KEYS.USER_PROFILE, { onboardingCompleted: true, modelPhotoUrl: 'x.jpg' });

        const notified = [];
        const unsub = storageService.subscribe((key) => notified.push(key));

        storageService.clearLocalData();
        unsub();

        expect(local.getItem(STORAGE_KEYS.WARDROBE)).toEqual([]);
        expect(local.getItem(STORAGE_KEYS.CHAT_HISTORY)).toEqual([]);
        // Profile is untouched by clearLocalData.
        expect(local.getItem(STORAGE_KEYS.USER_PROFILE)).toEqual({
            onboardingCompleted: true,
            modelPhotoUrl: 'x.jpg',
        });
        expect(notified).toContain(STORAGE_KEYS.WARDROBE);
        expect(notified).not.toContain(STORAGE_KEYS.USER_PROFILE);
    });

    it('resetProfileLocal clears the profile locally and notifies (no cloud write)', () => {
        local.setItem(STORAGE_KEYS.USER_PROFILE, { onboardingCompleted: true, modelPhotoUrl: 'x.jpg' });

        const notified = [];
        const unsub = storageService.subscribe((key, value) => notified.push([key, value]));

        storageService.resetProfileLocal();
        unsub();

        expect(local.getItem(STORAGE_KEYS.USER_PROFILE)).toEqual({});
        expect(notified).toContainEqual([STORAGE_KEYS.USER_PROFILE, {}]);
    });
});
