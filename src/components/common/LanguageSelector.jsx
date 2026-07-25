import React, { useState, useRef, useEffect } from 'react';
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

    // Close on outside click / Escape
    useEffect(() => {
        if (!open) return;
        const onClick = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) setOpen(false);
        };
        const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
        document.addEventListener('mousedown', onClick);
        document.addEventListener('keydown', onKey);
        return () => {
            document.removeEventListener('mousedown', onClick);
            document.removeEventListener('keydown', onKey);
        };
    }, [open]);

    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
        localStorage.setItem('language', lng);
        setOpen(false);
    };

    const current = languages.find((l) => l.code === i18n.language) || languages.find((l) => i18n.language?.startsWith(l.code));

    return (
        <div className="relative" ref={containerRef}>
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                aria-haspopup="listbox"
                aria-expanded={open}
                aria-label={t('common.selectLanguage', 'Selecionar idioma')}
                className="flex items-center space-x-1 px-3 py-2 rounded-md text-grey-medium hover:text-brand-navy hover:bg-white-off transition-colors focus:outline-none focus:ring-2 focus:ring-brand-navy"
            >
                <Language fontSize="small" />
                <span className="text-sm font-medium">{current?.flag || '🌐'}</span>
            </button>

            {open && (
                <ul
                    role="listbox"
                    className="absolute right-0 mt-2 w-40 bg-white-pure rounded-md shadow-lg border border-grey-light z-50 py-1"
                >
                    {languages.map((lang) => (
                        <li key={lang.code} role="option" aria-selected={i18n.language === lang.code}>
                            <button
                                type="button"
                                onClick={() => changeLanguage(lang.code)}
                                className={`w-full text-left px-4 py-2 text-sm hover:bg-white-off transition-colors flex items-center space-x-2 ${i18n.language === lang.code ? 'bg-brand-navy/5 text-brand-navy font-medium' : 'text-grey-dark'}`}
                            >
                                <span>{lang.flag}</span>
                                <span>{lang.name}</span>
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
