import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { PiggyBank, Shield, TrendingUp, AlertCircle } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { RiskProfileSelector } from "../components/RiskProfileSelector";

export function SavingsManagement() {
  const [income, setIncome] = useState("");
  const [currentSavings, setCurrentSavings] = useState("");
  const [riskAppetite, setRiskAppetite] = useState<"low" | "moderate" | "high">("moderate");
  const [showResults, setShowResults] = useState(false);

  // ✅ Auto-fill income from onboarding (localStorage)
  useEffect(() => {
    const onboardingData = localStorage.getItem("userData");

    if (onboardingData) {
      try {
        const parsed = JSON.parse(onboardingData);

        if (parsed?.income) {
          setIncome(parsed.income.toString());
        }
      } catch (error) {
        console.error("Error parsing onboarding data:", error);
      }
    }
  }, []);

  const handleCalculate = () => {
    if (income) setShowResults(true);
  };

  // ✅ FIXED: Treat income as MONTHLY (no division)
  const monthlyIncome = parseInt(income) || 0;
  const recommendedSavings = monthlyIncome * 0.2;
  const emergencyFund = monthlyIncome * 6;

  const riskLevel =
    riskAppetite === "low"
      ? "Conservative"
      : riskAppetite === "moderate"
        ? "Moderate"
        : "Aggressive";

  const savingsAllocation =
    riskLevel === "Conservative"
      ? [
        { name: "Fixed Deposits", value: 40, color: "#10b981" },
        { name: "Liquid Funds", value: 30, color: "#3b82f6" },
        { name: "Recurring Deposits", value: 20, color: "#8b5cf6" },
        { name: "PPF/EPF", value: 10, color: "#f59e0b" },
      ]
      : riskLevel === "Moderate"
        ? [
          { name: "Hybrid Funds", value: 30, color: "#10b981" },
          { name: "Fixed Deposits", value: 25, color: "#3b82f6" },
          { name: "Liquid Funds", value: 25, color: "#8b5cf6" },
          { name: "Index Funds", value: 20, color: "#f59e0b" },
        ]
        : [
          { name: "Equity Mutual Funds", value: 40, color: "#10b981" },
          { name: "Index Funds", value: 30, color: "#3b82f6" },
          { name: "Hybrid Funds", value: 20, color: "#8b5cf6" },
          { name: "Liquid Funds", value: 10, color: "#f59e0b" },
        ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-8 text-white shadow-xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
            <PiggyBank className="w-6 h-6" />
          </div>
          <h1 className="text-3xl font-bold">Savings Management</h1>
        </div>
        <p className="text-lg text-emerald-50">
          Build your emergency fund and create a smart savings strategy tailored to your goals.
        </p>
      </div>

      {/* Input Form */}
      <div className="space-y-4 max-w-2xl mx-auto py-2 mt-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Monthly Income (₹)</label>
            <input
              type="number"
              placeholder="e.g. 50000"
              value={income}
              onChange={(e) => setIncome(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Current Savings (₹)</label>
            <input
              type="number"
              placeholder="e.g. 20000"
              value={currentSavings}
              onChange={(e) => setCurrentSavings(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        <div className="space-y-3 pt-2">
          <div className="flex justify-between items-center">
            <label className="text-sm font-medium text-gray-700">Select Your Risk Profile</label>
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-100 text-emerald-700">
              {riskLevel}
            </span>
          </div>
          <RiskProfileSelector
            selectedRisk={riskAppetite}
            onSelect={setRiskAppetite}
          />
        </div>

        <button
          onClick={handleCalculate}
          className="px-6 py-2.5 rounded-lg bg-emerald-600 text-white font-medium hover:opacity-90 transition mx-auto block mt-6"
        >
          Generate Savings Plan
        </button>
      </div>

      {/* Results */}
      {showResults && (
        <>
          {/* Key Metrics */}
          <div className="bg-emerald-50 rounded-xl p-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-sm text-emerald-900/70 font-medium">Recommended Monthly Savings</p>
                <p className="text-2xl font-bold text-emerald-700 mt-1">
                  ₹{recommendedSavings.toLocaleString('en-IN')}
                </p>
                <p className="text-xs text-emerald-800/60 mt-1">20% of monthly income</p>
              </div>

              <div>
                <p className="text-sm text-emerald-900/70 font-medium">Emergency Fund Target</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  ₹{emergencyFund.toLocaleString('en-IN')}
                </p>
                <p className="text-xs text-emerald-800/60 mt-1">6 months of income</p>
              </div>

              <div>
                <p className="text-sm text-emerald-900/70 font-medium">Current Savings</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  ₹{(parseInt(currentSavings) || 0).toLocaleString('en-IN')}
                </p>
                <p className="text-xs text-emerald-800/60 mt-1">
                  {emergencyFund > 0
                    ? Math.round(
                      ((parseInt(currentSavings) || 0) / emergencyFund) * 100
                    )
                    : 0}
                  % of target
                </p>
              </div>
            </div>
          </div>

          {/* Allocation Chart */}
          <Card className="border-none shadow-md bg-white mt-4">
            <CardHeader>
              <CardTitle>Recommended Savings Allocation</CardTitle>
              <CardDescription>
                Based on your {riskLevel.toLowerCase()} risk profile
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={savingsAllocation}
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {savingsAllocation.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => `${value}%`} />
                  </PieChart>
                </ResponsiveContainer>

                <div className="space-y-3">
                  {savingsAllocation.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 rounded-xl bg-gray-50 text-sm"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                        <span className="font-semibold text-gray-700">{item.name}</span>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900" style={{ color: item.color }}>{item.value}%</p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          ₹{((recommendedSavings * item.value) / 100).toLocaleString('en-IN')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}