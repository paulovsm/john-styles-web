import React, { createContext, useContext, useState, useMemo, useCallback } from 'react';
import { useWardrobeItems } from '../hooks/useWardrobeItems';
import { useTranslation } from 'react-i18next';
import { useUserProfileContext } from './UserProfileContext';
import { pickSampleItems } from '../data/demoWardrobe';

const WardrobeContext = createContext();

export function useWardrobeContext() {
    return useContext(WardrobeContext);
}

export function WardrobeProvider({ children }) {
    const { items: rawItems, setItems, addItem, removeItem, updateItem } = useWardrobeItems();
    const { t } = useTranslation();
    const { profile } = useUserProfileContext();

    // Opt-in sample closet: the user explicitly chooses to explore with sample
    // pieces (from the empty state). We do NOT auto-inject data — the wardrobe
    // belongs to the user. Samples are tailored to their onboarding profile and
    // flagged demo:true so they can be badged and removed.
    const addSampleItems = useCallback(() => {
        const samples = pickSampleItems(profile);
        setItems((prev) => {
            const existing = new Set(prev.map((i) => i.id));
            return [...prev, ...samples.filter((s) => !existing.has(s.id))];
        });
    }, [profile, setItems]);

    const removeSampleItems = useCallback(() => {
        setItems((prev) => prev.filter((i) => !i.demo));
    }, [setItems]);

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

    const hasDemoItems = useMemo(() => items.some((i) => i.demo), [items]);

    // Memoised: a fresh object here re-renders every consumer (wardrobe grid,
    // filters, dashboard carousels, try-on) on any provider render.
    const value = useMemo(() => ({
        items: filteredItems,
        allItems: items,
        addItem,
        removeItem,
        updateItem,
        filters,
        setFilters,
        addSampleItems,
        removeSampleItems,
        hasDemoItems,
    }), [
        filteredItems,
        items,
        addItem,
        removeItem,
        updateItem,
        filters,
        setFilters,
        addSampleItems,
        removeSampleItems,
        hasDemoItems,
    ]);

    return (
        <WardrobeContext.Provider value={value}>
            {children}
        </WardrobeContext.Provider>
    );
}
