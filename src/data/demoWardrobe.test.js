import { describe, it, expect } from 'vitest';
import { pickSampleItems, SAMPLE_CATALOG } from './demoWardrobe';

describe('pickSampleItems', () => {
    it('returns items flagged demo:true and respects the count', () => {
        const picks = pickSampleItems({}, 4);
        expect(picks).toHaveLength(4);
        expect(picks.every((p) => p.demo === true)).toBe(true);
    });

    it('includes at least one top, bottom and shoes', () => {
        const cats = new Set(pickSampleItems({}, 6).map((p) => p.category));
        expect(cats.has('tops')).toBe(true);
        expect(cats.has('bottoms')).toBe(true);
        expect(cats.has('shoes')).toBe(true);
    });

    it('prioritizes items matching favorite colors', () => {
        const picks = pickSampleItems({ favoriteColors: ['Azul'] }, 6);
        const blueCount = picks.filter((p) => p.colors.includes('Azul')).length;
        expect(blueCount).toBeGreaterThan(0);
    });

    it('avoids items the user dislikes (e.g. vivid colors -> multicolor)', () => {
        const picks = pickSampleItems({ dislikes: ['cores vivas'] }, 11);
        expect(picks.some((p) => p.colors.includes('Multicolor'))).toBe(false);
    });

    it('never returns items outside the catalog', () => {
        const ids = new Set(SAMPLE_CATALOG.map((i) => i.id));
        for (const p of pickSampleItems({ favoriteColors: ['Preto'] }, 6)) {
            expect(ids.has(p.id)).toBe(true);
        }
    });
});
