// src/components/SummaryCard.tsx
interface SummaryCardProps {
  title: string;
  value: string;
  subtitle: string;
}

export default function SummaryCard({
  title,
  value,
  subtitle,
}: SummaryCardProps) {
  return (
    <div className="bg-zinc-900 p-5 rounded-2xl shadow-sm border border-zinc-800/50">
      <h3 className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
        {title}
      </h3>
      <p className="text-3xl font-bold text-white mt-2">{value}</p>
      <p className="text-sm text-zinc-500 mt-1">{subtitle}</p>
    </div>
  );
}
