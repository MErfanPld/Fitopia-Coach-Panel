import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Dumbbell, Loader2, Eye, EyeOff, Shield } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export function WelcomePage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) return;
    setLoading(true); setError(null);
    try {
      await login(username, password);
      navigate("/app", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "ورود ناموفق بود");
    } finally { setLoading(false); }
  };

  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-5 py-10">
      <div aria-hidden className="pointer-events-none absolute -top-32 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-primary/20 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute bottom-0 right-0 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
      <div className="relative z-10 w-full max-w-md space-y-8 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-primary/30 bg-primary/15 text-primary">
          <Dumbbell size={32} strokeWidth={1.75} />
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-black tracking-tight text-primary">Fitopia Coach</h1>
          <p className="text-base font-bold text-white">پنل اختصاصی مربیان</p>
          <p className="mx-auto max-w-xs text-sm leading-relaxed text-white/50">
            مدیریت شاگردان، ثبت تمرین، برنامه غذایی و پیگیری پیشرفت — همه در یک جا
          </p>
        </div>
        <form onSubmit={onSubmit} className="card space-y-3 text-right shadow-xl">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-white/55">نام کاربری / موبایل</label>
            <input className="field" value={username} onChange={(e) => setUsername(e.target.value)}
              autoComplete="username" inputMode="tel" placeholder="مثلاً 09xxxxxxxxx" dir="ltr" />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-white/55">رمز عبور</label>
            <div className="relative">
              <input className="field pe-12" type={showPass ? "text" : "password"} value={password}
                onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" dir="ltr" />
              <button type="button" className="absolute start-3 top-1/2 -translate-y-1/2 text-white/40"
                onClick={() => setShowPass((v) => !v)} aria-label="نمایش رمز">
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          {error ? (
            <p className="rounded-xl border border-red-500/25 bg-red-500/10 px-3 py-2 text-xs text-red-200">{error}</p>
          ) : null}
          <button type="submit" disabled={loading} className="btn btn-primary w-full">
            {loading ? (<><Loader2 className="animate-spin" size={18} /> در حال ورود…</>) : "ورود به پنل مربی"}
          </button>
        </form>
        <div className="flex items-center justify-center gap-2 text-[11px] text-white/35">
          <Shield size={14} /><span>دسترسی فقط برای حساب‌های با نقش مربی فعال است</span>
        </div>
      </div>
    </div>
  );
}
