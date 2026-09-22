import { useEffect, useState } from "react";
import { Heart, MessageCircle, Plus, Trash2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { coachApi } from "../api/client";
import type { FeedPost } from "../types";
import { PageShell, LoadingBlock, ErrorBanner, EmptyState, Modal, listify } from "../components/ui";

export function FeedPage() {
  const { gymId } = useAuth();
  const [items, setItems] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modal, setModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [caption, setCaption] = useState("");

  const load = async () => {
    if (!gymId) return;
    setLoading(true); setError(null);
    try { setItems(listify<FeedPost>(await coachApi.feed(gymId))); }
    catch (err) { setError(err instanceof Error ? err.message : "خطا"); }
    finally { setLoading(false); }
  };
  useEffect(() => { void load(); }, [gymId]);

  const onCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gymId || !caption.trim()) return;
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("caption", caption.trim());
      fd.append("text", caption.trim());
      await coachApi.createPost(gymId, fd);
      setCaption("");
      setModal(false);
      await load();
    } catch (err) { alert(err instanceof Error ? err.message : "خطا"); }
    finally { setSaving(false); }
  };

  const onLike = async (id: number) => {
    if (!gymId) return;
    try { await coachApi.likePost(gymId, id); await load(); }
    catch { /* ignore */ }
  };

  const onDelete = async (id: number) => {
    if (!gymId || !confirm("حذف این پست؟")) return;
    try { await coachApi.deletePost(gymId, id); await load(); }
    catch (err) { alert(err instanceof Error ? err.message : "خطا"); }
  };

  return (
    <PageShell title="فید باشگاه" subtitle={`${items.length} پست`}
      actions={<button type="button" className="btn btn-primary btn-sm" onClick={() => setModal(true)}><Plus size={16} /> پست</button>}>
      {loading ? <LoadingBlock /> : null}
      {error ? <ErrorBanner message={error} onRetry={load} /> : null}
      {!loading && !error && items.length === 0 ? <EmptyState title="پستی نیست" hint="اولین پست را بگذارید" /> : null}
      <div className="space-y-3">
        {items.map((p) => (
          <div key={p.id} className="card space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-sm font-bold text-white">{p.author_name || p.student_name || "مربی"}</p>
                <p className="text-[11px] text-white/35">{p.created_at ? new Date(p.created_at).toLocaleDateString("fa-IR") : ""}</p>
              </div>
              <button type="button" className="rounded-lg p-1.5 text-red-300/60" onClick={() => onDelete(p.id)}><Trash2 size={14} /></button>
            </div>
            {(p.caption || p.text) ? <p className="text-sm leading-relaxed text-white/80">{p.caption || p.text}</p> : null}
            {p.image ? <img src={p.image} alt="" className="max-h-64 w-full rounded-xl object-cover" /> : null}
            <div className="flex items-center gap-4 pt-1 text-xs text-white/45">
              <button type="button" className="flex items-center gap-1" onClick={() => onLike(p.id)}>
                <Heart size={14} className={p.liked_by_me || p.is_liked ? "fill-primary text-primary" : ""} />
                {p.likes_count ?? 0}
              </button>
              <span className="flex items-center gap-1"><MessageCircle size={14} />{p.comments_count ?? 0}</span>
            </div>
          </div>
        ))}
      </div>
      <Modal open={modal} onClose={() => setModal(false)} title="پست جدید">
        <form onSubmit={onCreate} className="space-y-3">
          <textarea className="field" required rows={4} placeholder="چی می‌خوای بنویسی؟" value={caption} onChange={(e) => setCaption(e.target.value)} />
          <button type="submit" disabled={saving} className="btn btn-primary w-full">{saving ? "…" : "انتشار"}</button>
        </form>
      </Modal>
    </PageShell>
  );
}
