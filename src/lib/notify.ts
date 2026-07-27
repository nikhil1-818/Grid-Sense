import { supabase } from "@/integrations/supabase/client";
import type { Dataset } from "./data-store";
import { byDate, byState } from "./mock-data";

export type DerivedNotification = {
  key: string;
  title: string;
  body: string;
  severity: "critical" | "high" | "medium" | "info";
  link: string;
};

/** Derive grid notifications from the active dataset (same rules as the Alert Center). */
export function deriveNotifications(dataset: Dataset | null): DerivedNotification[] {
  if (!dataset || !dataset.rows.length) return [];
  const stamp = dataset.uploadedAt.slice(0, 19);
  const states = byState(dataset.rows);
  const daily = byDate(dataset.rows);
  const out: DerivedNotification[] = [];

  for (const st of states.slice(0, 10)) {
    const ratio = st.generation / (st.demand || 1);
    if (ratio < 0.95) {
      out.push({
        key: `${stamp}:deficit:${st.state}`,
        title: `Supply deficit — ${st.state}`,
        body: `Generation at ${(ratio * 100).toFixed(1)}% of demand.`,
        severity: ratio < 0.85 ? "critical" : "high",
        link: "/alerts",
      });
    }
  }

  if (daily.length >= 30) {
    const last = daily[daily.length - 1];
    const window = daily.slice(-30, -1);
    const mean = window.reduce((a, r) => a + r.demand, 0) / window.length;
    const delta = ((last.demand - mean) / mean) * 100;
    if (Math.abs(delta) > 10) {
      out.push({
        key: `${stamp}:spike:${last.date}`,
        title: `Demand ${delta > 0 ? "spike" : "drop"} ${delta.toFixed(1)}%`,
        body: `${last.date}: ${Math.round(last.demand).toLocaleString()} MW vs 30-day mean.`,
        severity: Math.abs(delta) > 20 ? "high" : "medium",
        link: "/alerts",
      });
    }
  }

  const totalGen = states.reduce((a, s) => a + s.generation, 0);
  const totalRen = states.reduce((a, s) => a + s.solar + s.wind + s.hydro, 0);
  const renPct = totalGen ? (totalRen / totalGen) * 100 : 0;
  if (renPct < 25) {
    out.push({
      key: `${stamp}:renewable`,
      title: `Renewable share ${renPct.toFixed(1)}%`,
      body: "System renewable contribution is below the 25% policy target.",
      severity: "medium",
      link: "/analytics",
    });
  }

  out.push({
    key: `${stamp}:dataset`,
    title: `Dataset ready — ${dataset.fileName}`,
    body: `${dataset.rows.length.toLocaleString()} rows across ${states.length} states processed.`,
    severity: "info",
    link: "/dashboard",
  });

  return out.slice(0, 12);
}

/** Persist derived notifications for the signed-in user (deduped by key). */
export async function syncNotifications(dataset: Dataset | null) {
  const derived = deriveNotifications(dataset);
  if (!derived.length) return;
  const { data } = await supabase.auth.getUser();
  const user = data.user;
  if (!user) return;
  await supabase
    .from("notifications")
    .upsert(
      derived.map((n) => ({ ...n, user_id: user.id })),
      { onConflict: "user_id,key", ignoreDuplicates: true },
    );
}
