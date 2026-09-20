import { describe, expect, it } from 'vitest';
import {
    BASE_OCCASIONS,
    DEFAULT_OCCASION,
    UNIVERSAL_OCCASIONS,
    normalizeOccasion,
    occasionsFor,
} from './_occasions';

describe('calendar occasion vocabulary', () => {
    it('offers the expanded list only to the universal pilot', () => {
        expect(occasionsFor('universal')).toBe(UNIVERSAL_OCCASIONS);
        expect(occasionsFor('legacy')).toBe(BASE_OCCASIONS);
        expect(occasionsFor(undefined)).toBe(BASE_OCCASIONS);
    });

    it('keeps production out of occasions its onboarding never offers', () => {
        for (const occasion of ['evento formal', 'casamento ou formatura', 'viagem', 'lazer']) {
            expect(normalizeOccasion(occasion, 'legacy')).toBe(DEFAULT_OCCASION);
            expect(normalizeOccasion(occasion, 'universal')).toBe(occasion);
        }
    });

    it('preserves the base occasions in both experiences', () => {
        for (const occasion of BASE_OCCASIONS) {
            expect(normalizeOccasion(occasion, 'legacy')).toBe(occasion);
            expect(normalizeOccasion(occasion, 'universal')).toBe(occasion);
        }
    });

    it('falls back when the model answers off-list', () => {
        expect(normalizeOccasion('brunch com investidores', 'universal')).toBe(DEFAULT_OCCASION);
        expect(normalizeOccasion(undefined, 'legacy')).toBe(DEFAULT_OCCASION);
    });
});
