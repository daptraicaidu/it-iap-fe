import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import enHomePage from "../locales/en/HomePage/translation.json";
import viHomePage from "../locales/vi/HomePage/translation.json";
import enAuth from "../locales/en/Auth/translation.json";
import viAuth from "../locales/vi/Auth/translation.json";
import enDashboard from "../locales/en/Dashboard/translation.json";
import viDashboard from "../locales/vi/Dashboard/translation.json";
import enProfile from "../locales/en/Profile/translation.json";
import viProfile from "../locales/vi/Profile/translation.json";

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        HomePage: enHomePage,
        Auth: enAuth,
        Dashboard: enDashboard,
        Profile: enProfile,
      },
      vi: {
        HomePage: viHomePage,
        Auth: viAuth,
        Dashboard: viDashboard,
        Profile: viProfile,
      },
    },
    fallbackLng: "vi",
    defaultNS: "HomePage",
    ns: ["HomePage", "Auth", "Dashboard", "Profile"],
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
    },
  });

export default i18n;
