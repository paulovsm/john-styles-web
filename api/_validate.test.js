import { describe, it, expect } from 'vitest';
import { parseImage, validateText, ValidationError } from './_validate.js';

describe('parseImage', () => {
    it('parses a data URL into base64 data + mime', () => {
        const { data, mimeType } = parseImage('data:image/png;base64,AAAA');
        expect(data).toBe('AAAA');
        expect(mimeType).toBe('image/png');
    });

    it('treats a bare base64 string as jpeg', () => {
        const { data, mimeType } = parseImage('AAAABBBB');
        expect(data).toBe('AAAABBBB');
        expect(mimeType).toBe('image/jpeg');
    });

    it('rejects unsupported mime types', () => {
        expect(() => parseImage('data:image/gif;base64,AAAA')).toThrow(ValidationError);
        expect(() => parseImage('data:application/pdf;base64,AAAA')).toThrow(ValidationError);
    });

    it('rejects missing/invalid input', () => {
        expect(() => parseImage('')).toThrow(ValidationError);
        expect(() => parseImage(null)).toThrow(ValidationError);
    });
});

describe('validateText', () => {
    it('returns the text when valid', () => {
        expect(validateText('hello')).toBe('hello');
    });

    it('rejects empty / non-string', () => {
        expect(() => validateText('')).toThrow(ValidationError);
        expect(() => validateText('   ')).toThrow(ValidationError);
        expect(() => validateText(null)).toThrow(ValidationError);
    });

    it('rejects text over the max length', () => {
        expect(() => validateText('a'.repeat(8001))).toThrow(ValidationError);
    });
});
