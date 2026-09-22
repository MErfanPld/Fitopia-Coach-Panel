import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { coachApi } from "../api/client";
import type { LeaderboardEntry, Exercise } from "../types";
import { PageShell, LoadingBlock, ErrorBanner, EmptyState, listify } from "../components/ui";

export function LeaderboardPage() {
  const { gymId } = useAuth();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [metric, setMetric] = useState<"workouts" | "pr">("workouts");
  const [exerciseId, setExerciseId] = useState<number | "">("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!gymId) return;
    coachApi.exercises(gymId).then((d) => setExercises(listify<Exercise>(d))).catch(() => {});
  }, [gymId]);

  const load = async () => {
    if (!gymId) return;
    setLoading(true); setError(null);
    try {
      const res = await coachApi.leaderboard(gymId, {
        metric, exercise_id: metric === "pr" && exerciseId ? Number(exerciseId) : undefined, limit: 20,
      });
      const list = (res?.leaderboard || res?.results || res) as LeaderboardEntry[];
      setEntries(Array.isArray(list) ? list : []);
    } catch (e) { setError(e instanceof Error ? e.message : "خطا"); }
    finally { setLoading(false); }
  };
  useEffect(() => { void load(); }, [gymId, metric, exerciseId]);

  return (
    <PageShell title="لیدربورد باشگاه" subtitle="رقابت شاگردان">
      <div className="flex gap-2">
        <button type="button" className={`chip flex-1 justify-center ${metric === "workouts" ? "chip-active" : ""}`} onClick={() => setMetric("workouts")}>تعداد جلسات</button>
        <button type="button" className={`chip flex-1 justify-center ${metric === "pr" ? "chip-active" : ""}`} onClick={() => setMetric("pr")}>بهترین PR</button>
      </div>
      {metric === "pr" ? (
        <select className="field" value={exerciseId} onChange={(e) => setExerciseId(e.target.value ? Number(e.target.value) : "")}>
          <option value="">انتخاب حرکت</option>
          {exercises.map((ex) => <option key={ex.id} value={ex.id}>{ex.name}</option>)}
        </select>
      ) : null}
      {loading ? <LoadingBlock /> : null}
      {error ? <ErrorBanner message={error} onRetry={load} /> : null}
      {!loading && !error && entries.length === 0 ? <EmptyState title="هنوز رتبه‌ای نیست" /> : null}
      <div className="space-y-2">
        {entries.map((e) => (
          <div key={`${e.rank}-${e.student_id}`} className="card flex items-center gap-3">
            <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-black ${
              e.rank === 1 ? "bg-amber-500/20 text-amber-400" : e.rank === 2 ? "bg-white/10 text-white/70" : e.rank === 3 ? "bg-orange-700/20 text-orange-400" : "bg-white/5 text-white/40"
            }`}>{e.rank}</span>
            <div className="min-w-0 flex-1"><p className="truncate font-bold text-white">{e.student_name}</p></div>
            <span className="text-sm font-black text-primary">{e.value}</span>
          </div>
        ))}
      </div>
    </PageShell>
  );
}
