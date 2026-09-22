import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { CheckCircle2, AlertTriangle, X, Info } from "lucide-react";

type ToastKind = "success" | "error" | "info";

type ToastItem = {
  id: number;
  kind: ToastKind;
  message: string;
};

type ConfirmState = {
  message: string;
  resolve: (ok: boolean) => void;
} | null;

type ToastApi = {
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
  confirm: (message: string) => Promise<boolean>;
};

const ToastContext = createContext<ToastApi | null>(null);

let seq = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [confirmState, setConfirmState] = useState<ConfirmState>(null);

  const push = useCallback((kind: ToastKind, message: string) => {
    const id = ++seq;
    setToasts((t) => [...t, { id, kind, message }]);
    window.setTimeout(() => {
      setToasts((t) => t.filter((x) => x.id !== id));
    }, 3200);
  }, []);

  const dismiss = useCallback((id: number) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  const confirm = useCallback((message: string) => {
    return new Promise<boolean>((resolve) => {
      setConfirmState({ message, resolve });
    });
  }, []);

  const api = useMemo<ToastApi>(
    () => ({
      success: (m) => push("success", m),
      error: (m) => push("error", m),
      info: (m) => push("info", m),
      confirm,
    }),
    [push, confirm],
  );

  const closeConfirm = (ok: boolean) => {
    confirmState?.resolve(ok);
    setConfirmState(null);
  };

  return (
    <ToastContext.Provider value={api}>
      {children}

      {/* Toasts */}
      <div className="pointer-events-none fixed inset-x-0 top-0 z-[100] flex flex-col items-center gap-2 px-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex w-full max-w-sm items-start gap-2.5 rounded-2xl border px-3.5 py-3 shadow-2xl backdrop-blur-xl ${
              t.kind === "success"
                ? "border-emerald-500/25 bg-emerald-950/90 text-emerald-100"
                : t.kind === "error"
                  ? "border-red-500/25 bg-red-950/90 text-red-100"
                  : "border-white/15 bg-[#1c1c1e]/95 text-white"
            }`}
          >
            {t.kind === "success" ? (
              <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-emerald-400" />
            ) : t.kind === "error" ? (
              <AlertTriangle size={18} className="mt-0.5 shrink-0 text-red-400" />
            ) : (
              <Info size={18} className="mt-0.5 shrink-0 text-primary" />
            )}
            <p className="flex-1 text-[13px] leading-snug">{t.message}</p>
            <button
              type="button"
              onClick={() => dismiss(t.id)}
              className="shrink-0 rounded-lg p-0.5 opacity-50 hover:opacity-100"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>

      {/* Confirm dialog */}
      {confirmState ? (
        <div className="fixed inset-0 z-[110] flex items-center justify-center px-5">
          <button
            type="button"
            className="absolute inset-0 bg-black/65 backdrop-blur-sm"
            onClick={() => closeConfirm(false)}
            aria-label="بستن"
          />
          <div className="relative w-full max-w-sm rounded-2xl border border-white/12 bg-[#1c1c1e] p-5 shadow-2xl">
            <p className="text-[15px] font-semibold leading-relaxed text-white">
              {confirmState.message}
            </p>
            <div className="mt-5 flex gap-2">
              <button
                type="button"
                className="btn btn-ghost flex-1"
                onClick={() => closeConfirm(false)}
              >
                انصراف
              </button>
              <button
                type="button"
                className="btn flex-1 bg-red-500/90 text-white"
                onClick={() => closeConfirm(true)}
              >
                تأیید
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </ToastContext.Provider>
  );
}

export function useToast(): ToastApi {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
