import { BarChart3, Briefcase, Home, LogOut, Menu, Settings, Users } from "lucide-react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import useAuthStore from "../store/authStore";

interface SidebarItem {
  label: string;
  to: string;
  icon: typeof Home;
}

const sidebarItems: SidebarItem[] = [
  {
    label: "Dashboard",
    to: "/admin/dashboard",
    icon: Home,
  },
  {
    label: "Users",
    to: "/admin/users",
    icon: Users,
  },
  {
    label: "Interviews",
    to: "/admin/interviews",
    icon: Briefcase,
  },
  {
    label: "Progress",
    to: "/admin/progress",
    icon: BarChart3,
  },
  {
    label: "Settings",
    to: "/admin/settings",
    icon: Settings,
  },
];

const AdminLayout = () => {
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 text-zinc-900">
      <div className="flex flex-1 min-h-0">
        <aside className="hidden w-64 shrink-0 border-r border-zinc-200 bg-white px-4 py-5 md:flex md:flex-col">
          <div className="mb-8">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-900 text-sm font-semibold text-white">
              AI
            </div>
            <div className="mt-4">
              <p className="text-sm font-semibold text-zinc-900">Interview AI</p>
              <p className="mt-1 text-xs text-zinc-500">Admin workspace</p>
            </div>
          </div>

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
                        ? "bg-zinc-900 text-white"
                        : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900",
                    ].join(" ")
                  }
                >
                  <Icon className="h-4 w-4" strokeWidth={1.8} />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>

          <button
            type="button"
            onClick={handleLogout}
            className="mt-6 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-50 hover:text-zinc-900 active:scale-[0.98]"
          >
            <LogOut className="h-4 w-4" strokeWidth={1.8} />
            <span>Logout</span>
          </button>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-10 border-b border-zinc-200 bg-white/95 px-4 py-3 backdrop-blur md:px-6">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-600 md:hidden"
                  aria-label="Open navigation"
                >
                  <Menu className="h-4 w-4" strokeWidth={1.8} />
                </button>
                <div>
                  <p className="text-sm font-semibold text-zinc-900">Dashboard</p>
                  <p className="text-xs text-zinc-500">System administration</p>
                </div>
              </div>

              <div className="rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-600">
                ADMIN
              </div>
            </div>
          </header>

          <main className="flex-1 p-4 md:p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;