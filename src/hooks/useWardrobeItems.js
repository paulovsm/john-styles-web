import { useLocalStorage } from './useLocalStorage';
import { STORAGE_KEYS } from '../services/storage/hybridStorageService';
import { firestoreService } from '../services/storage/firestoreService';

export function useWardrobeItems() {
    const [items, setItems] = useLocalStorage(STORAGE_KEYS.WARDROBE, []);

    const addItem = (item) => {
        setItems(prev => [...prev, { ...item, id: Date.now().toString() }]);
    };

    const removeItem = async (id) => {
        // Update local state - this triggers useLocalStorage which triggers hybridStorageService
        // hybridStorageService will then handle the cloud sync (including deletion)
        setItems(prev => prev.filter(item => item.id !== id));

        // We can optionally try to delete the image directly here if we want immediate cleanup,
        // or let the service handle it. For now, let's keep image deletion here as it's separate from the data sync.
        try {
            await firestoreService.deleteImage(id);
        } catch (e) {
            console.warn('Failed to delete image for item:', id, e);
        }
    };

    const updateItem = (id, updates) => {
        setItems(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item));
    };

    return { items, setItems, addItem, removeItem, updateItem };
}
