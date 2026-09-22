import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users, ClipboardList, Trophy, Rss, TrendingUp,
  Dumbbell, CalendarDays, ChevronLeft, Plus,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { coachApi } from "../api/client";
import type { Analytics } from "../types";
import { LoadingBlock, ErrorBanner } from "../components/ui";

export function DashboardPage() {
  const { gymId, profile } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    if (!gymId) { setLoading(false); return; }
    setLoading(true); setError(null);
    try {
      const now = new Date();
      setData(await coachApi.analytics(gymId, {
        year: now.getFullYear(),
        month: now.getMonth() + 1,
      }) as Analytics);
    } catch (e) {
      setError(e instanceof Error ? e.message : "خطا");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, [gymId]);

  const firstName = profile?.full_name?.split(" ")[0] || "مربی";
  const today = new Date().toLocaleDateString("fa-IR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  const metrics = [
    { label: "شاگردان", value: data?.total_students ?? "—", to: "/app/students" },
    { label: "تمرین", value: data?.workouts ?? "—", to: "/app/workouts" },
    { label: "رکورد", value: data?.prs ?? "—", to: "/app/prs" },
    { label: "پست", value: data?.posts ?? "—", to: "/app/feed" },
  ];

  const actions = [
    { label: "ثبت تمرین", Icon: ClipboardList, to: "/app/workouts" },
    { label: "شاگرد جدید", Icon: Users, to: "/app/students" },
    { label: "حرکت", Icon: Dumbbell, to: "/app/exercises" },
    { label: "برنامه", Icon: CalendarDays, to: "/app/training" },
    { label: "پیشرفت", Icon: TrendingUp, to: "/app/progress" },
    { label: "فید", Icon: Rss, to: "/app/feed" },
  ];

  return (
    <div className="mx-auto w-full max-w-lg px-5 pt-2 md:max-w-2xl md:pt-8">
      <header className="mb-8 pt-2">
        <p className="text-[13px] font-medium text-white/40">{today}</p>
        <h1 className="mt-1 text-[28px] font-bold leading-tight tracking-tight text-white md:text-[32px]">
          سلام، {firstName}
        </h1>
        {profile?.gym_name ? (
          <p className="mt-1 text-[14px] text-white/45">{profile.gym_name}</p>
        ) : null}
      </header>

      {!gymId ? <ErrorBanner message="باشگاهی به حساب شما متصل نیست." /> : null}
      {loading ? <LoadingBlock label="در حال بارگذاری…" /> : null}
      {error ? <ErrorBanner message={error} onRetry={load} /> : null}

      {!loading && !error && gymId ? (
        <>
          {/* Primary CTA — orange */}
          <button
            type="button"
            onClick={() => navigate("/app/workouts")}
            className="mb-6 flex w-full items-center justify-between rounded-2xl bg-primary px-5 py-4 text-black transition active:scale-[0.98]"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-black/20 text-black">
                <Plus size={20} strokeWidth={2.5} />
              </span>
              <div className="text-right">
                <p className="text-[15px] font-bold">ثبت تمرین جدید</p>
                <p className="text-[12px] text-black/55">جلسه امروز را لاگ کن</p>
              </div>
            </div>
            <ChevronLeft size={18} className="text-black/35" />
          </button>

          {/* Metrics */}
          <section className="mb-8">
            <h2 className="mb-3 text-[13px] font-semibold uppercase tracking-wider text-white/35">
              این ماه
            </h2>
            <div className="grid grid-cols-4 gap-2">
              {metrics.map((m) => (
                <button
                  key={m.label}
                  type="button"
                  onClick={() => navigate(m.to)}
                  className="rounded-2xl bg-[#141414] px-2 py-3 text-center transition active:bg-[#1a1a1a]"
                >
                  <p className="text-[20px] font-bold tabular-nums text-white">{m.value}</p>
                  <p className="mt-0.5 text-[11px] font-medium text-white/40">{m.label}</p>
                </button>
              ))}
            </div>
          </section>

          {/* Shortcuts */}
          <section>
            <h2 className="mb-3 text-[13px] font-semibold uppercase tracking-wider text-white/35">
              میانبرها
            </h2>
            <div className="overflow-hidden rounded-2xl bg-[#141414]">
              {actions.map(({ label, Icon, to }, i) => (
                <button
                  key={to + label}
                  type="button"
                  onClick={() => navigate(to)}
                  className={`flex w-full items-center gap-3.5 px-4 py-3.5 text-right transition active:bg-white/[0.04] ${
                    i < actions.length - 1 ? "border-b border-white/[0.06]" : ""
                  }`}
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/15 text-primary">
                    <Icon size={17} strokeWidth={1.75} />
                  </span>
                  <span className="flex-1 text-[15px] font-medium text-white">{label}</span>
                  <ChevronLeft size={16} className="text-white/20" />
                </button>
              ))}
            </div>
          </section>
        </>
      ) : null}
    </div>
  );
}
