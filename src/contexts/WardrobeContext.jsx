import React, { createContext, useContext, useState, useMemo, useEffect, useRef } from 'react';
import { useWardrobeItems } from '../hooks/useWardrobeItems';
import { useTranslation } from 'react-i18next';
import { useAuth } from './AuthContext';
import { useUserProfileContext } from './UserProfileContext';
import { firestoreService } from '../services/storage/firestoreService';
import { DEMO_WARDROBE } from '../data/demoWardrobe';

const WardrobeContext = createContext();

export function useWardrobeContext() {
    return useContext(WardrobeContext);
}

export function WardrobeProvider({ children }) {
    const { items: rawItems, setItems, addItem, removeItem, updateItem } = useWardrobeItems();
    const { t } = useTranslation();
    const { currentUser } = useAuth();
    const { profile, updateProfile, isLoadingProfile } = useUserProfileContext();

    // Seed a demo wardrobe on a new user's first access so they can try the
    // product immediately (kills the cold start). We check the CLOUD wardrobe
    // (source of truth) rather than local state, which can be transiently stale
    // during login/user-switch — that stale check previously skipped the seed
    // while still marking the user as seeded, so nothing ever appeared.
    const uid = currentUser?.uid || null;
    const seededRef = useRef(false);
    useEffect(() => {
        if (seededRef.current || !uid || isLoadingProfile) return;
        if (profile?.seededDemo) { seededRef.current = true; return; }

        seededRef.current = true; // prevent concurrent runs
        let cancelled = false;
        (async () => {
            const cloud = await firestoreService.getWardrobe(uid);
            if (cancelled) return;
            if (!Array.isArray(cloud)) {
                // Read failed — retry on a later mount instead of marking seeded.
                seededRef.current = false;
                return;
            }
            if (cloud.length === 0) {
                setItems(DEMO_WARDROBE);
            }
            updateProfile({ seededDemo: true });
        })();

        return () => { cancelled = true; };
    }, [uid, isLoadingProfile, profile?.seededDemo, setItems, updateProfile]);

    // Safety net: never render the same item id twice (guards against any
    // sync race / legacy duplicate leaking into the list). Keeps the last
    // occurrence so freshly-updated data wins.
    const items = useMemo(() => {
        const byId = new Map();
        for (const item of rawItems) byId.set(item.id, item);
        return Array.from(byId.values());
    }, [rawItems]);
    const [filters, setFilters] = useState({
        category: 'all',
        color: 'all',
        style: 'all',
        search: ''
    });

    const filteredItems = useMemo(() => {
        return items.filter(item => {
            const matchesCategory = filters.category === 'all' || item.category === filters.category;

            const matchesColor = filters.color === 'all' || (item.colors && item.colors.some(c => {
                const colorFilter = filters.color.toLowerCase();
                const itemColor = c.toLowerCase();
                const translatedColor = t(`wardrobe.filters.colors.${filters.color}`).toLowerCase();
                return itemColor === colorFilter || itemColor === translatedColor;
            }));

            const matchesStyle = filters.style === 'all' || (item.styles && item.styles.some(s => {
                const styleFilter = filters.style.toLowerCase();
                const itemStyle = s.toLowerCase();
                const translatedStyle = t(`wardrobe.filters.styles.${filters.style}`).toLowerCase();
                return itemStyle === styleFilter || itemStyle === translatedStyle;
            }));

            const matchesSearch = filters.search === '' ||
                item.name?.toLowerCase().includes(filters.search.toLowerCase()) ||
                item.description?.toLowerCase().includes(filters.search.toLowerCase());

            return matchesCategory && matchesColor && matchesStyle && matchesSearch;
        });
    }, [items, filters, t]);

    const value = {
        items: filteredItems,
        allItems: items,
        addItem,
        removeItem,
        updateItem,
        filters,
        setFilters
    };

    return (
        <WardrobeContext.Provider value={value}>
            {children}
        </WardrobeContext.Provider>
    );
}
