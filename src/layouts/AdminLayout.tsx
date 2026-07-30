import { useEffect, useMemo, useRef, useState } from "react";
import {
  Bell,
  Compass,
  FileText,
  Flag,
  HelpCircle,
  Home,
  LogOut,
  Menu,
  MessageSquare,
  Megaphone,
  Settings,
  Users,
  X,
  ChevronDown,
} from "lucide-react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import useAuthStore from "../store/authStore";
import userInfoService, { type UserInfo } from "../services/user/userInfoService";

import logoImg from "../assets/logo/logo.png";
import defaultAvatar1 from "../assets/avatardefault/avatar1.png";
import defaultAvatar2 from "../assets/avatardefault/avatar2.png";
import defaultAvatar3 from "../assets/avatardefault/avatar3.png";
import defaultAvatar4 from "../assets/avatardefault/avatar4.png";
import defaultAvatar5 from "../assets/avatardefault/avatar5.png";

const defaultAvatars = [
  defaultAvatar1,
  defaultAvatar2,
  defaultAvatar3,
  defaultAvatar4,
  defaultAvatar5,
];

interface SidebarItem {
  key: string;
  to: string;
  icon: typeof Home;
}

const sidebarItems: SidebarItem[] = [
  { key: "dashboard", to: "/admin/dashboard", icon: Home },
  { key: "users", to: "/admin/users", icon: Users },
  { key: "questions", to: "/admin/questions", icon: HelpCircle },
  { key: "prompts", to: "/admin/prompts", icon: FileText },
  { key: "reports", to: "/admin/reports", icon: Flag },
  { key: "feedbacks", to: "/admin/feedbacks", icon: MessageSquare },
  { key: "notifications", to: "/admin/notifications", icon: Bell },
  { key: "banners", to: "/admin/banners", icon: Megaphone },
  { key: "settings", to: "/admin/settings", icon: Settings },
];

const getRouteKey = (pathname: string) => {
  if (pathname.includes("/admin/users")) return "users";
  if (pathname.includes("/admin/questions")) return "questions";
  if (pathname.includes("/admin/prompts")) return "prompts";
  if (pathname.includes("/admin/reports")) return "reports";
  if (pathname.includes("/admin/feedbacks")) return "feedbacks";
  if (pathname.includes("/admin/notifications")) return "notifications";
  if (pathname.includes("/admin/banners")) return "banners";
  if (pathname.includes("/admin/settings")) return "settings";
  return "dashboard";
};

const AdminLayout = () => {
  const { t } = useTranslation("AdminLayout");
  const navigate = useNavigate();
  const location = useLocation();
  const logout = useAuthStore((state) => state.logout);

  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Fetch admin user info
  useEffect(() => {
    userInfoService
      .getUserInfo()
      .then((res) => {
        if (res.data?.data) {
          setUserInfo(res.data.data);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch admin info", err);
      });
  }, []);

  // Close user menu on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close mobile sidebar on route change
  useEffect(() => {
    setIsMobileOpen(false);
  }, [location.pathname]);

  // Compute avatar URL or random default avatar
  const avatarSrc = useMemo(() => {
    if (userInfo?.avatarUrl) return userInfo.avatarUrl;
    const userId = userInfo?.id || "admin";
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      hash = userId.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % defaultAvatars.length;
    return defaultAvatars[index];
  }, [userInfo?.avatarUrl, userInfo?.id]);

  const adminName = userInfo?.fullName || "Admin";
  const adminEmail = userInfo?.email || "";

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const handleSwitchToUserWorkspace = () => {
    navigate("/dashboard");
  };

  const currentRouteKey = getRouteKey(location.pathname);

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 text-zinc-900">
      <div className="flex flex-1 min-h-0">
        {/* Desktop Sidebar */}
        <aside className="hidden w-64 shrink-0 border-r border-zinc-200 bg-white px-4 py-5 md:flex md:flex-col">
          {/* Logo Brand Header */}
          <div className="mb-6 flex items-center justify-between px-2">
            <NavLink to="/admin/dashboard" className="flex items-center gap-2">
              <img src={logoImg} alt="Interview AI Logo" className="h-9 w-auto object-contain" />
            </NavLink>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-1 flex-col gap-1">
            {sidebarItems.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    [
                      "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-zinc-900 text-white shadow-sm"
                        : "text-zinc-600 hover:bg-zinc-100/80 hover:text-zinc-900",
                    ].join(" ")
                  }
                >
                  <Icon className="h-4 w-4" strokeWidth={1.8} />
                  <span>{t(`menu.${item.key}`)}</span>
                </NavLink>
              );
            })}
          </nav>

          {/* Bottom Actions: User Platform & Logout */}
          <div className="mt-6 flex flex-col gap-2 pt-4 border-t border-zinc-200">
            <button
              type="button"
              onClick={handleSwitchToUserWorkspace}
              className="flex items-center gap-3 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-sm font-medium text-zinc-700 transition-all hover:bg-zinc-100 hover:text-zinc-900 active:scale-[0.98]"
              title={t("sidebar.userPlatform")}
            >
              <Compass className="h-4 w-4 text-indigo-600" strokeWidth={1.8} />
              <span className="flex-1 text-left">{t("sidebar.userPlatform")}</span>
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-rose-600 transition-colors hover:bg-rose-50 hover:text-rose-700 active:scale-[0.98]"
            >
              <LogOut className="h-4 w-4" strokeWidth={1.8} />
              <span>{t("sidebar.logout")}</span>
            </button>
          </div>
        </aside>

        {/* Mobile Sidebar Overlay & Drawer */}
        {isMobileOpen && (
          <div
            className="fixed inset-0 z-40 bg-zinc-900/50 backdrop-blur-sm md:hidden transition-opacity"
            onClick={() => setIsMobileOpen(false)}
          />
        )}

        <aside
          className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-white px-4 py-5 shadow-2xl transition-transform duration-300 md:hidden ${
            isMobileOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="mb-6 flex items-center justify-between px-2">
            <NavLink to="/admin/dashboard" className="flex items-center gap-2">
              <img src={logoImg} alt="Interview AI Logo" className="h-9 w-auto object-contain" />
            </NavLink>
            <button
              type="button"
              onClick={() => setIsMobileOpen(false)}
              className="rounded-full p-1.5 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <nav className="flex flex-1 flex-col gap-1 overflow-y-auto">
            {sidebarItems.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    [
                      "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-zinc-900 text-white"
                        : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900",
                    ].join(" ")
                  }
                >
                  <Icon className="h-4 w-4" strokeWidth={1.8} />
                  <span>{t(`menu.${item.key}`)}</span>
                </NavLink>
              );
            })}
          </nav>

          <div className="mt-6 flex flex-col gap-2 pt-4 border-t border-zinc-200">
            <button
              type="button"
              onClick={handleSwitchToUserWorkspace}
              className="flex items-center gap-3 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-sm font-medium text-zinc-700 transition-all hover:bg-zinc-100"
            >
              <Compass className="h-4 w-4 text-indigo-600" strokeWidth={1.8} />
              <span>{t("sidebar.userPlatform")}</span>
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-rose-600 hover:bg-rose-50"
            >
              <LogOut className="h-4 w-4" strokeWidth={1.8} />
              <span>{t("sidebar.logout")}</span>
            </button>
          </div>
        </aside>

        {/* Main Content Container */}
        <div className="flex min-w-0 flex-1 flex-col">
          {/* Header */}
          <header className="sticky top-0 z-30 border-b border-zinc-200 bg-white/95 px-4 py-3 backdrop-blur md:px-6">
            <div className="flex items-center justify-between gap-4">
              {/* Left: Mobile Toggle & Page Title */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsMobileOpen(true)}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-100 md:hidden"
                  aria-label="Open navigation"
                >
                  <Menu className="h-5 w-5" strokeWidth={1.8} />
                </button>
                <div>
                  <h1 className="text-sm font-semibold text-zinc-900">
                    {t(`menu.${currentRouteKey}`)}
                  </h1>
                  <p className="text-xs text-zinc-500">
                    {t(`subtitles.${currentRouteKey}`)}
                  </p>
                </div>
              </div>

              {/* Right: Admin Profile Menu */}
              <div className="relative" ref={userMenuRef}>
                <button
                  type="button"
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2.5 rounded-full border border-zinc-200 bg-white p-1.5 pr-3 text-xs font-medium text-zinc-700 transition-all hover:bg-zinc-50 hover:border-zinc-300 focus:outline-none"
                >
                  <img
                    src={avatarSrc}
                    alt={adminName}
                    className="h-7 w-7 rounded-full object-cover border border-zinc-200 bg-zinc-100"
                  />
                  <span className="max-w-[120px] truncate font-semibold text-zinc-900 hidden sm:inline">
                    {adminName}
                  </span>
                  <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-semibold text-indigo-600">
                    ADMIN
                  </span>
                  <ChevronDown className={`h-3.5 w-3.5 text-zinc-400 transition-transform duration-200 ${isUserMenuOpen ? "rotate-180" : ""}`} />
                </button>

                {/* Dropdown Popover */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 rounded-xl border border-zinc-200 bg-white p-2 shadow-lg ring-1 ring-black/5 z-50">
                    <div className="border-b border-zinc-100 px-3 py-2 mb-1">
                      <p className="text-xs font-semibold text-zinc-900 truncate">
                        {adminName}
                      </p>
                      {adminEmail && (
                        <p className="text-[11px] text-zinc-500 truncate mt-0.5">
                          {adminEmail}
                        </p>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        handleSwitchToUserWorkspace();
                      }}
                      className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-100 hover:text-zinc-900"
                    >
                      <Compass className="h-4 w-4 text-indigo-600" />
                      <div>
                        <p className="font-medium">{t("userMenu.switchToUser")}</p>
                        <p className="text-[10px] text-zinc-500">{t("userMenu.switchToUserDesc")}</p>
                      </div>
                    </button>

                    <div className="my-1 border-t border-zinc-100" />

                    <button
                      type="button"
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        handleLogout();
                      }}
                      className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-xs font-medium text-rose-600 transition-colors hover:bg-rose-50"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>{t("userMenu.logout")}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 p-4 md:p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;