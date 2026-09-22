import { useEffect, useState } from "react";
import { Plus, Trash2, Pencil } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { coachApi } from "../api/client";
import type { TrainingPlan, Student } from "../types";
import { PageShell, LoadingBlock, ErrorBanner, EmptyState, Modal, listify } from "../components/ui";
import {
  PERSIAN_MONTHS,
  todayJalali,
  toFaDigits,
  toGregorian,
  formatFaYearMonth,
} from "../lib/dates";

export function TrainingPage() {
  const { gymId } = useAuth();
  const toast = useToast();
  const tj = todayJalali();
  const [items, setItems] = useState<TrainingPlan[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [jy, setJy] = useState(tj.jy);
  const [jm, setJm] = useState(tj.jm);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<TrainingPlan | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ student: "", title: "", content: "" });

  const g = toGregorian(jy, jm, 15);

  const load = async () => {
    if (!gymId) return;
    setLoading(true); setError(null);
    try {
      const [t, s] = await Promise.all([
        coachApi.training(gymId, { year: g.gy, month: g.gm }),
        coachApi.students(gymId, true),
      ]);
      setItems(listify<TrainingPlan>(t));
      setStudents(listify<Student>(s));
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطا");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { void load(); }, [gymId, jy, jm]);

  const openCreate = () => {
    setEditing(null);
    setForm({ student: "", title: "", content: "" });
    setModal(true);
  };

  const openEdit = (p: TrainingPlan) => {
    setEditing(p);
    setForm({
      student: String(p.student),
      title: p.title || "",
      content: p.content || "",
    });
    setModal(true);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gymId || !form.student) return;
    setSaving(true);
    try {
      const body = {
        student: Number(form.student),
        year: g.gy,
        month: g.gm,
        title: form.title || undefined,
        content: form.content || undefined,
      };
      if (editing) {
        await coachApi.updateTraining(gymId, editing.id, body);
        toast.success("برنامه ویرایش شد");
      } else {
        await coachApi.createTraining(gymId, body);
        toast.success("برنامه ثبت شد");
      }
      setModal(false);
      setEditing(null);
      setForm({ student: "", title: "", content: "" });
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "خطا");
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async (id: number) => {
    if (!gymId) return;
    const ok = await toast.confirm("حذف این برنامه؟");
    if (!ok) return;
    try {
      await coachApi.deleteTraining(gymId, id);
      toast.success("حذف شد");
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "خطا");
    }
  };

  return (
    <PageShell
      title="برنامه تمرینی"
      subtitle={toFaDigits(`${PERSIAN_MONTHS[jm - 1]} ${jy}`)}
      actions={
        <button type="button" className="btn btn-primary btn-sm" onClick={openCreate}>
          <Plus size={14} /> جدید
        </button>
      }
    >
      <div className="flex gap-2">
        <select className="field" value={jm} onChange={(e) => setJm(Number(e.target.value))}>
          {PERSIAN_MONTHS.map((name, i) => (
            <option key={name} value={i + 1}>{name}</option>
          ))}
        </select>
        <select className="field" value={jy} onChange={(e) => setJy(Number(e.target.value))}>
          {Array.from({ length: 7 }, (_, i) => tj.jy - 2 + i).map((y) => (
            <option key={y} value={y}>{toFaDigits(y)}</option>
          ))}
        </select>
      </div>
      {loading ? <LoadingBlock /> : null}
      {error ? <ErrorBanner message={error} onRetry={load} /> : null}
      {!loading && !error && items.length === 0 ? (
        <EmptyState title="برنامه‌ای برای این ماه نیست" />
      ) : null}
      <div className="space-y-2">
        {items.map((p) => (
          <div key={p.id} className="card flex items-start gap-2.5">
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-bold text-white">{p.title || "برنامه تمرینی"}</p>
              <p className="text-[11px] text-white/45">
                {p.student_name || `شاگرد #${p.student}`}
                {p.year && p.month ? ` · ${formatFaYearMonth(p.year, p.month)}` : ""}
              </p>
              {p.content ? <p className="mt-1 line-clamp-2 text-[11px] text-white/40">{p.content}</p> : null}
            </div>
            <button type="button" className="rounded-lg p-1.5 text-white/45" onClick={() => openEdit(p)}>
              <Pencil size={14} />
            </button>
            <button type="button" className="rounded-lg p-1.5 text-red-300/70" onClick={() => onDelete(p.id)}>
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>
      <Modal open={modal} onClose={() => { setModal(false); setEditing(null); }} title={editing ? "ویرایش برنامه" : "برنامه تمرینی جدید"}>
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
          <p className="text-[11px] text-white/40">
            ماه ثبت: {toFaDigits(`${PERSIAN_MONTHS[jm - 1]} ${jy}`)}
          </p>
          <div>
            <label className="mb-1 block text-[11px] text-white/50">عنوان</label>
            <input className="field" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
          </div>
          <div>
            <label className="mb-1 block text-[11px] text-white/50">محتوا</label>
            <textarea className="field" value={form.content} onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))} rows={4} />
          </div>
          <button type="submit" disabled={saving} className="btn btn-primary w-full">
            {saving ? "…" : editing ? "ذخیره تغییرات" : "ثبت برنامه"}
          </button>
        </form>
      </Modal>
    </PageShell>
  );
}
