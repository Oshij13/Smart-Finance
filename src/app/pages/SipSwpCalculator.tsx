import { useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { getUserData } from "../store/userStore";
import { Info, Calculator, TrendingUp } from "lucide-react";

export function SipSwpCalculator() {
    const [mode, setMode] = useState<"sip" | "swp">("sip");

    // SIP inputs
    const [monthlyInvestment, setMonthlyInvestment] = useState("");
    const [expectedReturn, setExpectedReturn] = useState("");
    const [time, setTime] = useState("");

    // SWP inputs
    const [corpus, setCorpus] = useState("");
    const [withdrawalRate, setWithdrawalRate] = useState("");
    const [swpTime, setSwpTime] = useState("");
    const [inflation, setInflation] = useState("");
    const [monthlyWithdrawal, setMonthlyWithdrawal] = useState("");

    const [result, setResult] = useState<number | null>(null);
    const [totalInvested, setTotalInvested] = useState<number | null>(null);
    const [swpResult, setSwpResult] = useState<any>(null);
    const [sustainableWithdrawal, setSustainableWithdrawal] = useState<number | null>(null);
    const [chartData, setChartData] = useState<any[]>([]);

    const userData = getUserData();
    const income = userData?.income || 0;

    const calculate = () => {
        let data: any[] = [];

        if (mode === "sip") {
            const P = parseFloat(monthlyInvestment);
            const annualRate = parseFloat(expectedReturn) / 100;
            const years = parseFloat(time);

            const r = annualRate / 12;
            const n = years * 12;

            let futureValue = 0;

            // Add Initial Point (Year 0)
            data.push({
                year: 0,
                corpus: Math.round(P),
                withdrawal: 0
            });

            for (let i = 0; i < n; i++) {
                futureValue = (futureValue + P) * (1 + r);
                if ((i + 1) % 12 === 0 || i === n - 1) { // Ensure final point is captured
                    data.push({
                        year: Math.ceil((i + 1) / 12),
                        corpus: Math.max(0, Math.round(futureValue)),
                    });
                }
            }

            const invested = P * n;

            setResult(Math.round(futureValue));
            setTotalInvested(Math.round(invested));
            setChartData(data);
        }

        if (mode === "swp") {
            const P = parseFloat(corpus) || 0;
            const annualRate = (parseFloat(withdrawalRate) || 0) / 100;
            const years = parseFloat(swpTime) || 0;

            const r = annualRate / 12;
            const n = years * 12;

            const inflationRate = (parseFloat(inflation) || 6) / 100;

            let low = 0;
            let high = P;
            let sustainable = 0;

            for (let iter = 0; iter < 40; iter++) {
                let mid = (low + high) / 2;
                let value = P;
                let w = mid;

                for (let i = 0; i < n; i++) {
                    value = value * (1 + r);
                    value -= w;

                    if ((i + 1) % 12 === 0) {
                        w *= (1 + inflationRate);
                    }

                    if (value < 0) break;
                }

                if (value >= 0) {
                    sustainable = mid;
                    low = mid;
                } else {
                    high = mid;
                }
            }

            setSustainableWithdrawal(Math.round(sustainable));

            // Start Data with Year 0
            const startWithdrawal = monthlyWithdrawal ? parseFloat(monthlyWithdrawal) : sustainable;
            data.push({
                year: 0,
                corpus: Math.round(P),
                withdrawal: Math.round(startWithdrawal)
            });

            if (monthlyWithdrawal) {
                let value = P;
                let w = parseFloat(monthlyWithdrawal);
                let totalWithdrawn = 0;
                let monthsLasted = 0;

                for (let i = 0; i < n; i++) {
                    value = value * (1 + r);
                    value -= w;

                    if (value <= 0) {
                        monthsLasted = i;
                        totalWithdrawn += w;
                        value = 0;
                        // Add final point when empty
                        data.push({
                            year: Number(((i + 1) / 12).toFixed(1)),
                            corpus: 0,
                            withdrawal: Math.round(w)
                        });
                        break;
                    }

                    totalWithdrawn += w;

                    if ((i + 1) % 12 === 0) {
                        data.push({
                            year: (i + 1) / 12,
                            corpus: Math.max(0, Math.round(value)),
                            withdrawal: Math.round(w),
                        });
                        w *= (1 + inflationRate);
                    }

                    monthsLasted = i;
                }

                setSwpResult({
                    finalCorpus: Math.round(value),
                    totalWithdrawn: Math.round(totalWithdrawn),
                    years: Math.floor(monthsLasted / 12),
                    months: monthsLasted % 12,
                });
            } else {
                let value = P;
                let w = sustainable;
                let totalWithdrawn = 0;
                let monthsLasted = 0;

                for (let i = 0; i < n; i++) {
                    value = value * (1 + r);
                    value -= w;

                    if (value <= 0) {
                        monthsLasted = i;
                        totalWithdrawn += w;
                        value = 0;
                        data.push({
                            year: Number(((i + 1) / 12).toFixed(1)),
                            corpus: 0,
                            withdrawal: Math.round(w)
                        });
                        break;
                    }

                    totalWithdrawn += w;

                    if ((i + 1) % 12 === 0) {
                        data.push({
                            year: (i + 1) / 12,
                            corpus: Math.max(0, Math.round(value)),
                            withdrawal: Math.round(w),
                        });
                        w *= (1 + inflationRate);
                    }

                    monthsLasted = i;
                }

                setSwpResult({
                    finalCorpus: Math.round(value),
                    totalWithdrawn: Math.round(totalWithdrawn),
                    years: Math.floor(monthsLasted / 12),
                    months: monthsLasted % 12,
                });
            }

            setChartData(data);
        }
    };

    const aiRecommendation = () => {
        if (mode === "sip") {
            const amt = parseFloat(monthlyInvestment) || 0;
            const ideal = income * 0.2;
            if (amt < ideal) {
                return `You're investing ₹${amt.toLocaleString('en-IN')}, but based on your income, you should aim for around ₹${ideal.toLocaleString('en-IN')} monthly.`;
            }
            return `Great! You're investing a strong amount. Consistency is key for wealth creation.`;
        }
        return `Ensure your withdrawal is sustainable. Ideally, your withdrawal should be lower than your returns to avoid depletion.`;
    };

    const inputClass = "w-full px-4 py-3 rounded-xl border hairline bg-background text-sm focus:outline-none focus:ring-1 focus:ring-primary transition-all";

    return (
        <div className="min-h-screen bg-[#f8f9fa] text-foreground">
            <div className="w-full px-6 lg:px-12 py-10 space-y-12">

                {/* HEADER */}
                <section className="space-y-2">
                    <p className="text-sm font-bold text-primary/60 uppercase tracking-widest">Calculators</p>
                    <h1 className="text-5xl font-bold tracking-tight text-slate-900">
                        SIP / SWP
                    </h1>
                    <p className="text-slate-500 text-lg max-w-2xl leading-relaxed">
                        Plan your wealth journey with precision. Switch between monthly investing (SIP) and systematic withdrawals (SWP).
                    </p>
                </section>

                {/* MODE TOGGLE */}
                <section className="max-w-4xl">
                    <div className="bg-slate-200/50 p-1.5 rounded-2xl flex w-full shadow-inner">
                        <button
                            onClick={() => { setMode("sip"); setResult(null); setChartData([]); }}
                            className={`flex-1 py-4 px-6 rounded-xl text-sm font-bold transition-all duration-300 ${
                                mode === "sip" ? "bg-white shadow-md text-primary scale-[1.02]" : "text-slate-500 hover:text-slate-700"
                            }`}
                        >
                            SIP Calculator
                        </button>
                        <button
                            onClick={() => { setMode("swp"); setResult(null); setChartData([]); }}
                            className={`flex-1 py-4 px-6 rounded-xl text-sm font-bold transition-all duration-300 ${
                                mode === "swp" ? "bg-white shadow-md text-primary scale-[1.02]" : "text-slate-500 hover:text-slate-700"
                            }`}
                        >
                            SWP Calculator
                        </button>
                    </div>
                </section>

                {/* CALCULATOR CONTAINER */}
                <section className="space-y-8">
                    <div className="rounded-[2.5rem] border hairline bg-white p-10 lg:p-14 shadow-xl shadow-slate-200/50 space-y-10">
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b hairline pb-8">
                            <div>
                                <h3 className="text-2xl font-bold text-slate-900">
                                    {mode === "sip" ? "Growth Engine" : "Withdrawal Strategy"}
                                </h3>
                                <p className="text-sm text-slate-500 mt-2 font-medium">
                                    {mode === "sip"
                                        ? "Visualize how your monthly contributions compound over time."
                                        : "Analyze how long your corpus can support your lifestyle."}
                                </p>
                            </div>
                            <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-full border hairline">
                                <Calculator className="w-4 h-4 text-primary" />
                                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-600">Standard Formula Applied</span>
                            </div>
                        </div>

                        {/* INPUTS GRID */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {mode === "sip" ? (
                                <>
                                    <div className="space-y-3">
                                        <label className="text-[10px] items-center gap-1.5 flex font-bold text-muted-foreground uppercase tracking-widest">Monthly Investment (₹)</label>
                                        <input
                                            type="number"
                                            value={monthlyInvestment}
                                            onChange={(e) => setMonthlyInvestment(e.target.value)}
                                            placeholder="e.g. 5000"
                                            className={inputClass}
                                        />
                                        {monthlyInvestment && income > 0 && (
                                            <p className="text-[10px] font-bold text-primary uppercase tracking-tight">
                                                {Math.round((parseFloat(monthlyInvestment) / income) * 100)}% of income
                                            </p>
                                        )}
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] items-center gap-1.5 flex font-bold text-muted-foreground uppercase tracking-widest">Expected Return (%)</label>
                                        <input
                                            type="number"
                                            value={expectedReturn}
                                            onChange={(e) => setExpectedReturn(e.target.value)}
                                            placeholder="e.g. 12"
                                            className={inputClass}
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] items-center gap-1.5 flex font-bold text-muted-foreground uppercase tracking-widest">Time (Years)</label>
                                        <input
                                            type="number"
                                            value={time}
                                            onChange={(e) => setTime(e.target.value)}
                                            placeholder="e.g. 10"
                                            className={inputClass}
                                        />
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="space-y-3">
                                        <label className="text-[10px] items-center gap-1.5 flex font-bold text-muted-foreground uppercase tracking-widest">Initial Corpus (₹)</label>
                                        <input
                                            type="number"
                                            value={corpus}
                                            onChange={(e) => setCorpus(e.target.value)}
                                            placeholder="e.g. 10L"
                                            className={inputClass}
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] items-center gap-1.5 flex font-bold text-muted-foreground uppercase tracking-widest">Returns (%)</label>
                                        <input
                                            type="number"
                                            value={withdrawalRate}
                                            onChange={(e) => setWithdrawalRate(e.target.value)}
                                            placeholder="e.g. 8"
                                            className={inputClass}
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] items-center gap-1.5 flex font-bold text-muted-foreground uppercase tracking-widest">Years</label>
                                        <input
                                            type="number"
                                            value={swpTime}
                                            onChange={(e) => setSwpTime(e.target.value)}
                                            placeholder="e.g. 20"
                                            className={inputClass}
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] items-center gap-1.5 flex font-bold text-muted-foreground uppercase tracking-widest">Inflation (%)</label>
                                        <input
                                            type="number"
                                            value={inflation}
                                            onChange={(e) => setInflation(e.target.value)}
                                            placeholder="Standard 6%"
                                            className={inputClass}
                                        />
                                    </div>
                                    <div className="space-y-3 md:col-span-3">
                                        <label className="text-[10px] items-center gap-1.5 flex font-bold text-muted-foreground uppercase tracking-widest">Monthly Withdrawal (₹)</label>
                                        <input
                                            type="number"
                                            value={monthlyWithdrawal}
                                            onChange={(e) => setMonthlyWithdrawal(e.target.value)}
                                            placeholder="Wait for AI Sustainable result or enter your target"
                                            className={inputClass}
                                        />
                                    </div>
                                </>
                            )}
                        </div>

                        <button
                            onClick={calculate}
                            className="px-8 py-3 rounded-full bg-primary text-white text-sm font-semibold hover:opacity-90 transition shadow-sm"
                        >
                            Calculate
                        </button>

                        {/* MODE SPECIFIC INFO */}
                        {mode === "swp" && (
                             <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest text-center mt-4">
                                Withdrawal increases annually with inflation (Standard 6%)
                            </p>
                        )}
                    </div>

                    {/* RESULTS DISPLAY */}
                    {(result !== null || swpResult) && (
                        <div className="grid md:grid-cols-3 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                             {mode === "sip" ? (
                                <>
                                    <ResultCard label="Future Value" value={`₹${result?.toLocaleString('en-IN')}`} isPrimary />
                                    <ResultCard label="Total Invested" value={`₹${totalInvested?.toLocaleString('en-IN')}`} />
                                    <ResultCard label="Profit Earned" value={`₹${(result! - totalInvested!).toLocaleString('en-IN')}`} />
                                </>
                             ) : (
                                <>
                                    <ResultCard label="Duration Lasts" value={`${swpResult?.years}y ${swpResult?.months}m`} isPrimary />
                                    <ResultCard label="Sustainable Monthly" value={`₹${sustainableWithdrawal?.toLocaleString('en-IN')}`} />
                                    <ResultCard label="Total Withdrawn" value={`₹${swpResult?.totalWithdrawn.toLocaleString('en-IN')}`} />
                                </>
                             )}
                        </div>
                    )}
                </section>

                {/* GRAPH SECTION */}
                {chartData.length > 0 && (
                    <section className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-sm uppercase text-slate-400 font-bold tracking-[0.2em]">Projection Visualizer</h2>
                            <div className="flex items-center gap-6">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-primary"></div>
                                    <span className="text-[10px] font-bold uppercase tracking-tighter text-slate-500">Corpus Value</span>
                                </div>
                                {mode === "swp" && (
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-slate-400"></div>
                                        <span className="text-[10px] font-bold uppercase tracking-tighter text-slate-500">Monthly Yield</span>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="rounded-[2.5rem] border hairline bg-white p-10 lg:p-14 shadow-xl shadow-slate-200/50 h-[500px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorCorpus" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.1}/>
                                            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <XAxis 
                                        dataKey="year" 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 600 }}
                                        dy={15}
                                        label={{ value: 'Years', position: 'insideBottom', offset: -10, fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
                                    />
                                    <YAxis 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 600 }}
                                        tickFormatter={(val) => `₹${(val / 100000).toFixed(0)}L`}
                                        dx={-10}
                                    />
                                    <Tooltip 
                                        cursor={{ stroke: '#e2e8f0', strokeWidth: 2 }}
                                        contentStyle={{ backgroundColor: '#ffffff', border: 'none', borderRadius: '1rem', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '12px', padding: '12px' }}
                                        formatter={(value: any) => [`₹${value.toLocaleString('en-IN')}`, 'Amount']}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="corpus"
                                        stroke="hsl(var(--primary))"
                                        strokeWidth={4}
                                        dot={{ r: 0 }}
                                        activeDot={{ r: 6, strokeWidth: 0, fill: 'hsl(var(--primary))' }}
                                        name="Corpus"
                                        animationDuration={1500}
                                    />
                                    {mode === "swp" && (
                                        <Line
                                            type="monotone"
                                            dataKey="withdrawal"
                                            stroke="#94a3b8"
                                            strokeWidth={3}
                                            strokeDasharray="8 8"
                                            name="Withdrawal"
                                            dot={false}
                                        />
                                    )}
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </section>
                )}

                {/* AI RECOMMENDATION */}
                {(result !== null || sustainableWithdrawal !== null) && (
                    <section className="bg-primary/5 rounded-2xl p-8 border hairline border-primary/20 space-y-3">
                        <div className="flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-primary" />
                            <h3 className="text-sm font-bold uppercase tracking-widest text-primary">AI Insight</h3>
                        </div>
                        <p className="text-base text-foreground font-medium italic leading-relaxed">
                            "{aiRecommendation()}"
                        </p>
                    </section>
                )}

                {/* ABOUT SECTION */}
                <section className="space-y-6 pb-12">
                   <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">About</h2>
                   <div className="grid gap-6">
                        <div className="rounded-2xl border hairline bg-card p-8 group hover:bg-muted/30 transition-all cursor-default overflow-hidden relative">
                            <div className="absolute right-0 top-0 w-24 h-24 bg-primary/5 rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-150 duration-500"></div>
                            
                            <h4 className="text-sm font-bold flex items-center gap-2 mb-4">
                                <Info className="w-4 h-4 text-primary" />
                                What is {mode === "sip" ? "SIP" : "SWP"}?
                            </h4>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                {mode === "sip"
                                    ? "A Systematic Investment Plan (SIP) is a disciplined, automated method for investing fixed sums into the market. It acts like a recurring deposit but leverages market returns, using rupee cost averaging to build significant wealth over time."
                                    : "A Systematic Withdrawal Plan (SWP) is a way to create a steady income stream from your capital. It structured method to withdraw fixed or variable amounts at regular intervals, often used to bridge income gaps or fund retirement."}
                            </p>
                        </div>

                        <div className="rounded-2xl border hairline bg-card p-8 group hover:bg-muted/30 transition-all cursor-default overflow-hidden relative">
                             <h4 className="text-sm font-bold flex items-center gap-2 mb-4">
                                <Calculator className="w-4 h-4 text-primary" />
                                Why use {mode === "sip" ? "SIP" : "SWP"}?
                            </h4>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                {mode === "sip"
                                    ? "SIP promotes disciplined investing, reduces market timing risk, and leverages the explosive power of compounding. It's the most effective way for long-term goal reaching with small, regular contributions."
                                    : "SWP provides a reliable, tax-efficient stream of regular income while keeping your capital invested. It maintains your corpus longer by avoiding the need to time withdrawals."}
                            </p>
                        </div>

                        <div className="rounded-2xl border hairline bg-card p-8 group hover:bg-muted/30 transition-all cursor-default">
                             <h4 className="text-sm font-bold flex items-center gap-2 mb-4">
                                <TrendingUp className="w-4 h-4 text-primary" />
                                Who should use {mode === "sip" ? "SIP" : "SWP"}?
                            </h4>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                {mode === "sip"
                                    ? "Ideal for disciplined investors, beginners, and anyone looking to build wealth long-term without needing a large lump sum. Perfect for goals like retirement, education, or marriage."
                                    : "Ideal for retirees or investors seeking regular, predictable income. Excellent for those in high tax brackets who want a tax-efficient method to withdraw funds while keeping principal invested."}
                            </p>
                        </div>
                   </div>
                </section>

            </div>
        </div>
    );
}

function ResultCard({ label, value, isPrimary }: { label: string; value: string; isPrimary?: boolean }) {
    return (
        <div className={`rounded-2xl border hairline p-6 flex flex-col justify-between min-h-[140px] ${
            isPrimary ? "bg-primary border-primary text-primary-foreground" : "bg-card text-foreground"
        }`}>
            <p className={`text-sm font-medium ${isPrimary ? "text-primary-foreground/80" : "text-muted-foreground"}`}>{label}</p>
            <p className="text-3xl font-bold tracking-tight">{value}</p>
        </div>
    );
}