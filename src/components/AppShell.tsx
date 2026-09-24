import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  House, Users, Dumbbell, ClipboardList, Trophy, TrendingUp,
  CalendarDays, Utensils, Rss, Medal, UserRound, LogOut, Menu, X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { AddToHomeScreen } from "./AddToHomeScreen";

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

  useEffect(() => {
    setDrawer(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = drawer ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [drawer]);

  const onLogout = () => {
    logout();
    navigate("/welcome", { replace: true });
  };

  return (
    <div className="min-h-dvh text-white">
      {/* Mobile header */}
      <header className="safe-top sticky top-0 z-30 flex items-center justify-between border-b border-white/[0.08] bg-black/40 px-3 py-2 backdrop-blur-2xl md:hidden">
        <button
          type="button"
          onClick={() => setDrawer(true)}
          className="flex h-9 w-9 items-center justify-center rounded-xl text-white/70 active:bg-white/10"
          aria-label="منو"
        >
          <Menu size={20} strokeWidth={1.75} />
        </button>
        <p className="text-[14px] font-bold tracking-tight text-primary">Fitopia Coach</p>
        <button
          type="button"
          onClick={() => navigate("/app/profile")}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-[11px] font-bold text-primary ring-1 ring-primary/25"
        >
          {(profile?.full_name?.[0] || "م").toUpperCase()}
        </button>
      </header>

      {/* Tablet + Desktop sidebar */}
      <aside className="glass-strong fixed inset-y-0 start-0 z-40 hidden w-[200px] flex-col border-e border-white/[0.08] md:flex lg:w-[240px]">
        <div className="px-3 py-5 lg:px-4">
          <p className="text-base font-bold tracking-tight text-primary lg:text-lg">Fitopia Coach</p>
          <p className="mt-1.5 truncate text-[12px] font-medium text-white/70 lg:text-[13px]">
            {profile?.full_name || "مربی"}
          </p>
          <p className="truncate text-[11px] text-white/35">{profile?.gym_name || "پنل مربی"}</p>
        </div>
        <nav className="flex-1 space-y-0.5 overflow-y-auto px-2 lg:px-2.5">
          {NAV.map(({ to, end, label, Icon }) => {
            const active = isActivePath(pathname, to, end);
            return (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={`flex items-center gap-2 rounded-xl px-2 py-2 text-[12.5px] font-medium transition lg:gap-2.5 lg:px-2.5 lg:text-[13px] ${
                  active
                    ? "bg-primary/15 text-primary"
                    : "text-white/45 hover:bg-white/[0.05] hover:text-white"
                }`}
              >
                <Icon size={16} strokeWidth={active ? 2.2 : 1.7} className="shrink-0" />
                <span className="truncate">{label}</span>
              </NavLink>
            );
          })}
        </nav>
        <button
          type="button"
          onClick={onLogout}
          className="mx-2 mb-3 flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-[13px] font-medium text-white/35 hover:bg-white/[0.04] lg:mx-2.5"
        >
          <LogOut size={16} />
          خروج
        </button>
      </aside>

      {/* Mobile drawer */}
      {drawer ? (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setDrawer(false)}
            aria-label="بستن"
          />
          <div className="glass-strong absolute inset-y-0 start-0 flex w-[min(82vw,300px)] flex-col">
            <div className="safe-top flex items-center justify-between border-b border-white/[0.08] px-4 py-3.5">
              <div>
                <p className="text-[15px] font-bold text-primary">منو</p>
                <p className="text-[11px] text-white/40">{profile?.full_name}</p>
              </div>
              <button
                type="button"
                onClick={() => setDrawer(false)}
                className="flex h-8 w-8 items-center justify-center rounded-xl text-white/50"
              >
                <X size={18} />
              </button>
            </div>
            <nav className="flex-1 space-y-0.5 overflow-y-auto p-2.5">
              {NAV.map(({ to, end, label, Icon }) => {
                const active = isActivePath(pathname, to, end);
                return (
                  <NavLink
                    key={to}
                    to={to}
                    end={end}
                    onClick={() => setDrawer(false)}
                    className={`flex items-center gap-2.5 rounded-xl px-2.5 py-2.5 text-[13px] font-medium ${
                      active ? "bg-primary/15 text-primary" : "text-white/55"
                    }`}
                  >
                    <Icon size={16} strokeWidth={active ? 2.2 : 1.7} />
                    {label}
                  </NavLink>
                );
              })}
            </nav>
            <button
              type="button"
              onClick={onLogout}
              className="m-2.5 flex items-center gap-2.5 rounded-xl px-2.5 py-2.5 text-[13px] font-medium text-white/40"
            >
              <LogOut size={16} />
              خروج از حساب
            </button>
          </div>
        </div>
      ) : null}

      {/* Main — responsive padding for sidebar */}
      <main className="md:ps-[200px] lg:ps-[240px]">
        <div className="min-h-dvh pb-[calc(4.75rem+env(safe-area-inset-bottom))] md:pb-8">
          <div className="page-frame">
            <Outlet />
          </div>
        </div>
      </main>

      {/* Bottom nav — phone only */}
      <nav className="safe-bottom fixed inset-x-0 bottom-0 z-40 px-3 pb-2 md:hidden" aria-label="ناوبری">
        <div className="glass-strong mx-auto flex max-w-[min(100%,420px)] items-center justify-between rounded-[20px] px-1 py-1">
          {BOTTOM.map(({ to, end, label, Icon }) => {
            const active = isActivePath(pathname, to, end);
            return (
              <NavLink key={to} to={to} end={end} className="flex flex-1 flex-col items-center gap-0.5 rounded-2xl py-1">
                <span
                  className={`flex h-8 w-8 items-center justify-center rounded-full transition-all ${
                    active
                      ? "bg-primary text-black shadow-[0_3px_12px_rgba(255,106,0,0.4)]"
                      : "text-white/40"
                  }`}
                >
                  <Icon size={active ? 16 : 18} strokeWidth={active ? 2.3 : 1.55} />
                </span>
                <span className={`text-[9px] font-semibold ${active ? "text-primary" : "text-white/35"}`}>
                  {label}
                </span>
              </NavLink>
            );
          })}
        </div>
      </nav>

      <AddToHomeScreen />
    </div>
  );
}
