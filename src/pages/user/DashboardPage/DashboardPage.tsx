import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ArrowRight,
  Bot,
  ChevronDown,
  ClipboardCheck,
  LogOut,
  MessagesSquare,
  User,
  UserCog,
  Sparkles,
} from "lucide-react";
import useAuthStore from "../../../store/authStore";

const DashboardPage = () => {
  const { t } = useTranslation("Dashboard");
  const navigate = useNavigate();
  const logout = useAuthStore((s) => s.logout);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement | null>(null);

  const user = {
    name: t("user.name"),
    avatarUrl:
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=96&q=80",
  };

  const navigationItems = [
    { label: t("navigation.dashboard"), to: "/dashboard" },
    { label: t("navigation.history"), to: "/interview-history" },
    { label: t("navigation.chatbot"), to: "/chatbot" },
  ];

  const actions = [
    {
      title: t("actions.interview.title"),
      label: t("actions.interview.label"),
      description: t("actions.interview.description"),
      to: "/interview",
      icon: MessagesSquare,
      accent: "bg-indigo-50 text-indigo-600",
    },
    {
      title: t("actions.chatbot.title"),
      label: t("actions.chatbot.label"),
      description: t("actions.chatbot.description"),
      to: "/chatbot",
      icon: Bot,
      accent: "bg-zinc-100 text-zinc-600",
    },
    {
      title: t("actions.feedback.title"),
      label: t("actions.feedback.label"),
      description: t("actions.feedback.description"),
      to: "/feedback",
      icon: ClipboardCheck,
      accent: "bg-emerald-50 text-emerald-700",
    },
  ];

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setIsUserMenuOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <div className="w-full">

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <div className="mb-8 max-w-3xl sm:mb-10">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-medium text-zinc-600">
            <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
            {t("badge")}
          </div>
          <h1 className="text-3xl font-semibold leading-tight tracking-tight text-zinc-900 sm:text-4xl">
            {t("title")}
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-zinc-600">
            {t("subtitle")}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {actions.map((action) => {
            const Icon = action.icon;

            return (
              <Link
                key={action.to}
                to={action.to}
                className="group flex min-h-[240px] flex-col justify-between rounded-xl border border-zinc-200 bg-white p-6 transition hover:-translate-y-0.5 hover:border-zinc-300 hover:shadow-[0_4px_16px_rgba(0,0,0,0.04)] active:translate-y-0"
              >
                <div>
                  <div
                    className={`mb-5 flex h-12 w-12 items-center justify-center rounded-full ${action.accent}`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <p className="text-sm font-medium text-zinc-500">
                    {action.label}
                  </p>
                  <h2 className="mt-2 text-xl font-semibold tracking-tight text-zinc-900">
                    {action.title}
                  </h2>
                  <p className="mt-3 text-sm leading-6 text-zinc-600">
                    {action.description}
                  </p>
                </div>

                <div className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-zinc-900">
                  {t("openAction")}
                  <ArrowRight className="h-4 w-4 text-zinc-500 transition group-hover:translate-x-0.5" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
};

export default DashboardPage;
