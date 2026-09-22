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
  { to: "/app/profile", label: "من", Icon: UserRound },
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
      {/* Header mobile */}
      <header className="safe-top sticky top-0 z-30 flex items-center justify-between border-b border-white/[0.05] bg-black/85 px-3 py-2.5 backdrop-blur-xl md:hidden">
        <button
          type="button"
          onClick={() => setDrawer(true)}
          className="flex h-10 w-10 items-center justify-center rounded-xl text-white/70 active:bg-white/5"
          aria-label="منو"
        >
          <Menu size={22} strokeWidth={1.75} />
        </button>
        <p className="text-[15px] font-bold tracking-tight text-primary">Fitopia</p>
        <button
          type="button"
          onClick={() => navigate("/app/profile")}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary ring-1 ring-primary/30"
        >
          {(profile?.full_name?.[0] || "م").toUpperCase()}
        </button>
      </header>

      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 start-0 z-40 hidden w-[248px] flex-col border-e border-white/[0.06] bg-[#0A0A0A] md:flex">
        <div className="px-5 py-6">
          <p className="text-xl font-bold tracking-tight text-primary">Fitopia</p>
          <p className="mt-2 truncate text-sm font-medium text-white/70">{profile?.full_name || "مربی"}</p>
          <p className="truncate text-xs text-white/35">{profile?.gym_name || "پنل مربی"}</p>
        </div>
        <nav className="flex-1 space-y-0.5 overflow-y-auto px-3">
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
                    : "text-white/45 hover:bg-white/[0.04] hover:text-white"
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
          className="mx-3 mb-4 flex items-center gap-3 rounded-xl px-3 py-2.5 text-[14px] font-medium text-white/35 transition hover:bg-white/[0.04] hover:text-white/60"
        >
          <LogOut size={18} />
          خروج
        </button>
      </aside>

      {/* Mobile drawer */}
      {drawer ? (
        <div className="fixed inset-0 z-50 md:hidden">
          <button type="button" className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setDrawer(false)} aria-label="بستن" />
          <div className="absolute inset-y-0 start-0 flex w-[min(80vw,300px)] flex-col bg-[#0A0A0A] shadow-2xl">
            <div className="safe-top flex items-center justify-between border-b border-white/[0.06] px-4 py-4">
              <div>
                <p className="text-lg font-bold text-primary">منو</p>
                <p className="text-xs text-white/40">{profile?.full_name}</p>
              </div>
              <button type="button" onClick={() => setDrawer(false)} className="flex h-9 w-9 items-center justify-center rounded-xl text-white/50 active:bg-white/5">
                <X size={20} />
              </button>
            </div>
            <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
              {NAV.map(({ to, end, label, Icon }) => {
                const active = isActivePath(pathname, to, end);
                return (
                  <NavLink
                    key={to}
                    to={to}
                    end={end}
                    onClick={() => setDrawer(false)}
                    className={`flex items-center gap-3 rounded-xl px-3 py-3 text-[15px] font-medium ${
                      active ? "bg-primary/15 text-primary" : "text-white/55"
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
              className="m-3 flex items-center gap-3 rounded-xl px-3 py-3 text-[15px] font-medium text-white/40"
            >
              <LogOut size={18} />
              خروج از حساب
            </button>
          </div>
        </div>
      ) : null}

      {/* Content */}
      <main className="md:ps-[248px]">
        <div className="min-h-dvh pb-[calc(5rem+env(safe-area-inset-bottom))] md:pb-8">
          <Outlet />
        </div>
      </main>

      {/* Bottom nav — floating pill */}
      <nav
        className="safe-bottom fixed inset-x-0 bottom-0 z-40 px-3 pb-2.5 md:hidden"
        aria-label="ناوبری اصلی"
      >
        <div className="mx-auto flex max-w-[400px] items-center justify-between gap-0.5 rounded-[22px] border border-white/[0.08] bg-[#121212]/95 px-1.5 py-1.5 shadow-[0_8px_40px_rgba(0,0,0,0.55)] backdrop-blur-2xl">
          {BOTTOM.map(({ to, end, label, Icon }) => {
            const active = isActivePath(pathname, to, end);
            return (
              <NavLink
                key={to}
                to={to}
                end={end}
                className="relative flex flex-1 flex-col items-center gap-0.5 rounded-2xl py-1.5 transition"
              >
                <span
                  className={`flex h-9 w-9 items-center justify-center rounded-full transition-all duration-200 ${
                    active
                      ? "bg-primary text-black shadow-[0_4px_16px_rgba(255,106,0,0.4)]"
                      : "text-white/40"
                  }`}
                >
                  <Icon
                    size={active ? 18 : 20}
                    strokeWidth={active ? 2.3 : 1.55}
                  />
                </span>
                <span
                  className={`text-[10px] font-semibold leading-none ${
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
