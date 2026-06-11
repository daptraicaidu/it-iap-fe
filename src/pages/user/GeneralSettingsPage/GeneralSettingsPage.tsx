import { useTranslation } from "react-i18next";
import { Settings } from "lucide-react";

const GeneralSettingsPage = () => {
  const { t } = useTranslation("Profile");

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-6 sm:p-8">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
        <Settings className="h-5 w-5" />
      </div>
      <h1 className="mt-5 text-2xl font-semibold tracking-tight text-zinc-900">
        {t("settings.general.title")}
      </h1>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-600">
        {t("settings.general.description")}
      </p>

      <div className="mt-8 border-t border-zinc-200 pt-6">
        <div className="text-sm text-zinc-500 text-center py-8">
          Tính năng đang được phát triển...
        </div>
      </div>
    </div>
  );
};

export default GeneralSettingsPage;
