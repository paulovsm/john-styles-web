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
    const { currentUser } = useAuth();
    const [isLoadingProfile, setIsLoadingProfile] = React.useState(true);

    // Load the signed-in user's profile, keyed on uid. We drop any previously
    // cached profile FIRST (local-only, no cloud write) so a prior user's data
    // — including modelPhotoUrl — never leaks into the next user on the same
    // browser, then REPLACE with the loaded profile.
    const uid = currentUser?.uid || null;
    useEffect(() => {
        let active = true;

        // Clear stale local profile immediately (covers logout + user switch).
        storageService.resetProfileLocal();

        if (!uid) {
            // eslint-disable-next-line react-hooks/set-state-in-effect -- load gate
            setIsLoadingProfile(false);
            return;
        }

        setIsLoadingProfile(true);
        firestoreService.getUserProfile(uid).then((firestoreProfile) => {
            if (!active) return;
            // undefined = read failed → leave the reset (no clobber, no leak).
            if (firestoreProfile === null) {
                setProfile(DEFAULT_PROFILE);
            } else if (firestoreProfile) {
                setProfile({ ...DEFAULT_PROFILE, ...firestoreProfile });
            }
            setIsLoadingProfile(false);
        });

        return () => { active = false; };
    }, [uid, setProfile]);

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
