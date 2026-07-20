import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Upload,
  BarChart3,
  BrainCircuit,
  TrendingUp,
  Bell,
  Radio,
  FileText,
  ServerCog,
  Settings,
  HelpCircle,
  Zap,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const primary = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Upload Dataset", url: "/upload", icon: Upload },
  { title: "Analytics", url: "/analytics", icon: BarChart3 },
  { title: "AI Insights", url: "/insights", icon: BrainCircuit },
  { title: "Forecasting", url: "/forecast", icon: TrendingUp },
  { title: "Alerts", url: "/alerts", icon: Bell },
  { title: "Live Dashboard", url: "/live", icon: Radio },
];

const secondary = [
  { title: "Reports", url: "/reports", icon: FileText },
  { title: "Infrastructure", url: "/infrastructure", icon: ServerCog },
  { title: "Settings", url: "/settings", icon: Settings },
  { title: "Help Center", url: "/help", icon: HelpCircle },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const isActive = (url: string) => pathname === url || pathname.startsWith(url + "/");

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="p-3">
        <Link to="/" className="flex items-center gap-2 px-2 py-1">
          <div className="h-8 w-8 rounded-lg bg-primary/15 grid place-items-center glow shrink-0">
            <Zap className="h-4 w-4 text-primary" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <div className="font-display font-semibold text-sm truncate">GridSense.AI</div>
              <div className="text-[10px] text-muted-foreground truncate">Enterprise · v1.0</div>
            </div>
          )}
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Workspace</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {primary.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)} tooltip={item.title}>
                    <Link to={item.url} className="flex items-center gap-2">
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Platform</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {secondary.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)} tooltip={item.title}>
                    <Link to={item.url} className="flex items-center gap-2">
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
