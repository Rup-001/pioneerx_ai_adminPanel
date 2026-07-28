import { useEffect, useState } from "react";
import { adminApi } from "@/lib/api";
import type { AdminUser, TokenDashboardUser } from "@/types";
import { formatCurrency, formatNumber } from "@/lib/format";

export default function UserListPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [costMap, setCostMap] = useState<Record<string, TokenDashboardUser>>(
    {},
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadUsers() {
      try {
        setLoading(true);
        const [usersRes, tokenRes] = await Promise.all([
          adminApi.getUsers(1, 50),
          adminApi.getTokenDashboard(),
        ]);

        setUsers(usersRes.data);
        const map: Record<string, TokenDashboardUser> = {};
        tokenRes.users.forEach((user) => {
          map[user.userId] = user;
        });
        setCostMap(map);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load users");
      } finally {
        setLoading(false);
      }
    }

    loadUsers();
  }, []);

  return (
    <div className="rounded-2xl border border-admin-border bg-admin-card overflow-hidden">
      <div className="border-b border-admin-border px-4 py-4 sm:px-6 sm:py-5">
        <h1 className="text-lg font-semibold sm:text-xl">User List</h1>
        <p className="mt-1 text-sm text-admin-muted">
          Per-user AI usage, subscription plan, and estimated cost
        </p>
      </div>

      {loading && (
        <p className="px-4 py-8 text-sm text-admin-muted sm:px-6">Loading users...</p>
      )}
      {error && <p className="px-4 py-8 text-sm text-red-400 sm:px-6">{error}</p>}

      {!loading && !error && (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-admin-panel text-admin-muted">
              <tr>
                <th className="px-6 py-3 text-left font-medium">User</th>
                <th className="px-6 py-3 text-left font-medium">Plan</th>
                <th className="px-6 py-3 text-left font-medium">Requests</th>
                <th className="px-6 py-3 text-left font-medium">AI Cost</th>
                <th className="px-6 py-3 text-left font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => {
                const usage = costMap[user.id];
                const requestCount =
                  (usage?.totalInputTokens || 0) +
                  (usage?.totalOutputTokens || 0);

                return (
                  <tr
                    key={user.id}
                    className="border-t border-admin-border hover:bg-white/[0.02]"
                  >
                    <td className="px-6 py-4">
                      <p className="font-medium">{user.name || "—"}</p>
                      <p className="text-admin-muted">{user.email}</p>
                    </td>
                    <td className="px-6 py-4">
                      {user.subscription?.tier || "FREE"}
                    </td>
                    <td className="px-6 py-4">{formatNumber(requestCount)}</td>
                    <td className="px-6 py-4">
                      {formatCurrency(usage?.totalEstimatedCostUsd || 0)}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs ${
                          user.isTrialActive
                            ? "bg-amber-500/15 text-amber-300"
                            : "bg-emerald-500/15 text-emerald-300"
                        }`}
                      >
                        {user.isTrialActive ? "Trial" : user.subscription?.status || "Active"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
