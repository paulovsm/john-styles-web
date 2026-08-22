import { describe, expect, it } from 'vitest';
import {
    GARMENT_TYPE_KEYS,
    GARMENT_TYPES,
    GARMENT_TYPES_BY_CATEGORY,
    WARDROBE_CATEGORIES,
    deriveCategory,
    fallbackTypeForCategory,
    garmentsConflict,
    getOccupiedCategories,
    normalizeGarmentType,
    resolveGarmentType,
} from './garmentTaxonomy';

describe('garment taxonomy', () => {
    it('defines 40 unique types across six broad categories', () => {
        expect(GARMENT_TYPE_KEYS).toHaveLength(40);
        expect(new Set(GARMENT_TYPE_KEYS).size).toBe(40);
        expect(Object.keys(GARMENT_TYPES_BY_CATEGORY)).toEqual(WARDROBE_CATEGORIES);

        for (const type of GARMENT_TYPE_KEYS) {
            expect(WARDROBE_CATEGORIES).toContain(GARMENT_TYPES[type].category);
            expect(GARMENT_TYPES_BY_CATEGORY[GARMENT_TYPES[type].category]).toContain(type);
        }
    });

    it('normalizes canonical keys and common PT/EN/ES descriptions', () => {
        expect(normalizeGarmentType('dress_shoes')).toBe('dress_shoes');
        expect(normalizeGarmentType('Camisa Social Azul')).toBe('shirt');
        expect(normalizeGarmentType('Polo Shirt')).toBe('polo');
        expect(normalizeGarmentType('Calça de alfaiataria')).toBe('trousers');
        expect(normalizeGarmentType('Blue Denim Jacket')).toBe('jacket');
        expect(normalizeGarmentType('Zapatillas blancas')).toBe('sneakers');
        expect(normalizeGarmentType('Moletom com capuz')).toBe('hoodie');
        expect(normalizeGarmentType('Terno azul-marinho')).toBe('suit');
        expect(normalizeGarmentType('Esmoquin negro')).toBe('tuxedo');
        expect(normalizeGarmentType('Matching set')).toBe('matching_set');
    });

    it('derives category exclusively from a valid type', () => {
        expect(deriveCategory('polo')).toBe('tops');
        expect(deriveCategory('cargo_pants')).toBe('bottoms');
        expect(deriveCategory('boots')).toBe('shoes');
        expect(deriveCategory('blazer')).toBe('outerwear');
        expect(deriveCategory('suit')).toBe('sets');
        expect(deriveCategory('watch')).toBe('accessories');
        expect(deriveCategory('unknown')).toBeNull();
    });

    it('does not silently classify unknown input as tops', () => {
        expect(normalizeGarmentType('quux')).toBeNull();
        expect(normalizeGarmentType('')).toBeNull();
        expect(normalizeGarmentType(null)).toBeNull();
        expect(deriveCategory(null)).toBeNull();
    });

    it('resolves legacy subcategory and name fields before category fallback', () => {
        expect(resolveGarmentType({ category: 'tops', subcategory: 'polo', name: 'Peça' })).toBe('polo');
        expect(resolveGarmentType({ category: 'outerwear', name: 'Jaqueta de couro' })).toBe('jacket');
        expect(resolveGarmentType({ category: 'bottoms', name: 'Peça sem identificação' })).toBe('other_bottom');
        expect(resolveGarmentType({ category: 'invalid', name: 'Peça sem identificação' })).toBeNull();
    });

    it('provides one explicit fallback per broad category', () => {
        expect(fallbackTypeForCategory('tops')).toBe('other_top');
        expect(fallbackTypeForCategory('bottoms')).toBe('other_bottom');
        expect(fallbackTypeForCategory('shoes')).toBe('other_shoes');
        expect(fallbackTypeForCategory('outerwear')).toBe('other_outerwear');
        expect(fallbackTypeForCategory('sets')).toBe('other_set');
        expect(fallbackTypeForCategory('accessories')).toBe('other_accessory');
    });

    it('models the outfit slots occupied by composite garments', () => {
        expect(getOccupiedCategories('suit')).toEqual(['bottoms', 'outerwear']);
        expect(getOccupiedCategories('tuxedo')).toEqual(['bottoms', 'outerwear']);
        expect(getOccupiedCategories('matching_set')).toEqual(['tops', 'bottoms']);
        expect(getOccupiedCategories({ category: 'sets' })).toEqual(['tops', 'bottoms']);
        expect(getOccupiedCategories({ category: 'shoes' })).toEqual(['shoes']);
    });

    it('detects conflicts between sets and separate garments', () => {
        const suit = { type: 'suit', category: 'sets' };
        const matchingSet = { type: 'matching_set', category: 'sets' };

        expect(garmentsConflict(suit, { type: 'trousers', category: 'bottoms' })).toBe(true);
        expect(garmentsConflict(suit, { type: 'shirt', category: 'tops' })).toBe(false);
        expect(garmentsConflict(matchingSet, { type: 'shirt', category: 'tops' })).toBe(true);
        expect(garmentsConflict(matchingSet, { type: 'coat', category: 'outerwear' })).toBe(false);
    });
});
