import { describe, expect, it } from 'vitest';
import { describesLook, garmentsNamedIn } from './lookDetection';

// The reply that prompted this: long, on-topic, full of style vocabulary — and
// with no look in it. Length said "offer the try-on", which was wrong.
const ALIGNMENT_QUESTION = `Com certeza! Podemos criar sugestões completas e totalmente novas, sem nos
limitarmos às peças que você já tem cadastradas no guarda-roupa.
Antes de montarmos as opções ideais, preciso apenas de um alinhamento:
1. Linha de vestuário: Você prefere recomendações com foco em moda masculina, moda feminina ou ambas?
2. Ocasião e clima: O foco principal continua sendo o visual Casual Executivo / Business Casual para
trabalho em TI, ou você tem em mente uma ocasião ou clima específico?
Assim que me confirmar, preparo as recomendações detalhadas com peças-chave, cortes e combinações!`;

const LOOK = `Para o casamento: camisa branca de linho, calça de alfaiataria bege, cinto de couro
marrom e mocassim. Se quiser fugir do óbvio, troque a camisa por uma gola padre.`;

describe('describesLook', () => {
    it('declines a long reply that names no garment', () => {
        expect(garmentsNamedIn(ALIGNMENT_QUESTION)).toEqual([]);
        expect(describesLook(ALIGNMENT_QUESTION)).toBe(false);
    });

    it('recognises a reply that names the pieces of an outfit', () => {
        expect(garmentsNamedIn(LOOK)).toEqual(expect.arrayContaining(['shirt', 'trousers', 'belt']));
        expect(describesLook(LOOK)).toBe(true);
    });

    it('needs more than one piece, so a question about a single item is not a look', () => {
        expect(describesLook('Essa camisa combina com o que você já tem?')).toBe(false);
        expect(describesLook('Camisa branca com calça bege.')).toBe(true);
    });

    it('reads the language the agent answered in, not the interface language', () => {
        expect(describesLook('A white shirt with beige trousers and loafers.')).toBe(true);
        expect(describesLook('Camisa blanca con pantalón de vestir y mocasines.')).toBe(true);
    });

    it('matches whole words only', () => {
        // 'saia' (skirt) must not be found inside 'saiba'; 'terno' inside 'moderno'.
        expect(garmentsNamedIn('Para que você saiba, o corte moderno favorece.')).toEqual([]);
    });

    it('survives accents written either way', () => {
        expect(describesLook('calça jeans com tênis branco')).toBe(true);
        expect(describesLook('calca jeans com tenis branco')).toBe(true);
    });

    it('handles empty and non-string input', () => {
        expect(describesLook('')).toBe(false);
        expect(describesLook(undefined)).toBe(false);
        expect(describesLook(null)).toBe(false);
    });

    // A SyntaxError from an unsupported regex feature would be thrown at import
    // and take the whole chat bundle down on older WebKit.
    it('builds its matcher without regex lookbehind', () => {
        const source = String(garmentsNamedIn);
        expect(source).not.toMatch(/\(\?<[=!]/);
    });
});
