import { useState, useEffect } from "react";
import { PiggyBank } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { RiskProfileSelector } from "../components/RiskProfileSelector";

export function SavingsManagement() {
  const [income, setIncome] = useState("");
  const [currentSavings, setCurrentSavings] = useState("");
  const [riskAppetite, setRiskAppetite] = useState<"low" | "moderate" | "high">("moderate");
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    const onboardingData = localStorage.getItem("userData");
    if (onboardingData) {
      try {
        const parsed = JSON.parse(onboardingData);
        if (parsed?.income) setIncome(parsed.income.toString());
      } catch (error) {
        console.error("Error parsing onboarding data:", error);
      }
    }
  }, []);

  const handleCalculate = () => {
    if (income) setShowResults(true);
  };

  const monthlyIncome = parseInt(income) || 0;
  const recommendedMonthlySavings = Math.round(monthlyIncome * 0.2);
  const emergencyFundTarget = monthlyIncome * 6;
  const currentSavingsValue = parseInt(currentSavings) || 0;
  const progressPercent = emergencyFundTarget > 0 
    ? Math.round((currentSavingsValue / emergencyFundTarget) * 100) 
    : 0;

  const riskLevelLabel =
    riskAppetite === "low" ? "Low Risk" : riskAppetite === "moderate" ? "Medium Risk" : "High Risk";

  const savingsAllocation =
    riskAppetite === "low"
      ? [
        { name: "Fixed Deposits", value: 40, color: "#10b981" },
        { name: "Liquid Funds", value: 30, color: "#3b82f6" },
        { name: "Recurring Deposits", value: 20, color: "#8b5cf6" },
        { name: "PPF/EPF", value: 10, color: "#f59e0b" },
      ]
      : riskAppetite === "moderate"
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
    <div className="min-h-screen bg-background text-foreground">
      <div className="w-full px-6 lg:px-10 py-12 space-y-12">

        {/* HEADER */}
        <section className="space-y-2">
          <p className="text-sm text-muted-foreground">Savings</p>
          <h1 className="text-4xl font-semibold tracking-tight leading-tight">
            A smart savings strategy
          </h1>
          <p className="text-muted-foreground text-base max-w-xl">
            Build your emergency fund and grow what's left over.
          </p>
        </section>

        {/* INPUT SECTION */}
        <section className="space-y-4">
          <h2 className="text-xs uppercase text-muted-foreground font-bold tracking-widest">
            Your Numbers
          </h2>

          <div className="rounded-2xl border hairline bg-card p-8 space-y-8">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-tight">Monthly Income (₹)</label>
                <input
                  type="number"
                  placeholder="e.g. 50,000"
                  value={income}
                  onChange={(e) => setIncome(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border hairline bg-background text-sm focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                />
              </div>

              <div className="space-y-3">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-tight">Current Savings (₹)</label>
                <input
                  type="number"
                  placeholder="e.g. 20,000"
                  value={currentSavings}
                  onChange={(e) => setCurrentSavings(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border hairline bg-background text-sm focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                />
              </div>
            </div>

            <div className="space-y-5">
              <div className="flex justify-between items-center">
                <h3 className="text-xs uppercase text-muted-foreground font-bold tracking-widest">Select Risk Profile</h3>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100">
                  {riskAppetite === "moderate" ? "Moderate" : riskAppetite}
                </span>
              </div>
              <RiskProfileSelector
                selectedRisk={riskAppetite}
                onSelect={setRiskAppetite}
              />
            </div>

            <button
              onClick={handleCalculate}
              className="px-6 py-3 rounded-full bg-primary text-white text-sm font-medium hover:opacity-90 transition shadow-sm"
            >
              Generate Savings Plan
            </button>
          </div>
        </section>

        {/* RESULTS */}
        {showResults && (
          <section className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
            <div className="grid md:grid-cols-3 gap-4">
              {/* RECOMMENDED SAVINGS */}
              <div className="rounded-2xl border hairline bg-card p-6 flex flex-col justify-between min-h-[140px] border-emerald-100 bg-emerald-50/30">
                <p className="text-sm text-emerald-800/70 font-medium">Recommended Monthly Savings</p>
                <div className="space-y-1">
                  <p className="text-3xl font-bold text-emerald-600">
                    ₹{recommendedMonthlySavings.toLocaleString('en-IN')}
                  </p>
                  <p className="text-[10px] text-emerald-600/60 uppercase font-bold tracking-tight">20% of monthly income</p>
                </div>
              </div>

              {/* EMERGENCY FUND TARGET */}
              <div className="rounded-2xl border hairline bg-card p-6 flex flex-col justify-between min-h-[140px]">
                <p className="text-sm text-muted-foreground font-medium">Emergency Fund Target</p>
                <div className="space-y-1">
                  <p className="text-3xl font-bold text-foreground">
                    ₹{emergencyFundTarget.toLocaleString('en-IN')}
                  </p>
                  <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight">6 months of income</p>
                </div>
              </div>

              {/* CURRENT STATUS */}
              <div className="rounded-2xl border hairline bg-card p-6 flex flex-col justify-between min-h-[140px]">
                <p className="text-sm text-muted-foreground font-medium">Current Savings</p>
                <div className="space-y-1">
                  <p className="text-3xl font-bold text-foreground">
                    ₹{currentSavingsValue.toLocaleString('en-IN')}
                  </p>
                  <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight">{progressPercent}% of emergency target</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border hairline bg-card p-8 space-y-8">
              <div className="space-y-1">
                <h3 className="text-sm font-semibold">Recommended Savings Allocation</h3>
                <p className="text-xs text-muted-foreground">Based on your {riskAppetite} risk profile</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div className="h-[260px] w-full flex items-center justify-center relative">
                   <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={savingsAllocation}
                        cx="50%"
                        cy="50%"
                        innerRadius={65}
                        outerRadius={95}
                        paddingAngle={4}
                        dataKey="value"
                        animationBegin={200}
                        animationDuration={1000}
                      >
                        {savingsAllocation.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} fillOpacity={0.8} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))', 
                          border: '1px solid hsl(var(--border))', 
                          borderRadius: '0.75rem',
                          fontSize: '11px',
                          fontWeight: '600'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  {/* CENTER TEXT FOR DONUT */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-1">
                    <p className="text-[10px] uppercase text-muted-foreground font-bold tracking-widest">Saved</p>
                    <p className="text-lg font-bold">100%</p>
                  </div>
                </div>

                <div className="grid gap-3">
                  {savingsAllocation.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 rounded-xl border hairline bg-muted/20 hover:bg-muted/40 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></div>
                        <span className="text-sm font-semibold text-foreground">{item.name}</span>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold" style={{ color: item.color }}>{item.value}%</p>
                        <p className="text-[10px] text-muted-foreground font-bold tracking-tight">
                          ₹{Math.round((recommendedMonthlySavings * item.value) / 100).toLocaleString('en-IN')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

      </div>
    </div>
  );
}