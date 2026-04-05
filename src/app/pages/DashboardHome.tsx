import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router";
import { getUserData, setUserData } from "../store/userStore";

import html2canvas from "html2canvas";
import jsPDF from "jspdf";

import Onboarding from "./Onboarding";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Legend,
} from "recharts";

export default function DashboardHome() {
  const navigate = useNavigate();

  const onboardingData = getUserData();

  if (!onboardingData) {
    return <Onboarding />;
  }

  const colorMap: Record<string, string> = {
    red: "text-red-600 bg-red-100",
    orange: "text-orange-600 bg-orange-100",
    blue: "text-blue-600 bg-blue-100",
    green: "text-green-600 bg-green-100",
  };

  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [goalInput, setGoalInput] = useState(onboardingData?.goal || "");

  useEffect(() => {
    if (!onboardingData) {
      setLoading(false);
      return;
    }

    const fetchAnalysis = async () => {
      try {
        const response = await fetch("https://smart-finance-backend-w4ou.onrender.com/api/analyze-finance", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(onboardingData),
        });

        const data = await response.json();
        setAnalysis(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalysis();
  }, []);

  // ✅ PDF DOWNLOAD FUNCTION
  const handleDownloadPDF = async () => {
    const element = document.getElementById("dashboard-content");
    if (!element) return;

    const canvas = await html2canvas(element, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "mm", "a4");

    const imgWidth = 210;
    const pageHeight = 295;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    pdf.save("SmartFinanceDashboard.pdf");
  };

  if (loading) return <div className="p-6">Loading your dashboard...</div>;

  const income = Number(onboardingData?.income || 0);
  const expenses = Number(onboardingData?.expenses || 0);
  const investments = Number(onboardingData?.investments || 0);
  const emergencyFund = Number(onboardingData?.emergencyFund || 0);

  // ✅ DERIVED SAVINGS
  const savings = income - (expenses + investments);

  const emergencyTarget = expenses * 6;
  const emergencyProgress =
    emergencyTarget > 0 ? (emergencyFund / emergencyTarget) * 100 : 0;

  const savingsRate = income > 0 ? (savings / income) * 100 : 0;
  const emergencyMonths = expenses > 0 ? emergencyFund / expenses : 0;
  const investmentRate = income > 0 ? (investments / income) * 100 : 0;

  // Scoring logic (out of 100)
  let score = 0;

  // Savings (40 points)
  if (savingsRate >= 20) score += 40;
  else score += (savingsRate / 20) * 40;

  // Emergency fund (30 points)
  if (emergencyMonths >= 6) score += 30;
  else score += (emergencyMonths / 6) * 30;

  // Investment (30 points)
  if (investmentRate >= 20) score += 30;
  else score += (investmentRate / 20) * 30;

  score = Math.round(score);

  // 🎯 GOAL LOGIC
  const goal = onboardingData?.goal || "Wealth Building";

  let target = 0;
  if (goal.toLowerCase().includes("emergency")) {
    target = expenses * 6;
  } else if (goal.toLowerCase().includes("car")) {
    target = 500000;
  } else if (goal.toLowerCase().includes("house")) {
    target = 2000000;
  } else {
    target = 100000;
  }

  const progress = target > 0 ? (savings / target) * 100 : 0;

  // 💡 SMART INSIGHTS
  const insights: string[] = [];

  // ✅ AI INSIGHTS
  if (analysis?.insights) {
    if (Array.isArray(analysis.insights)) {
      analysis.insights.forEach((insight: string) => {
        // Clean up markdown
        const cleaned = insight
          .replace(/\*\*/g, "")
          .replace(/###/g, "")
          .replace(/^[-*•\d.]+\s*/, "")
          .trim();
        if (cleaned && !insights.includes(cleaned)) {
          insights.push(cleaned);
        }
      });
    } else if (typeof analysis.insights === "string") {
      // Split by newlines OR bullet markers to ensure separate points
      const rawLines = (analysis.insights as string)
        .split(/\n|(?=\s[-*•\d.]+\s)/); // Split by newline OR lookahead for bullet

      rawLines.forEach((line: string) => {
        const trimmed = line.trim();
        // Skip headers, action labels, or empty lines
        if (
          !trimmed ||
          trimmed.includes("ACTION:") ||
          trimmed.includes("Action Step") ||
          trimmed.includes("Insights") ||
          trimmed.includes("Financial Analysis")
        ) return;

        // Clean up markdown and bullets
        const cleaned = trimmed
          .replace(/\*\*/g, "")
          .replace(/###/g, "")
          .replace(/^[-*•\d.]+\s*/, "")
          .trim();

        if (cleaned && cleaned.length > 10 && !insights.includes(cleaned)) {
          insights.push(cleaned);
        }
      });
    }
  }

  let action = "";

  // ✅ If backend sends direct recommendation
  if (analysis?.recommendation) {
    action = analysis.recommendation;
  }

  // ✅ fallback (if insights is string)
  else if (typeof analysis?.insights === "string") {
    const parts = analysis.insights.split("ACTION:");
    const actionPart = parts[1] || "";
    action = actionPart
      .replace(/\*\*/g, "") // Strip bolding
      .replace(/###/g, "") // Strip headers
      .replace(/^-+\s*/, "") // Strip leading dashes
      .trim();
  }

  // ⚡ NEXT ACTIONS LOGIC
  const actions: { text: string; action: string }[] = [];

  if (savingsRate < 20) {
    actions.push({ text: "Increase your savings rate", action: "How can I save more money?" });
  }
  if (emergencyMonths < 6) {
    actions.push({ text: "Build your emergency fund", action: "How to build emergency fund?" });
  }
  if (investmentRate < 15) {
    actions.push({ text: "Start investing more", action: "Best investment options for me?" });
  }
  if (expenses > income * 0.7) {
    actions.push({ text: "Reduce unnecessary expenses", action: "How to reduce expenses?" });
  }
  if (actions.length === 0) {
    actions.push({ text: "Optimize your financial plan", action: "How to optimize my finances?" });
  }

  const cards = [
    {
      title: "Income",
      value: income,
      color: "text-green-600",
      bg: "bg-green-50",
      icon: "💰",
      insight: "Stable income flow",
    },
    {
      title: "Expenses",
      value: expenses,
      color: "text-red-500",
      bg: "bg-red-50",
      icon: "💸",
      insight: expenses > income * 0.6 ? "High spending ⚠️" : "Controlled spending ✅",
    },
    {
      title: "Savings",
      value: savings,
      color: "text-blue-600",
      bg: "bg-blue-50",
      icon: "📈",
      insight: savingsRate >= 20 ? "Strong savings 💪" : savingsRate > 0 ? "Building phase ⚠️" : "No savings 🚨",
    },
    {
      title: "Investments",
      value: investments,
      color: "text-purple-600",
      bg: "bg-purple-50",
      icon: "💎",
      insight: investmentRate > 15 ? "Investing expert 🚀" : "Start investing more 📈",
    },
  ];

  function generateFinancialInsight({
    income,
    expenses,
    savings,
    investments,
    emergencyMonths = 0,
  }: {
    income: number;
    expenses: number;
    savings: number;
    investments: number;
    emergencyMonths?: number;
  }) {
    const expenseRatio = expenses / income;
    const savingsRatio = savings / income;

    // 🚨 Critical Case
    if (expenses > income) {
      return {
        message:
          "Your expenses exceed your income, which is financially unsustainable. Focus on cutting costs immediately and stabilizing your cash flow.",
        color: "red",
        icon: "🚨",
      };
    }

    // 🔴 High Spending
    if (expenseRatio > 0.7) {
      return {
        message:
          "A large portion of your income is going into expenses. Try reducing discretionary spending and optimize your monthly budget.",
        color: "red",
        icon: "⚠️",
      };
    }

    // 🟠 Low Savings
    if (savingsRatio < 0.2) {
      return {
        message:
          "Your savings rate is low. Aim to save at least 20% of your income to build financial security.",
        color: "orange",
        icon: "📊",
      };
    }

    // 🟡 Weak Emergency Fund
    if (emergencyMonths < 3) {
      return {
        message:
          "Your emergency fund is insufficient. Build at least 3–6 months of expenses as a safety net.",
        color: "orange",
        icon: "🛡️",
      };
    }

    // 🔵 Low Investments
    if (investments < savings * 0.3) {
      return {
        message:
          "You're saving well but not investing enough. Consider allocating more funds towards investments for long-term growth.",
        color: "blue",
        icon: "📈",
      };
    }

    // 🟢 Strong Financial Health
    return {
      message:
        "You're managing your finances very well. Keep optimizing your investments and planning for long-term wealth creation.",
      color: "green",
      icon: "🏆",
    };
  }

  const insight = generateFinancialInsight({
    income,
    expenses,
    savings,
    investments,
    emergencyMonths,
  });

  return (
    <div id="dashboard-content" className="p-6">
      <div className="space-y-6">

        {/* TOP */}
        {/* HEADER */}
        <div className="flex justify-between items-center bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 rounded-2xl shadow-lg">
          <div>
            <h1 className="text-2xl font-bold">
              Hey {onboardingData?.name || "User"} 👋
            </h1>
            <p className="text-sm opacity-90">Your financial dashboard</p>
          </div>

          {/* ✅ BUTTON GROUP */}
          <div className="flex gap-3">
            <button
              onClick={() => navigate("/ai-advisor")}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-transparent text-white border border-white/30 hover:bg-white/10 transition-all duration-200 hover:scale-105 hover:shadow-lg focus:ring-2 focus:ring-purple-500/50 outline-none"
            >
              ✨ AI Advisor
            </button>

            <button
              onClick={handleDownloadPDF}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-transparent text-white border border-white/30 hover:bg-white/10 transition-all duration-200 hover:scale-105 hover:shadow-lg focus:ring-2 focus:ring-purple-500/50 outline-none"
            >
              📄 Download PDF
            </button>
          </div>
        </div>

        {/* 👤 PROFILE CARD */}
        <div className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold">
              {(onboardingData?.name || "U")[0]}
            </div>

            <div>
              <h2 className="text-lg font-semibold">{onboardingData?.name || "User"}</h2>
              <p className="text-sm text-gray-500">Monthly Income: ₹{Number(onboardingData?.income || 0).toLocaleString('en-IN')}</p>
              <p className="text-xs text-gray-400 mt-1">
                {onboardingData?.income > 50000 ? "Growing Investor" : "Beginner Investor"}
              </p>
            </div>
          </div>

          <div className="text-right">
            {!isEditingGoal ? (
              <>
                <p className="text-sm text-gray-500">Primary Goal</p>
                <p className="font-semibold text-blue-600">{onboardingData?.goal || "Wealth Building"}</p>
                <button onClick={() => setIsEditingGoal(true)} className="text-xs text-blue-500 mt-1 hover:underline focus:ring-2 focus:ring-purple-500/50 outline-none">Edit</button>
              </>
            ) : (
              <div className="flex flex-col items-end gap-2">
                <input value={goalInput} onChange={(e) => setGoalInput(e.target.value)} className="border px-2 py-1 rounded text-sm focus:ring-2 focus:ring-purple-500/50 outline-none" placeholder="Enter goal" />
                <div className="flex gap-2">
                  <button onClick={() => { const updated = { ...onboardingData, goal: goalInput }; setUserData(updated); setIsEditingGoal(false); }} className="text-xs px-2 py-1 bg-green-500 text-white rounded focus:ring-2 focus:ring-purple-500/50 outline-none">Save</button>
                  <button onClick={() => setIsEditingGoal(false)} className="text-xs px-2 py-1 bg-gray-200 rounded focus:ring-2 focus:ring-purple-500/50 outline-none">Cancel</button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* CORE STATUS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 💯 FINANCIAL HEALTH SCORE */}
          <div className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">💯 Financial Health</h3>
              <span className="text-2xl font-bold text-blue-600">{score}/100</span>
            </div>
            <div className="w-full bg-gray-200 h-3 rounded-full mb-4">
              <div className="h-3 rounded-full transition-all" style={{ width: `${score}%`, backgroundColor: score > 75 ? "#22c55e" : score > 50 ? "#f59e0b" : "#ef4444" }} />
            </div>
            <div className={`mt-2 px-3 py-2 rounded-lg text-sm flex items-center gap-2 ${colorMap[insight.color]}`}>
              <span>{insight.icon}</span>
              <span>{insight.message}</span>
            </div>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div><p className="text-gray-500">Savings</p><p className="font-semibold">{savingsRate.toFixed(1)}%</p></div>
              <div><p className="text-gray-500">Emergency</p><p className="font-semibold">{emergencyMonths.toFixed(1)} months</p></div>
              <div><p className="text-gray-500">Investments</p><p className="font-semibold">{investmentRate.toFixed(1)}%</p></div>
            </div>
          </div>

          {/* 🎯 GOAL PROGRESS TRACKER */}
          <div className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-semibold text-gray-800">🎯 Goal Progress</h3>
              <span className="text-sm text-gray-500">{progress.toFixed(0)}%</span>
            </div>
            <p className="text-sm text-gray-600 mb-2">{goal}</p>
            <div className="w-full bg-gray-200 h-3 rounded-full mb-3">
              <div className="bg-blue-500 h-3 rounded-full transition-all" style={{ width: `${Math.min(progress, 100)}%` }} />
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              <span>₹{savings.toLocaleString('en-IN')}</span>
              <span>Target: ₹{target.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        {/* FINANCIAL SNAPSHOT */}
        {/* CARDS */}
        <div className="grid grid-cols-4 gap-4">
          {cards.map((card, i) => (
            <div key={i} className={`p-6 rounded-2xl shadow-sm hover:shadow-md transition ${card.bg}`}>
              <div className="flex justify-between items-center mb-3">
                <span className="text-xl">{card.icon}</span>
                <span className="text-xs text-gray-400">Monthly</span>
              </div>
              <p className="text-sm text-gray-500">{card.title}</p>
              <h2 className={`text-2xl font-bold ${card.color}`}>₹{card.value.toLocaleString('en-IN')}</h2>
              <p className={`text-xs mt-2 font-medium ${card.insight.includes("⚠️") ? "text-red-500" : "text-green-600"}`}>{card.insight}</p>
            </div>
          ))}
        </div>

        {/* VISUAL */}
        {/* CHARTS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 50/30/20 RULE GRAPH */}
          <div className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">⚖️ 50/30/20 Rule Analysis</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={[{ name: "Needs(50%)", Target: income * 0.50, Actual: expenses * 0.625 }, { name: "Wants(30%)", Target: income * 0.30, Actual: expenses * 0.375 }, { name: "Savings(20%)", Target: income * 0.20, Actual: savings + investments }]} margin={{ top: 10, right: 5, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" fontSize={12} tickMargin={8} />
                <YAxis fontSize={11} tickFormatter={(val) => `₹${val >= 100000 ? (val / 100000) + 'L' : val >= 1000 ? (val / 1000) + 'k' : val}`} />
                <Tooltip formatter={(value: any) => `₹${Number(value).toLocaleString('en-IN')}`} cursor={{ fill: '#f1f5f9' }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Bar dataKey="Target" fill="#94a3b8" radius={[4, 4, 0, 0]} maxBarSize={40} />
                <Bar dataKey="Actual" fill="#8b5cf6" radius={[4, 4, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* BAR */}
          <div className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">📈 Monthly Overview</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={[{ name: "Income", value: income }, { name: "Expenses", value: expenses }, { name: "Savings", value: savings }]}>
                <XAxis dataKey="name" />
                <YAxis tickFormatter={(val) => `₹${val >= 100000 ? (val / 100000) + 'L' : val >= 1000 ? (val / 1000) + 'k' : val}`} />
                <Tooltip formatter={(val) => `₹${Number(val).toLocaleString('en-IN')}`} />
                <Bar dataKey="value" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ACTION */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* ⚡ WHAT SHOULD I DO NEXT */}
          <div className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">⚡ What Should You Do Next?</h3>
            <div className="space-y-3">
              {actions.map((item, i) => (
                <div key={i} onClick={() => navigate("/ai-advisor", { state: { query: item.action } })} className="p-4 rounded-xl border hover:bg-gray-50 hover:shadow cursor-pointer transition">
                  <p className="text-sm font-medium">{item.text}</p>
                  <p className="text-xs text-gray-500 mt-1">Click to explore →</p>
                </div>
              ))}
            </div>
          </div>

          {/* 💡 SMART FINANCIAL INSIGHT */}
          <div
            className={`p-6 rounded-2xl shadow-sm hover:shadow-md transition border ${insight.color === "red"
              ? "bg-red-50 border-red-100 text-red-800"
              : insight.color === "orange"
                ? "bg-orange-50 border-orange-100 text-orange-800"
                : insight.color === "blue"
                  ? "bg-blue-50 border-blue-100 text-blue-800"
                  : "bg-green-50 border-green-100 text-green-800"
              }`}
          >
            <p
              className={`font-semibold flex items-center gap-2 ${insight.color === "red"
                ? "text-red-700"
                : insight.color === "orange"
                  ? "text-orange-700"
                  : insight.color === "blue"
                    ? "text-blue-700"
                    : "text-green-700"
                }`}
            >
              {insight.icon} Smart Insight
            </p>
            <p className="text-sm mt-3 leading-relaxed">
              {insight.message}
            </p>
            {action && (
              <p className="text-xs mt-3 opacity-70 border-t pt-3 border-current">
                ✨ AI Recommendation: {action}
              </p>
            )}
          </div>
        </div>

        {/* INSIGHTS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 🛡️ EMERGENCY FUND */}
          <div className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition">

            <h3 className="text-lg font-semibold text-gray-800 mb-2">🛡️ Emergency Fund</h3>

            <p className="text-sm text-gray-500 mb-3">
              {emergencyMonths.toFixed(1)} months covered
            </p>

            {/* Progress Bar */}
            <div className="w-full bg-gray-200 h-3 rounded-full mb-3">
              <div
                className="bg-blue-500 h-3 rounded-full"
                style={{ width: `${Math.min((emergencyMonths / 6) * 100, 100)}%` }}
              />
            </div>

            <p className="text-xs text-gray-500 mb-4">
              Target: ₹{(expenses * 6).toLocaleString('en-IN')}
            </p>

            {/* 💡 WHY IT MATTERS */}
            <div className="bg-blue-50 p-4 rounded-xl text-sm text-gray-700 space-y-2">
              <p>
                💡 <strong>Why is an emergency fund important?</strong>
              </p>
              <p>
                It protects you from unexpected situations like job loss, medical emergencies,
                or urgent expenses — so you don’t rely on loans or credit cards.
              </p>
              <p>
                📊 <strong>Why 3–6 months?</strong>
              </p>
              <p>
                Having at least 3–6 months of expenses saved gives you enough time to recover
                financially without stress if your income stops.
              </p>
            </div>
          </div>

          {/* 💡 SMART INSIGHTS */}
          <div className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">💡 Smart Insights</h3>
            <div className="space-y-3">
              {(insights || []).map((insight, i) => (
                <div key={i} className="bg-blue-50 p-3 rounded-xl text-sm text-gray-700">
                  {insight}
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}