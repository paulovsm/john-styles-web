import { useState, useEffect } from 'react';
import { storageService } from '../services/storage/hybridStorageService';

export function useSyncStatus() {
    const [isSyncing, setIsSyncing] = useState(storageService.getSyncStatus());

    useEffect(() => {
        const unsubscribe = storageService.subscribe((key, value) => {
            if (key === 'SYNC_STATUS') {
                setIsSyncing(value);
            }
        });
        return unsubscribe;
    }, []);

    const syncNow = async () => {
        await storageService.syncFromCloud();
    };

    return { isSyncing, syncNow };
}
