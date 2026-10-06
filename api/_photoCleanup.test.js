import { describe, expect, it } from 'vitest';
import { buildPhotoCleanupPrompt } from './_photoCleanup.js';

describe('buildPhotoCleanupPrompt', () => {
    it('asks for a cut-out rather than a painted background', () => {
        const prompt = buildPhotoCleanupPrompt();

        // A model told to paint white paints a photographic white — gradients
        // and a contact shadow — so garments stop matching each other. The flat
        // colour is composited client-side instead.
        expect(prompt).toMatch(/fully transparent background/i);
        expect(prompt).toMatch(/do not paint, shade or gradient/i);
        expect(prompt).toMatch(/do not add a drop shadow/i);
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
        expect(prompt).toMatch(/fully transparent background/i);
    });
});
