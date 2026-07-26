import React, { createContext, useContext, useEffect } from 'react';
import { useUserProfile } from '../hooks/useUserProfile';
import { useAuth } from './AuthContext';
import { firestoreService } from '../services/storage/firestoreService';

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

    // Load the signed-in user's profile. We REPLACE (not merge) so a previous
    // user's fields (e.g. modelPhotoUrl) never leak into the next user on the
    // same browser. On sign-out we reset to defaults.
    useEffect(() => {
        let active = true;
        async function loadUserProfile() {
            if (!currentUser?.uid) {
                setProfile(DEFAULT_PROFILE);
                setIsLoadingProfile(false);
                return;
            }
            setIsLoadingProfile(true);
            try {
                const firestoreProfile = await firestoreService.getUserProfile(currentUser.uid);
                if (!active) return;
                setProfile(firestoreProfile ? { ...DEFAULT_PROFILE, ...firestoreProfile } : DEFAULT_PROFILE);
            } catch (error) {
                console.error('Error loading user profile:', error);
                if (active) setProfile(DEFAULT_PROFILE);
            } finally {
                if (active) setIsLoadingProfile(false);
            }
        }

        loadUserProfile();
        return () => { active = false; };
    }, [currentUser, setProfile]);

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
