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

            for (let i = 0; i < n; i++) {
                futureValue = (futureValue + P) * (1 + r);
                if ((i + 1) % 12 === 0) {
                    data.push({
                        year: (i + 1) / 12,
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
        <div className="min-h-screen bg-background text-foreground">
            <div className="mx-auto max-w-5xl px-5 lg:px-8 py-10 space-y-12">

                {/* HEADER */}
                <section className="space-y-2">
                    <p className="text-sm text-muted-foreground">Calculator</p>
                    <h1 className="text-4xl font-semibold tracking-tight">
                        SIP / SWP
                    </h1>
                    <p className="text-muted-foreground text-base max-w-xl">
                        Plan your monthly investments and withdrawals.
                    </p>
                </section>

                {/* MODE TOGGLE */}
                <section>
                    <div className="bg-muted p-1 rounded-2xl flex max-w-2xl mx-auto">
                        <button
                            onClick={() => { setMode("sip"); setResult(null); setChartData([]); }}
                            className={`flex-1 py-3 px-4 rounded-xl text-sm font-semibold transition-all ${
                                mode === "sip" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                            }`}
                        >
                            SIP Calculator
                        </button>
                        <button
                            onClick={() => { setMode("swp"); setResult(null); setChartData([]); }}
                            className={`flex-1 py-3 px-4 rounded-xl text-sm font-semibold transition-all ${
                                mode === "swp" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                            }`}
                        >
                            SWP Calculator
                        </button>
                    </div>
                </section>

                {/* CALCULATOR CONTAINER */}
                <section className="space-y-8">
                    <div className="rounded-2xl border hairline bg-card p-8 space-y-8">
                        <div>
                            <h3 className="text-lg font-semibold">
                                {mode === "sip" ? "SIP Calculator" : "SWP Calculator"}
                            </h3>
                            <p className="text-xs text-muted-foreground mt-1 font-medium">
                                {mode === "sip"
                                    ? "Calculate your future wealth with monthly investments"
                                    : "Plan your monthly withdrawals from your corpus"}
                            </p>
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
                    <section className="space-y-4">
                        <h2 className="text-xs uppercase text-muted-foreground font-bold tracking-widest">Growth Projection</h2>
                        <div className="rounded-2xl border hairline bg-card p-8 h-[400px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={chartData} margin={{ top: 20, right: 30, left: 10, bottom: 0 }}>
                                    <XAxis 
                                        dataKey="year" 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                                        dy={10}
                                    />
                                    <YAxis 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                                        tickFormatter={(val) => `₹${(val / 100000).toFixed(0)}L`}
                                    />
                                    <Tooltip 
                                        cursor={{ stroke: 'hsl(var(--muted-foreground))', strokeWidth: 1, strokeDasharray: '4 4' }}
                                        contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '0.75rem', fontSize: '11px' }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="corpus"
                                        stroke="hsl(var(--primary))"
                                        strokeWidth={3}
                                        dot={false}
                                        name="Projected Corpus"
                                        activeDot={{ r: 5, fill: 'hsl(var(--primary))' }}
                                    />
                                    {mode === "swp" && (
                                        <Line
                                            type="monotone"
                                            dataKey="withdrawal"
                                            stroke="hsl(var(--muted-foreground))"
                                            strokeWidth={2}
                                            strokeDasharray="6 6"
                                            name="Monthly Withdrawal"
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

                        <div className="rounded-2xl border hairline bg-card p-8 group hover:bg-muted/30 transition-all cursor-default">
                             <h4 className="text-sm font-bold flex items-center gap-2 mb-4">
                                <Calculator className="w-4 h-4 text-primary" />
                                Why use {mode === "sip" ? "SIP" : "SWP"}?
                            </h4>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                {mode === "sip"
                                    ? "SIP promotes disciplined investing, reduces market timing risk, and leverages the explosive power of compounding. It's the most effective way for long-term goal reaching with small, regular contributions."
                                    : "SWP provides a predictable, tax-efficient stream of regular income while keeping your capital invested. It maintains your corpus longer by avoiding the need to time withdrawals."}
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