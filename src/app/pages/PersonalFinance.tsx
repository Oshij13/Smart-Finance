import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { BookOpen, TrendingUp, Shield, Wallet } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export function PersonalFinance() {
  const [income, setIncome] = useState("");
  const [showResults, setShowResults] = useState(false);

  const handleCalculate = () => {
    if (income) setShowResults(true);
  };

  const annualIncome = parseInt(income) || 0;
  const monthlyIncome = annualIncome / 12;

  const budgetBreakdown = [
    { category: "Needs (50%)", amount: monthlyIncome * 0.5, percentage: 50, color: "#10b981" },
    { category: "Wants (30%)", amount: monthlyIncome * 0.3, percentage: 30, color: "#f59e0b" },
    { category: "Savings (20%)", amount: monthlyIncome * 0.2, percentage: 20, color: "#3b82f6" },
  ];

  const tips = [
    {
      icon: Wallet,
      title: "Follow the 50-30-20 Rule",
      description: "Allocate 50% for needs, 30% for wants, and 20% for savings and debt repayment."
    },
    {
      icon: Shield,
      title: "Build an Emergency Fund",
      description: "Aim for 6 months of expenses saved in a liquid account for unexpected situations."
    },
    {
      icon: TrendingUp,
      title: "Track Your Expenses",
      description: "Use apps or spreadsheets to monitor where your money goes each month."
    },
    {
      icon: BookOpen,
      title: "Educate Yourself",
      description: "Read books like 'Let's Talk Money' by Monika Halan for India-specific advice."
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-cyan-600 rounded-2xl p-8 text-white shadow-xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
            <BookOpen className="w-6 h-6" />
          </div>
          <h1 className="text-3xl font-bold">Personal Finance Basics</h1>
        </div>
        <p className="text-lg text-blue-50">
          Master the fundamentals of money management and build a strong financial foundation.
        </p>
      </div>

      {/* Income Input */}
      <Card className="border-none shadow-lg bg-white/80 backdrop-blur">
        <CardHeader>
          <CardTitle>Enter Your Annual Income</CardTitle>
          <CardDescription>We'll create a personalized budget plan based on your salary</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="income">Annual Gross Income (₹)</Label>
            <Input
              id="income"
              type="number"
              placeholder="e.g., 600000"
              value={income}
              onChange={(e) => setIncome(e.target.value)}
              className="text-lg"
            />
          </div>
          <Button onClick={handleCalculate} className="w-full bg-gradient-to-r from-blue-500 to-cyan-600">
            Generate My Budget Plan
          </Button>
        </CardContent>
      </Card>

      {/* Results */}
      {showResults && (
        <>
          {/* Budget Breakdown Chart */}
          <Card className="border-none shadow-lg bg-white/80 backdrop-blur">
            <CardHeader>
              <CardTitle>Your Monthly Budget Breakdown</CardTitle>
              <CardDescription>Based on the 50-30-20 rule for ₹{monthlyIncome.toLocaleString()}/month</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={budgetBreakdown}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="category" stroke="#6b7280" />
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
                  <Bar dataKey="amount" radius={[8, 8, 0, 0]}>
                    {budgetBreakdown.map((entry, index) => (
                      <rect key={index} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                {budgetBreakdown.map((item, index) => (
                  <div key={index} className="p-4 rounded-lg border border-gray-200">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                      <span className="font-semibold text-gray-900">{item.category}</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">₹{item.amount.toLocaleString()}</p>
                    <p className="text-sm text-gray-600">{item.percentage}% of income</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Tips Grid */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Essential Financial Tips</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {tips.map((tip, index) => {
            const Icon = tip.icon;
            return (
              <Card key={index} className="border-none shadow-lg bg-white/80 backdrop-blur">
                <CardHeader>
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center mb-3">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-lg">{tip.title}</CardTitle>
                  <CardDescription className="text-base">{tip.description}</CardDescription>
                </CardHeader>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Resources */}
      <Card className="border-none shadow-lg bg-gradient-to-br from-blue-50 to-cyan-50">
        <CardHeader>
          <CardTitle>Recommended Resources</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="p-4 bg-white rounded-lg">
            <h3 className="font-semibold text-blue-900">📚 Book: Let's Talk Money by Monika Halan</h3>
            <p className="text-sm text-gray-600">India-specific personal finance guide for beginners</p>
          </div>
          <div className="p-4 bg-white rounded-lg">
            <h3 className="font-semibold text-blue-900">🎧 Podcast: Paisa Vaisa by IVM Podcasts</h3>
            <p className="text-sm text-gray-600">Weekly discussions on money management in India</p>
          </div>
          <div className="p-4 bg-white rounded-lg">
            <h3 className="font-semibold text-blue-900">📰 Newsletter: Finshots</h3>
            <p className="text-sm text-gray-600">Daily finance news explained in simple terms</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
