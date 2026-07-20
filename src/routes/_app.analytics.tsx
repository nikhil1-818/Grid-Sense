import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { useData } from "@/lib/data-store";
import { byState, byDate } from "@/lib/mock-data";
import { EmptyDataset } from "@/components/empty-dataset";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  Treemap,
  XAxis,
  YAxis,
  ZAxis,
} from "recharts";
import { fmtNum } from "@/components/kpi-card";
import { motion } from "framer-motion";

export const Route = createFileRoute("/_app/analytics")({
  component: Analytics,
});

const COLORS = ["#7cc4ff", "#f0b849", "#67e0c8", "#b492ff", "#ff8f6b", "#8fd6ff"];

function Analytics() {
  const { dataset } = useData();
  if (!dataset) return <EmptyDataset />;
  const states = byState(dataset.rows);
  const daily = byDate(dataset.rows);
  const scatter = useMemo(
    () => states.map((s) => ({ x: s.demand, y: s.generation, z: s.solar, name: s.state })),
    [states],
  );
  const heat = useMemo(() => {
    // Aggregate by month × state (top 10)
    const top = states.slice(0, 10).map((s) => s.state);
    const map = new Map<string, Map<string, number>>();
    for (const r of dataset.rows) {
      if (!top.includes(r.state)) continue;
      const m = r.date.slice(0, 7);
      if (!map.has(r.state)) map.set(r.state, new Map());
      map.get(r.state)!.set(m, (map.get(r.state)!.get(m) ?? 0) + r.demand);
    }
    return { top, map };
  }, [dataset.rows, states]);

  const months = Array.from(new Set(dataset.rows.map((r) => r.date.slice(0, 7)))).sort();
  const maxHeat = Math.max(
    ...Array.from(heat.map.values()).flatMap((m) => Array.from(m.values())),
  );

  return (
    <div className="mx-auto max-w-[1600px] px-6 py-8 space-y-6">
      <motion.h1 initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="font-display text-3xl font-semibold tracking-tight">
        Advanced Analytics
      </motion.h1>

      <section className="glass rounded-2xl p-5">
        <h3 className="font-display font-semibold mb-3">State Treemap · Demand share</h3>
        <ResponsiveContainer width="100%" height={340}>
          <Treemap
            data={states.slice(0, 18).map((s, i) => ({ name: s.state, size: s.demand, fill: COLORS[i % COLORS.length] }))}
            dataKey="size"
            stroke="rgba(0,0,0,0.4)"
          />
        </ResponsiveContainer>
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="glass rounded-2xl p-5">
          <h3 className="font-display font-semibold mb-3">Demand vs Generation Scatter</h3>
          <ResponsiveContainer width="100%" height={320}>
            <ScatterChart>
              <CartesianGrid stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="x" name="Demand" tick={{ fill: "var(--muted-foreground)", fontSize: 10 }} tickFormatter={fmtNum} />
              <YAxis dataKey="y" name="Generation" tick={{ fill: "var(--muted-foreground)", fontSize: 10 }} tickFormatter={fmtNum} />
              <ZAxis dataKey="z" range={[60, 400]} />
              <Tooltip cursor={{ strokeDasharray: "3 3" }} contentStyle={tooltipStyle} formatter={(v: number) => fmtNum(v)} />
              <Scatter data={scatter} fill="#7cc4ff" />
            </ScatterChart>
          </ResponsiveContainer>
        </section>

        <section className="glass rounded-2xl p-5">
          <h3 className="font-display font-semibold mb-3">Daily Peak Trend</h3>
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={daily.slice(-120)}>
              <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
              <XAxis dataKey="date" tick={{ fill: "var(--muted-foreground)", fontSize: 10 }} tickFormatter={(v) => v.slice(5)} />
              <YAxis tick={{ fill: "var(--muted-foreground)", fontSize: 10 }} tickFormatter={fmtNum} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => fmtNum(v) + " MW"} />
              <Line dataKey="peak" stroke="#f0b849" strokeWidth={2} dot={false} />
              <Line dataKey="demand" stroke="#7cc4ff" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </section>
      </div>

      <section className="glass rounded-2xl p-5">
        <h3 className="font-display font-semibold mb-3">State × Month Heatmap</h3>
        <div className="overflow-auto">
          <table className="min-w-full text-xs">
            <thead>
              <tr>
                <th className="text-left p-2 sticky left-0 bg-card">State</th>
                {months.map((m) => (
                  <th key={m} className="p-2 font-mono text-muted-foreground">{m.slice(5)}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {heat.top.map((state) => (
                <tr key={state}>
                  <td className="p-2 font-medium sticky left-0 bg-card">{state}</td>
                  {months.map((m) => {
                    const v = heat.map.get(state)?.get(m) ?? 0;
                    const alpha = v / maxHeat;
                    return (
                      <td
                        key={m}
                        className="p-2 text-center rounded"
                        style={{ background: `oklch(0.72 0.18 250 / ${alpha})`, color: alpha > 0.6 ? "#000" : "inherit" }}
                        title={`${state} · ${m} · ${fmtNum(v)} MW`}
                      >
                        {fmtNum(v)}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="glass rounded-2xl p-5">
        <h3 className="font-display font-semibold mb-3">State-wise Renewable Composition</h3>
        <ResponsiveContainer width="100%" height={340}>
          <BarChart data={states.slice(0, 12)}>
            <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
            <XAxis dataKey="state" tick={{ fill: "var(--muted-foreground)", fontSize: 10 }} angle={-25} textAnchor="end" height={70} />
            <YAxis tick={{ fill: "var(--muted-foreground)", fontSize: 10 }} tickFormatter={fmtNum} />
            <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => fmtNum(v)} />
            <Legend />
            <Bar dataKey="solar" stackId="a" fill="#f0b849" />
            <Bar dataKey="wind" stackId="a" fill="#8fd6ff" />
            <Bar dataKey="hydro" stackId="a" fill="#67e0c8" />
            <Bar dataKey="thermal" stackId="a" fill="#ff8f6b" />
          </BarChart>
        </ResponsiveContainer>
      </section>
    </div>
  );
}

const tooltipStyle = {
  background: "rgba(20,22,32,0.95)",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 12,
  fontSize: 12,
};
