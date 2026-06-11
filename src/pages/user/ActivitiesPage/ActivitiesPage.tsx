import { useTranslation } from "react-i18next";
import { Activity } from "lucide-react";

const ActivitiesPage = () => {
  const { t } = useTranslation("Profile");

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-6 sm:p-8">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
        <Activity className="h-5 w-5" />
      </div>
      <h1 className="mt-5 text-2xl font-semibold tracking-tight text-zinc-900">
        {t("settings.activities.title")}
      </h1>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-600">
        {t("settings.activities.description")}
      </p>

      <div className="mt-8 flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-300 py-12 text-center">
        <Activity className="h-8 w-8 text-zinc-400 mb-3" />
        <h3 className="text-sm font-medium text-zinc-900">{t("settings.activities.emptyTitle")}</h3>
        <p className="mt-1 text-sm text-zinc-500">
          {t("settings.activities.emptyDescription")}
        </p>
      </div>
    </div>
  );
};

export default ActivitiesPage;
