import { Outlet } from "react-router";
import { SidebarProvider } from "./ui/sidebar";
import { AppSidebar } from "./AppSidebar";

export function DashboardLayout() {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-white relative">
        <AppSidebar />
        <main className="flex-1 overflow-y-auto" id="dashboard-content">
          <Outlet />
        </main>
      </div>
    </SidebarProvider>
  );
}