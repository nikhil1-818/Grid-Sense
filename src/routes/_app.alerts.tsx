import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { AlertTriangle, ShieldAlert, ShieldCheck, Zap, TrendingDown, Activity } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useData } from "@/lib/data-store";
import { EmptyDataset } from "@/components/empty-dataset";

export const Route = createFileRoute("/_app/alerts")({
  component: Alerts,
});

const ALERTS = [
  { id: 1, sev: "critical", title: "Grid instability risk — Northern region", desc: "Frequency deviation above ±0.2 Hz detected across 4 substations.", state: "Delhi", when: "3 min ago", icon: ShieldAlert, action: "Dispatch reserve capacity; notify NLDC." },
  { id: 2, sev: "high", title: "Demand spike +18% vs forecast", desc: "Actual demand exceeded upper 95% CI for 45 minutes.", state: "Maharashtra", when: "22 min ago", icon: TrendingDown, action: "Activate demand response programs." },
  { id: 3, sev: "high", title: "Solar generation drop 34%", desc: "Cloud cover anomaly across Karnataka solar parks.", state: "Karnataka", when: "1 h ago", icon: Zap, action: "Ramp up thermal reserves." },
  { id: 4, sev: "medium", title: "Renewable share below target", desc: "Weekly renewable contribution 3.1pp below target of 25%.", state: "Gujarat", when: "5 h ago", icon: Activity, action: "Schedule renewable audit." },
  { id: 5, sev: "medium", title: "Unusual consumption pattern", desc: "Weekend load profile mirrors weekday within 4%.", state: "Tamil Nadu", when: "1 d ago", icon: AlertTriangle, action: "Investigate metering anomalies." },
  { id: 6, sev: "low", title: "All systems nominal", desc: "Southern region operating within all thresholds.", state: "Kerala", when: "1 d ago", icon: ShieldCheck, action: "No action required." },
];

const sevMap: Record<string, { color: string; label: string }> = {
  critical: { color: "bg-red-500/15 text-red-400 border-red-500/40", label: "Critical" },
  high: { color: "bg-orange-500/15 text-orange-400 border-orange-500/40", label: "High" },
  medium: { color: "bg-amber-500/15 text-amber-400 border-amber-500/40", label: "Medium" },
  low: { color: "bg-emerald-500/15 text-emerald-400 border-emerald-500/40", label: "Low" },
};

function Alerts() {
  const { dataset } = useData();
  if (!dataset) return <EmptyDataset />;

  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      <motion.h1 initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="font-display text-3xl font-semibold tracking-tight">
        Smart Alert Center
      </motion.h1>
      <p className="text-sm text-muted-foreground mt-1">Live anomaly detection · Suggested mitigations</p>

      <div className="mt-6 grid gap-3">
        {ALERTS.map((a, i) => {
          const s = sevMap[a.sev];
          return (
            <motion.div
              key={a.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
              className={`glass rounded-2xl p-5 border-l-4 ${
                a.sev === "critical" ? "border-red-500" : a.sev === "high" ? "border-orange-500" : a.sev === "medium" ? "border-amber-500" : "border-emerald-500"
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`h-10 w-10 rounded-xl grid place-items-center border ${s.color} shrink-0 ${a.sev === "critical" ? "pulse-ring" : ""}`}>
                  <a.icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <h3 className="font-display font-semibold">{a.title}</h3>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={s.color}>{s.label}</Badge>
                      <span className="text-xs text-muted-foreground">{a.when}</span>
                    </div>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{a.desc}</p>
                  <div className="mt-3 flex items-center gap-3 text-xs">
                    <span className="text-muted-foreground">Region: <span className="text-foreground">{a.state}</span></span>
                    <span className="text-muted-foreground">→</span>
                    <span className="text-primary">{a.action}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
