import { useEffect, useState } from "react";
import {
  DollarSign,
  TrendingUp,
  UserCheck,
  Users,
} from "lucide-react";
import StatCard from "@/components/dashboard/StatCard";
import UserGrowthChart from "@/components/dashboard/UserGrowthChart";
import RevenueChart from "@/components/dashboard/RevenueChart";
import RecentActivity from "@/components/dashboard/RecentActivity";
import { adminApi } from "@/lib/api";
import type { DashboardStats } from "@/types";
import { formatCurrency, formatNumber } from "@/lib/format";

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        setLoading(true);
        const data = await adminApi.getDashboardStats();
        if (mounted) setStats(data);
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : "Failed to load dashboard");
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return <p className="text-sm text-admin-muted">Loading dashboard…</p>;
  }

  if (error || !stats) {
    return (
      <p className="text-sm text-red-400">{error || "No dashboard data"}</p>
    );
  }

  const t = stats.totals;

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Users"
          value={formatNumber(t.totalUsers)}
          change={`${formatNumber(t.trialUsers)} on trial`}
          icon={Users}
        />
        <StatCard
          title="Paid subscribers"
          value={formatNumber(t.paidUsers)}
          change={`${formatNumber(t.freeUsers)} free`}
          icon={UserCheck}
        />
        <StatCard
          title="AI cost today"
          value={formatCurrency(t.aiCostTodayUsd)}
          change="From token usage logs"
          icon={DollarSign}
        />
        <StatCard
          title="AI cost this month"
          value={formatCurrency(t.aiCostMonthUsd)}
          change={`All-time ${formatCurrency(t.aiCostAllTimeUsd)}`}
          icon={TrendingUp}
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <UserGrowthChart data={stats.userGrowth} />
        <RevenueChart data={stats.aiCostByMonth} />
      </div>

      <RecentActivity users={stats.recentUsers} />
    </div>
  );
}
