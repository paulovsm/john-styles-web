import { describe, it, expect } from 'vitest';
import { pickOutfitOfTheDay } from './outfitOfTheDay';

const items = [
    { id: 't1', category: 'tops' },
    { id: 't2', category: 'tops' },
    { id: 'b1', category: 'bottoms' },
    { id: 'b2', category: 'bottoms' },
    { id: 's1', category: 'shoes' },
    { id: 'a1', category: 'accessories' },
];

describe('pickOutfitOfTheDay', () => {
    it('picks one item per available core category', () => {
        const outfit = pickOutfitOfTheDay(items, '2026-01-01');
        const cats = outfit.map((i) => i.category);
        expect(cats).toContain('tops');
        expect(cats).toContain('bottoms');
        expect(cats).toContain('shoes');
        expect(cats).not.toContain('accessories'); // only core categories
        expect(outfit).toHaveLength(3);
    });

    it('is stable for the same day and changes across days', () => {
        const a = pickOutfitOfTheDay(items, '2026-01-01').map((i) => i.id);
        const b = pickOutfitOfTheDay(items, '2026-01-01').map((i) => i.id);
        expect(a).toEqual(b);
        // Across many days at least one different selection appears.
        const days = ['2026-01-02', '2026-02-15', '2026-07-26', '2026-12-31'];
        const anyDifferent = days.some((d) => pickOutfitOfTheDay(items, d).map((i) => i.id).join() !== a.join());
        expect(anyDifferent).toBe(true);
    });

    it('skips missing categories gracefully', () => {
        const outfit = pickOutfitOfTheDay([{ id: 't1', category: 'tops' }], '2026-01-01');
        expect(outfit).toHaveLength(1);
        expect(outfit[0].id).toBe('t1');
    });

    it('returns empty for an empty wardrobe', () => {
        expect(pickOutfitOfTheDay([], '2026-01-01')).toEqual([]);
    });
});
