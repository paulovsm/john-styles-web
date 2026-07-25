import { useState, useEffect, useRef } from 'react';
import { storageService } from '../services/storage/hybridStorageService';

export function useLocalStorage(key, initialValue) {
    // Get from local storage then parse stored json or return initialValue
    const [storedValue, setStoredValue] = useState(() => {
        try {
            return storageService.getItem(key, initialValue);
        } catch (error) {
            console.error(error);
            return initialValue;
        }
    });

    // Keep a ref in sync so setValue can compute functional updates without
    // running side effects (persist/notify) inside the state updater — doing
    // that is impure and, under React StrictMode's double-invocation, caused
    // duplicated writes/notifications.
    const valueRef = useRef(storedValue);
    useEffect(() => {
        valueRef.current = storedValue;
    }, [storedValue]);

    // Subscribe to external changes (e.g. from cloud sync)
    useEffect(() => {
        const unsubscribe = storageService.subscribe((changedKey, newValue) => {
            if (changedKey === key) {
                valueRef.current = newValue;
                setStoredValue(newValue);
            }
        });
        return unsubscribe;
    }, [key]);

    // Wrapped setter: compute the next value, then persist exactly once as a
    // side effect (outside the updater). storageService.setItem notifies
    // subscribers, which updates our state too.
    const setValue = (value) => {
        try {
            const valueToStore = value instanceof Function ? value(valueRef.current) : value;
            valueRef.current = valueToStore;
            setStoredValue(valueToStore);
            storageService.setItem(key, valueToStore);
        } catch (error) {
            console.error(error);
        }
    };

    return [storedValue, setValue];
}
