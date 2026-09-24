import { useEffect, useState } from "react";
import { Plus, Trash2, Pencil } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { coachApi } from "../api/client";
import type { Exercise } from "../types";
import { MUSCLE_GROUPS } from "../types";
import { PageShell, LoadingBlock, ErrorBanner, EmptyState, Modal, listify } from "../components/ui";
import { FilterBar, SearchField, FilterChips } from "../components/FilterBar";

const emptyForm = { name: "", muscle_group: "legs", equipment: "", instructions: "" };

export function ExercisesPage() {
  const { gymId } = useAuth();
  const toast = useToast();
  const [items, setItems] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [muscle, setMuscle] = useState("");
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<Exercise | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const load = async () => {
    if (!gymId) return;
    setLoading(true);
    setError(null);
    try {
      setItems(
        listify<Exercise>(
          await coachApi.exercises(gymId, {
            q: q || undefined,
            muscle_group: muscle || undefined,
          }),
        ),
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "خطا");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    const t = setTimeout(() => void load(), 250);
    return () => clearTimeout(t);
  }, [gymId, q, muscle]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setModal(true);
  };

  const openEdit = (ex: Exercise) => {
    setEditing(ex);
    setForm({
      name: ex.name || "",
      muscle_group: ex.muscle_group || "legs",
      equipment: ex.equipment || "",
      instructions: ex.instructions || "",
    });
    setModal(true);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gymId || !form.name.trim()) return;
    setSaving(true);
    try {
      const body = {
        name: form.name.trim(),
        muscle_group: form.muscle_group,
        equipment: form.equipment || undefined,
        instructions: form.instructions || undefined,
      };
      if (editing) {
        await coachApi.updateExercise(gymId, editing.id, body);
        toast.success("حرکت ویرایش شد");
      } else {
        await coachApi.createExercise(gymId, body);
        toast.success("حرکت ثبت شد");
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
    const ok = await toast.confirm(`حذف «${name}»؟`);
    if (!ok) return;
    try {
      await coachApi.deleteExercise(gymId, id);
      toast.success("حذف شد");
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "خطا");
    }
  };

  const muscleLabel = (v?: string) =>
    MUSCLE_GROUPS.find((m) => m.value === v)?.label || v || "—";

  return (
    <PageShell
      title="بانک حرکات"
      subtitle={`${items.length} حرکت`}
      actions={
        <button type="button" className="btn btn-primary btn-sm" onClick={openCreate}>
          <Plus size={16} /> جدید
        </button>
      }
    >
      <FilterBar>
        <SearchField value={q} onChange={setQ} placeholder="جستجوی نام حرکت…" />
        <FilterChips
          value={muscle}
          onChange={setMuscle}
          options={[
            { value: "", label: "همه" },
            ...MUSCLE_GROUPS.map((m) => ({ value: m.value, label: m.label })),
          ]}
        />
      </FilterBar>

      {loading ? <LoadingBlock /> : null}
      {error ? <ErrorBanner message={error} onRetry={load} /> : null}
      {!loading && !error && items.length === 0 ? <EmptyState title="حرکتی نیست" /> : null}

      <div className="space-y-2.5">
        {items.map((ex) => (
          <div key={ex.id} className="row-item">
            <div className="min-w-0 flex-1">
              <p className="row-title">{ex.name}</p>
              <p className="row-meta">
                {muscleLabel(ex.muscle_group)}
                {ex.equipment ? ` · ${ex.equipment}` : ""}
              </p>
            </div>
            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-xl text-white/45 hover:bg-white/[0.05]"
              onClick={() => openEdit(ex)}
            >
              <Pencil size={17} />
            </button>
            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-xl text-red-300/65 hover:bg-red-500/10"
              onClick={() => onDelete(ex.id, ex.name)}
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
        title={editing ? "ویرایش حرکت" : "حرکت جدید"}
      >
        <form onSubmit={onSubmit} className="space-y-3.5">
          <div>
            <label className="mb-1.5 block text-[0.8125rem] font-semibold text-white/55">نام *</label>
            <input
              className="field"
              required
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-[0.8125rem] font-semibold text-white/55">گروه عضلانی</label>
            <select
              className="field"
              value={form.muscle_group}
              onChange={(e) => setForm((f) => ({ ...f, muscle_group: e.target.value }))}
            >
              {MUSCLE_GROUPS.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-[0.8125rem] font-semibold text-white/55">تجهیزات</label>
            <input
              className="field"
              value={form.equipment}
              onChange={(e) => setForm((f) => ({ ...f, equipment: e.target.value }))}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-[0.8125rem] font-semibold text-white/55">دستورالعمل</label>
            <textarea
              className="field"
              value={form.instructions}
              onChange={(e) => setForm((f) => ({ ...f, instructions: e.target.value }))}
            />
          </div>
          <button type="submit" disabled={saving} className="btn btn-primary w-full">
            {saving ? "…" : editing ? "ذخیره تغییرات" : "ثبت حرکت"}
          </button>
        </form>
      </Modal>
    </PageShell>
  );
}
