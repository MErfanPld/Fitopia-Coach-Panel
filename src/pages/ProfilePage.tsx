import { useState } from "react";
import { LogOut, Save, Sun, Moon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { useTheme } from "../context/ThemeContext";
import { coachApi } from "../api/client";
import { PageShell } from "../components/ui";

export function ProfilePage() {
  const { profile, logout, refreshProfile, gymId } = useAuth();
  const { theme, setTheme, isDark } = useTheme();
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
      {/* Theme switcher */}
      <div className="card">
        <p className="mb-3 text-[0.875rem] font-bold" style={{ color: "var(--app-fg)" }}>
          ظاهر برنامه
        </p>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setTheme("dark")}
            className="flex items-center justify-center gap-2 rounded-xl px-3 py-3 text-[0.875rem] font-semibold"
            style={{
              background: theme === "dark" ? "var(--app-primary-soft)" : "var(--app-surface-2)",
              color: theme === "dark" ? "var(--app-primary-text)" : "var(--app-fg-secondary)",
              border: `1px solid ${theme === "dark" ? "color-mix(in srgb, var(--app-primary) 40%, transparent)" : "var(--app-border)"}`,
            }}
          >
            <Moon size={16} />
            دارک
          </button>
          <button
            type="button"
            onClick={() => setTheme("light")}
            className="flex items-center justify-center gap-2 rounded-xl px-3 py-3 text-[0.875rem] font-semibold"
            style={{
              background: theme === "light" ? "var(--app-primary-soft)" : "var(--app-surface-2)",
              color: theme === "light" ? "var(--app-primary-text)" : "var(--app-fg-secondary)",
              border: `1px solid ${theme === "light" ? "color-mix(in srgb, var(--app-primary) 40%, transparent)" : "var(--app-border)"}`,
            }}
          >
            <Sun size={16} />
            لایت
          </button>
        </div>
        <p className="mt-2 text-[0.75rem]" style={{ color: "var(--app-fg-faint)" }}>
          الان: {isDark ? "حالت تاریک" : "حالت روشن"}
        </p>
      </div>

      <form onSubmit={onSave} className="card space-y-3.5">
        <div>
          <label className="mb-1.5 block text-[0.8125rem] font-semibold" style={{ color: "var(--app-fg-muted)" }}>
            نام کامل
          </label>
          <input className="field" value={fullName} onChange={(e) => setFullName(e.target.value)} />
        </div>
        <div>
          <label className="mb-1.5 block text-[0.8125rem] font-semibold" style={{ color: "var(--app-fg-muted)" }}>
            تخصص
          </label>
          <input
            className="field"
            value={specialty}
            onChange={(e) => setSpecialty(e.target.value)}
            placeholder="بدنسازی، کراس‌فیت…"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-[0.8125rem] font-semibold" style={{ color: "var(--app-fg-muted)" }}>
            بیو
          </label>
          <textarea className="field" value={bio} onChange={(e) => setBio(e.target.value)} />
        </div>
        <button type="submit" disabled={saving} className="btn btn-primary w-full">
          <Save size={16} />
          {saving ? "…" : "ذخیره تغییرات"}
        </button>
      </form>

      <div className="card space-y-1.5 text-[0.875rem]" style={{ color: "var(--app-fg-muted)" }}>
        <p>
          شناسه: <span style={{ color: "var(--app-fg-secondary)" }}>{profile?.id ?? "—"}</span>
        </p>
        <p>
          باشگاه:{" "}
          <span style={{ color: "var(--app-fg-secondary)" }}>
            {profile?.gym_name ?? profile?.gym ?? "—"}
          </span>
        </p>
        <p>
          وضعیت:{" "}
          <span style={{ color: profile?.is_active !== false ? "var(--app-success)" : "var(--app-danger)" }}>
            {profile?.is_active !== false ? "فعال" : "غیرفعال"}
          </span>
        </p>
      </div>

      <button type="button" onClick={onLogout} className="btn btn-danger w-full">
        <LogOut size={16} />
        خروج از حساب
      </button>
    </PageShell>
  );
}
