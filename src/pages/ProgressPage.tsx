import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { coachApi } from "../api/client";
import type { Student } from "../types";
import { PageShell, LoadingBlock, ErrorBanner, EmptyState, listify } from "../components/ui";

interface ProgressData {
  sessions_count?: number;
  workout_volume?: { date: string; volume: number }[];
  personal_records?: { id: number; exercise?: number; exercise_name?: string; value: number; unit?: string }[];
}

export function ProgressPage() {
  const { gymId } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [studentId, setStudentId] = useState<number | "">("");
  const [data, setData] = useState<ProgressData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!gymId) return;
    coachApi.students(gymId, true).then((d) => {
      const list = listify<Student>(d); setStudents(list);
      if (list[0]) setStudentId(list[0].id);
    }).catch(() => {});
  }, [gymId]);

  useEffect(() => {
    if (!gymId || !studentId) return;
    setLoading(true); setError(null);
    coachApi.progress(gymId, Number(studentId), 90)
      .then((d) => setData(d as ProgressData))
      .catch((e) => setError(e instanceof Error ? e.message : "خطا"))
      .finally(() => setLoading(false));
  }, [gymId, studentId]);

  return (
    <PageShell title="نمودار پیشرفت" subtitle="۹۰ روز اخیر">
      <select className="field" value={studentId} onChange={(e) => setStudentId(e.target.value ? Number(e.target.value) : "")}>
        <option value="">انتخاب شاگرد</option>
        {students.map((s) => <option key={s.id} value={s.id}>{s.full_name}</option>)}
      </select>
      {loading ? <LoadingBlock /> : null}
      {error ? <ErrorBanner message={error} /> : null}
      {!loading && !error && data ? (
        <div className="space-y-3">
          <div className="card"><p className="text-xs text-white/45">تعداد جلسات</p><p className="text-3xl font-black text-primary">{data.sessions_count ?? 0}</p></div>
          <div className="card space-y-2">
            <p className="text-sm font-bold text-white/80">حجم تمرین</p>
            {(data.workout_volume || []).length === 0 ? <p className="text-xs text-white/40">داده‌ای نیست</p> : (
              (data.workout_volume || []).slice(-10).map((v, i) => (
                <div key={i} className="flex items-center justify-between text-xs"><span className="text-white/50">{v.date}</span><span className="font-bold text-white">{v.volume}</span></div>
              ))
            )}
          </div>
          <div className="card space-y-2">
            <p className="text-sm font-bold text-white/80">رکوردهای اخیر</p>
            {(data.personal_records || []).length === 0 ? <p className="text-xs text-white/40">رکوردی نیست</p> : (
              (data.personal_records || []).slice(0, 5).map((pr) => (
                <div key={pr.id} className="flex justify-between text-xs">
                  <span className="text-white/60">{pr.exercise_name || `#${pr.exercise}`}</span>
                  <span className="font-bold text-primary">{pr.value} {pr.unit}</span>
                </div>
              ))
            )}
          </div>
        </div>
      ) : null}
      {!loading && !error && !studentId ? <EmptyState title="یک شاگرد انتخاب کنید" /> : null}
    </PageShell>
  );
}
