import React, { createContext, useContext, useEffect } from 'react';
import { useUserProfile } from '../hooks/useUserProfile';
import { useAuth } from './AuthContext';
import { firestoreService } from '../services/storage/firestoreService';

const UserProfileContext = createContext();

export function useUserProfileContext() {
    return useContext(UserProfileContext);
}

export function UserProfileProvider({ children }) {
    const { profile, updateProfile } = useUserProfile();
    const { currentUser } = useAuth();
    const [isLoadingProfile, setIsLoadingProfile] = React.useState(true);

    useEffect(() => {
        async function loadUserProfile() {
            if (currentUser?.uid) {
                try {
                    const firestoreProfile = await firestoreService.getUserProfile(currentUser.uid);
                    if (firestoreProfile) {
                        console.log('Loaded profile from Firestore:', firestoreProfile);
                        updateProfile(firestoreProfile);
                    }
                } catch (error) {
                    console.error('Error loading user profile:', error);
                } finally {
                    setIsLoadingProfile(false);
                }
            } else {
                setIsLoadingProfile(false);
            }
        }

        loadUserProfile();
    }, [currentUser, updateProfile]);

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
