import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  icon: LucideIcon;
  positive?: boolean;
}

export default function StatCard({
  title,
  value,
  change,
  icon: Icon,
  positive = true,
}: StatCardProps) {
  return (
    <div className="rounded-2xl border border-admin-border bg-admin-card p-5">
      <div className="mb-4 flex items-start justify-between">
        <p className="text-sm text-admin-muted">{title}</p>
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-500/15 text-indigo-400">
          <Icon size={18} />
        </div>
      </div>
      <p className="text-3xl font-semibold tracking-tight">{value}</p>
      <p
        className={`mt-2 text-sm ${positive ? "text-admin-success" : "text-red-400"}`}
      >
        {change}
      </p>
    </div>
  );
}
