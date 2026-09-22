import { useEffect, useState } from "react";
import { Plus, Trash2, Pencil } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { coachApi } from "../api/client";
import type { Workout, Student, Exercise } from "../types";
import { PageShell, LoadingBlock, ErrorBanner, EmptyState, Modal, listify } from "../components/ui";
import { PersianDatePicker } from "../components/PersianDatePicker";
import { formatFaDate, todayIso } from "../lib/dates";

const emptyForm = {
  student: "",
  title: "",
  performed_at: todayIso(),
  exercise: "",
  reps: "10",
  weight_kg: "",
};

export function WorkoutsPage() {
  const { gymId } = useAuth();
  const toast = useToast();
  const [items, setItems] = useState<Workout[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<Workout | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);

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
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطا");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { void load(); }, [gymId]);

  const openCreate = () => {
    setEditing(null);
    setForm({ ...emptyForm, performed_at: todayIso() });
    setModal(true);
  };

  const openEdit = (w: Workout) => {
    setEditing(w);
    const first = w.sets?.[0];
    setForm({
      student: String(w.student),
      title: w.title || "",
      performed_at: (w.performed_at || w.date || todayIso()).slice(0, 10),
      exercise: first?.exercise ? String(first.exercise) : "",
      reps: first?.reps != null ? String(first.reps) : "10",
      weight_kg: first?.weight_kg != null ? String(first.weight_kg) : "",
    });
    setModal(true);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gymId || !form.student) return;
    setSaving(true);
    try {
      const sets = form.exercise
        ? [{ exercise: Number(form.exercise), set_number: 1, reps: Number(form.reps) || 10, weight_kg: form.weight_kg || undefined }]
        : [];
      const body = {
        student: Number(form.student),
        title: form.title || undefined,
        performed_at: form.performed_at,
        sets,
      };
      if (editing) {
        await coachApi.updateWorkout(gymId, editing.id, body);
        toast.success("جلسه ویرایش شد");
      } else {
        await coachApi.createWorkout(gymId, body);
        toast.success("جلسه ثبت شد");
      }
      setModal(false);
      setEditing(null);
      setForm({ ...emptyForm, performed_at: todayIso() });
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "خطا");
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async (id: number) => {
    if (!gymId) return;
    const ok = await toast.confirm("حذف این جلسه؟");
    if (!ok) return;
    try {
      await coachApi.deleteWorkout(gymId, id);
      toast.success("حذف شد");
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "خطا");
    }
  };

  return (
    <PageShell
      title="ثبت تمرین"
      subtitle={`${items.length} جلسه`}
      actions={
        <button type="button" className="btn btn-primary btn-sm" onClick={openCreate}>
          <Plus size={14} /> جدید
        </button>
      }
    >
      {loading ? <LoadingBlock /> : null}
      {error ? <ErrorBanner message={error} onRetry={load} /> : null}
      {!loading && !error && items.length === 0 ? (
        <EmptyState title="جلسه‌ای ثبت نشده" hint="با دکمه جدید اضافه کنید" />
      ) : null}
      <div className="space-y-2">
        {items.map((w) => (
          <div key={w.id} className="card flex items-start gap-2.5">
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-bold text-white">{w.student_name || `شاگرد #${w.student}`}</p>
              <p className="text-[11px] text-white/45">
                {formatFaDate(w.performed_at || w.date)}
                {w.title ? ` · ${w.title}` : ""}
              </p>
              {w.sets && w.sets.length > 0 ? (
                <p className="mt-0.5 text-[11px] text-white/35">{w.sets.length} ست</p>
              ) : null}
            </div>
            <button type="button" className="rounded-lg p-1.5 text-white/45" onClick={() => openEdit(w)}>
              <Pencil size={14} />
            </button>
            <button type="button" className="rounded-lg p-1.5 text-red-300/70" onClick={() => onDelete(w.id)}>
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>
      <Modal open={modal} onClose={() => { setModal(false); setEditing(null); }} title={editing ? "ویرایش جلسه" : "جلسه تمرین جدید"}>
        <form onSubmit={onSubmit} className="space-y-2.5">
          <div>
            <label className="mb-1 block text-[11px] text-white/50">شاگرد *</label>
            <select className="field" required value={form.student} onChange={(e) => setForm((f) => ({ ...f, student: e.target.value }))}>
              <option value="">انتخاب</option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>{s.full_name}</option>
              ))}
            </select>
          </div>
          <PersianDatePicker
            label="تاریخ"
            required
            value={form.performed_at}
            onChange={(iso) => setForm((f) => ({ ...f, performed_at: iso }))}
          />
          <div>
            <label className="mb-1 block text-[11px] text-white/50">عنوان</label>
            <input className="field" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
          </div>
          <div>
            <label className="mb-1 block text-[11px] text-white/50">حرکت</label>
            <select className="field" value={form.exercise} onChange={(e) => setForm((f) => ({ ...f, exercise: e.target.value }))}>
              <option value="">اختیاری</option>
              {exercises.map((ex) => (
                <option key={ex.id} value={ex.id}>{ex.name}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="mb-1 block text-[11px] text-white/50">تکرار</label>
              <input className="field" dir="ltr" value={form.reps} onChange={(e) => setForm((f) => ({ ...f, reps: e.target.value }))} />
            </div>
            <div>
              <label className="mb-1 block text-[11px] text-white/50">وزن (kg)</label>
              <input className="field" dir="ltr" value={form.weight_kg} onChange={(e) => setForm((f) => ({ ...f, weight_kg: e.target.value }))} />
            </div>
          </div>
          <button type="submit" disabled={saving} className="btn btn-primary w-full">
            {saving ? "…" : editing ? "ذخیره تغییرات" : "ثبت جلسه"}
          </button>
        </form>
      </Modal>
    </PageShell>
  );
}
