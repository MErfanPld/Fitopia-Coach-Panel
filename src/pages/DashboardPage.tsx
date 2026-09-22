import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users, ClipboardList, Trophy, Rss, TrendingUp,
  Dumbbell, CalendarDays, Utensils, Medal, ChevronLeft,
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
    if (!gymId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const now = new Date();
      setData(
        (await coachApi.analytics(gymId, {
          year: now.getFullYear(),
          month: now.getMonth() + 1,
        })) as Analytics,
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "خطا");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [gymId]);

  const firstName = profile?.full_name?.split(" ")[0] || "مربی";
  const monthLabel = new Date().toLocaleDateString("fa-IR", {
    month: "long",
    year: "numeric",
  });

  const stats = [
    {
      label: "کل شاگردان",
      value: data?.total_students ?? "—",
      Icon: Users,
      to: "/app/students",
      accent: "from-orange-500/20 to-orange-600/5",
    },
    {
      label: "فعال",
      value: data?.active_students ?? "—",
      Icon: TrendingUp,
      to: "/app/students",
      accent: "from-emerald-500/20 to-emerald-600/5",
    },
    {
      label: "تمرین‌ها",
      value: data?.workouts ?? "—",
      Icon: ClipboardList,
      to: "/app/workouts",
      accent: "from-sky-500/20 to-sky-600/5",
    },
    {
      label: "رکوردها",
      value: data?.prs ?? "—",
      Icon: Trophy,
      to: "/app/prs",
      accent: "from-amber-500/20 to-amber-600/5",
    },
  ];

  const quick = [
    { label: "ثبت تمرین", Icon: ClipboardList, to: "/app/workouts" },
    { label: "شاگردان", Icon: Users, to: "/app/students" },
    { label: "حرکات", Icon: Dumbbell, to: "/app/exercises" },
    { label: "برنامه", Icon: CalendarDays, to: "/app/training" },
    { label: "غذا", Icon: Utensils, to: "/app/diet" },
    { label: "فید", Icon: Rss, to: "/app/feed" },
    { label: "لیدربورد", Icon: Medal, to: "/app/leaderboard" },
    { label: "پیشرفت", Icon: TrendingUp, to: "/app/progress" },
  ];

  return (
    <div className="mx-auto w-full max-w-3xl space-y-5 px-4 pt-4 md:px-6 md:pt-6">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-br from-[#1a1410] via-[#121216] to-[#121216] p-5">
        <div
          aria-hidden
          className="pointer-events-none absolute -start-10 -top-10 h-40 w-40 rounded-full bg-primary/20 blur-3xl"
        />
        <div className="relative">
          <p className="text-xs font-semibold text-white/40">{monthLabel}</p>
          <h1 className="mt-1 text-2xl font-black tracking-tight text-white md:text-3xl">
            سلام {firstName} 👋
          </h1>
          <p className="mt-1 text-sm text-white/50">
            {profile?.gym_name || "داشبورد مربی"}
          </p>
          {data?.posts != null ? (
            <button
              type="button"
              onClick={() => navigate("/app/feed")}
              className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-semibold text-white/70"
            >
              <Rss size={13} className="text-primary" />
              {data.posts} پست این ماه
              <ChevronLeft size={14} className="text-white/30" />
            </button>
          ) : null}
        </div>
      </section>

      {!gymId ? (
        <ErrorBanner message="باشگاهی به حساب شما متصل نیست." />
      ) : null}
      {loading ? <LoadingBlock /> : null}
      {error ? <ErrorBanner message={error} onRetry={load} /> : null}

      {/* آمار */}
      {!loading && !error && gymId ? (
        <section>
          <div className="mb-2.5 flex items-center justify-between">
            <h2 className="text-sm font-bold text-white/70">آمار ماه جاری</h2>
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            {stats.map(({ label, value, Icon, to, accent }) => (
              <button
                key={label}
                type="button"
                onClick={() => navigate(to)}
                className={`relative overflow-hidden rounded-2xl border border-white/[0.07] bg-gradient-to-br ${accent} p-4 text-right transition active:scale-[0.98]`}
              >
                <div className="flex items-center justify-between">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-black/25 text-primary">
                    <Icon size={18} strokeWidth={1.85} />
                  </span>
                  <ChevronLeft size={15} className="text-white/20" />
                </div>
                <p className="mt-3 text-2xl font-black tabular-nums text-white">
                  {value}
                </p>
                <p className="mt-0.5 text-xs font-medium text-white/45">{label}</p>
              </button>
            ))}
          </div>
        </section>
      ) : null}

      {/* دسترسی سریع */}
      <section>
        <h2 className="mb-2.5 text-sm font-bold text-white/70">دسترسی سریع</h2>
        <div className="grid grid-cols-4 gap-2">
          {quick.map(({ label, Icon, to }) => (
            <button
              key={to + label}
              type="button"
              onClick={() => navigate(to)}
              className="flex flex-col items-center gap-2 rounded-2xl border border-white/[0.07] bg-[#121216] px-2 py-3 transition active:scale-[0.96] active:border-primary/30"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/12 text-primary">
                <Icon size={18} strokeWidth={1.85} />
              </span>
              <span className="text-[11px] font-semibold text-white/65">{label}</span>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
