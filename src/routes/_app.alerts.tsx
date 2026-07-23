import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { AlertTriangle, ShieldAlert, ShieldCheck, Zap, TrendingDown, Activity } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useData } from "@/lib/data-store";
import { EmptyDataset } from "@/components/empty-dataset";
import { byState, byDate } from "@/lib/mock-data";
import { useMemo, useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/alerts")({
  component: Alerts,
});

type Sev = "critical" | "high" | "medium" | "low";

const sevMap: Record<Sev, { color: string; label: string }> = {
  critical: { color: "bg-red-500/15 text-red-400 border-red-500/40", label: "Critical" },
  high: { color: "bg-orange-500/15 text-orange-400 border-orange-500/40", label: "High" },
  medium: { color: "bg-amber-500/15 text-amber-400 border-amber-500/40", label: "Medium" },
  low: { color: "bg-emerald-500/15 text-emerald-400 border-emerald-500/40", label: "Low" },
};

function Alerts() {
  const { dataset } = useData();
  const [acked, setAcked] = useState<Set<string>>(new Set());

  const alerts = useMemo(() => {
    if (!dataset) return [];
    const states = byState(dataset.rows);
    const daily = byDate(dataset.rows).sort((a, b) => a.date.localeCompare(b.date));
    const out: Array<{ id: string; sev: Sev; title: string; desc: string; state: string; when: string; icon: typeof AlertTriangle; action: string }> = [];

    // 1. Deficit alerts: states where generation < 95% of demand
    for (const st of states.slice(0, 15)) {
      const ratio = st.generation / (st.demand || 1);
      if (ratio < 0.95) {
        out.push({
          id: `deficit-${st.state}`,
          sev: ratio < 0.85 ? "critical" : "high",
          title: `Supply deficit in ${st.state} — generation ${(ratio * 100).toFixed(1)}% of demand`,
          desc: `Aggregate generation ${Math.round(st.generation).toLocaleString()} MW vs demand ${Math.round(st.demand).toLocaleString()} MW.`,
          state: st.state,
          when: "current",
          icon: ShieldAlert,
          action: "Dispatch reserve capacity; review inter-regional transfers.",
        });
      }
    }

    // 2. Demand spike (last day vs 30-day mean)
    if (daily.length >= 30) {
      const last = daily[daily.length - 1];
      const window = daily.slice(-30, -1);
      const mean = window.reduce((a, r) => a + r.demand, 0) / window.length;
      const delta = ((last.demand - mean) / mean) * 100;
      if (Math.abs(delta) > 10) {
        out.push({
          id: `spike-${last.date}`,
          sev: Math.abs(delta) > 20 ? "high" : "medium",
          title: `Demand ${delta > 0 ? "spike" : "drop"} ${delta > 0 ? "+" : ""}${delta.toFixed(1)}% vs 30-day mean`,
          desc: `Latest date ${last.date}: ${Math.round(last.demand).toLocaleString()} MW vs mean ${Math.round(mean).toLocaleString()} MW.`,
          state: "National",
          when: last.date,
          icon: TrendingDown,
          action: delta > 0 ? "Activate demand response programs." : "Investigate consumption anomaly.",
        });
      }
    }

    // 3. Low renewable share
    const totalGen = states.reduce((a, s) => a + s.generation, 0);
    const totalRen = states.reduce((a, s) => a + s.solar + s.wind + s.hydro, 0);
    const renPct = (totalRen / totalGen) * 100;
    if (renPct < 25) {
      out.push({
        id: "renewable-low",
        sev: "medium",
        title: `Renewable share ${renPct.toFixed(1)}% — below 25% target`,
        desc: `System renewable contribution is below policy target across the dataset window.`,
        state: "All regions",
        when: "period",
        icon: Activity,
        action: "Prioritize renewable dispatch; audit curtailment.",
      });
    }

    // 4. High peak vs average
    const peakStates = [...states].sort((a, b) => b.demand - a.demand).slice(0, 1);
    for (const st of peakStates) {
      const rows = dataset.rows.filter((r) => r.state === st.state);
      const peakMW = Math.max(...rows.map((r) => r.peak));
      const avgMW = rows.reduce((a, r) => a + r.demand, 0) / rows.length;
      if (peakMW / avgMW > 1.5) {
        out.push({
          id: `peak-${st.state}`,
          sev: "high",
          title: `${st.state} peak-to-average ratio ${(peakMW / avgMW).toFixed(2)}x`,
          desc: `Peak ${Math.round(peakMW).toLocaleString()} MW versus average ${Math.round(avgMW).toLocaleString()} MW indicates volatile load.`,
          state: st.state,
          when: "period",
          icon: Zap,
          action: "Deploy peak-shaving; review industrial schedules.",
        });
      }
    }

    if (out.length === 0) {
      out.push({
        id: "nominal",
        sev: "low",
        title: "All systems nominal",
        desc: "No thresholds breached across the current dataset window.",
        state: "All",
        when: "now",
        icon: ShieldCheck,
        action: "No action required.",
      });
    }
    return out;
  }, [dataset]);

  if (!dataset) return <EmptyDataset />;

  const visible = alerts.filter((a) => !acked.has(a.id));

  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight">Smart Alert Center</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {visible.length} active alert{visible.length === 1 ? "" : "s"} · derived from your dataset
          </p>
        </div>
        {acked.size > 0 && (
          <Button variant="secondary" size="sm" onClick={() => setAcked(new Set())}>
            Restore acknowledged ({acked.size})
          </Button>
        )}
      </motion.div>

      <div className="mt-6 grid gap-3">
        {visible.map((a, i) => {
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
                  <div className="mt-3 flex items-center gap-3 text-xs flex-wrap">
                    <span className="text-muted-foreground">Region: <span className="text-foreground">{a.state}</span></span>
                    <span className="text-muted-foreground">→</span>
                    <span className="text-primary">{a.action}</span>
                  </div>
                  <div className="mt-3">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => {
                        setAcked((prev) => new Set(prev).add(a.id));
                        toast.success(`Acknowledged: ${a.title}`);
                      }}
                    >
                      Acknowledge
                    </Button>
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
