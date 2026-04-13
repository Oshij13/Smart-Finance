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

    // ❌ removed upload mode
    // const [mode, setMode] = useState<"manual" | "upload" | null>(null);

    // ✅ NEW: expense modal state
    const [showExpenseModal, setShowExpenseModal] = useState(false);
    const [expenseList, setExpenseList] = useState([
        { category: "", amount: "" }
    ]);

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
            setInput(val.replace(/[^a-zA-Z\s]/g, ""));
        } else {
            setInput(val.replace(/[^0-9]/g, ""));
        }
    };

    const handleNext = () => {
        const key = questions[step].key;

        if (!input && key !== "insurance") {
            return;
        }

        const updatedData = {
            ...formData,
            [key]: input || 0
        };

        setFormData(updatedData);
        setInput("");

        if (questions[step].key === "insurance") {
            const finalData = {
                ...updatedData,
                insurance: updatedData.insurance || 0
            };

            setUserData(finalData);
            navigate("/first-action");
        } else {
            setStep((prev) => prev + 1);
        }
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

                {/* ✅ UPDATED EXPENSES SECTION */}
                {questions[step].key === "expenses" && (
                    <div className="mb-4 space-y-3">

                        <p className="text-sm text-gray-500">
                            Classify your expenses for better accuracy
                        </p>

                        {/* ➕ BUTTON */}
                        <button
                            onClick={() => setShowExpenseModal(true)}
                            className="w-full px-3 py-2 bg-purple-50 text-purple-600 rounded-xl font-medium border border-purple-100 hover:bg-purple-100 transition-all"
                        >
                            ➕ Add Expense Categories
                        </button>

                        {/* MANUAL INPUT OPTION (kept same flow) */}
                        <input
                            value={input}
                            onChange={(e) => handleInputChange(e.target.value)}
                            placeholder="Or enter total expenses manually"
                            className="w-full border px-3 py-2 rounded-xl focus:ring-2 focus:ring-purple-500/50 outline-none text-black"
                            inputMode="numeric"
                        />
                    </div>
                )}

                {/* Investment Apps UI */}
                {questions[step].key === "investments" && (
                    <div className="flex gap-2 mb-3">
                        <button className="px-3 py-1 bg-blue-100 rounded">Zerodha</button>
                        <button className="px-3 py-1 bg-purple-100 rounded">INDmoney</button>
                        <button className="px-3 py-1 bg-green-100 rounded">Groww</button>
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
                    className="w-full bg-blue-600 text-white py-2 rounded"
                >
                    Next
                </button>

                <div className="mt-4 text-xs text-gray-500 text-center">
                    Step {step + 1} of {questions.length}
                </div>
            </div>

            {/* ✅ EXPENSE MODAL */}
            {showExpenseModal && (
                <div className="fixed inset-0 bg-black/30 flex items-center justify-center">
                    <div className="bg-white p-5 rounded-xl w-80 shadow-lg text-black">
                        <h3 className="font-semibold mb-3">Classify Your Expenses</h3>

                        {expenseList.map((item, index) => (
                            <div key={index} className="flex gap-2 mb-2">
                                <input
                                    placeholder="Category"
                                    value={item.category}
                                    onChange={(e) => {
                                        const updated = [...expenseList];
                                        updated[index].category = e.target.value;
                                        setExpenseList(updated);
                                    }}
                                    className="w-1/2 border px-2 py-1 rounded"
                                />
                                <input
                                    placeholder="Amount"
                                    value={item.amount}
                                    onChange={(e) => {
                                        const updated = [...expenseList];
                                        updated[index].amount = e.target.value.replace(/[^0-9]/g, "");
                                        setExpenseList(updated);
                                    }}
                                    className="w-1/2 border px-2 py-1 rounded"
                                />
                            </div>
                        ))}

                        <button
                            onClick={() => setExpenseList([...expenseList, { category: "", amount: "" }])}
                            className="text-xs text-blue-600 mb-3"
                        >
                            + Add More
                        </button>

                        <div className="flex justify-between">
                            <button
                                onClick={() => setShowExpenseModal(false)}
                                className="text-sm text-gray-500"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={() => {
                                    const total = expenseList.reduce(
                                        (sum, item) => sum + Number(item.amount || 0),
                                        0
                                    );

                                    setInput(total.toString());
                                    setShowExpenseModal(false);
                                }}
                                className="bg-blue-500 text-white px-3 py-1 rounded"
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}