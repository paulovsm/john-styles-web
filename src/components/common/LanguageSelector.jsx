import React from 'react';
import { useTranslation } from 'react-i18next';
import { Language } from '@mui/icons-material';

export default function LanguageSelector() {
    const { i18n } = useTranslation();

    const languages = [
        { code: 'en', name: 'English', flag: '🇺🇸' },
        { code: 'pt', name: 'Português', flag: '🇧🇷' },
        { code: 'es', name: 'Español', flag: '🇪🇸' }
    ];

    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
        localStorage.setItem('language', lng);
    };

    return (
        <div className="relative group">
            <button className="flex items-center space-x-1 px-3 py-2 rounded-md text-grey-medium hover:text-fleek-navy hover:bg-white-off transition-colors">
                <Language fontSize="small" />
                <span className="text-sm font-medium">{languages.find(l => l.code === i18n.language)?.flag || '🌐'}</span>
            </button>

            <div className="absolute right-0 mt-2 w-40 bg-white-pure rounded-md shadow-lg border border-grey-light opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                {languages.map((lang) => (
                    <button
                        key={lang.code}
                        onClick={() => changeLanguage(lang.code)}
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-white-off transition-colors flex items-center space-x-2 ${i18n.language === lang.code ? 'bg-fleek-navy/5 text-fleek-navy font-medium' : 'text-grey-dark'
                            }`}
                    >
                        <span>{lang.flag}</span>
                        <span>{lang.name}</span>
                    </button>
                ))}
            </div>
        </div>
    );
}
