import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";

export function SipSwpCalculator() {
    const [mode, setMode] = useState<"sip" | "swp" | null>(null);

    const [amount, setAmount] = useState("");
    const [rate, setRate] = useState("");
    const [years, setYears] = useState("");

    const [result, setResult] = useState<number | null>(null);

    const calculate = () => {
        const P = parseFloat(amount) || 0;
        const r = (parseFloat(rate) || 0) / 100 / 12;
        const n = (parseFloat(years) || 0) * 12;

        if (mode === "sip") {
            const futureValue =
                P * ((Math.pow(1 + r, n) - 1) / r) * (1 + r);
            setResult(futureValue);
        }

        if (mode === "swp") {
            const withdrawal =
                P * r / (1 - Math.pow(1 + r, -n));
            setResult(withdrawal);
        }
    };

    return (
        <div className="space-y-6">

            {/* HEADER */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 rounded-2xl text-white">
                <h1 className="text-2xl font-bold">SIP / SWP Calculator</h1>
                <p className="text-sm mt-1">
                    Plan your investments and withdrawals smartly
                </p>
            </div>

            {/* STEP 1 */}
            {!mode && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card onClick={() => setMode("sip")} className="cursor-pointer hover:shadow-lg">
                        <CardContent className="p-6">
                            <h2 className="text-lg font-bold">SIP Calculator</h2>
                            <p className="text-sm text-gray-600 mt-2">
                                Invest monthly and grow wealth over time
                            </p>
                        </CardContent>
                    </Card>

                    <Card onClick={() => setMode("swp")} className="cursor-pointer hover:shadow-lg">
                        <CardContent className="p-6">
                            <h2 className="text-lg font-bold">SWP Calculator</h2>
                            <p className="text-sm text-gray-600 mt-2">
                                Withdraw fixed income from investments
                            </p>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* STEP 2 */}
            {mode && (
                <Card className="p-6 space-y-4">
                    <CardHeader>
                        <CardTitle>
                            {mode === "sip" ? "SIP Calculator" : "SWP Calculator"}
                        </CardTitle>
                    </CardHeader>

                    <CardContent className="space-y-4">

                        <Input
                            placeholder={mode === "sip" ? "Monthly Investment (₹)" : "Total Investment (₹)"}
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                        />

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

                        <Button onClick={calculate} className="w-full">
                            Calculate
                        </Button>

                        {result && (
                            <div className="p-4 bg-green-50 rounded-lg text-center">
                                <p className="text-sm text-gray-600">
                                    {mode === "sip" ? "Future Value" : "Monthly Withdrawal"}
                                </p>
                                <p className="text-2xl font-bold text-green-600">
                                    ₹{result.toLocaleString()}
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* STEP 3 - EDUCATION */}
            {mode && (
                <Card className="p-6 bg-blue-50">
                    <h3 className="font-bold mb-2">
                        {mode === "sip" ? "What is SIP?" : "What is SWP?"}
                    </h3>

                    <p className="text-sm text-gray-700">
                        {mode === "sip"
                            ? "SIP (Systematic Investment Plan) allows you to invest a fixed amount regularly in mutual funds. It helps in disciplined investing and benefits from compounding."
                            : "SWP (Systematic Withdrawal Plan) allows you to withdraw a fixed amount regularly from your investments. Ideal for generating passive income."}
                    </p>

                    <h4 className="font-semibold mt-4">
                        Who should use this?
                    </h4>

                    <p className="text-sm text-gray-700">
                        {mode === "sip"
                            ? "Students, beginners, and long-term investors."
                            : "Retirees or anyone looking for steady income."}
                    </p>
                </Card>
            )}
        </div>
    );
}