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
    audienceForType,
    typesForPreference,
    shoppingAudienceTerm,
    DEFAULT_STYLE_PREFERENCE,
} from './garmentTaxonomy';

describe('garment taxonomy', () => {
    it('defines 48 unique types across six broad categories', () => {
        expect(GARMENT_TYPE_KEYS).toHaveLength(48);
        expect(new Set(GARMENT_TYPE_KEYS).size).toBe(48);
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

describe('womenswear types and style preference', () => {
    it('treats a dress as a one-piece that blocks a separate bottom', () => {
        expect(deriveCategory('dress')).toBe('sets');
        expect(getOccupiedCategories('dress')).toEqual(['tops', 'bottoms']);
        // A dress must never be paired with trousers, but shoes are fine.
        expect(garmentsConflict('dress', 'trousers')).toBe(true);
        expect(garmentsConflict('dress', 'skirt')).toBe(true);
        expect(garmentsConflict('dress', 'heels')).toBe(false);
    });

    it('resolves womenswear descriptions in PT/EN/ES', () => {
        expect(normalizeGarmentType('Vestido Midi Preto')).toBe('dress');
        expect(normalizeGarmentType('Saia Lápis')).toBe('skirt');
        expect(normalizeGarmentType('Salto Alto')).toBe('heels');
        expect(normalizeGarmentType('scarpin')).toBe('heels');
        expect(normalizeGarmentType('Sapatilha')).toBe('flats');
        expect(normalizeGarmentType('Macacão')).toBe('jumpsuit');
        expect(normalizeGarmentType('Blusa de Seda')).toBe('blouse');
        expect(normalizeGarmentType('Calça Legging')).toBe('leggings');
    });

    it('does not let the new dress alias swallow dress shirt, pants or shoes', () => {
        expect(normalizeGarmentType('dress shirt')).toBe('shirt');
        expect(normalizeGarmentType('Camisa Social Azul')).toBe('shirt');
        expect(normalizeGarmentType('dress pants')).toBe('trousers');
        expect(normalizeGarmentType('dress shoes')).toBe('dress_shoes');
        expect(normalizeGarmentType('Sapato Social')).toBe('dress_shoes');
    });

    it('tags only register-specific types, leaving shared ones open to all', () => {
        expect(audienceForType('dress')).toBe('womenswear');
        expect(audienceForType('tie')).toBe('menswear');
        expect(audienceForType('jeans')).toBe('all');
        expect(audienceForType('sneakers')).toBe('all');
    });

    it('filters the offered types by preference without hard-restricting', () => {
        const menswear = typesForPreference('menswear');
        const womenswear = typesForPreference('womenswear');

        expect(menswear).not.toContain('dress');
        expect(menswear).toContain('tie');
        expect(womenswear).toContain('dress');
        expect(womenswear).not.toContain('tie');
        // Shared types stay available in both registers.
        expect(menswear).toContain('jeans');
        expect(womenswear).toContain('jeans');
        // 'both' (and any unknown value) offers everything.
        expect(typesForPreference('both')).toEqual(GARMENT_TYPE_KEYS);
        expect(typesForPreference(undefined)).toEqual(GARMENT_TYPE_KEYS);
    });

    it('phrases the shopping query per register, neutral for both', () => {
        const labels = { menswear: 'masculino', womenswear: 'feminino' };
        expect(shoppingAudienceTerm('menswear', labels)).toBe('masculino');
        expect(shoppingAudienceTerm('womenswear', labels)).toBe('feminino');
        expect(shoppingAudienceTerm('both', labels)).toBe('');
        expect(DEFAULT_STYLE_PREFERENCE).toBe('both'); // neutral, never menswear
    });
});
