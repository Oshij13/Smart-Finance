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

import { 
  Sparkles, 
  Download, 
  CircleDollarSign, 
  CreditCard, 
  TrendingUp, 
  Gem, 
  ShieldCheck, 
  AlertCircle, 
  AlertTriangle, 
  Shield, 
  BarChart3, 
  Trophy,
  FileText
} from "lucide-react";

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
    { title: "Income", value: income, color: "text-green-600", bg: "bg-green-50", icon: <CircleDollarSign className="w-5 h-5 opacity-70" />, insight: "Stable income flow" },
    { title: "Expenses", value: expenses, color: "text-red-500", bg: "bg-red-50", icon: <CreditCard className="w-5 h-5 opacity-70" />, insight: expenses > income * 0.6 ? "High spending" : "Controlled spending" },
    { title: "Savings", value: savings, color: "text-blue-600", bg: "bg-blue-50", icon: <TrendingUp className="w-5 h-5 opacity-70" />, insight: savingsRate >= 20 ? "Strong savings" : "Building phase" },
    { title: "Investments", value: investments, color: "text-purple-600", bg: "bg-purple-50", icon: <Gem className="w-5 h-5 opacity-70" />, insight: investmentRate > 15 ? "Investing expert" : "Start investing more" },
    {
      title: "Insurance",
      value: insurance,
      color: "text-indigo-600",
      bg: "bg-indigo-50",
      icon: <ShieldCheck className="w-5 h-5 opacity-70" />,
      insight:
        insuranceStatus === "Strong"
          ? "Well protected"
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
        icon: <AlertCircle className="w-5 h-5" />
      };
    }

    if (expenseRatio > 0.7) {
      return {
        message: `You're spending ₹${expenses.toLocaleString('en-IN')} (~${Math.round(expenseRatio * 100)}% of your income). Try to bring this below 60% for better financial stability.`,
        color: "red",
        icon: <AlertTriangle className="w-5 h-5" />
      };
    }

    if (insurance < idealInsurance * 0.5) {
      return {
        message: `Your insurance coverage is ₹${insurance.toLocaleString('en-IN')}. Based on your income ₹${income.toLocaleString('en-IN')}, you should aim for at least ₹${idealInsurance.toLocaleString('en-IN')} (10–12× income) to stay financially protected.`,
        color: "red",
        icon: <Shield className="w-5 h-5" />
      };
    }

    if (savingsRate < 20) {
      return {
        message: `You're saving ₹${savings.toLocaleString('en-IN')} (~${Math.round(savingsRate)}%). Based on your income ₹${income.toLocaleString('en-IN')}, you should aim for ₹${idealSavings.toLocaleString('en-IN')} (20%) monthly.`,
        color: "orange",
        icon: <BarChart3 className="w-5 h-5" />
      };
    }

    if (emergencyMonths < 3) {
      return {
        message: `You currently have ${emergencyMonths.toFixed(1)} months of emergency savings. Try to reach at least 3–6 months (₹${(expenses * 6).toLocaleString('en-IN')}) for safety.`,
        color: "orange",
        icon: <Shield className="w-5 h-5" />
      };
    }

    if (investments < savings * 0.3) {
      return {
        message: `You're saving well (₹${savings.toLocaleString('en-IN')}), but investing only ₹${investments.toLocaleString('en-IN')}. Consider investing more to grow your wealth.`,
        color: "blue",
        icon: <TrendingUp className="w-5 h-5" />
      };
    }

    return {
      message: `Excellent! You're saving ₹${savings.toLocaleString('en-IN')} and investing ₹${investments.toLocaleString('en-IN')}. You're on track for strong financial growth.`,
      color: "green",
      icon: <Trophy className="w-5 h-5" />
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

    const months = 60; // 5 years
    const rate = 0.12 / 12; // 12% annual return

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
    <div id="dashboard-content" className="min-h-screen bg-background text-foreground">
      <div className="w-full px-6 lg:px-10 py-12 space-y-12">

        {/* HEADER */}
        <section className="space-y-1">
          <h1 className="text-4xl font-semibold tracking-tight text-foreground">
            Hello, {userData?.name || "there"}.
          </h1>
          <p className="text-muted-foreground text-base">
            A quiet look at your money today.
          </p>

          <div className="flex gap-2 pt-3">
            <button
              onClick={() => navigate("/ai-advisor")}
              className="pdf-ignore px-4 py-2 rounded-full border hairline text-sm hover:bg-muted transition-colors text-foreground flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-primary" />
              Ask AI
            </button>

            <button
              onClick={handleDownloadPDF}
              className="pdf-ignore px-4 py-2 rounded-full text-sm bg-primary text-white hover:opacity-90 transition-opacity flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Download
            </button>
          </div>
        </section>

        {/* ✅ OVERVIEW MOVED HERE */}
        <section>
          <h2 className="text-xs uppercase text-muted-foreground font-bold tracking-widest mb-3">
            Overview
          </h2>

          <div className="rounded-2xl border hairline bg-card divide-y hairline">
            {cards.map((card, i) => (
              <div key={i} className="flex justify-between items-center px-5 py-4">
                <div className="flex items-center gap-3">
                  {card.icon}
                  <span className="text-sm text-foreground">{card.title}</span>
                </div>
                <span className="font-medium text-foreground">
                  ₹{card.value.toLocaleString('en-IN')}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* ROW 1 */}
        <section className="grid md:grid-cols-2 gap-4">

          {/* FINANCIAL HEALTH */}
          <div className="rounded-2xl border hairline bg-card p-6 space-y-4">
            <h3 className="text-sm text-muted-foreground font-medium">Financial Health</h3>

            <p className="text-3xl font-semibold text-foreground">
              {score}/100
            </p>

            <div className="w-full bg-muted h-1.5 rounded-full">
              <div
                className="h-1.5 bg-primary rounded-full transition-all"
                style={{ width: `${score}%` }}
              />
            </div>

            <p className="text-sm text-muted-foreground">
              {currentInsight.message}
            </p>
          </div>

          {/* NEXT ACTION */}
          <div className="rounded-2xl border hairline bg-card p-6 space-y-4">
            <h3 className="text-sm text-muted-foreground font-medium">Next Best Action</h3>

            <p className="text-lg font-semibold text-foreground">{smartAction.text}</p>

            <button
              onClick={handleAction}
              className="text-sm px-4 py-2 rounded-full bg-primary text-white w-fit hover:opacity-90 transition-opacity"
            >
              {smartAction.cta}
            </button>
          </div>
        </section>

        {/* ROW 2 */}
        <section className="grid md:grid-cols-2 gap-4">

        {/* EMERGENCY FUND */}
        <div className="rounded-2xl border hairline bg-card p-6 flex flex-col space-y-4 min-h-[160px]">
          <div className="flex justify-between items-start">
            <h3 className="text-sm text-muted-foreground font-medium">Emergency Fund</h3>
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Safety Net</span>
          </div>

          <div className="flex justify-between items-end">
            <p className="text-2xl font-semibold text-foreground">
              ₹{savedAmount.toLocaleString('en-IN')}
            </p>
            <p className="text-xs text-muted-foreground">
              / ₹{targetAmount.toLocaleString('en-IN')}
            </p>
          </div>

          <div className="space-y-2">
            <div className="w-full bg-muted h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-primary h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(progressPercent, 100)}%` }}
              />
            </div>
            <p className="text-[10px] text-muted-foreground">
              {Math.round(progressPercent)}% complete
            </p>
          </div>
        </div>

        {/* GOAL Progress */}
        <div className="rounded-2xl border hairline bg-card p-6 flex flex-col space-y-4 min-h-[160px]">
          <div className="flex justify-between items-start w-full">
            <h3 className="text-sm text-muted-foreground font-medium">Goal Progress</h3>
            
            {isEditingGoal ? (
              <div className="flex gap-1 items-center">
                <input
                  value={goalInput}
                  onChange={(e) => setGoalInput(e.target.value)}
                  className="border hairline px-2 py-0.5 rounded text-[10px] bg-background w-24 text-foreground font-medium outline-none focus:ring-1 focus:ring-primary"
                  placeholder="Set goal..."
                  autoFocus
                />
                <button
                  onClick={handleSaveGoal}
                  className="bg-primary text-white px-2 py-0.5 rounded-full text-[10px] font-medium"
                >
                  Save
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsEditingGoal(true)}
                className="text-[10px] text-primary font-medium hover:underline bg-primary/5 px-2 py-0.5 rounded-full transition-colors"
                title="Click to change goal"
              >
                {goal}
              </button>
            )}
          </div>

          <p className="text-2xl font-semibold text-foreground">
            {progress.toFixed(0)}%
          </p>

          <div className="space-y-2 mt-auto">
            <div className="w-full bg-muted h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-primary h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-tight">
              Tracking toward your primary goal
            </p>
          </div>
        </div>
        </section>

        {/* CHARTS */}
        <section className="grid md:grid-cols-2 gap-4">

          {/* 50/30/20 */}
          <div className="rounded-2xl border hairline bg-card p-6">
            <h3 className="text-base font-semibold mb-4 text-foreground">50/30/20 Rule</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={[
                { name: "Needs", value: expenses * 0.6 },
                { name: "Wants", value: expenses * 0.4 },
                { name: "Savings", value: savings + investments }
              ]}>
                <XAxis dataKey="name" fontSize={11} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip cursor={{ fill: 'transparent' }} />
                <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* MONTHLY */}
          <div className="rounded-2xl border hairline bg-card p-6">
            <h3 className="text-base font-semibold mb-4 text-foreground">Monthly Overview</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={[
                { name: "Income", value: income },
                { name: "Expenses", value: expenses },
                { name: "Savings", value: savings }
              ]}>
                <XAxis dataKey="name" fontSize={11} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip cursor={{ fill: 'transparent' }} />
                <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* ACTIONS */}
        <section>
          <h2 className="text-xs uppercase text-muted-foreground font-bold tracking-widest mb-3">
            What should you do next
          </h2>

          <div className="rounded-2xl border hairline bg-card divide-y hairline">
            {actions.map((item, i) => {
              const colors = ["bg-blue-500", "bg-purple-500", "bg-indigo-500", "bg-cyan-500"];
              return (
                <div
                  key={i}
                  onClick={() =>
                    navigate("/ai-advisor", { state: { query: item.action } })
                  }
                  className="px-5 py-4 cursor-pointer hover:bg-muted/40 transition-colors flex items-center gap-4"
                >
                  <div className={`w-1.5 h-1.5 rounded-full ${colors[i % colors.length]}`} />
                  <p className="text-sm font-medium text-foreground">{item.text}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* INSIGHTS */}
        <section>
          <h2 className="text-xs uppercase text-muted-foreground font-bold tracking-widest mb-3">
            Smart Insights
          </h2>

          <div className="rounded-2xl border hairline bg-card divide-y hairline">
            {insights.slice(0, 3).map((text, i) => {
              const colors = ["bg-emerald-500", "bg-amber-500", "bg-rose-500"];
              return (
                <div key={i} className="px-5 py-4 text-sm leading-relaxed text-muted-foreground flex items-start gap-4">
                  <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${colors[i % colors.length]}`} />
                  <span>{text}</span>
                </div>
              );
            })}
          </div>
        </section>

      </div>

      {isGeneratingPDF && (
        <div className="pdf-ignore fixed inset-0 z-[9999] flex items-center justify-center bg-background/40 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-card px-8 py-6 rounded-2xl border hairline shadow-2xl flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-xl animate-pulse">
              <FileText className="w-6 h-6 text-muted-foreground" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg leading-none mb-1 text-foreground">
                Exporting Report
              </span>
              <span className="text-sm font-medium text-muted-foreground">
                {pdfStatus || "Please wait..."}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}