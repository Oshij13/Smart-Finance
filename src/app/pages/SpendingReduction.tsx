import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { TrendingDown, Coffee, ShoppingBag, Tv, Car, Utensils } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Checkbox } from "../components/ui/checkbox";

export function SpendingReduction() {
  const [monthlyIncome, setMonthlyIncome] = useState("");
  const [expenses, setExpenses] = useState({
    subscriptions: "",
    dining: "",
    shopping: "",
    entertainment: "",
    transport: "",
    miscellaneous: ""
  });
  const [showResults, setShowResults] = useState(false);

  const handleExpenseChange = (category: string, value: string) => {
    setExpenses(prev => ({ ...prev, [category]: value }));
  };

  const analyzeSpending = () => {
    if (monthlyIncome) setShowResults(true);
  };

  const income = parseInt(monthlyIncome) || 0;
  const totalExpenses = Object.values(expenses).reduce((sum, exp) => sum + (parseInt(exp) || 0), 0);
  const savingsRate = income > 0 ? ((income - totalExpenses) / income * 100).toFixed(1) : "0";

  const expenseCategories = [
    { 
      key: "subscriptions", 
      label: "Subscriptions", 
      icon: Tv, 
      color: "#ef4444",
      tips: ["Cancel unused OTT platforms", "Share family plans", "Annual plans save 20%"]
    },
    { 
      key: "dining", 
      label: "Dining Out", 
      icon: Utensils, 
      color: "#f59e0b",
      tips: ["Cook at home 3-4 days/week", "Pack lunch for work", "Use dining offers/coupons"]
    },
    { 
      key: "shopping", 
      label: "Shopping", 
      icon: ShoppingBag, 
      color: "#8b5cf6",
      tips: ["30-day rule before buying", "Buy during sales", "Avoid impulse purchases"]
    },
    { 
      key: "entertainment", 
      label: "Entertainment", 
      icon: Coffee, 
      color: "#3b82f6",
      tips: ["Free activities on weekends", "Home movie nights", "Library instead of bookstore"]
    },
    { 
      key: "transport", 
      label: "Transport", 
      icon: Car, 
      color: "#10b981",
      tips: ["Carpool or public transport", "Fuel-efficient driving", "Consolidate trips"]
    },
    { 
      key: "miscellaneous", 
      label: "Miscellaneous", 
      icon: TrendingDown, 
      color: "#ec4899",
      tips: ["Track small expenses", "Use cash for discretionary spending", "Set weekly budget limits"]
    },
  ];

  const expenseData = expenseCategories
    .map(cat => ({
      name: cat.label,
      value: parseInt(expenses[cat.key as keyof typeof expenses]) || 0,
      color: cat.color
    }))
    .filter(item => item.value > 0);

  const potentialSavings = expenseCategories.map(cat => {
    const currentSpend = parseInt(expenses[cat.key as keyof typeof expenses]) || 0;
    const reduction = currentSpend * 0.25; // Assuming 25% reduction potential
    return {
      category: cat.label,
      current: currentSpend,
      potential: reduction,
      icon: cat.icon,
      color: cat.color,
      tips: cat.tips
    };
  }).filter(item => item.current > 0);

  const totalPotentialSavings = potentialSavings.reduce((sum, item) => sum + item.potential, 0);

  return (
    <div className="w-full px-6 lg:px-10 py-12 space-y-10">
      {/* Header */}
      <header className="space-y-2">
        <div className="space-y-1">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Budget</p>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Find your spending leaks</h1>
        </div>
        <p className="text-sm text-gray-500 max-w-xl font-medium">
          Track once, save every month after. Identify where your money goes and how to keep more of it.
        </p>
      </header>

      {/* Input Form */}
      <div className="space-y-8">
        <div className="space-y-2">
          <label className="text-xs font-semibold text-gray-500">Monthly Income (₹)</label>
          <input
            type="number"
            placeholder="e.g. 50,000"
            value={monthlyIncome}
            onChange={(e) => setMonthlyIncome(e.target.value)}
            className="w-full max-w-sm h-11 px-4 rounded-xl border border-gray-200 bg-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/10 transition-all placeholder:text-gray-300"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {expenseCategories.map((category) => {
            const Icon = category.icon;
            return (
              <div key={category.key} className="space-y-2">
                <label className="flex items-center gap-2 text-xs font-semibold text-gray-500">
                  <Icon className="w-3.5 h-3.5" />
                  {category.label}
                </label>
                <input
                  type="number"
                  placeholder="₹"
                  value={expenses[category.key as keyof typeof expenses]}
                  onChange={(e) => handleExpenseChange(category.key, e.target.value)}
                  className="w-full h-11 px-4 rounded-xl border border-gray-200 bg-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/10 transition-all placeholder:text-gray-300"
                />
              </div>
            );
          })}
        </div>

        <button
          onClick={analyzeSpending}
          className="px-8 h-11 rounded-full bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 transition-all active:scale-95 shadow-sm"
        >
          Analyze Spending
        </button>
      </div>

      {/* Results */}
      {showResults && income > 0 && (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-500">
          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-6 rounded-2xl bg-gray-50/50 border border-gray-100 flex flex-col justify-between h-full">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">monthly expenses</p>
              <div className="mt-2 text-left">
                <p className="text-2xl font-bold text-gray-900">₹{totalExpenses.toLocaleString('en-IN')}</p>
                <p className="text-[10px] font-bold text-gray-400 mt-0.5 uppercase tracking-tight">
                    {((totalExpenses / income) * 100).toFixed(0)}% of income
                </p>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-gray-50/50 border border-gray-100 flex flex-col justify-between h-full">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">savings rate</p>
              <div className="mt-2 text-left">
                <p className={`text-2xl font-bold ${
                  parseFloat(savingsRate) >= 20 ? 'text-emerald-600' : 
                  parseFloat(savingsRate) >= 10 ? 'text-amber-600' : 'text-rose-600'
                }`}>
                  {savingsRate}%
                </p>
                <p className="text-[10px] font-bold text-gray-400 mt-0.5 uppercase tracking-tight text-left">
                  {parseFloat(savingsRate) >= 20 ? 'excellent' : 
                   parseFloat(savingsRate) >= 10 ? 'good' : 'caution'}
                </p>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-gray-200 flex flex-col justify-between h-full shadow-sm">
              <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">potential savings</p>
              <div className="mt-2 text-left">
                <p className="text-2xl font-bold text-blue-600">₹{Math.round(totalPotentialSavings).toLocaleString('en-IN')}</p>
                <p className="text-[10px] font-bold text-gray-400 mt-0.5 uppercase tracking-tight font-medium">with smart cutbacks</p>
              </div>
            </div>
          </div>

          {/* Expense Breakdown */}
          {expenseData.length > 0 && (
            <div className="space-y-6">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest text-left">Expenditure</p>
                <h2 className="text-xl font-bold text-gray-900 tracking-tight text-left">Budget Breakdown</h2>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center bg-white border border-gray-100 p-6 lg:p-10 rounded-[1.5rem] shadow-sm">
                <div className="relative aspect-square max-w-[280px] mx-auto">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={expenseData}
                        cx="50%"
                        cy="50%"
                        innerRadius="65%"
                        outerRadius="90%"
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {expenseData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value: number) => `₹${value.toLocaleString('en-IN')}`}
                        contentStyle={{ 
                          backgroundColor: 'white', 
                          border: '1px solid #f3f4f6', 
                          borderRadius: '12px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">total</p>
                    <p className="text-xl font-bold text-gray-900">₹{totalExpenses.toLocaleString('en-IN')}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {expenseData.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-4 rounded-xl bg-gray-50/30 border border-gray-100 hover:border-gray-200 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                        <div>
                          <p className="text-sm font-bold text-gray-900">{item.name}</p>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">{((item.value / totalExpenses) * 100).toFixed(0)}% SHARE</p>
                        </div>
                      </div>
                      <p className="text-sm font-bold text-gray-900">₹{item.value.toLocaleString('en-IN')}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Recommendations */}
          <div className="space-y-6">
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest text-left">Optimisation</p>
              <h2 className="text-xl font-bold text-gray-900 tracking-tight text-left">Smart Saving Tips</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {potentialSavings.map((item, index) => {
                const Icon = item.icon;
                return (
                  <div key={index} className="bg-white rounded-[1.25rem] p-6 border border-gray-100 shadow-sm space-y-6">
                    <div className="flex items-center justify-between border-b border-gray-50 pb-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-gray-50">
                          <Icon className="w-4 h-4 text-gray-700" />
                        </div>
                        <div>
                          <h3 className="text-base font-bold text-gray-900 tracking-tight">{item.category}</h3>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">₹{item.current.toLocaleString('en-IN')} CURRENT</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">SAVE</p>
                        <p className="text-xl font-bold text-emerald-600 mt-0.5">₹{Math.round(item.potential).toLocaleString('en-IN')}</p>
                      </div>
                    </div>
                    <ul className="space-y-3">
                      {item.tips.map((tip, tipIndex) => (
                        <li key={tipIndex} className="flex items-start gap-3 text-xs font-medium text-gray-500">
                          <span className="w-1 h-1 rounded-full bg-emerald-500 shrink-0 mt-1.5" />
                          <span className="leading-relaxed">{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </div>

          {/* General Strategies */}
          <div className="bg-gray-50 rounded-[1.5rem] p-8 lg:p-12 border border-gray-100 space-y-10 overflow-hidden relative">
            <div className="space-y-1">
                <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">mastery</p>
                <h2 className="text-2xl font-bold tracking-tight text-gray-900">Universal Strategies</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { title: "Track Every Rupee", desc: "Use automation to map your spends directly from bank SMS and alerts." },
                { title: "The 24-Hour Rule", desc: "Wait 24 hours before any non-essential purchase above ₹500 to curb impulse." },
                { title: "Cashless Challenge", desc: "Use digital payments exclusively for better metadata and automatic tracking." },
                { title: "Zero-Based Budgeting", desc: "Your income minus expenses MUST equal zero. Every rupee needs a defined job." }
              ].map((strategy, i) => (
                <div key={i} className="space-y-2 p-6 rounded-2xl bg-white border border-gray-100 shadow-sm">
                  <h3 className="text-base font-bold tracking-tight text-gray-900">{strategy.title}</h3>
                  <p className="text-sm text-gray-500 font-medium leading-relaxed">{strategy.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
