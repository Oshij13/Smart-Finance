import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Target, Home, GraduationCap, Car, Plane, TrendingUp } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Progress } from "../components/ui/progress";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export function GoalPlanning() {
  const [selectedGoal, setSelectedGoal] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [years, setYears] = useState("");
  const [currentSavings, setCurrentSavings] = useState("");
  const [income, setIncome] = useState("");
  const [showResults, setShowResults] = useState(false);

  const handleCalculate = () => {
    if (selectedGoal && targetAmount && years && income) {
      setShowResults(true);
    }
  };

  const target = parseInt(targetAmount) || 0;
  const timeframeYears = parseInt(years) || 1;
  const current = parseInt(currentSavings) || 0;
  const monthlyIncome = parseInt(income) || 0;
  const months = timeframeYears * 12;

  // Calculate required monthly SIP assuming 12% annual return
  const monthlyRate = 0.12 / 12;
  const requiredMonthly = Math.round(
    ((target - current * Math.pow(1.12, timeframeYears)) * monthlyRate) / 
    (Math.pow(1 + monthlyRate, months) - 1)
  );

  const percentageOfIncome = ((requiredMonthly / monthlyIncome) * 100).toFixed(1);
  const currentProgress = ((current / target) * 100).toFixed(1);

  // Projection data
  const projectionData = Array.from({ length: timeframeYears + 1 }, (_, i) => {
    const year = i;
    const futureValueOfCurrent = current * Math.pow(1.12, year);
    const futureValueOfSIP = requiredMonthly * ((Math.pow(1 + monthlyRate, 12 * year) - 1) / monthlyRate);
    return {
      year,
      total: Math.round(futureValueOfCurrent + futureValueOfSIP),
      target: target,
    };
  });

  const goals = [
    { value: "home", label: "Home Purchase", icon: <Home className="w-5 h-5 mb-1" /> },
    { value: "education", label: "Child's Education", icon: <GraduationCap className="w-5 h-5 mb-1" /> },
    { value: "car", label: "Car Purchase", icon: <Car className="w-5 h-5 mb-1" /> },
    { value: "vacation", label: "Dream Vacation", icon: <Plane className="w-5 h-5 mb-1" /> },
    { value: "retirement", label: "Retirement Corpus", icon: <TrendingUp className="w-5 h-5 mb-1" /> },
    { value: "custom", label: "Custom Goal", icon: <Target className="w-5 h-5 mb-1" /> },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="w-full px-6 lg:px-10 py-12 space-y-12">

        {/* HEADER */}
        <section className="space-y-2">
          <p className="text-sm text-muted-foreground">My Plan</p>

          <h1 className="text-4xl font-semibold tracking-tight">
            Goal-based planning
          </h1>

          <p className="text-muted-foreground text-base max-w-xl">
            Pick a life goal and we’ll map a calm, monthly path to reach it.
          </p>
        </section>

        {/* GOAL SELECTION */}
        <section>
          <h2 className="text-xs uppercase text-muted-foreground font-bold tracking-widest mb-4">
            Choose a goal
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {goals.map((goalItem) => {
              const isSelected = selectedGoal === goalItem.value;

              return (
                <div
                  key={goalItem.value}
                  onClick={() => setSelectedGoal(goalItem.value)}
                  className={`rounded-2xl border p-6 cursor-pointer transition-all flex flex-col items-start gap-2
                    ${isSelected
                      ? "border-primary bg-primary/5"
                      : "border-border hover:bg-muted/40"}
                  `}
                >
                  <div className={`${isSelected ? 'text-primary' : 'text-muted-foreground'}`}>
                    {goalItem.icon}
                  </div>
                  <p className="text-sm font-medium">
                    {goalItem.label}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* DETAILS */}
        <section>
          <div className="flex justify-between items-end mb-4">
            <h2 className="text-xs uppercase text-muted-foreground font-bold tracking-widest">
              Details
            </h2>
            {selectedGoal && target > 0 && (
              <p className="text-[10px] text-muted-foreground uppercase tracking-tight animate-in fade-in">
                Current progress: {currentProgress}%
              </p>
            )}
          </div>

          <div className="rounded-2xl border hairline bg-card p-6 space-y-6">
            {/* PROGRESS BAR (Only if goal set) */}
            {selectedGoal && target > 0 && (
              <div className="space-y-2 pb-2">
                <div className="w-full bg-muted h-1 rounded-full overflow-hidden">
                  <div 
                    className="bg-primary h-full rounded-full transition-all duration-1000" 
                    style={{ width: `${Math.min(Number(currentProgress), 100)}%` }}
                  />
                </div>
              </div>
            )}

            {/* ROW 1 */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground font-medium">
                  Target Amount (₹)
                </label>
                <input
                  value={targetAmount}
                  onChange={(e) => setTargetAmount(e.target.value)}
                  placeholder="e.g. 2,00,000"
                  className="w-full px-4 py-3 rounded-xl border hairline bg-background text-sm focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm text-muted-foreground font-medium">
                  Timeframe (Years)
                </label>
                <input
                  value={years}
                  onChange={(e) => setYears(e.target.value)}
                  placeholder="e.g. 5"
                  className="w-full px-4 py-3 rounded-xl border hairline bg-background text-sm focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                />
              </div>
            </div>

            {/* ROW 2 */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground font-medium">
                  Current Savings (₹)
                </label>
                <input
                  value={currentSavings}
                  onChange={(e) => setCurrentSavings(e.target.value)}
                  placeholder="e.g. 1,00,000"
                  className="w-full px-4 py-3 rounded-xl border hairline bg-background text-sm focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm text-muted-foreground font-medium">
                  Monthly Income (₹)
                </label>
                <input
                  value={income}
                  onChange={(e) => setIncome(e.target.value)}
                  placeholder="e.g. 50,000"
                  className="w-full px-4 py-3 rounded-xl border hairline bg-background text-sm focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                />
              </div>
            </div>

            {/* CTA */}
            <div className="flex justify-end pt-2">
              <button
                onClick={handleCalculate}
                className="px-6 py-3 rounded-full bg-primary text-white text-sm font-medium hover:opacity-90 transition shadow-sm"
              >
                Calculate
              </button>
            </div>
          </div>
        </section>

        {/* RESULTS */}
        {showResults && target > 0 && (
          <section className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
            <h2 className="text-xs uppercase text-muted-foreground font-bold tracking-widest">
              YOUR PLAN
            </h2>

            <div className="rounded-2xl border hairline bg-card p-10 space-y-4">
              <p className="text-sm text-muted-foreground">
                To reach ₹{target.toLocaleString('en-IN')}, save
              </p>
              
              <p className="text-6xl font-bold text-foreground">
                ₹{requiredMonthly.toLocaleString('en-IN')}
              </p>

              <p className="text-sm text-muted-foreground">
                per month at an assumed 12% annual return.
              </p>
            </div>

            {/* CHART */}
            <div className="rounded-2xl border hairline bg-card p-6 space-y-4">
              <div className="flex justify-between items-center px-2">
                <h3 className="text-sm text-muted-foreground font-medium uppercase tracking-widest text-[10px]">Goal Growth Projection</h3>
                <div className="flex items-center gap-4 text-[10px] uppercase font-bold tracking-tight">
                  <div className="flex items-center gap-1.5 text-primary">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                    <span>Savings Path</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <div className="w-2 h-1 border-t-2 border-dashed border-muted-foreground" />
                    <span>Target</span>
                  </div>
                </div>
              </div>

              <div className="h-[300px] w-full pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={projectionData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <Tooltip 
                      cursor={{ stroke: 'hsl(var(--muted-foreground))', strokeWidth: 1, strokeDasharray: '4 4' }}
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))', 
                        borderRadius: '0.75rem',
                        fontSize: '11px',
                        fontWeight: '500',
                        boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
                      }}
                      formatter={(val: number) => [`₹${val.toLocaleString('en-IN')}`]}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="total" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={3} 
                      dot={false}
                      activeDot={{ r: 5, fill: 'hsl(var(--primary))', strokeWidth: 2, stroke: 'white' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="target" 
                      stroke="hsl(var(--muted-foreground))" 
                      strokeWidth={1} 
                      strokeDasharray="5 5" 
                      dot={false}
                    />
                    <XAxis 
                      dataKey="year" 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10, fontWeight: 500 }}
                      dy={10}
                    />
                    <YAxis 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10, fontWeight: 500 }}
                      tickFormatter={(val) => `₹${(val / 100000).toFixed(0)}L`}
                      dx={-10}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* ACTION STEPS */}
            <div className="space-y-4">
              <h2 className="text-xs uppercase text-muted-foreground font-bold tracking-widest mt-4 px-1">
                Recommendation Steps
              </h2>

              <div className="rounded-2xl border hairline bg-card divide-y hairline overflow-hidden">
                {[
                  { title: "Set Up Automatic SIP", desc: `Start a monthly SIP of ₹${requiredMonthly.toLocaleString('en-IN')} in index funds or equity mutual funds.`, color: "bg-blue-500" },
                  { title: "Review Quarterly", desc: "Check your progress every 3 months and increase SIP with salary increments.", color: "bg-purple-500" },
                  { title: "Stay Invested", desc: "Don't panic during market corrections. Stay focused on your long-term goal.", color: "bg-indigo-500" },
                  { title: "Bonus Investments", desc: "Use bonuses or windfall gains to make lump sum investments toward your goal.", color: "bg-cyan-500" }
                ].map((step, i) => (
                  <div key={i} className="px-6 py-5 flex items-start gap-5 hover:bg-muted/30 transition-colors group">
                    <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${step.color} shadow-[0_0_8px_rgba(0,0,0,0.1)] group-hover:scale-125 transition-transform`} />
                    <div className="space-y-1">
                      <h4 className="text-sm font-semibold text-foreground">{step.title}</h4>
                      <p className="text-xs text-muted-foreground leading-relaxed">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

      </div>
    </div>
  );
}
