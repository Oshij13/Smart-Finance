import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { getUserData } from "../store/userStore";

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

            // -----------------------------
            // ✅ 1. Sustainable Withdrawal (binary search)
            // -----------------------------
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

            // -----------------------------
            // ✅ 2. User Withdrawal Simulation (if provided)
            // -----------------------------
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
                setSwpResult(null);

                // Build chart safely using sustainable so chart works when user withdrawal is empty
                let value = P;
                let w = sustainable;
                for (let i = 0; i < n; i++) {
                    value = value * (1 + r);
                    value -= w;
                    if ((i + 1) % 12 === 0) {
                        data.push({
                            year: (i + 1) / 12,
                            corpus: Math.max(0, Math.round(value)),
                            withdrawal: Math.round(w),
                        });
                        w *= (1 + inflationRate);
                    }
                }
            }

            setChartData(data);
        }
    };

    const aiRecommendation = () => {
        if (mode === "sip") {
            const amt = parseFloat(monthlyInvestment) || 0;
            const ideal = income * 0.2;
            if (amt < ideal) {
                return `You're investing ₹${amt.toLocaleString()}, but based on your income ₹${income.toLocaleString()}, you should aim for around ₹${ideal.toLocaleString()} monthly for better wealth creation.`;
            }
            return `Great! You're investing a strong amount. Keep it consistent to build long-term wealth.`;
        }
        return `Ensure your withdrawal is sustainable. Ideally, your withdrawal should be lower than your returns to avoid running out of money.`;
    };



    const inputClass = "w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500";

    return (
        <div className="space-y-8">

            {/* HEADER */}
            <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-8 text-white shadow-xl">
                <h1 className="text-3xl font-bold">SIP / SWP Calculator</h1>
                <p className="text-lg text-emerald-50">
                    Plan your investments and withdrawals smartly
                </p>
            </div>

            {/* MODE SELECTOR */}
            <div className="flex gap-4">
                <button
                    onClick={() => { setMode("sip"); setResult(null); setChartData([]); }}
                    className={`flex-1 p-4 rounded-xl border transition cursor-pointer ${
                        mode === "sip"
                            ? "border-emerald-500 bg-emerald-50"
                            : "border-gray-200 bg-white"
                    }`}
                >
                    <h3 className="font-semibold text-left">SIP Calculator</h3>
                    <p className="text-xs text-gray-500 text-left mt-1">
                        Invest monthly and grow wealth over time
                    </p>
                </button>

                <button
                    onClick={() => { setMode("swp"); setResult(null); setChartData([]); }}
                    className={`flex-1 p-4 rounded-xl border transition cursor-pointer ${
                        mode === "swp"
                            ? "border-emerald-500 bg-emerald-50"
                            : "border-gray-200 bg-white"
                    }`}
                >
                    <h3 className="font-semibold text-left">SWP Calculator</h3>
                    <p className="text-xs text-gray-500 text-left mt-1">
                        Withdraw fixed income from investments
                    </p>
                </button>
            </div>

            {/* CALCULATOR CARD */}
            <div className="bg-white rounded-2xl shadow-md p-6 space-y-6">
                <div>
                    <h2 className="text-lg font-semibold">
                        {mode === "sip" ? "SIP Calculator" : "SWP Calculator"}
                    </h2>
                    <p className="text-sm text-gray-500">
                        {mode === "sip"
                            ? "Calculate your future wealth with monthly investments"
                            : "Plan your monthly withdrawals from your corpus"}
                    </p>
                </div>

                {/* INPUTS */}
                {mode === "sip" ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">
                                Monthly Investment (₹)
                            </label>
                            <input
                                type="number"
                                value={monthlyInvestment}
                                onChange={(e) => setMonthlyInvestment(e.target.value)}
                                placeholder="e.g. 5000"
                                className={inputClass}
                            />
                            {monthlyInvestment && income > 0 && (
                                <p className="text-xs text-gray-500">
                                    That's{" "}
                                    <span className="font-semibold text-emerald-600">
                                        {Math.round((parseFloat(monthlyInvestment) / income) * 100)}%
                                    </span>{" "}
                                    of your monthly income
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">
                                Expected Return (%)
                            </label>
                            <input
                                type="number"
                                value={expectedReturn}
                                onChange={(e) => setExpectedReturn(e.target.value)}
                                placeholder="e.g. 12"
                                className={inputClass}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">
                                Time (Years)
                            </label>
                            <input
                                type="number"
                                value={time}
                                onChange={(e) => setTime(e.target.value)}
                                placeholder="e.g. 10"
                                className={inputClass}
                            />
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

                            {/* Corpus */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">
                                    Initial Corpus (₹)
                                </label>
                                <input
                                    type="number"
                                    value={corpus}
                                    onChange={(e) => setCorpus(e.target.value)}
                                    placeholder="e.g. 1000000"
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500"
                                />
                            </div>

                            {/* Return */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">
                                    Expected Return (%)
                                </label>
                                <input
                                    type="number"
                                    value={withdrawalRate}
                                    onChange={(e) => setWithdrawalRate(e.target.value)}
                                    placeholder="e.g. 8"
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500"
                                />
                            </div>

                            {/* Time */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">
                                    Time (Years)
                                </label>
                                <input
                                    type="number"
                                    value={swpTime}
                                    onChange={(e) => setSwpTime(e.target.value)}
                                    placeholder="e.g. 20"
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">
                                    Monthly Withdrawal (₹) (Optional)
                                </label>
                                <input
                                    type="number"
                                    value={monthlyWithdrawal}
                                    onChange={(e) => setMonthlyWithdrawal(e.target.value)}
                                    placeholder="e.g. 50000"
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500"
                                />
                            </div>
                        </div>
                        <p className="text-xs text-gray-500 text-center mt-4">
                            This withdrawal increases annually with inflation (default 6%)
                        </p>
                    </>
                )}

                {/* CALCULATE BUTTON */}
                <button
                    onClick={calculate}
                    className="px-6 py-2.5 rounded-lg bg-green-600 text-white font-medium hover:opacity-90 transition mx-auto block"
                >
                    Calculate
                </button>

                {/* SIP RESULT */}
                {mode === "sip" && result !== null && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">

                        {/* Future Value */}
                        <div className="bg-green-50 rounded-xl p-4">
                            <p className="text-sm text-gray-600">Future Value</p>
                            <h3 className="text-xl font-semibold text-green-700">
                                ₹ {result.toLocaleString()}
                            </h3>
                        </div>

                        {/* Total Investment */}
                        <div className="bg-gray-50 rounded-xl p-4">
                            <p className="text-sm text-gray-600">Total Invested</p>
                            <h3 className="text-xl font-semibold">
                                ₹ {totalInvested?.toLocaleString()}
                            </h3>
                        </div>

                        <p className="text-sm text-gray-500 pt-2 md:col-span-2">
                            You earned ₹ {(result! - totalInvested!).toLocaleString()} as returns
                        </p>

                    </div>
                )}

                {/* SWP RESULT */}
                {mode === "swp" && (swpResult || sustainableWithdrawal !== null) && (
                    <div className="bg-gray-50 rounded-xl p-4 mt-4">
                        <div className="grid grid-cols-2 gap-4 text-center">
                            {/* Duration */}
                            <div>
                                <p className="text-xs text-gray-500">Your Withdrawal Lasts</p>
                                <h3 className="font-semibold text-lg">
                                    {swpResult ? `${swpResult.years}y ${swpResult.months}m` : "-"}
                                </h3>
                            </div>

                            {/* Total Withdrawn */}
                            <div>
                                <p className="text-xs text-gray-500">Total Withdrawn</p>
                                <h3 className="font-semibold text-lg">
                                    {swpResult
                                        ? `₹ ${swpResult.totalWithdrawn.toLocaleString()}`
                                        : "-"}
                                </h3>
                            </div>

                            {/* Final Corpus */}
                            <div>
                                <p className="text-xs text-gray-500">Final Corpus</p>
                                <h3 className="font-semibold text-lg">
                                    {swpResult
                                        ? `₹ ${swpResult.finalCorpus.toLocaleString()}`
                                        : "-"}
                                </h3>
                            </div>

                            {/* Sustainable Withdrawal */}
                            <div>
                                <p className="text-xs text-gray-500">
                                    Sustainable Monthly Withdrawal
                                </p>
                                <h3 className="font-semibold text-lg text-green-700">
                                    {sustainableWithdrawal !== null
                                        ? `₹ ${sustainableWithdrawal.toLocaleString()}`
                                        : "-"}
                                </h3>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* GRAPH */}
            {chartData.length > 0 && (
                <Card className="border-none shadow-md bg-white">
                    <CardHeader>
                        <CardTitle>Growth Projection</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={chartData}>
                                <XAxis dataKey="year" />
                                <YAxis />
                                <Tooltip />
                                <Line
                                    type="monotone"
                                    dataKey="corpus"
                                    strokeWidth={3}
                                    stroke="#10b981"
                                    name="Remaining Corpus"
                                />
                                {mode === "swp" && (
                                    <Line
                                        type="monotone"
                                        dataKey="withdrawal"
                                        strokeWidth={3}
                                        stroke="#0d9488"
                                        strokeDasharray="5 5"
                                        name="Withdrawal"
                                    />
                                )}
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            )}

            {/* AI RECOMMENDATION */}
            {result !== null && (
                <Card className="border-none shadow-md bg-gradient-to-br from-emerald-50 to-teal-50">
                    <CardHeader>
                        <CardTitle>AI Recommendation</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-gray-700">{aiRecommendation()}</p>
                    </CardContent>
                </Card>
            )}

            {/* INFO SECTION */}
            <div className="space-y-4">
                <div className="bg-gray-50 rounded-xl p-5 text-sm text-gray-600">
                    <strong className="text-gray-800">📘 What is {mode === "sip" ? "SIP" : "SWP"}?</strong>
                    <p className="mt-2">
                        {mode === "sip"
                            ? "A Systematic Investment Plan (SIP) is a disciplined, automated method for investing a fixed sum of money into mutual funds at regular intervals. It acts like a recurring deposit but invests in the market, allowing investors to start with small amounts (as low as ₹500) to build wealth over time through rupee cost averaging."
                            : "A Systematic Withdrawal Plan (SWP) is a mutual fund facility that enables investors to withdraw a fixed or variable amount from their investments at regular intervals. It serves as a structured method to generate a steady income stream, often used for retirement or financial planning."}
                    </p>
                </div>

                <div className="bg-gray-50 rounded-xl p-5 text-sm text-gray-600">
                    <strong className="text-gray-800">💡 Why is {mode === "sip" ? "SIP" : "SWP"} useful?</strong>
                    <p className="mt-2">
                        {mode === "sip"
                            ? "SIP promotes disciplined investing, reduces market timing risk through rupee cost averaging, and leverages the power of compounding to build significant long-term wealth from small regular contributions."
                            : "SWP provides a reliable, tax-efficient stream of regular income while keeping your capital invested and growing. It avoids the need to time the market and maintains your corpus for longer."}
                    </p>
                </div>

                <div className="bg-gray-50 rounded-xl p-5 text-sm text-gray-600">
                    <strong className="text-gray-800">🎯 Who should use {mode === "sip" ? "SIP" : "SWP"}?</strong>
                    <p className="mt-2">
                        {mode === "sip"
                            ? "Ideal for disciplined investors, beginners, and anyone looking to build wealth long-term without needing a large lump sum. Great for goals like retirement, education, or marriage."
                            : "Ideal for retirees, investors seeking regular predictable income, and those in high tax brackets who want a tax-efficient, disciplined method to withdraw funds while keeping the principal invested."}
                    </p>
                </div>
            </div>

        </div>
    );
}