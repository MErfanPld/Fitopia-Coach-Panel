import { useEffect, useState } from "react";
import { Plus, Trash2, Pencil, UserPlus } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { coachApi } from "../api/client";
import type { Student } from "../types";
import { GENDER_LABELS } from "../types";
import { PageShell, LoadingBlock, ErrorBanner, EmptyState, Modal, listify } from "../components/ui";
import { FilterBar, SearchField, FilterChips } from "../components/FilterBar";

const emptyForm = { full_name: "", phone: "", gender: "male", notes: "", is_active: true };

export function StudentsPage() {
  const { gymId } = useAuth();
  const toast = useToast();
  const [items, setItems] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [activeOnly, setActiveOnly] = useState(true);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<Student | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const load = async () => {
    if (!gymId) return;
    setLoading(true);
    setError(null);
    try {
      setItems(listify<Student>(await coachApi.students(gymId, activeOnly)));
    } catch (e) {
      setError(e instanceof Error ? e.message : "خطا");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    void load();
  }, [gymId, activeOnly]);

  const filtered = items.filter(
    (s) => !q || s.full_name?.includes(q) || s.phone?.includes(q),
  );

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setModal(true);
  };

  const openEdit = (s: Student) => {
    setEditing(s);
    setForm({
      full_name: s.full_name || "",
      phone: s.phone || "",
      gender: s.gender || "male",
      notes: s.notes || "",
      is_active: s.is_active !== false,
    });
    setModal(true);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gymId || !form.full_name.trim()) return;
    setSaving(true);
    try {
      const body = {
        full_name: form.full_name.trim(),
        phone: form.phone || undefined,
        gender: form.gender,
        notes: form.notes || undefined,
        is_active: form.is_active,
      };
      if (editing) {
        await coachApi.updateStudent(gymId, editing.id, body);
        toast.success("شاگرد ویرایش شد");
      } else {
        await coachApi.createStudent(gymId, body);
        toast.success("شاگرد ثبت شد");
      }
      setModal(false);
      setEditing(null);
      setForm(emptyForm);
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "خطا");
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async (id: number, name: string) => {
    if (!gymId) return;
    const ok = await toast.confirm(`حذف شاگرد «${name}»؟`);
    if (!ok) return;
    try {
      await coachApi.deleteStudent(gymId, id);
      toast.success("حذف شد");
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "خطا");
    }
  };

  return (
    <PageShell
      title="شاگردان"
      subtitle={`${filtered.length} نفر`}
      actions={
        <button type="button" className="btn btn-primary btn-sm" onClick={openCreate}>
          <Plus size={16} /> جدید
        </button>
      }
    >
      <FilterBar>
        <SearchField
          value={q}
          onChange={setQ}
          placeholder="جستجوی نام یا موبایل…"
        />
        <FilterChips
          value={activeOnly ? "active" : "all"}
          onChange={(v) => setActiveOnly(v === "active")}
          options={[
            { value: "active", label: "فعال" },
            { value: "all", label: "همه" },
          ]}
        />
      </FilterBar>

      {loading ? <LoadingBlock /> : null}
      {error ? <ErrorBanner message={error} onRetry={load} /> : null}
      {!loading && !error && filtered.length === 0 ? (
        <EmptyState title="شاگردی یافت نشد" hint="با دکمه جدید اولین شاگرد را اضافه کنید" />
      ) : null}

      <div className="space-y-2.5">
        {filtered.map((s) => (
          <div key={s.id} className="row-item">
            <div className="avatar">{s.full_name?.[0] || "?"}</div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="row-title truncate">{s.full_name}</p>
                <span className={s.is_active === false ? "status-dot status-dot-off" : "status-dot"} />
              </div>
              <p className="row-meta">
                {s.phone || "بدون موبایل"}
                {" · "}
                {GENDER_LABELS[s.gender || ""] || s.gender || "—"}
                {s.is_active === false ? " · غیرفعال" : ""}
              </p>
            </div>
            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-xl text-white/45 hover:bg-white/[0.05] hover:text-white/75"
              onClick={() => openEdit(s)}
              aria-label="ویرایش"
            >
              <Pencil size={17} />
            </button>
            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-xl text-red-300/65 hover:bg-red-500/10"
              onClick={() => onDelete(s.id, s.full_name)}
              aria-label="حذف"
            >
              <Trash2 size={17} />
            </button>
          </div>
        ))}
      </div>

      <Modal
        open={modal}
        onClose={() => {
          setModal(false);
          setEditing(null);
        }}
        title={editing ? "ویرایش شاگرد" : "شاگرد جدید"}
      >
        <form onSubmit={onSubmit} className="space-y-3.5">
          <div>
            <label className="mb-1.5 block text-[0.8125rem] font-semibold text-white/55">نام کامل *</label>
            <input
              className="field"
              required
              value={form.full_name}
              onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-[0.8125rem] font-semibold text-white/55">موبایل</label>
            <input
              className="field"
              dir="ltr"
              value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-[0.8125rem] font-semibold text-white/55">جنسیت</label>
            <select
              className="field"
              value={form.gender}
              onChange={(e) => setForm((f) => ({ ...f, gender: e.target.value }))}
            >
              <option value="male">آقا</option>
              <option value="female">خانم</option>
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-[0.8125rem] font-semibold text-white/55">یادداشت</label>
            <textarea
              className="field"
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
            />
          </div>
          {editing ? (
            <label className="flex items-center gap-2.5 text-[0.9375rem] text-white/75">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))}
              />
              فعال
            </label>
          ) : null}
          <button type="submit" disabled={saving} className="btn btn-primary w-full">
            {saving ? "…" : editing ? "ذخیره تغییرات" : (
              <>
                <UserPlus size={16} /> ثبت شاگرد
              </>
            )}
          </button>
        </form>
      </Modal>
    </PageShell>
  );
}
