import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import enHomePage from "../locales/en/HomePage/translation.json";
import viHomePage from "../locales/vi/HomePage/translation.json";

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { HomePage: enHomePage },
      vi: { HomePage: viHomePage },
    },
    fallbackLng: "vi",
    defaultNS: "HomePage",
    ns: ["HomePage"],
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
    },
  });

export default i18n;
