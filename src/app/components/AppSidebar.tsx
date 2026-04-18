import { NavLink, useLocation } from "react-router";
import {
  LayoutGrid, Target, Sparkles, PiggyBank, TrendingUp,
  LineChart, Wallet, Lightbulb, Leaf, BookOpen,
} from "lucide-react";
import { useSidebar, SidebarTrigger } from "./ui/sidebar";

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
    <aside 
      className={`h-screen bg-white border-r hairline flex flex-col transition-all duration-300 ease-in-out shrink-0 ${
        collapsed ? "w-16" : "w-64"
      }`}
    >
      {/* Sidebar Header */}
      <div className="px-3 pt-6 pb-4 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-gray-900 text-white flex items-center justify-center text-[10px] font-bold shrink-0">SF</div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="text-sm font-bold tracking-tight truncate text-gray-900">Smart Finance</p>
              <p className="text-[10px] text-gray-400 font-medium truncate uppercase tracking-wider">AI Advisor</p>
            </div>
          )}
        </div>
        <SidebarTrigger className="h-7 w-7 text-gray-400 hover:text-gray-900 transition-colors" />
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-2 py-2 space-y-1">
        {items.map((item) => {
          const isActive = item.url === "/" ? pathname === "/" : pathname.startsWith(item.url);
          return (
            <NavLink
              key={item.title}
              to={item.url}
              end={item.url === "/"}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 ${
                isActive
                  ? "bg-gray-100 text-gray-900 font-medium"
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <item.icon className={`w-4 h-4 shrink-0 ${isActive ? "text-gray-900" : ""}`} strokeWidth={2} />
              {!collapsed && <span className="text-[13.5px] truncate">{item.title}</span>}
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}
