import { describe, expect, it } from 'vitest';
import { normalizeAnalysisResult } from './gemini-image-analyze';

describe('gemini image analysis taxonomy contract', () => {
    it('normalizes a known type and derives its category', () => {
        expect(normalizeAnalysisResult({ name: 'Polo azul', type: 'polo' })).toEqual({
            name: 'Polo azul',
            type: 'polo',
            category: 'tops',
        });
    });

    it('accepts a recognizable alias but emits only the canonical key', () => {
        expect(normalizeAnalysisResult({ type: 'sapato social' })).toEqual({
            type: 'dress_shoes',
            category: 'shoes',
        });
    });

    it('does not trust an AI-provided category or legacy subcategory', () => {
        expect(normalizeAnalysisResult({
            type: 'boots',
            category: 'tops',
            subcategory: 'tshirt',
        })).toEqual({
            type: 'boots',
            category: 'shoes',
        });
    });

    it('returns null classification for unknown input', () => {
        expect(normalizeAnalysisResult({ type: 'mystery garment', category: 'tops' })).toEqual({
            type: null,
            category: null,
        });
    });
});
