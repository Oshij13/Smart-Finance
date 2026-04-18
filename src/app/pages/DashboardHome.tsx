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
      <div className="max-w-[1440px] mx-auto space-y-10">
        
        {/* HEADER SECTION (CLEAN & SPACIOUS) */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-1">
            <h1 className="text-4xl font-bold tracking-tight text-foreground">Hey {userData?.name || "User"} 👋</h1>
            <p className="text-muted-foreground text-lg">Here's your financial overview for today.</p>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate("/ai-advisor")} 
              className="pdf-ignore px-6 py-3 rounded-2xl text-sm font-semibold bg-primary/10 text-primary hover:bg-primary/20 transition-all active:scale-95 flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" /> AI Advisor
            </button>
            <button 
              onClick={handleDownloadPDF} 
              className="pdf-ignore px-6 py-3 rounded-2xl text-sm font-semibold border border-border bg-white hover:bg-muted transition-all active:scale-95 flex items-center gap-2"
            >
              <Download className="w-4 h-4" /> Download PDF
            </button>
          </div>
        </div>

        {/* BENTO GRID START */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          
          {/* TOP HIGHLIGHTS (BENTO BRICKS) */}
          <div className="md:col-span-8 flex flex-col gap-8">
            
            {/* HERO BANNER SECTION (SUBTLE GRADIENT) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* SMART ACTION CARD */}
              <div className="bg-primary p-8 rounded-[2.5rem] text-white shadow-2xl flex flex-col justify-between min-h-[220px]">
                <div>
                  <h2 className="text-2xl font-bold mb-3 flex items-center gap-2">
                    <Sparkles className="w-6 h-6" /> Next Move
                  </h2>
                  <p className="text-white/80 leading-relaxed">{smartAction.text}</p>
                </div>
                <button 
                  onClick={handleAction} 
                  className="bg-white text-primary w-fit px-8 py-3 rounded-2xl font-bold hover:scale-105 transition-transform active:scale-95"
                >
                  {smartAction.cta}
                </button>
              </div>

              {/* PROGRESS CARD */}
              <div className="bg-white p-8 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.04)] flex flex-col justify-between min-h-[220px]">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold text-muted-foreground mb-1">Goal Progress</h3>
                    <p className="text-2xl font-bold text-foreground">{goal}</p>
                  </div>
                  <span className="text-3xl font-black text-primary/20">{progress.toFixed(0)}%</span>
                </div>
                <div className="space-y-3">
                  <div className="w-full bg-secondary h-4 rounded-full overflow-hidden">
                    <div 
                      className="bg-primary h-full rounded-full transition-all duration-1000 ease-out" 
                      style={{ width: `${Math.min(progress, 100)}%` }} 
                    />
                  </div>
                  <p className="text-sm font-medium text-muted-foreground">
                    ₹{currentValue.toLocaleString('en-IN')} saved of ₹{target.toLocaleString('en-IN')}
                  </p>
                </div>
              </div>
            </div>

            {/* FUTURE PROJECTION (WIDE) */}
            <div className="bg-white p-10 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.04)] relative overflow-hidden group">
              <div className="relative z-10 flex flex-col md:flex-row justify-between items-end gap-6">
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-muted-foreground">5 Year Projection</h3>
                  <p className="text-5xl font-black tracking-tight text-foreground">
                    ₹{calculateFutureNetWorth().toLocaleString('en-IN')}
                  </p>
                  <p className="text-green-600 font-medium flex items-center gap-1">
                    📈 Estimated growth at current pace
                  </p>
                </div>
                <div className="w-32 h-32 rounded-full bg-primary/5 absolute -right-8 -top-8 group-hover:scale-110 transition-transform duration-700" />
              </div>
            </div>

          </div>

          {/* SIDE ASSETS (PROFILE & HEALTH) */}
          <div className="md:col-span-4 flex flex-col gap-8">
            
            {/* PROFILE CARD */}
            <div className="bg-white p-8 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.04)] text-center">
              <div className="w-24 h-24 rounded-full bg-secondary mx-auto mb-4 flex items-center justify-center text-4xl font-bold text-primary">
                {(userData?.name || "U")[0]}
              </div>
              <h2 className="text-2xl font-bold mb-1">{userData?.name || "User"}</h2>
              <p className="text-muted-foreground mb-6">Monthly Income: ₹{income.toLocaleString('en-IN')}</p>
              
              <div className="pt-6 border-t border-border">
                <p className="text-sm text-muted-foreground mb-2">Primary Goal</p>
                {isEditingGoal ? (
                  <div className="flex gap-2 items-center justify-center">
                    <input
                      value={goalInput}
                      onChange={(e) => setGoalInput(e.target.value)}
                      className="bg-secondary px-4 py-2 rounded-xl text-sm w-full outline-none ring-2 ring-transparent focus:ring-primary/20 transition-all"
                      placeholder="Enter goal"
                      autoFocus
                    />
                    <button onClick={handleSaveGoal} className="text-primary font-bold">Save</button>
                  </div>
                ) : (
                  <div onClick={() => setIsEditingGoal(true)} className="cursor-pointer group">
                    <p className="text-xl font-bold text-primary group-hover:underline">{userData?.goal || "Wealth Building"}</p>
                    <p className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">Edit</p>
                  </div>
                )}
              </div>
            </div>

            {/* FINANCIAL HEALTH BEAT */}
            <div className="bg-white p-8 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.04)]">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-muted-foreground">Health Score</h3>
                <span className="text-3xl font-black text-foreground">{score}</span>
              </div>
              <div className="w-full bg-secondary h-6 rounded-full overflow-hidden mb-4">
                <div 
                  className="h-full rounded-full transition-all duration-1000" 
                  style={{ 
                    width: `${score}%`, 
                    backgroundColor: score > 75 ? "#34c759" : score > 50 ? "#ff9500" : "#ff3b30" 
                  }} 
                />
              </div>
              <div className={`p-4 rounded-3xl text-sm leading-relaxed ${colorMap[currentInsight.color]} bg-opacity-20 flex gap-3`}>
                <span className="text-lg">{currentInsight.icon}</span>
                <p>{currentInsight.message}</p>
              </div>
            </div>

          </div>

          {/* KPI TOKENS (SIX PACK) */}
          <div className="md:col-span-12 grid grid-cols-2 md:grid-cols-5 gap-6">
            {cards.map((card, i) => (
              <div 
                key={i} 
                className="bg-white p-8 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.04)] hover:scale-[1.02] transition-transform cursor-pointer"
              >
                <div className="w-10 h-10 rounded-2xl bg-secondary flex items-center justify-center text-xl mb-4">
                  {card.icon}
                </div>
                <p className="text-sm font-medium text-muted-foreground mb-1">{card.title}</p>
                <h2 className="text-2xl font-black truncate">₹{card.value.toLocaleString('en-IN')}</h2>
              </div>
            ))}
          </div>

          {/* CHARTS (CLEANER) */}
          <div className="md:col-span-7 bg-white p-10 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.04)]">
            <h3 className="text-xl font-bold mb-8">50/30/20 Analysis</h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart 
                  data={[
                    { name: "Needs", Target: income * 0.5, Actual: expenses * 0.6 }, 
                    { name: "Wants", Target: income * 0.3, Actual: expenses * 0.4 }, 
                    { name: "Savings", Target: income * 0.2, Actual: savings + investments }
                  ]}
                  margin={{ top: 0, right: 0, left: -20, bottom: 0 }}
                >
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#8e8e93', fontSize: 12 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#8e8e93', fontSize: 10 }} tickFormatter={(val) => `₹${val / 1000}k`} />
                  <Tooltip 
                    cursor={{ fill: 'rgba(0,122,255,0.05)' }}
                    contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
                  />
                  <Bar dataKey="Target" fill="#f2f2f7" radius={[10, 10, 0, 0]} barSize={24} />
                  <Bar dataKey="Actual" fill="#007aff" radius={[10, 10, 0, 0]} barSize={24} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="md:col-span-5 bg-white p-10 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.04)]">
            <h3 className="text-xl font-bold mb-8">Cashflow Snapshot</h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart 
                  data={[
                    { name: "In", value: income }, 
                    { name: "Out", value: expenses }, 
                    { name: "Bank", value: savings }
                  ]}
                  margin={{ top: 0, right: 0, left: -20, bottom: 0 }}
                >
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#8e8e93', fontSize: 12 }} dy={10} />
                  <Tooltip 
                    cursor={{ fill: 'rgba(0,122,255,0.05)' }}
                    contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
                  />
                  <Bar dataKey="value" fill="#007aff" radius={[12, 12, 12, 12]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* INSIGHTS (BENTO BOX STYLE) */}
          <div className="md:col-span-12 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.04)] relative">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center text-primary">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold">Top Expense</h3>
              </div>
              {topCategory ? (
                <div>
                  <p className="text-muted-foreground text-sm uppercase tracking-widest font-bold mb-1">{topCategory.category}</p>
                  <p className="text-4xl font-black mb-2">₹{Number(topCategory.amount).toLocaleString('en-IN')}</p>
                  <p className="text-sm font-medium text-muted-foreground">{topPercentage}% of your total spending</p>
                </div>
              ) : (
                <p className="text-muted-foreground">No data available yet</p>
              )}
            </div>

            <div className="bg-white p-8 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.04)] md:col-span-2">
              <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" /> AI Smart Analysis
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {insights.slice(0, 4).map((text, i) => (
                  <div key={i} className="bg-secondary p-4 rounded-2xl text-sm font-medium leading-relaxed border border-transparent hover:border-primary/20 transition-colors">
                    {text}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* EMERGENCY FUND CARD (CLEAN) */}
          <div className="md:col-span-12 bg-white p-10 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.04)] flex flex-col md:flex-row items-center gap-10">
            <div className="flex-1 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                  🛡️
                </div>
                <h3 className="text-2xl font-bold">Emergency Fund</h3>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                You have {emergencyMonths.toFixed(1)} months of coverage. 
                A solid safety net protects you from unexpected job loss or medical emergencies.
              </p>
            </div>
            <div className="w-full md:w-64 space-y-3">
              <div className="flex justify-between text-sm font-bold mb-1">
                <span>Coverage</span>
                <span className="text-primary">{Math.min((emergencyMonths / 6) * 100, 100).toFixed(0)}%</span>
              </div>
              <div className="w-full bg-secondary h-4 rounded-full overflow-hidden">
                <div 
                  className="bg-primary h-full rounded-full" 
                  style={{ width: `${Math.min((emergencyMonths / 6) * 100, 100)}%` }} 
                />
              </div>
              <p className="text-xs text-center text-muted-foreground font-medium">Target: 6 months of expenses</p>
            </div>
          </div>

        </div>
      </div>

      {/* PDF OVERLAY (PREMIUM BLUR) */}
      {isGeneratingPDF && (
        <div className="pdf-ignore fixed inset-0 z-[9999] flex items-center justify-center bg-white/40 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white px-10 py-8 rounded-[2.5rem] shadow-2xl flex flex-col items-center gap-4 text-center">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-primary text-4xl animate-bounce">
              <Download />
            </div>
            <div className="space-y-1">
              <h2 className="text-2xl font-black text-foreground">Generating High-Res Report</h2>
              <p className="text-muted-foreground font-medium">{pdfStatus || "Polishing the document..."}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}