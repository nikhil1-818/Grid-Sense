import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { BookOpen, MessageCircle, Play, Sparkles } from "lucide-react";

export const Route = createFileRoute("/_app/help")({
  component: Help,
});

const TOPICS = [
  { icon: Play, title: "Getting started", desc: "Upload your first CEA dataset and generate insights in under 60 seconds." },
  { icon: BookOpen, title: "Data schema", desc: "Recognized columns, cleaning behavior, and validation rules." },
  { icon: Sparkles, title: "AI models", desc: "How GridForecast, anomaly detection and clustering work." },
  { icon: MessageCircle, title: "Contact support", desc: "24/7 support for enterprise customers." },
];

function Help() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-3xl font-semibold tracking-tight">Help Center</h1>
        <p className="text-sm text-muted-foreground mt-1">Documentation, guides and support</p>
      </motion.div>
      <div className="mt-6 grid gap-3 md:grid-cols-2">
        {TOPICS.map((t, i) => (
          <motion.div
            key={t.title}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            className="glass rounded-2xl p-6 hover:-translate-y-1 hover:glow transition-all"
          >
            <div className="h-10 w-10 rounded-xl bg-primary/15 text-primary grid place-items-center mb-3">
              <t.icon className="h-5 w-5" />
            </div>
            <div className="font-display font-semibold text-lg">{t.title}</div>
            <div className="text-sm text-muted-foreground mt-1">{t.desc}</div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
