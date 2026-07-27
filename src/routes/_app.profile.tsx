import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { useCurrentUser, useProfile, useUpdateProfile } from "@/lib/profile";

export const Route = createFileRoute("/_app/profile")({
  component: ProfilePage,
  head: () => ({
    meta: [
      { title: "Your Profile — GridSense AI" },
      { name: "description", content: "Manage your GridSense AI operator profile, organization and region settings." },
      { property: "og:title", content: "Your Profile — GridSense AI" },
      { property: "og:description", content: "Manage your GridSense AI operator profile, organization and region settings." },
    ],
  }),
});

function ProfilePage() {
  const { data: user } = useCurrentUser();
  const { data: profile, isLoading } = useProfile();
  const update = useUpdateProfile();
  const [form, setForm] = useState({ full_name: "", role: "", organization: "", region: "", timezone: "" });

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

  const save = () =>
    update.mutate(form, {
      onSuccess: () => toast.success("Profile saved"),
      onError: (e) => toast.error(e instanceof Error ? e.message : "Could not save profile"),
    });

  return (
    <div className="mx-auto max-w-3xl px-6 py-8">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-3xl font-semibold tracking-tight">Profile</h1>
        <p className="text-sm text-muted-foreground mt-1">Your operator identity, stored securely in your account.</p>
      </motion.div>

      <div className="glass rounded-2xl p-6 mt-6 space-y-4">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-gradient-to-br from-primary to-accent grid place-items-center text-xl font-semibold text-primary-foreground">
            {(form.full_name || user?.email || "O").slice(0, 1).toUpperCase()}
          </div>
          <div className="min-w-0">
            <div className="font-display text-lg font-semibold truncate">{form.full_name || "Unnamed operator"}</div>
            <div className="text-sm text-muted-foreground truncate">{user?.email ?? user?.phone}</div>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : (
          <>
            <Field label="Full name" value={form.full_name} onChange={(v) => setForm({ ...form, full_name: v })} />
            <Field label="Role" value={form.role} onChange={(v) => setForm({ ...form, role: v })} placeholder="Chief Analyst" />
            <Field
              label="Organization"
              value={form.organization}
              onChange={(v) => setForm({ ...form, organization: v })}
              placeholder="Central Electricity Authority"
            />
            <Field label="Region" value={form.region} onChange={(v) => setForm({ ...form, region: v })} placeholder="India" />
            <Field
              label="Timezone"
              value={form.timezone}
              onChange={(v) => setForm({ ...form, timezone: v })}
              placeholder="Asia/Kolkata (UTC+5:30)"
            />
            <Button className="glow" onClick={save} disabled={update.isPending}>
              {update.isPending ? "Saving…" : "Save changes"}
            </Button>
          </>
        )}
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-[180px_1fr] items-center gap-3">
      <Label className="text-sm text-muted-foreground">{label}</Label>
      <Input value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}
