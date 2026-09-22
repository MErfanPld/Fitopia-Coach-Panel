import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { coachApi } from "../api/client";
import type { PersonalRecord, Student, Exercise } from "../types";
import { PageShell, LoadingBlock, ErrorBanner, EmptyState, Modal, listify } from "../components/ui";
import { formatFaDate } from "../lib/dates";

export function PRsPage() {
  const { gymId } = useAuth();
  const [items, setItems] = useState<PersonalRecord[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modal, setModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    student: "",
    exercise: "",
    value: "",
    unit: "kg",
    achieved_at: new Date().toISOString().slice(0, 10),
  });

  const load = async () => {
    if (!gymId) return;
    setLoading(true); setError(null);
    try {
      const [p, s, e] = await Promise.all([
        coachApi.prs(gymId),
        coachApi.students(gymId, true),
        coachApi.exercises(gymId),
      ]);
      setItems(listify<PersonalRecord>(p));
      setStudents(listify<Student>(s));
      setExercises(listify<Exercise>(e));
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطا");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { void load(); }, [gymId]);

  const onCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gymId || !form.student || !form.exercise || !form.value) return;
    setSaving(true);
    try {
      await coachApi.createPr(gymId, {
        student: Number(form.student),
        exercise: Number(form.exercise),
        value: form.value,
        unit: form.unit,
        achieved_at: form.achieved_at,
      });
      setModal(false);
      await load();
    } catch (err) {
      alert(err instanceof Error ? err.message : "خطا");
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async (id: number) => {
    if (!gymId || !confirm("حذف این رکورد؟")) return;
    try {
      await coachApi.deletePr(gymId, id);
      await load();
    } catch (err) {
      alert(err instanceof Error ? err.message : "خطا");
    }
  };

  return (
    <PageShell
      title="رکوردهای شخصی"
      subtitle={`${items.length} رکورد`}
      actions={
        <button type="button" className="btn btn-primary btn-sm" onClick={() => setModal(true)}>
          <Plus size={14} /> جدید
        </button>
      }
    >
      {loading ? <LoadingBlock /> : null}
      {error ? <ErrorBanner message={error} onRetry={load} /> : null}
      {!loading && !error && items.length === 0 ? <EmptyState title="رکوردی ثبت نشده" /> : null}
      <div className="space-y-2">
        {items.map((pr) => (
          <div key={pr.id} className="card flex items-center gap-2.5">
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-bold text-white">{pr.exercise_name || `حرکت #${pr.exercise}`}</p>
              <p className="text-[11px] text-white/45">
                {pr.student_name || `شاگرد #${pr.student}`} ·{" "}
                {formatFaDate(pr.achieved_at || (pr as { date?: string }).date)}
              </p>
            </div>
            <span className="text-[13px] font-bold text-primary">
              {pr.value ?? (pr as { weight?: string }).weight} {pr.unit || "kg"}
            </span>
            <button type="button" className="rounded-lg p-1.5 text-red-300/70" onClick={() => onDelete(pr.id)}>
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>
      <Modal open={modal} onClose={() => setModal(false)} title="رکورد جدید">
        <form onSubmit={onCreate} className="space-y-2.5">
          <div>
            <label className="mb-1 block text-[11px] text-white/50">شاگرد *</label>
            <select className="field" required value={form.student} onChange={(e) => setForm((f) => ({ ...f, student: e.target.value }))}>
              <option value="">انتخاب</option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>{s.full_name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-[11px] text-white/50">حرکت *</label>
            <select className="field" required value={form.exercise} onChange={(e) => setForm((f) => ({ ...f, exercise: e.target.value }))}>
              <option value="">انتخاب</option>
              {exercises.map((ex) => (
                <option key={ex.id} value={ex.id}>{ex.name}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="mb-1 block text-[11px] text-white/50">مقدار *</label>
              <input className="field" dir="ltr" required value={form.value} onChange={(e) => setForm((f) => ({ ...f, value: e.target.value }))} />
            </div>
            <div>
              <label className="mb-1 block text-[11px] text-white/50">واحد</label>
              <select className="field" value={form.unit} onChange={(e) => setForm((f) => ({ ...f, unit: e.target.value }))}>
                <option value="kg">kg</option>
                <option value="reps">reps</option>
                <option value="seconds">ثانیه</option>
              </select>
            </div>
          </div>
          <div>
            <label className="mb-1 block text-[11px] text-white/50">تاریخ</label>
            <input
              className="field"
              type="date"
              dir="ltr"
              value={form.achieved_at}
              onChange={(e) => setForm((f) => ({ ...f, achieved_at: e.target.value }))}
            />
            <p className="mt-1 text-[10px] text-white/30">نمایش: {formatFaDate(form.achieved_at)}</p>
          </div>
          <button type="submit" disabled={saving} className="btn btn-primary w-full">
            {saving ? "…" : "ثبت رکورد"}
          </button>
        </form>
      </Modal>
    </PageShell>
  );
}
