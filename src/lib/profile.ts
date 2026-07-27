import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type Profile = {
  id: string;
  full_name: string | null;
  email: string | null;
  role: string | null;
  organization: string | null;
  region: string | null;
  timezone: string | null;
  notify_critical: boolean;
  notify_digest: boolean;
  notify_anomalies: boolean;
  notify_weekly: boolean;
};

export function useCurrentUser() {
  return useQuery({
    queryKey: ["auth-user"],
    queryFn: async () => {
      const { data } = await supabase.auth.getUser();
      return data.user ?? null;
    },
    staleTime: 60_000,
  });
}

export function useProfile() {
  const { data: user } = useCurrentUser();
  return useQuery({
    queryKey: ["profile", user?.id],
    enabled: !!user?.id,
    queryFn: async (): Promise<Profile | null> => {
      if (!user) return null;
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();
      if (error) throw error;
      if (data) return data as Profile;
      const { data: created, error: insErr } = await supabase
        .from("profiles")
        .insert({ id: user.id, email: user.email ?? null })
        .select("*")
        .single();
      if (insErr) throw insErr;
      return created as Profile;
    },
  });
}

export function useUpdateProfile() {
  const qc = useQueryClient();
  const { data: user } = useCurrentUser();
  return useMutation({
    mutationFn: async (patch: Partial<Profile>) => {
      if (!user) throw new Error("Not signed in");
      const { data, error } = await supabase
        .from("profiles")
        .update(patch)
        .eq("id", user.id)
        .select("*")
        .single();
      if (error) throw error;
      return data as Profile;
    },
    onSuccess: (data) => {
      qc.setQueryData(["profile", user?.id], data);
    },
  });
}

export type AppNotification = {
  id: string;
  title: string;
  body: string | null;
  severity: string;
  link: string | null;
  read_at: string | null;
  created_at: string;
};

export function useNotifications() {
  const { data: user } = useCurrentUser();
  return useQuery({
    queryKey: ["notifications", user?.id],
    enabled: !!user?.id,
    queryFn: async (): Promise<AppNotification[]> => {
      const { data, error } = await supabase
        .from("notifications")
        .select("id,title,body,severity,link,read_at,created_at")
        .order("created_at", { ascending: false })
        .limit(30);
      if (error) throw error;
      return (data ?? []) as AppNotification[];
    },
  });
}

export function useMarkNotifications() {
  const qc = useQueryClient();
  const { data: user } = useCurrentUser();
  return useMutation({
    mutationFn: async (ids: string[] | "all") => {
      if (!user) throw new Error("Not signed in");
      let q = supabase.from("notifications").update({ read_at: new Date().toISOString() }).eq("user_id", user.id);
      if (ids !== "all") q = q.in("id", ids);
      const { error } = await q.is("read_at", null);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications", user?.id] }),
  });
}

export function useSupportRequests() {
  const { data: user } = useCurrentUser();
  return useQuery({
    queryKey: ["support-requests", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("support_requests")
        .select("id,topic,subject,message,status,created_at")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useCreateSupportRequest() {
  const qc = useQueryClient();
  const { data: user } = useCurrentUser();
  return useMutation({
    mutationFn: async (input: { topic: string; subject: string; message: string }) => {
      if (!user) throw new Error("Not signed in");
      const { error } = await supabase.from("support_requests").insert({ ...input, user_id: user.id });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["support-requests", user?.id] }),
  });
}
