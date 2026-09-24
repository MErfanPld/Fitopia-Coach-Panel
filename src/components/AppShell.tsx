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
  Sun,
  Moon,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
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
  const { isDark, toggleTheme } = useTheme();
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
    <div className="min-h-dvh" style={{ color: "var(--app-fg)", background: "var(--app-bg)" }}>
      {/* Mobile header */}
      <header className="safe-top nav-shell sticky top-0 z-30 flex items-center justify-between border-b px-3 py-2.5 md:hidden">
        <button
          type="button"
          onClick={() => setDrawer(true)}
          className="flex h-10 w-10 items-center justify-center rounded-xl"
          style={{ color: "var(--app-fg-secondary)" }}
          aria-label="منو"
        >
          <Menu size={22} strokeWidth={1.75} />
        </button>
        <p className="text-[0.9375rem] font-extrabold text-primary">Fitopia Coach</p>
        <div className="flex items-center gap-1.5">
          <button type="button" className="theme-toggle" onClick={toggleTheme} aria-label="تغییر تم">
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button
            type="button"
            onClick={() => navigate("/app/profile")}
            className="avatar !h-9 !w-9 !text-[0.75rem]"
          >
            {(profile?.full_name?.[0] || "م").toUpperCase()}
          </button>
        </div>
      </header>

      {/* Desktop sidebar */}
      <aside className="sidebar fixed inset-y-0 start-0 z-40 hidden w-[210px] flex-col border-e md:flex lg:w-[248px]">
        <div className="flex items-start justify-between gap-2 border-b px-4 py-5" style={{ borderColor: "var(--app-border)" }}>
          <div className="min-w-0">
            <p className="text-[0.9375rem] font-black text-primary">Fitopia Coach</p>
            <p className="mt-1.5 truncate text-[0.8125rem] font-semibold" style={{ color: "var(--app-fg-secondary)" }}>
              {profile?.full_name || "مربی"}
            </p>
            <p className="truncate text-[0.75rem]" style={{ color: "var(--app-fg-muted)" }}>
              {profile?.gym_name || "پنل مربی"}
            </p>
          </div>
          <button type="button" className="theme-toggle shrink-0" onClick={toggleTheme} aria-label="تغییر تم">
            {isDark ? <Sun size={17} /> : <Moon size={17} />}
          </button>
        </div>
        <nav className="flex-1 space-y-0.5 overflow-y-auto px-2.5 py-3">
          {NAV.map(({ to, end, label, Icon }) => {
            const active = isActivePath(pathname, to, end);
            return (
              <NavLink
                key={to}
                to={to}
                end={end}
                className="flex items-center gap-2.5 rounded-xl px-2.5 py-2.5 text-[0.875rem] font-semibold transition"
                style={{
                  background: active ? "var(--app-primary-soft)" : "transparent",
                  color: active ? "var(--app-primary-text)" : "var(--app-fg-muted)",
                }}
              >
                <Icon size={18} strokeWidth={active ? 2.2 : 1.7} className="shrink-0" />
                <span className="truncate">{label}</span>
              </NavLink>
            );
          })}
        </nav>
        <button
          type="button"
          onClick={onLogout}
          className="m-2.5 flex items-center gap-2.5 rounded-xl px-2.5 py-2.5 text-[0.875rem] font-medium"
          style={{ color: "var(--app-fg-muted)" }}
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
            className="absolute inset-0"
            style={{ background: "var(--app-overlay)" }}
            onClick={() => setDrawer(false)}
            aria-label="بستن"
          />
          <div
            className="absolute inset-y-0 start-0 flex w-[min(84vw,310px)] flex-col"
            style={{ background: "var(--app-surface)", borderInlineEnd: "1px solid var(--app-border)" }}
          >
            <div className="safe-top flex items-center justify-between border-b px-4 py-4" style={{ borderColor: "var(--app-border)" }}>
              <div>
                <p className="text-[0.9375rem] font-black text-primary">منو</p>
                <p className="text-[0.8125rem]" style={{ color: "var(--app-fg-muted)" }}>{profile?.full_name}</p>
              </div>
              <div className="flex items-center gap-1">
                <button type="button" className="theme-toggle" onClick={toggleTheme}>
                  {isDark ? <Sun size={17} /> : <Moon size={17} />}
                </button>
                <button
                  type="button"
                  onClick={() => setDrawer(false)}
                  className="flex h-9 w-9 items-center justify-center rounded-xl"
                  style={{ color: "var(--app-fg-muted)" }}
                >
                  <X size={18} />
                </button>
              </div>
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
                    className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-[0.9rem] font-semibold"
                    style={{
                      background: active ? "var(--app-primary-soft)" : "transparent",
                      color: active ? "var(--app-primary-text)" : "var(--app-fg-secondary)",
                    }}
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
              className="m-3 flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-[0.875rem] font-medium"
              style={{ color: "var(--app-fg-muted)" }}
            >
              <LogOut size={16} />
              خروج از حساب
            </button>
          </div>
        </div>
      ) : null}

      <main className="md:ps-[210px] lg:ps-[248px]">
        <div className="min-h-dvh pb-[calc(5rem+env(safe-area-inset-bottom))] md:pb-10">
          <div className="page-frame">
            <Outlet />
          </div>
        </div>
      </main>

      {/* Bottom nav */}
      <nav className="safe-bottom fixed inset-x-0 bottom-0 z-40 px-3 pb-2 md:hidden" aria-label="ناوبری">
        <div
          className="nav-shell mx-auto flex max-w-[min(100%,420px)] items-end justify-between rounded-[22px] border px-1.5 pb-1.5 pt-1"
        >
          {BOTTOM.map(({ to, end, label, Icon, primary }) => {
            const active = isActivePath(pathname, to, end);
            if (primary) {
              return (
                <NavLink key={to} to={to} end={end} className="flex flex-1 flex-col items-center justify-center">
                  <span className="flex h-12 w-12 -translate-y-2 items-center justify-center rounded-full bg-primary text-black shadow-[0_6px_18px_rgba(255,106,0,0.4)]">
                    <Icon size={20} strokeWidth={2.3} />
                  </span>
                  <span className="sr-only">{label}</span>
                </NavLink>
              );
            }
            return (
              <NavLink key={to} to={to} end={end} className="flex flex-1 flex-col items-center gap-0.5 rounded-2xl py-1.5">
                <span
                  className="flex h-8 w-8 items-center justify-center rounded-full"
                  style={{
                    background: active ? "var(--app-primary-soft)" : "transparent",
                    color: active ? "var(--app-primary)" : "var(--app-fg-faint)",
                  }}
                >
                  <Icon size={18} strokeWidth={active ? 2.2 : 1.55} />
                </span>
                <span
                  className="text-[0.625rem] font-bold"
                  style={{ color: active ? "var(--app-primary)" : "var(--app-fg-faint)" }}
                >
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
