import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { coachApi } from "../api/client";
import type { DietPlan, Student } from "../types";
import { PageShell, LoadingBlock, ErrorBanner, EmptyState, Modal, listify } from "../components/ui";

export function DietPage() {
  const { gymId } = useAuth();
  const now = new Date();
  const [items, setItems] = useState<DietPlan[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modal, setModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ student: "", title: "", content: "", daily_calories: "" });

  const load = async () => {
    if (!gymId) return;
    setLoading(true); setError(null);
    try {
      const [d, s] = await Promise.all([
        coachApi.diet(gymId, { year, month }),
        coachApi.students(gymId, true),
      ]);
      setItems(listify<DietPlan>(d));
      setStudents(listify<Student>(s));
    } catch (err) { setError(err instanceof Error ? err.message : "خطا"); }
    finally { setLoading(false); }
  };
  useEffect(() => { void load(); }, [gymId, year, month]);

  const onCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gymId || !form.student) return;
    setSaving(true);
    try {
      await coachApi.createDiet(gymId, {
        student: Number(form.student),
        year, month,
        title: form.title || undefined,
        content: form.content || undefined,
        daily_calories: form.daily_calories ? Number(form.daily_calories) : undefined,
      });
      setModal(false);
      await load();
    } catch (err) { alert(err instanceof Error ? err.message : "خطا"); }
    finally { setSaving(false); }
  };

  const onDelete = async (id: number) => {
    if (!gymId || !confirm("حذف این برنامه غذایی؟")) return;
    try { await coachApi.deleteDiet(gymId, id); await load(); }
    catch (err) { alert(err instanceof Error ? err.message : "خطا"); }
  };

  return (
    <PageShell title="برنامه غذایی" subtitle={`${year}/${month}`}
      actions={<button type="button" className="btn btn-primary btn-sm" onClick={() => setModal(true)}><Plus size={16} /> جدید</button>}>
      <div className="flex gap-2">
        <select className="field" value={month} onChange={(e) => setMonth(Number(e.target.value))}>
          {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => <option key={m} value={m}>ماه {m}</option>)}
        </select>
        <input className="field" type="number" dir="ltr" value={year} onChange={(e) => setYear(Number(e.target.value) || now.getFullYear())} />
      </div>
      {loading ? <LoadingBlock /> : null}
      {error ? <ErrorBanner message={error} onRetry={load} /> : null}
      {!loading && !error && items.length === 0 ? <EmptyState title="برنامه غذایی برای این ماه نیست" /> : null}
      <div className="space-y-2">
        {items.map((p) => (
          <div key={p.id} className="card flex items-start gap-3">
            <div className="min-w-0 flex-1">
              <p className="font-bold text-white">{p.title || "رژیم غذایی"}</p>
              <p className="text-xs text-white/45">{p.student_name || `شاگرد #${p.student}`}{p.daily_calories || p.calories ? ` · ${p.daily_calories || p.calories} کالری` : ""}</p>
              {p.content ? <p className="mt-1 line-clamp-2 text-xs text-white/40">{p.content}</p> : null}
            </div>
            <button type="button" className="rounded-lg p-2 text-red-300/70" onClick={() => onDelete(p.id)}><Trash2 size={16} /></button>
          </div>
        ))}
      </div>
      <Modal open={modal} onClose={() => setModal(false)} title="برنامه غذایی جدید">
        <form onSubmit={onCreate} className="space-y-3">
          <div><label className="mb-1 block text-xs text-white/50">شاگرد *</label>
            <select className="field" required value={form.student} onChange={(e) => setForm((f) => ({ ...f, student: e.target.value }))}>
              <option value="">انتخاب</option>
              {students.map((s) => <option key={s.id} value={s.id}>{s.full_name}</option>)}
            </select></div>
          <div><label className="mb-1 block text-xs text-white/50">عنوان</label>
            <input className="field" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} /></div>
          <div><label className="mb-1 block text-xs text-white/50">کالری روزانه</label>
            <input className="field" dir="ltr" value={form.daily_calories} onChange={(e) => setForm((f) => ({ ...f, daily_calories: e.target.value }))} /></div>
          <div><label className="mb-1 block text-xs text-white/50">محتوا</label>
            <textarea className="field" value={form.content} onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))} rows={4} /></div>
          <button type="submit" disabled={saving} className="btn btn-primary w-full">{saving ? "…" : "ثبت برنامه"}</button>
        </form>
      </Modal>
    </PageShell>
  );
}
