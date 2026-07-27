import { describe, it, expect } from 'vitest';
import { inferArchetypes, ARCHETYPES } from './archetypes';

const ids = new Set(ARCHETYPES.map((a) => a.id));

describe('inferArchetypes', () => {
    it('infers casual from jeans/t-shirt preferences', () => {
        const r = inferArchetypes({ preferredItems: ['jeans', 'camisetas'], styleGoals: 'algo confortável' });
        expect(r).toContain('casual');
    });

    it('infers classic/elegant from formal/social signals', () => {
        const r = inferArchetypes({ styleGoals: 'visual social e alfaiataria para o trabalho', occasions: ['trabalho'] });
        expect(r.some((id) => ['classic', 'elegant'].includes(id))).toBe(true);
    });

    it('infers sporty from sport signals', () => {
        const r = inferArchetypes({ preferredItems: ['roupa esportiva'], styleGoals: 'academia e corrida' });
        expect(r).toContain('sporty');
    });

    it('returns at most `max` ids, all valid', () => {
        const r = inferArchetypes({ styleGoals: 'casual social esportivo minimalista street elegante', preferredItems: ['jeans', 'blazer', 'moletom'] }, 2);
        expect(r.length).toBeLessThanOrEqual(2);
        expect(r.every((id) => ids.has(id))).toBe(true);
    });

    it('returns empty when there is no signal', () => {
        expect(inferArchetypes({})).toEqual([]);
        expect(inferArchetypes({ preferredItems: [], styleGoals: '' })).toEqual([]);
    });
});
