import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import UniversalLandingPage from './UniversalLandingPage';
import { ExperienceProvider } from '../experience/ExperienceContext';

afterEach(() => {
    cleanup();
    window.history.replaceState({}, '', '/');
    document.head.querySelector('meta[name="robots"]')?.remove();
});

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

    it.each([
        ['/', '/', false],
        ['/teste-novo-app', '/teste-novo-app', true],
    ])('preserves links and indexing for %s', (path, basename, preview) => {
        window.history.replaceState({}, '', path);
        const robots = document.createElement('meta');
        robots.name = 'robots';
        robots.content = 'index, follow';
        document.head.appendChild(robots);
        render(<ExperienceProvider><MemoryRouter basename={basename} initialEntries={[path]}>
            <UniversalLandingPage />
        </MemoryRouter></ExperienceProvider>);
        expect(robots.content).toBe(preview ? 'noindex, nofollow' : 'index, follow');
        expect(document.querySelector('link[rel="canonical"]').getAttribute('href')).toBe(`${window.location.origin}${path}`);
        expect(Boolean(screen.queryByText('experienceV2.previewBadge'))).toBe(preview);
        expect(screen.getByRole('link', { name: /experienceV2.hero.cta/ })).toHaveAttribute('href', preview ? `${path}/login` : '/login');
        expect(screen.getByRole('link', { name: 'Blog' })).toHaveAttribute('href', preview ? `${path}/blog` : '/blog');
    });
});
