import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  ClipboardList,
  Trophy,
  Rss,
  TrendingUp,
  Dumbbell,
  CalendarDays,
  ChevronLeft,
  Plus,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { coachApi } from "../api/client";
import type { Analytics } from "../types";
import { LoadingBlock, ErrorBanner, SectionHeader } from "../components/ui";
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
      label: "شاگردان",
      value: data?.total_students ?? "—",
      hint: data?.active_students != null ? `${data.active_students} فعال` : "کل",
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
    <div className="w-full space-y-6 px-4 pt-4 sm:px-5 md:px-6 md:pt-8 lg:px-8">
      {/* Simple greeting */}
      <header className="space-y-1">
        <p className="text-[0.8125rem] font-medium" style={{ color: "var(--app-fg-muted)" }}>
          {todayFa}
        </p>
        <h1 className="text-[1.5rem] font-extrabold tracking-tight md:text-[1.75rem]" style={{ color: "var(--app-fg)" }}>
          سلام، {firstName}
        </h1>
        {profile?.gym_name ? (
          <p className="text-[0.875rem]" style={{ color: "var(--app-fg-secondary)" }}>
            {profile.gym_name}
          </p>
        ) : null}
      </header>

      {/* Primary action — big and clear */}
      <button
        type="button"
        onClick={() => navigate("/app/workouts")}
        className="btn btn-primary flex w-full items-center gap-3 px-4 text-right"
      >
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-black/15">
          <Plus size={22} strokeWidth={2.5} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[0.95rem] font-extrabold">ثبت تمرین جدید</span>
          <span className="mt-0.5 block text-[0.75rem] font-medium opacity-60">جلسه امروز را لاگ کن</span>
        </span>
        <ChevronLeft size={18} className="opacity-40" />
      </button>

      {!gymId ? <ErrorBanner message="باشگاهی به حساب شما متصل نیست." /> : null}
      {loading ? <LoadingBlock label="در حال بارگذاری…" /> : null}
      {error ? <ErrorBanner message={error} onRetry={load} /> : null}

      {!loading && !error && gymId ? (
        <>
          <section className="space-y-3">
            <SectionHeader title="آمار این ماه" />
            <div className="grid grid-cols-2 gap-2.5 md:grid-cols-4">
              {cards.map(({ label, value, hint, Icon, to }) => (
                <button key={label} type="button" onClick={() => navigate(to)} className="stat-tile">
                  <div className="mb-3 flex items-center justify-between">
                    <span
                      className="flex h-9 w-9 items-center justify-center rounded-xl"
                      style={{ background: "var(--app-primary-soft)", color: "var(--app-primary)" }}
                    >
                      <Icon size={17} strokeWidth={1.9} />
                    </span>
                  </div>
                  <p className="stat-value">{value}</p>
                  <p className="stat-label">{label}</p>
                  <p className="stat-hint">{hint}</p>
                </button>
              ))}
            </div>
          </section>

          <section className="space-y-3">
            <SectionHeader title="دسترسی سریع" />
            <div className="grid grid-cols-3 gap-2 md:grid-cols-6">
              {shortcuts.map(({ label, Icon, to }) => (
                <button
                  key={to + label}
                  type="button"
                  onClick={() => navigate(to)}
                  className="card flex flex-col items-center gap-2 py-4 active:scale-[0.97]"
                >
                  <span
                    className="flex h-10 w-10 items-center justify-center rounded-xl"
                    style={{ background: "var(--app-primary-soft)", color: "var(--app-primary)" }}
                  >
                    <Icon size={18} strokeWidth={1.9} />
                  </span>
                  <span className="text-[0.75rem] font-bold" style={{ color: "var(--app-fg-secondary)" }}>
                    {label}
                  </span>
                </button>
              ))}
            </div>
          </section>
        </>
      ) : null}
    </div>
  );
}
