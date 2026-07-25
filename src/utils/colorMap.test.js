import { describe, it, expect } from 'vitest';
import { colorToHex } from './colorMap';

describe('colorToHex', () => {
    it('resolves known color names in PT/EN/ES', () => {
        expect(colorToHex('Azul')).toBe('#2563EB');
        expect(colorToHex('blue')).toBe('#2563EB');
        expect(colorToHex('Preto')).toBe('#111827');
        expect(colorToHex('negro')).toBe('#111827');
    });

    it('is case- and whitespace-insensitive', () => {
        expect(colorToHex('  VERMELHO ')).toBe('#DC2626');
    });

    it('passes through valid CSS hex colors', () => {
        expect(colorToHex('#abc')).toBe('#abc');
        expect(colorToHex('#A1B2C3')).toBe('#A1B2C3');
    });

    it('falls back to the first word for compound names', () => {
        expect(colorToHex('azul escuro')).toBe('#2563EB');
    });

    it('returns null for unknown colors', () => {
        expect(colorToHex('turquesa-neon')).toBeNull();
        expect(colorToHex('')).toBeNull();
        expect(colorToHex(null)).toBeNull();
    });
});
