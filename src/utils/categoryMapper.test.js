import { describe, it, expect } from 'vitest';
import { mapCategory, mapSubcategory, WARDROBE_CATEGORIES, TOP_SUBCATEGORIES } from './categoryMapper';

describe('mapCategory', () => {
    it('returns exact category matches (case-insensitive)', () => {
        expect(mapCategory('tops')).toBe('tops');
        expect(mapCategory('Bottoms')).toBe('bottoms');
        expect(mapCategory('  SHOES ')).toBe('shoes');
    });

    it('maps free-form names via keyword heuristics', () => {
        expect(mapCategory('Sneakers')).toBe('shoes');
        expect(mapCategory('Blue Jeans')).toBe('bottoms');
        expect(mapCategory('Leather Jacket')).toBe('outerwear');
        expect(mapCategory('Baseball Cap')).toBe('accessories');
        expect(mapCategory('Cotton T-Shirt')).toBe('tops');
    });

    it('falls back to tops for unknown / empty input', () => {
        expect(mapCategory('quux')).toBe('tops');
        expect(mapCategory('')).toBe('tops');
        expect(mapCategory(null)).toBe('tops');
        expect(mapCategory(undefined)).toBe('tops');
    });

    it('only ever returns a valid wardrobe category', () => {
        for (const input of ['random', 'boots', 'skirt', 'blazer', 'belt', 42, {}]) {
            expect(WARDROBE_CATEGORIES).toContain(mapCategory(input));
        }
    });
});

describe('mapSubcategory', () => {
    it('returns exact sub-type matches (case-insensitive)', () => {
        expect(mapSubcategory('shirt')).toBe('shirt');
        expect(mapSubcategory('Polo')).toBe('polo');
        expect(mapSubcategory('  TSHIRT ')).toBe('tshirt');
    });

    it('classifies t-shirts before the broader shirt match', () => {
        expect(mapSubcategory('Cotton T-Shirt')).toBe('tshirt');
        expect(mapSubcategory('Camiseta Estampada')).toBe('tshirt');
        expect(mapSubcategory('Tank Top')).toBe('tshirt');
    });

    it('treats blusa / blouse as a t-shirt (camiseta)', () => {
        expect(mapSubcategory('Blusa Básica')).toBe('tshirt');
        expect(mapSubcategory('Silk Blouse')).toBe('tshirt');
    });

    it('classifies polos and dress shirts (camisas)', () => {
        expect(mapSubcategory('Polo Shirt')).toBe('polo');
        expect(mapSubcategory('Camisa Social')).toBe('shirt');
        expect(mapSubcategory('Blue Dress Shirt')).toBe('shirt');
        expect(mapSubcategory('Chambray')).toBe('shirt');
    });

    it('returns null when there is no signal', () => {
        expect(mapSubcategory('quux')).toBeNull();
        expect(mapSubcategory('')).toBeNull();
        expect(mapSubcategory(null)).toBeNull();
        expect(mapSubcategory(undefined)).toBeNull();
    });

    it('only ever returns a valid sub-type or null', () => {
        for (const input of ['random', 'polo', 'tee', 'camisa', 42, {}]) {
            const result = mapSubcategory(input);
            expect(result === null || TOP_SUBCATEGORIES.includes(result)).toBe(true);
        }
    });
});
