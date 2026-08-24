import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import OnboardingPage from './OnboardingPage';
import { DEFAULT_STYLE_PREFERENCE } from '../utils/garmentTaxonomy';

const updateProfile = vi.fn();

vi.mock('react-i18next', () => ({
    // Second arg is a fallback string on some calls and an interpolation object
    // on others; only the string form may stand in for the translation.
    useTranslation: () => ({
        t: (key, fallback) => (typeof fallback === 'string' ? fallback : key),
        i18n: { language: 'pt' },
    }),
}));
vi.mock('react-router-dom', () => ({ useNavigate: () => vi.fn() }));
vi.mock('../contexts/UserProfileContext', () => ({
    useUserProfileContext: () => ({ profile: {}, updateProfile }),
}));
vi.mock('../services/api/geminiService', () => ({ geminiService: { analyzeProfile: vi.fn() } }));

/** Walks the wizard to the last step and submits. */
async function completeWizard(user) {
    // The review step is the last one; advance through everything before it.
    for (let i = 0; i < 6; i += 1) {
        await user.click(screen.getByRole('button', { name: 'Continuar' }));
    }
    await user.click(screen.getByRole('button', { name: 'onboarding.saveButton' }));
}

describe('OnboardingPage styling register', () => {
    beforeEach(() => {
        updateProfile.mockClear();
        localStorage.clear();
    });

    it('persists the picked styling register to the profile', async () => {
        const user = userEvent.setup();
        render(<OnboardingPage />);

        await user.click(screen.getByRole('button', { name: 'onboarding.stylePreference.womenswear' }));
        await completeWizard(user);

        expect(updateProfile).toHaveBeenCalledWith(
            expect.objectContaining({ stylePreference: 'womenswear' }),
        );
    });

    it('falls back to the neutral register when the step is skipped', async () => {
        const user = userEvent.setup();
        render(<OnboardingPage />);

        await completeWizard(user);

        expect(updateProfile).toHaveBeenCalledWith(
            expect.objectContaining({ stylePreference: DEFAULT_STYLE_PREFERENCE }),
        );
    });
});
