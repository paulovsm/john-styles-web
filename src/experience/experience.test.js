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
        expect(getCurrentExperience('/')).toBe(EXPERIENCES.production);
        expect(getCurrentExperience('/teste-novo-app/login')).toBe(EXPERIENCES.universal);
        expect(EXPERIENCES.universal.basename).toBe('/teste-novo-app');
    });

    it('promotes presentation without changing production service behavior', () => {
        for (const path of ['/', '/login', '/dashboard', '/chat', '/onboarding', '/assinatura']) {
            expect(getCurrentExperience(path)).toMatchObject({
                id: 'universal', isUniversal: true, isPreview: false,
                basename: '/', agentExperience: 'legacy', expandedOccasions: false,
            });
        }
        expect(getCurrentExperience('/teste-novo-app/chat')).toMatchObject({
            isPreview: true, agentExperience: 'universal', expandedOccasions: true,
        });
    });
});
