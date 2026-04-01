import { useState } from "react";
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

  const handleCalculate = () => {
    if (income) setShowResults(true);
  };

  const monthlyIncome = (parseInt(income) || 0) / 12;
  const recommendedSavings = monthlyIncome * 0.2;
  const emergencyFund = monthlyIncome * 6;
  
  const riskLevel = riskAppetite === "low" ? "Conservative" : riskAppetite === "moderate" ? "Moderate" : "Aggressive";
  
  const savingsAllocation = riskLevel === "Conservative" 
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
      <Card className="border-none shadow-lg bg-white/80 backdrop-blur">
        <CardHeader>
          <CardTitle>Your Savings Profile</CardTitle>
          <CardDescription>Tell us about your income and savings goals</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="annual-income">Annual Income (₹)</Label>
            <Input
              id="annual-income"
              type="number"
              placeholder="e.g., 800000"
              value={income}
              onChange={(e) => setIncome(e.target.value)}
              className="text-lg"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="current-savings">Current Savings (₹)</Label>
            <Input
              id="current-savings"
              type="number"
              placeholder="e.g., 50000"
              value={currentSavings}
              onChange={(e) => setCurrentSavings(e.target.value)}
              className="text-lg"
            />
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <Label>Select Your Risk Profile</Label>
              <span className="text-sm font-semibold px-3 py-1 rounded-full bg-emerald-100 text-emerald-700">
                {riskLevel}
              </span>
            </div>
            <RiskProfileSelector
              selectedRisk={riskAppetite}
              onSelect={setRiskAppetite}
            />
          </div>

          <Button onClick={handleCalculate} className="w-full bg-gradient-to-r from-emerald-500 to-teal-600">
            Generate Savings Plan
          </Button>
        </CardContent>
      </Card>

      {/* Results */}
      {showResults && (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-none shadow-lg bg-white/80 backdrop-blur">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-emerald-600" />
                  </div>
                  <p className="text-sm text-gray-600">Recommended Monthly Savings</p>
                </div>
                <p className="text-3xl font-bold text-gray-900">₹{recommendedSavings.toLocaleString()}</p>
                <p className="text-sm text-gray-600 mt-1">20% of monthly income</p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg bg-white/80 backdrop-blur">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                    <Shield className="w-5 h-5 text-blue-600" />
                  </div>
                  <p className="text-sm text-gray-600">Emergency Fund Target</p>
                </div>
                <p className="text-3xl font-bold text-gray-900">₹{emergencyFund.toLocaleString()}</p>
                <p className="text-sm text-gray-600 mt-1">6 months of expenses</p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg bg-white/80 backdrop-blur">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                    <PiggyBank className="w-5 h-5 text-purple-600" />
                  </div>
                  <p className="text-sm text-gray-600">Current Savings</p>
                </div>
                <p className="text-3xl font-bold text-gray-900">₹{(parseInt(currentSavings) || 0).toLocaleString()}</p>
                <p className="text-sm text-gray-600 mt-1">
                  {emergencyFund > 0 ? Math.round(((parseInt(currentSavings) || 0) / emergencyFund) * 100) : 0}% of target
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Allocation Chart */}
          <Card className="border-none shadow-lg bg-white/80 backdrop-blur">
            <CardHeader>
              <CardTitle>Recommended Savings Allocation</CardTitle>
              <CardDescription>
                Based on your {riskLevel.toLowerCase()} risk profile
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={savingsAllocation}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {savingsAllocation.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: number) => `${value}%`}
                      contentStyle={{ 
                        backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                        border: 'none', 
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>

                <div className="space-y-4">
                  {savingsAllocation.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg border border-gray-200">
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: item.color }}></div>
                        <span className="font-medium text-gray-900">{item.name}</span>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900">{item.value}%</p>
                        <p className="text-sm text-gray-600">₹{((recommendedSavings * item.value) / 100).toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Savings Tips */}
          <Card className="border-none shadow-lg bg-gradient-to-br from-emerald-50 to-teal-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-emerald-600" />
                Smart Savings Tips
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-4 bg-white rounded-lg">
                <h3 className="font-semibold text-emerald-900 mb-1">Automate Your Savings</h3>
                <p className="text-sm text-gray-600">Set up automatic transfers on salary day to avoid spending temptation.</p>
              </div>
              <div className="p-4 bg-white rounded-lg">
                <h3 className="font-semibold text-emerald-900 mb-1">Maintain Liquidity</h3>
                <p className="text-sm text-gray-600">Keep 3 months of expenses in a liquid fund for immediate emergencies.</p>
              </div>
              <div className="p-4 bg-white rounded-lg">
                <h3 className="font-semibold text-emerald-900 mb-1">Review Quarterly</h3>
                <p className="text-sm text-gray-600">Reassess your allocation every 3 months as income and goals change.</p>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}