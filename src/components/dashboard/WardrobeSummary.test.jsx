import React from 'react';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import WardrobeSummary from './WardrobeSummary';

const { wardrobeState } = vi.hoisted(() => ({ wardrobeState: { allItems: [] } }));

vi.mock('../../contexts/WardrobeContext', () => ({
    useWardrobeContext: () => wardrobeState,
}));

vi.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (key) => key }),
}));

vi.mock('./InsightsCard', () => ({ default: () => null }));

describe('WardrobeSummary garment taxonomy', () => {
    beforeEach(() => {
        wardrobeState.allItems = [];
    });

    it('shows one total and only the garment types the user owns', () => {
        wardrobeState.allItems = [
            { id: '1', type: 'tshirt', category: 'tops' },
            { id: '2', type: 'tshirt', category: 'tops' },
            { id: '3', category: 'tops', subcategory: 'polo', name: 'Polo azul' },
            { id: '4', type: 'jeans', category: 'bottoms' },
        ];

        render(<WardrobeSummary />);

        expect(screen.getByText('4')).toBeInTheDocument();
        expect(screen.getByText('wardrobe.types.tshirt').parentElement).toHaveTextContent('2');
        expect(screen.getByText('wardrobe.types.polo').parentElement).toHaveTextContent('1');
        expect(screen.getByText('wardrobe.types.jeans').parentElement).toHaveTextContent('1');
        expect(screen.queryByText('wardrobe.types.boots')).not.toBeInTheDocument();
    });
});
