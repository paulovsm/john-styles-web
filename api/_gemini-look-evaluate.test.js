import { describe, expect, it } from 'vitest';
import { normalizeLookEvaluation } from './gemini-look-evaluate.js';

const wardrobe = [
    { id: 'shirt-1', name: 'Camisa branca', type: 'shirt' },
    { id: 'shoe-1', name: 'Mocassim marrom', type: 'loafers' },
];

describe('look evaluation normalization', () => {
    it('does not force substitutions when the look already works', () => {
        expect(normalizeLookEvaluation({
            verdict: 'O look funciona.',
            shouldImprove: false,
            suggestions: [{ itemId: 'shirt-1', replaceTarget: 'camisa' }],
        }, wardrobe)).toMatchObject({ shouldImprove: false, suggestions: [] });
    });

    it('keeps only unique suggestions backed by the real wardrobe', () => {
        const result = normalizeLookEvaluation({
            shouldImprove: true,
            suggestions: [
                { itemId: 'shirt-1', replaceTarget: 'camiseta', reason: 'Mais estrutura.' },
                { itemId: 'invented', replaceTarget: 'calça' },
                { itemId: 'shirt-1', replaceTarget: 'blusa' },
            ],
        }, wardrobe);

        expect(result.suggestions).toEqual([{
            itemId: 'shirt-1',
            itemName: 'Camisa branca',
            replaceTarget: 'camiseta',
            reason: 'Mais estrutura.',
        }]);
    });
});
