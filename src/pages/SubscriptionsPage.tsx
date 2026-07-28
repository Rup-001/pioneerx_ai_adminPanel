import { useEffect, useMemo, useState } from "react";
import { adminApi } from "@/lib/api";
import { formatNumber } from "@/lib/format";

const TIERS = ["FREE", "PRO", "PRO_PLUS", "ELITE"];

export default function SubscriptionsPage() {
  const [tierCounts, setTierCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    adminApi
      .getDashboardStats()
      .then((stats) => setTierCounts(stats.tierCounts || {}))
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Failed to load"),
      )
      .finally(() => setLoading(false));
  }, []);

  const displayTiers = useMemo(() => {
    const keys = new Set([...TIERS, ...Object.keys(tierCounts)]);
    return Array.from(keys);
  }, [tierCounts]);

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-admin-border bg-admin-card p-4 sm:p-6">
        <h1 className="text-lg font-semibold sm:text-xl">Subscriptions</h1>
        <p className="mt-1 text-sm text-admin-muted">
          Live plan distribution from the database
        </p>
      </div>

      {loading && (
        <p className="text-sm text-admin-muted">Loading subscriptions...</p>
      )}
      {error && <p className="text-sm text-red-400">{error}</p>}

      {!loading && !error && (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
          {displayTiers.map((tier) => (
            <div
              key={tier}
              className="rounded-2xl border border-admin-border bg-admin-card p-5"
            >
              <p className="text-sm text-admin-muted">{tier}</p>
              <p className="mt-2 text-3xl font-semibold">
                {formatNumber(tierCounts[tier] || 0)}
              </p>
              <p className="mt-2 text-xs text-indigo-300">Users on this tier</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
