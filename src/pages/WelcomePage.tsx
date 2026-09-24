import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Dumbbell, Loader2, Eye, EyeOff, Shield, Sparkles } from "lucide-react";
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
    setLoading(true);
    setError(null);
    try {
      await login(username, password);
      navigate("/app", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "ورود ناموفق بود");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-5 py-12">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-primary/20 blur-[100px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-20 -end-10 h-72 w-72 rounded-full bg-primary/10 blur-[80px]"
      />

      <div className="relative z-10 w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="mx-auto mb-5 flex h-[4.25rem] w-[4.25rem] items-center justify-center rounded-[1.35rem] border border-primary/35 bg-gradient-to-br from-primary/25 to-primary/5 text-primary shadow-[0_12px_40px_rgba(255,106,0,0.2)]">
            <Dumbbell size={30} strokeWidth={1.7} />
          </div>
          <p className="text-[11px] font-bold tracking-[0.14em] text-primary/80">FITOPIA COACH</p>
          <h1 className="mt-2 text-[1.75rem] font-black tracking-tight text-white">
            پنل اختصاصی مربیان
          </h1>
          <p className="mx-auto mt-2.5 max-w-xs text-[13px] leading-relaxed text-white/45">
            شاگردان، تمرین، برنامه و پیشرفت — همه در یک فضای حرفه‌ای
          </p>
        </div>

        <form onSubmit={onSubmit} className="card space-y-3.5 text-right shadow-2xl">
          <div>
            <label className="mb-1.5 block text-[11.5px] font-semibold text-white/50">
              نام کاربری / موبایل
            </label>
            <input
              className="field"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              inputMode="tel"
              placeholder="مثلاً 09xxxxxxxxx"
              dir="ltr"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-[11.5px] font-semibold text-white/50">رمز عبور</label>
            <div className="relative">
              <input
                className="field pe-12"
                type={showPass ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                dir="ltr"
              />
              <button
                type="button"
                className="absolute start-3 top-1/2 -translate-y-1/2 text-white/40"
                onClick={() => setShowPass((v) => !v)}
                aria-label="نمایش رمز"
              >
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {error ? (
            <p className="rounded-xl border border-red-500/25 bg-red-500/10 px-3 py-2.5 text-xs text-red-200">
              {error}
            </p>
          ) : null}

          <button type="submit" disabled={loading} className="btn btn-primary w-full">
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={18} /> در حال ورود…
              </>
            ) : (
              "ورود به پنل مربی"
            )}
          </button>
        </form>

        <div className="flex flex-col items-center gap-2 text-center">
          <div className="flex items-center gap-2 text-[11px] text-white/35">
            <Shield size={13} />
            <span>فقط حساب‌های با نقش مربی فعال</span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-white/25">
            <Sparkles size={12} className="text-primary/60" />
            <span>طراحی‌شده برای مربی‌های حرفه‌ای</span>
          </div>
        </div>
      </div>
    </div>
  );
}
