import React from 'react';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import WardrobePage from './WardrobePage';

const wardrobe = vi.hoisted(() => ({
    items: [],
    allItems: [],
    addItem: vi.fn(),
    updateItem: vi.fn(),
    hasDemoItems: false,
    removeSampleItems: vi.fn(),
}));

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key, fallback) => fallback || key }) }));
vi.mock('../contexts/WardrobeContext', () => ({ useWardrobeContext: () => wardrobe }));
vi.mock('../contexts/ToastContext', () => ({ useToast: () => ({ info: vi.fn() }) }));
vi.mock('../experience/ExperienceContext', () => ({ useExperience: () => ({ isUniversal: false }) }));
vi.mock('../components/layout/MainLayout', () => ({ default: ({ children }) => <div>{children}</div> }));
vi.mock('../components/wardrobe/WardrobeGrid', () => ({ default: () => <div>grid</div> }));
vi.mock('../components/wardrobe/WardrobeFilters', () => ({ default: () => <div>filters</div> }));
vi.mock('../components/wardrobe/AddItemModal', () => ({ default: () => null }));
vi.mock('../components/common/JohnSignature', () => ({ default: () => null }));

const tutorialTitle = 'wardrobe.tutorial.title';

describe('WardrobePage tutorial', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
    });

    it('greets an empty wardrobe with the tutorial', () => {
        wardrobe.allItems = [];
        render(<WardrobePage />);

        expect(screen.getByText(tutorialTitle)).toBeInTheDocument();
    });

    // It used to open for everyone until dismissed. On a phone it is the tallest
    // block above the grid, so it pushed the pieces themselves off screen.
    it('gives the pieces the space once the wardrobe has any', () => {
        wardrobe.allItems = [{ id: '1', name: 'Camisa' }];
        render(<WardrobePage />);

        expect(screen.queryByText(tutorialTitle)).not.toBeInTheDocument();
        expect(screen.getByRole('button', { name: /wardrobe.tutorial.reopen/ })).toBeInTheDocument();
    });

    it('still lets a stocked wardrobe summon it back', async () => {
        wardrobe.allItems = [{ id: '1', name: 'Camisa' }];
        const { default: userEvent } = await import('@testing-library/user-event');
        const user = userEvent.setup();
        render(<WardrobePage />);

        await user.click(screen.getByRole('button', { name: /wardrobe.tutorial.reopen/ }));

        expect(screen.getByText(tutorialTitle)).toBeInTheDocument();
    });
});
