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
  Sparkles,
  ArrowUpLeft,
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
      tone: "from-primary/20 to-transparent",
    },
    {
      label: "تمرین‌ها",
      value: data?.workouts ?? "—",
      hint: "این ماه",
      Icon: ClipboardList,
      to: "/app/workouts",
      tone: "from-orange-400/15 to-transparent",
    },
    {
      label: "رکوردها",
      value: data?.prs ?? "—",
      hint: "PR ثبت‌شده",
      Icon: Trophy,
      to: "/app/prs",
      tone: "from-amber-400/15 to-transparent",
    },
    {
      label: "پست‌ها",
      value: data?.posts ?? "—",
      hint: "فید",
      Icon: Rss,
      to: "/app/feed",
      tone: "from-white/10 to-transparent",
    },
  ];

  const shortcuts = [
    { label: "ثبت تمرین", Icon: ClipboardList, to: "/app/workouts", accent: true },
    { label: "شاگردان", Icon: Users, to: "/app/students" },
    { label: "حرکات", Icon: Dumbbell, to: "/app/exercises" },
    { label: "برنامه", Icon: CalendarDays, to: "/app/training" },
    { label: "پیشرفت", Icon: TrendingUp, to: "/app/progress" },
    { label: "فید", Icon: Rss, to: "/app/feed" },
  ];

  return (
    <div className="w-full space-y-6 px-4 pt-4 sm:space-y-7 sm:px-5 md:px-6 md:pt-8 lg:px-8">
      {/* Hero greeting — coach action inbox style */}
      <section className="card-hero relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute -end-8 -top-10 h-32 w-32 rounded-full bg-primary/25 blur-3xl"
        />
        <div className="relative flex items-start justify-between gap-3">
          <div className="min-w-0 space-y-1.5">
            <p className="text-[11px] font-semibold text-white/45">{todayFa}</p>
            <h1 className="text-[1.45rem] font-black leading-tight tracking-tight text-white sm:text-[1.65rem] md:text-[1.85rem]">
              سلام، {firstName}
            </h1>
            <p className="flex items-center gap-1.5 text-[12.5px] text-white/55">
              <Sparkles size={13} className="text-primary" />
              {profile?.gym_name || "پنل مربی فیتوپیا"}
            </p>
          </div>
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-black/20 text-sm font-black text-primary ring-1 ring-primary/30">
            {(profile?.full_name?.[0] || "م").toUpperCase()}
          </div>
        </div>

        <button
          type="button"
          onClick={() => navigate("/app/workouts")}
          className="relative mt-5 flex w-full items-center gap-3 rounded-2xl bg-gradient-to-l from-primary to-[#ff8f2e] px-4 py-3.5 text-black shadow-[0_10px_28px_rgba(255,106,0,0.35)] transition active:scale-[0.985]"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-black/15">
            <Plus size={20} strokeWidth={2.6} />
          </span>
          <div className="min-w-0 flex-1 text-right">
            <p className="text-[14px] font-extrabold">ثبت تمرین جدید</p>
            <p className="mt-0.5 text-[11.5px] font-medium text-black/55">جلسه امروز را سریع لاگ کن</p>
          </div>
          <ChevronLeft size={18} className="shrink-0 text-black/35" />
        </button>
      </section>

      {!gymId ? <ErrorBanner message="باشگاهی به حساب شما متصل نیست." /> : null}
      {loading ? <LoadingBlock label="در حال بارگذاری داشبورد…" /> : null}
      {error ? <ErrorBanner message={error} onRetry={load} /> : null}

      {!loading && !error && gymId ? (
        <>
          {/* KPI bento */}
          <section className="space-y-3">
            <SectionHeader title="نمای کلی ماه" />
            <div className="grid grid-cols-2 gap-2.5 md:grid-cols-4 md:gap-3">
              {cards.map(({ label, value, hint, Icon, to, tone }) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => navigate(to)}
                  className={`stat-tile relative overflow-hidden bg-gradient-to-br ${tone}`}
                >
                  <div className="mb-3 flex items-center justify-between">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/15 text-primary">
                      <Icon size={16} strokeWidth={1.9} />
                    </span>
                    <ArrowUpLeft size={14} className="text-white/20" />
                  </div>
                  <p className="stat-value">{value}</p>
                  <p className="stat-label">{label}</p>
                  <p className="stat-hint">{hint}</p>
                </button>
              ))}
            </div>
          </section>

          {/* Quick actions */}
          <section className="space-y-3">
            <SectionHeader title="میانبرها" />
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-3 md:grid-cols-6 md:gap-2.5">
              {shortcuts.map(({ label, Icon, to, accent }) => (
                <button
                  key={to + label}
                  type="button"
                  onClick={() => navigate(to)}
                  className={`card flex flex-col items-center gap-2.5 py-4 transition active:scale-[0.96] ${
                    accent ? "border-primary/30 bg-primary/[0.08]" : ""
                  }`}
                >
                  <span
                    className={`flex h-10 w-10 items-center justify-center rounded-2xl ${
                      accent
                        ? "bg-primary text-black shadow-[0_4px_14px_rgba(255,106,0,0.35)]"
                        : "bg-primary/12 text-primary"
                    }`}
                  >
                    <Icon size={17} strokeWidth={accent ? 2.2 : 1.85} />
                  </span>
                  <span className="text-[11px] font-bold text-white/70">{label}</span>
                </button>
              ))}
            </div>
          </section>

          {/* Coach tip strip */}
          <section className="card flex items-start gap-3 border-primary/15 bg-primary/[0.06]">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/20 text-primary">
              <Sparkles size={16} />
            </span>
            <div className="min-w-0 text-right">
              <p className="text-[13px] font-bold text-white">نکته مربی‌گری</p>
              <p className="mt-1 text-[12px] leading-relaxed text-white/50">
                هر جلسه را همان روز ثبت کن تا آمار ماه و پیشرفت شاگردان دقیق بماند.
              </p>
            </div>
          </section>
        </>
      ) : null}
    </div>
  );
}
