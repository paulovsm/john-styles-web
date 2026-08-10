import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import WardrobeTutorial from './WardrobeTutorial';

vi.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (key) => key }),
}));

describe('WardrobeTutorial', () => {
    it('explains the individual flow and exposes both actions', () => {
        const onAddItem = vi.fn();
        const onDismiss = vi.fn();
        render(<WardrobeTutorial onAddItem={onAddItem} onDismiss={onDismiss} />);

        expect(screen.getByText('wardrobe.tutorial.steps.photo.title', { exact: false })).toBeInTheDocument();
        expect(screen.getByText('wardrobe.tutorial.steps.analyze.title', { exact: false })).toBeInTheDocument();
        expect(screen.getByText('wardrobe.tutorial.steps.review.title', { exact: false })).toBeInTheDocument();

        fireEvent.click(screen.getByRole('button', { name: 'wardrobe.tutorial.cta' }));
        fireEvent.click(screen.getByRole('button', { name: 'wardrobe.tutorial.dismiss' }));
        expect(onAddItem).toHaveBeenCalledTimes(1);
        expect(onDismiss).toHaveBeenCalledTimes(1);
    });
});
