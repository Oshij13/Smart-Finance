import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { 
  Download, 
  Sparkles, 
  TrendingUp, 
  TrendingDown, 
  ArrowRight,
  Target,
  Zap,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Calendar,
  Shield,
  Wallet,
  DollarSign,
  Activity,
  PiggyBank
} from "lucide-react";
import { Progress } from "../components/ui/progress";
import { Badge } from "../components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";

export function DashboardHome() {
  const [currentMonth] = useState("April 2026");
  const userName = localStorage.getItem("userName") || "User";

  // User's personalized data
  const userData = {
    monthlyIncome: 75000,
    totalSavings: 145000,
    monthlyExpenses: 52500,
    investments: 85000,
    emergencyFundTarget: 226398,
    emergencyFundCurrent: 45000,
    savingsTarget: 15093,
    savingsCurrent: 12000,
    currentPhase: "Phase 1 — Building Habit",
    riskProfile: "Moderate"
  };

  // Metrics with trends
  const metrics = [
    { 
      label: "Monthly Income", 
      value: userData.monthlyIncome, 
      trend: "+8%", 
      trendUp: true, 
      subtext: "vs last month",
      icon: DollarSign,
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    { 
      label: "Total Savings", 
      value: userData.totalSavings, 
      trend: "+12%", 
      trendUp: true, 
      subtext: "growing well",
      icon: PiggyBank,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50"
    },
    { 
      label: "Monthly Expenses", 
      value: userData.monthlyExpenses, 
      trend: "-3%", 
      trendUp: false, 
      subtext: "reduced nicely",
      icon: Wallet,
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    },
    { 
      label: "Investments", 
      value: userData.investments, 
      trend: "+15%", 
      trendUp: true, 
      subtext: "on track",
      icon: TrendingUp,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50"
    },
  ];

  // Income vs Expenses trend
  const incomeExpenseData = [
    { month: "Nov", income: 70000, expenses: 58000 },
    { month: "Dec", income: 72000, expenses: 56000 },
    { month: "Jan", income: 73000, expenses: 55000 },
    { month: "Feb", income: 75000, expenses: 54000 },
    { month: "Mar", income: 75000, expenses: 53000 },
    { month: "Apr", income: 75000, expenses: 52500 },
  ];

  // Expense breakdown
  const expenseData = [
    { name: "Essentials", value: 26250, color: "#3b82f6", status: "good" },
    { name: "Discretionary", value: 15750, color: "#8b5cf6", status: "high" },
    { name: "Savings", value: 12000, color: "#10b981", status: "good" },
    { name: "Dining", value: 8000, color: "#f59e0b", status: "overspending" },
    { name: "Transport", value: 5500, color: "#ec4899", status: "good" },
  ];

  const totalExpense = expenseData.reduce((sum, item) => sum + item.value, 0);
  const savingsPercentage = ((userData.savingsCurrent / userData.monthlyIncome) * 100).toFixed(0);

  // AI Insights
  const aiInsights = [
    { type: "warning", icon: AlertTriangle, message: "You overspent ₹2,000 on dining this month", color: "text-amber-600" },
    { type: "success", icon: CheckCircle2, message: "Great! You saved ₹3,000 more than last month", color: "text-emerald-600" },
    { type: "tip", icon: Sparkles, message: "You can save ₹1,500 by reducing subscriptions", color: "text-blue-600" },
  ];

  // Recent Activity
  const recentActivity = [
    { action: "AI suggested increase SIP by ₹2,000", time: "2 hours ago", status: "pending" },
    { action: "New investment opportunity detected", time: "5 hours ago", status: "new" },
    { action: "Tax calculated for FY 2025-26", time: "1 day ago", status: "completed" },
    { action: "Budget exceeded in Dining category", time: "2 days ago", status: "alert" },
  ];

  // Financial Goals
  const goals = [
    { 
      name: "Emergency Fund", 
      current: userData.emergencyFundCurrent, 
      target: userData.emergencyFundTarget, 
      timeline: "8 months left",
      icon: Shield,
      color: "bg-blue-500"
    },
    { 
      name: "Vacation Fund", 
      current: 35000, 
      target: 80000, 
      timeline: "6 months left",
      icon: Calendar,
      color: "bg-purple-500"
    },
  ];

  // Journey phases
  const phases = [
    { name: "Building Habit", status: "current", completed: true },
    { name: "Growing Wealth", status: "next", completed: false },
    { name: "Financial Freedom", status: "future", completed: false },
  ];

  // Modules progress
  const modules = [
    { name: "Savings Planner", progress: 75, status: "Active" },
    { name: "Investments", progress: 45, status: "In Progress" },
    { name: "Tax Planner", progress: 90, status: "Completed" },
    { name: "Goal Tracker", progress: 60, status: "Active" },
    { name: "Retirement", progress: 30, status: "Started" },
  ];

  return (
    <div className="space-y-6">
      {/* Hero Section - Personalized Greeting */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 p-8 text-white shadow-2xl">
        <div className="relative z-10">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-3xl lg:text-4xl font-bold mb-2">
                Good morning, {userName} 👋
              </h1>
              <p className="text-lg text-blue-100 mb-6">
                Your financial snapshot for {currentMonth}
              </p>
              <div className="flex flex-wrap gap-3">
                <Button className="bg-white text-blue-700 hover:bg-blue-50 shadow-lg">
                  <Download className="w-4 h-4 mr-2" />
                  Export Report
                </Button>
                <Button variant="outline" className="border-white/30 text-white hover:bg-white/10 backdrop-blur-sm">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Ask AI Advisor
                </Button>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-1/2 w-64 h-64 bg-purple-400/10 rounded-full blur-3xl"></div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <Card key={index} className="border-0 shadow-lg bg-white/80 backdrop-blur hover:shadow-xl transition-all">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-11 h-11 rounded-xl ${metric.bgColor} flex items-center justify-center`}>
                    <Icon className={`w-6 h-6 ${metric.color}`} />
                  </div>
                  <div className={`flex items-center gap-1 text-sm font-semibold ${
                    metric.trendUp ? 'text-emerald-600' : 'text-rose-600'
                  }`}>
                    {metric.trendUp ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                    {metric.trend}
                  </div>
                </div>
                <p className="text-sm text-slate-600 mb-1">{metric.label}</p>
                <p className="text-2xl font-bold text-slate-900">₹{metric.value.toLocaleString()}</p>
                <p className="text-xs text-slate-500 mt-1">{metric.subtext}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Personalized Progress Layer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Emergency Fund Progress */}
        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50 lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-blue-900">
              <Shield className="w-5 h-5" />
              Emergency Fund Progress
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between items-baseline mb-2">
                <span className="text-2xl font-bold text-slate-900">
                  ₹{userData.emergencyFundCurrent.toLocaleString()}
                </span>
                <span className="text-sm text-slate-600">
                  / ₹{userData.emergencyFundTarget.toLocaleString()}
                </span>
              </div>
              <Progress 
                value={(userData.emergencyFundCurrent / userData.emergencyFundTarget) * 100} 
                className="h-3"
              />
              <p className="text-sm text-slate-600 mt-2">
                {((userData.emergencyFundCurrent / userData.emergencyFundTarget) * 100).toFixed(0)}% complete • 
                About 8 months to reach your goal
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="p-3 rounded-xl bg-white/60 backdrop-blur">
                <p className="text-xs text-slate-600 mb-1">Savings Rate</p>
                <p className="text-xl font-bold text-slate-900">
                  ₹{userData.savingsCurrent.toLocaleString()}
                </p>
                <p className="text-xs text-slate-500">Target: ₹{userData.savingsTarget.toLocaleString()}</p>
              </div>
              <div className="p-3 rounded-xl bg-white/60 backdrop-blur">
                <p className="text-xs text-slate-600 mb-1">Current Phase</p>
                <Badge className="bg-blue-600 text-white border-0 mt-1">
                  {userData.currentPhase}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Next Best Action */}
        <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-50 to-teal-50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-emerald-900">
              <Zap className="w-5 h-5" />
              Your Next Best Action
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-4 rounded-xl bg-white/60 backdrop-blur border border-emerald-200">
              <p className="font-semibold text-slate-900 mb-2">Increase savings by ₹1,000</p>
              <p className="text-sm text-slate-600 mb-3">
                Boost your emergency fund faster
              </p>
              <Button size="sm" className="w-full bg-emerald-600 hover:bg-emerald-700">
                Increase Savings
              </Button>
            </div>

            <div className="p-3 rounded-xl bg-white/40 backdrop-blur">
              <p className="text-xs text-slate-600 mb-1">Next Milestone</p>
              <p className="text-sm font-semibold text-slate-900">
                Emergency fund complete in 8 months
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Income vs Expenses */}
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Income vs Expenses</CardTitle>
              <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                Trending Down
              </Badge>
            </div>
            <CardDescription>Your spending is decreasing month over month</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={incomeExpenseData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip 
                  formatter={(value: number) => `₹${value.toLocaleString()}`}
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                    border: 'none', 
                    borderRadius: '12px',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Line type="monotone" dataKey="income" stroke="#3b82f6" strokeWidth={3} dot={{ r: 5 }} />
                <Line type="monotone" dataKey="expenses" stroke="#f59e0b" strokeWidth={3} dot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Expense Breakdown */}
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur">
          <CardHeader>
            <CardTitle>Expense Breakdown</CardTitle>
            <CardDescription>
              <span className="text-rose-600 font-semibold">Overspending on Dining</span> • 
              <span className="text-emerald-600 ml-1">On track for essentials</span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={expenseData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={110}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {expenseData.map((entry, index) => (
                      <Cell key={`pie-cell-${entry.name}-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => `₹${value.toLocaleString()}`}
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                      border: 'none', 
                      borderRadius: '12px',
                      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-center">
                  <p className="text-3xl font-bold text-slate-900">{savingsPercentage}%</p>
                  <p className="text-xs text-slate-600">saved</p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-4">
              {expenseData.map((item, index) => (
                <div key={`legend-${item.name}-${index}`} className="flex items-center gap-2 text-sm">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                  <span className="text-slate-700">{item.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Insights + Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Smart Insights */}
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-600" />
              Smart Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {aiInsights.map((insight, index) => {
              const Icon = insight.icon;
              return (
                <div key={index} className="flex items-start gap-3 p-4 rounded-xl bg-slate-50 border border-slate-100">
                  <Icon className={`w-5 h-5 ${insight.color} flex-shrink-0 mt-0.5`} />
                  <p className="text-sm text-slate-700 flex-1">{insight.message}</p>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                  activity.status === 'completed' ? 'bg-emerald-500' :
                  activity.status === 'alert' ? 'bg-rose-500' :
                  activity.status === 'new' ? 'bg-blue-500' :
                  'bg-amber-500'
                }`}></div>
                <div className="flex-1">
                  <p className="text-sm text-slate-700">{activity.action}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{activity.time}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Financial Goals */}
      <Card className="border-0 shadow-lg bg-white/80 backdrop-blur">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Financial Goals
          </CardTitle>
          <CardDescription>Track your progress towards major milestones</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {goals.map((goal, index) => {
              const Icon = goal.icon;
              const progress = (goal.current / goal.target) * 100;
              return (
                <div key={index} className="p-5 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl ${goal.color} flex items-center justify-center`}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">{goal.name}</p>
                        <p className="text-xs text-slate-500">{goal.timeline}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {progress.toFixed(0)}%
                    </Badge>
                  </div>
                  <Progress value={progress} className="h-2 mb-2" />
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">₹{goal.current.toLocaleString()}</span>
                    <span className="text-slate-500">₹{goal.target.toLocaleString()}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Journey Tracker */}
      <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-indigo-50">
        <CardHeader>
          <CardTitle>Your Financial Journey</CardTitle>
          <CardDescription>Building towards financial freedom</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between gap-4">
            {phases.map((phase, index) => (
              <div key={index} className="flex-1">
                <div className={`p-4 rounded-xl text-center transition-all ${
                  phase.status === 'current' 
                    ? 'bg-gradient-to-br from-purple-600 to-indigo-600 text-white shadow-lg' 
                    : phase.completed
                    ? 'bg-white/60 text-slate-700'
                    : 'bg-white/40 text-slate-500'
                }`}>
                  <p className="font-semibold text-sm mb-1">{phase.name}</p>
                  {phase.status === 'current' && (
                    <Badge className="bg-white/20 text-white border-0 text-xs">Current</Badge>
                  )}
                  {phase.completed && phase.status !== 'current' && (
                    <CheckCircle2 className="w-5 h-5 mx-auto text-emerald-600" />
                  )}
                  {!phase.completed && phase.status !== 'current' && (
                    <Clock className="w-5 h-5 mx-auto opacity-50" />
                  )}
                </div>
                {index < phases.length - 1 && (
                  <div className="h-1 bg-slate-200 my-2"></div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* AI Modules Progress */}
      <Card className="border-0 shadow-lg bg-white/80 backdrop-blur">
        <CardHeader>
          <CardTitle>Module Progress</CardTitle>
          <CardDescription>Complete modules to unlock better insights</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {modules.map((module, index) => (
              <div key={index} className="p-4 rounded-xl border border-slate-200 hover:border-blue-300 transition-all">
                <div className="flex items-center justify-between mb-3">
                  <p className="font-semibold text-slate-900 text-sm">{module.name}</p>
                  <Badge variant={
                    module.status === 'Completed' ? 'default' :
                    module.status === 'Active' ? 'secondary' :
                    'outline'
                  } className="text-xs">
                    {module.status}
                  </Badge>
                </div>
                <Progress value={module.progress} className="h-2 mb-2" />
                <p className="text-xs text-slate-600">{module.progress}% complete</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}