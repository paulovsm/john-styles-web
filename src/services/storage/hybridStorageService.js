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
        this.listeners = new Set();

        // Listen to auth state changes
        auth.onAuthStateChanged((user) => {
            if (user) {
                console.log('User authenticated, syncing from cloud...');
                this.syncFromCloud();
            }
        });
    }

    /**
     * Subscribe to storage changes
     * @param {Function} callback - Function to call on change
     * @returns {Function} Unsubscribe function
     */
    subscribe(callback) {
        this.listeners.add(callback);
        return () => this.listeners.delete(callback);
    }

    /**
     * Notify listeners of changes
     * @param {string} key - Storage key changed
     * @param {*} value - New value
     */
    notify(key, value) {
        this.listeners.forEach(callback => callback(key, value));
    }

    /**
     * Set sync status and notify listeners
     * @param {boolean} status 
     */
    setSyncStatus(status) {
        this.isSyncing = status;
        this.notify('SYNC_STATUS', status);
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

        // Notify local listeners immediately so UI updates
        this.notify(key, value);

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

        // Notify local listeners
        this.notify(key, null);

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

        this.setSyncStatus(true);
        try {
            switch (key) {
                case STORAGE_KEYS.USER_PROFILE:
                    if (value) {
                        await firestoreService.saveUserProfile(value);
                        console.log('✅ Profile synced to cloud');
                    }
                    break;

                case STORAGE_KEYS.WARDROBE:
                    // Sync entire wardrobe using the new full-sync method
                    // This handles additions, updates, AND deletions
                    if (value && Array.isArray(value)) {
                        await firestoreService.syncWardrobeItems(value);
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
            } else if (error.code === 'unavailable') {
                console.log('📡 Firestore unavailable - save to localStorage only');
            } else {
                console.error(`Error syncing ${key} to cloud:`, {
                    code: error.code,
                    message: error.message
                });
            }
        } finally {
            this.setSyncStatus(false);
        }
    }

    /**
     * Sync all data from cloud to local storage
     * Called automatically on login
     */
    async syncFromCloud() {
        if (!auth.currentUser || this.isSyncing) return;

        this.setSyncStatus(true);
        console.log('Starting cloud sync...');

        try {
            // Sync user profile
            const cloudProfile = await firestoreService.getUserProfile();
            if (cloudProfile !== null) { // Only update if not null (null means error/offline)
                localStorageService.setItem(STORAGE_KEYS.USER_PROFILE, cloudProfile);
                this.notify(STORAGE_KEYS.USER_PROFILE, cloudProfile);
                console.log('Profile synced from cloud');
            }

            // Sync wardrobe with merge logic
            const cloudWardrobe = await firestoreService.getWardrobe();
            if (cloudWardrobe !== null) {
                const localWardrobe = localStorageService.getWardrobe();

                // Create a map of cloud items for easy lookup
                const cloudMap = new Map(cloudWardrobe.map(item => [item.id, item]));

                // Merge strategy:
                // 1. Start with cloud items
                // 2. Add any local items that are NOT in cloud (assume they are new offline creations)
                // Note: This assumes that if an item is in cloud but not local, it was deleted locally? 
                // NO, syncFromCloud runs on login/startup. If it's in cloud but not local, it means we are on a new device or cleared cache.
                // So we should pull it down.

                // What if we deleted something offline?
                // If we deleted offline, it's gone from local.
                // If we then syncFromCloud, we see it in cloud.
                // If we just pull it down, we undo the deletion.
                // BUT, syncFromCloud usually runs when we *start* the session.
                // If we have offline changes, we should probably sync UP first?
                // Or, we can assume that "local" is only "ahead" if we have been working offline.

                // Let's implement a smart merge:
                // - If local has items that cloud doesn't, keep them (they might be new).
                // - If cloud has items that local doesn't, take them (they are from other devices).
                // - If both have it, take the one with later 'updatedAt' (if available), or default to cloud.

                // Simplified Merge for now to fix "Data Loss":
                // Combine both lists, unique by ID.
                const mergedWardrobe = [...cloudWardrobe];
                const cloudIds = new Set(cloudWardrobe.map(i => i.id));

                let hasLocalChanges = false;

                localWardrobe.forEach(localItem => {
                    if (!cloudIds.has(localItem.id)) {
                        // Local item not in cloud -> It's a new item created offline
                        mergedWardrobe.push(localItem);
                        hasLocalChanges = true;
                    }
                    // If it IS in cloud, we assume cloud version is up to date (or we could check timestamps)
                });

                localStorageService.setItem(STORAGE_KEYS.WARDROBE, mergedWardrobe);
                this.notify(STORAGE_KEYS.WARDROBE, mergedWardrobe);
                console.log(`Wardrobe synced from cloud (Merged: ${mergedWardrobe.length} items)`);

                // If we found local-only items, we should push the merged state back to cloud
                if (hasLocalChanges) {
                    console.log('Found local changes during sync, pushing back to cloud...');
                    this.debouncedCloudSync(STORAGE_KEYS.WARDROBE, mergedWardrobe);
                }
            }

            // Sync chat history
            const cloudChatHistory = await firestoreService.getChatHistory();
            if (cloudChatHistory !== null) {
                localStorageService.setItem(STORAGE_KEYS.CHAT_HISTORY, cloudChatHistory);
                this.notify(STORAGE_KEYS.CHAT_HISTORY, cloudChatHistory);
                console.log('Chat history synced from cloud');
            }

            console.log('Cloud sync completed successfully');
        } catch (error) {
            console.error('Error syncing from cloud:', error);
        } finally {
            this.setSyncStatus(false);
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

        this.setSyncStatus(true);
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
        } finally {
            this.setSyncStatus(false);
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
