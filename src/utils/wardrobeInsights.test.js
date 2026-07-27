import { describe, it, expect } from 'vitest';
import { computeWardrobeInsights, shoppingSearchUrl } from './wardrobeInsights';

const item = (category) => ({ id: Math.random().toString(), category });

describe('computeWardrobeInsights', () => {
    it('flags missing core categories', () => {
        const { gaps, coverage } = computeWardrobeInsights([item('tops'), item('tops')]);
        const missing = gaps.filter((g) => g.severity === 'missing').map((g) => g.category);
        expect(missing).toContain('bottoms');
        expect(missing).toContain('shoes');
        expect(coverage).toBe(33); // 1 of 3 core covered
    });

    it('flags thin core categories (only one item)', () => {
        const { gaps, coverage } = computeWardrobeInsights([item('tops'), item('bottoms'), item('shoes')]);
        const coreGaps = gaps.filter((g) => ['tops', 'bottoms', 'shoes'].includes(g.category));
        // each core has exactly 1 -> all core gaps are "thin"; core coverage is full
        expect(coreGaps).toHaveLength(3);
        expect(coreGaps.every((g) => g.severity === 'thin')).toBe(true);
        expect(coverage).toBe(100);
    });

    it('reports full core coverage; extras (outerwear/accessories) still flagged missing', () => {
        const items = [item('tops'), item('tops'), item('bottoms'), item('bottoms'), item('shoes'), item('shoes')];
        const { coverage, gaps } = computeWardrobeInsights(items);
        expect(coverage).toBe(100);
        // no core gaps, but outerwear + accessories are suggested
        expect(gaps.filter((g) => ['tops', 'bottoms', 'shoes'].includes(g.category))).toHaveLength(0);
        expect(gaps.map((g) => g.category).sort()).toEqual(['accessories', 'outerwear']);
    });

    it('builds suggestions tinted by a favorite color (max 3)', () => {
        const { suggestions } = computeWardrobeInsights([], { favoriteColors: ['Azul'] });
        expect(suggestions.length).toBeLessThanOrEqual(3);
        expect(suggestions[0].color).toBe('Azul');
    });

    it('shoppingSearchUrl encodes the query', () => {
        expect(shoppingSearchUrl('sapato social azul')).toContain('sapato%20social%20azul');
    });
});
