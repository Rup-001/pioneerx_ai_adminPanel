import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export default function UserGrowthChart({
  data,
}: {
  data: { month: string; users: number }[];
}) {
  const max = Math.max(10, ...data.map((d) => d.users));

  return (
    <div className="rounded-2xl border border-admin-border bg-admin-card p-5">
      <div className="mb-5">
        <h3 className="text-lg font-semibold">User growth</h3>
        <p className="mt-1 text-xs text-admin-muted">
          Cumulative signups over the last 12 months (real DB)
        </p>
      </div>

      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="userGrowthFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6366f1" stopOpacity={0.45} />
                <stop offset="100%" stopColor="#6366f1" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#24242c" vertical={false} />
            <XAxis
              dataKey="month"
              tick={{ fill: "#8b8b96", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: "#8b8b96", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              domain={[0, max]}
              allowDecimals={false}
            />
            <Tooltip
              contentStyle={{
                background: "#16161c",
                border: "1px solid #24242c",
                borderRadius: 12,
              }}
            />
            <Area
              type="monotone"
              dataKey="users"
              stroke="#6366f1"
              strokeWidth={2}
              fill="url(#userGrowthFill)"
              dot={{ r: 3, fill: "#6366f1" }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
