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

const processPieData = (subscriptions: Subscription[]) => {
  const categorySpend = subscriptions.reduce((acc, sub) => {
    let monthlyCost = sub.cost;
    if (sub.cycle === "yearly") monthlyCost = sub.cost / 12;
    else if (sub.cycle === "weekly") monthlyCost = sub.cost * 4;

    if (!acc[sub.category]) acc[sub.category] = 0;
    acc[sub.category] += monthlyCost;
    return acc;
  }, {} as Record<string, number>);

  return Object.entries(categorySpend).map(([name, value]) => ({
    name,
    value: parseFloat(value.toFixed(2)),
  }));
};

const COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

export default function Insights({ userId, subscriptions }: InsightsProps) {
  const pieData = useMemo(() => processPieData(subscriptions), [subscriptions]);

  if (!userId) {
    return (
      <div className="p-4 max-w-2xl mx-auto text-center">
        <p className="text-zinc-500">Authenticating...</p>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-white mt-2">Insights</h1>
      <p className="text-zinc-400 text-sm mb-8">
        Breakdown of your monthly spend.
      </p>

      <div className="bg-zinc-900 p-6 rounded-2xl shadow-sm border border-zinc-800/50">
        <h2 className="text-sm font-semibold text-zinc-100 mb-6 uppercase tracking-wider">
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
                    backgroundColor: "#18181b", // zinc-900
                    borderColor: "#27272a", // zinc-800
                    borderRadius: "8px",
                    color: "#f4f4f5",
                  }}
                  itemStyle={{ color: "#f4f4f5" }}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  iconType="circle"
                  formatter={(value) => (
                    <span className="text-zinc-400 text-xs ml-1">{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-zinc-500">
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
