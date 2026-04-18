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
      <header className="space-y-2">
        <div className="space-y-1">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Retirement</p>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight text-left">Plan your golden years</h1>
        </div>
        <p className="text-sm text-gray-500 max-w-xl font-medium text-left">
          A calm view of where you'll land.
        </p>
      </header>

      {/* Input Form */}
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-500">Current Age</label>
            <input
              type="number"
              placeholder="e.g. 30"
              value={currentAge}
              onChange={(e) => setCurrentAge(e.target.value)}
              className="w-full h-11 px-4 rounded-xl border border-gray-200 bg-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/10 transition-all placeholder:text-gray-300 shadow-sm"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-500">Planned Retirement Age</label>
            <input
              type="number"
              placeholder="e.g. 60"
              value={retirementAge}
              onChange={(e) => setRetirementAge(e.target.value)}
              className="w-full h-11 px-4 rounded-xl border border-gray-200 bg-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/10 transition-all placeholder:text-gray-300 shadow-sm"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-500">Current Monthly Expenses (₹)</label>
            <input
              type="number"
              placeholder="e.g. 40,000"
              value={monthlyExpenses}
              onChange={(e) => setMonthlyExpenses(e.target.value)}
              className="w-full h-11 px-4 rounded-xl border border-gray-200 bg-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/10 transition-all placeholder:text-gray-300 shadow-sm"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-500">Current Retirement Savings (₹)</label>
            <input
              type="number"
              placeholder="e.g. 5,00,000"
              value={currentSavings}
              onChange={(e) => setCurrentSavings(e.target.value)}
              className="w-full h-11 px-4 rounded-xl border border-gray-200 bg-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/10 transition-all placeholder:text-gray-300 shadow-sm"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="text-xs font-semibold text-gray-500">Current Monthly Retirement Savings (₹)</label>
            <input
              type="number"
              placeholder="e.g. 10,000"
              value={monthlySavings}
              onChange={(e) => setMonthlySavings(e.target.value)}
              className="w-full h-11 px-4 rounded-xl border border-gray-200 bg-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/10 transition-all placeholder:text-gray-300 shadow-sm"
            />
          </div>
        </div>

        <button
          onClick={calculateRetirement}
          className="px-8 h-11 rounded-full bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 transition-all active:scale-95 shadow-sm"
        >
          Calculate Retirement Plan
        </button>
      </div>

      {/* Results */}
      {showResults && age > 0 && retAge > age && (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
            <div className="p-6 rounded-2xl bg-gray-50/50 border border-gray-100 flex flex-col justify-between h-full">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest text-left">corpus needed</p>
              <div className="mt-2 text-left">
                <p className="text-2xl font-bold text-gray-900">₹{(corpusNeeded / 10000000).toFixed(2)}Cr</p>
                <p className="text-[10px] font-bold text-gray-400 mt-0.5 uppercase tracking-tight">at retirement</p>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-gray-50/50 border border-gray-100 flex flex-col justify-between h-full">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest text-left">projected corpus</p>
              <div className="mt-2 text-left">
                <p className="text-2xl font-bold text-gray-900">₹{(projectedCorpus / 10000000).toFixed(2)}Cr</p>
                <p className="text-[10px] font-bold text-gray-400 mt-0.5 uppercase tracking-tight">with current plan</p>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-gray-200 flex flex-col justify-between h-full shadow-sm">
              <p className={`text-[10px] font-bold uppercase tracking-widest text-left ${shortfall > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                {shortfall > 0 ? 'shortfall' : 'surplus'}
              </p>
              <div className="mt-2 text-left">
                <p className={`text-2xl font-bold ${shortfall > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                  ₹{((shortfall || surplus) / 10000000).toFixed(2)}Cr
                </p>
                <p className="text-[10px] font-bold text-gray-400 mt-0.5 uppercase tracking-tight font-medium">
                  {shortfall > 0 ? 'needs attention' : 'on track'}
                </p>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-gray-50/50 border border-gray-100 flex flex-col justify-between h-full">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest text-left">years to go</p>
              <div className="mt-2 text-left">
                <p className="text-2xl font-bold text-gray-900">{yearsToRetirement}</p>
                <p className="text-[10px] font-bold text-gray-400 mt-0.5 uppercase tracking-tight">build time left</p>
              </div>
            </div>
          </div>

          {/* Corpus Growth */}
          <div className="space-y-6 mt-12">
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest text-left">Projection</p>
              <h2 className="text-xl font-bold text-gray-900 tracking-tight text-left">Corpus Growth Chart</h2>
            </div>
            
            <div className="bg-white border border-gray-100 p-6 lg:p-10 rounded-[1.5rem] shadow-sm">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={projectionData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                  <XAxis 
                    dataKey="year" 
                    stroke="#9ca3af"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                    dy={10}
                  />
                  <YAxis 
                    stroke="#9ca3af"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `₹${(value / 10000000).toFixed(1)}Cr`}
                  />
                  <Tooltip 
                    formatter={(value: number) => `₹${(value / 10000000).toFixed(2)} Cr`}
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #f3f4f6', 
                      borderRadius: '12px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="corpus" 
                    stroke="#2563eb" 
                    strokeWidth={2}
                    dot={false}
                    name="Projected Corpus"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Action Required */}
          {shortfall > 0 && (
            <div className="bg-gray-50/50 rounded-2xl p-6 border border-rose-100 mt-8">
              <div className="space-y-1 mb-6">
                <p className="text-[10px] font-bold text-rose-500 uppercase tracking-widest">Correction</p>
                <h2 className="text-xl font-bold text-gray-900 tracking-tight">Action Required</h2>
              </div>
              <div className="space-y-6">
                <p className="text-sm text-gray-500 font-medium leading-relaxed max-w-xl">
                  Your current savings plan will not be sufficient to meet your retirement goals. 
                  You need to increase your monthly retirement savings to close the gap.
                </p>
                <div className="p-6 bg-white border border-gray-100 rounded-2xl shadow-sm inline-block">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Additional Monthly SIP Needed</p>
                  <p className="text-3xl font-bold text-rose-600">₹{additionalSIPNeeded.toLocaleString('en-IN')}</p>
                  <p className="text-xs text-gray-400 mt-3 font-medium">
                    Total monthly saving target: <span className="font-bold text-gray-900">₹{(monthlySave + additionalSIPNeeded).toLocaleString('en-IN')}</span>
                  </p>
                </div>
              </div>
            </div>
          )}

          {surplus > 0 && (
            <div className="bg-gray-50/50 rounded-2xl p-6 border border-emerald-100 mt-8">
              <div className="space-y-1 mb-6">
                <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Growth</p>
                <h2 className="text-xl font-bold text-gray-900 tracking-tight">Excellent Progress!</h2>
              </div>
              <div className="space-y-4">
                <p className="text-sm text-gray-500 font-medium leading-relaxed max-w-xl">
                  You're on track to exceed your retirement goals! Your potential surplus provides additional security for:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {["Early retirement options", "Higher lifestyle standards", "Children's legacy planning"].map((item, i) => (
                    <div key={i} className="flex items-center gap-3 p-4 bg-white border border-gray-100 rounded-xl shadow-sm text-xs font-bold text-gray-700">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Post-Retirement Expenses */}
          <div className="space-y-6 mt-12">
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest text-left">Timeline</p>
              <h2 className="text-xl font-bold text-gray-900 tracking-tight text-left">Post-Retirement Expenses</h2>
            </div>
            
            <div className="bg-white border border-gray-100 p-6 lg:p-10 rounded-[1.5rem] shadow-sm">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={postRetirementData.slice(0, 10)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                  <XAxis dataKey="age" stroke="#9ca3af" fontSize={10} tickLine={false} axisLine={false} dy={10} />
                  <YAxis stroke="#9ca3af" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}K`} />
                  <Tooltip 
                    formatter={(value: number) => `₹${value.toLocaleString('en-IN')}`}
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #f3f4f6', 
                      borderRadius: '12px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Bar dataKey="expenses" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-6 text-center italic">Monthly inflation-adjusted expenses after retirement</p>
            </div>
          </div>

          {/* Retirement Tips */}
          <div className="space-y-6 mt-12 pb-12">
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest text-left">Education</p>
              <h2 className="text-xl font-bold text-gray-900 tracking-tight text-left">Best Practices</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { title: "Start Early", desc: "Maximum time in market maximizes compounding." },
                { title: "EPF & NPS", desc: "Factor in tax benefits and employer match." },
                { title: "Health First", desc: "Medical inflation requires dedicated corpus." },
                { title: "Annual Review", desc: "Adjust for life changes and salary hikes." }
              ].map((tip, i) => (
                <div key={i} className="p-6 bg-white border border-gray-100 rounded-2xl shadow-sm">
                  <h3 className="text-sm font-bold text-gray-900 mb-2">{tip.title}</h3>
                  <p className="text-xs text-gray-500 font-medium leading-relaxed">{tip.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}