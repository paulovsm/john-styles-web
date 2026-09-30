import { describe, expect, it } from 'vitest';
import { buildLookSwapPrompt, formatLookEvaluation, toAgentHistory } from './lookEvaluation';

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

describe('agent history', () => {
    it('keeps the evaluation text but never forwards look photo links', () => {
        const tryOn = { type: 'tryOn', itemIds: ['a'] };
        const history = toAgentHistory([
            { role: 'user', content: 'Avalie.', imageUrl: 'https://storage/look.jpg', kind: 'look-evaluation' },
            {
                role: 'model',
                content: 'Troque a camisa.',
                actions: [{ type: 'lookSwap', itemId: 's', sourcePhotoUrl: 'https://storage/look.jpg' }, tryOn],
            },
            { role: 'model', content: 'Só troca.', actions: [{ type: 'lookSwap', sourcePhotoUrl: 'x' }] },
        ]);

        expect(JSON.stringify(history)).not.toContain('storage/look.jpg');
        expect(history[0]).toEqual({ role: 'user', content: 'Avalie.', kind: 'look-evaluation' });
        expect(history[1].actions).toEqual([tryOn]);
        expect(history[2]).not.toHaveProperty('actions');
    });
});
