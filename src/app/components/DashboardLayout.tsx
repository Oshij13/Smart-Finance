import { Outlet, Link, useLocation } from "react-router";
import {
  Bell,
  Download,
  Search,
} from "lucide-react";
import { Button } from "./ui/button";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "./ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { getUserData } from "../store/userStore";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export function DashboardLayout() {
  const location = useLocation();
  const userData = getUserData();
  const userName = userData?.name || "User";

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
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-white">
        <AppSidebar />
        
        <SidebarInset>
          {/* Top Navigation Bar */}
          <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-white/80 backdrop-blur-md px-4 lg:px-6">
            <SidebarTrigger className="-ml-1" />
            
            <div className="flex-1 min-w-0">
              <div className="hidden md:flex items-center text-xs text-muted-foreground gap-2">
                <span>Smart Finance</span>
                <span>/</span>
                <span className="text-foreground font-medium capitalize">
                  {location.pathname === "/" ? "Dashboard" : location.pathname.substring(1).replace("-", " ")}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <input
                  type="search"
                  placeholder="Search insights..."
                  className="pl-9 h-9 w-64 rounded-xl border hairline bg-gray-50/50 text-sm focus:outline-hidden focus:ring-1 focus:ring-primary/20"
                />
              </div>

              <Button variant="ghost" size="icon" onClick={handleDownloadPDF} title="Download Report">
                <Download className="w-5 h-5 text-gray-500" />
              </Button>

              <Button variant="ghost" size="icon">
                <Bell className="w-5 h-5 text-gray-500" />
              </Button>

              <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-[11px] font-bold shadow-xs">
                {userName.charAt(0).toUpperCase()}
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 overflow-y-auto" id="dashboard-content">
            <Outlet />
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}