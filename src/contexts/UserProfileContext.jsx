import React, { createContext, useContext } from 'react';
import { useUserProfile } from '../hooks/useUserProfile';

const UserProfileContext = createContext();

export function useUserProfileContext() {
    return useContext(UserProfileContext);
}

export function UserProfileProvider({ children }) {
    const { profile, updateProfile } = useUserProfile();

    const value = {
        profile,
        updateProfile
    };

    return (
        <UserProfileContext.Provider value={value}>
            {children}
        </UserProfileContext.Provider>
    );
}
