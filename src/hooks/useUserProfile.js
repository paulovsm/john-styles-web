import { useLocalStorage } from './useLocalStorage';
import { STORAGE_KEYS } from '../services/storage/hybridStorageService';

export function useUserProfile() {
    const [profile, setProfile] = useLocalStorage(STORAGE_KEYS.USER_PROFILE, {
        name: '',
        preferences: {},
        bodyType: '',
        styleGoals: [],
        onboardingCompleted: false
    });

    const updateProfile = (updates) => {
        setProfile(prev => ({ ...prev, ...updates }));
    };

    return { profile, setProfile, updateProfile };
}
