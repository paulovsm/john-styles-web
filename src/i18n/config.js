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

i18n
    .use(initReactI18next)
    .init({
        resources,
        lng: 'pt', // Force default to Portuguese
        fallbackLng: 'pt',
        interpolation: {
            escapeValue: false
        }
    });

export default i18n;
