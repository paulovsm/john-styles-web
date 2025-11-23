import { useState, useEffect } from 'react';
import { storageService } from '../services/storage/hybridStorageService';

export function useLocalStorage(key, initialValue) {
    // Get from local storage then parse stored json or return initialValue
    const [storedValue, setStoredValue] = useState(() => {
        try {
            const item = storageService.getItem(key, initialValue);
            return item;
        } catch (error) {
            console.error(error);
            return initialValue;
        }
    });

    // Return a wrapped version of useState's setter function that ...
    // ... persists the new value to localStorage.
    const setValue = (value) => {
        try {
            // Allow value to be a function so we have same API as useState
            setStoredValue((currentValue) => {
                const valueToStore =
                    value instanceof Function ? value(currentValue) : value;

                // Save to local storage (and cloud via hybridStorageService)
                storageService.setItem(key, valueToStore);

                return valueToStore;
            });
        } catch (error) {
            console.error(error);
        }
    };

    return [storedValue, setValue];
}
