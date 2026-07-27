import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useMemo } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ArrowLeft, Bolt, Gauge, Leaf, Zap } from "lucide-react";
import { useData } from "@/lib/data-store";
import { EmptyDataset } from "@/components/empty-dataset";
import { KpiCard, fmtNum } from "@/components/kpi-card";

export const Route = createFileRoute("/_app/state/$state")({
  component: StateDetail,
});

const COLORS = ["#f59e0b", "#38bdf8", "#22d3ee", "#ef4444", "#a78bfa"];

function StateDetail() {
  const { state } = Route.useParams();
  const { dataset } = useData();

  const rows = useMemo(
    () => (dataset ? dataset.rows.filter((r) => r.state.toLowerCase() === state.toLowerCase()) : []),
    [dataset, state],
  );

  const daily = useMemo(
    () =>
      [...rows]
        .sort((a, b) => a.date.localeCompare(b.date))
        .map((r) => ({ date: r.date, demand: r.demand, generation: r.generation, peak: r.peak })),
    [rows],
  );

  const monthly = useMemo(() => {
    const m = new Map<string, { month: string; demand: number; renewable: number }>();
    for (const r of rows) {
      const k = r.date.slice(0, 7);
      const cur = m.get(k) ?? { month: k, demand: 0, renewable: 0 };
      cur.demand += r.demand;
      cur.renewable += r.solar + r.wind + r.hydro;
      m.set(k, cur);
    }
    return Array.from(m.values()).sort((a, b) => a.month.localeCompare(b.month));
  }, [rows]);

  const mix = useMemo(() => {
    const sum = (k: "solar" | "wind" | "hydro" | "thermal" | "nuclear") => rows.reduce((a, r) => a + r[k], 0);
    return [
      { name: "Solar", value: sum("solar") },
      { name: "Wind", value: sum("wind") },
      { name: "Hydro", value: sum("hydro") },
      { name: "Thermal", value: sum("thermal") },
      { name: "Nuclear", value: sum("nuclear") },
    ].filter((d) => d.value > 0);
  }, [rows]);

  if (!dataset) return <EmptyDataset />;

  if (!rows.length) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-16 text-center">
        <h1 className="font-display text-2xl font-semibold">No data for “{state}”</h1>
        <p className="text-sm text-muted-foreground mt-2">
          This state isn't present in {dataset.fileName}. Try searching another state.
        </p>
        <Link to="/dashboard" className="inline-flex mt-6 text-sm text-primary hover:underline">
          ← Back to dashboard
        </Link>
      </div>
    );
  }

  const totalDemand = rows.reduce((a, r) => a + r.demand, 0);
  const totalGen = rows.reduce((a, r) => a + r.generation, 0);
  const renewable = rows.reduce((a, r) => a + r.solar + r.wind + r.hydro, 0);
  const peak = Math.max(...rows.map((r) => r.peak));

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <Link to="/dashboard" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-3 w-3" /> Dashboard
        </Link>
        <h1 className="font-display text-3xl font-semibold tracking-tight mt-2">{rows[0].state}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {rows[0].region} region · {rows.length.toLocaleString()} records · {daily[0]?.date} → {daily[daily.length - 1]?.date}
        </p>
      </motion.div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Total Demand" value={`${fmtNum(totalDemand)} MW`} icon={Bolt} />
        <KpiCard label="Total Generation" value={`${fmtNum(totalGen)} MW`} icon={Zap} />
        <KpiCard label="Peak Demand" value={`${fmtNum(peak)} MW`} icon={Gauge} />
        <KpiCard
          label="Renewable Share"
          value={`${totalGen ? ((renewable / totalGen) * 100).toFixed(1) : "0"}%`}
          icon={Leaf}
        />
      </div>

      <div className="mt-4 glass rounded-2xl p-5">
        <div className="font-display font-semibold mb-3">Demand vs Generation</div>
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={daily}>
            <defs>
              <linearGradient id="sd" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#38bdf8" stopOpacity={0.5} />
                <stop offset="100%" stopColor="#38bdf8" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} minTickGap={40} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Legend />
            <Area type="monotone" dataKey="demand" stroke="#38bdf8" fill="url(#sd)" name="Demand (MW)" />
            <Area type="monotone" dataKey="generation" stroke="#22c55e" fillOpacity={0} name="Generation (MW)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div className="glass rounded-2xl p-5">
          <div className="font-display font-semibold mb-3">Monthly demand & renewables</div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={monthly}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="demand" fill="#38bdf8" name="Demand" radius={[4, 4, 0, 0]} />
              <Bar dataKey="renewable" fill="#22c55e" name="Renewable" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="glass rounded-2xl p-5">
          <div className="font-display font-semibold mb-3">Energy mix</div>
          {mix.length ? (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={mix} dataKey="value" nameKey="name" innerRadius={60} outerRadius={100}>
                  {mix.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-sm text-muted-foreground">No generation-mix columns in this dataset.</div>
          )}
        </div>
      </div>
    </div>
  );
}
