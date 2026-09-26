import { describe, expect, it } from 'vitest';
import { buildLookSwapPrompt, formatLookEvaluation } from './lookEvaluation';

const t = (_key, fallback) => fallback;

describe('look evaluation presentation', () => {
    it('does not invent a wardrobe suggestion section when none was recommended', () => {
        const text = formatLookEvaluation({
            verdict: 'O look funciona bem.',
            strengths: ['Boa harmonia de cores.'],
            improvements: [],
            suggestions: [],
        }, t);

        expect(text).toContain('O look funciona bem.');
        expect(text).not.toContain('Trocas possíveis');
    });

    it('instructs image generation to change only the selected garment', () => {
        const prompt = buildLookSwapPrompt({ replaceTarget: 'camisa azul', itemName: 'Camisa branca' });
        expect(prompt).toContain('Replace ONLY the visible camisa azul');
        expect(prompt).toContain('Preserve the background');
        expect(prompt).toContain('Camisa branca');
    });
});
