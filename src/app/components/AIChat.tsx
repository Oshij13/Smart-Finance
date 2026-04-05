import { useState, useEffect, useRef } from "react";
import { setUserData } from "../store/userStore";

export default function AIChat({ onComplete }: { onComplete: (data: any) => void }) {
    const [messages, setMessages] = useState<any[]>([]);
    const [input, setInput] = useState("");
    const [step, setStep] = useState(0);
    const [error, setError] = useState("");

    const totalSteps = 7;
    const progress = Math.round((step / totalSteps) * 100);

    const [formData, setFormData] = useState<any>({
        name: "",
        occupation: "",
        city: "",
        income: "",
        expenses: "",
        investments: "",
        emergencyFund: ""
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

        // Income, Expenses, Investments, Emergency Fund should be numbers
        if ([3, 4, 5, 6].includes(step) && isNaN(Number(value))) {
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
        if (step === 1) updated.occupation = value;
        if (step === 2) updated.city = value;
        if (step === 3) updated.income = value;
        if (step === 4) updated.expenses = value;
        if (step === 5) updated.investments = value;
        if (step === 6) updated.emergencyFund = value;

        setFormData(updated);

        setMessages(prev => [...prev, { role: "user", content: value }]);
        setInput("");

        if (step === 0) {
            setMessages(prev => [...prev, { role: "assistant", content: `Nice to meet you, ${value}! What's your occupation?` }]);
        }

        if (step === 1) {
            setMessages(prev => [...prev, { role: "assistant", content: "Great! Which city are you currently residing in?" }]);
        }

        if (step === 2) {
            setMessages(prev => [...prev, { role: "assistant", content: "Got it. What's your monthly income?" }]);
        }

        if (step === 3) {
            setMessages(prev => [...prev, { role: "assistant", content: "Nice. What are your average monthly expenses?" }]);
        }

        if (step === 4) {
            setMessages(prev => [...prev, { role: "assistant", content: "Good. How much have you invested in total?" }]);
        }

        if (step === 5) {
            setMessages(prev => [...prev, { role: "assistant", content: "Final question: What's your current emergency fund balance?" }]);
        }

        if (step === 6) {
            finish(updated);
            return;
        }

        setStep(prev => prev + 1);
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

    const quickOptions =
        step === 1
            ? ["Student", "Salaried", "Freelancer"]
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
                    <div className="p-3 flex gap-2 flex-wrap">
                        {quickOptions.map((opt) => (
                            <button
                                key={opt}
                                onClick={() => handleNext(opt)}
                                className="px-3 py-1 bg-gray-100 rounded-lg text-sm hover:bg-gray-200"
                            >
                                {opt}
                            </button>
                        ))}
                    </div>
                )}

                {/* Input */}
                <div className="p-3 border-t flex gap-2">
                    <input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Type your answer..."
                        className="flex-1 border rounded-lg px-3 py-2 text-sm"
                    />
                    <button
                        onClick={sendMessage}
                        className="bg-blue-500 text-white px-3 rounded-lg"
                    >
                        Send
                    </button>
                </div>
            </div>
        </div>
    );
}