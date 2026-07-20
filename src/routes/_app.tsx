import { createFileRoute, Outlet } from "@tanstack/react-router";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { AppTopbar } from "@/components/app-topbar";

export const Route = createFileRoute("/_app")({
  component: AppLayout,
});

function AppLayout() {
  return (
    <SidebarProvider defaultOpen>
      <AppSidebar />
      <SidebarInset className="bg-background aurora-bg">
        <AppTopbar />
        <main className="relative min-h-[calc(100vh-3.5rem)]">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
