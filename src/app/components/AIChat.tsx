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
        income: "",
        expenses: "",
        savings: "",
        investments: "",
        occupation: "",
        jobType: ""
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

        if ([1, 2, 3, 4].includes(step) && isNaN(Number(value))) {
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
        if (step === 1) updated.income = value;
        if (step === 2) updated.expenses = value;
        if (step === 3) updated.savings = value;
        if (step === 4) updated.investments = value;
        if (step === 5) updated.occupation = value;
        if (step === 6) updated.jobType = value;

        setFormData(updated);

        setMessages(prev => [...prev, { role: "user", content: value }]);
        setInput("");

        if (step === 0) {
            setMessages(prev => [...prev, { role: "assistant", content: `Nice to meet you, ${value}! What's your monthly income?` }]);
        }

        if (step === 1) {
            setMessages(prev => [...prev, { role: "assistant", content: "Got it 👍 What are your monthly expenses?" }]);
        }

        if (step === 2) {
            setMessages(prev => [...prev, { role: "assistant", content: "Nice. How much savings do you currently have?" }]);
        }

        if (step === 3) {
            setMessages(prev => [...prev, { role: "assistant", content: "Great. How much have you invested?" }]);
        }

        if (step === 4) {
            setMessages(prev => [...prev, { role: "assistant", content: "Great. What's your occupation?" }]);
        }

        if (step === 5) {
            if (value === "Salaried") {
                setMessages(prev => [...prev, { role: "assistant", content: "Are you in Private or Government job?" }]);
                setStep(6);
                return;
            } else {
                finish(updated);
                return;
            }
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
        step === 5
            ? ["Student", "Salaried", "Freelancer"]
            : step === 6
                ? ["Private", "Government"]
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