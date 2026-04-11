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
  const [showResults, setShowResults] = useState(false);

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
      <Card className="border-none shadow-lg bg-white/80 backdrop-blur">
        <CardHeader>
          <CardTitle>📈 What if you invested earlier?</CardTitle>
          <CardDescription>
            See how ₹1,000 could have grown over time in Nifty Index
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">

          {/* TOGGLE YEARS */}
          <div className="flex gap-2">
            {["2010", "2016", "2020"].map((year) => (
              <Button
                key={year}
                variant={timeHorizon === year ? "default" : "outline"}
                onClick={() => setTimeHorizon(year)}
                className={timeHorizon === year ? "bg-emerald-600 hover:bg-emerald-700" : ""}
              >
                {year}
              </Button>
            ))}
          </div>

          {/* CALCULATION */}
          {timeHorizon && (
            (() => {
              const startYear = parseInt(timeHorizon);
              const currentYear = new Date().getFullYear();
              const yearsCount = currentYear - startYear;

              const cagr = 0.12; // Nifty approx
              const initial = 1000;

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
                      ₹1,000 invested in {startYear}
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
        </CardContent>
      </Card>

      {/* Calculator */}
      <Card className="border-none shadow-lg bg-white/80 backdrop-blur">
        <CardHeader>
          <CardTitle>Investment Returns Calculator</CardTitle>
          <CardDescription>See how different investments grow over time</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="investment-amount">Investment Amount (₹)</Label>
              <Input
                id="investment-amount"
                type="number"
                placeholder="e.g., 100000"
                value={investmentAmount}
                onChange={(e) => setInvestmentAmount(e.target.value)}
                className="text-lg"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="time-horizon">Time Horizon (Years)</Label>
              <Input
                id="time-horizon"
                type="number"
                placeholder="e.g., 10"
                value={timeHorizon}
                onChange={(e) => setTimeHorizon(e.target.value)}
                className="text-lg"
              />
            </div>
          </div>

          <Button onClick={calculateReturns} className="w-full bg-gradient-to-r from-violet-500 to-purple-600">
            Compare Investment Options
          </Button>
        </CardContent>
      </Card>



      {/* Results */}
      {showResults && amount > 0 && years > 0 && (
        <>
          {/* Comparison Chart */}
          <Card className="border-none shadow-lg bg-white/80 backdrop-blur">
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
                    formatter={(value: number) => `₹${value.toLocaleString()}`}
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
          <Card className="border-none shadow-lg bg-white/80 backdrop-blur">
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
                    formatter={(value: number) => `₹${value.toLocaleString()}`}
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
            <Card key={index} className="border-none shadow-lg bg-white/80 backdrop-blur">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      {inv.name}
                      <span className={`text-xs px-2 py-1 rounded-full ${inv.risk.includes('Low') ? 'bg-emerald-100 text-emerald-700' :
                        inv.risk.includes('Moderate') ? 'bg-blue-100 text-blue-700' :
                          'bg-rose-100 text-rose-700'
                        }`}>
                        {inv.risk}
                      </span>
                    </CardTitle>
                    <CardDescription>{inv.description}</CardDescription>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Expected Returns</p>
                    <p className="text-2xl font-bold" style={{ color: inv.color }}>{inv.returns}%</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-start gap-2 text-sm">
                  <Info className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  <p className="text-gray-600">
                    <span className="font-semibold">Best for:</span> {inv.suitability}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="low" className="space-y-4">
          {investmentTypes.filter(inv => inv.risk.includes('Low')).map((inv, index) => (
            <Card key={index} className="border-none shadow-lg bg-white/80 backdrop-blur">
              <CardHeader>
                <CardTitle>{inv.name}</CardTitle>
                <CardDescription>{inv.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-2xl font-bold" style={{ color: inv.color }}>Returns: {inv.returns}%</p>
                <p className="text-sm text-gray-600">Best for: {inv.suitability}</p>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="moderate" className="space-y-4">
          {investmentTypes.filter(inv => inv.risk.includes('Moderate')).map((inv, index) => (
            <Card key={index} className="border-none shadow-lg bg-white/80 backdrop-blur">
              <CardHeader>
                <CardTitle>{inv.name}</CardTitle>
                <CardDescription>{inv.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-2xl font-bold" style={{ color: inv.color }}>Returns: {inv.returns}%</p>
                <p className="text-sm text-gray-600">Best for: {inv.suitability}</p>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="high" className="space-y-4">
          {investmentTypes.filter(inv => inv.risk === 'High').map((inv, index) => (
            <Card key={index} className="border-none shadow-lg bg-white/80 backdrop-blur">
              <CardHeader>
                <CardTitle>{inv.name}</CardTitle>
                <CardDescription>{inv.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-2xl font-bold" style={{ color: inv.color }}>Returns: {inv.returns}%</p>
                <p className="text-sm text-gray-600">Best for: {inv.suitability}</p>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>

      {/* Important Notes */}
      <Card className="border-none shadow-lg bg-gradient-to-br from-amber-50 to-orange-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            Important Considerations
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="p-4 bg-white rounded-lg">
            <h3 className="font-semibold text-amber-900 mb-1">Past Performance ≠ Future Returns</h3>
            <p className="text-sm text-gray-600">Historical returns are indicative. Actual returns may vary based on market conditions.</p>
          </div>
          <div className="p-4 bg-white rounded-lg">
            <h3 className="font-semibold text-amber-900 mb-1">Diversification is Key</h3>
            <p className="text-sm text-gray-600">Don't put all your money in one type of investment. Spread across different asset classes.</p>
          </div>
          <div className="p-4 bg-white rounded-lg">
            <h3 className="font-semibold text-amber-900 mb-1">Match Time Horizon</h3>
            <p className="text-sm text-gray-600">Choose investments that align with when you need the money. Equity for long-term, debt for short-term.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
