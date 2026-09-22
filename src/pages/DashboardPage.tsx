import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Users, ClipboardList, Trophy, Rss, TrendingUp, ChevronLeft } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { coachApi } from "../api/client";
import type { Analytics } from "../types";
import { PageShell, LoadingBlock, ErrorBanner } from "../components/ui";

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
      setData(await coachApi.analytics(gymId, { year: now.getFullYear(), month: now.getMonth() + 1 }) as Analytics);
    } catch (e) { setError(e instanceof Error ? e.message : "خطا"); }
    finally { setLoading(false); }
  };
  useEffect(() => { void load(); }, [gymId]);

  const cards = [
    { label: "کل شاگردان", value: data?.total_students ?? "—", Icon: Users, to: "/app/students" },
    { label: "فعال", value: data?.active_students ?? "—", Icon: TrendingUp, to: "/app/students" },
    { label: "تمرین‌ها", value: data?.workouts ?? "—", Icon: ClipboardList, to: "/app/workouts" },
    { label: "رکوردها", value: data?.prs ?? "—", Icon: Trophy, to: "/app/prs" },
    { label: "پست‌ها", value: data?.posts ?? "—", Icon: Rss, to: "/app/feed" },
  ];
  const firstName = profile?.full_name?.split(" ")[0] || "مربی";

  return (
    <PageShell title={`سلام ${firstName} 👋`} subtitle={profile?.gym_name || "داشبورد ماه جاری"}>
      {!gymId ? <ErrorBanner message="باشگاهی به حساب شما متصل نیست." /> : null}
      {loading ? <LoadingBlock /> : null}
      {error ? <ErrorBanner message={error} onRetry={load} /> : null}
      {!loading && !error && gymId ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {cards.map(({ label, value, Icon, to }) => (
            <button key={label} type="button" onClick={() => navigate(to)}
              className="card flex flex-col items-start gap-2 text-right transition active:scale-[0.98]">
              <div className="flex w-full items-center justify-between">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/15 text-primary"><Icon size={18} /></span>
                <ChevronLeft size={16} className="text-white/25" />
              </div>
              <p className="text-2xl font-black text-white">{value}</p>
              <p className="text-xs text-white/45">{label}</p>
            </button>
          ))}
        </div>
      ) : null}
      <div className="card space-y-2">
        <p className="text-sm font-bold text-white/80">دسترسی سریع</p>
        <div className="flex flex-wrap gap-2">
          {[
            { label: "ثبت تمرین", to: "/app/workouts" },
            { label: "شاگرد جدید", to: "/app/students" },
            { label: "حرکت جدید", to: "/app/exercises" },
            { label: "لیدربورد", to: "/app/leaderboard" },
          ].map((q) => (
            <button key={q.to} type="button" onClick={() => navigate(q.to)} className="chip chip-active">{q.label}</button>
          ))}
        </div>
      </div>
    </PageShell>
  );
}
