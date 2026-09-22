import React from 'react';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import LookViewer from './LookViewer';

vi.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (key) => key }),
}));

beforeAll(() => {
    // jsdom implements neither, and the viewer calls both on mount.
    Element.prototype.scrollIntoView = vi.fn();
    vi.stubGlobal('IntersectionObserver', class {
        observe() {}
        unobserve() {}
        disconnect() {}
    });
});

afterEach(cleanup);

const items = [
    { id: 'a', imageUrl: 'a.jpg', prompt: 'um jantar ao ar livre', createdAt: 1 },
    { id: 'b', imageUrl: 'b.jpg', createdAt: 2 },
];

const renderViewer = (props = {}) => render(
    <LookViewer items={items} startIndex={0} onClose={vi.fn()} formatDate={() => '01/01/2026'} {...props} />,
);

describe('LookViewer', () => {
    it('shows every look and only captions the ones with a request', () => {
        renderViewer();

        expect(screen.getAllByRole('img')).toHaveLength(2);
        expect(screen.getByText('um jantar ao ar livre')).toBeInTheDocument();
        expect(screen.getAllByRole('button', { name: 'gallery.expandRequest' })).toHaveLength(1);
    });

    it('expands the request in place and collapses it again', () => {
        renderViewer();
        const toggle = screen.getByRole('button', { name: 'gallery.expandRequest' });

        expect(toggle).toHaveAttribute('aria-expanded', 'false');

        fireEvent.click(toggle);

        const expanded = screen.getByRole('button', { name: 'gallery.collapseRequest' });
        expect(expanded).toHaveAttribute('aria-expanded', 'true');

        fireEvent.click(expanded);

        expect(screen.getByRole('button', { name: 'gallery.expandRequest' })).toHaveAttribute('aria-expanded', 'false');
    });

    it('closes on Escape', () => {
        const onClose = vi.fn();
        renderViewer({ onClose });

        fireEvent.keyDown(document, { key: 'Escape' });

        expect(onClose).toHaveBeenCalledOnce();
    });

    it('moves through looks with the arrow keys', () => {
        renderViewer();
        Element.prototype.scrollIntoView.mockClear();

        fireEvent.keyDown(document, { key: 'ArrowDown' });

        expect(Element.prototype.scrollIntoView).toHaveBeenCalled();
    });

    it('disables the previous control on the first look', () => {
        renderViewer();

        expect(screen.getByRole('button', { name: 'gallery.previousLook' })).toBeDisabled();
        expect(screen.getByRole('button', { name: 'gallery.nextLook' })).toBeEnabled();
    });
});
