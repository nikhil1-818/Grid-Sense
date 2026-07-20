import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useData } from "@/lib/data-store";

export const Route = createFileRoute("/_app/settings")({
  component: Settings,
});

function Settings() {
  const { theme, setTheme } = useData();
  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      <motion.h1 initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="font-display text-3xl font-semibold tracking-tight">
        Settings
      </motion.h1>

      <Tabs defaultValue="profile" className="mt-6">
        <TabsList className="glass">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="org">Organization</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="api">API Keys</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="audit">Audit</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="glass rounded-2xl p-6 mt-4 space-y-4">
          <Row label="Full Name"><Input defaultValue="Grid Operator" /></Row>
          <Row label="Email"><Input defaultValue="operator@grid.gov" /></Row>
          <Row label="Role"><Input defaultValue="Chief Analyst" /></Row>
          <Button className="glow">Save changes</Button>
        </TabsContent>

        <TabsContent value="org" className="glass rounded-2xl p-6 mt-4 space-y-4">
          <Row label="Organization"><Input defaultValue="Central Electricity Authority" /></Row>
          <Row label="Region"><Input defaultValue="India" /></Row>
          <Row label="Timezone"><Input defaultValue="Asia/Kolkata (UTC+5:30)" /></Row>
        </TabsContent>

        <TabsContent value="appearance" className="glass rounded-2xl p-6 mt-4 space-y-4">
          <div className="grid grid-cols-3 gap-3">
            {(["dark", "light"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTheme(t)}
                className={`glass rounded-xl p-4 text-left border-2 ${theme === t ? "border-primary" : "border-transparent"}`}
              >
                <div className="text-sm font-medium capitalize">{t} mode</div>
                <div className="mt-3 h-16 rounded-lg" style={{ background: t === "dark" ? "#0f1220" : "#f6f7fb" }} />
              </button>
            ))}
            <div className="glass rounded-xl p-4 border-2 border-transparent">
              <div className="text-sm font-medium">System</div>
              <div className="mt-3 h-16 rounded-lg bg-gradient-to-br from-[#0f1220] to-[#f6f7fb]" />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="notifications" className="glass rounded-2xl p-6 mt-4 space-y-4">
          {["Critical alerts", "Daily digest", "Forecast anomalies", "Weekly reports"].map((n) => (
            <div key={n} className="flex items-center justify-between">
              <div>
                <div className="font-medium">{n}</div>
                <div className="text-xs text-muted-foreground">Email + in-app</div>
              </div>
              <Switch defaultChecked />
            </div>
          ))}
        </TabsContent>

        <TabsContent value="api" className="glass rounded-2xl p-6 mt-4 space-y-3">
          <div className="text-sm text-muted-foreground">API keys let external systems ingest data and pull insights.</div>
          <div className="glass rounded-xl p-3 font-mono text-xs flex items-center justify-between">
            <span>sk_live_••••••••••••••••••••••••ab12</span>
            <Button size="sm" variant="secondary">Rotate</Button>
          </div>
          <Button variant="secondary">+ Create key</Button>
        </TabsContent>

        <TabsContent value="security" className="glass rounded-2xl p-6 mt-4 space-y-4">
          {[
            "Two-factor authentication",
            "SSO (SAML / OIDC)",
            "IP allowlist",
            "Enforce device trust",
          ].map((n) => (
            <div key={n} className="flex items-center justify-between">
              <span>{n}</span>
              <Switch defaultChecked />
            </div>
          ))}
        </TabsContent>

        <TabsContent value="audit" className="glass rounded-2xl p-6 mt-4">
          <div className="divide-y divide-border/60 text-sm">
            {[
              "10:22  · dataset.upload · cea-2024.xlsx",
              "10:23  · pipeline.run   · success in 4.8s",
              "10:31  · report.export  · executive.pdf",
              "11:07  · alert.ack      · high · Maharashtra",
            ].map((l) => (
              <div key={l} className="py-2 font-mono text-xs text-muted-foreground">{l}</div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-[180px_1fr] items-center gap-3">
      <Label className="text-sm text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}
