import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Download, FileText, Calendar, Printer, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useData } from "@/lib/data-store";
import { EmptyDataset } from "@/components/empty-dataset";
import { byState, byDate, summarize } from "@/lib/mock-data";
import { toast } from "sonner";
import * as XLSX from "xlsx";

export const Route = createFileRoute("/_app/reports")({
  component: Reports,
});

function Reports() {
  const { dataset } = useData();
  if (!dataset) return <EmptyDataset />;

  const s = summarize(dataset.rows)!;
  const states = byState(dataset.rows);
  const daily = byDate(dataset.rows);

  const buildReportData = (title: string) => {
    switch (title) {
      case "Top Consuming States":
        return states.slice(0, 20).map((st, i) => ({
          rank: i + 1,
          state: st.state,
          region: st.region,
          demand_MW: Math.round(st.demand),
          generation_MW: Math.round(st.generation),
          renewable_MW: Math.round(st.solar + st.wind + st.hydro),
        }));
      case "Demand Heatmap Report":
        return daily.map((d) => ({
          date: d.date,
          demand_MW: Math.round(d.demand),
          generation_MW: Math.round(d.generation),
          peak_MW: Math.round(d.peak),
        }));
      case "Renewable Growth Report":
        return states.map((st) => ({
          state: st.state,
          solar_MW: Math.round(st.solar),
          wind_MW: Math.round(st.wind),
          hydro_MW: Math.round(st.hydro),
          renewable_share_pct: st.generation ? +(((st.solar + st.wind + st.hydro) / st.generation) * 100).toFixed(2) : 0,
        }));
      case "Yearly Comparison":
      case "Forecasting Report":
      case "Executive Monthly Report":
      default:
        return [
          { metric: "Total records", value: s.totalRecords },
          { metric: "States", value: s.totalStates },
          { metric: "Total demand (MW)", value: Math.round(s.totalDemand) },
          { metric: "Total generation (MW)", value: Math.round(s.totalGeneration) },
          { metric: "Renewable share (%)", value: +s.renewablePct.toFixed(2) },
          { metric: "Peak demand (MW)", value: Math.round(s.peakDemand) },
          { metric: "Average demand (MW)", value: Math.round(s.avgDemand) },
          { metric: "Latest date", value: s.latestDate },
        ];
    }
  };

  const exportExcel = (title: string) => {
    const rows = buildReportData(title);
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(rows);
    XLSX.utils.book_append_sheet(wb, ws, "Report");
    XLSX.writeFile(wb, `${title.replace(/\s+/g, "_")}.xlsx`);
    toast.success(`Exported ${title}.xlsx`);
  };

  const exportCSV = (title: string) => {
    const rows = buildReportData(title);
    if (!rows.length) return;
    const headers = Object.keys(rows[0]);
    const csv = [
      headers.join(","),
      ...rows.map((r) => headers.map((h) => JSON.stringify((r as Record<string, unknown>)[h] ?? "")).join(",")),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title.replace(/\s+/g, "_")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported ${title}.csv`);
  };

  const printReport = (title: string) => {
    const rows = buildReportData(title);
    const headers = rows.length ? Object.keys(rows[0]) : [];
    const w = window.open("", "_blank", "width=900,height=1000");
    if (!w) return toast.error("Popup blocked");
    w.document.write(`
      <html><head><title>${title}</title>
      <style>body{font-family:system-ui;padding:32px;color:#111}h1{margin:0 0 4px}small{color:#666}
      table{border-collapse:collapse;width:100%;margin-top:16px;font-size:12px}
      th,td{border:1px solid #ddd;padding:6px 8px;text-align:left}th{background:#f4f4f4}</style>
      </head><body>
      <h1>${title}</h1>
      <small>Source: ${dataset.fileName} · ${new Date().toLocaleString()}</small>
      <table><thead><tr>${headers.map((h) => `<th>${h}</th>`).join("")}</tr></thead>
      <tbody>${rows.map((r) => `<tr>${headers.map((h) => `<td>${(r as Record<string, unknown>)[h] ?? ""}</td>`).join("")}</tr>`).join("")}</tbody>
      </table></body></html>
    `);
    w.document.close();
    setTimeout(() => w.print(), 300);
  };

  const REPORTS = [
    { title: "Executive Monthly Report", desc: "KPIs, top states, renewables trend", period: s.latestDate.slice(0, 7) },
    { title: "Yearly Comparison", desc: "Aggregate demand & generation deltas", period: `${s.totalYears} yr` },
    { title: "Renewable Growth Report", desc: "Solar/Wind/Hydro composition", period: "Full period" },
    { title: "Top Consuming States", desc: "Ranking with demand share", period: `${s.totalStates} states` },
    { title: "Forecasting Report", desc: "Baseline metrics for forecasts", period: "Rolling" },
    { title: "Demand Heatmap Report", desc: "Daily aggregated demand", period: `${daily.length} days` },
  ];

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <motion.h1 initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="font-display text-3xl font-semibold tracking-tight">
        Reports &amp; Business Intelligence
      </motion.h1>
      <p className="text-sm text-muted-foreground mt-1">
        Export live data from <span className="font-mono">{dataset.fileName}</span>
      </p>

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
              <Button size="sm" variant="secondary" className="flex-1" onClick={() => printReport(r.title)}>
                <Download className="h-3.5 w-3.5 mr-1.5" />PDF
              </Button>
              <Button size="sm" variant="secondary" className="flex-1" onClick={() => exportExcel(r.title)}>
                <Download className="h-3.5 w-3.5 mr-1.5" />Excel
              </Button>
              <Button size="sm" variant="ghost" onClick={() => exportCSV(r.title)} title="Export CSV">
                <Printer className="h-3.5 w-3.5" />
              </Button>
            </div>
          </motion.div>
        ))}
      </div>

      <section className="mt-8 glass rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-3">
          <Clock className="h-4 w-4 text-primary" />
          <h3 className="font-display font-semibold">Scheduled Reports</h3>
        </div>
        <div className="divide-y divide-border/60 text-sm">
          {[
            { name: "Weekly Executive Digest", when: "Every Monday · 06:00 IST", to: "leadership@grid.gov" },
            { name: "Daily Renewable Snapshot", when: "Every day · 22:00 IST", to: "ops-team@grid.gov" },
            { name: "Monthly Regulator Filing", when: "1st of month · 09:00 IST", to: "cea-filings@cea.nic.in" },
          ].map((sch) => (
            <div key={sch.name} className="py-3 flex items-center justify-between">
              <div>
                <div className="font-medium">{sch.name}</div>
                <div className="text-xs text-muted-foreground">{sch.when} → {sch.to}</div>
              </div>
              <Button size="sm" variant="ghost" onClick={() => toast.info(`${sch.name} — schedule editor coming soon`)}>
                Edit
              </Button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
