import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import WardrobeGrid from './WardrobeGrid';

const wardrobe = vi.hoisted(() => ({ items: [], removeItem: vi.fn(), addSampleItems: vi.fn() }));

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key, fallback) => fallback || key }) }));
vi.mock('../../contexts/WardrobeContext', () => ({ useWardrobeContext: () => wardrobe }));
// Stubbed for its import graph: the real module reaches firebaseConfig.
vi.mock('../../contexts/UserProfileContext', () => ({ useUserProfileContext: () => ({ profile: {} }) }));
vi.mock('./WardrobeItemCard', () => ({ default: ({ item }) => <span>{item.name}</span> }));

const piece = (id, name) => ({ id, name, category: 'tops' });

describe('WardrobeGrid new-piece feedback', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        wardrobe.items = [piece('1', 'Camisa'), piece('2', 'Calça'), piece('3', 'Tênis')];
        Element.prototype.scrollIntoView = vi.fn();
    });

    // On a phone a saved piece lands below the fold: the modal closed and the
    // grid looked unchanged, which is what users reported as confusing.
    it('brings the saved piece into view and rings it', async () => {
        const onHighlightShown = vi.fn();
        render(<WardrobeGrid highlightItemId="3" onHighlightShown={onHighlightShown} />);

        expect(Element.prototype.scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth', block: 'center' });
        expect(screen.getByText('Tênis').parentElement).toHaveClass('ring-2', 'ring-brand-gold');
        // The ring is temporary, not permanent chrome.
        await waitFor(() => expect(onHighlightShown).toHaveBeenCalledTimes(1), { timeout: 3000 });
    });

    it('reports instead of scrolling when a filter hides the saved piece', () => {
        const onHighlightMissed = vi.fn();
        render(<WardrobeGrid highlightItemId="nao-visivel" onHighlightMissed={onHighlightMissed} />);

        expect(onHighlightMissed).toHaveBeenCalledTimes(1);
        expect(Element.prototype.scrollIntoView).not.toHaveBeenCalled();
    });

    it('leaves the grid alone when nothing was just saved', () => {
        render(<WardrobeGrid />);

        expect(Element.prototype.scrollIntoView).not.toHaveBeenCalled();
        expect(screen.getByText('Camisa').parentElement).not.toHaveClass('ring-2');
    });
});
