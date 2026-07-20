import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  Activity,
  Boxes,
  BrainCircuit,
  Cloud,
  Cpu,
  Database,
  GitBranch,
  Lock,
  Radio,
  Server,
  Shield,
  Zap,
} from "lucide-react";

export const Route = createFileRoute("/_app/infrastructure")({
  component: Infra,
});

const SERVICES = [
  { name: "API Gateway", status: "operational", uptime: "99.99%", icon: Server, latency: "42ms" },
  { name: "PostgreSQL", status: "operational", uptime: "99.98%", icon: Database, latency: "6ms" },
  { name: "AI Model — GridForecast v2", status: "operational", uptime: "99.95%", icon: BrainCircuit, latency: "120ms" },
  { name: "Kafka Cluster (3 brokers)", status: "operational", uptime: "99.99%", icon: Radio, latency: "8ms" },
  { name: "Redis Cache", status: "operational", uptime: "100%", icon: Zap, latency: "1ms" },
  { name: "Authentication (OIDC)", status: "operational", uptime: "99.99%", icon: Lock, latency: "35ms" },
  { name: "Object Storage (S3)", status: "operational", uptime: "99.99%", icon: Cloud, latency: "22ms" },
  { name: "CI/CD Pipeline", status: "operational", uptime: "99.9%", icon: GitBranch, latency: "—" },
  { name: "Docker Registry", status: "degraded", uptime: "99.5%", icon: Boxes, latency: "180ms" },
  { name: "Monitoring (Grafana)", status: "operational", uptime: "99.98%", icon: Activity, latency: "18ms" },
  { name: "Compute Nodes (24 cores)", status: "operational", uptime: "99.97%", icon: Cpu, latency: "—" },
  { name: "Security & WAF", status: "operational", uptime: "100%", icon: Shield, latency: "—" },
];

const statusMap: Record<string, string> = {
  operational: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  degraded: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  down: "bg-red-500/15 text-red-400 border-red-500/30",
};

function Infra() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight">Infrastructure Health</h1>
          <p className="text-sm text-muted-foreground mt-1">Deployment · Monitoring · Uptime</p>
        </div>
        <div className="glass rounded-2xl px-5 py-3">
          <div className="text-xs text-muted-foreground">Overall Health</div>
          <div className="font-display text-2xl font-semibold text-emerald-400 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400 pulse-ring" /> 99.94%
          </div>
        </div>
      </motion.div>

      <div className="mt-6 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {SERVICES.map((s, i) => (
          <motion.div
            key={s.name}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            className="glass rounded-2xl p-5"
          >
            <div className="flex items-center justify-between">
              <div className="h-10 w-10 rounded-xl bg-primary/15 text-primary grid place-items-center">
                <s.icon className="h-5 w-5" />
              </div>
              <span className={`text-[10px] uppercase tracking-widest rounded-full px-2 py-0.5 border ${statusMap[s.status]}`}>
                {s.status}
              </span>
            </div>
            <div className="mt-3 font-display font-semibold">{s.name}</div>
            <div className="mt-1 text-xs text-muted-foreground">Uptime · {s.uptime} · p50 {s.latency}</div>
            <div className="mt-3 flex gap-0.5 h-6">
              {Array.from({ length: 40 }).map((_, j) => (
                <div
                  key={j}
                  className={`flex-1 rounded-sm ${
                    s.status === "operational" || Math.random() > 0.05
                      ? "bg-emerald-400/60"
                      : "bg-amber-400/70"
                  }`}
                />
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
