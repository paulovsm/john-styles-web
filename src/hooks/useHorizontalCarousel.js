import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Wiring shared by the dashboard's horizontal photo strips: the scroller ref,
 * the arrow handler, and whether the strip actually overflows.
 *
 * `canScroll` is MEASURED rather than derived from the item count. The photos
 * are fixed-width, so the count at which a strip starts to overflow depends on
 * the card it sits in and on the breakpoint — a 3-piece look already spills out
 * of a half-width card on desktop. Counting items therefore either hides the
 * arrows while content is clipped, or shows arrows that scroll nowhere.
 *
 * @param {number} itemCount - re-measure whenever the strip's contents change
 */
export function useHorizontalCarousel(itemCount = 0) {
    const scroller = useRef(null);
    const [canScroll, setCanScroll] = useState(false);

    useEffect(() => {
        const el = scroller.current;
        if (!el) return;

        // 1px of slack: sub-pixel layout rounding otherwise reports a phantom
        // overflow on strips that fit exactly.
        const measure = () => setCanScroll(el.scrollWidth > el.clientWidth + 1);
        measure();

        // Catches breakpoint changes and any resize of the surrounding card.
        const observer = new ResizeObserver(measure);
        observer.observe(el);
        return () => observer.disconnect();
    }, [itemCount]);

    const scrollByDir = useCallback((dir) => {
        const el = scroller.current;
        if (el) el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: 'smooth' });
    }, []);

    return { scroller, canScroll, scrollByDir };
}
