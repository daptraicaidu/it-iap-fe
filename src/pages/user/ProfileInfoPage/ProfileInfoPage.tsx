import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, User } from "lucide-react";

const ProfileInfoPage = () => {
  const { t } = useTranslation("Profile");

  return (
    <main className="min-h-[100dvh] bg-zinc-50 text-zinc-900">
      <section className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 hover:text-zinc-900"
        >
          <ArrowLeft className="h-4 w-4 text-zinc-500" />
          {t("common.backToDashboard")}
        </Link>

        <div className="mt-8 rounded-xl border border-zinc-200 bg-white p-6 sm:p-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
            <User className="h-5 w-5" />
          </div>
          <h1 className="mt-5 text-2xl font-semibold tracking-tight text-zinc-900">
            {t("info.title")}
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-600">
            {t("info.description")}
          </p>
        </div>
      </section>
    </main>
  );
};

export default ProfileInfoPage;
