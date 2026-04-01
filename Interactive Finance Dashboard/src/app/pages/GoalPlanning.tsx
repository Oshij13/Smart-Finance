import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Target, Home, GraduationCap, Car, Plane, TrendingUp } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Progress } from "../components/ui/progress";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export function GoalPlanning() {
  const [goalType, setGoalType] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [timeframe, setTimeframe] = useState("");
  const [currentSavings, setCurrentSavings] = useState("");
  const [monthlyIncome, setMonthlyIncome] = useState("");
  const [showResults, setShowResults] = useState(false);

  const calculateGoal = () => {
    if (goalType && targetAmount && timeframe && monthlyIncome) {
      setShowResults(true);
    }
  };

  const target = parseInt(targetAmount) || 0;
  const years = parseInt(timeframe) || 1;
  const current = parseInt(currentSavings) || 0;
  const income = parseInt(monthlyIncome) || 0;
  const months = years * 12;

  // Calculate required monthly SIP assuming 12% annual return
  const monthlyRate = 0.12 / 12;
  const requiredMonthly = Math.round(
    ((target - current * Math.pow(1.12, years)) * monthlyRate) / 
    (Math.pow(1 + monthlyRate, months) - 1)
  );

  const percentageOfIncome = ((requiredMonthly / income) * 100).toFixed(1);
  const currentProgress = ((current / target) * 100).toFixed(1);

  // Projection data
  const projectionData = Array.from({ length: years + 1 }, (_, i) => {
    const year = i;
    const sipContributions = requiredMonthly * 12 * year;
    const futureValueOfCurrent = current * Math.pow(1.12, year);
    const futureValueOfSIP = requiredMonthly * ((Math.pow(1 + monthlyRate, 12 * year) - 1) / monthlyRate);
    return {
      year,
      total: Math.round(futureValueOfCurrent + futureValueOfSIP),
      target: target,
    };
  });

  const goalTypes = [
    { value: "home", label: "Home Purchase", icon: Home, suggestedAmount: 5000000 },
    { value: "education", label: "Child's Education", icon: GraduationCap, suggestedAmount: 2000000 },
    { value: "car", label: "Car Purchase", icon: Car, suggestedAmount: 1000000 },
    { value: "vacation", label: "Dream Vacation", icon: Plane, suggestedAmount: 500000 },
    { value: "retirement", label: "Retirement Corpus", icon: TrendingUp, suggestedAmount: 10000000 },
    { value: "custom", label: "Custom Goal", icon: Target, suggestedAmount: 0 },
  ];

  const milestones = [
    { percentage: 25, label: "Foundation Built", achieved: parseFloat(currentProgress) >= 25 },
    { percentage: 50, label: "Halfway There", achieved: parseFloat(currentProgress) >= 50 },
    { percentage: 75, label: "Final Push", achieved: parseFloat(currentProgress) >= 75 },
    { percentage: 100, label: "Goal Achieved!", achieved: parseFloat(currentProgress) >= 100 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-500 to-orange-600 rounded-2xl p-8 text-white shadow-xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
            <Target className="w-6 h-6" />
          </div>
          <h1 className="text-3xl font-bold">Goal-Based Planning</h1>
        </div>
        <p className="text-lg text-amber-50">
          Set clear financial goals and create a personalized savings plan to achieve them.
        </p>
      </div>

      {/* Goal Selector */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {goalTypes.map((goal) => {
          const Icon = goal.icon;
          return (
            <button
              key={goal.value}
              onClick={() => {
                setGoalType(goal.value);
                if (goal.suggestedAmount > 0) setTargetAmount(goal.suggestedAmount.toString());
              }}
              className={`p-4 rounded-xl border-2 transition-all ${
                goalType === goal.value
                  ? 'border-amber-500 bg-amber-50 shadow-lg'
                  : 'border-gray-200 bg-white hover:border-amber-300'
              }`}
            >
              <Icon className={`w-8 h-8 mx-auto mb-2 ${
                goalType === goal.value ? 'text-amber-600' : 'text-gray-600'
              }`} />
              <p className="text-sm font-semibold text-center text-gray-900">{goal.label}</p>
            </button>
          );
        })}
      </div>

      {/* Input Form */}
      <Card className="border-none shadow-lg bg-white/80 backdrop-blur">
        <CardHeader>
          <CardTitle>Goal Details</CardTitle>
          <CardDescription>Tell us about your financial goal and timeline</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="target-amount">Target Amount (₹)</Label>
              <Input
                id="target-amount"
                type="number"
                placeholder="e.g., 2000000"
                value={targetAmount}
                onChange={(e) => setTargetAmount(e.target.value)}
                className="text-lg"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="timeframe">Timeframe (Years)</Label>
              <Input
                id="timeframe"
                type="number"
                placeholder="e.g., 5"
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value)}
                className="text-lg"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="current-savings">Current Savings (₹)</Label>
              <Input
                id="current-savings"
                type="number"
                placeholder="e.g., 100000"
                value={currentSavings}
                onChange={(e) => setCurrentSavings(e.target.value)}
                className="text-lg"
              />
            </div>

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
          </div>

          <Button onClick={calculateGoal} className="w-full bg-gradient-to-r from-amber-500 to-orange-600">
            Create My Goal Plan
          </Button>
        </CardContent>
      </Card>

      {/* Results */}
      {showResults && target > 0 && (
        <>
          {/* Current Progress */}
          <Card className="border-none shadow-lg bg-white/80 backdrop-blur">
            <CardHeader>
              <CardTitle>Current Progress</CardTitle>
              <CardDescription>You've saved ₹{current.toLocaleString()} towards your goal</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Progress</span>
                  <span className="font-semibold text-amber-600">{currentProgress}%</span>
                </div>
                <Progress value={parseFloat(currentProgress)} className="h-3" />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
                {milestones.map((milestone, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg border-2 text-center ${
                      milestone.achieved
                        ? 'border-amber-500 bg-amber-50'
                        : 'border-gray-200 bg-white'
                    }`}
                  >
                    <p className={`text-2xl font-bold ${
                      milestone.achieved ? 'text-amber-600' : 'text-gray-400'
                    }`}>
                      {milestone.percentage}%
                    </p>
                    <p className="text-xs text-gray-600 mt-1">{milestone.label}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Required Investment */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-none shadow-lg bg-white/80 backdrop-blur">
              <CardContent className="p-6">
                <p className="text-sm text-gray-600 mb-1">Required Monthly SIP</p>
                <p className="text-3xl font-bold text-amber-600">₹{requiredMonthly.toLocaleString()}</p>
                <p className="text-xs text-gray-500 mt-1">Assuming 12% annual returns</p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg bg-white/80 backdrop-blur">
              <CardContent className="p-6">
                <p className="text-sm text-gray-600 mb-1">As % of Income</p>
                <p className="text-3xl font-bold text-gray-900">{percentageOfIncome}%</p>
                <p className="text-xs text-gray-500 mt-1">
                  {parseFloat(percentageOfIncome) <= 20 ? 'Easily achievable' : 
                   parseFloat(percentageOfIncome) <= 35 ? 'Requires discipline' : 'Consider extending timeline'}
                </p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg bg-white/80 backdrop-blur">
              <CardContent className="p-6">
                <p className="text-sm text-gray-600 mb-1">Total Investment</p>
                <p className="text-3xl font-bold text-gray-900">₹{(requiredMonthly * months + current).toLocaleString()}</p>
                <p className="text-xs text-gray-500 mt-1">Over {years} years</p>
              </CardContent>
            </Card>
          </div>

          {/* Growth Projection */}
          <Card className="border-none shadow-lg bg-white/80 backdrop-blur">
            <CardHeader>
              <CardTitle>Goal Achievement Projection</CardTitle>
              <CardDescription>How your savings will grow over time to reach your target</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={projectionData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="year" 
                    label={{ value: 'Years', position: 'insideBottom', offset: -5 }} 
                    stroke="#6b7280"
                  />
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
                  <Line 
                    type="monotone" 
                    dataKey="total" 
                    stroke="#f59e0b" 
                    strokeWidth={3} 
                    name="Your Savings"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="target" 
                    stroke="#10b981" 
                    strokeWidth={2} 
                    strokeDasharray="5 5" 
                    name="Target Amount"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Action Steps */}
          <Card className="border-none shadow-lg bg-gradient-to-br from-amber-50 to-orange-50">
            <CardHeader>
              <CardTitle>Action Steps to Achieve Your Goal</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-4 bg-white rounded-lg">
                <h3 className="font-semibold text-amber-900 mb-1">1. Set Up Automatic SIP</h3>
                <p className="text-sm text-gray-600">
                  Start a monthly SIP of ₹{requiredMonthly.toLocaleString()} in index funds or equity mutual funds.
                </p>
              </div>
              <div className="p-4 bg-white rounded-lg">
                <h3 className="font-semibold text-amber-900 mb-1">2. Review Quarterly</h3>
                <p className="text-sm text-gray-600">
                  Check your progress every 3 months and increase SIP with salary increments.
                </p>
              </div>
              <div className="p-4 bg-white rounded-lg">
                <h3 className="font-semibold text-amber-900 mb-1">3. Stay Invested</h3>
                <p className="text-sm text-gray-600">
                  Don't panic during market corrections. Stay focused on your long-term goal.
                </p>
              </div>
              <div className="p-4 bg-white rounded-lg">
                <h3 className="font-semibold text-amber-900 mb-1">4. Bonus Investments</h3>
                <p className="text-sm text-gray-600">
                  Use bonuses, tax refunds, or windfall gains to make lump sum investments toward your goal.
                </p>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
