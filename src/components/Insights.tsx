// src/components/Insights.tsx
import { useMemo } from "react";
import type { Subscription } from "../types";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip,
} from "recharts";

interface InsightsProps {
  userId: string | undefined;
  subscriptions: Subscription[];
}

// Custom interface for our data structure inside the legend
interface LegendEntry {
  payload?: {
    percent?: number;
    name?: string;
    value?: number;
  };
}

const processPieData = (subscriptions: Subscription[]) => {
  const categorySpend = subscriptions.reduce((acc, sub) => {
    let monthlyCost = sub.cost;
    if (sub.cycle === "yearly") monthlyCost = sub.cost / 12;
    else if (sub.cycle === "weekly") monthlyCost = sub.cost * 4;

    if (!acc[sub.category]) acc[sub.category] = 0;
    acc[sub.category] += monthlyCost;
    return acc;
  }, {} as Record<string, number>);

  const total = Object.values(categorySpend).reduce((a, b) => a + b, 0);

  return Object.entries(categorySpend).map(([name, value]) => ({
    name,
    value: parseFloat(value.toFixed(2)),
    percent: total > 0 ? (value / total) * 100 : 0,
  }));
};

const COLORS = ["#2563eb", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

export default function Insights({ userId, subscriptions }: InsightsProps) {
  const pieData = useMemo(() => processPieData(subscriptions), [subscriptions]);

  if (!userId) {
    return (
      <div className="p-4 max-w-2xl mx-auto text-center">
        <p className="text-slate-500">Authenticating...</p>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-white mt-2">Insights</h1>
      <p className="text-slate-400 text-sm mb-8">
        Breakdown of your monthly spend.
      </p>

      <div className="bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-800">
        <h2 className="text-sm font-semibold text-slate-100 mb-6 uppercase tracking-wider">
          Spend by Category
        </h2>

        {subscriptions.length > 0 ? (
          <div style={{ width: "100%", height: 300 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {pieData.map((_entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => `$${value.toFixed(2)}`}
                  contentStyle={{
                    backgroundColor: "#0f172a", // slate-900
                    borderColor: "#1e293b", // slate-800
                    borderRadius: "12px",
                    color: "#f8fafc",
                    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.5)",
                  }}
                  itemStyle={{ color: "#cbd5e1" }}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  iconType="circle"
                  // We use 'unknown' here to avoid the type mismatch error with Recharts' internal types
                  // and avoid 'any' to satisfy the linter. We then cast it safely.
                  formatter={(value, entry: unknown) => {
                    const typedEntry = entry as LegendEntry;
                    const percent = typedEntry.payload?.percent
                      ? `(${typedEntry.payload.percent.toFixed(0)}%)`
                      : "";
                    return (
                      <span className="text-slate-400 text-xs ml-1">
                        {value}{" "}
                        <span className="text-slate-500">{percent}</span>
                      </span>
                    );
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-slate-500">
            <p>No data to analyze yet.</p>
            <p className="text-xs mt-1">
              Add some subscriptions to see the chart.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
