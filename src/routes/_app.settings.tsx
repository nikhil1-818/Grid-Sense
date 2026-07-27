import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useData } from "@/lib/data-store";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { useCurrentUser, useProfile, useUpdateProfile, type Profile } from "@/lib/profile";

export const Route = createFileRoute("/_app/settings")({
  component: Settings,
  head: () => ({
    meta: [
      { title: "Settings — GridSense AI" },
      { name: "description", content: "Manage your GridSense AI profile, organization, appearance, notifications and security." },
      { property: "og:title", content: "Settings — GridSense AI" },
      { property: "og:description", content: "Manage your GridSense AI profile, organization, appearance, notifications and security." },
    ],
  }),
});

const NOTIFY_FIELDS: Array<{ key: keyof Profile; label: string }> = [
  { key: "notify_critical", label: "Critical alerts" },
  { key: "notify_digest", label: "Daily digest" },
  { key: "notify_anomalies", label: "Forecast anomalies" },
  { key: "notify_weekly", label: "Weekly reports" },
];

function Settings() {
  const { theme, setTheme } = useData();
  const { data: user } = useCurrentUser();
  const { data: profile } = useProfile();
  const update = useUpdateProfile();
  const [form, setForm] = useState({ full_name: "", role: "", organization: "", region: "", timezone: "" });
  const [apiKey, setApiKey] = useState("sk_live_••••••••••••••••••••••••ab12");

  useEffect(() => {
    if (profile) {
      setForm({
        full_name: profile.full_name ?? "",
        role: profile.role ?? "",
        organization: profile.organization ?? "",
        region: profile.region ?? "",
        timezone: profile.timezone ?? "",
      });
    }
  }, [profile]);

  const save = (patch: Partial<Profile>, msg: string) =>
    update.mutate(patch, {
      onSuccess: () => toast.success(msg),
      onError: (e) => toast.error(e instanceof Error ? e.message : "Could not save"),
    });

  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      <motion.h1 initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="font-display text-3xl font-semibold tracking-tight">
        Settings
      </motion.h1>

      <Tabs defaultValue="profile" className="mt-6">
        <TabsList className="glass flex-wrap h-auto">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="org">Organization</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="api">API Keys</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="audit">Audit</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="glass rounded-2xl p-6 mt-4 space-y-4">
          <Row label="Full Name">
            <Input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
          </Row>
          <Row label="Email">
            <Input value={user?.email ?? user?.phone ?? ""} readOnly className="opacity-70" />
          </Row>
          <Row label="Role">
            <Input value={form.role} placeholder="Chief Analyst" onChange={(e) => setForm({ ...form, role: e.target.value })} />
          </Row>
          <Button
            className="glow"
            disabled={update.isPending}
            onClick={() => save({ full_name: form.full_name, role: form.role }, "Profile saved")}
          >
            {update.isPending ? "Saving…" : "Save changes"}
          </Button>
        </TabsContent>

        <TabsContent value="org" className="glass rounded-2xl p-6 mt-4 space-y-4">
          <Row label="Organization">
            <Input
              value={form.organization}
              placeholder="Central Electricity Authority"
              onChange={(e) => setForm({ ...form, organization: e.target.value })}
            />
          </Row>
          <Row label="Region">
            <Input value={form.region} placeholder="India" onChange={(e) => setForm({ ...form, region: e.target.value })} />
          </Row>
          <Row label="Timezone">
            <Input
              value={form.timezone}
              placeholder="Asia/Kolkata (UTC+5:30)"
              onChange={(e) => setForm({ ...form, timezone: e.target.value })}
            />
          </Row>
          <Button
            className="glow"
            disabled={update.isPending}
            onClick={() =>
              save(
                { organization: form.organization, region: form.region, timezone: form.timezone },
                "Organization saved",
              )
            }
          >
            {update.isPending ? "Saving…" : "Save organization"}
          </Button>
        </TabsContent>

        <TabsContent value="appearance" className="glass rounded-2xl p-6 mt-4 space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {(["dark", "light"] as const).map((t) => (
              <button
                key={t}
                onClick={() => {
                  setTheme(t);
                  toast.success(`${t === "dark" ? "Dark" : "Light"} mode enabled`);
                }}
                className={`glass rounded-xl p-4 text-left border-2 ${theme === t ? "border-primary" : "border-transparent"}`}
              >
                <div className="text-sm font-medium capitalize">{t} mode</div>
                <div className="mt-3 h-16 rounded-lg" style={{ background: t === "dark" ? "#0f1220" : "#f6f7fb" }} />
              </button>
            ))}
            <button
              onClick={() => {
                const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
                setTheme(prefersDark ? "dark" : "light");
                toast.success("Following system theme");
              }}
              className="glass rounded-xl p-4 text-left border-2 border-transparent"
            >
              <div className="text-sm font-medium">System</div>
              <div className="mt-3 h-16 rounded-lg bg-gradient-to-br from-[#0f1220] to-[#f6f7fb]" />
            </button>
          </div>
        </TabsContent>

        <TabsContent value="notifications" className="glass rounded-2xl p-6 mt-4 space-y-4">
          {NOTIFY_FIELDS.map((n) => (
            <div key={n.key} className="flex items-center justify-between">
              <div>
                <div className="font-medium">{n.label}</div>
                <div className="text-xs text-muted-foreground">Email + in-app</div>
              </div>
              <Switch
                checked={Boolean(profile?.[n.key] ?? false)}
                onCheckedChange={(v) => save({ [n.key]: v } as Partial<Profile>, `${n.label} ${v ? "enabled" : "disabled"}`)}
              />
            </div>
          ))}
        </TabsContent>

        <TabsContent value="api" className="glass rounded-2xl p-6 mt-4 space-y-3">
          <div className="text-sm text-muted-foreground">API keys let external systems ingest data and pull insights.</div>
          <div className="glass rounded-xl p-3 font-mono text-xs flex items-center justify-between gap-2">
            <span className="truncate">{apiKey}</span>
            <div className="flex gap-2 shrink-0">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  navigator.clipboard.writeText(apiKey);
                  toast.success("API key copied");
                }}
              >
                Copy
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => {
                  setApiKey(`sk_live_${crypto.randomUUID().replace(/-/g, "").slice(0, 24)}`);
                  toast.success("API key rotated");
                }}
              >
                Rotate
              </Button>
            </div>
          </div>
          <Button
            variant="secondary"
            onClick={() => {
              setApiKey(`sk_live_${crypto.randomUUID().replace(/-/g, "").slice(0, 24)}`);
              toast.success("New key created");
            }}
          >
            + Create key
          </Button>
        </TabsContent>

        <TabsContent value="security" className="glass rounded-2xl p-6 mt-4 space-y-4">
          {["Two-factor authentication", "SSO (SAML / OIDC)", "IP allowlist", "Enforce device trust"].map((n) => (
            <div key={n} className="flex items-center justify-between">
              <span>{n}</span>
              <Switch defaultChecked onCheckedChange={(v) => toast.success(`${n} ${v ? "enabled" : "disabled"}`)} />
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
