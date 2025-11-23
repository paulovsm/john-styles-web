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
    orderBy
} from 'firebase/firestore';
import {
    ref,
    uploadBytes,
    getDownloadURL,
    deleteObject
} from 'firebase/storage';

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

            if (docSnap.exists()) {
                return docSnap.data();
            }
            return null;
        } catch (error) {
            // Only treat unavailable as offline, not other errors like permission-denied
            if (error.code === 'unavailable') {
                console.log('📡 Firestore unavailable - using local data');
                return null;
            }

            if (error.code === 'permission-denied') {
                console.error('🔒 Firestore Permission Denied. Check Security Rules in Firebase Console!');
                console.error('User:', this.getCurrentUserId());
                return null;
            }

            // Log other errors with details
            console.error('Error getting user profile from Firestore:', {
                code: error.code,
                message: error.message,
                userId: this.getCurrentUserId()
            });
            return null;
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
    async getGalleryItems(userId = null) {
        try {
            const uid = userId || this.getCurrentUserId();
            if (!uid) return [];

            const collectionRef = collection(db, 'users', uid, 'gallery');
            const q = query(collectionRef, orderBy('createdAt', 'desc'));
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
}

export const firestoreService = new FirestoreService();
