import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { TrendingUp, TrendingDown, Info, AlertTriangle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";

export function InvestmentOptions() {
  const [investmentAmount, setInvestmentAmount] = useState("");
  const [timeHorizon, setTimeHorizon] = useState("");
  const [historyYear, setHistoryYear] = useState("2010");
  const [showResults, setShowResults] = useState(false);
  const [customAmount, setCustomAmount] = useState(10000);
  const [isEditingAmount, setIsEditingAmount] = useState(false);

  const calculateReturns = () => {
    if (investmentAmount && timeHorizon) setShowResults(true);
  };

  const amount = parseInt(investmentAmount) || 0;
  const years = parseInt(timeHorizon) || 0;

  const investmentTypes = [
    {
      name: "Fixed Deposits",
      risk: "Very Low",
      returns: 6.5,
      description: "Safe, guaranteed returns from banks",
      color: "#10b981",
      suitability: "Conservative investors, emergency fund"
    },
    {
      name: "Liquid Funds",
      risk: "Low",
      returns: 7,
      description: "Mutual funds with high liquidity",
      color: "#3b82f6",
      suitability: "Short-term parking, 3-6 months"
    },
    {
      name: "Debt Mutual Funds",
      risk: "Low-Moderate",
      returns: 8,
      description: "Bond-based funds with stable returns",
      color: "#8b5cf6",
      suitability: "3-5 year goals, tax efficient"
    },
    {
      name: "Index Funds",
      risk: "Moderate",
      returns: 12,
      description: "Track Nifty/Sensex with low fees",
      color: "#f59e0b",
      suitability: "Long-term wealth creation, 7+ years"
    },
    {
      name: "Equity Mutual Funds",
      risk: "Moderate-High",
      returns: 14,
      description: "Actively managed stock portfolios",
      color: "#ef4444",
      suitability: "Aggressive growth, 10+ years"
    },
    {
      name: "Direct Stocks",
      risk: "High",
      returns: 16,
      description: "Individual company shares",
      color: "#ec4899",
      suitability: "Experienced investors, high involvement"
    },
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-violet-500 to-purple-600 rounded-2xl p-8 text-white shadow-xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
            <TrendingUp className="w-6 h-6" />
          </div>
          <h1 className="text-3xl font-bold">Investment Options</h1>
        </div>
        <p className="text-lg text-violet-50">
          Explore different investment vehicles and find the right mix for your financial goals.
        </p>
      </div>

      {/* HISTORICAL NIFTY SIMULATION */}
      <div className="bg-gray-50 rounded-xl p-6 border border-gray-100 mt-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">📈 What if you invested earlier?</h2>
            <p className="text-sm text-gray-600">
              See how ₹{customAmount.toLocaleString("en-IN")} could have grown over time in Nifty Index
            </p>
          </div>

          {!isEditingAmount ? (
            <button
              onClick={() => setIsEditingAmount(true)}
              className="text-xs px-3 py-1.5 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 text-gray-700 font-medium whitespace-nowrap"
            >
              Change Amount
            </button>
          ) : (
            <input
              type="number"
              value={customAmount}
              onChange={(e) => setCustomAmount(Number(e.target.value))}
              onBlur={() => setIsEditingAmount(false)}
              className="w-28 px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              autoFocus
            />
          )}
        </div>

        <div className="space-y-4">

          {/* TOGGLE YEARS */}
          <div className="flex gap-2">
            {["2010", "2016", "2020"].map((year) => (
              <Button
                key={year}
                variant={historyYear === year ? "default" : "outline"}
                onClick={() => setHistoryYear(year)}
                className={historyYear === year ? "bg-emerald-600 hover:bg-emerald-700" : ""}
              >
                {year}
              </Button>
            ))}
          </div>

          {/* CALCULATION */}
          {historyYear && (
            (() => {
              const startYear = parseInt(historyYear);
              const currentYear = new Date().getFullYear();
              const yearsCount = currentYear - startYear;

              const cagr = 0.12; // Nifty approx
              const initial = customAmount;

              const data = Array.from({ length: yearsCount + 1 }, (_, i) => {
                const value = Math.round(initial * Math.pow(1 + cagr, i));
                return {
                  year: startYear + i,
                  value,
                };
              });

              const finalValue = data[data.length - 1]?.value || 0;

              return (
                <>
                  {/* RESULT */}
                  <div className="p-4 bg-emerald-50 rounded-lg text-center">
                    <p className="text-sm text-gray-600">
                      ₹{initial.toLocaleString("en-IN")} invested in {startYear}
                    </p>
                    <p className="text-2xl font-bold text-emerald-600">
                      ₹{finalValue.toLocaleString("en-IN")}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      This is why starting early matters 🚀
                    </p>
                  </div>

                  {/* GRAPH */}
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={data}>
                      <XAxis dataKey="year" />
                      <YAxis />
                      <Tooltip
                        formatter={(val: number) => `₹${val.toLocaleString("en-IN")}`}
                      />
                      <Line type="monotone" dataKey="value" stroke="#059669" strokeWidth={3} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </>
              );
            })()
          )}
        </div>
      </div>

      {/* Calculator */}
      <div className="pt-4">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Investment Returns Calculator</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Investment Amount (₹)</label>
            <input
              type="number"
              placeholder="e.g. 100000"
              value={investmentAmount}
              onChange={(e) => setInvestmentAmount(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Time Horizon (Years)</label>
            <input
              type="number"
              placeholder="e.g. 10"
              value={timeHorizon}
              onChange={(e) => setTimeHorizon(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>
        </div>

        <button
          onClick={calculateReturns}
          className="px-6 py-2.5 rounded-lg bg-violet-600 text-white font-medium hover:opacity-90 transition mx-auto block mt-6"
        >
          Compare Investment Options
        </button>
      </div>



      {/* Results */}
      {showResults && amount > 0 && years > 0 && (
        <>
          {/* Comparison Chart */}
          <Card className="border-none shadow-md bg-white mt-4">
            <CardHeader>
              <CardTitle>Investment Comparison</CardTitle>
              <CardDescription>Potential final value after {years} years</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={compareData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis type="number" stroke="#6b7280" />
                  <YAxis type="category" dataKey="name" stroke="#6b7280" width={150} />
                  <Tooltip
                    formatter={(value: number) => `₹${value.toLocaleString('en-IN')}`}
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: 'none',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Bar dataKey="finalValue" radius={[0, 8, 8, 0]}>
                    {compareData.map((entry, index) => (
                      <rect key={index} fill={investmentTypes[index].color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Growth Projection */}
          <Card className="border-none shadow-md bg-white mt-4">
            <CardHeader>
              <CardTitle>Growth Projection Over Time</CardTitle>
              <CardDescription>See how your investment could grow year by year</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={growthProjection}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="year" label={{ value: 'Years', position: 'insideBottom', offset: -5 }} stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip
                    formatter={(value: number) => `₹${value.toLocaleString('en-IN')}`}
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: 'none',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Line type="monotone" dataKey="conservative" stroke="#10b981" strokeWidth={2} name="Conservative (7%)" />
                  <Line type="monotone" dataKey="moderate" stroke="#3b82f6" strokeWidth={2} name="Moderate (12%)" />
                  <Line type="monotone" dataKey="aggressive" stroke="#ef4444" strokeWidth={2} name="Aggressive (15%)" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </>
      )}

      {/* Investment Options Detail */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList className="grid grid-cols-4 w-full max-w-2xl">
          <TabsTrigger value="all">All Options</TabsTrigger>
          <TabsTrigger value="low">Low Risk</TabsTrigger>
          <TabsTrigger value="moderate">Moderate</TabsTrigger>
          <TabsTrigger value="high">High Risk</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {investmentTypes.map((inv, index) => (
            <div key={index} className="bg-gray-50 rounded-xl p-6 border border-gray-100">
              <div className="flex flex-col md:flex-row items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="text-lg font-bold flex items-center gap-2 text-gray-900">
                    {inv.name}
                    <span className={`text-xs px-2 py-1 rounded-full ${inv.risk.includes('Low') ? 'bg-emerald-100 text-emerald-700' :
                      inv.risk.includes('Moderate') ? 'bg-blue-100 text-blue-700' :
                        'bg-rose-100 text-rose-700'
                      }`}>
                      {inv.risk}
                    </span>
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">{inv.description}</p>
                </div>
                <div className="text-left md:text-right">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Expected Returns</p>
                  <p className="text-2xl font-bold mt-1" style={{ color: inv.color }}>{inv.returns}%</p>
                </div>
              </div>
              <div className="mt-4 flex items-start gap-2 text-sm bg-white p-3 rounded-lg border border-gray-100">
                <Info className="w-4 h-4 text-violet-500 mt-0.5 flex-shrink-0" />
                <p className="text-gray-600">
                  <span className="font-semibold text-gray-800">Best for:</span> {inv.suitability}
                </p>
              </div>
            </div>
          ))}
        </TabsContent>

        <TabsContent value="low" className="space-y-4 pt-2">
          {investmentTypes.filter(inv => inv.risk.includes('Low')).map((inv, index) => (
            <div key={index} className="bg-gray-50 rounded-xl p-6 border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">{inv.name}</h3>
              <p className="text-sm text-gray-600 mt-1">{inv.description}</p>
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-2xl font-bold" style={{ color: inv.color }}>Returns: {inv.returns}%</p>
                <p className="text-sm text-gray-600 mt-1"><span className="font-semibold text-gray-800">Best for:</span> {inv.suitability}</p>
              </div>
            </div>
          ))}
        </TabsContent>

        <TabsContent value="moderate" className="space-y-4 pt-2">
          {investmentTypes.filter(inv => inv.risk.includes('Moderate')).map((inv, index) => (
            <div key={index} className="bg-gray-50 rounded-xl p-6 border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">{inv.name}</h3>
              <p className="text-sm text-gray-600 mt-1">{inv.description}</p>
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-2xl font-bold" style={{ color: inv.color }}>Returns: {inv.returns}%</p>
                <p className="text-sm text-gray-600 mt-1"><span className="font-semibold text-gray-800">Best for:</span> {inv.suitability}</p>
              </div>
            </div>
          ))}
        </TabsContent>

        <TabsContent value="high" className="space-y-4 pt-2">
          {investmentTypes.filter(inv => inv.risk === 'High').map((inv, index) => (
            <div key={index} className="bg-gray-50 rounded-xl p-6 border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">{inv.name}</h3>
              <p className="text-sm text-gray-600 mt-1">{inv.description}</p>
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-2xl font-bold" style={{ color: inv.color }}>Returns: {inv.returns}%</p>
                <p className="text-sm text-gray-600 mt-1"><span className="font-semibold text-gray-800">Best for:</span> {inv.suitability}</p>
              </div>
            </div>
          ))}
        </TabsContent>
      </Tabs>

      {/* Important Notes */}
      <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-6 mt-8">
        <h2 className="text-xl font-bold flex items-center gap-2 text-gray-900 mb-4">
          <AlertTriangle className="w-5 h-5 text-amber-600" />
          Important Considerations
        </h2>
        <div className="space-y-3">
          <div className="p-4 bg-white/80 rounded-lg">
            <h3 className="font-semibold text-amber-900 mb-1">Past Performance ≠ Future Returns</h3>
            <p className="text-sm text-gray-600">Historical returns are indicative. Actual returns may vary based on market conditions.</p>
          </div>
          <div className="p-4 bg-white/80 rounded-lg">
            <h3 className="font-semibold text-amber-900 mb-1">Diversification is Key</h3>
            <p className="text-sm text-gray-600">Don't put all your money in one type of investment. Spread across different asset classes.</p>
          </div>
          <div className="p-4 bg-white/80 rounded-lg">
            <h3 className="font-semibold text-amber-900 mb-1">Match Time Horizon</h3>
            <p className="text-sm text-gray-600">Choose investments that align with when you need the money. Equity for long-term, debt for short-term.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
