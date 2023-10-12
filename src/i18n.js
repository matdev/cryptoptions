import i18n from "i18next";
import i18nBackend from "i18next-http-backend";
import { initReactI18next } from "react-i18next";

import translationEN from "./locales/en/translation.json";
import translationFR from "./locales/fr/translation.json";

i18n
    .use(i18nBackend)
    .use(initReactI18next)
    .init({
        fallbackLng: "en",
        lng: "en",
        interpolation: {
            escapeValue: false,
        },
        resources: {
            en: {
                translation: translationEN
            },
            fr: {
                translation: translationFR
            }
        },
    });

export default i18n;
