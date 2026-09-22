import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { coachApi } from "../api/client";
import type { Workout, Student, Exercise } from "../types";
import { PageShell, LoadingBlock, ErrorBanner, EmptyState, Modal, listify } from "../components/ui";

export function WorkoutsPage() {
  const { gymId } = useAuth();
  const [items, setItems] = useState<Workout[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modal, setModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ student: "", title: "", performed_at: new Date().toISOString().slice(0, 10), exercise: "", reps: "10", weight_kg: "" });

  const load = async () => {
    if (!gymId) return;
    setLoading(true); setError(null);
    try {
      const [w, s, e] = await Promise.all([
        coachApi.workouts(gymId),
        coachApi.students(gymId, true),
        coachApi.exercises(gymId),
      ]);
      setItems(listify<Workout>(w));
      setStudents(listify<Student>(s));
      setExercises(listify<Exercise>(e));
    } catch (err) { setError(err instanceof Error ? err.message : "خطا"); }
    finally { setLoading(false); }
  };
  useEffect(() => { void load(); }, [gymId]);

  const onCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gymId || !form.student) return;
    setSaving(true);
    try {
      const sets = form.exercise
        ? [{ exercise: Number(form.exercise), set_number: 1, reps: Number(form.reps) || 10, weight_kg: form.weight_kg || undefined }]
        : [];
      await coachApi.createWorkout(gymId, {
        student: Number(form.student),
        title: form.title || undefined,
        performed_at: form.performed_at,
        sets,
      });
      setModal(false);
      await load();
    } catch (err) { alert(err instanceof Error ? err.message : "خطا"); }
    finally { setSaving(false); }
  };

  const onDelete = async (id: number) => {
    if (!gymId || !confirm("حذف این جلسه؟")) return;
    try { await coachApi.deleteWorkout(gymId, id); await load(); }
    catch (err) { alert(err instanceof Error ? err.message : "خطا"); }
  };

  return (
    <PageShell title="ثبت تمرین" subtitle={`${items.length} جلسه`}
      actions={<button type="button" className="btn btn-primary btn-sm" onClick={() => setModal(true)}><Plus size={16} /> جدید</button>}>
      {loading ? <LoadingBlock /> : null}
      {error ? <ErrorBanner message={error} onRetry={load} /> : null}
      {!loading && !error && items.length === 0 ? <EmptyState title="جلسه‌ای ثبت نشده" hint="با دکمه جدید اضافه کنید" /> : null}
      <div className="space-y-2">
        {items.map((w) => (
          <div key={w.id} className="card flex items-start gap-3">
            <div className="min-w-0 flex-1">
              <p className="font-bold text-white">{w.student_name || `شاگرد #${w.student}`}</p>
              <p className="text-xs text-white/45">{w.performed_at || w.date || "—"}{w.title ? ` · ${w.title}` : ""}</p>
              {w.sets && w.sets.length > 0 ? (
                <p className="mt-1 text-xs text-white/35">{w.sets.length} ست</p>
              ) : null}
            </div>
            <button type="button" className="rounded-lg p-2 text-red-300/70" onClick={() => onDelete(w.id)}><Trash2 size={16} /></button>
          </div>
        ))}
      </div>
      <Modal open={modal} onClose={() => setModal(false)} title="جلسه تمرین جدید">
        <form onSubmit={onCreate} className="space-y-3">
          <div><label className="mb-1 block text-xs text-white/50">شاگرد *</label>
            <select className="field" required value={form.student} onChange={(e) => setForm((f) => ({ ...f, student: e.target.value }))}>
              <option value="">انتخاب</option>
              {students.map((s) => <option key={s.id} value={s.id}>{s.full_name}</option>)}
            </select></div>
          <div><label className="mb-1 block text-xs text-white/50">تاریخ</label>
            <input className="field" type="date" dir="ltr" value={form.performed_at} onChange={(e) => setForm((f) => ({ ...f, performed_at: e.target.value }))} /></div>
          <div><label className="mb-1 block text-xs text-white/50">عنوان</label>
            <input className="field" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} /></div>
          <div><label className="mb-1 block text-xs text-white/50">حرکت</label>
            <select className="field" value={form.exercise} onChange={(e) => setForm((f) => ({ ...f, exercise: e.target.value }))}>
              <option value="">اختیاری</option>
              {exercises.map((ex) => <option key={ex.id} value={ex.id}>{ex.name}</option>)}
            </select></div>
          <div className="grid grid-cols-2 gap-2">
            <div><label className="mb-1 block text-xs text-white/50">تکرار</label>
              <input className="field" dir="ltr" value={form.reps} onChange={(e) => setForm((f) => ({ ...f, reps: e.target.value }))} /></div>
            <div><label className="mb-1 block text-xs text-white/50">وزن (kg)</label>
              <input className="field" dir="ltr" value={form.weight_kg} onChange={(e) => setForm((f) => ({ ...f, weight_kg: e.target.value }))} /></div>
          </div>
          <button type="submit" disabled={saving} className="btn btn-primary w-full">{saving ? "…" : "ثبت جلسه"}</button>
        </form>
      </Modal>
    </PageShell>
  );
}
