import { useLocalStorage } from './useLocalStorage';
import { STORAGE_KEYS } from '../services/storage/hybridStorageService';

export function useChatHistory() {
    const [history, setHistory] = useLocalStorage(STORAGE_KEYS.CHAT_HISTORY, []);

    const addMessage = (message) => {
        setHistory(prev => [...prev, { ...message, timestamp: new Date().toISOString() }]);
    };

    const clearHistory = () => {
        setHistory([]);
    };

    return { history, setHistory, addMessage, clearHistory };
}
