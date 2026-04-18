import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { getUserData, setUserData } from "../store/userStore";

import html2canvas from "html2canvas";
import jsPDF from "jspdf";

import Onboarding from "./Onboarding";

import {
  Sparkles,
  Download,
  TrendingUp,
  ShieldCheck,
  LayoutDashboard,
} from "lucide-react";

import {
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Legend,
  AreaChart,
  Area,
} from "recharts";

const colorMap: Record<string, string> = {
  red: "text-red-600 bg-red-100",
  orange: "text-orange-600 bg-orange-100",
  blue: "text-blue-600 bg-blue-100",
  green: "text-green-600 bg-green-100",
};

export default function DashboardHome() {
  const navigate = useNavigate();

  const [userData, setUserDataState] = useState(getUserData());

  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [goalInput, setGoalInput] = useState(userData?.goal || "");
  const [nextAction, setNextAction] = useState<any>(null);

  const [progressData, setProgressData] = useState(() => {
    return JSON.parse(localStorage.getItem("sf_progress") || "{}");
  });

  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [pdfStatus, setPdfStatus] = useState("");

  useEffect(() => {
    if (!userData) {
      setLoading(false);
      return;
    }

    const fetchAnalysis = async () => {
      try {
        const response = await fetch("https://smart-finance-backend-w4ou.onrender.com/api/analyze-finance", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...userData,
            insurance: userData?.insurance || 0,
          }),
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
  }, [userData]);

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
              income: userData?.income,
              expenses: userData?.expenses,
              investments: userData?.investments || 0,
              insurance: userData?.insurance || 0,
            },
            progress: {
              saved: userData?.emergencyFund || 0,
              target: userData?.expenses * 6,
            },
          }),
        });

        const data = await res.json();
        setNextAction(data);
      } catch (err) {
        console.error(err);
      }
    };

    if (userData) fetchNextAction();
  }, [userData]);

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

  if (!userData) {
    return <Onboarding />;
  }

  const handleDownloadPDF = async () => {
    try {
      setIsGeneratingPDF(true);
      setPdfStatus("Generating clean PDF...");


      const element = document.getElementById("dashboard-content");
      if (!element) throw new Error("Dashboard not found");

      await new Promise((resolve) => setTimeout(resolve, 500));

      document.body.style.overflow = "hidden";

      const canvas = await html2canvas(element, {
        scale: 3, // 🔥 HIGH QUALITY
        useCORS: true,
        backgroundColor: "#ffffff",
        scrollX: 0,
        scrollY: -window.scrollY,
        windowWidth: document.body.scrollWidth,
        ignoreElements: (el) => {
          return el.classList?.contains("pdf-ignore");
        }
      });


      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");

      const pageWidth = 210;
      const pageHeight = 297;

      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * pageWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      setPdfStatus("Finalizing High-Quality Download...");
      pdf.save(`SmartFinance_Report_${userData?.name || "User"}.pdf`);
      document.body.style.overflow = "auto";
    } catch (err) {
      console.error(err);
      document.body.style.overflow = "auto";
    } finally {
      setIsGeneratingPDF(false);
      setPdfStatus("");
    }
  };

  if (loading) return <div className="p-6">Loading your dashboard...</div>;
  if (!nextAction) return <div className="p-6">Loading actions...</div>;

  const income = Number(userData?.income || 0);
  const expenses = Number(userData?.expenses || 0);
  const investments = Number(userData?.investments || 0);
  const emergencyFund = Number(userData?.emergencyFund || 0);
  const savings = income - (expenses + investments);
  const emergencyTarget = expenses * 6;
  const savingsRate = income > 0 ? (savings / income) * 100 : 0;
  const rawMonths = expenses > 0 ? emergencyFund / expenses : 0;
  const emergencyMonths = Math.min(rawMonths, 12);
  const investmentRate = income > 0 ? (investments / income) * 100 : 0;
  const insurance = Number(userData?.insurance || 0);

  const expenseBreakdown = userData?.expenseBreakdown || [];

  let topCategory: any = null;
  let topPercentage = 0;

  if (expenseBreakdown.length > 0 && expenses > 0) {
    topCategory = expenseBreakdown.reduce((max: any, item: any) =>
      item.amount > max.amount ? item : max
    );

    topPercentage = Math.round((topCategory.amount / expenses) * 100);
  }

  let score = 0;

  // Savings Score (30)
  if (savingsRate >= 20) score += 30;
  else score += Math.max(0, (savingsRate / 20) * 30);

  // Emergency Fund Score (25)
  if (emergencyMonths >= 6) score += 25;
  else score += (emergencyMonths / 6) * 25;

  // Investment Score (25)
  if (investmentRate >= 20) score += 25;
  else score += (investmentRate / 20) * 25;

  // Insurance Score (20)
  const idealInsurance = income * 12;

  let insuranceScore = 0;
  if (insurance >= idealInsurance) {
    insuranceScore = 20;
  } else {
    insuranceScore = (insurance / idealInsurance) * 20;
  }

  score += insuranceScore;

  score = Math.round(score);

  let insuranceStatus = "Low";
  if (insurance >= idealInsurance) insuranceStatus = "Strong";
  else if (insurance >= idealInsurance * 0.5) insuranceStatus = "Moderate";

  const goal = userData?.goal || "Wealth Building";
  let target = 0;
  const goalText = goal.toLowerCase();

  if (goalText.includes("emergency")) {
    target = expenses * 6;
  } else if (goalText.includes("car")) {
    target = 500000;
  } else if (goalText.includes("house") || goalText.includes("home")) {
    target = 2000000;
  } else if (goalText.includes("travel")) {
    target = 150000;
  } else if (goalText.includes("education")) {
    target = 300000;
  } else {
    // fallback: use income-based intelligent target
    target = income * 6;
  }
  let currentValue = savings + investments;

  if (goal.toLowerCase().includes("emergency")) {
    currentValue = emergencyFund;
  }

  const progress = target > 0 ? (currentValue / target) * 100 : 0;

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
    { title: "Investments", value: investments, color: "text-purple-600", bg: "bg-purple-50", icon: "💎", insight: investmentRate > 15 ? "Investing expert 🚀" : "Start investing more 📈" },
    {
      title: "Insurance",
      value: insurance,
      color: "text-indigo-600",
      bg: "bg-indigo-50",
      icon: "🛡️",
      insight:
        insuranceStatus === "Strong"
          ? "Well protected ✅"
          : `₹${insurance.toLocaleString("en-IN")} vs ₹${idealInsurance.toLocaleString("en-IN")} needed`,
    }
  ];

  function generateFinancialInsight() {
    const expenseRatio = expenses / income;
    const idealSavings = income * 0.2;

    if (expenses > income) {
      return {
        message: `You're spending ₹${expenses.toLocaleString('en-IN')} which is more than your income ₹${income.toLocaleString('en-IN')}. This is risky — reduce expenses immediately.`,
        color: "red",
        icon: "🚨"
      };
    }

    if (expenseRatio > 0.7) {
      return {
        message: `You're spending ₹${expenses.toLocaleString('en-IN')} (~${Math.round(expenseRatio * 100)}% of your income). Try to bring this below 60% for better financial stability.`,
        color: "red",
        icon: "⚠️"
      };
    }

    if (insurance < idealInsurance * 0.5) {
      return {
        message: `Your insurance coverage is ₹${insurance.toLocaleString('en-IN')}. Based on your income ₹${income.toLocaleString('en-IN')}, you should aim for at least ₹${idealInsurance.toLocaleString('en-IN')} (10–12× income) to stay financially protected.`,
        color: "red",
        icon: "🛡️"
      };
    }

    if (savingsRate < 20) {
      return {
        message: `You're saving ₹${savings.toLocaleString('en-IN')} (~${Math.round(savingsRate)}%). Based on your income ₹${income.toLocaleString('en-IN')}, you should aim for ₹${idealSavings.toLocaleString('en-IN')} (20%) monthly.`,
        color: "orange",
        icon: "📊"
      };
    }

    if (emergencyMonths < 3) {
      return {
        message: `You currently have ${emergencyMonths.toFixed(1)} months of emergency savings. Try to reach at least 3–6 months (₹${(expenses * 6).toLocaleString('en-IN')}) for safety.`,
        color: "orange",
        icon: "🛡️"
      };
    }

    if (investments < savings * 0.3) {
      return {
        message: `You're saving well (₹${savings.toLocaleString('en-IN')}), but investing only ₹${investments.toLocaleString('en-IN')}. Consider investing more to grow your wealth.`,
        color: "blue",
        icon: "📈"
      };
    }

    return {
      message: `Excellent! You're saving ₹${savings.toLocaleString('en-IN')} and investing ₹${investments.toLocaleString('en-IN')}. You're on track for strong financial growth.`,
      color: "green",
      icon: "🏆"
    };
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
    if (insurance < idealInsurance * 0.5) {
      return {
        text: "You are underinsured. Increase your coverage for safety",
        cta: "Fix Insurance",
        type: "optimize"
      };
    }

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

  function calculateFutureNetWorth() {
    const monthlyInvestment = investments;
    const monthlySavings = savings;

    const totalMonthly = monthlyInvestment + monthlySavings;

    const rate = 0.12 / 12; // 12% annual return
    const months = 60; // 5 years

    let value = 0;

    for (let i = 1; i <= months; i++) {
      value = (value + totalMonthly) * (1 + rate);
    }

    return Math.round(value);
  }

  const handleSaveGoal = () => {
    const updatedData = {
      ...userData,
      goal: goalInput,
    };

    setUserData(updatedData);       // save to store
    setUserDataState(updatedData);  // update UI instantly

    setIsEditingGoal(false);
  };

  const smartAction = getSmartNextMove();

  return (
    <div id="dashboard-content" className="p-8 bg-background min-h-screen text-foreground font-sans">
      <div className="max-w-[1280px] mx-auto space-y-12">
        
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-1">
            <h1 className="text-4xl lg:text-5xl font-bold tracking-tight text-foreground">Hello, {userData?.name || "there"}.</h1>
            <div className="flex items-center gap-2 text-muted-foreground text-lg">
              <span>Your Goal:</span>
              {isEditingGoal ? (
                <div className="flex items-center gap-2 animate-in slide-in-from-left-2 duration-300">
                  <input
                    value={goalInput}
                    onChange={(e) => setGoalInput(e.target.value)}
                    className="bg-secondary px-3 py-1 rounded-lg text-sm outline-none focus:ring-1 focus:ring-primary w-40"
                    placeholder="Enter goal"
                    autoFocus
                  />
                  <button onClick={handleSaveGoal} className="text-primary font-bold text-sm">Save</button>
                </div>
              ) : (
                <div 
                  onClick={() => setIsEditingGoal(true)} 
                  className="flex items-center gap-2 text-primary font-semibold cursor-pointer hover:opacity-80 transition-opacity"
                >
                  {userData?.goal || "Financial Freedom"}
                  <Sparkles className="w-3.5 h-3.5 opacity-50" />
                </div>
              )}
            </div>
            <p className="text-muted-foreground text-sm opacity-80">A quiet look at your metrics today.</p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate("/ai-advisor")} 
              className="pdf-ignore px-5 py-2.5 rounded-full text-sm font-semibold bg-primary text-primary-foreground hover:opacity-90 transition-all active:scale-95 flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" /> Ask AI
            </button>
            <button 
              onClick={handleDownloadPDF} 
              className="pdf-ignore px-5 py-2.5 rounded-full text-sm font-semibold border hairline bg-card hover:bg-muted transition-all active:scale-95 flex items-center gap-2"
            >
              <Download className="w-4 h-4" /> Download PDF
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-10 gap-6">
          {cards.map((card, i) => {
            const routes: Record<string, string> = {
              "Income": "/spending",
              "Expenses": "/spending",
              "Savings": "/savings",
              "Investments": "/investments",
              "Insurance": "/personal-finance"
            };
            return (
              <div 
                key={i} 
                onClick={() => navigate(routes[card.title] || "/")}
                className={`md:col-span-2 bg-card border hairline p-6 rounded-2xl shadow-sm hover:border-primary/30 transition-all cursor-pointer group active:scale-[0.98]`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-xl">
                    {card.icon}
                  </div>
                  <TrendingUp className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-1">{card.title}</p>
                <h2 className="text-2xl font-bold tabular-nums mb-2 text-foreground">₹{card.value.toLocaleString('en-IN')}</h2>
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">{card.insight}</p>
                  <span className="text-[10px] text-primary font-bold opacity-0 group-hover:opacity-100 transition-opacity">MANAGE</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* MAIN ANALYSIS SECTION */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          
          {/* CHARTS (50/30/20 & CASHFLOW) */}
          <div className="md:col-span-8 grid grid-cols-1 gap-6">
            <div className="bg-card border hairline p-8 rounded-2xl shadow-sm group">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Financial Health Goal Progress (50, 20, 30 day rule analysis)</h3>
                <button 
                  onClick={() => navigate("/goals")}
                  className="text-xs font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1"
                >
                  REVISE STRATEGY <TrendingUp className="w-3 h-3" />
                </button>
              </div>
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart 
                    data={[
                      { name: "Needs", Target: income * 0.5, Actual: expenses * 0.6 }, 
                      { name: "Wants", Target: income * 0.3, Actual: expenses * 0.4 }, 
                      { name: "Savings", Target: income * 0.2, Actual: savings + investments }
                    ]}
                    margin={{ top: 0, right: 0, left: -20, bottom: 0 }}
                  >
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#8e8e93', fontSize: 11 }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#8e8e93', fontSize: 10 }} tickFormatter={(val) => `₹${val / 1000}k`} />
                    <Tooltip 
                      cursor={{ fill: 'rgba(0,122,255,0.02)' }}
                      contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 40px rgba(0,0,0,0.06)' }} 
                    />
                    <Bar dataKey="Target" fill="#C7C7CC" radius={[4, 4, 0, 0]} barSize={24} />
                    <Bar dataKey="Actual" fill="#007aff" radius={[4, 4, 0, 0]} barSize={24} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-card border hairline p-8 rounded-2xl shadow-sm group">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Monthly Overview</h3>
                <button 
                  onClick={() => navigate("/spending")}
                  className="text-xs font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1"
                >
                  REFINE BUDGET <TrendingUp className="w-3 h-3" />
                </button>
              </div>
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart 
                    data={[
                      { name: "Income", value: income }, 
                      { name: "Expense", value: expenses }, 
                      { name: "Savings", value: savings }
                    ]}
                    margin={{ top: 0, right: 0, left: -20, bottom: 0 }}
                  >
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#8e8e93', fontSize: 11 }} dy={10} />
                    <Tooltip cursor={{ fill: 'rgba(0,122,255,0.02)' }} contentStyle={{ borderRadius: '16px', border: 'none' }} />
                    <Bar dataKey="value" fill="#007aff" radius={[8, 8, 8, 8]} barSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* HEALTH & EMERGENCY FUND */}
          <div className="md:col-span-4 flex flex-col gap-6">
            
            {/* HEALTH SCORE CARD */}
            <div className="bg-card border hairline p-8 rounded-2xl shadow-sm text-center">
              <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-4">Financial Health</h3>
              <div className="w-24 h-24 rounded-full border-4 border-secondary mx-auto mb-4 flex items-center justify-center">
                <span className="text-4xl font-bold text-foreground">{score}</span>
              </div>
              <div className={`p-4 rounded-2xl text-[13px] leading-relaxed ${colorMap[currentInsight.color]} bg-opacity-20 flex gap-3 text-left`}>
                <span className="text-lg">{currentInsight.icon}</span>
                <p>{currentInsight.message}</p>
              </div>
            </div>

            {/* EMERGENCY FUNDS CARD */}
            <div className="bg-card border hairline p-8 rounded-2xl shadow-sm group">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-widest">Emergency funds</h3>
                <ShieldCheck className="w-4 h-4 text-muted-foreground" />
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <p className="text-2xl font-bold text-foreground">₹{emergencyFund.toLocaleString('en-IN')}</p>
                  <p className="text-xs text-muted-foreground">/ ₹{emergencyTarget.toLocaleString('en-IN')}</p>
                </div>
                <div className="w-full bg-secondary h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-primary h-full rounded-full transition-all duration-1000 ease-out" 
                    style={{ width: `${Math.min(progressPercent, 100)}%` }} 
                  />
                </div>
                <div className="flex justify-between items-center mt-2">
                  <p className="text-[11px] font-medium text-muted-foreground">
                    {progressPercent.toFixed(0)}% complete
                  </p>
                  <button 
                    onClick={() => navigate("/savings")}
                    className="text-[11px] font-bold text-primary group-hover:underline underline-offset-2"
                  >
                    MANAGE SAVINGS →
                  </button>
                </div>
              </div>
            </div>

            {/* QUICK ACTION CARD */}
            <div className="bg-primary p-8 rounded-2xl text-white shadow-xl flex flex-col justify-between min-h-[160px]">
              <div>
                <h2 className="text-sm font-bold mb-2 flex items-center gap-2 text-white/90">
                  <Sparkles className="w-4 h-4" /> What should I do next AI smarts
                </h2>
                <p className="text-base font-semibold leading-tight">{smartAction.text}</p>
              </div>
              <button 
                onClick={handleAction} 
                className="bg-white text-primary w-fit px-5 py-2 rounded-full font-bold hover:scale-105 transition-transform active:scale-95 text-xs mt-4"
              >
                {smartAction.cta}
              </button>
            </div>

          </div>

        </div>
      </div>

      {/* PDF OVERLAY */}
      {isGeneratingPDF && (
        <div className="pdf-ignore fixed inset-0 z-[9999] flex items-center justify-center bg-white/40 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white px-10 py-8 rounded-2xl shadow-2xl flex flex-col items-center gap-4 text-center border hairline">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary text-2xl animate-bounce">
              <Download />
            </div>
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-foreground tracking-tight">Exporting Report</h2>
              <p className="text-muted-foreground text-sm font-medium">{pdfStatus || "Polishing document..."}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}