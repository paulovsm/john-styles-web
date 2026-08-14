import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useHorizontalCarousel } from './useHorizontalCarousel';

// jsdom never lays anything out, so scrollWidth/clientWidth are both 0. Each
// test stubs the pair it needs to describe a strip that fits or overflows.
function stubWidths({ scrollWidth, clientWidth }) {
    const scrollBy = vi.fn();
    const proto = window.HTMLElement.prototype;
    vi.spyOn(proto, 'scrollWidth', 'get').mockReturnValue(scrollWidth);
    vi.spyOn(proto, 'clientWidth', 'get').mockReturnValue(clientWidth);
    proto.scrollBy = scrollBy;
    return scrollBy;
}

function Carousel({ itemCount }) {
    const { scroller, canScroll, scrollByDir } = useHorizontalCarousel(itemCount);
    return (
        <div>
            <div ref={scroller} data-testid="scroller" />
            {canScroll && (
                <button type="button" onClick={() => scrollByDir(1)}>next</button>
            )}
        </div>
    );
}

describe('useHorizontalCarousel', () => {
    it('hides the arrows when the strip fits', () => {
        stubWidths({ scrollWidth: 500, clientWidth: 562 });
        render(<Carousel itemCount={2} />);
        expect(screen.queryByRole('button', { name: 'next' })).not.toBeInTheDocument();
    });

    it('shows the arrows as soon as the strip overflows, regardless of item count', () => {
        // The regression this guards: 3 photos already overflow a half-width
        // card, so a count-based gate (`length > 3`) clipped the last one with
        // no way to scroll to it.
        stubWidths({ scrollWidth: 600, clientWidth: 562 });
        render(<Carousel itemCount={3} />);
        expect(screen.getByRole('button', { name: 'next' })).toBeInTheDocument();
    });

    it('treats a sub-pixel difference as fitting', () => {
        stubWidths({ scrollWidth: 563, clientWidth: 562 });
        render(<Carousel itemCount={3} />);
        expect(screen.queryByRole('button', { name: 'next' })).not.toBeInTheDocument();
    });

    it('scrolls by most of a viewport in the requested direction', async () => {
        const scrollBy = stubWidths({ scrollWidth: 1000, clientWidth: 500 });
        render(<Carousel itemCount={6} />);

        screen.getByRole('button', { name: 'next' }).click();
        expect(scrollBy).toHaveBeenCalledWith({ left: 400, behavior: 'smooth' });
    });
});
