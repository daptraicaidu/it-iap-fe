import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ChevronDown,
  LogOut,
  User,
  UserCog,
  Mail,
  Settings
} from "lucide-react";
import useAuthStore from "../../store/authStore";
import { useState, useRef, useEffect } from "react";

const UserLayout = () => {
  const { t } = useTranslation("Dashboard");
  const navigate = useNavigate();
  const logout = useAuthStore((s) => s.logout);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement | null>(null);

  const user = {
    name: t("user.name", "User"),
    avatarUrl:
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=96&q=80",
  };

  const navigationItems = [
    { label: t("navigation.dashboard", "Dashboard"), to: "/dashboard", end: false },
    { label: t("navigation.interview", "Bắt đầu phỏng vấn"), to: "/interview", end: true },
    { label: t("navigation.reviewResult", "Kết quả phỏng vấn"), to: "/interview/review_result", end: false },
    { label: t("navigation.chatbot", "Chatbot"), to: "/chatbot", end: false },
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
    <div className="min-h-[100dvh] bg-zinc-50 text-zinc-900 flex flex-col">
      <header className="sticky top-0 z-50 border-b border-zinc-200 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex flex-wrap items-center justify-between gap-y-3 px-4 py-3 sm:px-6 md:h-16 md:flex-nowrap md:py-0 lg:px-8">
          <div className="flex items-center">
            <Link
              to="/"
              className="shrink-0 text-lg font-bold tracking-tight text-zinc-900"
            >
              AntiGravity
            </Link>
          </div>

          <nav
            aria-label="Main Navigation"
            className="order-3 flex w-full gap-1 overflow-x-auto md:order-2 md:mx-8 md:w-auto md:flex-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
          >
            {navigationItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  [
                    "whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium transition",
                    isActive
                      ? "bg-zinc-900 text-white"
                      : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900",
                  ].join(" ")
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="order-2 flex items-center gap-4 md:order-3">
            {/* Notification Mailbox */}
            <Link
              to="/notifications"
              className="relative rounded-full p-2 text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-900"
            >
              <Mail className="h-5 w-5" />
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white" />
            </Link>

            {/* User Dropdown */}
            <div ref={userMenuRef} className="relative">
              <button
                type="button"
                aria-haspopup="menu"
                aria-expanded={isUserMenuOpen}
                onClick={() => setIsUserMenuOpen((current) => !current)}
                className="flex items-center gap-2 rounded-full border border-zinc-200 p-1 pr-2 transition hover:bg-zinc-50"
              >
                <img
                  src={user.avatarUrl}
                  alt={user.name}
                  className="h-8 w-8 rounded-full object-cover"
                />
                <span className="hidden text-sm font-medium text-zinc-700 md:block max-w-[100px] truncate">
                  {user.name}
                </span>
                <ChevronDown
                  className={`h-4 w-4 text-zinc-500 transition ${
                    isUserMenuOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {isUserMenuOpen && (
                <div
                  role="menu"
                  className="absolute right-0 mt-2 w-56 rounded-xl border border-zinc-200 bg-white p-2 shadow-lg ring-1 ring-black/5 z-50"
                >
                  <Link
                    to="/userinfo"
                    onClick={() => setIsUserMenuOpen(false)}
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-zinc-700 transition hover:bg-zinc-100 hover:text-zinc-900"
                  >
                    <User className="h-4 w-4 text-zinc-500" />
                    Thông tin cá nhân
                  </Link>
                  <Link
                    to="/profiles"
                    onClick={() => setIsUserMenuOpen(false)}
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-zinc-700 transition hover:bg-zinc-100 hover:text-zinc-900"
                  >
                    <UserCog className="h-4 w-4 text-zinc-500" />
                    Quản lý hồ sơ
                  </Link>
                  <Link
                    to="/settings"
                    onClick={() => setIsUserMenuOpen(false)}
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-zinc-700 transition hover:bg-zinc-100 hover:text-zinc-900"
                  >
                    <Settings className="h-4 w-4 text-zinc-500" />
                    Cài đặt chung
                  </Link>
                  
                  <div className="my-1 h-px bg-zinc-100" />
                  
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium text-rose-600 transition hover:bg-rose-50"
                  >
                    <LogOut className="h-4 w-4" />
                    Đăng xuất
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full relative">
        <Outlet />
      </main>
    </div>
  );
};

export default UserLayout;
