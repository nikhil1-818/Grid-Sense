import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { UploadCloud, FileSpreadsheet, CheckCircle2, Sparkles } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { parseFile } from "@/lib/parse-file";
import { useData } from "@/lib/data-store";
import { generateMockDataset } from "@/lib/mock-data";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/upload")({
  component: UploadPage,
});

function UploadPage() {
  const [drag, setDrag] = useState(false);
  const [progress, setProgress] = useState(0);
  const [busy, setBusy] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const { setDataset } = useData();
  const nav = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(
    async (f: File) => {
      const ok = /\.(csv|xlsx|xls)$/i.test(f.name);
      if (!ok) {
        toast.error("Please upload a .csv, .xlsx or .xls file");
        return;
      }
      setFile(f);
      setBusy(true);
      setProgress(0);
      const tick = setInterval(() => setProgress((p) => Math.min(p + 7, 90)), 90);
      try {
        const ds = await parseFile(f);
        setProgress(100);
        setDataset(ds);
        toast.success(`Parsed ${ds.rows.length.toLocaleString()} rows`);
        setTimeout(() => nav({ to: "/processing" }), 500);
      } catch (e) {
        toast.error((e as Error).message);
        setBusy(false);
      } finally {
        clearInterval(tick);
      }
    },
    [nav, setDataset],
  );

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-3xl md:text-4xl font-semibold tracking-tight">
          Upload your electricity dataset
        </h1>
        <p className="mt-2 text-muted-foreground">
          Drop a CEA-format .csv, .xlsx or .xls file. We'll clean, validate and analyze it
          automatically.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className={`mt-8 relative rounded-3xl border-2 border-dashed transition-all duration-300 p-12 text-center glass ${
          drag ? "border-primary glow scale-[1.01]" : "border-border"
        }`}
        onDragOver={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDrag(false);
          const f = e.dataTransfer.files[0];
          if (f) handleFiles(f);
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".csv,.xlsx,.xls"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFiles(f);
          }}
        />
        <motion.div
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="mx-auto h-16 w-16 rounded-2xl bg-primary/15 grid place-items-center glow mb-4"
        >
          <UploadCloud className="h-7 w-7 text-primary" />
        </motion.div>
        <h3 className="font-display text-xl font-semibold">
          Drag & drop your file here
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          or click to browse · Max 50MB · .csv .xlsx .xls
        </p>
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-2">
          <Button onClick={() => inputRef.current?.click()} disabled={busy} className="glow">
            <UploadCloud className="mr-2 h-4 w-4" /> Select file
          </Button>
          <Button
            variant="secondary"
            disabled={busy}
            onClick={() => {
              const ds = generateMockDataset("demo-cea-2024.xlsx");
              setDataset(ds);
              toast.success("Loaded demo dataset");
              nav({ to: "/processing" });
            }}
          >
            <Sparkles className="mr-2 h-4 w-4" /> Use demo dataset
          </Button>
        </div>

        {file && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-8 mx-auto max-w-md rounded-xl bg-secondary/50 p-4 text-left"
          >
            <div className="flex items-center gap-3">
              <FileSpreadsheet className="h-6 w-6 text-primary shrink-0" />
              <div className="min-w-0 flex-1">
                <div className="font-medium truncate">{file.name}</div>
                <div className="text-xs text-muted-foreground">
                  {(file.size / 1024).toFixed(1)} KB
                </div>
              </div>
              {progress === 100 && (
                <CheckCircle2 className="h-5 w-5 text-emerald-400" />
              )}
            </div>
            <div className="mt-3 h-1.5 rounded-full bg-border overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-primary to-accent"
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
            <div className="mt-1 text-[10px] font-mono text-muted-foreground text-right">
              {progress}%
            </div>
          </motion.div>
        )}
      </motion.div>

      <div className="mt-8 grid gap-3 sm:grid-cols-3 text-sm">
        {[
          { t: "Schema-flexible", d: "State, date, demand, generation, solar, wind, hydro, thermal." },
          { t: "Auto-cleaning", d: "Missing values imputed, outliers flagged." },
          { t: "Secure", d: "Data stays in your session. Never shared." },
        ].map((x) => (
          <div key={x.t} className="glass rounded-xl p-4">
            <div className="font-medium">{x.t}</div>
            <div className="text-muted-foreground mt-1">{x.d}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
