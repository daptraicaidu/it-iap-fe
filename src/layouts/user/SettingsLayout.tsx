import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useEffect, useRef } from "react";
import {
  KeyRound,
  User,
  UserCog,
  Activity,
  Settings,
  ShieldCheck,
} from "lucide-react";

const SettingsLayout = () => {
  const { t } = useTranslation("Profile");
  const location = useLocation();
  const navRef = useRef<HTMLElement | null>(null);

  const isAdmin = location.pathname.startsWith("/admin");
  const prefix = isAdmin ? "/admin/settings" : "";

  const menuItems = [
    {
      to: isAdmin ? "/admin/settings" : "/settings",
      icon: Settings,
      label: t("settings.menu.general"),
      end: true,
    },
    {
      to: `${prefix}/userinfo`,
      icon: User,
      label: t("settings.menu.userInfo"),
    },
    {
      to: `${prefix}/profiles`,
      icon: UserCog,
      label: t("settings.menu.profiles"),
    },
    {
      to: `${prefix}/password_and_security`,
      icon: KeyRound,
      label: t("settings.menu.password"),
    },
    {
      to: `${prefix}/active_sessions`,
      icon: ShieldCheck,
      label: t("settings.menu.sessions"),
    },
    {
      to: `${prefix}/activities`,
      icon: Activity,
      label: t("settings.menu.activities"),
    },
  ];

  // Auto-scroll active menu link into view on route change / reload (especially for mobile horizontal scrollbar)
  useEffect(() => {
    const scrollToActive = () => {
      if (!navRef.current) return;
      const activeEl = navRef.current.querySelector<HTMLElement>("a.active");
      if (activeEl) {
        const navContainer = navRef.current;
        const scrollLeft =
          activeEl.offsetLeft -
          navContainer.clientWidth / 2 +
          activeEl.clientWidth / 2;

        navContainer.scrollTo({
          left: Math.max(0, scrollLeft),
          behavior: "smooth",
        });
      }
    };

    scrollToActive();
    const timer1 = setTimeout(scrollToActive, 50);
    const timer2 = setTimeout(scrollToActive, 150);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [location.pathname]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 w-full flex flex-col lg:flex-row gap-6 lg:gap-8">
      {/* Sidebar Navigation */}
      <aside className="w-full lg:w-64 shrink-0">
        {/* Hidden title on < 1024px to save vertical space */}
        <h2 className="hidden lg:block mb-4 px-2 text-lg font-semibold tracking-tight text-zinc-900">
          Cài đặt
        </h2>

        {/* 
          Responsive navigation menu:
          - Screen < 1024px (mobile & tablet): Horizontal scrollable pill list with visible styled scrollbar.
          - Screen >= 1024px (desktop): Clean vertical sidebar navigation without scrollbar.
        */}
        <nav
          ref={navRef}
          className="flex flex-row overflow-x-auto pb-2 lg:pb-0 lg:flex-col gap-2 lg:gap-1 border-b border-zinc-200 lg:border-none [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-track]:bg-zinc-100 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-thumb]:bg-zinc-300 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-zinc-400 lg:[&::-webkit-scrollbar]:hidden [scrollbar-width:thin] [scrollbar-color:theme(colors.zinc.300)_theme(colors.zinc.100)] lg:[scrollbar-width:none]"
        >
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  [
                    "flex items-center gap-2.5 whitespace-nowrap transition text-sm font-medium shrink-0",
                    "px-3.5 py-2 rounded-full border lg:border-0 lg:rounded-lg lg:px-3 lg:py-2.5",
                    isActive
                      ? "bg-zinc-900 text-white border-zinc-900 lg:bg-zinc-100 lg:text-zinc-900 active"
                      : "bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-50 hover:text-zinc-900 lg:bg-transparent",
                  ].join(" ")
                }
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 min-w-0">
        <Outlet />
      </div>
    </div>
  );
};

export default SettingsLayout;
