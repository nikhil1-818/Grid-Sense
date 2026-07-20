import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useData } from "@/lib/data-store";
import { EmptyDataset } from "@/components/empty-dataset";
import { byState, summarize } from "@/lib/mock-data";
import { fmtNum, KpiCard } from "@/components/kpi-card";
import { Activity, Bolt, Leaf, Radio, TrendingUp, Zap } from "lucide-react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_app/live")({
  component: Live,
});

function Live() {
  const { dataset } = useData();
  const [stream, setStream] = useState<Array<{ t: number; demand: number; gen: number; renew: number }>>([]);
  const [feed, setFeed] = useState<Array<{ id: number; text: string; time: string }>>([]);
  const s = useMemo(() => (dataset ? summarize(dataset.rows) : null), [dataset]);

  useEffect(() => {
    if (!s) return;
    const base = s.avgDemand;
    setStream(
      Array.from({ length: 30 }, (_, i) => ({
        t: Date.now() - (30 - i) * 1000,
        demand: base + Math.sin(i / 4) * base * 0.1 + (Math.random() - 0.5) * base * 0.05,
        gen: base * 1.02 + Math.cos(i / 3) * base * 0.08,
        renew: base * 0.35 + Math.sin(i / 5) * base * 0.05,
      })),
    );
    const iv = setInterval(() => {
      setStream((prev) => {
        const last = prev[prev.length - 1];
        const t = Date.now();
        const demand = last.demand * (0.98 + Math.random() * 0.04);
        return [...prev.slice(-40), { t, demand, gen: demand * (1.0 + Math.random() * 0.05), renew: demand * (0.3 + Math.random() * 0.1) }];
      });
    }, 1000);
    const iv2 = setInterval(() => {
      const msgs = [
        "Solar generation ramped up in Rajasthan (+320 MW)",
        "Frequency deviation resolved · North grid",
        "Peak demand recorded in Maharashtra: 24,832 MW",
        "Wind farms in Tamil Nadu online",
        "Thermal unit #4 back on grid — Chhattisgarh",
        "Kafka topic `demand.metrics` — 1.2k msg/s",
      ];
      setFeed((f) => [
        { id: Date.now(), text: msgs[Math.floor(Math.random() * msgs.length)], time: new Date().toLocaleTimeString() },
        ...f.slice(0, 19),
      ]);
    }, 2200);
    return () => {
      clearInterval(iv);
      clearInterval(iv2);
    };
  }, [s]);

  if (!dataset || !s) return <EmptyDataset />;

  const states = byState(dataset.rows).slice(0, 5);

  return (
    <div className="mx-auto max-w-[1600px] px-6 py-8">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/15 grid place-items-center pulse-ring">
              <Radio className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <h1 className="font-display text-3xl font-semibold tracking-tight">Real-Time Operations</h1>
              <p className="text-sm text-muted-foreground">Kafka-powered · Streaming from national grid</p>
            </div>
          </div>
        </div>
        <Badge className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
          ● LIVE · 1.2k events/sec
        </Badge>
      </motion.div>

      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard label="Live Demand" value={`${fmtNum(stream.at(-1)?.demand ?? 0)} MW`} icon={Bolt} />
        <KpiCard label="Live Generation" value={`${fmtNum(stream.at(-1)?.gen ?? 0)} MW`} icon={Activity} />
        <KpiCard label="Renewable Now" value={`${fmtNum(stream.at(-1)?.renew ?? 0)} MW`} icon={Leaf} />
        <KpiCard label="System Health" value="99.97%" delta={0.1} icon={TrendingUp} />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_360px]">
        <section className="glass rounded-2xl p-5">
          <h3 className="font-display font-semibold mb-3">Live Demand · Generation · Renewables</h3>
          <ResponsiveContainer width="100%" height={340}>
            <AreaChart data={stream}>
              <defs>
                <linearGradient id="ld" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#7cc4ff" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#7cc4ff" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
              <XAxis dataKey="t" tick={{ fill: "var(--muted-foreground)", fontSize: 10 }} tickFormatter={(t) => new Date(t).toLocaleTimeString().slice(3, 8)} />
              <YAxis tick={{ fill: "var(--muted-foreground)", fontSize: 10 }} tickFormatter={fmtNum} />
              <Tooltip contentStyle={{ background: "rgba(20,22,32,0.95)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, fontSize: 12 }} formatter={(v: number) => fmtNum(v) + " MW"} />
              <Area type="monotone" dataKey="demand" stroke="#7cc4ff" fill="url(#ld)" strokeWidth={2} isAnimationActive={false} />
              <Area type="monotone" dataKey="gen" stroke="#67e0c8" fill="transparent" strokeWidth={2} isAnimationActive={false} />
              <Area type="monotone" dataKey="renew" stroke="#f0b849" fill="transparent" strokeWidth={2} isAnimationActive={false} />
            </AreaChart>
          </ResponsiveContainer>

          <div className="mt-6 grid grid-cols-5 gap-2">
            {states.map((st) => (
              <div key={st.state} className="glass rounded-xl p-3">
                <div className="text-xs text-muted-foreground truncate">{st.state}</div>
                <div className="mt-1 font-display font-semibold">{fmtNum(st.demand)}</div>
                <div className="mt-1.5 h-1 rounded-full bg-border overflow-hidden">
                  <motion.div className="h-full bg-gradient-to-r from-primary to-accent" animate={{ width: `${60 + Math.random() * 40}%` }} transition={{ duration: 1 }} />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="glass rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-display font-semibold">Activity Feed</h3>
            <span className="text-xs text-muted-foreground font-mono">stream</span>
          </div>
          <div className="space-y-2 max-h-[500px] overflow-auto">
            {feed.map((e) => (
              <motion.div key={e.id} initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} className="flex gap-3 text-sm p-2 rounded-lg hover:bg-secondary/40 transition">
                <div className="h-6 w-6 rounded-full bg-primary/15 grid place-items-center shrink-0">
                  <Zap className="h-3 w-3 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-foreground/90">{e.text}</div>
                  <div className="text-[10px] text-muted-foreground font-mono">{e.time}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
