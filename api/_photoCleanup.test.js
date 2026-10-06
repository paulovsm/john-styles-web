import { describe, expect, it } from 'vitest';
import { buildPhotoCleanupPrompt } from './_photoCleanup.js';

describe('buildPhotoCleanupPrompt', () => {
    it('asks for a painted background rather than a cut-out', () => {
        const prompt = buildPhotoCleanupPrompt();

        // The storage pipeline is JPEG, which has no alpha: a transparent
        // result would be flattened to black on write.
        expect(prompt).toMatch(/uniform white background/i);
        expect(prompt).not.toMatch(/transparen/i);
    });

    it('forbids altering the garment itself', () => {
        const prompt = buildPhotoCleanupPrompt();

        // This photo feeds the virtual try-on, so a garment the model "improved"
        // produces a wrong look later.
        expect(prompt).toMatch(/same colour/i);
        expect(prompt).toMatch(/do not redraw/i);
        expect(prompt).toMatch(/preserve every logo/i);
    });

    it('names the garment when the catalogue knows the type', () => {
        const prompt = buildPhotoCleanupPrompt('blazer');

        expect(prompt).toContain('The garment in this photo is a blazer');
    });

    it.each([undefined, null, '', '   ', 42])('stays generic for %p', (value) => {
        const prompt = buildPhotoCleanupPrompt(value);

        expect(prompt).not.toContain('The garment in this photo is');
        expect(prompt).toMatch(/uniform white background/i);
    });
});
