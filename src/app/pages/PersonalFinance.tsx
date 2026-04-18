import { useState } from "react";
import { 
  BookOpen, 
  TrendingUp, 
  Shield, 
  Wallet, 
  Smartphone, 
  Headphones, 
  Newspaper 
} from "lucide-react";

export function PersonalFinance() {
  const [income, setIncome] = useState("");
  const [showResults, setShowResults] = useState(false);

  const handleCalculate = () => {
    if (income) setShowResults(true);
  };

  const annualIncome = parseInt(income) || 0;
  const monthlyIncome = Math.round(annualIncome / 12);

  const budgetBreakdown = [
    { category: "Needs", desc: "50% for rent, groceries, bills", amount: monthlyIncome * 0.5, color: "bg-emerald-500" },
    { category: "Wants", desc: "30% for dining, hobbies, travel", amount: monthlyIncome * 0.3, color: "bg-amber-500" },
    { category: "Savings", desc: "20% for future goals, debt", amount: monthlyIncome * 0.2, color: "bg-blue-500" },
  ];

  const tips = [
    {
      icon: <Wallet className="w-4 h-4" />,
      title: "Follow the 50-30-20 Rule",
      description: "50% needs, 30% wants, 20% savings & debt."
    },
    {
      icon: <Shield className="w-4 h-4" />,
      title: "Build an Emergency Fund",
      description: "Aim for 6 months of expenses in liquid funds."
    },
    {
      icon: <TrendingUp className="w-4 h-4" />,
      title: "Track Your Expenses",
      description: "Use apps or sheets to monitor monthly flow."
    },
    {
      icon: <BookOpen className="w-4 h-4" />,
      title: "Educate Yourself",
      description: "Read 'Let's Talk Money' by Monika Halan."
    },
  ];

  const resources = [
    { icon: <BookOpen className="w-4 h-4" />, title: "Book: Let's Talk Money", desc: "India-specific personal finance guide." },
    { icon: <Headphones className="w-4 h-4" />, title: "Podcast: Paisa Vaisa", desc: "Weekly discussions on money in India." },
    { icon: <Newspaper className="w-4 h-4" />, title: "Newsletter: Finshots", desc: "Daily finance news in plain words." }
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-5xl px-5 lg:px-8 py-10 space-y-12">

        {/* HEADER */}
        <section className="space-y-2">
          <p className="text-sm text-muted-foreground">Personal Finance</p>
          <h1 className="text-4xl font-semibold tracking-tight leading-tight">
            Build a strong foundation
          </h1>
          <p className="text-muted-foreground text-base max-w-xl">
            A few quiet habits compound into long-term security.
          </p>
        </section>

        {/* QUICK CALCULATOR */}
        <section className="space-y-4">
          <h2 className="text-xs uppercase text-muted-foreground font-bold tracking-widest">
            Quick Calculator
          </h2>

          <div className="rounded-2xl border hairline bg-card p-8 space-y-6">
            <div className="space-y-3">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-tight">
                Annual Gross Income (₹)
              </label>
              <div className="max-w-md">
                <input
                  type="number"
                  placeholder="e.g. 600,000"
                  value={income}
                  onChange={(e) => setIncome(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border hairline bg-background text-sm focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                />
              </div>
            </div>

            <button
              onClick={handleCalculate}
              className="px-6 py-3 rounded-full bg-primary text-white text-sm font-medium hover:opacity-90 transition shadow-sm"
            >
              Calculate
            </button>
          </div>
        </section>

        {/* RESULTS */}
        {showResults && (
          <section className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-xs uppercase text-muted-foreground font-bold tracking-widest">
              Budget Breakdown (Monthly)
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {budgetBreakdown.map((item, i) => (
                <div key={i} className="rounded-2xl border hairline bg-card p-6 flex flex-col justify-between min-h-[160px]">
                  <div className="flex justify-between items-start">
                    <p className="text-sm text-muted-foreground font-medium">{item.category}</p>
                    <div className={`w-2 h-2 rounded-full ${item.color}`} />
                  </div>
                  <div className="space-y-1">
                    <p className="text-2xl font-semibold text-foreground">
                      ₹{item.amount.toLocaleString('en-IN')}
                    </p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-tight leading-none">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-2xl border hairline bg-card p-8 text-center space-y-2">
              <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">Total Monthly Net Allocation</p>
              <p className="text-4xl font-bold">₹{monthlyIncome.toLocaleString('en-IN')}</p>
              <p className="text-xs text-muted-foreground">Based on your ₹{annualIncome.toLocaleString('en-IN')} annual target.</p>
            </div>
          </section>
        )}

        {/* ESSENTIAL TIPS */}
        <section className="space-y-5">
          <h2 className="text-xs uppercase text-muted-foreground font-bold tracking-widest px-1">
            Essential Tips
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tips.map((tip, i) => (
              <div key={i} className="rounded-2xl border hairline bg-card p-6 flex items-start gap-4 hover:bg-muted/30 transition-colors group">
                <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center shrink-0 text-muted-foreground">
                  {tip.icon}
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-semibold text-foreground leading-none">{tip.title}</h3>
                  <p className="text-[13px] text-muted-foreground">{tip.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* RECOMMENDED */}
        <section className="space-y-5 pb-10">
          <h2 className="text-xs uppercase text-muted-foreground font-bold tracking-widest px-1">
            Recommended
          </h2>

          <div className="rounded-2xl border hairline bg-card divide-y hairline overflow-hidden">
            {resources.map((res, i) => (
              <div key={i} className="px-6 py-5 flex items-center gap-5 hover:bg-muted/30 transition-colors group cursor-pointer">
                <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center shrink-0 text-muted-foreground">
                  {res.icon}
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-semibold text-foreground leading-none">{res.title}</h4>
                  <p className="text-xs text-muted-foreground">{res.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}
