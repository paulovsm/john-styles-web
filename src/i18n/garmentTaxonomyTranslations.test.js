import { describe, expect, it } from 'vitest';
import en from './locales/en.json';
import es from './locales/es.json';
import pt from './locales/pt.json';
import { GARMENT_TYPE_KEYS, WARDROBE_CATEGORIES } from '../utils/garmentTaxonomy';

describe('garment taxonomy translations', () => {
    it('has the same complete type keys in PT, EN and ES', () => {
        const expectedKeys = ['unclassified', ...GARMENT_TYPE_KEYS].sort();

        for (const locale of [pt, en, es]) {
            expect(Object.keys(locale.wardrobe.types).sort()).toEqual(expectedKeys);
            expect(Object.keys(locale.wardrobe.filters.categories).sort()).toEqual([...WARDROBE_CATEGORIES].sort());
            for (const key of expectedKeys) {
                expect(locale.wardrobe.types[key].trim()).not.toBe('');
            }
        }
    });
});
