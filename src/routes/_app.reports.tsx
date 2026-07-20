import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Download, FileText, Calendar, Printer, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useData } from "@/lib/data-store";
import { EmptyDataset } from "@/components/empty-dataset";

export const Route = createFileRoute("/_app/reports")({
  component: Reports,
});

const REPORTS = [
  { title: "Executive Monthly Report", desc: "KPIs, top states, renewables trend", period: "Nov 2025" },
  { title: "Yearly Comparison", desc: "YoY demand & generation deltas", period: "2024 vs 2023" },
  { title: "Renewable Growth Report", desc: "Solar/Wind/Hydro capacity growth", period: "Last 12 months" },
  { title: "Top Consuming States", desc: "Ranking with demand share", period: "This quarter" },
  { title: "Forecasting Report", desc: "30/90/365-day predictions", period: "Rolling" },
  { title: "Demand Heatmap Report", desc: "State × month heatmap", period: "Full history" },
];

function Reports() {
  const { dataset } = useData();
  if (!dataset) return <EmptyDataset />;

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <motion.h1 initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="font-display text-3xl font-semibold tracking-tight">
        Reports &amp; Business Intelligence
      </motion.h1>
      <p className="text-sm text-muted-foreground mt-1">Executive PDFs, dashboards and Power BI embeds</p>

      <div className="mt-6 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {REPORTS.map((r, i) => (
          <motion.div
            key={r.title}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            className="glass rounded-2xl p-5 hover:-translate-y-1 hover:glow transition-all"
          >
            <div className="h-10 w-10 rounded-xl bg-primary/15 text-primary grid place-items-center mb-3">
              <FileText className="h-5 w-5" />
            </div>
            <div className="font-display font-semibold">{r.title}</div>
            <div className="text-sm text-muted-foreground mt-1">{r.desc}</div>
            <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" /> {r.period}
            </div>
            <div className="mt-4 flex gap-2">
              <Button size="sm" variant="secondary" className="flex-1"><Download className="h-3.5 w-3.5 mr-1.5" />PDF</Button>
              <Button size="sm" variant="secondary" className="flex-1"><Download className="h-3.5 w-3.5 mr-1.5" />Excel</Button>
              <Button size="sm" variant="ghost"><Printer className="h-3.5 w-3.5" /></Button>
            </div>
          </motion.div>
        ))}
      </div>

      <section className="mt-8 glass rounded-2xl p-6">
        <h3 className="font-display font-semibold text-lg">Power BI Embed</h3>
        <p className="text-sm text-muted-foreground mt-1">Live-embedded corporate dashboards</p>
        <div className="mt-4 aspect-video rounded-xl bg-secondary/50 grid place-items-center text-muted-foreground text-sm border border-dashed border-border">
          Power BI dashboard placeholder · connect your workspace
        </div>
      </section>

      <section className="mt-6 glass rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-3">
          <Clock className="h-4 w-4 text-primary" />
          <h3 className="font-display font-semibold">Scheduled Reports</h3>
        </div>
        <div className="divide-y divide-border/60 text-sm">
          {[
            { name: "Weekly Executive Digest", when: "Every Monday · 06:00 IST", to: "leadership@grid.gov" },
            { name: "Daily Renewable Snapshot", when: "Every day · 22:00 IST", to: "ops-team@grid.gov" },
            { name: "Monthly Regulator Filing", when: "1st of month · 09:00 IST", to: "cea-filings@cea.nic.in" },
          ].map((s) => (
            <div key={s.name} className="py-3 flex items-center justify-between">
              <div>
                <div className="font-medium">{s.name}</div>
                <div className="text-xs text-muted-foreground">{s.when} → {s.to}</div>
              </div>
              <Button size="sm" variant="ghost">Edit</Button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
