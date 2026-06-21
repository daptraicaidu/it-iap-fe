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
import enFooterPages from "../locales/en/FooterPages/translation.json";
import viFooterPages from "../locales/vi/FooterPages/translation.json";
import enAdminUsers from "../locales/en/AdminUsers/translation.json";
import viAdminUsers from "../locales/vi/AdminUsers/translation.json";
import enAdminQuestions from "../locales/en/AdminQuestions/translation.json";
import viAdminQuestions from "../locales/vi/AdminQuestions/translation.json";

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
        FooterPages: enFooterPages,
        AdminUsers: enAdminUsers,
        AdminQuestions: enAdminQuestions,
      },
      vi: {
        HomePage: viHomePage,
        Auth: viAuth,
        Dashboard: viDashboard,
        Profile: viProfile,
        FooterPages: viFooterPages,
        AdminUsers: viAdminUsers,
        AdminQuestions: viAdminQuestions,
      },
    },
    fallbackLng: "vi",
    defaultNS: "HomePage",
    ns: ["HomePage", "Auth", "Dashboard", "Profile", "FooterPages", "AdminUsers", "AdminQuestions"],
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
    },
  });

export default i18n;
