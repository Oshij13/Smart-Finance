import { createBrowserRouter } from "react-router";
import { DashboardLayout } from "./components/DashboardLayout";
import { DashboardHome } from "./pages/DashboardHome";
import { PersonalFinance } from "./pages/PersonalFinance";
import { SavingsManagement } from "./pages/SavingsManagement";
import { InvestmentOptions } from "./pages/InvestmentOptions";
import { GoalPlanning } from "./pages/GoalPlanning";
import { TaxCalculator } from "./pages/TaxCalculator";
import { SpendingReduction } from "./pages/SpendingReduction";
import { RetirementPlanning } from "./pages/RetirementPlanning";
import { Resources } from "./pages/Resources";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: DashboardLayout,
    children: [
      { index: true, Component: DashboardHome },
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
