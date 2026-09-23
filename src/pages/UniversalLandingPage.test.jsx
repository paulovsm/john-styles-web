import React from 'react';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
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

vi.mock('../services/api/blogService', () => ({
    listPublishedPosts: vi.fn(() => new Promise(() => {})),
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
        expect(screen.getByRole('heading', { name: 'experienceV2.journal.title' })).toBeInTheDocument();
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

    describe('mobile menu dismissal', () => {
        const openMenu = () => {
            render(
                <MemoryRouter>
                    <UniversalLandingPage />
                </MemoryRouter>,
            );
            const toggle = screen.getByRole('button', { name: 'common.openMainMenu' });
            fireEvent.click(toggle);
            return screen.getByRole('navigation', { name: 'experienceV2.nav.label' });
        };

        it('closes on Escape', () => {
            const nav = openMenu();
            expect(nav.className).toContain('is-open');

            fireEvent.keyDown(document, { key: 'Escape' });

            expect(nav.className).not.toContain('is-open');
        });

        it('closes when pointing outside the header', () => {
            const nav = openMenu();

            fireEvent.pointerDown(screen.getByRole('main'));

            expect(nav.className).not.toContain('is-open');
        });

        it('stays open while interacting inside the menu', () => {
            const nav = openMenu();

            fireEvent.pointerDown(screen.getByText('language-selector'));

            expect(nav.className).toContain('is-open');
        });
    });
});
