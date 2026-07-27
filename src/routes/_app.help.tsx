import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { BookOpen, MessageCircle, Play, Sparkles, Send } from "lucide-react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useCreateSupportRequest, useSupportRequests } from "@/lib/profile";

export const Route = createFileRoute("/_app/help")({
  component: Help,
  head: () => ({
    meta: [
      { title: "Help Center — GridSense AI" },
      { name: "description", content: "Guides for uploading CEA data, the accepted schema, AI models and 24/7 support." },
      { property: "og:title", content: "Help Center — GridSense AI" },
      { property: "og:description", content: "Guides for uploading CEA data, the accepted schema, AI models and 24/7 support." },
    ],
  }),
});

type Topic = {
  id: string;
  icon: typeof Play;
  title: string;
  desc: string;
  body: Array<{ h: string; p: string }>;
  cta?: { label: string; to: string };
};

const TOPICS: Topic[] = [
  {
    id: "getting-started",
    icon: Play,
    title: "Getting started",
    desc: "Upload your first CEA dataset and generate insights in under 60 seconds.",
    body: [
      { h: "1. Prepare the file", p: "Export a single sheet as .xlsx or .csv with one row per state per date." },
      { h: "2. Upload", p: "Open Upload Dataset, drag the file in, and the pipeline reads, cleans and analyses it automatically." },
      { h: "3. Explore", p: "Dashboard, Analytics, Insights, Forecasting and Alerts all populate from your uploaded rows." },
      { h: "4. Search any state", p: "Press Ctrl/⌘ + K and type a state name to open its dedicated demand profile." },
    ],
    cta: { label: "Go to Upload", to: "/upload" },
  },
  {
    id: "schema",
    icon: BookOpen,
    title: "Data schema",
    desc: "Recognized columns, cleaning behavior, and validation rules.",
    body: [
      { h: "Required", p: "date (YYYY-MM-DD or Excel serial), state, demand (MW)." },
      { h: "Optional", p: "region, generation, peak, solar, wind, hydro, thermal, nuclear." },
      { h: "Flexible naming", p: "demand/consumption/load, thermal/coal and date/day are all accepted." },
      { h: "Derived values", p: "Generation is summed from the mix when missing; peak defaults to demand × 1.15; region is inferred from the state name." },
    ],
    cta: { label: "Open Upload", to: "/upload" },
  },
  {
    id: "models",
    icon: Sparkles,
    title: "AI models",
    desc: "How GridForecast, anomaly detection and clustering work.",
    body: [
      { h: "GridForecast", p: "Trend + seasonality decomposition over your daily series, projected 7–365 days with confidence bands." },
      { h: "Anomaly detection", p: "Rolling mean ± 2σ on state-level demand flags spikes and drops in the Alert Center." },
      { h: "Insight engine", p: "Growth, renewable leadership and weekday/weekend seasonality are computed from your dataset on every load." },
    ],
    cta: { label: "Open Forecasting", to: "/forecast" },
  },
  {
    id: "support",
    icon: MessageCircle,
    title: "Contact support",
    desc: "24/7 support for enterprise customers — raise a ticket and track its status.",
    body: [{ h: "Response time", p: "Enterprise tickets are answered within 4 business hours." }],
  },
];

function Help() {
  const [openTopic, setOpenTopic] = useState<Topic | null>(null);
  const [contactOpen, setContactOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-3xl font-semibold tracking-tight">Help Center</h1>
        <p className="text-sm text-muted-foreground mt-1">Documentation, guides and support</p>
      </motion.div>

      <div className="mt-6 grid gap-3 md:grid-cols-2">
        {TOPICS.map((t, i) => (
          <motion.button
            key={t.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            onClick={() => (t.id === "support" ? setContactOpen(true) : setOpenTopic(t))}
            className="glass rounded-2xl p-6 text-left hover:-translate-y-1 hover:glow transition-all"
          >
            <div className="h-10 w-10 rounded-xl bg-primary/15 text-primary grid place-items-center mb-3">
              <t.icon className="h-5 w-5" />
            </div>
            <div className="font-display font-semibold text-lg">{t.title}</div>
            <div className="text-sm text-muted-foreground mt-1">{t.desc}</div>
          </motion.button>
        ))}
      </div>

      <SupportHistory />

      <Dialog open={!!openTopic} onOpenChange={(o) => !o && setOpenTopic(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{openTopic?.title}</DialogTitle>
            <DialogDescription>{openTopic?.desc}</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            {openTopic?.body.map((b) => (
              <div key={b.h}>
                <div className="text-sm font-medium">{b.h}</div>
                <div className="text-sm text-muted-foreground">{b.p}</div>
              </div>
            ))}
          </div>
          <div className="flex gap-2 pt-2">
            {openTopic?.cta && (
              <Button
                className="glow"
                onClick={() => {
                  const to = openTopic.cta!.to;
                  setOpenTopic(null);
                  navigate({ to });
                }}
              >
                {openTopic.cta.label}
              </Button>
            )}
            <Button variant="secondary" onClick={() => { setOpenTopic(null); setContactOpen(true); }}>
              Still need help?
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <ContactDialog open={contactOpen} onOpenChange={setContactOpen} />
    </div>
  );
}

function ContactDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const create = useCreateSupportRequest();
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const submit = () => {
    if (!subject.trim() || !message.trim()) {
      toast.error("Add a subject and a message");
      return;
    }
    create.mutate(
      { topic: "support", subject: subject.trim(), message: message.trim() },
      {
        onSuccess: () => {
          toast.success("Support request submitted");
          setSubject("");
          setMessage("");
          onOpenChange(false);
        },
        onError: (e) => toast.error(e instanceof Error ? e.message : "Could not submit"),
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Contact support</DialogTitle>
          <DialogDescription>We reply to enterprise tickets within 4 business hours.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <Input placeholder="Subject" value={subject} onChange={(e) => setSubject(e.target.value)} />
          <Textarea
            placeholder="Describe the issue, including the dataset and page involved…"
            rows={5}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <Button className="glow w-full" onClick={submit} disabled={create.isPending}>
            <Send className="h-4 w-4 mr-2" />
            {create.isPending ? "Submitting…" : "Submit request"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function SupportHistory() {
  const { data: requests = [], isLoading } = useSupportRequests();
  if (isLoading || !requests.length) return null;
  return (
    <div className="glass rounded-2xl p-6 mt-6">
      <div className="font-display font-semibold text-lg">Your support requests</div>
      <div className="divide-y divide-border/60 mt-2">
        {requests.map((r) => (
          <div key={r.id} className="py-3 flex items-start gap-3">
            <Badge variant="secondary" className="capitalize shrink-0">
              {r.status}
            </Badge>
            <div className="min-w-0">
              <div className="text-sm font-medium truncate">{r.subject}</div>
              <div className="text-xs text-muted-foreground line-clamp-2">{r.message}</div>
              <div className="text-[10px] text-muted-foreground mt-0.5">{new Date(r.created_at).toLocaleString()}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
