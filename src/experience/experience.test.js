import { describe, expect, it } from 'vitest';
import {
    EXPERIENCES,
    getCurrentExperience,
    isUniversalExperiencePath,
} from './experience';

describe('experience routing', () => {
    it('recognizes the universal experience root and nested paths', () => {
        expect(isUniversalExperiencePath('/teste-novo-app')).toBe(true);
        expect(isUniversalExperiencePath('/teste-novo-app/dashboard')).toBe(true);
    });

    it('does not capture similar or legacy paths', () => {
        expect(isUniversalExperiencePath('/')).toBe(false);
        expect(isUniversalExperiencePath('/teste-novo-aplicativo')).toBe(false);
    });

    it('returns the correct basename for each experience', () => {
        expect(getCurrentExperience('/')).toBe(EXPERIENCES.legacy);
        expect(getCurrentExperience('/teste-novo-app/login')).toBe(EXPERIENCES.universal);
        expect(EXPERIENCES.universal.basename).toBe('/teste-novo-app');
    });
});

