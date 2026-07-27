import React, { createContext, useContext, useEffect } from 'react';
import { useUserProfile } from '../hooks/useUserProfile';
import { useAuth } from './AuthContext';
import { firestoreService } from '../services/storage/firestoreService';
import { storageService } from '../services/storage/hybridStorageService';

const UserProfileContext = createContext();

export function useUserProfileContext() {
    return useContext(UserProfileContext);
}

const DEFAULT_PROFILE = {
    name: '',
    preferences: {},
    bodyType: '',
    styleGoals: [],
    onboardingCompleted: false,
};

export function UserProfileProvider({ children }) {
    const { profile, setProfile, updateProfile } = useUserProfile();
    const { currentUser, loading: authLoading } = useAuth();
    const uid = currentUser?.uid || null;

    // Track which uid's profile has finished loading. isLoadingProfile is DERIVED
    // from this (not set imperatively), which avoids a race where the gate would
    // briefly see an unloaded profile during the auth→user transition and bounce
    // the user to onboarding.
    const [loadedUid, setLoadedUid] = React.useState(null);

    // Load the signed-in user's profile, keyed on uid. We drop any previously
    // cached profile FIRST (local-only, no cloud write) so a prior user's data
    // — including modelPhotoUrl — never leaks into the next user, then REPLACE
    // it with the loaded profile.
    useEffect(() => {
        let active = true;
        storageService.resetProfileLocal();

        if (!uid) return;

        firestoreService.getUserProfile(uid).then((firestoreProfile) => {
            if (!active) return;
            // undefined = read failed → leave the reset (no clobber, no leak).
            if (firestoreProfile === null) {
                setProfile(DEFAULT_PROFILE);
            } else if (firestoreProfile) {
                setProfile({ ...DEFAULT_PROFILE, ...firestoreProfile });
            }
            setLoadedUid(uid);
        });

        return () => { active = false; };
    }, [uid, setProfile]);

    // Loading while auth is settling, or while the current user's profile hasn't
    // been loaded yet.
    const isLoadingProfile = authLoading || (!!uid && loadedUid !== uid);

    const value = {
        profile,
        updateProfile,
        isLoadingProfile
    };

    return (
        <UserProfileContext.Provider value={value}>
            {children}
        </UserProfileContext.Provider>
    );
}
