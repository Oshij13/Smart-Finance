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
    <div className="w-full px-6 lg:px-10 py-12 space-y-12">
      {/* Header */}
      <header className="space-y-4">
        <div className="space-y-1">
          <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Budget</p>
          <h1 className="text-6xl font-black text-gray-900 tracking-tighter">Find your spending leaks</h1>
        </div>
        <p className="text-xl text-gray-500 max-w-2xl font-medium leading-relaxed">
          Track once, save every month after. Identify where your money goes and how to keep more of it.
        </p>
      </header>

      {/* Input Form */}
      <div className="space-y-10">
        <div className="space-y-4">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">monthly income (₹)</label>
          <input
            type="number"
            placeholder="e.g. 50,000"
            value={monthlyIncome}
            onChange={(e) => setMonthlyIncome(e.target.value)}
            className="w-full max-w-md px-6 py-4 rounded-2xl border border-gray-100 bg-gray-50/50 text-lg font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-gray-300"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-8">
          {expenseCategories.map((category) => {
            const Icon = category.icon;
            return (
              <div key={category.key} className="group space-y-3">
                <label className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest group-focus-within:text-blue-500 transition-colors">
                  <Icon className="w-4 h-4 opacity-50" />
                  {category.label}
                </label>
                <input
                  type="number"
                  placeholder="₹"
                  value={expenses[category.key as keyof typeof expenses]}
                  onChange={(e) => handleExpenseChange(category.key, e.target.value)}
                  className="w-full px-6 py-4 rounded-2xl border border-gray-100 bg-gray-50/50 text-lg font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-gray-300"
                />
              </div>
            );
          })}
        </div>

        <button
          onClick={analyzeSpending}
          className="px-10 py-4 rounded-full bg-blue-600 text-white text-lg font-bold hover:bg-blue-700 shadow-xl shadow-blue-500/20 transition-all active:scale-95"
        >
          Analyze Spending
        </button>
      </div>

      {/* Results */}
      {showResults && income > 0 && (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-8 rounded-3xl bg-gray-50/50 border border-gray-100 flex flex-col justify-between h-full">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">monthly expenses</p>
              <div className="mt-4">
                <p className="text-4xl font-black text-gray-900">₹{totalExpenses.toLocaleString('en-IN')}</p>
                <p className="text-sm font-bold text-gray-400 mt-1 uppercase tracking-tight">
                    {((totalExpenses / income) * 100).toFixed(0)}% of income
                </p>
              </div>
            </div>

            <div className="p-8 rounded-3xl bg-gray-50/50 border border-gray-100 flex flex-col justify-between h-full">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">savings rate</p>
              <div className="mt-4">
                <p className={`text-4xl font-black ${
                  parseFloat(savingsRate) >= 20 ? 'text-emerald-600' : 
                  parseFloat(savingsRate) >= 10 ? 'text-amber-600' : 'text-rose-600'
                }`}>
                  {savingsRate}%
                </p>
                <p className="text-sm font-bold text-gray-400 mt-1 uppercase tracking-tight">
                  {parseFloat(savingsRate) >= 20 ? 'excellent' : 
                   parseFloat(savingsRate) >= 10 ? 'improvable' : 'critical'}
                </p>
              </div>
            </div>

            <div className="p-8 rounded-3xl bg-blue-600 border border-blue-500 flex flex-col justify-between h-full shadow-xl shadow-blue-500/20">
              <p className="text-xs font-bold text-blue-200 uppercase tracking-widest">potential savings</p>
              <div className="mt-4">
                <p className="text-4xl font-black text-white">₹{Math.round(totalPotentialSavings).toLocaleString('en-IN')}</p>
                <p className="text-sm font-bold text-blue-200 mt-1 uppercase tracking-tight">monthly cutbacks</p>
              </div>
            </div>
          </div>

          {/* Expense Breakdown */}
          {expenseData.length > 0 && (
            <div className="space-y-8">
              <div className="space-y-1">
                <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Expenditure</p>
                <h2 className="text-4xl font-black text-gray-900 tracking-tighter">Budget Breakdown</h2>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center bg-white border border-gray-100 p-8 lg:p-12 rounded-[2.5rem] shadow-sm">
                <div className="relative aspect-square">
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
                          backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                          border: 'none', 
                          borderRadius: '16px',
                          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">total</p>
                    <p className="text-3xl font-black text-gray-900">₹{totalExpenses.toLocaleString('en-IN')}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {expenseData.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-6 rounded-2xl bg-gray-50/50 border border-gray-100 hover:border-gray-200 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${item.color}15` }}>
                          <span className="text-xl" style={{ color: item.color }}>•</span>
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900">{item.name}</p>
                          <p className="text-xs font-bold text-gray-400 uppercase tracking-tight">{((item.value / totalExpenses) * 100).toFixed(0)}% SHARE</p>
                        </div>
                      </div>
                      <p className="text-xl font-black text-gray-900">₹{item.value.toLocaleString('en-IN')}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Recommendations */}
          <div className="space-y-8">
            <div className="space-y-1">
              <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Optimisation</p>
              <h2 className="text-4xl font-black text-gray-900 tracking-tighter">Smart Saving Tips</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {potentialSavings.map((item, index) => {
                const Icon = item.icon;
                return (
                  <div key={index} className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm space-y-8">
                    <div className="flex items-center justify-between border-b border-gray-50 pb-8">
                      <div className="flex items-center gap-5">
                        <div className="w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 bg-gray-50">
                          <Icon className="w-7 h-7 text-gray-900" />
                        </div>
                        <div>
                          <h3 className="text-xl font-black text-gray-900 tracking-tight">{item.category}</h3>
                          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">₹{item.current.toLocaleString('en-IN')} Current</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest">SAVE UP TO</p>
                        <p className="text-3xl font-black text-emerald-600 mt-1">₹{Math.round(item.potential).toLocaleString('en-IN')}</p>
                      </div>
                    </div>
                    <ul className="grid grid-cols-1 gap-4 text-sm font-medium text-gray-500">
                      {item.tips.map((tip, tipIndex) => (
                        <li key={tipIndex} className="flex items-center gap-3">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </div>

          {/* General Strategies */}
          <div className="bg-gray-900 rounded-[3rem] p-10 lg:p-20 text-white space-y-16 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 blur-[100px] rounded-full -mr-48 -mt-48" />
            <div className="space-y-2 relative">
                <p className="text-sm font-bold text-blue-400 uppercase tracking-widest">mastery</p>
                <h2 className="text-5xl lg:text-7xl font-black tracking-tighter max-w-2xl leading-[0.9]">Universal High-Level Strategies</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 relative">
              {[
                { title: "Track Every Rupee", desc: "Use automation to map your spends directly from bank SMS and alerts." },
                { title: "The 24-Hour Rule", desc: "Wait 24 hours before any non-essential purchase above ₹500 to curb impulse." },
                { title: "Cashless Challenge", desc: "Use digital payments exclusively for better metadata and automatic tracking." },
                { title: "Zero-Based Budgeting", desc: "Your income minus expenses MUST equal zero. Every rupee needs a defined job." }
              ].map((strategy, i) => (
                <div key={i} className="space-y-4 p-8 rounded-[2rem] bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                  <h3 className="text-2xl font-black tracking-tight">{strategy.title}</h3>
                  <p className="text-lg text-gray-400 font-medium leading-relaxed">{strategy.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
