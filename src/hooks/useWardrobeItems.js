import { useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { STORAGE_KEYS } from '../services/storage/hybridStorageService';
import { firestoreService } from '../services/storage/firestoreService';

export function useWardrobeItems() {
    const [items, setItems] = useLocalStorage(STORAGE_KEYS.WARDROBE, []);

    // Stable identities: WardrobeContext memoises its value on these, and every
    // consumer (grid, filters, dashboard carousels, try-on) re-renders if they
    // change on each render.
    const addItem = useCallback((item) => {
        setItems(prev => [...prev, { ...item, id: item.id || Date.now().toString() }]);
    }, [setItems]);

    const removeItem = useCallback(async (id) => {
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
    }, [setItems]);

    const updateItem = useCallback((id, updates) => {
        setItems(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item));
    }, [setItems]);

    return { items, setItems, addItem, removeItem, updateItem };
}
