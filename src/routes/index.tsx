import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Upload,
  PlayCircle,
  BookOpen,
  Zap,
  Activity,
  BrainCircuit,
  Shield,
  BarChart3,
  Radio,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "GridSense AI — AI-Powered Electricity Intelligence Platform" },
      {
        name: "description",
        content:
          "Upload CEA electricity data and unlock enterprise-grade forecasting, anomaly detection, renewable analytics and real-time grid operations.",
      },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground relative aurora-bg">
      <div className="absolute inset-0 grid-bg pointer-events-none" />

      {/* Nav */}
      <header className="relative z-20">
        <nav className="mx-auto max-w-7xl px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl glass grid place-items-center glow">
              <Zap className="h-5 w-5 text-primary" />
            </div>
            <span className="font-display font-semibold tracking-tight text-lg">
              GridSense<span className="text-gradient">.AI</span>
            </span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition">Features</a>
            <a href="#pipeline" className="hover:text-foreground transition">Pipeline</a>
            <a href="#stack" className="hover:text-foreground transition">Platform</a>
            <Link to="/help" className="hover:text-foreground transition">Docs</Link>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/dashboard">
              <Button variant="ghost" size="sm">Sign in</Button>
            </Link>
            <Link to="/upload">
              <Button size="sm" className="glow">Get started</Button>
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero */}
      <section className="relative z-10 mx-auto max-w-7xl px-6 pt-16 pb-24 md:pt-24 md:pb-32">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="text-center max-w-4xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 rounded-full glass px-3 py-1 text-xs text-muted-foreground mb-6">
            <span className="h-2 w-2 rounded-full bg-emerald-400 pulse-ring" />
            Live · Powered by AI · Trusted by grid operators
          </div>
          <h1 className="font-display text-5xl md:text-7xl font-semibold tracking-tighter leading-[1.05]">
            The AI Operating System<br />
            for <span className="text-gradient">National Power Grids</span>
          </h1>
          <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Upload CEA electricity data and unlock forecasting, anomaly detection, renewable
            analytics and real-time operations — in one enterprise-grade platform.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to="/upload">
              <Button size="lg" className="glow group h-12 px-6">
                <Upload className="mr-2 h-4 w-4" /> Upload Dataset
                <ArrowRight className="ml-1 h-4 w-4 transition group-hover:translate-x-1" />
              </Button>
            </Link>
            <Link to="/dashboard">
              <Button size="lg" variant="secondary" className="h-12 px-6">
                <PlayCircle className="mr-2 h-4 w-4" /> View Demo
              </Button>
            </Link>
            <Link to="/help">
              <Button size="lg" variant="ghost" className="h-12 px-6">
                <BookOpen className="mr-2 h-4 w-4" /> Documentation
              </Button>
            </Link>
          </div>

          <HeroViz />
        </motion.div>
      </section>

      {/* Features */}
      <section id="features" className="relative z-10 mx-auto max-w-7xl px-6 pb-24">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: i * 0.05 }}
              className="glass rounded-2xl p-6 hover:-translate-y-1 hover:glow transition-all duration-300"
            >
              <div className="h-10 w-10 rounded-xl bg-primary/15 text-primary grid place-items-center mb-4">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="font-display font-semibold text-lg">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Pipeline */}
      <section id="pipeline" className="relative z-10 mx-auto max-w-7xl px-6 pb-24">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 text-xs text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5" /> Zero-config pipeline
          </div>
          <h2 className="mt-2 text-3xl md:text-4xl font-semibold tracking-tight">
            From raw upload to production insights in seconds
          </h2>
        </div>
        <div className="grid gap-3 md:grid-cols-5">
          {PIPELINE.map((p, i) => (
            <motion.div
              key={p}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.04 }}
              className="glass rounded-xl p-4 text-sm"
            >
              <div className="font-mono text-xs text-primary mb-1">
                {String(i + 1).padStart(2, "0")}
              </div>
              {p}
            </motion.div>
          ))}
        </div>
      </section>

      <footer id="stack" className="relative z-10 border-t border-border/60">
        <div className="mx-auto max-w-7xl px-6 py-10 flex flex-wrap items-center justify-between gap-4 text-sm text-muted-foreground">
          <div>© {new Date().getFullYear()} GridSense AI · Enterprise Electricity Intelligence</div>
          <div className="flex gap-6">
            <a href="#" className="hover:text-foreground">Privacy</a>
            <a href="#" className="hover:text-foreground">Security</a>
            <a href="#" className="hover:text-foreground">Status</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

const FEATURES = [
  { icon: BarChart3, title: "Executive Dashboard", desc: "KPIs, choropleth India map, treemaps and Sankey diagrams with pixel-perfect visualizations." },
  { icon: BrainCircuit, title: "AI Insights", desc: "Explainable insights with confidence scores, anomaly clusters and feature-importance analysis." },
  { icon: Activity, title: "Forecasting", desc: "7 to 365-day horizon forecasts with confidence intervals and downloadable prediction reports." },
  { icon: Shield, title: "Smart Alerts", desc: "Real-time detection of demand spikes, renewable failures and grid instability with severity routing." },
  { icon: Radio, title: "Live Operations", desc: "Kafka-style streaming dashboard with sub-second updates for national grid operators." },
  { icon: Sparkles, title: "Enterprise-ready", desc: "SSO, audit logs, RBAC, API keys and infrastructure health monitoring baked in." },
];

const PIPELINE = [
  "Read File",
  "Validate Schema",
  "Clean Missing",
  "Feature Engineering",
  "AI Analysis",
];

function HeroViz() {
  return (
    <div className="relative mt-16 h-64 md:h-80">
      {/* Floating orbs */}
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute h-2 w-2 rounded-full bg-primary/60"
          style={{
            left: `${10 + i * 11}%`,
            top: `${20 + (i % 3) * 25}%`,
            boxShadow: "0 0 20px currentColor",
          }}
          animate={{
            y: [0, -20, 0],
            opacity: [0.4, 1, 0.4],
          }}
          transition={{
            duration: 3 + i * 0.3,
            repeat: Infinity,
            delay: i * 0.2,
          }}
        />
      ))}
      {/* Grid card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3, duration: 0.7 }}
        className="absolute inset-x-0 mx-auto max-w-3xl top-0 glass rounded-2xl p-6 glow"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-red-400" />
            <div className="h-2 w-2 rounded-full bg-yellow-400" />
            <div className="h-2 w-2 rounded-full bg-emerald-400" />
            <span className="ml-3 text-xs font-mono text-muted-foreground">gridsense.ai/live</span>
          </div>
          <div className="text-xs text-muted-foreground font-mono">28 states · realtime</div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {["Demand", "Renewable", "Peak"].map((k, i) => (
            <div key={k} className="rounded-xl bg-secondary/40 p-3">
              <div className="text-xs text-muted-foreground">{k}</div>
              <div className="mt-1 font-display text-xl font-semibold">
                {["214.3 GW", "42.1%", "228.9 GW"][i]}
              </div>
              <div className="mt-2 h-1 rounded-full bg-border overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-primary to-accent"
                  initial={{ width: 0 }}
                  animate={{ width: ["30%", "80%", "55%"][i] }}
                  transition={{ delay: 0.6 + i * 0.15, duration: 1 }}
                />
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
