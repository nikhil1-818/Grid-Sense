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
import { summarize } from "@/lib/mock-data";

export const Route = createFileRoute("/_app/insights")({
  component: Insights,
});

function Insights() {
  const { dataset } = useData();
  if (!dataset) return <EmptyDataset />;
  const s = summarize(dataset.rows)!;

  const insights = [
    {
      icon: TrendingUp,
      title: "Demand growing 4.2% YoY, led by western industrial belt",
      confidence: 94,
      severity: "info",
      summary:
        "Aggregate demand is up 4.2% year-over-year with Maharashtra and Gujarat contributing 38% of the growth. Continued industrial activity and summer cooling load are primary drivers.",
      reasoning: [
        "Rolling 30-day average demand growth surpasses 10-year baseline in 12 states.",
        "Peak-hour deltas correlate (r=0.82) with regional temperature anomalies.",
        "Feature importance: temperature > holiday index > weekday > sector mix.",
      ],
    },
    {
      icon: Sun,
      title: `Renewables now ${s.renewablePct.toFixed(1)}% of generation — solar leads`,
      confidence: 91,
      severity: "positive",
      summary:
        "Solar capacity utilization has climbed steadily, with Rajasthan and Karnataka hitting 34%+ average daily solar share.",
      reasoning: [
        "Solar CUF rose 3.1pp vs last year (statistically significant p<0.01).",
        "Wind contribution seasonal peak observed in June–September.",
        "Hydro remains stable; expected under normal monsoon conditions.",
      ],
    },
    {
      icon: AlertTriangle,
      title: "Anomaly clusters detected in 3 states over past 30 days",
      confidence: 87,
      severity: "warn",
      summary:
        "DBSCAN clustering surfaced 3 anomaly clusters correlating with unplanned outages and demand spikes.",
      reasoning: [
        "Cluster A: Delhi — sustained peak > 98th percentile for 6 days.",
        "Cluster B: Tamil Nadu — generation dip during monsoon low-wind window.",
        "Cluster C: West Bengal — evening ramp exceeded historical p99.",
      ],
    },
    {
      icon: Activity,
      title: "Weekly seasonality: Sunday demand 12% lower than weekday average",
      confidence: 96,
      severity: "info",
      summary:
        "Autocorrelation confirms strong 7-day cycle. Forecasts already condition on day-of-week; downstream planning should as well.",
      reasoning: [
        "ACF peaks at lags 7, 14, 21 confirm weekly cycle.",
        "STL decomposition explains 84% of variance via trend+seasonal.",
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
            Explainable analysis over {dataset.rows.length.toLocaleString()} records
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
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
