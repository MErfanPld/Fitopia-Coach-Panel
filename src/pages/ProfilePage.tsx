import { useState } from "react";
import { LogOut, Save } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { coachApi } from "../api/client";
import { PageShell } from "../components/ui";

export function ProfilePage() {
  const { profile, logout, refreshProfile, gymId } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState(profile?.full_name || "");
  const [specialty, setSpecialty] = useState((profile as { specialty?: string })?.specialty || "");
  const [bio, setBio] = useState(profile?.bio || "");
  const [saving, setSaving] = useState(false);

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await coachApi.updateMe(
        {
          full_name: fullName.trim() || undefined,
          specialty: specialty.trim() || undefined,
          bio: bio.trim() || undefined,
        },
        gymId || undefined,
      );
      await refreshProfile();
      toast.success("پروفایل ذخیره شد");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "خطا");
    } finally {
      setSaving(false);
    }
  };

  const onLogout = async () => {
    const ok = await toast.confirm("خروج از حساب؟");
    if (!ok) return;
    logout();
    navigate("/welcome", { replace: true });
  };

  return (
    <PageShell title="پروفایل مربی" subtitle={profile?.gym_name}>
      <form onSubmit={onSave} className="card space-y-2.5">
        <div>
          <label className="mb-1 block text-[11px] text-white/50">نام کامل</label>
          <input className="field" value={fullName} onChange={(e) => setFullName(e.target.value)} />
        </div>
        <div>
          <label className="mb-1 block text-[11px] text-white/50">تخصص</label>
          <input
            className="field"
            value={specialty}
            onChange={(e) => setSpecialty(e.target.value)}
            placeholder="بدنسازی، کراس‌فیت…"
          />
        </div>
        <div>
          <label className="mb-1 block text-[11px] text-white/50">بیو</label>
          <textarea className="field" value={bio} onChange={(e) => setBio(e.target.value)} />
        </div>
        <button type="submit" disabled={saving} className="btn btn-primary w-full">
          <Save size={15} />
          {saving ? "…" : "ذخیره تغییرات"}
        </button>
      </form>
      <div className="card space-y-1 text-[13px] text-white/50">
        <p>
          شناسه: <span className="text-white/80">{profile?.id ?? "—"}</span>
        </p>
        <p>
          باشگاه: <span className="text-white/80">{profile?.gym_name ?? profile?.gym ?? "—"}</span>
        </p>
        <p>
          وضعیت:{" "}
          <span className={profile?.is_active !== false ? "text-emerald-400" : "text-red-300"}>
            {profile?.is_active !== false ? "فعال" : "غیرفعال"}
          </span>
        </p>
      </div>
      <button type="button" onClick={onLogout} className="btn btn-danger w-full">
        <LogOut size={15} />
        خروج از حساب
      </button>
    </PageShell>
  );
}
