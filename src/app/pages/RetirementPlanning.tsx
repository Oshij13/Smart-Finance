import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Leaf, TrendingUp, Heart, AlertCircle } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";

export function RetirementPlanning() {
  const [currentAge, setCurrentAge] = useState("");
  const [retirementAge, setRetirementAge] = useState("");
  const [monthlyExpenses, setMonthlyExpenses] = useState("");
  const [currentSavings, setCurrentSavings] = useState("");
  const [monthlySavings, setMonthlySavings] = useState("");
  const [showResults, setShowResults] = useState(false);

  const calculateRetirement = () => {
    if (currentAge && retirementAge && monthlyExpenses) {
      setShowResults(true);
    }
  };

  const age = parseInt(currentAge) || 0;
  const retAge = parseInt(retirementAge) || 60;
  const expenses = parseInt(monthlyExpenses) || 0;
  const savings = parseInt(currentSavings) || 0;
  const monthlySave = parseInt(monthlySavings) || 0;

  const yearsToRetirement = retAge - age;
  const inflationRate = 0.06; // 6% annual inflation
  const returnRate = 0.12; // 12% investment return
  const postRetirementReturn = 0.08; // 8% post-retirement return
  const lifeExpectancy = 85;
  const retirementYears = lifeExpectancy - retAge;

  // Calculate future monthly expenses at retirement (adjusted for inflation)
  const futureMonthlyExpenses = expenses * Math.pow(1 + inflationRate, yearsToRetirement);
  
  // Corpus needed (using perpetuity approach with real return)
  const realReturnPostRetirement = (postRetirementReturn - inflationRate) / (1 + inflationRate);
  const corpusNeeded = (futureMonthlyExpenses * 12) / realReturnPostRetirement;

  // Future value of current savings
  const futureValueOfSavings = savings * Math.pow(1 + returnRate, yearsToRetirement);

  // Future value of monthly SIP
  const monthlyRate = returnRate / 12;
  const months = yearsToRetirement * 12;
  const futureValueOfSIP = monthlySave * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate);

  const projectedCorpus = futureValueOfSavings + futureValueOfSIP;
  const shortfall = Math.max(0, corpusNeeded - projectedCorpus);
  const surplus = Math.max(0, projectedCorpus - corpusNeeded);
  
  // Additional monthly SIP needed
  const additionalSIPNeeded = shortfall > 0 
    ? Math.round((shortfall * monthlyRate) / ((Math.pow(1 + monthlyRate, months) - 1) * (1 + monthlyRate)))
    : 0;

  // Projection data
  const projectionData = Array.from({ length: Math.min(yearsToRetirement + 1, 30) }, (_, i) => {
    const year = i;
    const futureValueSavings = savings * Math.pow(1 + returnRate, year);
    const futureValueSIP = monthlySave * ((Math.pow(1 + monthlyRate, 12 * year) - 1) / monthlyRate) * (1 + monthlyRate);
    return {
      year: age + year,
      corpus: Math.round(futureValueSavings + futureValueSIP),
    };
  });

  // Post-retirement income projection
  const postRetirementData = Array.from({ length: 20 }, (_, i) => {
    const year = i;
    const inflatedExpenses = futureMonthlyExpenses * Math.pow(1 + inflationRate, year);
    const withdrawalAmount = inflatedExpenses * 12;
    return {
      age: retAge + year,
      expenses: Math.round(inflatedExpenses),
      withdrawal: Math.round(withdrawalAmount),
    };
  });

  return (
    <div className="w-full px-6 lg:px-10 py-12 space-y-12">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-500 to-emerald-600 rounded-2xl p-8 text-white shadow-xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
            <Leaf className="w-6 h-6" />
          </div>
          <h1 className="text-3xl font-bold">Retirement Planning</h1>
        </div>
        <p className="text-lg text-teal-50">
          Plan for a financially secure retirement and maintain your lifestyle in your golden years.
        </p>
      </div>

      {/* Input Form */}
      <div className="space-y-4 py-2 mt-4">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Retirement Calculator</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Current Age</label>
            <input
              type="number"
              placeholder="e.g. 30"
              value={currentAge}
              onChange={(e) => setCurrentAge(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Planned Retirement Age</label>
            <input
              type="number"
              placeholder="e.g. 60"
              value={retirementAge}
              onChange={(e) => setRetirementAge(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Current Monthly Expenses (₹)</label>
            <input
              type="number"
              placeholder="e.g. 40000"
              value={monthlyExpenses}
              onChange={(e) => setMonthlyExpenses(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Current Retirement Savings (₹)</label>
            <input
              type="number"
              placeholder="e.g. 500000"
              value={currentSavings}
              onChange={(e) => setCurrentSavings(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium text-gray-700">Current Monthly Retirement Savings (₹)</label>
            <input
              type="number"
              placeholder="e.g. 10000"
              value={monthlySavings}
              onChange={(e) => setMonthlySavings(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
        </div>

        <button
          onClick={calculateRetirement}
          className="px-6 py-2.5 rounded-lg bg-teal-600 text-white font-medium hover:opacity-90 transition mx-auto block mt-6"
        >
          Calculate Retirement Plan
        </button>
      </div>

      {/* Results */}
      {showResults && age > 0 && retAge > age && (
        <>
          {/* Key Metrics */}
          <div className="bg-teal-50 rounded-xl p-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-sm text-teal-900/70 font-medium">Corpus Needed</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">₹{(corpusNeeded / 10000000).toFixed(2)}Cr</p>
                <p className="text-xs text-teal-800/60 mt-1">At retirement</p>
              </div>

              <div>
                <p className="text-sm text-teal-900/70 font-medium">Projected Corpus</p>
                <p className="text-2xl font-bold text-teal-600 mt-1">₹{(projectedCorpus / 10000000).toFixed(2)}Cr</p>
                <p className="text-xs text-teal-800/60 mt-1">With current plan</p>
              </div>

              <div>
                <p className="text-sm text-teal-900/70 font-medium">
                  {shortfall > 0 ? 'Shortfall' : 'Surplus'}
                </p>
                <p className={`text-2xl font-bold mt-1 ${shortfall > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                  ₹{((shortfall || surplus) / 10000000).toFixed(2)}Cr
                </p>
                <p className="text-xs text-teal-800/60 mt-1">
                  {shortfall > 0 ? 'Need to save more' : 'You are on track!'}
                </p>
              </div>

              <div>
                <p className="text-sm text-teal-900/70 font-medium">Years to Retirement</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{yearsToRetirement}</p>
                <p className="text-xs text-teal-800/60 mt-1">Time to build corpus</p>
              </div>
            </div>
          </div>

          {/* Corpus Growth */}
          <Card className="border-none shadow-md bg-white mt-4">
            <CardHeader>
              <CardTitle>Retirement Corpus Growth Projection</CardTitle>
              <CardDescription>How your retirement savings will grow over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={projectionData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="year" 
                    label={{ value: 'Age', position: 'insideBottom', offset: -5 }} 
                    stroke="#6b7280"
                  />
                  <YAxis stroke="#6b7280" />
                  <Tooltip 
                    formatter={(value: number) => `₹${(value / 10000000).toFixed(2)} Cr`}
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                      border: 'none', 
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="corpus" 
                    stroke="#14b8a6" 
                    strokeWidth={3}
                    name="Projected Corpus"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Action Required */}
          {shortfall > 0 && (
            <div className="bg-gradient-to-br from-rose-50 to-pink-50 rounded-xl p-6 mt-8">
              <h2 className="text-xl font-bold flex items-center gap-2 text-rose-900 mb-4">
                <AlertCircle className="w-5 h-5" />
                Action Required
              </h2>
              <div className="space-y-4">
                <p className="text-gray-700">
                  Your current savings plan will not be sufficient to meet your retirement goals. 
                  You need to increase your monthly retirement savings.
                </p>
                <div className="p-4 bg-white/80 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Additional Monthly SIP Required</p>
                  <p className="text-3xl font-bold text-rose-600">₹{additionalSIPNeeded.toLocaleString('en-IN')}</p>
                  <p className="text-sm text-gray-600 mt-2">
                    Total monthly retirement saving needed: <span className="font-semibold">₹{(monthlySave + additionalSIPNeeded).toLocaleString('en-IN')}</span>
                  </p>
                </div>
              </div>
            </div>
          )}

          {surplus > 0 && (
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-6 mt-8">
              <h2 className="text-xl font-bold flex items-center gap-2 text-emerald-900 mb-4">
                <Heart className="w-5 h-5" />
                Excellent Progress!
              </h2>
              <div>
                <p className="text-gray-700 mb-4">
                  You're on track to exceed your retirement goals! Your surplus can be used for:
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2 text-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0"></div>
                    <span className="text-gray-700">Early retirement (before age {retAge})</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0"></div>
                    <span className="text-gray-700">Higher lifestyle in retirement</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0"></div>
                    <span className="text-gray-700">Legacy planning for children</span>
                  </li>
                </ul>
              </div>
            </div>
          )}

          {/* Post-Retirement Expenses */}
          <Card className="border-none shadow-md bg-white mt-8">
            <CardHeader>
              <CardTitle>Projected Post-Retirement Expenses</CardTitle>
              <CardDescription>Monthly expenses adjusted for inflation after retirement</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={postRetirementData.slice(0, 10)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="age" stroke="#6b7280" />
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
                  <Bar dataKey="expenses" fill="#14b8a6" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Retirement Tips */}
          <div className="bg-gradient-to-br from-teal-50 to-emerald-50 rounded-xl p-6 mt-8">
            <h2 className="text-xl font-bold flex items-center gap-2 text-teal-900 mb-4">
              Retirement Planning Best Practices
            </h2>
            <div className="space-y-3">
              <div className="p-4 bg-white/80 rounded-lg">
                <h3 className="font-semibold text-teal-900 mb-1">Start Early, Benefit from Compounding</h3>
                <p className="text-sm text-gray-600">The earlier you start, the less you need to save monthly. Time is your greatest asset.</p>
              </div>
              <div className="p-4 bg-white/80 rounded-lg">
                <h3 className="font-semibold text-teal-900 mb-1">Maximize EPF & NPS Contributions</h3>
                <p className="text-sm text-gray-600">Take full advantage of employer contributions and tax benefits under Sections 80C & 80CCD.</p>
              </div>
              <div className="p-4 bg-white/80 rounded-lg">
                <h3 className="font-semibold text-teal-900 mb-1">Health Insurance is Critical</h3>
                <p className="text-sm text-gray-600">Medical expenses rise with age. Ensure adequate health coverage (₹10L+ for couple).</p>
              </div>
              <div className="p-4 bg-white/80 rounded-lg">
                <h3 className="font-semibold text-teal-900 mb-1">Review Annually</h3>
                <p className="text-sm text-gray-600">Reassess your retirement plan every year and adjust for salary increases and life changes.</p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}