import { useLocalStorage } from './useLocalStorage';
import { STORAGE_KEYS } from '../services/storage/hybridStorageService';

export function useWardrobeItems() {
    const [items, setItems] = useLocalStorage(STORAGE_KEYS.WARDROBE, []);

    const addItem = (item) => {
        setItems(prev => [...prev, { ...item, id: Date.now().toString() }]);
    };

    const removeItem = (id) => {
        setItems(prev => prev.filter(item => item.id !== id));
    };

    const updateItem = (id, updates) => {
        setItems(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item));
    };

    return { items, setItems, addItem, removeItem, updateItem };
}
