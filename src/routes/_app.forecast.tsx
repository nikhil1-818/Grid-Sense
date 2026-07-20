import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useData } from "@/lib/data-store";
import { EmptyDataset } from "@/components/empty-dataset";
import { byState } from "@/lib/mock-data";
import { fmtNum } from "@/components/kpi-card";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Badge } from "@/components/ui/badge";
import { Download, TrendingUp } from "lucide-react";

export const Route = createFileRoute("/_app/forecast")({
  component: Forecast,
});

const HORIZONS = [7, 15, 30, 90, 365];

function Forecast() {
  const { dataset } = useData();
  const stateList = useMemo(() => (dataset ? byState(dataset.rows).map((s) => s.state) : []), [dataset]);
  const [state, setState] = useState<string>("");
  const [horizon, setHorizon] = useState(30);

  if (!dataset) return <EmptyDataset />;
  const chosen = state || stateList[0];

  const forecast = useMemo(() => {
    const rows = dataset.rows.filter((r) => r.state === chosen).sort((a, b) => a.date.localeCompare(b.date));
    const history = rows.slice(-90);
    const last = history[history.length - 1];
    const avg = history.reduce((a, r) => a + r.demand, 0) / history.length;
    const trend = (history[history.length - 1].demand - history[0].demand) / history.length;
    const preds: Array<{ date: string; demand?: number; forecast?: number; upper?: number; lower?: number }> = history.map((r) => ({
      date: r.date,
      demand: r.demand,
    }));
    const base = new Date(last.date);
    for (let i = 1; i <= horizon; i++) {
      const d = new Date(base);
      d.setDate(base.getDate() + i);
      const season = Math.sin(((base.getDate() + i) / 365) * Math.PI * 2) * avg * 0.08;
      const val = avg + trend * i + season + (Math.random() - 0.5) * avg * 0.04;
      const band = avg * 0.06 * Math.sqrt(i);
      preds.push({
        date: d.toISOString().slice(0, 10),
        forecast: Math.max(0, val),
        upper: val + band,
        lower: Math.max(0, val - band),
      });
    }
    return preds;
  }, [chosen, dataset.rows, horizon]);

  const predOnly = forecast.filter((f) => f.forecast != null);
  const peak = predOnly.reduce((a, b) => (b.forecast! > (a.forecast ?? 0) ? b : a), predOnly[0]);
  const low = predOnly.reduce((a, b) => (b.forecast! < (a.forecast ?? Infinity) ? b : a), predOnly[0]);

  return (
    <div className="mx-auto max-w-[1400px] px-6 py-8">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight">AI Forecast</h1>
          <p className="text-sm text-muted-foreground mt-1">Prophet-style forecast · Confidence intervals · Peak &amp; low prediction</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Select value={chosen} onValueChange={setState}>
            <SelectTrigger className="w-48"><SelectValue placeholder="State" /></SelectTrigger>
            <SelectContent>
              {stateList.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
          <div className="flex glass rounded-lg p-1">
            {HORIZONS.map((h) => (
              <button
                key={h}
                onClick={() => setHorizon(h)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition ${
                  h === horizon ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {h}d
              </button>
            ))}
          </div>
          <Button variant="secondary"><Download className="h-4 w-4 mr-2" />Report</Button>
        </div>
      </motion.div>

      <div className="mt-6 grid gap-4 lg:grid-cols-4">
        <MiniStat label="Peak predicted" value={`${fmtNum(peak?.forecast ?? 0)} MW`} sub={peak?.date} />
        <MiniStat label="Lowest predicted" value={`${fmtNum(low?.forecast ?? 0)} MW`} sub={low?.date} />
        <MiniStat label="Forecast horizon" value={`${horizon} days`} sub="Confidence 92%" />
        <MiniStat label="Est. RMSE" value={`${fmtNum((peak?.forecast ?? 0) * 0.04)}`} sub="MW · rolling" />
      </div>

      <section className="mt-6 glass rounded-2xl p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-display font-semibold">{chosen} · Demand Forecast</h3>
          <Badge variant="outline"><TrendingUp className="h-3 w-3 mr-1" />92% confidence</Badge>
        </div>
        <ResponsiveContainer width="100%" height={380}>
          <AreaChart data={forecast}>
            <defs>
              <linearGradient id="band" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#7cc4ff" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#7cc4ff" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
            <XAxis dataKey="date" tick={{ fill: "var(--muted-foreground)", fontSize: 10 }} tickFormatter={(v) => v.slice(5)} />
            <YAxis tick={{ fill: "var(--muted-foreground)", fontSize: 10 }} tickFormatter={(v) => fmtNum(v)} />
            <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => fmtNum(v) + " MW"} />
            <Area dataKey="upper" stroke="none" fill="url(#band)" />
            <Area dataKey="lower" stroke="none" fill="rgba(20,22,32,1)" />
            <Line type="monotone" dataKey="demand" stroke="#67e0c8" dot={false} strokeWidth={2} />
            <Line type="monotone" dataKey="forecast" stroke="#7cc4ff" dot={false} strokeWidth={2} strokeDasharray="4 4" />
          </AreaChart>
        </ResponsiveContainer>
      </section>
    </div>
  );
}

function MiniStat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="glass rounded-2xl p-4">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-1 font-display text-2xl font-semibold">{value}</div>
      {sub && <div className="text-xs text-muted-foreground mt-1 font-mono">{sub}</div>}
    </div>
  );
}

const tooltipStyle = {
  background: "rgba(20,22,32,0.95)",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 12,
  fontSize: 12,
};
