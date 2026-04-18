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
      <div className="bg-gradient-to-r from-indigo-500 to-blue-600 rounded-2xl p-8 text-white shadow-xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
            <TrendingDown className="w-6 h-6" />
          </div>
          <h1 className="text-3xl font-bold">Spending Reduction</h1>
        </div>
        <p className="text-lg text-indigo-50">
          Identify spending leaks and discover ways to save more without sacrificing quality of life.
        </p>
      </div>

      {/* Input Form */}
      <div className="space-y-4 py-2 mt-4">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Track Your Monthly Expenses</h2>
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Monthly Income (₹)</label>
          <input
            type="number"
            placeholder="e.g. 50000"
            value={monthlyIncome}
            onChange={(e) => setMonthlyIncome(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {expenseCategories.map((category) => {
            const Icon = category.icon;
            return (
              <div key={category.key} className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Icon className="w-4 h-4" style={{ color: category.color }} />
                  {category.label}
                </label>
                <input
                  type="number"
                  placeholder="₹"
                  value={expenses[category.key as keyof typeof expenses]}
                  onChange={(e) => handleExpenseChange(category.key, e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            );
          })}
        </div>

        <button
          onClick={analyzeSpending}
          className="px-6 py-2.5 rounded-lg bg-indigo-600 text-white font-medium hover:opacity-90 transition mx-auto block mt-6"
        >
          Analyze My Spending
        </button>
      </div>

      {/* Results */}
      {showResults && income > 0 && (
        <>
          {/* Summary Cards */}
          <div className="bg-indigo-50 rounded-xl p-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-sm text-indigo-900/70 font-medium">Total Monthly Expenses</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">₹{totalExpenses.toLocaleString('en-IN')}</p>
                <p className="text-xs text-indigo-800/60 mt-1">
                  {((totalExpenses / income) * 100).toFixed(0)}% of income
                </p>
              </div>

              <div>
                <p className="text-sm text-indigo-900/70 font-medium">Current Savings Rate</p>
                <p className={`text-2xl font-bold mt-1 ${
                  parseFloat(savingsRate) >= 20 ? 'text-emerald-600' : 
                  parseFloat(savingsRate) >= 10 ? 'text-amber-600' : 'text-rose-600'
                }`}>
                  {savingsRate}%
                </p>
                <p className="text-xs text-indigo-800/60 mt-1">
                  {parseFloat(savingsRate) >= 20 ? 'Excellent!' : 
                   parseFloat(savingsRate) >= 10 ? 'Good, can improve' : 'Needs attention'}
                </p>
              </div>

              <div>
                <p className="text-sm text-indigo-900/70 font-medium">Potential Monthly Savings</p>
                <p className="text-2xl font-bold text-emerald-600 mt-1">₹{Math.round(totalPotentialSavings).toLocaleString('en-IN')}</p>
                <p className="text-xs text-indigo-800/60 mt-1">With smart cutbacks</p>
              </div>
            </div>
          </div>

          {/* Expense Breakdown */}
          {expenseData.length > 0 && (
            <Card className="border-none shadow-md bg-white mt-4">
              <CardHeader>
                <CardTitle>Spending Breakdown</CardTitle>
                <CardDescription>Where your money is going each month</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={expenseData}
                        cx="50%"
                        cy="50%"
                        innerRadius={70}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {expenseData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value: number) => `₹${value.toLocaleString('en-IN')}`}
                        contentStyle={{ 
                          backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                          border: 'none', 
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>

                  <div className="space-y-3">
                    {expenseData.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-4 rounded-xl bg-gray-50 text-sm">
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                          <span className="font-semibold text-gray-700">{item.name}</span>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-gray-900" style={{ color: item.color }}>₹{item.value.toLocaleString('en-IN')}</p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {((item.value / totalExpenses) * 100).toFixed(0)}%
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Savings Recommendations */}
          <div className="mt-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Smart Saving Tips by Category</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {potentialSavings.map((item, index) => {
                const Icon = item.icon;
                return (
                  <div key={index} className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                    <div className="flex items-start justify-between border-b border-gray-200 pb-4 mb-4">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                          style={{ backgroundColor: `${item.color}20` }}
                        >
                          <Icon className="w-5 h-5" style={{ color: item.color }} />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">{item.category}</h3>
                          <p className="text-sm text-gray-600">₹{item.current.toLocaleString('en-IN')}/month</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Save up to</p>
                        <p className="text-xl font-bold text-emerald-600 mt-1">
                          ₹{Math.round(item.potential).toLocaleString('en-IN')}
                        </p>
                      </div>
                    </div>
                    <ul className="space-y-2">
                      {item.tips.map((tip, tipIndex) => (
                        <li key={tipIndex} className="flex items-start gap-2 text-sm">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0"></div>
                          <span className="text-gray-700">{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </div>

          {/* General Tips */}
          <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl p-6 mt-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Universal Money-Saving Strategies</h2>
            <div className="space-y-3">
              <div className="p-4 bg-white/80 rounded-lg">
                <h3 className="font-semibold text-indigo-900 mb-1">Track Every Rupee</h3>
                <p className="text-sm text-gray-600">Use apps like Walnut or Money Manager to automatically track expenses from SMS.</p>
              </div>
              <div className="p-4 bg-white/80 rounded-lg">
                <h3 className="font-semibold text-indigo-900 mb-1">The 24-Hour Rule</h3>
                <p className="text-sm text-gray-600">Wait 24 hours before making any non-essential purchase above ₹500.</p>
              </div>
              <div className="p-4 bg-white/80 rounded-lg">
                <h3 className="font-semibold text-indigo-900 mb-1">Cashless Challenge</h3>
                <p className="text-sm text-gray-600">Use UPI/cards for better tracking. Avoid cash for discretionary spending.</p>
              </div>
              <div className="p-4 bg-white/80 rounded-lg">
                <h3 className="font-semibold text-indigo-900 mb-1">Zero-Based Budgeting</h3>
                <p className="text-sm text-gray-600">Allocate every rupee a purpose at month start. Income - Expenses = 0.</p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
