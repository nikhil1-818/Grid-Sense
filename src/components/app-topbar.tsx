import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bell, Command, Moon, Search, Sun, ChevronDown } from "lucide-react";
import { useData } from "@/lib/data-store";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouterState } from "@tanstack/react-router";

export function AppTopbar() {
  const { theme, setTheme, dataset } = useData();
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const crumb = pathname.slice(1) || "dashboard";
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
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search states, insights, forecasts…"
            className="pl-9 pr-16 h-9 bg-secondary/40 border-border/60"
          />
          <kbd className="absolute right-2 top-1/2 -translate-y-1/2 hidden md:inline-flex items-center gap-1 rounded bg-secondary px-1.5 py-0.5 text-[10px] text-muted-foreground font-mono">
            <Command className="h-3 w-3" />K
          </kbd>
        </div>
        <div className="ml-auto flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
          <Button variant="ghost" size="icon" className="h-9 w-9 relative">
            <Bell className="h-4 w-4" />
            <span className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-primary pulse-ring" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-2 h-9">
                <div className="h-6 w-6 rounded-full bg-gradient-to-br from-primary to-accent" />
                <span className="hidden md:inline text-sm">Operator</span>
                <ChevronDown className="h-3.5 w-3.5 opacity-60" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="text-sm">Grid Operator</div>
                <div className="text-xs text-muted-foreground font-normal">
                  {dataset ? dataset.fileName : "No dataset loaded"}
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Profile</DropdownMenuItem>
              <DropdownMenuItem>Organization</DropdownMenuItem>
              <DropdownMenuItem>API keys</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Sign out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
