import { Link, NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ChevronDown,
  LogOut,
  User,
  UserCog,
  Settings
} from "lucide-react";
import NotificationDropdown from "../../components/NotificationDropdown";
import useAuthStore from "../../store/authStore";
import useUserStore from "../../store/userStore";
import { useState, useRef, useEffect } from "react";
import logoImg from "../../assets/logo/logo.png";
import avatar1 from "../../assets/avatardefault/avatar1.png";
import avatar2 from "../../assets/avatardefault/avatar2.png";
import avatar3 from "../../assets/avatardefault/avatar3.png";
import avatar4 from "../../assets/avatardefault/avatar4.png";
import avatar5 from "../../assets/avatardefault/avatar5.png";
import userInfoService from "../../services/user/userInfoService";
import bannerService, { type ActiveBanner } from "../../services/user/bannerService";
import MarqueeBar from "../../components/user/MarqueeBar";
import BannerModal from "../../components/user/BannerModal";

const DEFAULT_AVATARS = [avatar1, avatar2, avatar3, avatar4, avatar5];

const getDefaultAvatar = (identifier: string) => {
  let hash = 0;
  for (let i = 0; i < identifier.length; i++) {
    hash = identifier.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % DEFAULT_AVATARS.length;
  return DEFAULT_AVATARS[index];
};

const UserLayout = () => {
  const { t } = useTranslation("Dashboard");
  const navigate = useNavigate();
  const location = useLocation();
  const logout = useAuthStore((s) => s.logout);
  const userInfo = useUserStore((s) => s.userInfo);
  const setUserInfo = useUserStore((s) => s.setUserInfo);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement | null>(null);
  const navRef = useRef<HTMLElement | null>(null);
  const [activeBanner, setActiveBanner] = useState<ActiveBanner | null>(null);

  useEffect(() => {
    userInfoService
      .getUserInfo()
      .then((res) => {
        if (res.data.data) {
          setUserInfo({
            fullName: res.data.data.fullName,
            avatarUrl: res.data.data.avatarUrl || null,
            email: res.data.data.email,
          });
        }
      })
      .catch(() => {
        // Fallback silently if API fails or unauthorized
      });

    bannerService
      .getActiveBanner()
      .then((res) => {
        if (res.data?.data) {
          setActiveBanner(res.data.data);
        }
      })
      .catch(() => {
        // Fallback silently if active banner API fails or no active banner
      });
  }, [setUserInfo]);

  const displayName = userInfo?.fullName || t("user.name", "User");
  const displayAvatar =
    userInfo?.avatarUrl || getDefaultAvatar(displayName);

  const navigationItems = [
    { label: t("navigation.home", "Trang chủ"), to: "/", end: true },
    { label: t("navigation.dashboard", "Dashboard"), to: "/dashboard", end: false },
    { label: t("navigation.interview", "Phỏng vấn"), to: "/interviews", end: false },
    { label: t("navigation.history", "Lịch sử"), to: "/history", end: false },
    { label: t("navigation.chatbot", "Chatbot"), to: "/chatbot", end: false },
    { label: t("navigation.reports", "Báo cáo & Đánh giá"), to: "/reports_and_feedbacks", end: false },
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

  // Auto-scroll active nav link into view on route change / reload (especially for mobile horizontal scrollbar)
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
    <div className="h-[100dvh] bg-zinc-50 text-zinc-900 flex flex-col overflow-hidden">
      <header className="shrink-0 border-b border-zinc-200 bg-white/80 backdrop-blur-md z-50">
        <div className="mx-auto flex flex-wrap items-center justify-between gap-y-3 px-4 py-3 sm:px-6 md:h-16 md:flex-nowrap md:py-0 lg:px-8">
          <div className="flex items-center">
            <Link
              to="/"
              className="shrink-0 flex items-center gap-2 text-lg font-bold tracking-tight text-zinc-900"
            >
              <img src={logoImg} alt="Logo" className="h-8 w-auto object-contain" />
            </Link>
          </div>

          <nav
            ref={navRef}
            aria-label="Main Navigation"
            className="order-3 flex w-full gap-1 overflow-x-auto pb-2 pt-0.5 md:pb-0 md:order-2 md:mx-8 md:w-auto md:flex-1 [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-track]:bg-zinc-100 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-thumb]:bg-zinc-300 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-zinc-400 md:[&::-webkit-scrollbar]:hidden [scrollbar-width:thin] [scrollbar-color:theme(colors.zinc.300)_theme(colors.zinc.100)] md:[scrollbar-width:none]"
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
                      ? "bg-zinc-900 text-white active"
                      : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900",
                  ].join(" ")
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="order-2 flex items-center gap-4 md:order-3">
            {/* Notification Dropdown */}
            <NotificationDropdown />

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
                  src={displayAvatar}
                  alt={displayName}
                  className="h-8 w-8 rounded-full object-cover"
                />
                <span className="hidden text-sm font-medium text-zinc-700 md:block max-w-[100px] truncate">
                  {displayName}
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

      {/* Marquee Announcement Bar */}
      {activeBanner?.marquee && <MarqueeBar text={activeBanner.marquee} />}

      {/* Active Banner Modal */}
      <BannerModal banner={activeBanner} />

      {/* Main Content Area */}
      <main className="flex-1 w-full relative overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default UserLayout;
