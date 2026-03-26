import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import es from './locales/es.json';
import en from './locales/en.json';

export const SUPPORTED_LOCALES = ['es', 'en'];

// Number of non-empty path segments in the app base path.
// /communities-directory/ → 1   (production)
// /                        → 0   (local dev)
const BASE_SEGMENTS = import.meta.env.BASE_URL.split('/').filter(Boolean).length;

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      es: { translation: es },
      en: { translation: en },
    },
    fallbackLng: 'es',
    supportedLngs: SUPPORTED_LOCALES,
    // 'es-ES' automatically matches supported locale 'es'
    nonExplicitSupportedLngs: true,
    interpolation: { escapeValue: false },
    detection: {
      // 1. URL path segment (explicit, shareable)
      // 2. localStorage (returning user's choice)
      // 3. navigator.languages (browser preference list)
      order: ['path', 'localStorage', 'navigator'],
      // Skip BASE_SEGMENTS segments (e.g. /communities-directory/) to reach the locale segment
      lookupFromPathIndex: BASE_SEGMENTS,
      lookupLocalStorage: 'preferred-locale',
      // Automatically persist detected/switched locale to localStorage
      caches: ['localStorage'],
    },
  });

export default i18n;
