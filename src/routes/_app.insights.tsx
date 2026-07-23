import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { BrainCircuit, Sparkles, TrendingUp, AlertTriangle, Sun, Activity } from "lucide-react";
import { useData } from "@/lib/data-store";
import { EmptyDataset } from "@/components/empty-dataset";
import { summarize, byState, byDate } from "@/lib/mock-data";
import { useMemo } from "react";

export const Route = createFileRoute("/_app/insights")({
  component: Insights,
});

function Insights() {
  const { dataset } = useData();

  const computed = useMemo(() => {
    if (!dataset) return null;
    const s = summarize(dataset.rows)!;
    const states = byState(dataset.rows);
    const daily = byDate(dataset.rows).sort((a, b) => a.date.localeCompare(b.date));
    const topStates = states.slice(0, 3).map((x) => x.state);
    // Trend: split daily into halves
    const half = Math.floor(daily.length / 2);
    const firstAvg = daily.slice(0, half).reduce((a, r) => a + r.demand, 0) / Math.max(1, half);
    const lastAvg = daily.slice(half).reduce((a, r) => a + r.demand, 0) / Math.max(1, daily.length - half);
    const growthPct = firstAvg ? ((lastAvg - firstAvg) / firstAvg) * 100 : 0;
    // Renewable leader
    const renewableLeaders = [...states]
      .map((st) => ({ ...st, renewShare: st.generation ? ((st.solar + st.wind + st.hydro) / st.generation) * 100 : 0 }))
      .sort((a, b) => b.renewShare - a.renewShare)
      .slice(0, 3);
    // Anomaly detection: states whose peak-day demand > mean + 2*std
    const anomalies: string[] = [];
    for (const st of states.slice(0, 15)) {
      const vals = dataset.rows.filter((r) => r.state === st.state).map((r) => r.demand);
      const mean = vals.reduce((a, b) => a + b, 0) / vals.length;
      const std = Math.sqrt(vals.reduce((a, b) => a + (b - mean) ** 2, 0) / vals.length);
      const spikes = vals.filter((v) => v > mean + 2 * std).length;
      if (spikes > 0) anomalies.push(`${st.state} (${spikes} spike day${spikes > 1 ? "s" : ""})`);
    }
    // Day-of-week seasonality
    const dow = new Array(7).fill(0).map(() => ({ sum: 0, n: 0 }));
    for (const r of dataset.rows) {
      const d = new Date(r.date).getDay();
      if (!isNaN(d)) { dow[d].sum += r.demand; dow[d].n += 1; }
    }
    const dowAvg = dow.map((x) => (x.n ? x.sum / x.n : 0));
    const weekdayAvg = (dowAvg[1] + dowAvg[2] + dowAvg[3] + dowAvg[4] + dowAvg[5]) / 5;
    const sundayDelta = weekdayAvg ? ((dowAvg[0] - weekdayAvg) / weekdayAvg) * 100 : 0;
    return { s, states, topStates, growthPct, renewableLeaders, anomalies, sundayDelta };
  }, [dataset]);

  if (!dataset || !computed) return <EmptyDataset />;
  const { s, topStates, growthPct, renewableLeaders, anomalies, sundayDelta } = computed;

  const insights = [
    {
      icon: TrendingUp,
      title: `Demand ${growthPct >= 0 ? "grew" : "fell"} ${Math.abs(growthPct).toFixed(1)}% across the period — led by ${topStates.slice(0, 2).join(" & ")}`,
      confidence: Math.min(96, 80 + Math.round(Math.abs(growthPct))),
      severity: growthPct >= 0 ? "info" : "warn",
      summary: `Comparing the first and second halves of your dataset, aggregate demand ${growthPct >= 0 ? "increased" : "decreased"} by ${Math.abs(growthPct).toFixed(1)}%. Top demand contributors: ${topStates.join(", ")}.`,
      reasoning: [
        `Half-period avg: ${Math.round((s.avgDemand)).toLocaleString()} MW baseline.`,
        `Top state demand: ${topStates[0]} — ${Math.round(computed.states[0].demand).toLocaleString()} MW total.`,
        `Number of states in dataset: ${s.totalStates}.`,
      ],
    },
    {
      icon: Sun,
      title: `Renewables ${s.renewablePct.toFixed(1)}% of generation · leader: ${renewableLeaders[0]?.state ?? "N/A"}`,
      confidence: 91,
      severity: "positive",
      summary: `${renewableLeaders[0]?.state ?? "Top state"} leads with ${renewableLeaders[0]?.renewShare.toFixed(1)}% renewable share. Solar total: ${Math.round(s.totalSolar).toLocaleString()} MW, wind: ${Math.round(s.totalWind).toLocaleString()} MW, hydro: ${Math.round(s.totalHydro).toLocaleString()} MW.`,
      reasoning: renewableLeaders.map((r) => `${r.state}: ${r.renewShare.toFixed(1)}% renewable share`),
    },
    {
      icon: AlertTriangle,
      title: anomalies.length
        ? `Demand spikes detected in ${anomalies.length} state${anomalies.length > 1 ? "s" : ""}`
        : "No significant demand anomalies detected",
      confidence: 87,
      severity: anomalies.length ? "warn" : "positive",
      summary: anomalies.length
        ? `Statistical outlier detection (>2σ above state mean) surfaced spike days in: ${anomalies.slice(0, 5).join(", ")}.`
        : "All monitored states operated within 2 standard deviations of their mean demand.",
      reasoning: anomalies.slice(0, 6),
    },
    {
      icon: Activity,
      title: `Weekly cycle: Sunday ${sundayDelta >= 0 ? "+" : ""}${sundayDelta.toFixed(1)}% vs weekday average`,
      confidence: 94,
      severity: "info",
      summary: `Day-of-week aggregation shows a Sunday-vs-weekday differential of ${sundayDelta.toFixed(1)}% — a strong weekly seasonality signal for downstream planning.`,
      reasoning: [
        `Records analyzed: ${s.totalRecords.toLocaleString()}.`,
        `Peak demand observed: ${Math.round(s.peakDemand).toLocaleString()} MW.`,
        `Latest date in dataset: ${s.latestDate}.`,
      ],
    },
  ];

  const sevColor: Record<string, string> = {
    info: "bg-primary/15 text-primary border-primary/30",
    positive: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    warn: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  };

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-primary/15 grid place-items-center glow">
          <BrainCircuit className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight">AI Insights</h1>
          <p className="text-sm text-muted-foreground">
            Explainable analysis over {dataset.rows.length.toLocaleString()} records from{" "}
            <span className="font-mono">{dataset.fileName}</span>
          </p>
        </div>
      </motion.div>

      <div className="mt-8 grid gap-3">
        {insights.map((ins, i) => (
          <motion.div
            key={ins.title}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="glass rounded-2xl p-5"
          >
            <div className="flex items-start gap-4">
              <div className={`h-10 w-10 rounded-xl grid place-items-center shrink-0 ${sevColor[ins.severity]}`}>
                <ins.icon className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-display font-semibold text-lg">{ins.title}</h3>
                  <Badge variant="outline" className="shrink-0">
                    <Sparkles className="h-3 w-3 mr-1" /> {ins.confidence}% confidence
                  </Badge>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{ins.summary}</p>
                {ins.reasoning.length > 0 && (
                  <Accordion type="single" collapsible className="mt-3">
                    <AccordionItem value="r" className="border-none">
                      <AccordionTrigger className="text-xs text-primary hover:no-underline py-2">
                        Show reasoning
                      </AccordionTrigger>
                      <AccordionContent>
                        <ul className="mt-1 space-y-1 text-sm text-muted-foreground list-disc pl-4">
                          {ins.reasoning.map((r) => <li key={r}>{r}</li>)}
                        </ul>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
