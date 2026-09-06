import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import UniversalLandingPage from './UniversalLandingPage';

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key) => key,
        i18n: { language: 'pt', changeLanguage: vi.fn() },
    }),
}));

vi.mock('../components/common/LanguageSelector', () => ({
    default: () => <span>language-selector</span>,
}));

describe('UniversalLandingPage', () => {
    it('presents the universal positioning and transparent service status', () => {
        render(
            <MemoryRouter>
                <UniversalLandingPage />
            </MemoryRouter>,
        );

        expect(screen.getByRole('heading', { name: 'experienceV2.hero.title' })).toBeInTheDocument();
        expect(screen.getByText('experienceV2.john.role')).toBeInTheDocument();
        expect(screen.getByAltText('experienceV2.john.avatarAlt')).toBeInTheDocument();
        expect(screen.getAllByText('experienceV2.solutions.conceptBadge')).toHaveLength(2);
        expect(screen.getByRole('link', { name: /experienceV2.hero.cta/ })).toHaveAttribute('href', '/login');
    });
});
