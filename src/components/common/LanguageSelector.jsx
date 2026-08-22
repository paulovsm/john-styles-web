import React, { useEffect, useId, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Language } from '@mui/icons-material';

const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'pt', name: 'Português', flag: '🇧🇷' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
];

export default function LanguageSelector() {
    const { i18n, t } = useTranslation();
    const [open, setOpen] = useState(false);
    const containerRef = useRef(null);
    const triggerRef = useRef(null);
    const itemRefs = useRef([]);
    const menuId = useId();

    useEffect(() => {
        if (!open) return undefined;
        const onPointerDown = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) setOpen(false);
        };
        document.addEventListener('pointerdown', onPointerDown);
        return () => document.removeEventListener('pointerdown', onPointerDown);
    }, [open]);

    useEffect(() => {
        if (!open) return;
        const currentIndex = Math.max(0, languages.findIndex((language) => i18n.language?.startsWith(language.code)));
        itemRefs.current[currentIndex]?.focus();
    }, [open, i18n.language]);

    const closeMenu = (restoreFocus = true) => {
        setOpen(false);
        if (restoreFocus) requestAnimationFrame(() => triggerRef.current?.focus());
    };

    const changeLanguage = (language) => {
        i18n.changeLanguage(language);
        localStorage.setItem('language', language);
        closeMenu();
    };

    const handleMenuKeyDown = (event) => {
        const currentIndex = itemRefs.current.indexOf(document.activeElement);
        let nextIndex = currentIndex;
        if (event.key === 'ArrowDown') nextIndex = (currentIndex + 1) % languages.length;
        else if (event.key === 'ArrowUp') nextIndex = (currentIndex - 1 + languages.length) % languages.length;
        else if (event.key === 'Home') nextIndex = 0;
        else if (event.key === 'End') nextIndex = languages.length - 1;
        else if (event.key === 'Escape') {
            event.preventDefault();
            closeMenu();
            return;
        } else return;
        event.preventDefault();
        itemRefs.current[nextIndex]?.focus();
    };

    const current = languages.find((language) => i18n.language?.startsWith(language.code));

    return (
        <div className="relative" ref={containerRef}>
            <button
                ref={triggerRef}
                type="button"
                onClick={() => setOpen((value) => !value)}
                onKeyDown={(event) => {
                    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
                        event.preventDefault();
                        setOpen(true);
                    }
                }}
                aria-haspopup="menu"
                aria-controls={menuId}
                aria-expanded={open}
                aria-label={t('common.selectLanguage', 'Selecionar idioma')}
                className="flex min-h-11 items-center gap-1 rounded-md px-3 py-2 text-grey-medium transition-colors hover:bg-grey-light hover:text-brand-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-navy"
            >
                <Language fontSize="small" aria-hidden="true" />
                <span className="text-sm font-medium" aria-hidden="true">{current?.flag || '🌐'}</span>
            </button>

            {open && (
                <div
                    id={menuId}
                    role="menu"
                    aria-label={t('common.selectLanguage', 'Selecionar idioma')}
                    onKeyDown={handleMenuKeyDown}
                    className="absolute right-0 z-50 mt-2 w-44 rounded-md border border-control-border bg-white-pure py-1 shadow-lg"
                >
                    {languages.map((language, index) => {
                        const selected = i18n.language?.startsWith(language.code);
                        return (
                            <button
                                key={language.code}
                                ref={(node) => { itemRefs.current[index] = node; }}
                                type="button"
                                role="menuitemradio"
                                aria-checked={selected}
                                onClick={() => changeLanguage(language.code)}
                                className={`flex min-h-11 w-full items-center gap-2 px-4 py-2 text-left text-sm transition-colors hover:bg-grey-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-navy ${selected ? 'bg-grey-light font-semibold text-brand-navy' : 'text-grey-dark'}`}
                            >
                                <span aria-hidden="true">{language.flag}</span>
                                <span>{language.name}</span>
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
