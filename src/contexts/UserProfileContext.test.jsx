import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import { UserProfileProvider, useUserProfileContext } from './UserProfileContext';

// Hoisted mocks (vi.mock factories are hoisted, so shared refs must be too)
const h = vi.hoisted(() => ({
    auth: { state: { currentUser: null, loading: true } },
    getUserProfile: vi.fn(),
    resetProfileLocal: vi.fn(),
}));

vi.mock('./AuthContext', () => ({ useAuth: () => h.auth.state }));
vi.mock('../services/storage/firestoreService', () => ({
    firestoreService: { getUserProfile: (...a) => h.getUserProfile(...a) },
}));
vi.mock('../services/storage/hybridStorageService', () => ({
    storageService: { resetProfileLocal: h.resetProfileLocal },
    STORAGE_KEYS: {},
}));

const getUserProfile = h.getUserProfile;
const resetProfileLocal = h.resetProfileLocal;

// Real useState-backed profile hook (setProfile stable, like the real one)
vi.mock('../hooks/useUserProfile', async () => {
    const React = await vi.importActual('react');
    return {
        useUserProfile: () => {
            const [profile, setProfile] = React.useState({ onboardingCompleted: false });
            const stableSet = React.useCallback((v) => setProfile(v), []);
            const updateProfile = React.useCallback((u) => setProfile((p) => ({ ...p, ...u })), []);
            return { profile, setProfile: stableSet, updateProfile };
        },
    };
});

function Probe() {
    const { profile, isLoadingProfile } = useUserProfileContext();
    return (
        <div>
            <span data-testid="loading">{String(isLoadingProfile)}</span>
            <span data-testid="onboarded">{String(!!profile.onboardingCompleted)}</span>
            <span data-testid="photo">{profile.modelPhotoUrl || 'none'}</span>
        </div>
    );
}

const setAuth = (v) => { h.auth.state = v; };

describe('UserProfileContext (cross-user isolation + onboarding gate)', () => {
    beforeEach(() => {
        getUserProfile.mockReset();
        resetProfileLocal.mockReset();
        h.auth.state = { currentUser: null, loading: true };
    });

    it('stays in loading state while auth is settling (gate does not open early)', () => {
        render(<UserProfileProvider><Probe /></UserProfileProvider>);
        expect(screen.getByTestId('loading').textContent).toBe('true');
    });

    it('loads an onboarded profile and opens the gate (no onboarding bounce)', async () => {
        getUserProfile.mockResolvedValue({ onboardingCompleted: true, modelPhotoUrl: 'a.jpg' });
        setAuth({ currentUser: { uid: 'u1' }, loading: false });

        const { rerender } = render(<UserProfileProvider><Probe /></UserProfileProvider>);
        rerender(<UserProfileProvider><Probe /></UserProfileProvider>);

        await waitFor(() => expect(screen.getByTestId('loading').textContent).toBe('false'));
        expect(screen.getByTestId('onboarded').textContent).toBe('true');
        expect(resetProfileLocal).toHaveBeenCalled();
    });

    it('replaces the profile on user switch — no modelPhotoUrl leak', async () => {
        getUserProfile.mockResolvedValueOnce({ onboardingCompleted: true, modelPhotoUrl: 'a.jpg' });
        setAuth({ currentUser: { uid: 'u1' }, loading: false });
        const { rerender } = render(<UserProfileProvider><Probe /></UserProfileProvider>);
        rerender(<UserProfileProvider><Probe /></UserProfileProvider>);
        await waitFor(() => expect(screen.getByTestId('photo').textContent).toBe('a.jpg'));

        // Switch to a user whose profile has NO modelPhotoUrl.
        getUserProfile.mockResolvedValueOnce({ onboardingCompleted: true });
        act(() => setAuth({ currentUser: { uid: 'u2' }, loading: false }));
        rerender(<UserProfileProvider><Probe /></UserProfileProvider>);

        await waitFor(() => expect(screen.getByTestId('photo').textContent).toBe('none'));
        expect(screen.getByTestId('onboarded').textContent).toBe('true');
    });
});
