import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Users, Dumbbell, ClipboardList, Trophy, TrendingUp,
  CalendarDays, Utensils, Rss, Medal, UserCircle, LogOut, Menu, X,
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";

const NAV = [
  { to: "/app", end: true, label: "داشبورد", Icon: LayoutDashboard },
  { to: "/app/students", label: "شاگردان", Icon: Users },
  { to: "/app/exercises", label: "حرکات", Icon: Dumbbell },
  { to: "/app/workouts", label: "تمرین", Icon: ClipboardList },
  { to: "/app/prs", label: "رکورد", Icon: Trophy },
  { to: "/app/progress", label: "پیشرفت", Icon: TrendingUp },
  { to: "/app/training", label: "برنامه", Icon: CalendarDays },
  { to: "/app/diet", label: "غذا", Icon: Utensils },
  { to: "/app/feed", label: "فید", Icon: Rss },
  { to: "/app/leaderboard", label: "لیدربورد", Icon: Medal },
  { to: "/app/profile", label: "پروفایل", Icon: UserCircle },
];

const BOTTOM = [
  { to: "/app", end: true, label: "خانه", Icon: LayoutDashboard },
  { to: "/app/students", label: "شاگردان", Icon: Users },
  { to: "/app/workouts", label: "تمرین", Icon: ClipboardList },
  { to: "/app/feed", label: "فید", Icon: Rss },
  { to: "/app/profile", label: "من", Icon: UserCircle },
];

export function AppShell() {
  const { profile, logout } = useAuth();
  const navigate = useNavigate();
  const [drawer, setDrawer] = useState(false);
  const onLogout = () => { logout(); navigate("/welcome", { replace: true }); };

  return (
    <div className="min-h-dvh bg-[#07070A] text-white">
      <header className="safe-top sticky top-0 z-30 flex items-center justify-between border-b border-white/5 bg-[#0c0c10]/95 px-4 py-3 backdrop-blur md:hidden">
        <button type="button" onClick={() => setDrawer(true)} className="rounded-xl p-2 text-white/70"><Menu size={22} /></button>
        <div className="text-center">
          <p className="text-sm font-black text-primary">Fitopia Coach</p>
          <p className="text-[11px] text-white/40">{profile?.gym_name || "پنل مربی"}</p>
        </div>
        <div className="w-10" />
      </header>

      <aside className="fixed inset-y-0 start-0 z-40 hidden w-60 flex-col border-e border-white/5 bg-[#0c0c10] md:flex">
        <div className="border-b border-white/5 px-5 py-5">
          <p className="text-lg font-black text-primary">Fitopia Coach</p>
          <p className="mt-1 truncate text-xs text-white/45">{profile?.full_name}</p>
          <p className="truncate text-[11px] text-white/30">{profile?.gym_name}</p>
        </div>
        <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
          {NAV.map(({ to, end, label, Icon }) => (
            <NavLink key={to} to={to} end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                  isActive ? "bg-primary/15 text-primary" : "text-white/60 hover:bg-white/5 hover:text-white"
                }`}
            >
              <Icon size={18} strokeWidth={1.75} />{label}
            </NavLink>
          ))}
        </nav>
        <button type="button" onClick={onLogout}
          className="m-3 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-red-300/80 hover:bg-red-500/10">
          <LogOut size={18} />خروج
        </button>
      </aside>

      {drawer ? (
        <div className="fixed inset-0 z-50 md:hidden">
          <button type="button" className="absolute inset-0 bg-black/60" onClick={() => setDrawer(false)} />
          <div className="absolute inset-y-0 start-0 flex w-[min(80vw,280px)] flex-col bg-[#0c0c10] shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/5 px-4 py-4">
              <p className="font-black text-primary">منو</p>
              <button type="button" onClick={() => setDrawer(false)} className="p-2 text-white/50"><X size={20} /></button>
            </div>
            <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
              {NAV.map(({ to, end, label, Icon }) => (
                <NavLink key={to} to={to} end={end} onClick={() => setDrawer(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold ${
                      isActive ? "bg-primary/15 text-primary" : "text-white/60"
                    }`}
                >
                  <Icon size={18} />{label}
                </NavLink>
              ))}
            </nav>
            <button type="button" onClick={onLogout}
              className="m-3 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-red-300/80">
              <LogOut size={18} />خروج
            </button>
          </div>
        </div>
      ) : null}

      <main className="md:ps-60"><Outlet /></main>

      <nav className="safe-bottom fixed inset-x-0 bottom-0 z-30 border-t border-white/5 bg-[#0c0c10]/95 backdrop-blur md:hidden">
        <div className="mx-auto flex max-w-lg items-stretch justify-around px-1 py-1.5">
          {BOTTOM.map(({ to, end, label, Icon }) => (
            <NavLink key={to} to={to} end={end}
              className={({ isActive }) =>
                `flex flex-1 flex-col items-center gap-0.5 rounded-xl py-1.5 text-[10px] font-semibold ${
                  isActive ? "text-primary" : "text-white/40"
                }`}
            >
              {({ isActive }) => (
                <>
                  <span className={`flex h-8 w-8 items-center justify-center rounded-full ${isActive ? "bg-primary text-[#0b0b0d]" : ""}`}>
                    <Icon size={isActive ? 18 : 20} strokeWidth={isActive ? 2.2 : 1.6} />
                  </span>
                  {label}
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
