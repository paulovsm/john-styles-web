import { describe, expect, it } from 'vitest';
import { buildTryOnPrompt, replacePlaceholders } from './tryOnPrompt';

const polo = { name: 'Polo', category: 'top', colors: ['verde'], styles: ['casual'], description: 'malha piquet' };

describe('buildTryOnPrompt', () => {
    it('always carries the identity and photorealism constraints', () => {
        const prompt = buildTryOnPrompt({ items: [polo] });

        expect(prompt).toContain("Keep this person's appearance exactly as shown");
        expect(prompt).toContain('photorealistic quality');
        expect(prompt).toContain('top (Polo)');
    });

    it('appends a custom request instead of replacing the base instruction', () => {
        const prompt = buildTryOnPrompt({ items: [polo], customRequest: 'deixe a polo verde' });

        // The regression this guards: the custom text used to be the whole
        // prompt, so asking for a colour change dropped face preservation.
        expect(prompt).toContain("Keep this person's appearance exactly as shown");
        expect(prompt).toContain('photorealistic quality');
        expect(prompt).toContain('Additional request from the user: deixe a polo verde');
    });

    it('omits the dressing clause when nothing is selected', () => {
        const prompt = buildTryOnPrompt({ items: [], customRequest: 'um blazer bege' });

        expect(prompt).not.toContain('Dress person with the following items');
        expect(prompt).toContain("Keep this person's appearance exactly as shown");
        expect(prompt).toContain('Additional request from the user: um blazer bege');
    });

    it('ignores a blank custom request', () => {
        expect(buildTryOnPrompt({ items: [polo], customRequest: '   ' }))
            .toBe(buildTryOnPrompt({ items: [polo] }));
    });

    it('builds a usable prompt with no arguments', () => {
        expect(buildTryOnPrompt()).toContain("Keep this person's appearance exactly as shown");
    });
});

describe('replacePlaceholders', () => {
    it('still resolves legacy markers so none reach the model raw', () => {
        const result = replacePlaceholders('uma {item.category} {item.color} chamada {item.name}', [polo]);

        expect(result).toBe('uma top verde chamada Polo');
        expect(result).not.toContain('{item.');
    });

    it('empties markers when the data is missing', () => {
        expect(replacePlaceholders('{item.name}{item.color}', [])).toBe('');
    });
});
