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
        { key: "investments", question: "How much do you invest monthly?" },
        { key: "emergencyFund", question: "What's your current emergency fund balance?" },
        { key: "insurance", question: "What's your total insurance coverage?" }
    ];

    const [step, setStep] = useState(0);
    const [input, setInput] = useState("");

    // ✅ NEW STATES
    const [showExpenseModal, setShowExpenseModal] = useState(false);
    const [expenses, setExpenses] = useState([
        { category: "", amount: "" }
    ]);

    const EXPENSE_CATEGORIES = [
        "Housing",
        "Food",
        "Transportation",
        "Utilities",
        "Healthcare",
        "Insurance",
        "Debt Payments",
        "Personal Care",
        "Entertainment",
        "Education",
        "Investments",
        "Other"
    ];

    const handleChange = (index: number, field: string, value: string) => {
        const updated = [...expenses];
        (updated[index] as any)[field] = value;
        setExpenses(updated);
    };

    const [formData, setFormData] = useState<any>({
        name: "",
        occupation: "",
        city: "",
        income: "",
        expenses: "",
        expenseBreakdown: [], // ✅ ADD THIS 
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

        if (!input && key !== "insurance") return;

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

                {/* Insurance Suggestion */}
                {questions[step].key === "insurance" && formData.income && (
                    <p className="text-xs text-blue-500 mb-3">
                        Suggested: ₹{(Number(formData.income) * 12).toLocaleString("en-IN")}
                    </p>
                )}

                {/* NORMAL INPUT */}
                {questions[step].key !== "expenses" && (
                    <input
                        value={input}
                        onChange={(e) => handleInputChange(e.target.value)}
                        className="w-full border px-3 py-2 rounded mb-3"
                        placeholder={
                            questions[step].key === "insurance"
                                ? "e.g. 500000"
                                : "Type here..."
                        }
                    />
                )}

                {/* ✅ EXPENSES SECTION */}
                {questions[step].key === "expenses" && (
                    <div className="space-y-3">

                        <p className="text-sm text-gray-500">
                            Classify your expenses for better accuracy
                        </p>

                        {/* ➕ BUTTON */}
                        <button
                            onClick={() => setShowExpenseModal(true)}
                            className="w-full px-3 py-2 bg-purple-50 text-purple-600 rounded-xl border"
                        >
                            ➕ Add Expense Categories
                        </button>

                        {/* MANUAL INPUT */}
                        <input
                            value={input}
                            onChange={(e) => handleInputChange(e.target.value)}
                            placeholder="Or enter total manually"
                            className="w-full border px-3 py-2 rounded"
                        />
                    </div>
                )}

                {/* Investment Apps */}
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
                        Include life + health insurance coverage
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

            {/* ✅ MODAL */}
            {showExpenseModal && (
                <div className="fixed inset-0 bg-black/30 flex items-center justify-center">
                    <div className="bg-white p-5 rounded-xl w-80 text-black">

                        <h3 className="font-semibold mb-3">Add Expenses</h3>

                        <div className="max-h-[350px] overflow-y-auto pr-1 -mr-1 custom-scrollbar">
                            {expenses.map((exp, index) => (
                                <div key={index} className="flex gap-2 mb-4 flex-col border-b border-gray-100 pb-3 last:border-0">
                                    <select
                                        value={exp.category}
                                        onChange={(e) => handleChange(index, "category", e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm"
                                    >
                                        <option value="">Select Category</option>
                                        {EXPENSE_CATEGORIES.map(cat => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                    <input
                                        placeholder="Amount"
                                        value={exp.amount}
                                        onChange={(e) => handleChange(index, "amount", e.target.value.replace(/[^0-9]/g, ""))}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                    />
                                </div>
                            ))}
                        </div>

                        <button
                            onClick={() => setExpenses([...expenses, { category: "", amount: "" }])}
                            className="text-xs text-blue-600"
                        >
                            + Add More
                        </button>

                        <div className="flex justify-between mt-3">
                            <button onClick={() => setShowExpenseModal(false)}>
                                Cancel
                            </button>

                            <button
                                onClick={() => {
                                    // Prevent empty categories explicitly
                                    const hasMissingValues = expenses.some(exp => !exp.category || !exp.amount);
                                    if (hasMissingValues) {
                                        return alert("Please select a category and enter an amount for all inputs.");
                                    }

                                    const total = expenses.reduce(
                                        (sum, exp) => sum + Number(exp.amount || 0),
                                        0
                                    );

                                    // ✅ store breakdown in formData
                                    setFormData((prev: any) => ({
                                        ...prev,
                                        expenseBreakdown: expenses.map(exp => ({
                                            category: exp.category,
                                            amount: Number(exp.amount)
                                        }))
                                    }));

                                    setInput(total.toString());
                                    setShowExpenseModal(false);
                                    // ✅ reset modal (IMPORTANT)
                                    setExpenses([{ category: "", amount: "" }]);
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