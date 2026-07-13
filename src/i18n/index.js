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
import enAdminPrompts from "../locales/en/AdminPrompts/translation.json";
import viAdminPrompts from "../locales/vi/AdminPrompts/translation.json";
import enInterview from "../locales/en/Interview/translation.json";
import viInterview from "../locales/vi/Interview/translation.json";
import enChatbot from "../locales/en/Chatbot/translation.json";
import viChatbot from "../locales/vi/Chatbot/translation.json";
import enReport from "../locales/en/Report/translation.json";
import viReport from "../locales/vi/Report/translation.json";
import enAdminReports from "../locales/en/AdminReports/translation.json";
import viAdminReports from "../locales/vi/AdminReports/translation.json";

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
        AdminPrompts: enAdminPrompts,
        Interview: enInterview,
        Chatbot: enChatbot,
        Report: enReport,
        AdminReports: enAdminReports,
      },
      vi: {
        HomePage: viHomePage,
        Auth: viAuth,
        Dashboard: viDashboard,
        Profile: viProfile,
        FooterPages: viFooterPages,
        AdminUsers: viAdminUsers,
        AdminQuestions: viAdminQuestions,
        AdminPrompts: viAdminPrompts,
        Interview: viInterview,
        Chatbot: viChatbot,
        Report: viReport,
        AdminReports: viAdminReports,
      },
    },
    fallbackLng: "vi",
    defaultNS: "HomePage",
    ns: ["HomePage", "Auth", "Dashboard", "Profile", "FooterPages", "AdminUsers", "AdminQuestions", "AdminPrompts", "Interview", "Chatbot", "Report", "AdminReports"],
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
    },
  });

export default i18n;
