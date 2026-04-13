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

    // ✅ NEW STATES
    const [showExpenseModal, setShowExpenseModal] = useState(false);
    const [expenseList, setExpenseList] = useState([
        { category: "", amount: "" }
    ]);

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
                setStep(1.5);
                return;
            }
        }
        if (step === 1.5) updated.jobType = value;
        if (step === 2) updated.city = value;
        if (step === 3) updated.income = value;
        if (step === 4) updated.expenses = value;
        if (step === 5) updated.investments = value;
        if (step === 6) updated.emergencyFund = value;
        if (step === 7) updated.insurance = value;

        setFormData(updated);

        setMessages(prev => [...prev, { role: "user", content: value }]);
        setInput("");

        if (step === 0) {
            setMessages(prev => [...prev, { role: "assistant", content: `Nice to meet you, ${value}! What's your occupation?` }]);
        }

        if (step === 1 || step === 1.5) {
            setMessages(prev => [...prev, { role: "assistant", content: "Great! Which city are you currently residing in?" }]);
            if (step === 1.5) setStep(2);
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
            setInput(val.replace(/[^a-zA-Z\s]/g, ""));
        } else {
            setInput(val.replace(/[^0-9]/g, ""));
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

                    <div className="mt-3">
                        <div className="flex justify-between text-xs text-gray-400 mb-1">
                            <span>Progress</span>
                            <span>{progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 h-2 rounded-full">
                            <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${progress}%` }} />
                        </div>
                    </div>
                </div>

                {/* Messages */}
                <div ref={chatRef} className="flex-1 overflow-y-auto p-4 space-y-2">
                    {messages.map((msg, i) => (
                        <div key={i} className={`p-2 rounded-lg text-sm ${msg.role === "user" ? "bg-blue-100 text-right" : "bg-gray-100"}`}>
                            {msg.content}
                        </div>
                    ))}
                    {error && <div className="text-red-500 text-sm">{error}</div>}
                </div>

                {/* Quick Options */}
                {quickOptions.length > 0 && (
                    <div className="px-4 pb-3 flex gap-2 flex-wrap">
                        {quickOptions.map((opt) => (
                            <button key={opt} onClick={() => handleNext(opt)} className="px-3 py-1.5 bg-gray-50 rounded-xl text-xs">
                                {opt}
                            </button>
                        ))}
                    </div>
                )}

                {step === 4 && (
                    <p className="text-[10px] text-blue-600">
                        💡 Tip: Classify your expenses → click ➕ to add categories
                    </p>
                )}

                {step === 5 && (
                    <p className="text-[10px] text-blue-600">
                        💡 Tip: Connect investment apps or input manually
                    </p>
                )}

                {/* Input Area */}
                <div className="p-3 border-t flex gap-2 items-center">

                    {step === 4 && (
                        <button
                            onClick={() => setShowExpenseModal(true)}
                            className="bg-purple-100 text-purple-600 p-2 rounded-lg text-lg font-bold"
                        >
                            ➕
                        </button>
                    )}

                    <input
                        value={input}
                        onChange={(e) => handleInputChange(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={[0, 1, 1.5, 2].includes(step) ? "Enter text..." : "Enter amount..."}
                        className="flex-1 border rounded-lg px-3 py-2 text-sm"
                    />

                    <button onClick={sendMessage} className="bg-blue-500 text-white px-4 py-2 rounded-lg">
                        Send
                    </button>
                </div>
            </div>

            {/* MODAL */}
            {showExpenseModal && (
                <div className="fixed inset-0 bg-black/30 flex items-center justify-center">
                    <div className="bg-white p-5 rounded-xl w-80">

                        <h3 className="font-semibold mb-3">Add Expenses</h3>

                        {expenseList.map((item, i) => (
                            <div key={i} className="flex gap-2 mb-2">
                                <input
                                    placeholder="Category"
                                    value={item.category}
                                    onChange={(e) => {
                                        const updated = [...expenseList];
                                        updated[i].category = e.target.value;
                                        setExpenseList(updated);
                                    }}
                                    className="w-1/2 border px-2 py-1"
                                />
                                <input
                                    placeholder="Amount"
                                    value={item.amount}
                                    onChange={(e) => {
                                        const updated = [...expenseList];
                                        updated[i].amount = e.target.value.replace(/[^0-9]/g, "");
                                        setExpenseList(updated);
                                    }}
                                    className="w-1/2 border px-2 py-1"
                                />
                            </div>
                        ))}

                        <button
                            onClick={() => setExpenseList([...expenseList, { category: "", amount: "" }])}
                            className="text-xs text-blue-600"
                        >
                            + Add More
                        </button>

                        <div className="flex justify-between mt-3">
                            <button onClick={() => setShowExpenseModal(false)}>Cancel</button>

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