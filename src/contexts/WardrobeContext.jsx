import React, { createContext, useContext, useState, useMemo } from 'react';
import { useWardrobeItems } from '../hooks/useWardrobeItems';
import { useTranslation } from 'react-i18next';

const WardrobeContext = createContext();

export function useWardrobeContext() {
    return useContext(WardrobeContext);
}

export function WardrobeProvider({ children }) {
    const { items, addItem, removeItem, updateItem } = useWardrobeItems();
    const { t } = useTranslation();
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
