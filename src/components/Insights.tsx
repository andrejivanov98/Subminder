// src/components/Insights.tsx
import { useMemo } from "react"; // No longer need useState
// We NO LONGER import mockSubscriptions!
// We NO LONGER import mockSubscriptions!
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
  subscriptions: Subscription[]; // Receive subs as a prop
}

// Helper (no change)
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

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

export default function Insights({ userId, subscriptions }: InsightsProps) {
  // The pieData is now calculated from the 'subscriptions' prop
  const pieData = useMemo(() => processPieData(subscriptions), [subscriptions]);

  if (!userId) {
    return (
      <div className="p-4 max-w-2xl mx-auto text-center">
        <p className="text-gray-500">Authenticating...</p>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900">Insights</h1>
      <p className="text-gray-600 mb-6">Analyze your spending habits.</p>

      <div className="bg-white p-5 rounded-lg shadow-md">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Spend by Category (Monthly)
        </h2>

        {subscriptions.length > 0 ? (
          <div style={{ width: "100%", height: 300 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) =>
                    `${name} (${((percent ?? 0) * 100).toFixed(0)}%)`
                  }
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
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="text-center text-gray-500 py-10">
            No data to analyze. Add some subscriptions!
          </p>
        )}
      </div>
    </div>
  );
}
