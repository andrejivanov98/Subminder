// src/components/SummaryCard.tsx
interface SummaryCardProps {
  title: string;
  value: string;
  subtitle: string;
}

export default function SummaryCard({ title, value, subtitle }: SummaryCardProps) {
  return (
    <div className="bg-white p-5 rounded-lg shadow-md">
      <h3 className="text-sm font-medium text-gray-500">{title}</h3>
      <p className="text-3xl font-semibold text-gray-900">{value}</p>
      <p className="text-sm text-gray-400">{subtitle}</p>
    </div>
  );
}