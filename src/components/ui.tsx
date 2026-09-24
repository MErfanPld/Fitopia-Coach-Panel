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
    <div className="w-full space-y-5 px-4 pb-8 pt-4 sm:px-5 md:px-6 md:pt-7 lg:px-8">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h1
            className="truncate text-[1.3rem] font-extrabold tracking-tight md:text-[1.45rem]"
            style={{ color: "var(--app-fg)" }}
          >
            {title}
          </h1>
          {subtitle ? (
            <p className="mt-1.5 text-[0.875rem]" style={{ color: "var(--app-fg-muted)" }}>
              {subtitle}
            </p>
          ) : null}
        </div>
        {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
      </header>
      {children}
    </div>
  );
}

export function SectionHeader({
  title,
  action,
}: {
  title: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <h2 className="section-label">{title}</h2>
      {action}
    </div>
  );
}

export function LoadingBlock({ label = "در حال بارگذاری…" }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-20" style={{ color: "var(--app-fg-muted)" }}>
      <Loader2 className="h-7 w-7 animate-spin text-primary" />
      <span className="text-[0.875rem] font-medium">{label}</span>
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
    <div
      className="flex items-start gap-2.5 rounded-2xl px-4 py-3.5 text-[0.875rem]"
      style={{
        background: "var(--app-danger-bg)",
        color: "var(--app-danger)",
        border: "1px solid color-mix(in srgb, var(--app-danger) 25%, transparent)",
      }}
    >
      <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
      <div className="flex-1">
        <p>{message}</p>
        {onRetry ? (
          <button type="button" onClick={onRetry} className="mt-2 text-[0.8125rem] font-bold text-primary">
            تلاش مجدد
          </button>
        ) : null}
      </div>
    </div>
  );
}

export function EmptyState({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="card flex flex-col items-center justify-center gap-2 py-14 text-center">
      <p className="text-[0.9375rem] font-semibold" style={{ color: "var(--app-fg-secondary)" }}>
        {title}
      </p>
      {hint ? (
        <p className="max-w-[260px] text-[0.8125rem] leading-relaxed" style={{ color: "var(--app-fg-muted)" }}>
          {hint}
        </p>
      ) : null}
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
        className="absolute inset-0"
        style={{ background: "var(--app-overlay)" }}
        onClick={onClose}
        aria-label="بستن"
      />
      <div
        className="relative z-10 max-h-[92dvh] w-full max-w-lg overflow-y-auto rounded-t-[1.35rem] p-5 shadow-2xl sm:rounded-[1.35rem] md:max-w-xl"
        style={{ background: "var(--app-surface)", border: "1px solid var(--app-border)" }}
      >
        <div className="mb-4 flex items-center justify-between gap-2">
          <h2 className="text-[1.0625rem] font-bold" style={{ color: "var(--app-fg)" }}>
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full"
            style={{ background: "var(--app-surface-2)", color: "var(--app-fg-muted)" }}
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
