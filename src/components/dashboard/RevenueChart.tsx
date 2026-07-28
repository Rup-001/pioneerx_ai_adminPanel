import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export default function RevenueChart({
  data,
}: {
  data: { month: string; cost: number }[];
}) {
  const max = Math.max(0.01, ...data.map((d) => d.cost));

  return (
    <div className="rounded-2xl border border-admin-border bg-admin-card p-5">
      <div className="mb-5">
        <h3 className="text-lg font-semibold">AI cost by month</h3>
        <p className="mt-1 text-xs text-admin-muted">
          Estimated USD from token usage (not subscription revenue)
        </p>
      </div>

      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barCategoryGap="20%">
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
              domain={[0, max * 1.2]}
            />
            <Tooltip
              contentStyle={{
                background: "#16161c",
                border: "1px solid #24242c",
                borderRadius: 12,
              }}
              formatter={(value: number) => [`$${value}`, "AI cost"]}
            />
            <Bar dataKey="cost" radius={[6, 6, 0, 0]} maxBarSize={28}>
              {data.map((_, index) => (
                <Cell key={index} fill="#6366f1" />
              ))}
              <LabelList
                dataKey="cost"
                position="top"
                fill="#fff"
                fontSize={10}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
