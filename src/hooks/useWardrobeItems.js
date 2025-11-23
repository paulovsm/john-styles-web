import { useLocalStorage } from './useLocalStorage';
import { STORAGE_KEYS } from '../services/storage/hybridStorageService';
import { firestoreService } from '../services/storage/firestoreService';

export function useWardrobeItems() {
    const [items, setItems] = useLocalStorage(STORAGE_KEYS.WARDROBE, []);

    const addItem = (item) => {
        setItems(prev => [...prev, { ...item, id: Date.now().toString() }]);
    };

    const removeItem = async (id) => {
        try {
            // Delete from Firestore
            await firestoreService.deleteWardrobeItem(id);
            // Try to delete image if it exists (don't block if fails)
            try {
                await firestoreService.deleteImage(id);
            } catch (e) {
                console.warn('Failed to delete image for item:', id, e);
            }
        } catch (error) {
            console.error('Error deleting item from Firestore:', error);
        }

        // Update local state
        setItems(prev => prev.filter(item => item.id !== id));
    };

    const updateItem = (id, updates) => {
        setItems(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item));
    };

    return { items, setItems, addItem, removeItem, updateItem };
}
