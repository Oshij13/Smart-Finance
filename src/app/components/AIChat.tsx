import { useState, useEffect, useRef } from "react";
import { setUserData } from "../store/userStore";

export default function AIChat({ onComplete }: { onComplete: (data: any) => void }) {
    const [messages, setMessages] = useState<any[]>([]);
    const [input, setInput] = useState("");
    const [step, setStep] = useState(0);
    const [error, setError] = useState("");

    const totalSteps = 8;
    const progress = Math.round((step / totalSteps) * 100);

    const [formData, setFormData] = useState<any>({
        name: "",
        occupation: "",
        city: "",
        income: "",
        expenses: "",
        investments: "",
        emergencyFund: "",
        jobType: "",
        insurance: "",
    });

    const chatRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (messages.length === 0) {
            setMessages([
                { role: "assistant", content: "Let's set up your financial profile. What's your name?" }
            ]);
        }
    }, []);

    useEffect(() => {
        chatRef.current?.scrollTo({
            top: chatRef.current.scrollHeight,
            behavior: "smooth"
        });
    }, [messages]);

    const validate = (value: string) => {
        if (step === 0 && !value.trim()) return "Name required";
        if (step === 1 && !value.trim()) return "Occupation required";
        if (step === 2 && !value.trim()) return "City required";

        // Income, Expenses, Investments, Emergency Fund, Insurance should be numbers
        if ([3, 4, 5, 6, 7].includes(step) && isNaN(Number(value))) {
            return "Only numbers allowed";
        }

        return "";
    };

    const handleNext = (value: string) => {
        const err = validate(value);
        if (err) return setError(err);

        setError("");

        const updated = { ...formData };

        if (step === 0) updated.name = value;
        if (step === 1) {
            updated.occupation = value;
            if (value === "Salaried") {
                setMessages(prev => [...prev, { role: "assistant", content: "Are you in a Private or Government job?" }]);
                setFormData(updated);
                setStep(1.5); // Sub-step for job type
                return;
            }
        }
        if (step === 1.5) {
            updated.jobType = value;
        }
        if (step === 2) updated.city = value;
        if (step === 3) updated.income = value;
        if (step === 4) updated.expenses = value;
        if (step === 5) updated.investments = value;
        if (step === 6) updated.emergencyFund = value;
        if (step === 7) updated.insurance = value;


        setFormData(updated);

        // Only add user message if it's not already handled (e.g., by ➕ or 📂 buttons)
        if (value && !messages.some(m => m.role === "user" && m.content.includes(value))) {
            setMessages(prev => [...prev, { role: "user", content: value }]);
        }
        setInput("");

        if (step === 0) {
            setMessages(prev => [...prev, { role: "assistant", content: `Nice to meet you, ${value}! What's your occupation?` }]);
        }

        if (step === 1 || step === 1.5) {
            setMessages(prev => [...prev, { role: "assistant", content: "Great! Which city are you currently residing in?" }]);
            if (step === 1.5) setStep(2); // Jump back to main flow
        }

        if (step === 2) {
            setMessages(prev => [...prev, { role: "assistant", content: "Got it. What's your monthly income?" }]);
        }

        if (step === 3) {
            setMessages(prev => [...prev, { role: "assistant", content: `Nice. What are your average monthly expenses? (Income set to ₹${Number(value).toLocaleString('en-IN')})` }]);
        }

        if (step === 4) {
            setMessages(prev => [...prev, { role: "assistant", content: `Good. How much do you invest monthly? (Expenses set to ₹${Number(value).toLocaleString('en-IN')})` }]);
        }

        if (step === 5) {
            setMessages(prev => [...prev, { role: "assistant", content: `Good progress. What's your current emergency fund balance? (Investments set to ₹${Number(value).toLocaleString('en-IN')})` }]);
        }

        if (step === 6) {
            setMessages(prev => [
                ...prev,
                {
                    role: "assistant",
                    content: `Final step. What's your total insurance coverage? (Recommended: ₹${Number(formData.income * 12).toLocaleString('en-IN')})`
                }
            ]);
        }

        if (step === 7) {
            finish(updated);
            return;
        }

        if (step !== 1.5) setStep(prev => prev + 1);
    };

    const finish = (data: any) => {
        setUserData(data);

        setMessages(prev => [
            ...prev,
            { role: "assistant", content: "You're all set. Redirecting to dashboard..." }
        ]);

        setTimeout(() => {
            onComplete(data);
        }, 800);
    };


    const sendMessage = () => {
        if (!input.trim()) return;
        handleNext(input);
    };

    const handleKeyDown = (e: any) => {
        if (e.key === "Enter") sendMessage();
    };

    const handleInputChange = (val: string) => {
        if ([0, 1, 1.5, 2].includes(step)) {
            // ✅ Strictly alphabets and spaces
            setInput(val.replace(/[^a-zA-Z\s]/g, ""));
        } else if ([3, 4, 5, 6, 7].includes(step)) {
            // ✅ Strictly numbers only
            setInput(val.replace(/[^0-9]/g, ""));
        } else {
            setInput(val);
        }
    };

    const quickOptions =
        step === 1
            ? ["Student", "Salaried", "Freelancer"]
            : step === 1.5
                ? ["Private", "Government"]
                : step === 5
                    ? ["Zerodha", "INDmoney", "Groww"]
                    : [];

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/20">

            <div className="w-96 h-[500px] bg-white shadow-xl rounded-2xl flex flex-col">

                {/* Header */}
                <div className="p-4 border-b">
                    <h2 className="font-semibold">Welcome, Onboarding</h2>
                    <p className="text-sm text-gray-500">Let's build your financial profile</p>

                    {/* Progress */}
                    <div className="mt-3">
                        <div className="flex justify-between text-xs text-gray-400 mb-1">
                            <span>Progress</span>
                            <span>{progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 h-2 rounded-full">
                            <div
                                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    </div>
                </div>

                {/* Messages */}
                <div ref={chatRef} className="flex-1 overflow-y-auto p-4 space-y-2">
                    {messages.map((msg, i) => (
                        <div
                            key={i}
                            className={`p-2 rounded-lg text-sm ${msg.role === "user"
                                ? "bg-blue-100 text-right"
                                : "bg-gray-100"
                                }`}
                        >
                            {msg.content}
                        </div>
                    ))}
                    {error && <div className="text-red-500 text-sm">{error}</div>}
                </div>

                {/* QUICK BUTTONS */}
                {quickOptions.length > 0 && (
                    <div className="px-4 pb-3 flex gap-2 flex-wrap">
                        {quickOptions.map((opt) => (
                            <button
                                key={opt}
                                onClick={() => {
                                    if (step === 5) {
                                        // 🔮 Showcase connectivity simulation
                                        setMessages(prev => [...prev, { role: "assistant", content: `Connecting to ${opt}...` }]);
                                        setTimeout(() => {
                                            const mockValue = "250000";
                                            setMessages(prev => [...prev, { role: "user", content: `Connected via ${opt} (Auto-filled ₹${mockValue})` }]);
                                            handleNext(mockValue);
                                        }, 1200);
                                    } else {
                                        handleNext(opt);
                                    }
                                }}
                                className="px-3 py-1.5 bg-gray-50 text-gray-700 border border-gray-200 rounded-xl text-xs font-medium hover:bg-gray-100 hover:border-gray-300 transition-all focus:ring-2 focus:ring-purple-500/50 outline-none"
                            >
                                {opt === "Zerodha" ? "🔵 " : opt === "INDmoney" ? "🟢 " : opt === "Groww" ? "💹 " : ""}
                                {opt}
                            </button>
                        ))}
                    </div>
                )}

                {/* HELP TEXT & PRIVACY NOTE */}
                <div className="px-4 py-1 flex flex-col gap-0.5">
                    {(step === 4 || step === 5) && (
                        <p className="text-[10px] text-blue-600 font-medium animate-pulse leading-tight">
                            {step === 4
                                ? "💡 Tip: Classify your expenses → click ➕ to add categories"
                                : "💡 Tip: Connect investment apps or input manually"}
                        </p>
                    )}
                    <p className="text-[9px] text-gray-400 italic leading-tight">
                        🔒 We ask for connectivity or categorized data solely for calculation purposes.
                    </p>
                </div>

                {/* Input */}
                <div className="p-3 border-t flex flex-col gap-2">
                    {/* SHOW CATEGORIZED EXPENSES BUTTON ONLY FOR STEP 4 */}
                    {step === 4 && (
                        <button
                            onClick={() => {
                                const categories = [
                                    { name: "Rent", value: 15000 },
                                    { name: "Groceries", value: 5000 },
                                    { name: "Dining", value: 2000 },
                                    { name: "Subscriptions", value: 500 }
                                ];

                                const total = categories.reduce((sum, c) => sum + c.value, 0);

                                setMessages(prev => [
                                    ...prev,
                                    { role: "assistant", content: "Added categorized expenses:" },
                                    ...categories.map(c => ({
                                        role: "assistant",
                                        content: `${c.name}: ₹${c.value}`
                                    })),
                                    { role: "user", content: `Total Expenses: ₹${total}` }
                                ]);

                                handleNext(total.toString());
                            }}
                            className="w-full bg-purple-100 text-purple-600 py-2 rounded-lg hover:bg-purple-200 transition-colors text-sm font-semibold flex items-center justify-center gap-2"
                            title="Add Expenses"
                        >
                            <span>➕ Add Pre-filled Categories</span>
                        </button>
                    )}

                    <div className="flex gap-2 items-center">
                        <input
                            value={input}
                            onChange={(e) => handleInputChange(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder={
                                [0, 1, 1.5, 2].includes(step)
                                    ? "Enter text only..."
                                    : "Enter amount..."
                            }
                            className="flex-1 border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500/50 outline-none text-black"
                        />
                        <button
                            onClick={sendMessage}
                            className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors"
                        >
                            Send
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}