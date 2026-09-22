import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  House, Users, Dumbbell, ClipboardList, Trophy, TrendingUp,
  CalendarDays, Utensils, Rss, Medal, UserRound, LogOut, Menu, X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";

const NAV = [
  { to: "/app", end: true, label: "خانه", Icon: House },
  { to: "/app/students", label: "شاگردان", Icon: Users },
  { to: "/app/exercises", label: "حرکات", Icon: Dumbbell },
  { to: "/app/workouts", label: "تمرین", Icon: ClipboardList },
  { to: "/app/prs", label: "رکورد", Icon: Trophy },
  { to: "/app/progress", label: "پیشرفت", Icon: TrendingUp },
  { to: "/app/training", label: "برنامه", Icon: CalendarDays },
  { to: "/app/diet", label: "غذا", Icon: Utensils },
  { to: "/app/feed", label: "فید", Icon: Rss },
  { to: "/app/leaderboard", label: "لیدربورد", Icon: Medal },
  { to: "/app/profile", label: "پروفایل", Icon: UserRound },
];

const BOTTOM = [
  { to: "/app", end: true, label: "خانه", Icon: House },
  { to: "/app/students", label: "شاگردان", Icon: Users },
  { to: "/app/workouts", label: "تمرین", Icon: ClipboardList },
  { to: "/app/feed", label: "فید", Icon: Rss },
  { to: "/app/profile", label: "پروفایل", Icon: UserRound },
];

function isActivePath(pathname: string, to: string, end?: boolean) {
  if (end) return pathname === to || pathname === `${to}/`;
  return pathname === to || pathname.startsWith(`${to}/`);
}

export function AppShell() {
  const { profile, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [drawer, setDrawer] = useState(false);

  useEffect(() => { setDrawer(false); }, [pathname]);
  useEffect(() => {
    document.body.style.overflow = drawer ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [drawer]);

  const onLogout = () => {
    logout();
    navigate("/welcome", { replace: true });
  };

  return (
    <div className="min-h-dvh bg-black text-white">
      {/* Header */}
      <header className="safe-top sticky top-0 z-30 flex items-center justify-between bg-black/80 px-4 py-3 backdrop-blur-md md:hidden">
        <button
          type="button"
          onClick={() => setDrawer(true)}
          className="-ms-1 flex h-10 w-10 items-center justify-center text-white/80"
          aria-label="منو"
        >
          <Menu size={22} strokeWidth={1.75} />
        </button>
        <p className="text-[15px] font-bold tracking-tight text-primary">Fitopia</p>
        <button
          type="button"
          onClick={() => navigate("/app/profile")}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary"
        >
          {(profile?.full_name?.[0] || "م").toUpperCase()}
        </button>
      </header>

      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 start-0 z-40 hidden w-[240px] flex-col border-e border-white/[0.06] bg-black md:flex">
        <div className="px-6 py-7">
          <p className="text-xl font-bold tracking-tight text-primary">Fitopia</p>
          <p className="mt-2 text-sm text-white/50">{profile?.full_name || "مربی"}</p>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto px-3">
          {NAV.map(({ to, end, label, Icon }) => {
            const active = isActivePath(pathname, to, end);
            return (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-[14px] font-medium transition ${
                  active
                    ? "bg-primary/15 text-primary"
                    : "text-white/50 hover:bg-white/[0.06] hover:text-white"
                }`}
              >
                <Icon size={18} strokeWidth={active ? 2.2 : 1.7} />
                {label}
              </NavLink>
            );
          })}
        </nav>
        <button
          type="button"
          onClick={onLogout}
          className="mx-3 mb-4 flex items-center gap-3 rounded-xl px-3 py-2.5 text-[14px] font-medium text-white/40 hover:bg-white/[0.04] hover:text-white/70"
        >
          <LogOut size={18} />
          خروج
        </button>
      </aside>

      {/* Mobile drawer */}
      {drawer ? (
        <div className="fixed inset-0 z-50 md:hidden">
          <button type="button" className="absolute inset-0 bg-black/70" onClick={() => setDrawer(false)} aria-label="بستن" />
          <div className="absolute inset-y-0 start-0 flex w-[min(78vw,290px)] flex-col bg-[#0A0A0A]">
            <div className="safe-top flex items-center justify-between px-5 py-5">
              <div>
                <p className="text-lg font-bold text-primary">منو</p>
                <p className="text-xs text-white/40">{profile?.full_name}</p>
              </div>
              <button type="button" onClick={() => setDrawer(false)} className="text-white/50">
                <X size={22} />
              </button>
            </div>
            <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 pb-4">
              {NAV.map(({ to, end, label, Icon }) => {
                const active = isActivePath(pathname, to, end);
                return (
                  <NavLink
                    key={to}
                    to={to}
                    end={end}
                    onClick={() => setDrawer(false)}
                    className={`flex items-center gap-3 rounded-xl px-3 py-3 text-[15px] font-medium ${
                      active ? "bg-primary/15 text-primary" : "text-white/60"
                    }`}
                  >
                    <Icon size={18} strokeWidth={active ? 2.2 : 1.7} />
                    {label}
                  </NavLink>
                );
              })}
            </nav>
            <button
              type="button"
              onClick={onLogout}
              className="mx-3 mb-6 flex items-center gap-3 rounded-xl px-3 py-3 text-[15px] font-medium text-white/40"
            >
              <LogOut size={18} />
              خروج
            </button>
          </div>
        </div>
      ) : null}

      {/* Content */}
      <main className="md:ps-[240px]">
        <div className="min-h-dvh pb-[calc(3.75rem+env(safe-area-inset-bottom))] md:pb-8">
          <Outlet />
        </div>
      </main>

      {/* Bottom tab bar — orange active */}
      <nav
        className="safe-bottom fixed inset-x-0 bottom-0 z-40 border-t border-white/[0.08] bg-black/90 backdrop-blur-xl md:hidden"
        aria-label="ناوبری"
      >
        <div className="mx-auto flex h-[52px] max-w-lg items-center justify-around px-1">
          {BOTTOM.map(({ to, end, label, Icon }) => {
            const active = isActivePath(pathname, to, end);
            return (
              <NavLink
                key={to}
                to={to}
                end={end}
                className="flex h-full flex-1 flex-col items-center justify-center gap-0.5"
              >
                <Icon
                  size={22}
                  strokeWidth={active ? 2.25 : 1.5}
                  className={active ? "text-primary" : "text-white/35"}
                  fill={active && to === "/app" ? "currentColor" : "none"}
                />
                <span
                  className={`text-[10px] font-medium ${
                    active ? "text-primary" : "text-white/35"
                  }`}
                >
                  {label}
                </span>
              </NavLink>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
