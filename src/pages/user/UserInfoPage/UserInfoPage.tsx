import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowRight, KeyRound, User } from "lucide-react";

const UserInfoPage = () => {
  const { t } = useTranslation("Profile");

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-6 sm:p-8">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
        <User className="h-5 w-5" />
      </div>
      <h1 className="mt-5 text-2xl font-semibold tracking-tight text-zinc-900">
        {t("info.title")}
      </h1>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-600">
        {t("info.description")}
      </p>

      <div className="mt-8 border-t border-zinc-200 pt-6">
        <Link
          to="/password_and_security"
          className="group flex items-center justify-between gap-4 rounded-xl border border-zinc-200 bg-white p-4 transition hover:bg-zinc-50"
        >
          <span className="flex min-w-0 items-center gap-4">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-zinc-500">
              <KeyRound className="h-4 w-4" />
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-semibold text-zinc-900">
                {t("info.changePasswordTitle")}
              </span>
              <span className="mt-1 block text-sm leading-6 text-zinc-600">
                {t("info.changePasswordDescription")}
              </span>
            </span>
          </span>
          <ArrowRight className="h-4 w-4 shrink-0 text-zinc-500 transition group-hover:translate-x-0.5" />
        </Link>
      </div>
    </div>
  );
};

export default UserInfoPage;
