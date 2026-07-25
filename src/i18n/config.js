import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import pt from './locales/pt.json';
import es from './locales/es.json';

const resources = {
    en: { translation: en },
    pt: { translation: pt },
    es: { translation: es }
};

// Restore the user's previously selected language (LanguageSelector persists it).
const SUPPORTED = ['en', 'pt', 'es'];
let savedLanguage = 'pt';
try {
    const stored = localStorage.getItem('language');
    if (stored && SUPPORTED.includes(stored)) savedLanguage = stored;
} catch {
    // localStorage unavailable — fall back to default
}

i18n
    .use(initReactI18next)
    .init({
        resources,
        lng: savedLanguage,
        fallbackLng: 'pt',
        supportedLngs: SUPPORTED,
        interpolation: {
            escapeValue: false
        }
    });

export default i18n;
