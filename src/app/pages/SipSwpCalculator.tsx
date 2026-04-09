import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { getUserData } from "../store/userStore";

export function SipSwpCalculator() {
    const [mode, setMode] = useState<"sip" | "swp">("sip");

    const [amount, setAmount] = useState("");
    const [rate, setRate] = useState("");
    const [years, setYears] = useState("");

    const [result, setResult] = useState<number | null>(null);
    const [chartData, setChartData] = useState<any[]>([]);

    const userData = getUserData();
    const income = userData?.income || 0;

    const calculate = () => {
        const P = parseFloat(amount) || 0;
        const r = (parseFloat(rate) || 0) / 100 / 12;
        const n = (parseFloat(years) || 0) * 12;

        let data: any[] = [];

        if (mode === "sip") {
            let value = 0;

            for (let i = 1; i <= n; i++) {
                value = (value + P) * (1 + r);

                if (i % 12 === 0) {
                    data.push({
                        year: i / 12,
                        value: Math.round(value),
                    });
                }
            }

            setResult(value);
            setChartData(data);
        }

        if (mode === "swp") {
            let value = P;

            for (let i = 1; i <= n; i++) {
                value = value * (1 + r) - P;

                if (i % 12 === 0) {
                    data.push({
                        year: i / 12,
                        value: Math.max(0, Math.round(value)),
                    });
                }
            }

            const withdrawal = P * r / (1 - Math.pow(1 + r, -n));
            setResult(withdrawal);
            setChartData(data);
        }
    };

    const aiRecommendation = () => {
        const amt = parseFloat(amount) || 0;

        if (mode === "sip") {
            const ideal = income * 0.2;

            if (amt < ideal) {
                return `You're investing ₹${amt.toLocaleString()}, but based on your income ₹${income.toLocaleString()}, you should aim for around ₹${ideal.toLocaleString()} monthly for better wealth creation.`;
            }

            return `Great! You're investing a strong amount. Keep it consistent to build long-term wealth.`;
        }

        return `Ensure your withdrawal is sustainable. Ideally, your withdrawal should be lower than your returns to avoid running out of money.`;
    };

    const futureProjection = () => {
        if (mode !== "sip" || !amount || !rate || !years) return null;

        const P = parseFloat(amount);
        const r = parseFloat(rate) / 100 / 12;
        const n = parseFloat(years) * 12;

        const FV = P * ((Math.pow(1 + r, n) - 1) / r) * (1 + r);

        return {
            value: FV,
            years: parseFloat(years),
        };
    };

    return (
        <div className="space-y-6">

            {/* HEADER (same as savings page) */}
            <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-8 text-white shadow-xl">
                <h1 className="text-3xl font-bold">SIP / SWP Calculator</h1>
                <p className="text-lg text-emerald-50">
                    Plan your investments and withdrawals smartly
                </p>
            </div>

            {/* SELECTOR */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card
                    onClick={() => setMode("sip")}
                    className={`cursor-pointer ${mode === "sip" ? "border-2 border-emerald-500" : ""}`}
                >
                    <CardContent className="p-6">
                        <h2 className="text-lg font-bold">SIP Calculator</h2>
                        <p className="text-sm text-gray-600 mt-2">
                            Invest monthly and grow wealth over time
                        </p>
                    </CardContent>
                </Card>

                <Card
                    onClick={() => setMode("swp")}
                    className={`cursor-pointer ${mode === "swp" ? "border-2 border-emerald-500" : ""}`}
                >
                    <CardContent className="p-6">
                        <h2 className="text-lg font-bold">SWP Calculator</h2>
                        <p className="text-sm text-gray-600 mt-2">
                            Withdraw fixed income from investments
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* CALCULATOR */}
            <Card className="border-none shadow-lg bg-white/80 backdrop-blur">
                <CardHeader>
                    <CardTitle>{mode === "sip" ? "SIP Calculator" : "SWP Calculator"}</CardTitle>
                    <CardDescription>
                        {mode === "sip"
                            ? "Calculate your future wealth with monthly investments"
                            : "Calculate your monthly withdrawal"}
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">

                    <Input
                        placeholder={mode === "sip" ? "Monthly Investment (₹)" : "Total Investment (₹)"}
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                    />

                    {/* % OF INCOME */}
                    {mode === "sip" && amount && income > 0 && (
                        <p className="text-sm text-gray-600">
                            This is{" "}
                            <span className="font-semibold text-emerald-600">
                                {Math.round((parseFloat(amount) / income) * 100)}%
                            </span>{" "}
                            of your monthly income
                        </p>
                    )}

                    <Input
                        placeholder="Expected Return (%)"
                        value={rate}
                        onChange={(e) => setRate(e.target.value)}
                    />

                    <Input
                        placeholder="Time (Years)"
                        value={years}
                        onChange={(e) => setYears(e.target.value)}
                    />

                    <Button
                        onClick={calculate}
                        className="w-full bg-gradient-to-r from-emerald-500 to-teal-600"
                    >
                        Calculate
                    </Button>

                    {/* RESULT */}
                    {result && (
                        <div className="p-4 bg-green-50 rounded-lg text-center">
                            <p className="text-sm text-gray-600">
                                {mode === "sip" ? "Future Value" : "Monthly Withdrawal"}
                            </p>
                            <p className="text-3xl font-bold text-green-600">
                                ₹{Math.round(result).toLocaleString()}
                            </p>
                        </div>
                    )}

                    {/* FUTURE PROJECTION */}
                    {futureProjection() && (
                        <div className="p-4 bg-blue-50 rounded-lg text-center">
                            <p className="text-sm text-gray-600">Future Projection</p>
                            <p className="text-lg font-semibold text-blue-600">
                                You will reach ₹{Math.round(futureProjection()!.value).toLocaleString()} in{" "}
                                {futureProjection()!.years} years
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* GRAPH */}
            {chartData.length > 0 && (
                <Card className="border-none shadow-lg bg-white/80 backdrop-blur">
                    <CardHeader>
                        <CardTitle>Growth Projection</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={chartData}>
                                <XAxis dataKey="year" />
                                <YAxis />
                                <Tooltip />
                                <Line type="monotone" dataKey="value" strokeWidth={3} />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            )}

            {/* AI RECOMMENDATION */}
            {result && (
                <Card className="border-none shadow-lg bg-gradient-to-br from-emerald-50 to-teal-50">
                    <CardHeader>
                        <CardTitle>AI Recommendation</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-gray-700">{aiRecommendation()}</p>
                    </CardContent>
                </Card>
            )}

            {/* EDUCATION */}
            {/* WHAT IS SIP / SWP */}
            <Card className="border-none shadow-lg bg-white/80 backdrop-blur">
                <CardHeader>
                    <CardTitle>
                        {mode === "sip" ? "What is SIP?" : "What is SWP?"}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-gray-700">
                        {mode === "sip"
                            ? "SIP (Systematic Investment Plan) lets you invest a fixed amount every month in mutual funds. It helps you grow money steadily through compounding without needing a large upfront investment."
                            : "SWP (Systematic Withdrawal Plan) lets you withdraw a fixed amount regularly from your investments while the rest stays invested."}
                    </p>
                </CardContent>
            </Card>

            {/* WHY IS IT USEFUL */}
            <Card className="border-none shadow-lg bg-white/80 backdrop-blur">
                <CardHeader>
                    <CardTitle>
                        Why is {mode === "sip" ? "SIP" : "SWP"} useful?
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-gray-700">
                        {mode === "sip"
                            ? "It builds investment discipline, reduces the risk of timing the market, and helps create wealth over time through compounding."
                            : "It provides a steady income from your investments without withdrawing everything at once, helping your money last longer."}
                    </p>
                </CardContent>
            </Card>

            {/* WHO IS IT FOR */}
            <Card className="border-none shadow-lg bg-white/80 backdrop-blur">
                <CardHeader>
                    <CardTitle>
                        Who should use {mode === "sip" ? "SIP" : "SWP"}?
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-gray-700">
                        {mode === "sip"
                            ? "Ideal for beginners, students, and salaried individuals who want to start investing regularly with small amounts."
                            : "Ideal for retirees or individuals who want a regular monthly income from their investments."}
                    </p>
                </CardContent>
            </Card>

        </div>
    );
}