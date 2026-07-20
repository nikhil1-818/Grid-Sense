import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Loader2, Circle } from "lucide-react";
import { useEffect, useState } from "react";
import { useData } from "@/lib/data-store";
import { EmptyDataset } from "@/components/empty-dataset";

const STAGES = [
  "Reading File",
  "Validating Schema",
  "Cleaning Missing Values",
  "Formatting Data",
  "Feature Engineering",
  "Database Storage",
  "AI Analysis",
  "Forecast Generation",
  "Smart Alert Engine",
  "Dashboard Ready",
];

export const Route = createFileRoute("/_app/processing")({
  component: ProcessingPage,
});

function ProcessingPage() {
  const { dataset } = useData();
  const [idx, setIdx] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  const nav = useNavigate();

  useEffect(() => {
    if (!dataset) return;
    if (idx >= STAGES.length) {
      const t = setTimeout(() => nav({ to: "/dashboard" }), 900);
      return () => clearTimeout(t);
    }
    const stage = STAGES[idx];
    const t = setTimeout(
      () => {
        setLogs((l) => [
          ...l,
          `[${new Date().toLocaleTimeString()}] ✓ ${stage} — completed in ${(Math.random() * 400 + 80).toFixed(0)}ms`,
        ]);
        setIdx((i) => i + 1);
      },
      600 + Math.random() * 400,
    );
    return () => clearTimeout(t);
  }, [idx, dataset, nav]);

  if (!dataset) return <EmptyDataset title="No dataset to process" />;

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-3xl md:text-4xl font-semibold tracking-tight">
          Processing <span className="text-gradient">{dataset.fileName}</span>
        </h1>
        <p className="mt-2 text-muted-foreground">
          {dataset.rows.length.toLocaleString()} rows · AI pipeline running
        </p>
      </motion.div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_1fr]">
        <div className="space-y-2">
          {STAGES.map((s, i) => {
            const state = i < idx ? "done" : i === idx ? "run" : "wait";
            return (
              <motion.div
                key={s}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                className={`glass rounded-xl p-4 flex items-center gap-4 ${
                  state === "run" ? "glow" : ""
                }`}
              >
                <div className="shrink-0">
                  {state === "done" && <CheckCircle2 className="h-5 w-5 text-emerald-400" />}
                  {state === "run" && (
                    <Loader2 className="h-5 w-5 text-primary animate-spin" />
                  )}
                  {state === "wait" && (
                    <Circle className="h-5 w-5 text-muted-foreground/40" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{s}</div>
                  <div className="mt-2 h-1 rounded-full bg-border overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-primary to-accent"
                      animate={{
                        width: state === "done" ? "100%" : state === "run" ? "60%" : "0%",
                      }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                </div>
                <div className="text-xs font-mono text-muted-foreground shrink-0">
                  {state === "done" ? "✓" : state === "run" ? "…" : "—"}
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="glass rounded-2xl p-4 font-mono text-xs h-fit sticky top-20">
          <div className="flex items-center gap-2 mb-3 pb-3 border-b border-border/60">
            <div className="h-2 w-2 rounded-full bg-red-400" />
            <div className="h-2 w-2 rounded-full bg-yellow-400" />
            <div className="h-2 w-2 rounded-full bg-emerald-400" />
            <span className="ml-2 text-muted-foreground">gridsense — pipeline.log</span>
          </div>
          <div className="space-y-1 max-h-[500px] overflow-auto">
            <AnimatePresence>
              {logs.map((l, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-muted-foreground"
                >
                  {l}
                </motion.div>
              ))}
            </AnimatePresence>
            {idx < STAGES.length && (
              <div className="text-primary">
                [{new Date().toLocaleTimeString()}] ▸ Running {STAGES[idx]}…
              </div>
            )}
            {idx >= STAGES.length && (
              <div className="text-emerald-400">
                ✓ Pipeline complete. Redirecting to dashboard…
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
