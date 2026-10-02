import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from './locales/en';
import de from './locales/de';
import fr from './locales/fr';
import it from './locales/it';
import es from './locales/es';

export const defaultNS = 'translation';
export const resources = {
    en: { translation: en },
    de: { translation: de },
    fr: { translation: fr },
    it: { translation: it },
    es: { translation: es },
} as const;

void i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources,
        fallbackLng: 'en',
        supportedLngs: ['en', 'de', 'fr', 'it', 'es'],
        detection: {
            order: ['localStorage', 'navigator'],
            lookupLocalStorage: 'sport-amigo-lng',
            caches: ['localStorage'],
        },
        interpolation: {
            escapeValue: false,
        },
        defaultNS,
    });

export default i18n;
