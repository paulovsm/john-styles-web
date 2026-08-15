import { db, storage, auth } from '../auth/firebaseConfig';
import {
    doc,
    getDoc,
    setDoc,
    collection,
    getDocs,
    deleteDoc,
    addDoc,
    serverTimestamp,
    query,
    orderBy,
    limit as fsLimit,
    writeBatch
} from 'firebase/firestore';
import {
    ref,
    uploadBytes,
    getDownloadURL,
    deleteObject
} from 'firebase/storage';

/** Firestore caps a batched write at 500 operations. */
const BATCH_LIMIT = 500;

/**
 * True only when a local item is provably identical to its stored counterpart,
 * so the write can be skipped.
 *
 * This gates data persistence, so it fails SAFE: any uncertainty (missing doc,
 * unknown field, value that does not serialise identically, or a thrown error)
 * returns false and the item is written. A false negative costs one redundant
 * write; a false positive would silently drop a user's edit.
 *
 * `updatedAt` is ignored: it is written server-side on every save and would
 * otherwise make every item look changed.
 *
 * @param {Object} local - item from local state
 * @param {Object|undefined} cloud - the stored document's data, if any
 * @returns {boolean}
 */
export function isUnchanged(local, cloud) {
    if (!cloud) return false; // not in the cloud yet — must write
    try {
        const normalize = (obj) => {
            const out = {};
            for (const key of Object.keys(obj).sort()) {
                if (key === 'updatedAt') continue;
                const value = obj[key];
                // Only plain JSON-serialisable values can be compared reliably.
                // Anything else (Timestamp, DocumentReference, function…) is
                // treated as "cannot prove equal".
                if (value !== null && typeof value === 'object' && !Array.isArray(value)) return null;
                out[key] = value;
            }
            return out;
        };

        const a = normalize(local);
        const b = normalize(cloud);
        if (a === null || b === null) return false;
        return JSON.stringify(a) === JSON.stringify(b);
    } catch {
        return false; // never skip a write because comparison failed
    }
}

/**
 * Firestore Service
 * Handles all cloud persistence operations using Firebase Firestore and Storage
 */
class FirestoreService {
    /**
     * Get the current authenticated user ID
     * @returns {string|null} User ID or null if not authenticated
     */
    getCurrentUserId() {
        return auth.currentUser?.uid || null;
    }

    /**
     * Get user profile from Firestore
     * @param {string} userId - User ID
     * @returns {Promise<Object|null>} User profile or null
     */
    async getUserProfile(userId = null) {
        try {
            const uid = userId || this.getCurrentUserId();
            if (!uid) return null;

            const docRef = doc(db, 'users', uid, 'data', 'profile');
            const docSnap = await getDoc(docRef);

            // null = the profile genuinely does not exist yet (new user).
            return docSnap.exists() ? docSnap.data() : null;
        } catch (error) {
            // undefined = we couldn't read it (offline / permission / other).
            // Callers must NOT overwrite the profile with defaults in this case.
            console.error('Error getting user profile from Firestore:', {
                code: error.code,
                message: error.message,
                userId: this.getCurrentUserId(),
            });
            return undefined;
        }
    }

    /**
     * Save user profile to Firestore
     * @param {Object} profile - User profile data
     * @param {string} userId - User ID
     * @returns {Promise<boolean>} Success status
     */
    async saveUserProfile(profile, userId = null) {
        try {
            const uid = userId || this.getCurrentUserId();
            if (!uid) {
                console.warn('Cannot save profile: user not authenticated');
                return false;
            }

            const docRef = doc(db, 'users', uid, 'data', 'profile');
            await setDoc(docRef, {
                ...profile,
                updatedAt: serverTimestamp()
            }, { merge: true });

            return true;
        } catch (error) {
            console.error('Error saving user profile to Firestore:', error);
            throw error;
        }
    }

    /**
     * Get wardrobe items from Firestore
     * @param {string} userId - User ID
     * @returns {Promise<Array>} Array of wardrobe items
     */
    async getWardrobe(userId = null) {
        try {
            const uid = userId || this.getCurrentUserId();
            if (!uid) return [];

            const collectionRef = collection(db, 'users', uid, 'wardrobe');
            const querySnapshot = await getDocs(collectionRef);

            const items = [];
            querySnapshot.forEach((doc) => {
                items.push({ id: doc.id, ...doc.data() });
            });

            return items;
        } catch (error) {
            if (error.code === 'unavailable') {
                console.log('📡 Firestore unavailable - using local data');
                return null;
            }

            if (error.code === 'permission-denied') {
                console.error('🔒 Firestore Permission Denied for wardrobe. Check Security Rules!');
                return null;
            }

            console.error('Error getting wardrobe from Firestore:', {
                code: error.code,
                message: error.message
            });
            return null;
        }
    }

    /**
     * Save a single wardrobe item to Firestore
     * @param {Object} item - Wardrobe item
     * @param {string} userId - User ID
     * @returns {Promise<boolean>} Success status
     */
    async saveWardrobeItem(item, userId = null) {
        try {
            const uid = userId || this.getCurrentUserId();
            if (!uid) {
                console.warn('Cannot save wardrobe item: user not authenticated');
                return false;
            }

            const docRef = doc(db, 'users', uid, 'wardrobe', item.id);
            await setDoc(docRef, {
                ...item,
                updatedAt: serverTimestamp()
            });

            return true;
        } catch (error) {
            console.error('Error saving wardrobe item to Firestore:', error);
            throw error;
        }
    }

    /**
     * Delete a wardrobe item from Firestore
     * @param {string} itemId - Item ID
     * @param {string} userId - User ID
     * @returns {Promise<boolean>} Success status
     */
    async deleteWardrobeItem(itemId, userId = null) {
        try {
            const uid = userId || this.getCurrentUserId();
            if (!uid) {
                console.warn('Cannot delete wardrobe item: user not authenticated');
                return false;
            }

            const docRef = doc(db, 'users', uid, 'wardrobe', itemId);
            await deleteDoc(docRef);

            return true;
        } catch (error) {
            console.error('Error deleting wardrobe item from Firestore:', error);
            throw error;
        }
    }

    /**
     * Get chat history from Firestore
     * @param {string} userId - User ID
     * @returns {Promise<Array>} Array of chat messages
     */
    async getChatHistory(userId = null) {
        try {
            const uid = userId || this.getCurrentUserId();
            if (!uid) return [];

            const docRef = doc(db, 'users', uid, 'data', 'chatHistory');
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                return docSnap.data().messages || [];
            }
            return [];
        } catch (error) {
            if (error.code === 'unavailable') {
                console.log('📡 Firestore unavailable - using local data');
                return null;
            }

            if (error.code === 'permission-denied') {
                console.error('🔒 Firestore Permission Denied for chat history. Check Security Rules!');
                return null;
            }

            console.error('Error getting chat history from Firestore:', {
                code: error.code,
                message: error.message
            });
            return null;
        }
    }

    /**
     * Save chat history to Firestore
     * @param {Array} messages - Array of chat messages
     * @param {string} userId - User ID
     * @returns {Promise<boolean>} Success status
     */
    async saveChatHistory(messages, userId = null) {
        try {
            const uid = userId || this.getCurrentUserId();
            if (!uid) {
                console.warn('Cannot save chat history: user not authenticated');
                return false;
            }

            const docRef = doc(db, 'users', uid, 'data', 'chatHistory');
            await setDoc(docRef, {
                messages,
                updatedAt: serverTimestamp()
            });

            return true;
        } catch (error) {
            if (error.code === 'unavailable') {
                console.log('📡 Firestore unavailable - chat history saved to localStorage only');
                return false;
            }

            if (error.code === 'permission-denied') {
                console.error('🔒 Firestore Permission Denied for chat history. Check Security Rules!');
                return false;
            }

            console.error('Error saving chat history to Firestore:', {
                code: error.code,
                message: error.message
            });
            return false;
        }
    }

    /**
     * Upload an image to Firebase Storage
     * @param {Blob|File} imageBlob - Image file
     * @param {string} itemId - Item ID
     * @param {string} userId - User ID
     * @returns {Promise<string>} Download URL of uploaded image
     */
    async uploadImage(imageBlob, itemId, userId = null) {
        try {
            const uid = userId || this.getCurrentUserId();
            if (!uid) {
                throw new Error('Cannot upload image: user not authenticated');
            }

            const storageRef = ref(storage, `users/${uid}/wardrobe/${itemId}.jpg`);
            await uploadBytes(storageRef, imageBlob);
            const downloadURL = await getDownloadURL(storageRef);

            return downloadURL;
        } catch (error) {
            console.error('Error uploading image to Storage:', error);
            throw error;
        }
    }

    /**
     * Delete an image from Firebase Storage
     * @param {string} itemId - Item ID
     * @param {string} userId - User ID
     * @returns {Promise<boolean>} Success status
     */
    async deleteImage(itemId, userId = null) {
        try {
            const uid = userId || this.getCurrentUserId();
            if (!uid) {
                console.warn('Cannot delete image: user not authenticated');
                return false;
            }

            const storageRef = ref(storage, `users/${uid}/wardrobe/${itemId}.jpg`);
            await deleteObject(storageRef);

            return true;
        } catch (error) {
            console.error('Error deleting image from Storage:', error);
            // Don't throw error if image doesn't exist
            if (error.code === 'storage/object-not-found') {
                return true;
            }
            throw error;
        }
    }

    /**
     * Upload a gallery image to Firebase Storage
     * @param {Blob|File} imageBlob - Image file
     * @param {string} userId - User ID
     * @returns {Promise<string>} Download URL of uploaded image
     */
    async uploadGalleryImage(imageBlob, userId = null) {
        try {
            const uid = userId || this.getCurrentUserId();
            if (!uid) {
                throw new Error('Cannot upload gallery image: user not authenticated');
            }

            const timestamp = Date.now();
            const storageRef = ref(storage, `users/${uid}/gallery/${timestamp}.jpg`);
            await uploadBytes(storageRef, imageBlob);
            const downloadURL = await getDownloadURL(storageRef);

            return downloadURL;
        } catch (error) {
            console.error('Error uploading gallery image to Storage:', error);
            throw error;
        }
    }

    /**
     * Upload the user's persistent model photo (reused across try-ons).
     * @param {Blob|File} imageBlob - Image file
     * @param {string} userId - User ID
     * @returns {Promise<string>} Download URL
     */
    async uploadModelPhoto(imageBlob, userId = null) {
        try {
            const uid = userId || this.getCurrentUserId();
            if (!uid) throw new Error('Cannot upload model photo: user not authenticated');

            // Cache-bust so a replaced photo isn't served stale from the CDN.
            const storageRef = ref(storage, `users/${uid}/model/photo_${Date.now()}.jpg`);
            await uploadBytes(storageRef, imageBlob);
            return await getDownloadURL(storageRef);
        } catch (error) {
            console.error('Error uploading model photo to Storage:', error);
            throw error;
        }
    }

    /**
     * Save a gallery item to Firestore
     * @param {Object} item - Gallery item data
     * @param {string} userId - User ID
     * @returns {Promise<boolean>} Success status
     */
    async saveGalleryItem(item, userId = null) {
        try {
            const uid = userId || this.getCurrentUserId();
            if (!uid) {
                console.warn('Cannot save gallery item: user not authenticated');
                return false;
            }

            const collectionRef = collection(db, 'users', uid, 'gallery');
            await addDoc(collectionRef, {
                ...item,
                createdAt: serverTimestamp()
            });

            return true;
        } catch (error) {
            console.error('Error saving gallery item to Firestore:', error);
            throw error;
        }
    }

    /**
     * Get gallery items from Firestore
     * @param {string} userId - User ID
     * @returns {Promise<Array>} Array of gallery items
     */
    async getGalleryItems(userId = null, max = null) {
        try {
            const uid = userId || this.getCurrentUserId();
            if (!uid) return [];

            // `max` bounds the read: the dashboard only shows a handful of looks,
            // and without a limit this downloaded every look the user had ever
            // generated. Omitting it preserves the previous unbounded behaviour.
            const collectionRef = collection(db, 'users', uid, 'gallery');
            const constraints = [orderBy('createdAt', 'desc')];
            if (max) constraints.push(fsLimit(max));
            const q = query(collectionRef, ...constraints);
            const querySnapshot = await getDocs(q);

            const items = [];
            querySnapshot.forEach((doc) => {
                items.push({ id: doc.id, ...doc.data() });
            });

            return items;
        } catch (error) {
            console.error('Error getting gallery items from Firestore:', error);
            return null;
        }
    }

    /**
     * Delete a gallery item from Firestore and Storage
     * @param {Object} item - Gallery item object (must contain id and imageUrl)
     * @param {string} userId - User ID
     * @returns {Promise<boolean>} Success status
     */
    async deleteGalleryItem(item, userId = null) {
        try {
            const uid = userId || this.getCurrentUserId();
            if (!uid) {
                console.warn('Cannot delete gallery item: user not authenticated');
                return false;
            }

            // Delete from Firestore
            const docRef = doc(db, 'users', uid, 'gallery', item.id);
            await deleteDoc(docRef);

            // Delete from Storage if URL exists
            if (item.imageUrl) {
                try {
                    // Create a reference from the HTTPS URL
                    // Note: This requires the storage instance to be passed as the first argument
                    const imageRef = ref(storage, item.imageUrl);
                    await deleteObject(imageRef);
                } catch (storageError) {
                    console.warn('Warning: Could not delete image from storage (might be already deleted or invalid URL):', storageError);
                    // We continue returning true because the primary record (Firestore) is gone
                }
            }

            return true;
        } catch (error) {
            console.error('Error deleting gallery item:', error);
            throw error;
        }
    }

    // ── Outfits (saved reusable combinations of wardrobe items) ──

    /**
     * Save an outfit (a named combination of item ids).
     * @param {Object} outfit - { name, itemIds, imageUrl? }
     * @returns {Promise<string|null>} the new outfit id
     */
    async saveOutfit(outfit, userId = null) {
        try {
            const uid = userId || this.getCurrentUserId();
            if (!uid) throw new Error('Cannot save outfit: user not authenticated');

            const collectionRef = collection(db, 'users', uid, 'outfits');
            const docRef = await addDoc(collectionRef, { ...outfit, createdAt: serverTimestamp() });
            return docRef.id;
        } catch (error) {
            console.error('Error saving outfit to Firestore:', error);
            throw error;
        }
    }

    async getOutfits(userId = null) {
        try {
            const uid = userId || this.getCurrentUserId();
            if (!uid) return [];

            const collectionRef = collection(db, 'users', uid, 'outfits');
            const q = query(collectionRef, orderBy('createdAt', 'desc'));
            const querySnapshot = await getDocs(q);
            const items = [];
            querySnapshot.forEach((doc) => items.push({ id: doc.id, ...doc.data() }));
            return items;
        } catch (error) {
            console.error('Error getting outfits from Firestore:', error);
            return null;
        }
    }

    async deleteOutfit(outfitId, userId = null) {
        try {
            const uid = userId || this.getCurrentUserId();
            if (!uid) return false;
            await deleteDoc(doc(db, 'users', uid, 'outfits', outfitId));
            return true;
        } catch (error) {
            console.error('Error deleting outfit from Firestore:', error);
            throw error;
        }
    }

    /**
     * Sync entire wardrobe list (handles additions, updates, and deletions)
     * @param {Array} items - Current local wardrobe items
     * @param {string} userId - User ID
     * @returns {Promise<boolean>} Success status
     */
    async syncWardrobeItems(items, userId = null) {
        try {
            const uid = userId || this.getCurrentUserId();
            if (!uid) {
                console.warn('Cannot sync wardrobe: user not authenticated');
                return false;
            }

            // 1. Read the current cloud state (also needed to detect deletions).
            const collectionRef = collection(db, 'users', uid, 'wardrobe');
            const querySnapshot = await getDocs(collectionRef);
            const cloudItems = new Map();
            querySnapshot.forEach(d => cloudItems.set(d.id, d.data()));

            // 2. Identify items to delete (in cloud but not in the local list).
            const localItemIds = new Set(items.map(item => item.id));
            const itemsToDelete = [...cloudItems.keys()].filter(id => !localItemIds.has(id));

            // 3. Write only the items that actually changed. Previously every
            //    sync rewrote the whole wardrobe, so adding one garment to a
            //    50-item closet cost 50 writes. isUnchanged() is deliberately
            //    conservative: anything it cannot prove identical is rewritten,
            //    so the cloud still converges on the local state exactly.
            const changed = items.filter(item => !isUnchanged(item, cloudItems.get(item.id)));

            // 4. Apply writes and deletes in batches (one round trip per 500 ops
            //    instead of one request per document).
            const operations = [
                ...changed.map(item => ({
                    type: 'set',
                    ref: doc(db, 'users', uid, 'wardrobe', item.id),
                    data: { ...item, updatedAt: serverTimestamp() },
                })),
                ...itemsToDelete.map(id => ({
                    type: 'delete',
                    ref: doc(db, 'users', uid, 'wardrobe', id),
                })),
            ];

            for (let i = 0; i < operations.length; i += BATCH_LIMIT) {
                const batch = writeBatch(db);
                for (const op of operations.slice(i, i + BATCH_LIMIT)) {
                    if (op.type === 'set') batch.set(op.ref, op.data);
                    else batch.delete(op.ref);
                }
                await batch.commit();
            }

            return true;
        } catch (error) {
            console.error('Error syncing wardrobe items:', error);
            throw error;
        }
    }
    /**
     * Read-only view of the current daily usage for display purposes.
     *
     * NOTE: enforcement now happens server-side (see api/_usage.js). The
     * usageLimits doc is written only by the backend (Admin SDK) and is
     * read-only for the client per Firestore rules. This method never
     * increments — it just reports what the server has recorded today.
     *
     * @param {string} limitType - 'wardrobeAnalysis' | 'lookGeneration' | 'chat'
     * @param {string} userId - User ID
     * @returns {Promise<{remaining: number, limit: number, used: number} | null>}
     */
    async getUsage(limitType, userId = null) {
        try {
            const uid = userId || this.getCurrentUserId();
            if (!uid) return null;

            const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
            const docRef = doc(db, 'users', uid, 'data', 'usageLimits');
            const docSnap = await getDoc(docRef);

            const limits = { wardrobeAnalysis: 5, lookGeneration: 5, chat: 100 };
            const limit = limits[limitType] || 5;

            let used = 0;
            if (docSnap.exists()) {
                const data = docSnap.data();
                // Counters only count if they belong to today.
                used = data.lastReset === today ? (data[limitType] || 0) : 0;
            }

            return { used, remaining: Math.max(0, limit - used), limit };
        } catch (error) {
            console.error(`Error reading usage for ${limitType}:`, error);
            return null;
        }
    }
}

export const firestoreService = new FirestoreService();
