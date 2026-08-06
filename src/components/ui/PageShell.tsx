import type { ReactNode } from "react";

export function PageShell({
  title,
  subtitle,
  children,
  actions,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-admin-border bg-admin-card overflow-hidden">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-admin-border px-4 py-4 sm:px-6 sm:py-5">
        <div className="min-w-0">
          <h1 className="text-lg font-semibold sm:text-xl">{title}</h1>
          {subtitle && (
            <p className="mt-1 text-sm text-admin-muted">{subtitle}</p>
          )}
        </div>
        {actions && (
          <div className="flex w-full flex-wrap gap-2 sm:w-auto">{actions}</div>
        )}
      </div>
      <div className="p-4 sm:p-6">{children}</div>
    </div>
  );
}

export function StatusBanner({
  error,
  success,
}: {
  error?: string;
  success?: string;
}) {
  if (!error && !success) return null;
  return (
    <div className="mb-4 space-y-2">
      {error && (
        <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
          {error}
        </p>
      )}
      {success && (
        <p className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">
          {success}
        </p>
      )}
    </div>
  );
}

export function FieldLabel({ children }: { children: ReactNode }) {
  return (
    <label className="mb-1 block text-xs font-medium text-admin-muted">
      {children}
    </label>
  );
}

export const inputClass =
  "w-full rounded-lg border border-admin-border bg-admin-panel px-3 py-2 text-sm text-white outline-none focus:border-indigo-500";

export const btnPrimary =
  "rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50";

export const btnGhost =
  "rounded-lg border border-admin-border px-3 py-1.5 text-xs font-medium text-admin-muted hover:text-white hover:bg-white/5 disabled:opacity-50";

export const btnDanger =
  "rounded-lg border border-red-500/40 px-3 py-1.5 text-xs font-medium text-red-300 hover:bg-red-500/10 disabled:opacity-50";
