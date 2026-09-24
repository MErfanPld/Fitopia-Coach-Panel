import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users, ClipboardList, Trophy, Rss, TrendingUp,
  Dumbbell, CalendarDays, ChevronLeft, Plus, Activity,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { coachApi } from "../api/client";
import type { Analytics } from "../types";
import { LoadingBlock, ErrorBanner } from "../components/ui";
import { formatFaWeekday } from "../lib/dates";

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
  const todayFa = formatFaWeekday();

  const cards = [
    {
      label: "کل شاگردان",
      value: data?.total_students ?? "—",
      hint: data?.active_students != null ? `${data.active_students} فعال` : undefined,
      Icon: Users,
      to: "/app/students",
    },
    {
      label: "تمرین‌ها",
      value: data?.workouts ?? "—",
      hint: "این ماه",
      Icon: ClipboardList,
      to: "/app/workouts",
    },
    {
      label: "رکوردها",
      value: data?.prs ?? "—",
      hint: "PR",
      Icon: Trophy,
      to: "/app/prs",
    },
    {
      label: "پست‌ها",
      value: data?.posts ?? "—",
      hint: "فید",
      Icon: Rss,
      to: "/app/feed",
    },
  ];

  const shortcuts = [
    { label: "ثبت تمرین", Icon: ClipboardList, to: "/app/workouts" },
    { label: "شاگردان", Icon: Users, to: "/app/students" },
    { label: "حرکات", Icon: Dumbbell, to: "/app/exercises" },
    { label: "برنامه", Icon: CalendarDays, to: "/app/training" },
    { label: "پیشرفت", Icon: TrendingUp, to: "/app/progress" },
    { label: "فید", Icon: Rss, to: "/app/feed" },
  ];

  return (
    <div className="w-full space-y-6 px-4 pt-4 sm:space-y-7 sm:px-5 md:px-6 md:pt-8 lg:px-8">
      <header className="space-y-1.5">
        <p className="text-[12px] font-medium text-white/40">{todayFa}</p>
        <h1 className="text-[22px] font-bold leading-snug tracking-tight text-white sm:text-[24px] md:text-[28px]">
          سلام، {firstName}
        </h1>
        {profile?.gym_name ? (
          <p className="flex items-center gap-1.5 text-[13px] text-white/45">
            <Activity size={13} className="text-primary" />
            {profile.gym_name}
          </p>
        ) : null}
      </header>

      {!gymId ? <ErrorBanner message="باشگاهی به حساب شما متصل نیست." /> : null}
      {loading ? <LoadingBlock label="در حال بارگذاری…" /> : null}
      {error ? <ErrorBanner message={error} onRetry={load} /> : null}

      {!loading && !error && gymId ? (
        <>
          <button
            type="button"
            onClick={() => navigate("/app/workouts")}
            className="flex w-full max-w-xl items-center gap-3.5 rounded-2xl bg-gradient-to-l from-primary to-[#ff8a33] px-4 py-3.5 text-black shadow-[0_8px_28px_rgba(255,106,0,0.28)] transition active:scale-[0.98] md:max-w-none lg:max-w-2xl"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-black/15">
              <Plus size={20} strokeWidth={2.5} />
            </span>
            <div className="min-w-0 flex-1 text-right">
              <p className="text-[14px] font-bold">ثبت تمرین جدید</p>
              <p className="mt-0.5 text-[12px] text-black/55">جلسه امروز را لاگ کن</p>
            </div>
            <ChevronLeft size={18} className="shrink-0 text-black/35" />
          </button>

          <section className="space-y-3">
            <h2 className="text-[12px] font-semibold tracking-wide text-white/40">آمار ماه جاری</h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 md:grid-cols-4">
              {cards.map(({ label, value, hint, Icon, to }) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => navigate(to)}
                  className="card group text-right transition hover:border-primary/25 active:scale-[0.98]"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/15 text-primary">
                      <Icon size={16} strokeWidth={1.9} />
                    </span>
                    <ChevronLeft size={13} className="text-white/20" />
                  </div>
                  <p className="text-[22px] font-bold tabular-nums leading-none text-white md:text-[24px]">
                    {value}
                  </p>
                  <p className="mt-1.5 text-[12px] font-medium text-white/55">{label}</p>
                  {hint ? <p className="mt-0.5 text-[11px] text-white/30">{hint}</p> : null}
                </button>
              ))}
            </div>
          </section>

          <section className="space-y-3 pb-2">
            <h2 className="text-[12px] font-semibold tracking-wide text-white/40">میانبرها</h2>
            <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-3 md:grid-cols-6">
              {shortcuts.map(({ label, Icon, to }) => (
                <button
                  key={to + label}
                  type="button"
                  onClick={() => navigate(to)}
                  className="card flex flex-col items-center gap-2 py-4 transition hover:border-primary/20 active:scale-[0.96]"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/12 text-primary">
                    <Icon size={16} strokeWidth={1.85} />
                  </span>
                  <span className="text-[11px] font-semibold text-white/65">{label}</span>
                </button>
              ))}
            </div>
          </section>
        </>
      ) : null}
    </div>
  );
}
