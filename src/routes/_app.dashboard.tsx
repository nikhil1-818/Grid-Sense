import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  Activity,
  BarChart3,
  Battery,
  Bolt,
  Calendar,
  Database,
  Flame,
  Gauge,
  Leaf,
  MapPin,
  Sun,
  TrendingUp,
  Wind,
} from "lucide-react";
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
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
} from "recharts";
import { useData } from "@/lib/data-store";
import { byDate, byState, summarize } from "@/lib/mock-data";
import { EmptyDataset } from "@/components/empty-dataset";
import { KpiCard, fmtNum } from "@/components/kpi-card";
import { useMemo } from "react";

export const Route = createFileRoute("/_app/dashboard")({
  head: () => ({
    meta: [
      { title: "Executive Dashboard — GridSense AI" },
      { name: "description", content: "Real-time KPIs and analytics for electricity grid operations." },
    ],
  }),
  component: Dashboard,
});

const COLORS = ["#7cc4ff", "#f0b849", "#67e0c8", "#b492ff", "#ff8f6b"];

function Dashboard() {
  const { dataset } = useData();
  const s = useMemo(() => (dataset ? summarize(dataset.rows) : null), [dataset]);
  const daily = useMemo(() => (dataset ? byDate(dataset.rows).slice(-90) : []), [dataset]);
  const states = useMemo(() => (dataset ? byState(dataset.rows).slice(0, 10) : []), [dataset]);

  if (!dataset || !s) return <EmptyDataset />;

  const mix = [
    { name: "Solar", value: s.totalSolar },
    { name: "Wind", value: s.totalWind },
    { name: "Hydro", value: s.totalHydro },
    { name: "Thermal", value: s.totalThermal },
    { name: "Nuclear", value: s.totalNuclear },
  ];

  const regionRadar = useMemo(() => {
    const map = new Map<string, { region: string; demand: number; generation: number }>();
    for (const r of dataset.rows) {
      const cur = map.get(r.region) ?? { region: r.region, demand: 0, generation: 0 };
      cur.demand += r.demand;
      cur.generation += r.generation;
      map.set(r.region, cur);
    }
    return Array.from(map.values());
  }, [dataset.rows]);

  return (
    <div className="mx-auto max-w-[1600px] px-6 py-8">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-wrap items-end justify-between gap-4"
      >
        <div>
          <div className="text-xs text-muted-foreground uppercase tracking-widest">
            Executive Dashboard
          </div>
          <h1 className="mt-1 font-display text-3xl md:text-4xl font-semibold tracking-tight">
            National Grid Overview
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Source: <span className="font-mono">{dataset.fileName}</span> ·{" "}
            {s.totalRecords.toLocaleString()} records · latest {s.latestDate}
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <div className="glass rounded-full px-3 py-1.5 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400 pulse-ring" />
            Live
          </div>
          <div className="glass rounded-full px-3 py-1.5">
            Data Quality: <span className="text-emerald-400 font-semibold">{s.dataQuality}%</span>
          </div>
        </div>
      </motion.div>

      {/* KPIs */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3">
        <KpiCard label="Total Records" value={fmtNum(s.totalRecords)} icon={Database} index={0} />
        <KpiCard label="States" value={s.totalStates} icon={MapPin} index={1} />
        <KpiCard label="Years" value={s.totalYears} icon={Calendar} index={2} />
        <KpiCard label="Total Demand" value={`${fmtNum(s.totalDemand)} MW`} delta={4.2} icon={Bolt} index={3} />
        <KpiCard label="Generation" value={`${fmtNum(s.totalGeneration)} MW`} delta={3.6} icon={Activity} index={4} />
        <KpiCard label="Renewable" value={`${s.renewablePct.toFixed(1)}%`} delta={8.1} icon={Leaf} index={5} />
        <KpiCard label="Peak" value={`${fmtNum(s.peakDemand)} MW`} icon={Gauge} index={6} />
        <KpiCard label="Solar" value={`${fmtNum(s.totalSolar)} MW`} icon={Sun} index={7} />
        <KpiCard label="Wind" value={`${fmtNum(s.totalWind)} MW`} icon={Wind} index={8} />
        <KpiCard label="Hydro" value={`${fmtNum(s.totalHydro)} MW`} icon={Battery} index={9} />
        <KpiCard label="Thermal" value={`${fmtNum(s.totalThermal)} MW`} icon={Flame} index={10} />
        <KpiCard label="Avg Demand" value={`${fmtNum(s.avgDemand)} MW`} icon={BarChart3} index={11} />
        <KpiCard label="Latest Date" value={s.latestDate} icon={Calendar} index={12} />
        <KpiCard label="Quality Score" value={`${s.dataQuality}%`} delta={0.4} icon={TrendingUp} index={13} />
      </div>

      {/* Charts */}
      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Panel title="Demand vs Generation (90 days)" className="lg:col-span-2">
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={daily} margin={{ left: -20, right: 8, top: 8, bottom: 0 }}>
              <defs>
                <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7cc4ff" stopOpacity={0.6} />
                  <stop offset="95%" stopColor="#7cc4ff" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#67e0c8" stopOpacity={0.6} />
                  <stop offset="95%" stopColor="#67e0c8" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
              <XAxis dataKey="date" tick={{ fill: "var(--muted-foreground)", fontSize: 10 }} tickFormatter={(v) => v.slice(5)} />
              <YAxis tick={{ fill: "var(--muted-foreground)", fontSize: 10 }} tickFormatter={(v) => fmtNum(v)} />
              <Tooltip contentStyle={tooltipStyle} />
              <Area type="monotone" dataKey="demand" stroke="#7cc4ff" fill="url(#g1)" strokeWidth={2} />
              <Area type="monotone" dataKey="generation" stroke="#67e0c8" fill="url(#g2)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </Panel>

        <Panel title="Energy Mix">
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={mix} dataKey="value" nameKey="name" innerRadius={55} outerRadius={95} paddingAngle={2}>
                {mix.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
              </Pie>
              <Legend />
              <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => fmtNum(v) + " MW"} />
            </PieChart>
          </ResponsiveContainer>
        </Panel>

        <Panel title="Top 10 States by Demand" className="lg:col-span-2">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={states} margin={{ left: -10, top: 8, right: 8, bottom: 0 }}>
              <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
              <XAxis dataKey="state" tick={{ fill: "var(--muted-foreground)", fontSize: 10 }} angle={-25} textAnchor="end" height={60} />
              <YAxis tick={{ fill: "var(--muted-foreground)", fontSize: 10 }} tickFormatter={(v) => fmtNum(v)} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => fmtNum(v) + " MW"} />
              <Bar dataKey="demand" fill="#7cc4ff" radius={[6, 6, 0, 0]} />
              <Bar dataKey="generation" fill="#67e0c8" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Panel>

        <Panel title="Regional Balance">
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={regionRadar}>
              <PolarGrid stroke="rgba(255,255,255,0.1)" />
              <PolarAngleAxis dataKey="region" tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} />
              <Radar dataKey="demand" stroke="#7cc4ff" fill="#7cc4ff" fillOpacity={0.4} />
              <Radar dataKey="generation" stroke="#67e0c8" fill="#67e0c8" fillOpacity={0.3} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => fmtNum(v) + " MW"} />
            </RadarChart>
          </ResponsiveContainer>
        </Panel>

        <Panel title="Renewable Contribution Over Time" className="lg:col-span-3">
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={daily}>
              <defs>
                {["solar", "wind", "hydro"].map((k, i) => (
                  <linearGradient key={k} id={"gr" + k} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={COLORS[i]} stopOpacity={0.7} />
                    <stop offset="100%" stopColor={COLORS[i]} stopOpacity={0} />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
              <XAxis dataKey="date" tick={{ fill: "var(--muted-foreground)", fontSize: 10 }} tickFormatter={(v) => v.slice(5)} />
              <YAxis tick={{ fill: "var(--muted-foreground)", fontSize: 10 }} tickFormatter={(v) => fmtNum(v)} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => fmtNum(v) + " MW"} />
              <Legend />
              <Area type="monotone" dataKey="solar" stackId="1" stroke={COLORS[0]} fill={`url(#grsolar)`} />
              <Area type="monotone" dataKey="wind" stackId="1" stroke={COLORS[1]} fill={`url(#grwind)`} />
              <Area type="monotone" dataKey="hydro" stackId="1" stroke={COLORS[2]} fill={`url(#grhydro)`} />
            </AreaChart>
          </ResponsiveContainer>
        </Panel>
      </div>
    </div>
  );
}

const tooltipStyle = {
  background: "rgba(20,22,32,0.95)",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 12,
  fontSize: 12,
};

function Panel({ title, className = "", children }: { title: string; className?: string; children: React.ReactNode }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={`glass rounded-2xl p-4 ${className}`}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-display font-semibold">{title}</h3>
      </div>
      {children}
    </motion.section>
  );
}
