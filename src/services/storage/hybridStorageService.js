import { storageService as localStorageService, STORAGE_KEYS } from './localStorageService';
import { firestoreService } from './firestoreService';
import { auth } from '../auth/firebaseConfig';

/**
 * Hybrid Storage Service
 * Combines localStorage (fast, offline) with Firestore (cloud, multi-device)
 * 
 * Strategy:
 * - Read: Always from localStorage (fast)
 * - Write: To localStorage immediately + Firestore in background (if authenticated)
 * - Sync: On login, cloud data replaces local data
 */
class HybridStorageService {
    constructor() {
        this.isSyncing = false;
        this.syncQueue = [];
        this.syncDebounceTimers = {};

        // Listen to auth state changes
        auth.onAuthStateChanged((user) => {
            if (user) {
                console.log('User authenticated, syncing from cloud...');
                this.syncFromCloud();
            }
        });
    }

    /**
     * Set item in both localStorage and Firestore
     * @param {string} key - Storage key
     * @param {*} value - Value to store
     * @returns {boolean} Success status
     */
    setItem(key, value) {
        // Save to localStorage immediately
        const localSuccess = localStorageService.setItem(key, value);

        // Queue cloud sync (debounced)
        if (auth.currentUser) {
            this.debouncedCloudSync(key, value);
        }

        return localSuccess;
    }

    /**
     * Get item from localStorage
     * @param {string} key - Storage key
     * @param {*} defaultValue - Default value if not found
     * @returns {*} Stored value or default
     */
    getItem(key, defaultValue = null) {
        return localStorageService.getItem(key, defaultValue);
    }

    /**
     * Remove item from both localStorage and Firestore
     * @param {string} key - Storage key
     * @returns {boolean} Success status
     */
    removeItem(key) {
        const localSuccess = localStorageService.removeItem(key);

        // Queue cloud deletion
        if (auth.currentUser) {
            this.debouncedCloudSync(key, null);
        }

        return localSuccess;
    }

    /**
     * Clear all storage
     * @returns {boolean} Success status
     */
    clear() {
        return localStorageService.clear();
    }

    /**
     * Debounced cloud sync to avoid excessive writes
     * @param {string} key - Storage key
     * @param {*} value - Value to sync
     */
    debouncedCloudSync(key, value) {
        // Clear existing timer for this key
        if (this.syncDebounceTimers[key]) {
            clearTimeout(this.syncDebounceTimers[key]);
        }

        // Set new timer (500ms debounce)
        this.syncDebounceTimers[key] = setTimeout(() => {
            this.syncToCloud(key, value);
            delete this.syncDebounceTimers[key];
        }, 500);
    }

    /**
     * Sync specific data to cloud
     * @param {string} key - Storage key
     * @param {*} value - Value to sync
     */
    async syncToCloud(key, value) {
        if (!auth.currentUser) return;

        try {
            switch (key) {
                case STORAGE_KEYS.USER_PROFILE:
                    if (value) {
                        await firestoreService.saveUserProfile(value);
                        console.log('✅ Profile synced to cloud');
                    }
                    break;

                case STORAGE_KEYS.WARDROBE:
                    // Sync entire wardrobe (could be optimized to sync only changed items)
                    if (value && Array.isArray(value)) {
                        for (const item of value) {
                            await firestoreService.saveWardrobeItem(item);
                        }
                        console.log(`✅ Wardrobe synced to cloud (${value.length} items)`);
                    }
                    break;

                case STORAGE_KEYS.CHAT_HISTORY:
                    if (value) {
                        console.log(`Attempting to sync chat history (${value.length} messages)...`);
                        const success = await firestoreService.saveChatHistory(value);
                        if (success) {
                            console.log('✅ Chat history synced to cloud');
                        }
                    }
                    break;

                default:
                    console.warn(`Unknown storage key for cloud sync: ${key}`);
            }
        } catch (error) {
            // Permission errors are expected until Firestore rules are configured
            if (error.code === 'permission-denied') {
                console.log('🔒 Firestore permission denied - save to localStorage only (configure Security Rules)');
                return;
            }

            // Unavailable errors are expected when offline
            if (error.code === 'unavailable') {
                console.log('📡 Firestore unavailable - save to localStorage only');
                return;
            }

            // Other errors should be logged
            console.error(`Error syncing ${key} to cloud:`, {
                code: error.code,
                message: error.message
            });
        }
    }

    /**
     * Sync all data from cloud to local storage
     * Called automatically on login
     */
    async syncFromCloud() {
        if (!auth.currentUser || this.isSyncing) return;

        this.isSyncing = true;
        console.log('Starting cloud sync...');

        try {
            // Sync user profile
            const cloudProfile = await firestoreService.getUserProfile();
            if (cloudProfile) {
                localStorageService.setItem(STORAGE_KEYS.USER_PROFILE, cloudProfile);
                console.log('Profile synced from cloud');
            }

            // Sync wardrobe
            const cloudWardrobe = await firestoreService.getWardrobe();
            if (cloudWardrobe && cloudWardrobe.length > 0) {
                localStorageService.setItem(STORAGE_KEYS.WARDROBE, cloudWardrobe);
                console.log('Wardrobe synced from cloud');
            }

            // Sync chat history
            const cloudChatHistory = await firestoreService.getChatHistory();
            if (cloudChatHistory && cloudChatHistory.length > 0) {
                localStorageService.setItem(STORAGE_KEYS.CHAT_HISTORY, cloudChatHistory);
                console.log('Chat history synced from cloud');
            }

            console.log('Cloud sync completed successfully');
        } catch (error) {
            // Check if it's an offline error
            if (error.code === 'unavailable') {
                console.log('📡 Cannot sync from cloud: offline. Using local data.');
            } else {
                console.error('Error syncing from cloud:', {
                    code: error.code,
                    message: error.message
                });
            }
        } finally {
            this.isSyncing = false;
        }
    }

    /**
     * Force sync all data to cloud
     * Useful for manual sync triggers
     */
    async syncAllToCloud() {
        if (!auth.currentUser) {
            console.warn('Cannot sync to cloud: user not authenticated');
            return;
        }

        try {
            const profile = this.getUserProfile();
            const wardrobe = this.getWardrobe();
            const chatHistory = this.getChatHistory();

            await Promise.all([
                profile && Object.keys(profile).length > 0
                    ? firestoreService.saveUserProfile(profile)
                    : Promise.resolve(),
                wardrobe && wardrobe.length > 0
                    ? Promise.all(wardrobe.map(item => firestoreService.saveWardrobeItem(item)))
                    : Promise.resolve(),
                chatHistory && chatHistory.length > 0
                    ? firestoreService.saveChatHistory(chatHistory)
                    : Promise.resolve()
            ]);

            console.log('All data synced to cloud');
        } catch (error) {
            console.error('Error syncing all data to cloud:', error);
            throw error;
        }
    }

    // Specific helpers (delegating to localStorageService for reads)
    getUserProfile() {
        return localStorageService.getUserProfile();
    }

    saveUserProfile(profile) {
        return this.setItem(STORAGE_KEYS.USER_PROFILE, profile);
    }

    getWardrobe() {
        return localStorageService.getWardrobe();
    }

    saveWardrobe(items) {
        return this.setItem(STORAGE_KEYS.WARDROBE, items);
    }

    getChatHistory() {
        return localStorageService.getChatHistory();
    }

    saveChatHistory(history) {
        return this.setItem(STORAGE_KEYS.CHAT_HISTORY, history);
    }

    /**
     * Get sync status
     * @returns {boolean} Whether sync is in progress
     */
    getSyncStatus() {
        return this.isSyncing;
    }
}

export const storageService = new HybridStorageService();
export { STORAGE_KEYS };
