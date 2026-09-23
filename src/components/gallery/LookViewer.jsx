import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Close, ExpandLess, KeyboardArrowDown, KeyboardArrowUp } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

/**
 * Full-bleed viewer for saved looks.
 *
 * One scroll-snap list drives both breakpoints: on a phone the finger moves it,
 * on a desktop the arrow buttons and the keyboard do. That keeps a single source
 * of truth for which look is on screen instead of two parallel implementations.
 *
 * The request text sits over the photo, clamped to two lines, and expands in
 * place — the grid cards stay clamped so the gallery never reflows underneath.
 */
export default function LookViewer({ items, startIndex = 0, onClose, formatDate }) {
    const { t } = useTranslation();
    const scrollerRef = useRef(null);
    const closeRef = useRef(null);
    const itemRefs = useRef([]);
    const [activeIndex, setActiveIndex] = useState(startIndex);
    const [expandedIndex, setExpandedIndex] = useState(null);

    const goTo = useCallback((index) => {
        const clamped = Math.max(0, Math.min(index, items.length - 1));
        itemRefs.current[clamped]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, [items.length]);

    // Jump to the tapped look before the first paint the user sees, so opening
    // the viewer never looks like it starts at the top and then scrolls. This
    // has to be layout-effect: useEffect runs after the paint, so the first
    // frame would show look 0 whenever the tapped one is further down.
    useLayoutEffect(() => {
        itemRefs.current[startIndex]?.scrollIntoView({ block: 'start' });
        closeRef.current?.focus();
    }, [startIndex]);

    useEffect(() => {
        const previouslyFocused = document.activeElement;
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'unset';
            if (previouslyFocused instanceof HTMLElement) previouslyFocused.focus();
        };
    }, []);

    useEffect(() => {
        const onKeyDown = (event) => {
            if (event.key === 'Escape') onClose();
            else if (event.key === 'ArrowDown' || event.key === 'ArrowRight') goTo(activeIndex + 1);
            else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') goTo(activeIndex - 1);
        };
        document.addEventListener('keydown', onKeyDown);
        return () => document.removeEventListener('keydown', onKeyDown);
    }, [activeIndex, goTo, onClose]);

    // Whichever look covers most of the viewport is the active one; the arrows
    // and the keyboard both read this instead of tracking scroll offsets.
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (!entry.isIntersecting) return;
                    const index = Number(entry.target.dataset.index);
                    setActiveIndex(index);
                    setExpandedIndex((current) => (current === index ? current : null));
                });
            },
            { root: scrollerRef.current, threshold: 0.6 },
        );
        itemRefs.current.forEach((node) => node && observer.observe(node));
        return () => observer.disconnect();
    }, [items.length]);

    return createPortal(
        <div
            className="fixed inset-0 z-50 bg-brand-navy"
            role="dialog"
            aria-modal="true"
            aria-label={t('gallery.title')}
        >
            <button
                ref={closeRef}
                type="button"
                onClick={onClose}
                aria-label={t('common.close', 'Fechar')}
                className="absolute right-3 top-3 z-20 grid h-11 w-11 place-items-center rounded-full bg-brand-navy/70 text-white-pure backdrop-blur transition-colors hover:bg-brand-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white-pure"
            >
                <Close />
            </button>

            <div
                ref={scrollerRef}
                className="h-dvh snap-y snap-mandatory overflow-y-auto overscroll-contain"
            >
                {items.map((item, index) => {
                    const expanded = expandedIndex === index;
                    return (
                        <section
                            key={item.id}
                            data-index={index}
                            ref={(node) => { itemRefs.current[index] = node; }}
                            className="relative flex h-dvh snap-start items-center justify-center"
                        >
                            <img
                                src={item.imageUrl}
                                alt={item.createdAt
                                    ? t('gallery.savedLookAlt', { date: formatDate(item.createdAt) })
                                    : t('gallery.savedLook', 'Look salvo')}
                                className="max-h-full max-w-full object-contain"
                                loading={Math.abs(index - startIndex) <= 1 ? 'eager' : 'lazy'}
                            />

                            {/* The scrim keeps the caption readable over looks that end light. */}
                            <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-brand-navy via-brand-navy/80 to-transparent pt-16">
                                <div className="pointer-events-auto px-4 pb-6 sm:px-6">
                                    <p className="mb-1 text-xs text-white-pure/70">{formatDate(item.createdAt)}</p>

                                    {item.prompt && (
                                        <button
                                            type="button"
                                            onClick={() => setExpandedIndex(expanded ? null : index)}
                                            aria-expanded={expanded}
                                            aria-label={expanded ? t('gallery.collapseRequest') : t('gallery.expandRequest')}
                                            className="w-full rounded text-left text-sm text-white-pure focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white-pure"
                                        >
                                            <span className={expanded ? 'block max-h-[40dvh] overflow-y-auto overscroll-contain' : 'line-clamp-2'}>
                                                <span className="mr-1 font-semibold">{t('gallery.requestLabel')}:</span>
                                                {item.prompt}
                                            </span>
                                            <span className="mt-1 flex items-center gap-1 text-xs text-white-pure/70">
                                                {expanded ? <ExpandLess fontSize="inherit" /> : null}
                                                {expanded ? t('gallery.collapseRequest') : t('gallery.expandRequest')}
                                            </span>
                                        </button>
                                    )}
                                </div>
                            </div>
                        </section>
                    );
                })}
            </div>

            {/* Pointer users get explicit controls; the snap list still responds to
                the wheel, so neither input method is the only way through. */}
            <div className="pointer-events-none absolute inset-y-0 right-3 hidden items-center lg:flex">
                <div className="pointer-events-auto flex flex-col gap-2">
                    <button
                        type="button"
                        onClick={() => goTo(activeIndex - 1)}
                        disabled={activeIndex === 0}
                        aria-label={t('gallery.previousLook')}
                        className="grid h-11 w-11 place-items-center rounded-full bg-brand-navy/70 text-white-pure backdrop-blur transition-opacity hover:bg-brand-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white-pure disabled:opacity-30"
                    >
                        <KeyboardArrowUp />
                    </button>
                    <button
                        type="button"
                        onClick={() => goTo(activeIndex + 1)}
                        disabled={activeIndex === items.length - 1}
                        aria-label={t('gallery.nextLook')}
                        className="grid h-11 w-11 place-items-center rounded-full bg-brand-navy/70 text-white-pure backdrop-blur transition-opacity hover:bg-brand-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white-pure disabled:opacity-30"
                    >
                        <KeyboardArrowDown />
                    </button>
                </div>
            </div>
        </div>,
        document.body,
    );
}
