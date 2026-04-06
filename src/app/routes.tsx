import { createBrowserRouter } from "react-router";
import { DashboardLayout } from "./components/DashboardLayout";
import DashboardHome from "./pages/DashboardHome";
import { PersonalFinance } from "./pages/PersonalFinance";
import { SavingsManagement } from "./pages/SavingsManagement";
import { InvestmentOptions } from "./pages/InvestmentOptions";
import { GoalPlanning } from "./pages/GoalPlanning";
import { TaxCalculator } from "./pages/TaxCalculator";
import { SpendingReduction } from "./pages/SpendingReduction";
import { RetirementPlanning } from "./pages/RetirementPlanning";
import { Resources } from "./pages/Resources";
import AdvisorChat from "./components/AdvisorChat";
import FirstAction from "./pages/FirstAction";

export const router = createBrowserRouter([

  // ✅ FIRST ACTION (OUTSIDE DASHBOARD)
  {
    path: "/first-action",
    element: <FirstAction />,
  },

  // ✅ MAIN DASHBOARD LAYOUT
  {
    path: "/",
    element: <DashboardLayout />,
    children: [
      { index: true, element: <DashboardHome /> },
      {
        path: "dashboard",
        element: <DashboardHome />,
      },
      {
        path: "ai-advisor",
        element: <AdvisorChat />,
      },
      { path: "personal-finance", Component: PersonalFinance },
      { path: "savings", Component: SavingsManagement },
      { path: "investments", Component: InvestmentOptions },
      { path: "goals", Component: GoalPlanning },
      { path: "tax-calculator", Component: TaxCalculator },
      { path: "spending", Component: SpendingReduction },
      { path: "retirement", Component: RetirementPlanning },
      { path: "resources", Component: Resources },
    ],
  },

]);