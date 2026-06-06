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
    <main className="min-h-[100dvh] bg-zinc-50 text-zinc-900">
      <header className="border-b border-zinc-200 bg-zinc-50/85 backdrop-blur">
        <div className="mx-auto flex min-h-16 max-w-7xl flex-col gap-3 px-4 py-3 sm:px-6 md:h-16 md:flex-row md:items-center md:justify-between md:py-0 lg:px-8">
          <Link
            to="/"
            className="shrink-0 text-sm font-semibold tracking-tight text-zinc-900"
          >
            {t("brand")}
          </Link>

          <div className="flex w-full flex-col gap-3 md:w-auto md:flex-row md:items-center md:gap-6">
            <nav
              aria-label={t("navigation.label")}
              className="flex w-full gap-1 overflow-x-auto rounded-full border border-zinc-200 bg-white p-1 md:w-auto"
            >
              {navigationItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    [
                      "whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition",
                      isActive
                        ? "bg-zinc-900 text-white"
                        : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900",
                    ].join(" ")
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>

            <div ref={userMenuRef} className="relative">
              <button
                type="button"
                aria-haspopup="menu"
                aria-expanded={isUserMenuOpen}
                onClick={() => setIsUserMenuOpen((current) => !current)}
                className="flex h-11 w-full items-center justify-between gap-3 rounded-full border border-zinc-200 bg-white py-1.5 pl-1.5 pr-3 text-sm font-medium text-zinc-900 transition hover:bg-zinc-50 active:scale-[0.98] md:w-auto"
              >
                <span className="flex min-w-0 items-center gap-3">
                  <img
                    src={user.avatarUrl}
                    alt={t("user.avatarAlt")}
                    className="h-8 w-8 rounded-full object-cover"
                  />
                  <span className="truncate">{user.name}</span>
                </span>
                <ChevronDown
                  className={`h-4 w-4 shrink-0 text-zinc-500 transition ${
                    isUserMenuOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {isUserMenuOpen ? (
                <div
                  role="menu"
                  className="absolute right-0 z-20 mt-2 w-full min-w-56 rounded-xl border border-zinc-200 bg-white p-2 shadow-[0_16px_40px_rgba(24,24,27,0.08)] md:w-64"
                >
                  <Link
                    to="/info"
                    role="menuitem"
                    onClick={() => setIsUserMenuOpen(false)}
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 hover:text-zinc-900"
                  >
                    <User className="h-4 w-4 text-zinc-500" />
                    {t("userMenu.personalInfo")}
                  </Link>
                  <Link
                    to="/profile"
                    role="menuitem"
                    onClick={() => setIsUserMenuOpen(false)}
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 hover:text-zinc-900"
                  >
                    <UserCog className="h-4 w-4 text-zinc-500" />
                    {t("userMenu.manageProfile")}
                  </Link>
                  <div className="my-2 h-px bg-zinc-200" />
                  <button
                    type="button"
                    role="menuitem"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-rose-700 transition hover:bg-rose-50"
                  >
                    <LogOut className="h-4 w-4" />
                    {t("logout")}
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </header>

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
    </main>
  );
};

export default DashboardPage;
