import { NavLink, useLocation } from "react-router";
import {
  LayoutGrid, Target, Sparkles, PiggyBank, TrendingUp,
  LineChart, Wallet, Lightbulb, Leaf, BookOpen,
} from "lucide-react";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar,
} from "./ui/sidebar";

const items = [
  { title: "Dashboard", url: "/", icon: LayoutGrid },
  { title: "My Plan", url: "/my-plan", icon: Target },
  { title: "Personal Finance", url: "/personal-finance", icon: Sparkles },
  { title: "Savings", url: "/savings", icon: PiggyBank },
  { title: "Investments", url: "/investments", icon: TrendingUp },
  { title: "SIP / SWP", url: "/sip-swp", icon: LineChart },
  { title: "Budget", url: "/budget", icon: Wallet },
  { title: "Income Tax", url: "/tax", icon: Lightbulb },
  { title: "Retirement", url: "/retirement", icon: Leaf },
  { title: "Resources", url: "/resources", icon: BookOpen },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { pathname } = useLocation();

  return (
    <Sidebar collapsible="icon" className="border-r hairline">
      <SidebarContent className="bg-sidebar">
        <div className="px-4 pt-5 pb-3 flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-foreground text-background flex items-center justify-center text-[11px] font-semibold shrink-0">SF</div>
            {!collapsed && (
              <div className="min-w-0">
                <p className="text-sm font-semibold tracking-tight truncate">Smart Finance</p>
                <p className="text-[11px] text-muted-foreground truncate">AI Advisor</p>
              </div>
            )}
          </div>
          <SidebarTrigger className={collapsed ? "hidden" : "h-7 w-7 text-gray-400 hover:text-foreground"} />
        </div>

        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const isActive = item.url === "/" ? pathname === "/" : pathname.startsWith(item.url);
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild className="rounded-lg">
                      <NavLink
                        to={item.url}
                        end={item.url === "/"}
                        className={`flex items-center gap-3 px-3 py-2 text-[13.5px] transition-colors ${
                          isActive
                            ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                            : "text-sidebar-foreground hover:bg-sidebar-accent/60"
                        }`}
                      >
                        <item.icon className="w-4 h-4 shrink-0" strokeWidth={2} />
                        {!collapsed && <span className="truncate">{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
