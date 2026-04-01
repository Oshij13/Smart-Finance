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
    <div className="space-y-6">
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
      <Card className="border-none shadow-lg bg-white/80 backdrop-blur">
        <CardHeader>
          <CardTitle>Track Your Monthly Expenses</CardTitle>
          <CardDescription>Enter your typical monthly spending in each category</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="monthly-income">Monthly Income (₹)</Label>
            <Input
              id="monthly-income"
              type="number"
              placeholder="e.g., 50000"
              value={monthlyIncome}
              onChange={(e) => setMonthlyIncome(e.target.value)}
              className="text-lg"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {expenseCategories.map((category) => {
              const Icon = category.icon;
              return (
                <div key={category.key} className="space-y-2">
                  <Label htmlFor={category.key} className="flex items-center gap-2">
                    <Icon className="w-4 h-4" style={{ color: category.color }} />
                    {category.label}
                  </Label>
                  <Input
                    id={category.key}
                    type="number"
                    placeholder="₹"
                    value={expenses[category.key as keyof typeof expenses]}
                    onChange={(e) => handleExpenseChange(category.key, e.target.value)}
                  />
                </div>
              );
            })}
          </div>

          <Button onClick={analyzeSpending} className="w-full bg-gradient-to-r from-indigo-500 to-blue-600">
            Analyze My Spending
          </Button>
        </CardContent>
      </Card>

      {/* Results */}
      {showResults && income > 0 && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-none shadow-lg bg-white/80 backdrop-blur">
              <CardContent className="p-6">
                <p className="text-sm text-gray-600 mb-1">Total Monthly Expenses</p>
                <p className="text-3xl font-bold text-gray-900">₹{totalExpenses.toLocaleString()}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {((totalExpenses / income) * 100).toFixed(0)}% of income
                </p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg bg-white/80 backdrop-blur">
              <CardContent className="p-6">
                <p className="text-sm text-gray-600 mb-1">Current Savings Rate</p>
                <p className={`text-3xl font-bold ${
                  parseFloat(savingsRate) >= 20 ? 'text-emerald-600' : 
                  parseFloat(savingsRate) >= 10 ? 'text-amber-600' : 'text-rose-600'
                }`}>
                  {savingsRate}%
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {parseFloat(savingsRate) >= 20 ? 'Excellent!' : 
                   parseFloat(savingsRate) >= 10 ? 'Good, can improve' : 'Needs attention'}
                </p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg bg-white/80 backdrop-blur">
              <CardContent className="p-6">
                <p className="text-sm text-gray-600 mb-1">Potential Monthly Savings</p>
                <p className="text-3xl font-bold text-emerald-600">₹{Math.round(totalPotentialSavings).toLocaleString()}</p>
                <p className="text-xs text-gray-500 mt-1">With smart cutbacks</p>
              </CardContent>
            </Card>
          </div>

          {/* Expense Breakdown */}
          {expenseData.length > 0 && (
            <Card className="border-none shadow-lg bg-white/80 backdrop-blur">
              <CardHeader>
                <CardTitle>Spending Breakdown</CardTitle>
                <CardDescription>Where your money is going each month</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={expenseData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {expenseData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value: number) => `₹${value.toLocaleString()}`}
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
                      <div key={index} className="flex items-center justify-between p-3 rounded-lg border border-gray-200">
                        <div className="flex items-center gap-3">
                          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: item.color }}></div>
                          <span className="font-medium text-gray-900">{item.name}</span>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-gray-900">₹{item.value.toLocaleString()}</p>
                          <p className="text-xs text-gray-600">
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
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Smart Saving Tips by Category</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {potentialSavings.map((item, index) => {
                const Icon = item.icon;
                return (
                  <Card key={index} className="border-none shadow-lg bg-white/80 backdrop-blur">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-10 h-10 rounded-lg flex items-center justify-center"
                            style={{ backgroundColor: `${item.color}20` }}
                          >
                            <Icon className="w-5 h-5" style={{ color: item.color }} />
                          </div>
                          <div>
                            <CardTitle className="text-lg">{item.category}</CardTitle>
                            <p className="text-sm text-gray-600">₹{item.current.toLocaleString()}/month</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">Save up to</p>
                          <p className="text-xl font-bold text-emerald-600">
                            ₹{Math.round(item.potential).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {item.tips.map((tip, tipIndex) => (
                          <li key={tipIndex} className="flex items-start gap-2 text-sm">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5"></div>
                            <span className="text-gray-700">{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* General Tips */}
          <Card className="border-none shadow-lg bg-gradient-to-br from-indigo-50 to-blue-50">
            <CardHeader>
              <CardTitle>Universal Money-Saving Strategies</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-4 bg-white rounded-lg">
                <h3 className="font-semibold text-indigo-900 mb-1">Track Every Rupee</h3>
                <p className="text-sm text-gray-600">Use apps like Walnut or Money Manager to automatically track expenses from SMS.</p>
              </div>
              <div className="p-4 bg-white rounded-lg">
                <h3 className="font-semibold text-indigo-900 mb-1">The 24-Hour Rule</h3>
                <p className="text-sm text-gray-600">Wait 24 hours before making any non-essential purchase above ₹500.</p>
              </div>
              <div className="p-4 bg-white rounded-lg">
                <h3 className="font-semibold text-indigo-900 mb-1">Cashless Challenge</h3>
                <p className="text-sm text-gray-600">Use UPI/cards for better tracking. Avoid cash for discretionary spending.</p>
              </div>
              <div className="p-4 bg-white rounded-lg">
                <h3 className="font-semibold text-indigo-900 mb-1">Zero-Based Budgeting</h3>
                <p className="text-sm text-gray-600">Allocate every rupee a purpose at month start. Income - Expenses = 0.</p>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
