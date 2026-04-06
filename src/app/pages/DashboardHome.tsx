import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { getUserData, setUserData } from "../store/userStore";

import html2canvas from "html2canvas";
import jsPDF from "jspdf";

import Onboarding from "./Onboarding";

import {
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Legend,
} from "recharts";

const colorMap: Record<string, string> = {
  red: "text-red-600 bg-red-100",
  orange: "text-orange-600 bg-orange-100",
  blue: "text-blue-600 bg-blue-100",
  green: "text-green-600 bg-green-100",
};

export default function DashboardHome() {
  const navigate = useNavigate();

  const onboardingData = getUserData();

  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [goalInput, setGoalInput] = useState(onboardingData?.goal || "");
  const [nextAction, setNextAction] = useState<any>(null);

  const [progressData, setProgressData] = useState(() => {
    return JSON.parse(localStorage.getItem("sf_progress") || "{}");
  });

  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [pdfStatus, setPdfStatus] = useState("");

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
  }, [onboardingData]);

  useEffect(() => {
    const fetchNextAction = async () => {
      try {
        const res = await fetch("https://smart-finance-backend-w4ou.onrender.com/api/next-action", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userData: {
              income: onboardingData?.income,
              expenses: onboardingData?.expenses,
              investments: onboardingData?.investments || 0,
            },
            progress: {
              saved: onboardingData?.emergencyFund || 0,
              target: onboardingData?.expenses * 6,
            },
          }),
        });

        const data = await res.json();
        setNextAction(data);
      } catch (err) {
        console.error(err);
      }
    };

    if (onboardingData) fetchNextAction();
  }, [onboardingData]);

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "sf_progress" || !e.key) {
        const updated = JSON.parse(localStorage.getItem("sf_progress") || "{}");
        setProgressData(updated);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  useEffect(() => {
    const handleStorageChange = () => {
      const updated = JSON.parse(localStorage.getItem("sf_progress") || "{}");
      setProgressData(updated);
    };

    window.addEventListener("progressUpdated", handleStorageChange);
    return () => window.removeEventListener("progressUpdated", handleStorageChange);
  }, []);

  if (!onboardingData) {
    return <Onboarding />;
  }

  const handleDownloadPDF = async () => {
    try {
      setIsGeneratingPDF(true);
      setPdfStatus("Generating clean PDF...");

      window.scrollTo(0, 0);

      const element = document.getElementById("dashboard-content");
      if (!element) throw new Error("Dashboard not found");

      // Lock width for consistency
      const originalWidth = element.style.width;
      element.style.width = "1100px";

      await new Promise((r) => setTimeout(r, 1200));

      const canvas = await html2canvas(element, {
        scale: 3,
        useCORS: true,
        backgroundColor: "#f9fafb",
        ignoreElements: (el: Element) => {
          const htmlEl = el as HTMLElement;
          const text = htmlEl.textContent || "";
          return (htmlEl.tagName === "BUTTON" && (text.includes("AI") || text.includes("PDF"))) ||
            htmlEl.getAttribute("data-html2canvas-ignore") === "true";
        }
      });

      element.style.width = originalWidth;

      const imgData = canvas.toDataURL("image/jpeg", 0.95);
      const pdf = new jsPDF("l", "mm", "a4");

      const pageWidth = 297;
      const pageHeight = 210;

      // 🔥 SCALE ONLY BY WIDTH (IMPORTANT)
      const ratio = pageWidth / canvas.width;

      const imgWidth = pageWidth;
      const imgHeight = canvas.height * ratio;

      // Center the content
      const x = 0;
      const y = 10; // small top margin

      pdf.addImage(
        imgData,
        "JPEG",
        x,
        y,
        imgWidth,
        imgHeight
      );

      pdf.save(`SmartFinance_Report_${onboardingData?.name || "User"}.pdf`);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingPDF(false);
      setPdfStatus("");
    }
  };

  if (loading) return <div className="p-6">Loading your dashboard...</div>;
  if (!nextAction) return <div className="p-6">Loading actions...</div>;

  const income = Number(onboardingData?.income || 0);
  const expenses = Number(onboardingData?.expenses || 0);
  const investments = Number(onboardingData?.investments || 0);
  const emergencyFund = Number(onboardingData?.emergencyFund || 0);
  const savings = income - (expenses + investments);
  const emergencyTarget = expenses * 6;
  const savingsRate = income > 0 ? (savings / income) * 100 : 0;
  const rawMonths = expenses > 0 ? emergencyFund / expenses : 0;
  const emergencyMonths = Math.min(rawMonths, 12);
  const investmentRate = income > 0 ? (investments / income) * 100 : 0;

  let score = 0;
  if (savingsRate >= 20) score += 40; else score += (savingsRate / 20) * 40;
  if (emergencyMonths >= 6) score += 30; else score += (emergencyMonths / 6) * 30;
  if (investmentRate >= 20) score += 30; else score += (investmentRate / 20) * 30;
  score = Math.round(score);

  const goal = onboardingData?.goal || "Wealth Building";
  let target = 0;
  if (goal.toLowerCase().includes("emergency")) target = expenses * 6;
  else if (goal.toLowerCase().includes("car")) target = 500000;
  else if (goal.toLowerCase().includes("house")) target = 2000000;
  else target = 100000;
  const progress = target > 0 ? (savings / target) * 100 : 0;

  const insights: string[] = [];
  if (analysis?.insights) {
    const rawInsights = Array.isArray(analysis.insights) ? analysis.insights : String(analysis.insights).split(/\n|(?=\s[-*•\d.]+\s)/);
    rawInsights.forEach((line: string) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.includes("ACTION:") || trimmed.includes("Insights") || trimmed.includes("Financial Analysis")) return;
      const cleaned = trimmed.replace(/\*\*/g, "").replace(/###/g, "").replace(/^[-*•\d.]+\s*/, "").trim();
      if (cleaned && cleaned.length > 10 && !insights.includes(cleaned)) insights.push(cleaned);
    });
  }

  let action = analysis?.recommendation || "";
  if (!action && typeof analysis?.insights === "string") {
    action = (analysis.insights.split("ACTION:")[1] || "").replace(/\*\*/g, "").replace(/###/g, "").replace(/^-+\s*/, "").trim();
  }

  const actions = [
    { text: "Increase your savings rate", action: "How can I save more money?" },
    { text: "Build your emergency fund", action: "How to build emergency fund?" },
    { text: "Start investing more", action: "Best investment options for me?" },
    { text: "Reduce unnecessary expenses", action: "How to reduce expenses?" }
  ].filter((_, i) => {
    if (i === 0) return savingsRate < 20;
    if (i === 1) return emergencyMonths < 6;
    if (i === 2) return investmentRate < 15;
    if (i === 3) return expenses > income * 0.7;
    return false;
  });
  if (actions.length === 0) actions.push({ text: "Optimize your financial plan", action: "How to optimize my finances?" });

  const cards = [
    { title: "Income", value: income, color: "text-green-600", bg: "bg-green-50", icon: "💰", insight: "Stable income flow" },
    { title: "Expenses", value: expenses, color: "text-red-500", bg: "bg-red-50", icon: "💸", insight: expenses > income * 0.6 ? "High spending ⚠️" : "Controlled spending ✅" },
    { title: "Savings", value: savings, color: "text-blue-600", bg: "bg-blue-50", icon: "📈", insight: savingsRate >= 20 ? "Strong savings 💪" : "Building phase ⚠️" },
    { title: "Investments", value: investments, color: "text-purple-600", bg: "bg-purple-50", icon: "💎", insight: investmentRate > 15 ? "Investing expert 🚀" : "Start investing more 📈" }
  ];

  function generateFinancialInsight() {
    const expenseRatio = expenses / income;
    if (expenses > income) return { message: "Expenses exceed income. Fix flow immediately.", color: "red", icon: "🚨" };
    if (expenseRatio > 0.7) return { message: "High spending. Optimize budget.", color: "red", icon: "⚠️" };
    if (savingsRate < 20) return { message: "Low savings. Aim for 20%.", color: "orange", icon: "📊" };
    if (emergencyMonths < 3) return { message: "Weak emergency fund. Build 3-6 months.", color: "orange", icon: "🛡️" };
    if (investments < savings * 0.3) return { message: "Good savings, low investing.", color: "blue", icon: "📈" };
    return { message: "Excellent financial health. Keep optimizing.", color: "green", icon: "🏆" };
  }

  const currentInsight = generateFinancialInsight();
  const savedAmount = emergencyFund;
  const targetAmount = emergencyTarget;
  const progressPercent = targetAmount > 0 ? (savedAmount / targetAmount) * 100 : 0;

  const handleAction = () => {
    const smartAction = getSmartNextMove();
    if (smartAction.type === "save") navigate("/ai-advisor", { state: { query: "Help me build my savings plan" } });
    else navigate("/ai-advisor", { state: { query: smartAction.type === "invest" ? "Suggest investment plan for me" : "How to optimize my finances?" } });
  };

  function getSmartNextMove() {
    if (emergencyMonths < 3) {
      return {
        text: "Build your emergency fund. Save ₹500 today",
        cta: "Save Now",
        type: "save"
      };
    }

    if (investments < income * 0.1) {
      return {
        text: "You have a safety buffer. Start investing now",
        cta: "Start Investing",
        type: "invest"
      };
    }

    if (savingsRate < 20) {
      return {
        text: "Increase your savings rate",
        cta: "Optimize Savings",
        type: "optimize"
      };
    }

    return {
      text: "You are doing great. Optimize your finances",
      cta: "View Plan",
      type: "optimize"
    };
  }

  const smartAction = getSmartNextMove();

  return (
    <div id="dashboard-content" className="p-6 bg-[#f9fafb]">
      <div className="space-y-6">
        {/* HEADER */}
        <div className="flex justify-between items-center bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 rounded-2xl shadow-lg">
          <div>
            <h1 className="text-2xl font-bold">Hey {onboardingData?.name || "User"} 👋</h1>
            <p className="text-sm opacity-90">Your financial dashboard</p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => navigate("/ai-advisor")} className="px-4 py-2 rounded-xl text-sm font-medium border border-white/30 hover:bg-white/10 transition">✨ AI Advisor</button>
            <button onClick={handleDownloadPDF} className="px-4 py-2 rounded-xl text-sm font-medium border border-white/30 hover:bg-white/10 transition">📄 Download PDF</button>
          </div>
        </div>

        {/* NEXT MOVE */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-6 rounded-2xl shadow-lg">
          <h2 className="text-lg font-semibold mb-2">🚀 Your Next Move</h2>
          <p className="text-sm opacity-90 mb-4">{smartAction.text}</p>
          <button onClick={handleAction} className="bg-white text-green-600 px-4 py-2 rounded-xl font-medium hover:scale-105 transition">{smartAction.cta}</button>
          <div className="mt-4">
            <div className="w-full bg-white/30 h-2 rounded-full"><div className="bg-white h-2 rounded-full transition-all" style={{ width: `${Math.min(progressPercent, 100)}%` }} /></div>
            <p className="text-xs mt-1 opacity-80">₹{savedAmount.toLocaleString('en-IN')} / ₹{targetAmount.toLocaleString('en-IN')}</p>
          </div>
        </div>

        {/* PROFILE */}
        <div className="bg-white p-6 rounded-2xl shadow-sm flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold">{(onboardingData?.name || "U")[0]}</div>
            <div>
              <h2 className="text-lg font-semibold">{onboardingData?.name || "User"}</h2>
              <p className="text-sm text-gray-500">Monthly Income: ₹{Number(onboardingData?.income || 0).toLocaleString('en-IN')}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Primary Goal</p>
            <p className="font-semibold text-blue-600">{onboardingData?.goal || "Wealth Building"}</p>
          </div>
        </div>

        {/* CORE STATUS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm">
            <div className="flex justify-between items-center mb-4"><h3 className="text-lg font-semibold text-gray-800">💯 Financial Health</h3><span className="text-2xl font-bold text-blue-600">{score}/100</span></div>
            <div className="w-full bg-gray-200 h-3 rounded-full mb-4"><div className="h-3 rounded-full transition-all" style={{ width: `${score}%`, backgroundColor: score > 75 ? "#22c55e" : score > 50 ? "#f59e0b" : "#ef4444" }} /></div>
            <div className={`mt-2 px-3 py-2 rounded-lg text-sm flex items-center gap-2 ${colorMap[currentInsight.color]}`}><span>{currentInsight.icon}</span><span>{currentInsight.message}</span></div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm">
            <div className="flex justify-between items-center mb-3"><h3 className="text-lg font-semibold text-gray-800">🎯 Goal Progress</h3><span className="text-sm text-gray-500">{progress.toFixed(0)}%</span></div>
            <p className="text-sm text-gray-600 mb-2">{goal}</p>
            <div className="w-full bg-gray-200 h-3 rounded-full"><div className="bg-blue-500 h-3 rounded-full transition-all" style={{ width: `${Math.min(progress, 100)}%` }} /></div>
          </div>
        </div>

        {/* SNAPSHOT */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {cards.map((card, i) => (
            <div key={i} className={`p-6 rounded-2xl shadow-sm ${card.bg}`}>
              <span className="text-xl">{card.icon}</span>
              <p className="text-sm text-gray-500 mt-2">{card.title}</p>
              <h2 className={`text-2xl font-bold ${card.color}`}>₹{card.value.toLocaleString('en-IN')}</h2>
            </div>
          ))}
        </div>

        {/* CHARTS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm min-h-[350px]">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">⚖️ 50/30/20 Rule Analysis</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={[{ name: "Needs", Target: income * 0.5, Actual: expenses * 0.6 }, { name: "Wants", Target: income * 0.3, Actual: expenses * 0.4 }, { name: "Savings", Target: income * 0.2, Actual: savings + investments }]}>
                <XAxis dataKey="name" fontSize={12} />
                <YAxis fontSize={11} tickFormatter={(val) => `₹${val / 1000}k`} />
                <Tooltip />
                <Legend />
                <Bar dataKey="Target" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Actual" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm min-h-[350px]">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">📈 Monthly Overview</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={[{ name: "Income", value: income }, { name: "Expenses", value: expenses }, { name: "Savings", value: savings }]}>
                <XAxis dataKey="name" />
                <YAxis tickFormatter={(val) => `₹${val / 1000}k`} />
                <Tooltip />
                <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ACTION & INSIGHTS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">⚡ What Should You Do Next?</h3>
            <div className="space-y-3">
              {actions.map((item, i) => (
                <div key={i} onClick={() => navigate("/ai-advisor", { state: { query: item.action } })} className="p-4 rounded-xl border hover:bg-gray-50 cursor-pointer transition">
                  <p className="text-sm font-medium">{item.text} →</p>
                </div>
              ))}
            </div>
          </div>
          <div className={`p-6 rounded-2xl shadow-sm border ${colorMap[currentInsight.color]}`}>
            <p className="font-semibold flex items-center gap-2">{currentInsight.icon} Smart Insight</p>
            <p className="text-sm mt-3 leading-relaxed">{currentInsight.message}</p>
            {action && <p className="text-xs mt-3 opacity-70 border-t pt-3 border-current">✨ AI Recommendation: {action}</p>}
          </div>
        </div>

        {/* EMERGENCY & AI INSIGHTS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">🛡️ Emergency Fund</h3>
            <p className="text-sm text-gray-500 mb-3">{emergencyMonths.toFixed(1)} months covered</p>
            <div className="w-full bg-gray-200 h-2 rounded-full"><div className="bg-blue-500 h-2 rounded-full" style={{ width: `${Math.min((emergencyMonths / 6) * 100, 100)}%` }} /></div>
            <div className="bg-blue-50 p-4 rounded-xl text-sm mt-4">💡 3–6 months of savings protects you from unexpected job loss or medical emergencies.</div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">💡 AI Smart Insights</h3>
            <div className="space-y-3">
              {insights.slice(0, 3).map((text, i) => (
                <div key={i} className="bg-blue-50 p-3 rounded-xl text-sm">{text}</div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {isGeneratingPDF && (
        <div className="fixed bottom-4 right-4 bg-black text-white px-5 py-3 rounded-xl z-[9999] shadow-2xl animate-bounce flex items-center gap-3">
          <span className="text-xl">🚀</span>
          <div className="flex flex-col">
            <span className="font-semibold text-sm">Generating PDF Report</span>
            <span className="text-xs opacity-80">{pdfStatus}</span>
          </div>
        </div>
      )}
    </div>
  );
}