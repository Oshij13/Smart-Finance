import { useState } from "react";
import { TrendingUp, Info, AlertTriangle, Calendar, IndianRupee } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, Cell } from "recharts";

export function InvestmentOptions() {
  const [investmentAmount, setInvestmentAmount] = useState("");
  const [timeHorizon, setTimeHorizon] = useState("");
  const [historyYear, setHistoryYear] = useState("2010");
  const [showResults, setShowResults] = useState(false);
  const [simulationAmount, setSimulationAmount] = useState("10000");

  const calculateReturns = () => {
    if (investmentAmount && timeHorizon) setShowResults(true);
  };

  const amount = parseInt(investmentAmount) || 0;
  const years = parseInt(timeHorizon) || 0;

  const investmentTypes = [
    { name: "Fixed Deposits", risk: "Very Low", returns: 6.5, color: "#10b981", desc: "Safe bank returns", suitability: "Conservative, emergency fund" },
    { name: "Liquid Funds", risk: "Low", returns: 7, color: "#3b82f6", desc: "High liquidity", suitability: "Short-term parking" },
    { name: "Debt Funds", risk: "Low-Mod", returns: 8, color: "#8b5cf6", desc: "Stable bond-based", suitability: "3-5 year goals" },
    { name: "Index Funds", risk: "Moderate", returns: 12, color: "#f59e0b", desc: "Tracks Nifty Index", suitability: "Wealth creation" },
    { name: "Growth Equity", risk: "Mod-High", returns: 14, color: "#ef4444", desc: "Active stock mix", suitability: "Aggressive growth" },
    { name: "Direct Stocks", risk: "High", returns: 16, color: "#ec4899", desc: "Individual shares", suitability: "Experienced only" },
  ];

  const compareData = investmentTypes.map(inv => ({
    name: inv.name,
    finalValue: Math.round(amount * Math.pow(1 + inv.returns / 100, years)),
    returns: inv.returns
  }));

  const growthProjection = Array.from({ length: years + 1 }, (_, i) => ({
    year: i,
    conservative: Math.round(amount * Math.pow(1.07, i)),
    moderate: Math.round(amount * Math.pow(1.12, i)),
    aggressive: Math.round(amount * Math.pow(1.15, i)),
  }));

  // Historical Simulation Logic
  const startYear = parseInt(historyYear);
  const currentYear = new Date().getFullYear();
  const yearsCount = currentYear - startYear;
  const initialSimAmount = parseInt(simulationAmount) || 0;
  const niftyCagr = 0.125; // Nifty 50 average

  const simData = Array.from({ length: yearsCount + 1 }, (_, i) => ({
    year: startYear + i,
    value: Math.round(initialSimAmount * Math.pow(1 + niftyCagr, i)),
  }));

  const finalSimValue = simData[simData.length - 1]?.value || 0;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-5xl px-5 lg:px-8 py-10 space-y-12">

        {/* HEADER */}
        <section className="space-y-2">
          <p className="text-sm text-muted-foreground">Investments</p>
          <h1 className="text-4xl font-semibold tracking-tight leading-tight">
            Explore investment options
          </h1>
          <p className="text-muted-foreground text-base max-w-xl">
            See what time and patience can do for your money.
          </p>
        </section>

        {/* HISTORICAL SIMULATION */}
        <section className="space-y-4">
          <h2 className="text-xs uppercase text-muted-foreground font-bold tracking-widest">
            WHAT IF YOU INVESTED EARLIER?
          </h2>

          <div className="rounded-2xl border hairline bg-card p-8 space-y-8">
            {/* PARAMETERS */}
            <div className="grid md:grid-cols-2 gap-6 pb-6 border-b hairline">
              <div className="space-y-3">
                <label className="text-[10px] items-center gap-1.5 flex font-bold text-muted-foreground uppercase tracking-widest">
                  <IndianRupee className="w-3 h-3" /> Initial Amount
                </label>
                <input
                  type="number"
                  value={simulationAmount}
                  onChange={(e) => setSimulationAmount(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border hairline bg-background text-sm focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                  placeholder="e.g. 10,000"
                />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] items-center gap-1.5 flex font-bold text-muted-foreground uppercase tracking-widest">
                  <Calendar className="w-3 h-3" /> Start Year
                </label>
                <div className="flex gap-2">
                  {["2010", "2016", "2020"].map((year) => (
                    <button
                      key={year}
                      onClick={() => setHistoryYear(year)}
                      className={`flex-1 px-4 py-2 rounded-xl border hairline text-xs font-semibold transition-all ${
                        historyYear === year 
                        ? "bg-primary text-white border-primary" 
                        : "bg-background text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      {year}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* BIG RESULT */}
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground font-medium">
                ₹{initialSimAmount.toLocaleString("en-IN")} invested in {historyYear}
              </p>
              <p className="text-5xl font-bold tracking-tight">
                ₹{finalSimValue.toLocaleString("en-IN")}
              </p>
            </div>

            {/* CHART */}
            <div className="h-[300px] w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={simData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <XAxis 
                    dataKey="year" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11, fontWeight: 500 }}
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11, fontWeight: 500 }}
                    tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}k`}
                    dx={-10}
                  />
                  <Tooltip 
                    cursor={{ stroke: 'hsl(var(--muted-foreground))', strokeWidth: 1, strokeDasharray: '4 4' }}
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))', 
                      borderRadius: '0.75rem',
                      fontSize: '11px',
                      fontWeight: '600'
                    }}
                    formatter={(val: number) => [`₹${val.toLocaleString('en-IN')}`, 'Value']}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={3} 
                    dot={false}
                    activeDot={{ r: 5, fill: 'hsl(var(--primary))', strokeWidth: 2, stroke: 'white' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>

        {/* COMPARISON CALCULATOR */}
        <section className="space-y-4">
          <h2 className="text-xs uppercase text-muted-foreground font-bold tracking-widest px-1">
            Quick Calculator
          </h2>

          <div className="rounded-2xl border hairline bg-card p-8 space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-tight">Investment Amount (₹)</label>
                <input
                  type="number"
                  placeholder="e.g. 100,000"
                  value={investmentAmount}
                  onChange={(e) => setInvestmentAmount(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border hairline bg-background text-sm focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                />
              </div>

              <div className="space-y-3">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-tight">Time Horizon (Years)</label>
                <input
                  type="number"
                  placeholder="e.g. 10"
                  value={timeHorizon}
                  onChange={(e) => setTimeHorizon(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border hairline bg-background text-sm focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                />
              </div>
            </div>

            <button
              onClick={calculateReturns}
              className="px-6 py-3 rounded-full bg-primary text-white text-sm font-medium hover:opacity-90 transition shadow-sm"
            >
              Compare Options
            </button>
          </div>
        </section>

        {/* COMPARISON RESULTS */}
        {showResults && amount > 0 && years > 0 && (
          <section className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="space-y-4">
              <h2 className="text-xs uppercase text-muted-foreground font-bold tracking-widest">Investment Comparison</h2>
              <div className="rounded-2xl border hairline bg-card p-8">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={compareData} margin={{ left: 40 }}>
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false}
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10, fontWeight: 500 }}
                      dy={10}
                    />
                    <YAxis hide />
                    <Tooltip 
                      cursor={{ fill: 'transparent' }}
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '0.75rem', fontSize: '11px' }}
                      formatter={(val: number) => `₹${val.toLocaleString('en-IN')}`}
                    />
                    <Bar dataKey="finalValue" radius={[6, 6, 0, 0]} barSize={40}>
                      {compareData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill="hsl(var(--primary))" fillOpacity={0.8} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="space-y-4 pb-4">
              <h2 className="text-xs uppercase text-muted-foreground font-bold tracking-widest">Growth Projection</h2>
              <div className="rounded-2xl border hairline bg-card p-8">
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={growthProjection}>
                    <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                    <Tooltip contentStyle={{ borderRadius: '0.75rem' }} />
                    <Line type="monotone" dataKey="conservative" stroke="#10b981" strokeWidth={2} dot={false} name="Conservative (7%)" />
                    <Line type="monotone" dataKey="moderate" stroke="#3b82f6" strokeWidth={2} dot={false} name="Moderate (12%)" />
                    <Line type="monotone" dataKey="aggressive" stroke="#ef4444" strokeWidth={2} dot={false} name="Aggressive (15%)" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </section>
        )}

        {/* TABS & DETAILS */}
        <section className="space-y-6">
          <Tabs defaultValue="all" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xs uppercase text-muted-foreground font-bold tracking-widest">Selection Guide</h2>
              <TabsList className="bg-muted p-1 rounded-xl h-auto">
                <TabsTrigger value="all" className="px-3 py-1.5 text-xs rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm">All</TabsTrigger>
                <TabsTrigger value="low" className="px-3 py-1.5 text-xs rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm">Low Risk</TabsTrigger>
                <TabsTrigger value="high" className="px-3 py-1.5 text-xs rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm">High Risk</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="all" className="grid gap-4 mt-0">
              {investmentTypes.map((inv, index) => (
                <div key={index} className="rounded-2xl border hairline bg-card p-6 group hover:bg-muted/30 transition-colors">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <h3 className="text-lg font-semibold">{inv.name}</h3>
                      <p className="text-sm text-muted-foreground">{inv.desc}</p>
                    </div>
                    <div className="text-right space-y-1">
                      <p className="text-2xl font-bold" style={{ color: inv.color }}>{inv.returns}%</p>
                      <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">{inv.risk}</p>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t hairline flex items-center gap-2 text-xs text-muted-foreground">
                    <Info className="w-3.5 h-3.5 text-primary" />
                    <span><span className="font-bold text-foreground">Best for:</span> {inv.suitability}</span>
                  </div>
                </div>
              ))}
            </TabsContent>
          </Tabs>
        </section>

        {/* CONSIDERATIONS */}
        <section className="space-y-5 pb-10">
          <h2 className="text-xs uppercase text-muted-foreground font-bold tracking-widest flex items-center gap-2">
            <AlertTriangle className="w-3.5 h-3.5" /> Considerations
          </h2>

          <div className="rounded-2xl border hairline bg-card divide-y hairline overflow-hidden">
            {[
              { title: "Past Performance ≠ Future Returns", desc: "Historical returns are indicative. Actual returns vary with market conditions." },
              { title: "Diversification is Key", desc: "Don't put all your money in one type. Spread across asset classes." },
              { title: "Match Time Horizon", desc: "Equity for long-term (>7y), Debt for short-term goals." }
            ].map((item, i) => (
              <div key={i} className="px-6 py-5 hover:bg-muted/30 transition-colors">
                <h4 className="text-sm font-semibold text-foreground">{item.title}</h4>
                <p className="text-xs text-muted-foreground mt-1">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}
