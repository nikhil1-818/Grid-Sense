import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Bell, Command, Moon, Search, Sun, ChevronDown, LogOut, User, Building2, Check } from "lucide-react";
import { useData } from "@/lib/data-store";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useRouterState, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { byState } from "@/lib/mock-data";
import { useMarkNotifications, useNotifications, useProfile } from "@/lib/profile";
import { syncNotifications } from "@/lib/notify";

const PAGES = [
  { label: "Dashboard", to: "/dashboard" },
  { label: "Upload Dataset", to: "/upload" },
  { label: "Analytics", to: "/analytics" },
  { label: "AI Insights", to: "/insights" },
  { label: "Forecasting", to: "/forecast" },
  { label: "Alerts", to: "/alerts" },
  { label: "Live Dashboard", to: "/live" },
  { label: "Reports", to: "/reports" },
  { label: "Infrastructure", to: "/infrastructure" },
  { label: "Profile", to: "/profile" },
  { label: "Settings", to: "/settings" },
  { label: "Help Center", to: "/help" },
];

export function AppTopbar() {
  const { theme, setTheme, dataset } = useData();
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const crumb = pathname.slice(1) || "dashboard";
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const { data: profile } = useProfile();
  const { data: notifications = [] } = useNotifications();
  const markRead = useMarkNotifications();

  const userLabel = profile?.full_name || profile?.email || "Operator";
  const unread = notifications.filter((n) => !n.read_at).length;

  const states = useMemo(() => (dataset ? byState(dataset.rows) : []), [dataset]);

  useEffect(() => {
    if (!dataset) return;
    syncNotifications(dataset)
      .then(() => queryClient.invalidateQueries({ queryKey: ["notifications"] }))
      .catch(() => {});
  }, [dataset, queryClient]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const handleSignOut = async () => {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    toast.success("Signed out");
    navigate({ to: "/auth", replace: true });
  };

  const go = (to: string) => {
    setOpen(false);
    navigate({ to });
  };

  return (
    <header className="sticky top-0 z-30 h-14 border-b border-border/60 bg-background/60 backdrop-blur-xl">
      <div className="flex h-full items-center gap-3 px-4">
        <SidebarTrigger className="shrink-0" />
        <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground min-w-0">
          <span>GridSense</span>
          <span className="opacity-40">/</span>
          <span className="capitalize text-foreground truncate">{crumb}</span>
        </div>
        <div className="flex-1 max-w-md mx-auto relative hidden sm:block">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="w-full h-9 rounded-md bg-secondary/40 border border-border/60 pl-9 pr-16 text-left text-sm text-muted-foreground relative hover:bg-secondary/60 transition"
          >
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" />
            Search states, pages, insights…
            <kbd className="absolute right-2 top-1/2 -translate-y-1/2 hidden md:inline-flex items-center gap-1 rounded bg-secondary px-1.5 py-0.5 text-[10px] font-mono">
              <Command className="h-3 w-3" />K
            </kbd>
          </button>
        </div>
        <div className="ml-auto flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 sm:hidden"
            onClick={() => setOpen(true)}
            aria-label="Search"
          >
            <Search className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9 relative" aria-label="Notifications">
                <Bell className="h-4 w-4" />
                {unread > 0 && (
                  <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 rounded-full bg-primary text-[10px] font-semibold text-primary-foreground grid place-items-center">
                    {unread > 9 ? "9+" : unread}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 p-0">
              <div className="flex items-center justify-between px-3 py-2 border-b border-border/60">
                <div className="text-sm font-medium">Notifications</div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs"
                  disabled={!unread || markRead.isPending}
                  onClick={() => markRead.mutate("all", { onSuccess: () => toast.success("All marked read") })}
                >
                  <Check className="h-3 w-3 mr-1" /> Mark all read
                </Button>
              </div>
              <ScrollArea className="max-h-80">
                {notifications.length === 0 && (
                  <div className="px-3 py-6 text-sm text-muted-foreground text-center">
                    No notifications yet. Upload a dataset to start monitoring.
                  </div>
                )}
                {notifications.map((n) => (
                  <button
                    key={n.id}
                    onClick={() => {
                      if (!n.read_at) markRead.mutate([n.id]);
                      if (n.link) navigate({ to: n.link });
                    }}
                    className={`w-full text-left px-3 py-2.5 border-b border-border/40 hover:bg-secondary/50 transition ${
                      n.read_at ? "opacity-60" : ""
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <span
                        className={`mt-1.5 h-1.5 w-1.5 rounded-full shrink-0 ${
                          n.severity === "critical"
                            ? "bg-red-500"
                            : n.severity === "high"
                              ? "bg-orange-500"
                              : n.severity === "medium"
                                ? "bg-amber-500"
                                : "bg-primary"
                        }`}
                      />
                      <div className="min-w-0">
                        <div className="text-sm truncate">{n.title}</div>
                        <div className="text-xs text-muted-foreground line-clamp-2">{n.body}</div>
                        <div className="text-[10px] text-muted-foreground mt-0.5">
                          {new Date(n.created_at).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </ScrollArea>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-2 h-9">
                <div className="h-6 w-6 rounded-full bg-gradient-to-br from-primary to-accent" />
                <span className="hidden md:inline text-sm max-w-[140px] truncate">{userLabel}</span>
                <ChevronDown className="h-3.5 w-3.5 opacity-60" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="text-sm truncate">{userLabel}</div>
                <div className="text-xs text-muted-foreground font-normal truncate">
                  {profile?.organization || (dataset ? dataset.fileName : "No dataset loaded")}
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate({ to: "/profile" })}>
                <User className="h-4 w-4 mr-2" /> Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate({ to: "/settings" })}>
                <Building2 className="h-4 w-4 mr-2" /> Organization
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate({ to: "/settings" })}>API keys</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut} className="text-destructive focus:text-destructive">
                <LogOut className="h-4 w-4 mr-2" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Search states, regions or pages…" />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          {states.length > 0 && (
            <CommandGroup heading="States">
              {states.map((s) => (
                <CommandItem
                  key={s.state}
                  value={`${s.state} ${s.region}`}
                  onSelect={() => {
                    setOpen(false);
                    navigate({ to: "/state/$state", params: { state: s.state } });
                  }}
                >
                  <span>{s.state}</span>
                  <span className="ml-auto text-xs text-muted-foreground">
                    {s.region} · {Math.round(s.demand).toLocaleString()} MW
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
          <CommandGroup heading="Pages">
            {PAGES.map((p) => (
              <CommandItem key={p.to} value={p.label} onSelect={() => go(p.to)}>
                {p.label}
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </header>
  );
}
