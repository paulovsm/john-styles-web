const STORAGE_PREFIX = 'john_styles_';

export const STORAGE_KEYS = {
    USER_PROFILE: `${STORAGE_PREFIX}user_profile`,
    WARDROBE: `${STORAGE_PREFIX}wardrobe`,
    CHAT_HISTORY: `${STORAGE_PREFIX}chat_history`,
    VIRTUAL_TRYONS: `${STORAGE_PREFIX}virtual_tryons`,
};

class LocalStorageService {
    constructor() {
        if (!window.localStorage) {
            console.error('LocalStorage is not supported in this browser.');
        }
    }

    setItem(key, value) {
        try {
            const serializedValue = JSON.stringify(value);
            window.localStorage.setItem(key, serializedValue);
            return true;
        } catch (error) {
            console.error(`Error saving to localStorage key "${key}":`, error);
            if (error.name === 'QuotaExceededError') {
                console.error('LocalStorage quota exceeded.');
            }
            return false;
        }
    }

    getItem(key, defaultValue = null) {
        try {
            const serializedValue = window.localStorage.getItem(key);
            if (serializedValue === null) {
                return defaultValue;
            }
            return JSON.parse(serializedValue);
        } catch (error) {
            console.error(`Error reading from localStorage key "${key}":`, error);
            return defaultValue;
        }
    }

    removeItem(key) {
        try {
            window.localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error(`Error removing from localStorage key "${key}":`, error);
            return false;
        }
    }

    clear() {
        try {
            window.localStorage.clear();
            return true;
        } catch (error) {
            console.error('Error clearing localStorage:', error);
            return false;
        }
    }

    // Specific helpers
    getUserProfile() {
        return this.getItem(STORAGE_KEYS.USER_PROFILE, {});
    }

    saveUserProfile(profile) {
        return this.setItem(STORAGE_KEYS.USER_PROFILE, profile);
    }

    getWardrobe() {
        return this.getItem(STORAGE_KEYS.WARDROBE, []);
    }

    saveWardrobe(items) {
        return this.setItem(STORAGE_KEYS.WARDROBE, items);
    }

    getChatHistory() {
        return this.getItem(STORAGE_KEYS.CHAT_HISTORY, []);
    }

    saveChatHistory(history) {
        return this.setItem(STORAGE_KEYS.CHAT_HISTORY, history);
    }
}

export const storageService = new LocalStorageService();
