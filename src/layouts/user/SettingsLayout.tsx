import { NavLink, Outlet } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { KeyRound, User, UserCog, Activity, Settings } from "lucide-react";

const SettingsLayout = () => {
  const { t } = useTranslation("Profile");

  const menuItems = [
    {
      to: "/settings",
      icon: Settings,
      label: t("settings.menu.general"),
    },
    {
      to: "/userinfo",
      icon: User,
      label: t("settings.menu.userInfo"),
    },
    {
      to: "/profiles",
      icon: UserCog,
      label: t("settings.menu.profiles"),
    },
    {
      to: "/password_and_security",
      icon: KeyRound,
      label: t("settings.menu.password"),
    },
    {
      to: "/activities",
      icon: Activity,
      label: t("settings.menu.activities"),
    },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 w-full flex flex-col md:flex-row gap-8">
      {/* Sidebar */}
      <aside className="w-full md:w-64 shrink-0">
        <h2 className="mb-4 px-2 text-lg font-semibold tracking-tight text-zinc-900">
          Cài đặt
        </h2>
        <nav className="flex flex-col gap-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  [
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition",
                    isActive
                      ? "bg-zinc-100 text-zinc-900"
                      : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900",
                  ].join(" ")
                }
              >
                <Icon className="h-4 w-4" />
                {item.label}
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
