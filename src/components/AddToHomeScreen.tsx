/**
 * Soft prompt: install Fitopia Coach as PWA / Add to Home Screen.
 * Shows guide for iOS (Share) and Android/desktop (⋮ menu).
 */

import { useCallback, useEffect, useState } from "react";
import { Download, MoreVertical, Share, Smartphone, X } from "lucide-react";

const DISMISS_KEY = "fitopia_coach_a2hs_dismissed";
const DISMISS_DAYS = 7;

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

function isStandalone(): boolean {
  try {
    if (window.matchMedia("(display-mode: standalone)").matches) return true;
    if ((navigator as Navigator & { standalone?: boolean }).standalone === true) return true;
  } catch {
    /* ignore */
  }
  return false;
}

function isIOS(): boolean {
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
}

function isDismissed(): boolean {
  try {
    const raw = localStorage.getItem(DISMISS_KEY);
    if (!raw) return false;
    const ts = Number(raw);
    return Number.isFinite(ts) && Date.now() - ts < DISMISS_DAYS * 86400000;
  } catch {
    return false;
  }
}

function setDismissed() {
  try {
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
  } catch {
    /* ignore */
  }
}

export function AddToHomeScreen() {
  const [visible, setVisible] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    if (isStandalone() || isDismissed()) return;

    const onBip = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", onBip);

    const t = window.setTimeout(() => setVisible(true), 2000);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener("beforeinstallprompt", onBip);
    };
  }, []);

  const dismiss = useCallback(() => {
    setDismissed();
    setVisible(false);
    setShowGuide(false);
  }, []);

  const handleInstall = async () => {
    if (deferred) {
      try {
        await deferred.prompt();
        const { outcome } = await deferred.userChoice;
        if (outcome === "accepted") {
          dismiss();
          return;
        }
      } catch {
        /* fall through to guide */
      }
    }
    setShowGuide(true);
  };

  if (!visible) return null;

  const ios = isIOS();

  return (
    <>
      {!showGuide && (
        <div
          className="pointer-events-none fixed inset-x-0 z-[90] flex justify-center px-3 md:px-6"
          style={{
            bottom: "max(5.25rem, calc(env(safe-area-inset-bottom, 0px) + 4.25rem))",
          }}
        >
          <div className="pointer-events-auto flex w-full max-w-md items-center gap-3 rounded-2xl border border-primary/25 bg-[rgba(18,18,22,0.96)] p-3.5 shadow-[0_12px_40px_rgba(0,0,0,0.5)] backdrop-blur-xl md:max-w-lg">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
              <Smartphone size={22} aria-hidden />
            </div>
            <div className="min-w-0 flex-1 text-right">
              <p className="text-sm font-bold leading-snug text-white">نصب پنل مربی</p>
              <p className="mt-0.5 text-[11px] leading-relaxed text-white/50">
                برای دسترسی سریع، به صفحه اصلی اضافه کنید
              </p>
            </div>
            <button
              type="button"
              onClick={() => void handleInstall()}
              className="shrink-0 rounded-xl bg-primary px-3.5 py-2.5 text-xs font-bold text-black active:scale-95"
            >
              نصب
            </button>
            <button
              type="button"
              onClick={dismiss}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white/40 hover:text-white/70"
              aria-label="بستن"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {showGuide && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center">
          <button
            type="button"
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            aria-label="بستن"
            onClick={() => setShowGuide(false)}
          />
          <div
            className="relative w-full max-w-md rounded-t-3xl border border-white/10 bg-[#121216] px-5 pt-4 pb-8 shadow-2xl sm:rounded-3xl"
            style={{ paddingBottom: "max(2rem, env(safe-area-inset-bottom))" }}
            role="dialog"
            aria-labelledby="coach-a2hs-title"
          >
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-white/15 sm:hidden" />

            <div className="mb-5 flex items-start justify-between gap-3">
              <div>
                <h2 id="coach-a2hs-title" className="text-base font-bold text-white">
                  افزودن به صفحه اصلی
                </h2>
                <p className="mt-1 text-xs leading-relaxed text-white/50">
                  مثل اپلیکیشن واقعی روی دستگاه باز می‌شود
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowGuide(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-white/50"
                aria-label="بستن"
              >
                <X size={16} />
              </button>
            </div>

            {ios ? (
              <ol className="space-y-4 text-right">
                <li className="flex items-start gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/15 text-sm font-bold text-primary">
                    ۱
                  </span>
                  <div className="pt-1">
                    <p className="flex items-center gap-1.5 text-sm font-semibold text-white/90">
                      دکمه <Share size={14} className="inline text-primary" /> Share را بزنید
                    </p>
                    <p className="mt-0.5 text-[11px] text-white/45">پایین یا بالای Safari</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/15 text-sm font-bold text-primary">
                    ۲
                  </span>
                  <div className="pt-1">
                    <p className="text-sm font-semibold text-white/90">
                      «Add to Home Screen» را انتخاب کنید
                    </p>
                    <p className="mt-0.5 text-[11px] text-white/45">افزودن به صفحه اصلی</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/15 text-sm font-bold text-primary">
                    ۳
                  </span>
                  <div className="pt-1">
                    <p className="text-sm font-semibold text-white/90">Add را تأیید کنید</p>
                  </div>
                </li>
              </ol>
            ) : (
              <ol className="space-y-4 text-right">
                <li className="flex items-start gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/15 text-sm font-bold text-primary">
                    ۱
                  </span>
                  <div className="pt-1">
                    <p className="flex items-center gap-1.5 text-sm font-semibold text-white/90">
                      منوی <MoreVertical size={14} className="inline text-primary" /> سه‌نقطه را باز کنید
                    </p>
                    <p className="mt-0.5 text-[11px] text-white/45">
                      معمولاً بالا-راست مرورگر Chrome / Edge
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/15 text-sm font-bold text-primary">
                    ۲
                  </span>
                  <div className="pt-1">
                    <p className="text-sm font-semibold text-white/90">
                      «Install app» یا «Add to Home screen»
                    </p>
                    <p className="mt-0.5 text-[11px] text-white/45">نصب برنامه / افزودن به صفحه اصلی</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/15 text-sm font-bold text-primary">
                    ۳
                  </span>
                  <div className="pt-1">
                    <p className="text-sm font-semibold text-white/90">نصب را تأیید کنید</p>
                  </div>
                </li>
              </ol>
            )}

            {deferred && (
              <button
                type="button"
                onClick={() => void handleInstall()}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-bold text-black active:scale-[0.98]"
              >
                <Download size={16} aria-hidden />
                نصب مستقیم
              </button>
            )}

            <button type="button" onClick={dismiss} className="mt-3 w-full py-2 text-center text-xs text-white/40">
              بعداً
            </button>
          </div>
        </div>
      )}
    </>
  );
}
