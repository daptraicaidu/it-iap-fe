import { useTranslation } from "react-i18next";
import { Settings, Globe, Check } from "lucide-react";

const languages = [
  {
    code: "vi",
    nameKey: "settings.general.vietnamese",
    descKey: "settings.general.vietnameseDesc",
    flag: "🇻🇳",
    nativeName: "Tiếng Việt",
  },
  {
    code: "en",
    nameKey: "settings.general.english",
    descKey: "settings.general.englishDesc",
    flag: "🇺🇸",
    nativeName: "English",
  },
];

const GeneralSettingsPage = () => {
  const { t, i18n } = useTranslation("Profile");

  // Determine current active language (strip regional suffix like 'vi-VN' to 'vi')
  const currentLang = i18n.language ? i18n.language.split("-")[0] : "vi";

  const handleLanguageChange = (langCode: string) => {
    localStorage.setItem("i18nextLng", langCode);
    i18n.changeLanguage(langCode);
  };

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-6 sm:p-8">
      {/* Header Section */}
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
        <Settings className="h-5 w-5" />
      </div>
      <h1 className="mt-5 text-2xl font-semibold tracking-tight text-zinc-900">
        {t("settings.general.title")}
      </h1>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600">
        {t("settings.general.description")}
      </p>

      {/* Language Section */}
      <div className="mt-8 border-t border-zinc-200 pt-8">
        <div className="flex items-center gap-2 mb-2">
          <Globe className="h-5 w-5 text-zinc-700" />
          <h2 className="text-lg font-semibold text-zinc-900">
            {t("settings.general.languageSection")}
          </h2>
        </div>
        <p className="text-sm text-zinc-500 mb-6">
          {t("settings.general.languageDescription")}
        </p>

        {/* Options Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
          {languages.map((lang) => {
            const isSelected = currentLang === lang.code;

            return (
              <button
                key={lang.code}
                type="button"
                onClick={() => handleLanguageChange(lang.code)}
                className={`relative flex items-start gap-4 rounded-xl border p-4 text-left transition-all ${
                  isSelected
                    ? "border-zinc-900 bg-zinc-50/80 shadow-sm ring-1 ring-zinc-900"
                    : "border-zinc-200 bg-white hover:border-zinc-300 hover:bg-zinc-50/50"
                }`}
              >
                <span className="text-2xl select-none" role="img" aria-label={lang.nativeName}>
                  {lang.flag}
                </span>

                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-zinc-900">
                      {t(lang.nameKey)}
                    </span>
                    {isSelected && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-zinc-900 px-2 py-0.5 text-[11px] font-medium text-white">
                        <Check className="h-3 w-3" />
                        {t("settings.general.activeLanguage")}
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-zinc-500">
                    {t(lang.descKey)}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default GeneralSettingsPage;
