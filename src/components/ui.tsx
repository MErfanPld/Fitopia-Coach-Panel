import type { ReactNode } from "react";
import { Loader2, AlertCircle, X } from "lucide-react";

export function PageShell({
  title,
  subtitle,
  actions,
  children,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="w-full space-y-4 px-4 pb-6 pt-4 sm:px-5 md:px-6 md:pt-6 lg:px-8">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-[18px] font-bold tracking-tight text-white md:text-[20px] lg:text-[22px]">
            {title}
          </h1>
          {subtitle ? (
            <p className="mt-1 text-[12px] text-white/40 md:text-[13px]">{subtitle}</p>
          ) : null}
        </div>
        {actions ? (
          <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>
        ) : null}
      </header>
      {children}
    </div>
  );
}

export function LoadingBlock({ label = "در حال بارگذاری…" }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2.5 py-16 text-white/40">
      <Loader2 className="h-6 w-6 animate-spin text-primary" />
      <span className="text-[12px]">{label}</span>
    </div>
  );
}

export function ErrorBanner({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex items-start gap-2.5 rounded-2xl border border-red-500/20 bg-red-500/[0.1] px-3.5 py-3 text-[12px] text-red-200">
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
      <div className="flex-1">
        <p>{message}</p>
        {onRetry ? (
          <button type="button" onClick={onRetry} className="mt-1.5 text-[11px] font-bold text-primary">
            تلاش مجدد
          </button>
        ) : null}
      </div>
    </div>
  );
}

export function EmptyState({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="card flex flex-col items-center justify-center gap-1.5 py-12 text-center">
      <p className="text-[13px] font-semibold text-white/55">{title}</p>
      {hint ? <p className="max-w-[220px] text-[11px] text-white/30">{hint}</p> : null}
    </div>
  );
}

export function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/65 backdrop-blur-md"
        onClick={onClose}
        aria-label="بستن"
      />
      <div className="relative z-10 max-h-[92dvh] w-full max-w-lg overflow-y-auto rounded-t-3xl border border-white/[0.12] bg-[#1c1c1e] p-4 shadow-2xl sm:rounded-3xl md:max-w-xl">
        <div className="mb-3 flex items-center justify-between gap-2">
          <h2 className="text-[15px] font-bold text-white">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-white/40 active:bg-white/5"
          >
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function listify<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data as T[];
  if (data && typeof data === "object") {
    const d = data as Record<string, unknown>;
    if (Array.isArray(d.results)) return d.results as T[];
    if (Array.isArray(d.data)) return d.data as T[];
    if (Array.isArray(d.items)) return d.items as T[];
  }
  return [];
}
