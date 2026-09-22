import { useEffect, useState } from "react";
import { Plus, Search, Trash2, UserPlus } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { coachApi } from "../api/client";
import type { Student } from "../types";
import { GENDER_LABELS } from "../types";
import { PageShell, LoadingBlock, ErrorBanner, EmptyState, Modal, listify } from "../components/ui";

export function StudentsPage() {
  const { gymId } = useAuth();
  const [items, setItems] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [activeOnly, setActiveOnly] = useState(true);
  const [modal, setModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ full_name: "", phone: "", gender: "male", notes: "" });

  const load = async () => {
    if (!gymId) return;
    setLoading(true); setError(null);
    try { setItems(listify<Student>(await coachApi.students(gymId, activeOnly))); }
    catch (e) { setError(e instanceof Error ? e.message : "خطا"); }
    finally { setLoading(false); }
  };
  useEffect(() => { void load(); }, [gymId, activeOnly]);

  const filtered = items.filter((s) => !q || s.full_name?.includes(q) || s.phone?.includes(q));

  const onCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gymId || !form.full_name.trim()) return;
    setSaving(true);
    try {
      await coachApi.createStudent(gymId, { full_name: form.full_name.trim(), phone: form.phone || undefined, gender: form.gender, notes: form.notes || undefined, is_active: true });
      setModal(false); setForm({ full_name: "", phone: "", gender: "male", notes: "" }); await load();
    } catch (err) { alert(err instanceof Error ? err.message : "خطا"); }
    finally { setSaving(false); }
  };

  const onDelete = async (id: number, name: string) => {
    if (!gymId || !confirm(`حذف شاگرد «${name}»؟`)) return;
    try { await coachApi.deleteStudent(gymId, id); await load(); }
    catch (err) { alert(err instanceof Error ? err.message : "خطا"); }
  };

  return (
    <PageShell title="شاگردان" subtitle={`${filtered.length} نفر`}
      actions={<button type="button" className="btn btn-primary btn-sm" onClick={() => setModal(true)}><Plus size={16} /> جدید</button>}>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search size={16} className="absolute start-3 top-1/2 -translate-y-1/2 text-white/35" />
          <input className="field ps-10" placeholder="جستجو…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <button type="button" className={`chip ${activeOnly ? "chip-active" : ""}`} onClick={() => setActiveOnly((v) => !v)}>
          {activeOnly ? "فعال" : "همه"}
        </button>
      </div>
      {loading ? <LoadingBlock /> : null}
      {error ? <ErrorBanner message={error} onRetry={load} /> : null}
      {!loading && !error && filtered.length === 0 ? <EmptyState title="شاگردی یافت نشد" hint="با دکمه جدید اضافه کنید" /> : null}
      <div className="space-y-2">
        {filtered.map((s) => (
          <div key={s.id} className="card flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/15 text-sm font-bold text-primary">{s.full_name?.[0] || "?"}</div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-bold text-white">{s.full_name}</p>
              <p className="text-xs text-white/45">{s.phone || "—"} · {GENDER_LABELS[s.gender || ""] || s.gender || "—"}</p>
            </div>
            <button type="button" className="rounded-lg p-2 text-red-300/70" onClick={() => onDelete(s.id, s.full_name)}><Trash2 size={16} /></button>
          </div>
        ))}
      </div>
      <Modal open={modal} onClose={() => setModal(false)} title="شاگرد جدید">
        <form onSubmit={onCreate} className="space-y-3">
          <div><label className="mb-1 block text-xs text-white/50">نام کامل *</label>
            <input className="field" required value={form.full_name} onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))} /></div>
          <div><label className="mb-1 block text-xs text-white/50">موبایل</label>
            <input className="field" dir="ltr" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} /></div>
          <div><label className="mb-1 block text-xs text-white/50">جنسیت</label>
            <select className="field" value={form.gender} onChange={(e) => setForm((f) => ({ ...f, gender: e.target.value }))}>
              <option value="male">آقا</option><option value="female">خانم</option>
            </select></div>
          <div><label className="mb-1 block text-xs text-white/50">یادداشت</label>
            <textarea className="field" value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} /></div>
          <button type="submit" disabled={saving} className="btn btn-primary w-full">{saving ? "…" : (<><UserPlus size={16} /> ثبت شاگرد</>)}</button>
        </form>
      </Modal>
    </PageShell>
  );
}
