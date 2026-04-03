import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router";
import { getUserData, setUserData } from "../store/userStore";

import html2canvas from "html2canvas";
import jsPDF from "jspdf";

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
  const savings = Number(onboardingData?.savings || 0);
  const investments = Number(onboardingData?.investments || 0);

  const emergencyTarget = expenses * 6;
  const emergencyProgress =
    emergencyTarget > 0 ? (savings / emergencyTarget) * 100 : 0;

  const savingsRate = income > 0 ? (savings / income) * 100 : 0;
  const emergencyMonths = expenses > 0 ? savings / expenses : 0;
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

  // Savings insight
  if (savingsRate >= 25) {
    insights.push("Your savings rate is excellent — you are building strong financial discipline.");
  } else if (savingsRate >= 15) {
    insights.push("Your savings rate is decent, but increasing it slightly can improve long-term security.");
  } else {
    insights.push("Your savings rate is low — try to save at least 20% of your income.");
  }

  // Emergency fund insight
  if (emergencyMonths >= 6) {
    insights.push("You have a strong emergency fund — you are well protected against unexpected situations.");
  } else if (emergencyMonths >= 3) {
    insights.push("Your emergency fund is moderate — aim for 6 months for better security.");
  } else {
    insights.push("Your emergency fund is low — prioritize building it to avoid financial stress.");
  }

  // Investment insight
  if (investmentRate >= 20) {
    insights.push("You are investing well — this will significantly help in long-term wealth creation.");
  } else if (investmentRate >= 10) {
    insights.push("Your investment level is okay, but increasing it can accelerate your financial growth.");
  } else {
    insights.push("You are under-investing — consider starting SIPs or other investment options.");
  }

  // Expense insight
  if (expenses > income * 0.7) {
    insights.push("Your expenses are high relative to income — reducing spending can improve savings.");
  } else {
    insights.push("Your expenses are well managed — good financial control.");
  }

  // ✅ AI INSIGHTS
  if (Array.isArray(analysis?.insights)) {
    analysis.insights.forEach((insight: string) => {
      if (!insights.includes(insight)) {
        insights.push(insight);
      }
    });
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
    action = actionPart.replace("-", "").trim();
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
      insight: savingsRate > 20 ? "Strong savings 💪" : "Needs improvement ⚠️",
    },
    {
      title: "Investments",
      value: investments,
      color: "text-purple-600",
      bg: "bg-purple-50",
      icon: "📊",
      insight: investmentRate > 15 ? "Good investing 🚀" : "Start investing more",
    },
  ];

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
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-transparent text-white border border-white/30 hover:bg-white/10 transition-all duration-200 hover:scale-105 hover:shadow-lg"
            >
              ✨ AI Advisor
            </button>

            <button
              onClick={handleDownloadPDF}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-transparent text-white border border-white/30 hover:bg-white/10 transition-all duration-200 hover:scale-105 hover:shadow-lg"
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
              <p className="text-sm text-gray-500">Monthly Income: ₹{onboardingData?.income || 0}</p>
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
                <button onClick={() => setIsEditingGoal(true)} className="text-xs text-blue-500 mt-1 hover:underline">Edit</button>
              </>
            ) : (
              <div className="flex flex-col items-end gap-2">
                <input value={goalInput} onChange={(e) => setGoalInput(e.target.value)} className="border px-2 py-1 rounded text-sm" placeholder="Enter goal" />
                <div className="flex gap-2">
                  <button onClick={() => { const updated = { ...onboardingData, goal: goalInput }; setUserData(updated); setIsEditingGoal(false); }} className="text-xs px-2 py-1 bg-green-500 text-white rounded">Save</button>
                  <button onClick={() => setIsEditingGoal(false)} className="text-xs px-2 py-1 bg-gray-200 rounded">Cancel</button>
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
            <p className="text-sm mb-3">
              {score > 75 ? "✅ Excellent financial health" : score > 50 ? "⚠️ Good, but can improve" : "🚨 Needs attention"}
            </p>
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
              <span>₹{savings.toLocaleString()}</span>
              <span>Target: ₹{target.toLocaleString()}</span>
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
              <h2 className={`text-2xl font-bold ${card.color}`}>₹{card.value.toLocaleString()}</h2>
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
                <YAxis fontSize={11} tickFormatter={(val) => `₹${val >= 1000 ? val / 1000 + 'k' : val}`} />
                <Tooltip formatter={(value: any) => `₹${Number(value).toLocaleString()}`} cursor={{ fill: '#f1f5f9' }} />
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
                <YAxis />
                <Tooltip />
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

          {/* NEXT BEST ACTION (AI) */}
          <div className="bg-green-50 p-6 rounded-2xl shadow-sm hover:shadow-md transition border border-green-100">
            <p className="font-semibold text-green-700 flex items-center gap-2">
              ✨ AI Recommendation
            </p>
            <p className="text-sm mt-3 leading-relaxed text-green-800">
              {action || "AI will suggest actions here based on your data."}
            </p>
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
              Target: ₹{(expenses * 6).toLocaleString()}
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
              {insights.map((insight, i) => (
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