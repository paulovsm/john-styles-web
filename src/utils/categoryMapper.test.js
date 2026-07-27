import { describe, it, expect } from 'vitest';
import { mapCategory, WARDROBE_CATEGORIES } from './categoryMapper';

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
