import { clsx } from "clsx";
import { ReactNode } from "react";

interface MetricCardProps {
  label: string;
  value: string | number;
  sub?: string;
  icon?: ReactNode;
  trend?: "up" | "down" | "neutral";
  className?: string;
  delay?: number;
}

export default function MetricCard({
  label, value, sub, icon, className, delay = 0,
}: MetricCardProps) {
  return (
    <div
      className={clsx(
        "metric-card animate-slide-up opacity-0",
        className
      )}
      style={{ animationDelay: `${delay}ms`, animationFillMode: "forwards" }}
    >
      <div className="flex items-start justify-between">
        <p className="text-xs font-medium text-slate-500 uppercase tracking-widest">{label}</p>
        {icon && (
          <span className="p-2 rounded-lg bg-brand-500/10 text-brand-400">{icon}</span>
        )}
      </div>
      <p className="text-2xl font-bold text-white mt-1">{value}</p>
      {sub && <p className="text-xs text-slate-500 mt-0.5">{sub}</p>}
    </div>
  );
}
