import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Dumbbell, Loader2, Eye, EyeOff, Shield, Sun, Moon } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

export function WelcomePage() {
  const { login } = useAuth();
  const { isDark, toggleTheme } = useTheme();
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
    <div
      className="relative flex min-h-dvh flex-col items-center justify-center px-5 py-12"
      style={{ background: "var(--app-bg)", color: "var(--app-fg)" }}
    >
      <button
        type="button"
        className="theme-toggle absolute end-4 top-4 z-10"
        onClick={toggleTheme}
        aria-label="تغییر تم"
      >
        {isDark ? <Sun size={18} /> : <Moon size={18} />}
      </button>

      <div className="w-full max-w-md space-y-7">
        <div className="text-center">
          <div
            className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl text-primary"
            style={{ background: "var(--app-primary-soft)", border: "1px solid color-mix(in srgb, var(--app-primary) 30%, transparent)" }}
          >
            <Dumbbell size={28} strokeWidth={1.7} />
          </div>
          <p className="text-[0.7rem] font-bold tracking-[0.12em] text-primary">FITOPIA COACH</p>
          <h1 className="mt-2 text-[1.6rem] font-black tracking-tight">پنل مربیان</h1>
          <p className="mx-auto mt-2 max-w-xs text-[0.875rem] leading-relaxed" style={{ color: "var(--app-fg-muted)" }}>
            مدیریت شاگردان، تمرین و برنامه — ساده و سریع
          </p>
        </div>

        <form onSubmit={onSubmit} className="card space-y-3.5 text-right">
          <div>
            <label className="mb-1.5 block text-[0.8125rem] font-semibold" style={{ color: "var(--app-fg-muted)" }}>
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
            <label className="mb-1.5 block text-[0.8125rem] font-semibold" style={{ color: "var(--app-fg-muted)" }}>
              رمز عبور
            </label>
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
                className="absolute start-3 top-1/2 -translate-y-1/2"
                style={{ color: "var(--app-fg-muted)" }}
                onClick={() => setShowPass((v) => !v)}
                aria-label="نمایش رمز"
              >
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {error ? (
            <p
              className="rounded-xl px-3 py-2.5 text-[0.8125rem]"
              style={{ background: "var(--app-danger-bg)", color: "var(--app-danger)", border: "1px solid color-mix(in srgb, var(--app-danger) 25%, transparent)" }}
            >
              {error}
            </p>
          ) : null}

          <button type="submit" disabled={loading} className="btn btn-primary w-full">
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={18} /> در حال ورود…
              </>
            ) : (
              "ورود به پنل"
            )}
          </button>
        </form>

        <div className="flex items-center justify-center gap-2 text-[0.75rem]" style={{ color: "var(--app-fg-faint)" }}>
          <Shield size={13} />
          <span>فقط حساب‌های با نقش مربی</span>
        </div>
      </div>
    </div>
  );
}
