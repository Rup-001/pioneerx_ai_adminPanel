import { UserPlus } from "lucide-react";
import { formatRelativeTime } from "@/lib/format";

export default function RecentActivity({
  users,
}: {
  users: {
    id: string;
    email: string;
    name: string | null;
    tier: string;
    createdAt: string;
  }[];
}) {
  return (
    <div className="rounded-2xl border border-admin-border bg-admin-card p-5">
      <h3 className="mb-5 text-lg font-semibold">Recent signups</h3>
      <div className="divide-y divide-admin-border">
        {users.length === 0 && (
          <p className="text-sm text-admin-muted">No users yet.</p>
        )}
        {users.map((user) => (
          <div
            key={user.id}
            className="flex items-center justify-between py-4 first:pt-0 last:pb-0"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-500/15 text-indigo-400">
                <UserPlus size={16} />
              </div>
              <div>
                <p className="text-sm font-medium">
                  {user.name || user.email}
                </p>
                <p className="text-xs text-admin-muted">
                  {user.email} · {user.tier}
                </p>
              </div>
            </div>
            <span className="text-sm text-admin-muted">
              {formatRelativeTime(user.createdAt)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
