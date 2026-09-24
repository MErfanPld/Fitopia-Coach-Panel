import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  House,
  Users,
  Dumbbell,
  ClipboardList,
  Trophy,
  TrendingUp,
  CalendarDays,
  Utensils,
  Rss,
  Medal,
  UserRound,
  LogOut,
  Menu,
  X,
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
  { to: "/app/workouts", label: "تمرین", Icon: ClipboardList, primary: true },
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
      {/* Mobile top bar */}
      <header className="safe-top sticky top-0 z-30 flex items-center justify-between border-b border-white/[0.07] bg-[#07070A]/75 px-3 py-2.5 backdrop-blur-2xl md:hidden">
        <button
          type="button"
          onClick={() => setDrawer(true)}
          className="flex h-10 w-10 items-center justify-center rounded-xl text-white/65 active:bg-white/10"
          aria-label="منو"
        >
          <Menu size={20} strokeWidth={1.75} />
        </button>
        <div className="text-center">
          <p className="text-[13px] font-extrabold tracking-tight text-primary">Fitopia Coach</p>
        </div>
        <button
          type="button"
          onClick={() => navigate("/app/profile")}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/20 text-[12px] font-black text-primary ring-1 ring-primary/30"
        >
          {(profile?.full_name?.[0] || "م").toUpperCase()}
        </button>
      </header>

      {/* Desktop / tablet rail */}
      <aside className="glass-strong fixed inset-y-0 start-0 z-40 hidden w-[200px] flex-col border-e border-white/[0.08] md:flex lg:w-[248px]">
        <div className="border-b border-white/[0.06] px-4 py-5">
          <p className="text-[15px] font-black tracking-tight text-primary lg:text-base">Fitopia Coach</p>
          <p className="mt-2 truncate text-[13px] font-semibold text-white/75">
            {profile?.full_name || "مربی"}
          </p>
          <p className="truncate text-[11px] text-white/35">{profile?.gym_name || "پنل مربی"}</p>
        </div>
        <nav className="flex-1 space-y-0.5 overflow-y-auto px-2.5 py-3">
          {NAV.map(({ to, end, label, Icon }) => {
            const active = isActivePath(pathname, to, end);
            return (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={`flex items-center gap-2.5 rounded-xl px-2.5 py-2.5 text-[13px] font-semibold transition ${
                  active
                    ? "bg-primary/15 text-primary shadow-[inset_0_0_0_1px_rgba(255,106,0,0.15)]"
                    : "text-white/45 hover:bg-white/[0.04] hover:text-white/85"
                }`}
              >
                <Icon size={17} strokeWidth={active ? 2.25 : 1.7} className="shrink-0" />
                <span className="truncate">{label}</span>
              </NavLink>
            );
          })}
        </nav>
        <button
          type="button"
          onClick={onLogout}
          className="m-2.5 flex items-center gap-2.5 rounded-xl px-2.5 py-2.5 text-[13px] font-medium text-white/35 hover:bg-white/[0.04] hover:text-white/60"
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
            className="absolute inset-0 bg-black/65 backdrop-blur-sm"
            onClick={() => setDrawer(false)}
            aria-label="بستن"
          />
          <div className="glass-strong absolute inset-y-0 start-0 flex w-[min(84vw,310px)] flex-col">
            <div className="safe-top flex items-center justify-between border-b border-white/[0.08] px-4 py-4">
              <div>
                <p className="text-[15px] font-black text-primary">منو</p>
                <p className="text-[12px] text-white/40">{profile?.full_name}</p>
              </div>
              <button
                type="button"
                onClick={() => setDrawer(false)}
                className="flex h-9 w-9 items-center justify-center rounded-xl text-white/50"
              >
                <X size={18} />
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
                    className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-[13.5px] font-semibold ${
                      active ? "bg-primary/15 text-primary" : "text-white/55"
                    }`}
                  >
                    <Icon size={17} strokeWidth={active ? 2.25 : 1.7} />
                    {label}
                  </NavLink>
                );
              })}
            </nav>
            <button
              type="button"
              onClick={onLogout}
              className="m-3 flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-[13px] font-medium text-white/40"
            >
              <LogOut size={16} />
              خروج از حساب
            </button>
          </div>
        </div>
      ) : null}

      <main className="md:ps-[200px] lg:ps-[248px]">
        <div className="min-h-dvh pb-[calc(5rem+env(safe-area-inset-bottom))] md:pb-10">
          <div className="page-frame">
            <Outlet />
          </div>
        </div>
      </main>

      {/* Bottom nav — phone */}
      <nav className="safe-bottom fixed inset-x-0 bottom-0 z-40 px-3 pb-2 md:hidden" aria-label="ناوبری">
        <div className="glass-strong mx-auto flex max-w-[min(100%,420px)] items-end justify-between rounded-[22px] px-1.5 pb-1.5 pt-1">
          {BOTTOM.map(({ to, end, label, Icon, primary }) => {
            const active = isActivePath(pathname, to, end);
            if (primary) {
              return (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  className="flex flex-1 flex-col items-center justify-center"
                >
                  <span
                    className={`flex h-12 w-12 -translate-y-2 items-center justify-center rounded-full transition-all ${
                      active
                        ? "bg-primary text-black shadow-[0_6px_18px_rgba(255,106,0,0.45)]"
                        : "bg-primary/90 text-black shadow-[0_4px_14px_rgba(255,106,0,0.28)]"
                    }`}
                  >
                    <Icon size={20} strokeWidth={2.3} />
                  </span>
                  <span className="sr-only">{label}</span>
                </NavLink>
              );
            }
            return (
              <NavLink
                key={to}
                to={to}
                end={end}
                className="flex flex-1 flex-col items-center gap-0.5 rounded-2xl py-1.5"
              >
                <span
                  className={`flex h-8 w-8 items-center justify-center rounded-full ${
                    active ? "bg-primary/15 text-primary" : "text-white/40"
                  }`}
                >
                  <Icon size={18} strokeWidth={active ? 2.2 : 1.55} />
                </span>
                <span className={`text-[9px] font-bold ${active ? "text-primary" : "text-white/35"}`}>
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
