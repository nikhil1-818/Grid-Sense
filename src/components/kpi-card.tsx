import { motion } from "framer-motion";
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";

export function KpiCard({
  label,
  value,
  delta,
  icon: Icon,
  index = 0,
}: {
  label: string;
  value: string | number;
  delta?: number;
  icon: LucideIcon;
  index?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      className="glass rounded-2xl p-4 hover:-translate-y-0.5 hover:glow transition-all"
    >
      <div className="flex items-start justify-between">
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="h-8 w-8 rounded-lg bg-primary/15 text-primary grid place-items-center">
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <div className="mt-2 font-display text-2xl font-semibold tracking-tight">{value}</div>
      {typeof delta === "number" && (
        <div
          className={`mt-1 flex items-center gap-1 text-xs ${
            delta >= 0 ? "text-emerald-400" : "text-red-400"
          }`}
        >
          {delta >= 0 ? (
            <TrendingUp className="h-3 w-3" />
          ) : (
            <TrendingDown className="h-3 w-3" />
          )}
          {delta >= 0 ? "+" : ""}
          {delta.toFixed(1)}% vs last period
        </div>
      )}
    </motion.div>
  );
}

export function fmtNum(n: number, unit = "") {
  if (n >= 1e9) return `${(n / 1e9).toFixed(2)}B${unit}`;
  if (n >= 1e6) return `${(n / 1e6).toFixed(2)}M${unit}`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(1)}K${unit}`;
  return `${n.toFixed(0)}${unit}`;
}
