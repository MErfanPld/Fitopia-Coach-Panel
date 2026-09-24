import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { coachApi } from "../api/client";
import type { LeaderboardEntry, Exercise } from "../types";
import { PageShell, LoadingBlock, ErrorBanner, EmptyState, listify } from "../components/ui";
import { FilterBar, FilterChips, FilterSelect } from "../components/FilterBar";

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
    coachApi
      .exercises(gymId)
      .then((d) => setExercises(listify<Exercise>(d)))
      .catch(() => {});
  }, [gymId]);

  const load = async () => {
    if (!gymId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await coachApi.leaderboard(gymId, {
        metric,
        exercise_id: metric === "pr" && exerciseId ? Number(exerciseId) : undefined,
        limit: 20,
      });
      const list = (res?.leaderboard || res?.results || res) as LeaderboardEntry[];
      setEntries(Array.isArray(list) ? list : []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "خطا");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    void load();
  }, [gymId, metric, exerciseId]);

  return (
    <PageShell title="لیدربورد باشگاه" subtitle="رقابت شاگردان">
      <FilterBar>
        <FilterChips
          value={metric}
          onChange={(v) => setMetric(v as "workouts" | "pr")}
          options={[
            { value: "workouts", label: "تعداد جلسات" },
            { value: "pr", label: "بهترین PR" },
          ]}
        />
        {metric === "pr" ? (
          <FilterSelect
            label="حرکت"
            value={exerciseId === "" ? "" : String(exerciseId)}
            onChange={(v) => setExerciseId(v ? Number(v) : "")}
          >
            <option value="">انتخاب حرکت</option>
            {exercises.map((ex) => (
              <option key={ex.id} value={ex.id}>
                {ex.name}
              </option>
            ))}
          </FilterSelect>
        ) : null}
      </FilterBar>

      {loading ? <LoadingBlock /> : null}
      {error ? <ErrorBanner message={error} onRetry={load} /> : null}
      {!loading && !error && entries.length === 0 ? <EmptyState title="هنوز رتبه‌ای نیست" /> : null}

      <div className="space-y-2.5">
        {entries.map((e) => (
          <div key={`${e.rank}-${e.student_id}`} className="row-item">
            <span
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-[0.9375rem] font-black ${
                e.rank === 1
                  ? "bg-amber-500/20 text-amber-400"
                  : e.rank === 2
                    ? "bg-white/10 text-white/70"
                    : e.rank === 3
                      ? "bg-orange-700/20 text-orange-400"
                      : "bg-white/5 text-white/40"
              }`}
            >
              {e.rank}
            </span>
            <div className="min-w-0 flex-1">
              <p className="row-title truncate">{e.student_name}</p>
            </div>
            <span className="text-[1rem] font-black text-primary">{e.value}</span>
          </div>
        ))}
      </div>
    </PageShell>
  );
}
