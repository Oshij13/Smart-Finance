import { Outlet, Link, useLocation, useNavigate } from "react-router";
import {
  LayoutDashboard,
  Target,
  Sparkles,
  PiggyBank,
  TrendingUp,
  Lightbulb,
  Wallet,
  Leaf,
  BookOpen,
  Menu,
  X,
  Bell,
  Download,
} from "lucide-react";
import { useState } from "react";
import { Button } from "./ui/button";
import { cn } from "./ui/utils";
import { Badge } from "./ui/badge";
import { getUserData } from "../store/userStore";

import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/" },
  { icon: Target, label: "My Plan", path: "/goals" },
  { icon: Sparkles, label: "Personal Finance", path: "/personal-finance" },
  { icon: PiggyBank, label: "Savings", path: "/savings" },
  { icon: TrendingUp, label: "Investments", path: "/investments" },
  { icon: TrendingUp, label: "SIP/SWP Calculator", path: "/sip-swp" },
  { icon: Wallet, label: "Budget", path: "/spending" },
  { icon: Lightbulb, label: "Income Tax Calculator", path: "/tax-calculator" },
  { icon: Leaf, label: "Retirement", path: "/retirement" },
  { icon: BookOpen, label: "Resources", path: "/resources" },


];

export function DashboardLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const userData = getUserData();
  const userName = userData?.name || "User";

  const getUserInitial = () => {
    return userName.charAt(0).toUpperCase();
  };

  // ✅ GLOBAL PDF DOWNLOAD (works for any page inside layout)
  const handleDownloadPDF = async () => {
    const element = document.getElementById("dashboard-content");
    if (!element) return;

    const canvas = await html2canvas(element, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "mm", "a4");

    const imgWidth = 210;
    const pageHeight = 295;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    pdf.save("SmartFinanceDashboard.pdf");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40">

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-b border-slate-200/60 z-50 shadow-sm">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-slate-900 text-sm">Smart Finance</h1>
              <p className="text-xs text-slate-500">AI Advisor</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon">
              <Bell className="w-5 h-5" />
            </Button>

            {/* ✅ PDF BUTTON (MOBILE) */}
            <Button variant="ghost" size="icon" onClick={handleDownloadPDF}>
              <Download className="w-5 h-5" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? <X /> : <Menu />}
            </Button>
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 h-full bg-white border-r z-40 transition-transform duration-300",
          "lg:translate-x-0 w-64",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo */}
        <div className="p-5 border-b hidden lg:block">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold">Smart Finance</h1>
              <p className="text-xs text-slate-500">AI Advisor</p>
            </div>
          </div>
        </div>

        {/* USER */}
        <div className="p-4 border-b mt-16 lg:mt-0">
          <div className="p-3 rounded-xl bg-blue-50 border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
                {getUserInitial()}
              </div>

              <div>
                <p className="font-semibold text-sm">{userName}</p>
                <Badge className="text-xs mt-1 bg-blue-100 text-blue-700 border-0">
                  Beginner
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* NAV */}
        <nav className="p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl",
                  isActive
                    ? "bg-blue-600 text-white"
                    : "text-slate-600 hover:bg-slate-100"
                )}
              >
                <Icon className="w-5 h-5" />
                <span className="text-sm">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* MAIN */}
      <div className="flex-1 p-6 bg-gray-50 lg:ml-64 min-h-screen pt-16 lg:pt-0">



        <Outlet />
      </div>
    </div>
  );
}