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
      setPdfStatus("Initializing 1-to-1 Dashboard Capture...");
      window.scrollTo(0, 0);

      const element = document.getElementById("dashboard-content");
      if (!element) throw new Error("Dashboard container not found");

      await new Promise((r) => setTimeout(r, 1200));

      const canvas = await html2canvas(element, {
        scale: 1,
        useCORS: true,
        backgroundColor: "#f9fafb",
        logging: false,
        allowTaint: true,
        ignoreElements: (el: Element) => {
          const htmlEl = el as HTMLElement;
          const text = htmlEl.textContent || "";
          return htmlEl.tagName === "BUTTON" && (text.includes("AI") || text.includes("PDF"));
        }
      });

      setPdfStatus("Slicing Canvas Into PDF Pages...");
      const imgData = canvas.toDataURL("image/jpeg", 0.9);
      const pdf = new jsPDF("p", "mm", "a4");
      
      const imgWidth = 210;
      const pageHeight = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        setPdfStatus(`Compiling Page ${pdf.getNumberOfPages() + 1}...`);
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      setPdfStatus("Finalizing Download...");
      pdf.save(`SmartFinance_Report_${onboardingData?.name || "User"}.pdf`);
      
    } catch (err: any) {
      console.error("PDF Error:", err);
      alert("⚠️ PDF Generation Failed: " + (err.message || "Unknown error"));
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
  const emergencyMonths = expenses > 0 ? emergencyFund / expenses : 0;
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
  const savedAmount = progressData?.saved !== undefined ? progressData.saved : emergencyFund;
  const targetAmount = progressData?.target || emergencyTarget;
  const progressPercent = targetAmount > 0 ? (savedAmount / targetAmount) * 100 : 0;

  const handleAction = () => {
    if (nextAction?.type === "save") navigate("/ai-advisor", { state: { query: "Help me build my savings plan" } });
    else navigate("/ai-advisor", { state: { query: nextAction?.type === "invest" ? "Suggest investment plan for me" : "How to optimize my finances?" } });
  };

  return (
    <div id="dashboard-content" className="p-6 bg-[#f9fafb]">
      <div className="space-y-6">
        {/* HEADER */}
        <div className="flex justify-between items-center bg-gradient-to-br from-[#6366f1] via-[#8b5cf6] to-[#ec4899] text-white p-8 rounded-3xl shadow-xl">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Hey {onboardingData?.name || "User"} 👋</h1>
            <p className="text-sm opacity-90 mt-1 font-medium">Welcome back to your financial intelligence hub</p>
          </div>
          <div className="flex gap-4">
            <button onClick={() => navigate("/ai-advisor")} className="px-5 py-2.5 rounded-2xl text-sm font-semibold bg-white/20 backdrop-blur-md border border-white/30 hover:bg-white/30 hover:scale-105 transition-all duration-300">✨ AI Advisor</button>
            <button onClick={handleDownloadPDF} className="px-5 py-2.5 rounded-2xl text-sm font-semibold bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 hover:scale-105 transition-all duration-300">📄 Download PDF</button>
          </div>
        </div>

        {/* NEXT MOVE */}
        <div className="bg-gradient-to-br from-[#10b981] to-[#059669] text-white p-8 rounded-3xl shadow-lg relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl group-hover:scale-150 transition-transform duration-700" />
          <h2 className="text-xl font-bold mb-3 flex items-center gap-2">🚀 Your Next Move</h2>
          <p className="text-sm opacity-90 mb-6 leading-relaxed max-w-2xl">{nextAction?.text}</p>
          <button onClick={handleAction} className="bg-white text-[#059669] px-6 py-2.5 rounded-2xl font-bold shadow-md hover:shadow-xl hover:scale-105 transition-all duration-300">{nextAction?.cta}</button>
          <div className="mt-8 bg-black/10 p-4 rounded-2xl border border-white/10">
            <div className="flex justify-between text-xs mb-2 font-semibold">
              <span>Goal Progress</span>
              <span>₹{savedAmount.toLocaleString('en-IN')} / ₹{targetAmount.toLocaleString('en-IN')}</span>
            </div>
            <div className="w-full bg-white/20 h-2.5 rounded-full overflow-hidden">
              <div className="bg-white h-full rounded-full shadow-[0_0_10px_rgba(255,255,255,0.5)] transition-all duration-700" style={{ width: `${Math.min(progressPercent, 100)}%` }} />
            </div>
          </div>
        </div>

        {/* PROFILE */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex justify-between items-center">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#6366f1] to-[#8b5cf6] flex items-center justify-center text-white text-2xl font-black shadow-lg">{(onboardingData?.name || "U")[0]}</div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">{onboardingData?.name || "User"}</h2>
              <p className="text-sm text-gray-500 font-medium">Monthly Income: <span className="text-gray-800">₹{Number(onboardingData?.income || 0).toLocaleString('en-IN')}</span></p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Primary Goal</p>
            <p className="font-extrabold text-[#6366f1] text-lg">{onboardingData?.goal || "Wealth Building"}</p>
          </div>
        </div>

        {/* CORE STATUS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-6"><h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">💯 Financial Health</h3><span className="text-3xl font-black text-[#6366f1]">{score}<small className="text-sm text-gray-400">/100</small></span></div>
            <div className="w-full bg-gray-100 h-3 rounded-full mb-6 overflow-hidden"><div className="h-full rounded-full transition-all duration-1000 shadow-inner" style={{ width: `${score}%`, backgroundColor: score > 75 ? "#10b981" : score > 50 ? "#f59e0b" : "#ef4444" }} /></div>
            <div className={`px-4 py-3 rounded-2xl text-sm font-medium flex items-center gap-3 ${colorMap[currentInsight.color]}`}><span>{currentInsight.icon}</span><span>{currentInsight.message}</span></div>
          </div>
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-4"><h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">🎯 Goal Progress</h3><span className="text-lg font-bold text-[#8b5cf6]">{progress.toFixed(0)}%</span></div>
            <p className="text-sm text-gray-500 mb-4 font-medium flex items-center gap-2">Target: <span className="text-gray-800">{goal}</span></p>
            <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden"><div className="bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] h-full rounded-full transition-all duration-1000 shadow-md" style={{ width: `${Math.min(progress, 100)}%` }} /></div>
          </div>
        </div>

        {/* SNAPSHOT */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {cards.map((card, i) => (
            <div key={i} className={`p-6 rounded-3xl shadow-sm border border-gray-100 transition-hover hover:shadow-md transition-all duration-300 ${card.bg}`}>
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-xl mb-4 shadow-sm">{card.icon}</div>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-widest leading-none">{card.title}</p>
              <h2 className={`text-2xl font-black mt-2 ${card.color}`}>₹{card.value.toLocaleString('en-IN')}</h2>
            </div>
          ))}
        </div>

        {/* CHARTS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 min-h-[400px]">
            <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">⚖️ 50/30/20 Rule Analysis</h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={[{ name: "Needs", Target: income * 0.5, Actual: expenses * 0.6 }, { name: "Wants", Target: income * 0.3, Actual: expenses * 0.4 }, { name: "Savings", Target: income * 0.2, Actual: savings + investments }]} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <XAxis dataKey="name" fontSize={12} axisLine={false} tickLine={false} tickMargin={10} />
                <YAxis fontSize={11} tickFormatter={(val) => `₹${val/1000}k`} axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                <Bar dataKey="Target" fill="#94a3b8" radius={[6, 6, 6, 6]} barSize={24} />
                <Bar dataKey="Actual" fill="#6366f1" radius={[6, 6, 6, 6]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 min-h-[400px]">
            <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">📈 Monthly Overview</h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={[{ name: "Income", value: income }, { name: "Expenses", value: expenses }, { name: "Savings", value: savings }]} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tickMargin={10} fontSize={12} />
                <YAxis tickFormatter={(val) => `₹${val/1000}k`} axisLine={false} tickLine={false} fontSize={11} />
                <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                <Bar dataKey="value" fill="#8b5cf6" radius={[6, 6, 6, 6]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ACTION & INSIGHTS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">⚡ What Should You Do Next?</h3>
            <div className="space-y-4">
              {actions.map((item, i) => (
                <div key={i} onClick={() => navigate("/ai-advisor", { state: { query: item.action } })} className="p-5 rounded-2xl border border-gray-100 bg-gray-50/50 hover:bg-white hover:shadow-lg hover:border-[#6366f1]/20 cursor-pointer transition-all duration-300 group">
                  <p className="text-sm font-bold text-gray-700 group-hover:text-[#6366f1]">{item.text} <span className="inline-block transition-transform group-hover:translate-x-1 ml-1">→</span></p>
                </div>
              ))}
            </div>
          </div>
          <div className={`p-8 rounded-3xl shadow-sm border transition-all duration-300 ${colorMap[currentInsight.color]} border-current/10`}>
            <p className="font-bold text-lg flex items-center gap-2 mb-4"><span>{currentInsight.icon}</span> Smart Insight</p>
            <p className="text-sm leading-relaxed font-medium opacity-90">{currentInsight.message}</p>
            {action && (
              <div className="mt-6 pt-6 border-t border-current/20">
                <p className="text-xs font-black uppercase tracking-widest opacity-60 mb-2">✨ AI Recommendation</p>
                <p className="text-sm font-bold leading-relaxed italic">"{action}"</p>
              </div>
            )}
          </div>
        </div>

        {/* EMERGENCY & AI INSIGHTS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-2 flex items-center gap-2">🛡️ Emergency Fund</h3>
            <p className="text-sm text-gray-400 font-bold mb-6">{emergencyMonths.toFixed(1)} months covered</p>
            <div className="w-full bg-gray-100 h-3 rounded-full mb-6 overflow-hidden shadow-inner"><div className="bg-gradient-to-r from-[#3b82f6] to-[#60a5fa] h-full rounded-full shadow-md" style={{ width: `${Math.min((emergencyMonths / 6) * 100, 100)}%` }} /></div>
            <div className="bg-blue-50/50 border border-blue-100 p-5 rounded-2xl text-sm leading-relaxed text-blue-900 font-medium">💡 <strong>Strategy:</strong> 3–6 months of savings protects you from unexpected job loss or medical emergencies. You are currently at <span className="font-black underline">{emergencyMonths.toFixed(1)}</span> months.</div>
          </div>
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">💡 AI Smart Insights</h3>
            <div className="space-y-4">
              {insights.slice(0, 3).map((text, i) => (
                <div key={i} className="bg-indigo-50/50 border border-indigo-100 p-4 rounded-2xl text-sm font-medium text-indigo-900 flex items-start gap-3">
                  <span className="mt-1">✨</span>
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {isGeneratingPDF && (
        <div data-html2canvas-ignore="true" className="fixed bottom-4 right-4 bg-black text-white px-5 py-3 rounded-xl z-[9999] shadow-2xl animate-bounce flex items-center gap-3">
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