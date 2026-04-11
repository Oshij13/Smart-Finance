import { useState, useEffect } from "react";
import { setUserData } from "../store/userStore";
import { useNavigate } from "react-router";

export default function Onboarding() {
    const navigate = useNavigate();

    const questions = [
        { key: "name", question: "What's your name?" },
        { key: "occupation", question: "What do you do?" },
        { key: "city", question: "Which city are you currently residing in?" },
        { key: "income", question: "What's your monthly income?" },
        { key: "expenses", question: "What are your average monthly expenses?" },
        { key: "investments", question: "How much have you invested?" },
        { key: "emergencyFund", question: "What's your current emergency fund balance?" },
        { key: "insurance", question: "What's your total insurance coverage?" }
    ];

    const [step, setStep] = useState(0);
    const [input, setInput] = useState("");
    const [mode, setMode] = useState<"manual" | "upload" | null>(null);

    const [formData, setFormData] = useState<any>({
        name: "",
        occupation: "",
        city: "",
        income: "",
        expenses: "",
        investments: "",
        emergencyFund: "",
        insurance: 0
    });

    const handleInputChange = (val: string) => {
        const key = questions[step].key;
        if (["name", "occupation", "city"].includes(key)) {
            // Restrict to alphabets and spaces
            setInput(val.replace(/[^a-zA-Z\s]/g, ""));
        } else {
            // Restrict to numeric only
            setInput(val.replace(/[^0-9]/g, ""));
        }
    };

    const handleNext = () => {
        const key = questions[step].key;

        // ❗ prevent empty input
        if (!input && key !== "insurance") {
            return;
        }

        const updatedData = {
            ...formData,
            [key]: input || 0 // allow 0 for insurance
        };

        setFormData(updatedData);
        setInput("");

        if (step < questions.length - 1) {
            setStep(step + 1);
            setMode(null);
        } else {
            setUserData(updatedData);
            navigate("/first-action");
        }
    };

    // 📂 CSV Upload (Savings)
    const handleFileUpload = (e: any) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();

        reader.onload = (event: any) => {
            const text = event.target.result;
            const rows = text.split("\n");

            let credit = 0;
            let debit = 0;

            rows.forEach((row: string) => {
                const cols = row.split(",");
                credit += parseFloat(cols[2]) || 0;
                debit += parseFloat(cols[3]) || 0;
            });

            const expenses = debit; // In our simplified CSV parsing, debit is the expense total

            setFormData((prev: any) => ({
                ...prev,
                expenses: expenses.toFixed(0)
            }));
            setInput(expenses.toFixed(0)); // Also update input so Next button works
        };

    reader.readAsText(file);
    };

    useEffect(() => {
        if (questions[step].key === "insurance") {
            setInput("");
        }
    }, [step]);

    return (
        <div className="h-screen flex flex-col justify-center items-center bg-gradient-to-br from-blue-500 to-purple-600 text-white px-6">

            <div className="bg-white text-black p-6 rounded-2xl w-full max-w-md shadow-lg">

                <h2 className="text-lg font-semibold mb-4">
                    {questions[step].question}
                </h2>

                {/* 👉 SUGGESTION */}
                {questions[step].key === "insurance" && formData.income && (
                    <p className="text-xs text-blue-500 mb-3">
                        Suggested: ₹{(Number(formData.income) * 12).toLocaleString("en-IN")}
                    </p>
                )}

                {questions[step].key !== "expenses" && (
                    <input
                        value={input}
                        onChange={(e) => handleInputChange(e.target.value)}
                        className="w-full border px-3 py-2 rounded mb-3 focus:ring-2 focus:ring-purple-500/50 outline-none text-black"
                        placeholder={
                            questions[step].key === "insurance"
                                ? "e.g. 500000"
                                : "Type here..."
                        }
                        inputMode={["name", "occupation", "city"].includes(questions[step].key) ? "text" : "numeric"}
                    />
                )}

                {/* EXPENSES OPTION SELECTOR (previously for savings) */}
                {questions[step].key === "expenses" && (
                    <div className="mb-4">
                        {!mode ? (
                            <div className="mt-3 space-y-3 text-black">
                                <p className="text-sm text-gray-500">
                                    Choose how you want to proceed:
                                </p>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setMode("manual")}
                                        className="flex-1 px-3 py-2 bg-blue-50 text-blue-600 rounded-xl font-medium border border-blue-100 hover:bg-blue-100 transition-all focus:ring-2 focus:ring-purple-500/50 outline-none"
                                    >
                                        ✍️ Enter Manually
                                    </button>
                                    <button
                                        onClick={() => setMode("upload")}
                                        className="flex-1 px-3 py-2 bg-purple-50 text-purple-600 rounded-xl font-medium border border-purple-100 hover:bg-purple-100 transition-all focus:ring-2 focus:ring-purple-500/50 outline-none"
                                    >
                                        📂 Upload Statement
                                    </button>
                                </div>
                            </div>
                        ) : mode === "manual" ? (
                            <div className="space-y-2">
                                <button onClick={() => setMode(null)} className="text-xs text-gray-400 hover:text-gray-600 transition">← Back to options</button>
                                <input
                                    value={input}
                                    onChange={(e) => handleInputChange(e.target.value)}
                                    placeholder="Enter your expenses"
                                    className="w-full border px-3 py-2 rounded-xl focus:ring-2 focus:ring-purple-500/50 outline-none text-black"
                                    inputMode="numeric"
                                />
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <button onClick={() => setMode(null)} className="text-xs text-gray-400 hover:text-gray-600 transition">← Back to options</button>
                                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                                    <p className="text-xs text-blue-700 font-medium mb-2">📂 Upload bank statement (CSV)</p>
                                    <input
                                        type="file"
                                        accept=".csv"
                                        onChange={handleFileUpload}
                                        className="text-xs w-full mb-1"
                                    />
                                    <p className="text-[10px] text-blue-500">CSV format recommended for accuracy</p>
                                </div>

                                {formData.expenses && input === formData.expenses && (
                                    <p className="text-green-600 text-xs font-medium flex items-center gap-1 animate-pulse">
                                        ✅ Expenses calculated automatically: ₹{formData.expenses}
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* Investment Apps UI */}
                {questions[step].key === "investments" && (
                    <div className="flex gap-2 mb-3">
                        <button className="px-3 py-1 bg-blue-100 rounded focus:ring-2 focus:ring-purple-500/50 outline-none">Zerodha</button>
                        <button className="px-3 py-1 bg-purple-100 rounded focus:ring-2 focus:ring-purple-500/50 outline-none">INDmoney</button>
                        <button className="px-3 py-1 bg-green-100 rounded focus:ring-2 focus:ring-purple-500/50 outline-none">Groww</button>
                    </div>
                )}

                {/* Insurance Hint */}
                {questions[step].key === "insurance" && (
                    <p className="text-xs text-gray-500 mb-3">
                        Include life + health insurance coverage (recommended: 10–12× your annual income)
                    </p>
                )}

                <button
                    onClick={handleNext}
                    className="w-full bg-blue-600 text-white py-2 rounded focus:ring-2 focus:ring-purple-500/50 outline-none"
                >
                    Next
                </button>

                {/* Progress */}
                <div className="mt-4 text-xs text-gray-500 text-center">
                    Step {step + 1} of {questions.length}
                </div>

            </div>
        </div>
    );
}