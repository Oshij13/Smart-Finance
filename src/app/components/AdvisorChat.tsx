import { useEffect, useState, useRef } from "react";
import html2canvas from "html2canvas";
import { useLocation } from "react-router";
import { getUserData } from "../store/userStore";
import { generateFinancePDF } from "../../utils/generatePDF";
import SmartChart from "./SmartChart";

export default function AdvisorChat() {
    const [messages, setMessages] = useState<any[]>(() => {
        if (typeof window !== "undefined") {
            const saved = localStorage.getItem("advisorChat");
            return saved ? JSON.parse(saved) : [];
        }
        return [];
    });
    const [loading, setLoading] = useState(false);
    const [input, setInput] = useState("");
    const [sessionId, setSessionId] = useState<string>("");
    const [isCustomMode, setIsCustomMode] = useState(false);
    const [actionLoading, setActionLoading] = useState<number | null>(null);
    const [actionSuccess, setActionSuccess] = useState<number | null>(null);
    const [resetBackend, setResetBackend] = useState(false);
    const [feedbackGiven, setFeedbackGiven] = useState<{ [key: number]: boolean }>({});
    const [responseTime, setResponseTime] = useState(0);
    const [timerActive, setTimerActive] = useState(false);
    const [showInsuranceWarning, setShowInsuranceWarning] = useState(true);

    const bottomRef = useRef<HTMLDivElement | null>(null);
    const chartRef = useRef<any>(null);
    const location = useLocation();

    const quickOptions = [
        "📘 Personal Finance",
        "💰 Savings Advice",
        "📈 Investment Options",
        "🎯 Financial Planning",
        "🧾 Tax Help",
        "✂️ Reduce Spending",
        "🏖️ Retirement Planning",
        "❓ Others",
    ];

    // 🔄 SESSION initialization
    useEffect(() => {
        let existingSession = sessionStorage.getItem("sessionId");

        if (!existingSession) {
            existingSession = crypto.randomUUID();
            sessionStorage.setItem("sessionId", existingSession);
        }

        setSessionId(existingSession);

        // 🚨 KEY FIX: detect reload
        const navEntries = performance.getEntriesByType("navigation");
        const isReload = navEntries.length > 0 && (navEntries[0] as PerformanceNavigationTiming).type === "reload";

        if (isReload) {
            localStorage.removeItem("advisorChat");
            setResetBackend(true);
        }

        const saved = localStorage.getItem("advisorChat");

        if (!saved || JSON.parse(saved).length === 0) {
            setMessages([
                {
                    role: "assistant",
                    content:
                        "👋 Hi! I'm your Smart Finance AI.\n\nPick a topic below — I’ll guide you and help you take action.",
                    options: quickOptions,
                },
            ]);
        } else {
            setMessages(JSON.parse(saved));
        }
    }, []);

    useEffect(() => {
        localStorage.setItem("advisorChat", JSON.stringify(messages));
    }, [messages]);

    // Timer Logic
    useEffect(() => {
        let interval: any;

        if (timerActive) {
            const start = Date.now();

            interval = setInterval(() => {
                const elapsed = (Date.now() - start) / 1000;
                setResponseTime(elapsed);
            }, 100);
        }

        return () => clearInterval(interval);
    }, [timerActive]);


    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, loading]);

    useEffect(() => {
        if (location.state?.query) {
            sendMessage(location.state.query);
        }
    }, [location.state]);

    // 📊 CAPTURE CHARTS & DOWNLOAD PDF
    const handleDownloadPDF = async () => {
        const chartImages: { [key: number]: string } = {};

        // Find all chart containers
        const chartElements = document.querySelectorAll("[data-chart-id]");

        for (const el of Array.from(chartElements)) {
            const id = parseInt(el.getAttribute("data-chart-id") || "0");
            try {
                const canvas = await html2canvas(el as HTMLElement, {
                    scale: 2, // Higher quality
                    logging: false,
                    useCORS: true
                });
                chartImages[id] = canvas.toDataURL("image/png");
            } catch (err) {
                console.error("Failed to capture chart:", err);
            }
        }

        generateFinancePDF({
            userName: getUserData()?.name || "User",
            data: {
                ...getUserData(),
                chartImages: chartImages // Pass captured images
            },
            messages: messages,
        });
    };

    const handleActionClick = async (action: any, index: number) => {
        try {
            setActionLoading(index);

            if (action.type === "save") {
                const progress = JSON.parse(localStorage.getItem("sf_progress") || "{}");
                const onboarding = getUserData();
                const baselineSaved = Number(onboarding?.emergencyFund || 0);
                const baselineTarget = Number(onboarding?.expenses || 0) * 6;

                const res = await fetch("https://smart-finance-backend-w4ou.onrender.com/api/update-progress", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        action: "save",
                        amount: action.amount || 500,
                        currentSaved: progress?.saved !== undefined ? progress.saved : baselineSaved,
                        target: progress?.target || baselineTarget,
                    }),
                });

                const data = await res.json();

                localStorage.setItem(
                    "sf_progress",
                    JSON.stringify({
                        saved: data.newSaved,
                        target: data.target,
                    })
                );

                window.dispatchEvent(new Event("progressUpdated")); // ✅ NEW
                alert(`✅ ₹${action.amount} saved!`);
            }

            // mark success
            setActionLoading(null);
            setActionSuccess(index);

            // reset success after 2 sec
            setTimeout(() => {
                setActionSuccess(null);
            }, 2000);

        } catch (err) {
            console.error(err);
            setActionLoading(null);
        }
    };

    const handleFeedback = (index: number, type: string) => {
        const existing = JSON.parse(localStorage.getItem("sf_feedback") || "[]");

        existing.push({
            messageIndex: `${index}-${messages[index]?.content?.slice(0, 20)}`,
            feedback: type,
            timestamp: new Date().toISOString(),
        });

        localStorage.setItem("sf_feedback", JSON.stringify(existing));

        setFeedbackGiven((prev) => ({
            ...prev,
            [index]: true,
        }));
    };

    const sendMessage = async (text: string) => {
        if (!text.trim()) return;

        setMessages((prev) => [...prev, { role: "user", content: text }]);
        setLoading(true);
        setTimerActive(true);
        setResponseTime(0);

        try {
            // Wake up backend (Render sleep fix)
            await fetch("https://smart-finance-backend-w4ou.onrender.com");

            const currentSessionId = sessionId || sessionStorage.getItem("sessionId");
            const user = getUserData();

            const expenseBreakdown = user?.expenseBreakdown || [];

            const topCategory =
                expenseBreakdown.length > 0
                    ? expenseBreakdown.reduce((max: any, item: any) =>
                        Number(item.amount) > Number(max.amount) ? item : max
                    )
                    : null;

            const res = await fetch("https://smart-finance-backend-w4ou.onrender.com/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message: `${text}

User Financial Context:
- Income: ₹${user?.income || 0}
- Expenses: ₹${user?.expenses || 0}
- Investments: ₹${user?.investments || 0}
- Insurance: ₹${user?.insurance || 0}

${topCategory
                            ? `Top Expense Category: ${topCategory.category} (₹${topCategory.amount})`
                            : ""
                        }

Expense Breakdown:
${expenseBreakdown
                            .map((e: any) => `- ${e.category}: ₹${e.amount}`)
                            .join("\n")}

Give personalized advice based on this. Focus on reducing unnecessary expenses if possible.`,
                    userData: {
                        ...user,
                        insurance: user?.insurance || 0,
                    },
                    history: messages.slice(-6),
                    sessionId: currentSessionId,
                    resetSession: resetBackend
                }),
            });

            setResetBackend(false);

            if (!res.ok) {
                throw new Error("Backend error");
            }

            const data = await res.json();

            const shouldShowActions =
                data.reply?.mode === "structured" ||
                data.reply?.data?.chartConfig ||
                data.reply?.data?.table ||
                data.reply?.data?.insights;

            setMessages((prev) => [
                ...prev,
                {
                    role: "assistant",
                    message: data.reply?.message || "No response",
                    content: data.reply?.message || "No response",
                    data: data.reply?.data || data.reply,
                    mode: data.reply?.mode,
                    showActions: shouldShowActions,
                    actions: data.reply?.actions || [], // ✅ NEW
                },
            ]);

            setIsCustomMode(true);
        } catch {
            setMessages((prev) => [
                ...prev,
                { role: "assistant", content: "Something went wrong." },
            ]);
        }

        setLoading(false);
        setTimerActive(false);
    };

    return (
        <div id="dashboard-content" className="flex flex-col h-[92vh] p-6 bg-gray-50">

            <h1 className="text-xl font-semibold mb-4">✨ AI Advisor</h1>

            <div className="flex-1 overflow-y-auto space-y-6 bg-white p-6 rounded-2xl shadow">
                {/* GLOBAL INSURANCE NUDGE */}
                {showInsuranceWarning && getUserData()?.insurance < (getUserData()?.income || 0) * 6 && (
                    <div className="bg-red-50 border border-red-100 p-4 rounded-xl flex items-center justify-between">
                        <p className="text-red-700 text-sm">
                            ⚠️ <strong>Insurance Alert:</strong> You may be underinsured. Ask: "Do I have enough insurance?"
                        </p>
                        <button
                            onClick={() => setShowInsuranceWarning(false)}
                            className="text-red-400 hover:text-red-600 font-bold ml-4"
                        >
                            ×
                        </button>
                    </div>
                )}


                {messages.map((msg, i) => (
                    <div key={i}>

                        {/* USER */}
                        {msg.role === "user" && (
                            <div className="flex justify-end">
                                <div className="bg-blue-500 text-white px-4 py-2 rounded-xl max-w-[60%]">
                                    {msg.content}
                                </div>
                            </div>
                        )}

                        {/* AI */}
                        {msg.role === "assistant" && (
                            <div className="max-w-[90%] space-y-3 animate-in fade-in slide-in-from-left-2 duration-300">
                                <div className="bg-white border shadow-sm rounded-2xl overflow-hidden">
                                    {/* Text Content */}
                                    {(msg.message ?? msg.content) && (
                                        <div className="px-5 py-4 text-gray-800 leading-relaxed border-b border-gray-50 last:border-b-0">
                                            {(msg.message ?? msg.content)
                                                .replace(/\*\*/g, "")
                                                .replace(/###/g, "")
                                                .split("\n")
                                                .map((p: string, i: number) =>
                                                    p.trim() ? <p key={i} className="mb-2 last:mb-0">{p}</p> : null
                                                )
                                            }
                                        </div>
                                    )}

                                    {/* STRUCTURED DATA INSIDE SAME CARD */}
                                    {msg.data && msg.mode === "structured" && (
                                        <div className="p-5 bg-gray-50/50 space-y-5 border-t border-gray-100">

                                            {/* Insights */}
                                            {msg.data.insights && Array.isArray(msg.data.insights) && (
                                                <div className="bg-purple-50/50 p-4 rounded-xl border border-purple-100/50">
                                                    <p className="font-semibold text-purple-900 mb-2 flex items-center gap-2">
                                                        <span>💡</span> AI Insights
                                                    </p>
                                                    <ul className="space-y-2">
                                                        {msg.data.insights.map((ins: string, idx: number) => (
                                                            <li key={idx} className="text-sm text-purple-800 flex gap-2">
                                                                <span className="text-purple-400">•</span>
                                                                {ins}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}

                                            {/* Chart - Contained & Scrollable if needed */}
                                            {msg.data?.chartConfig && (
                                                <div className="bg-white p-4 rounded-xl border border-gray-200">
                                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 px-1">Visual Analysis</p>
                                                    <div className="max-h-[300px] overflow-hidden" data-chart-id={i}>
                                                        <SmartChart config={msg.data.chartConfig} />
                                                    </div>
                                                </div>
                                            )}

                                            {/* Table */}
                                            {msg.data.table && (
                                                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                                                    <div className="overflow-x-auto">
                                                        <table className="w-full text-sm text-left">
                                                            <thead className="bg-gray-50 border-b border-gray-200">
                                                                <tr>
                                                                    {(msg.data.table.headers || []).map((h: string, i: number) => (
                                                                        <th key={i} className="px-4 py-3 font-semibold text-gray-700">{h}</th>
                                                                    ))}
                                                                </tr>
                                                            </thead>
                                                            <tbody className="divide-y divide-gray-100">
                                                                {(msg.data.table.rows || []).map((row: any[], i: number) => (
                                                                    <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                                                                        {(row || []).map((cell, j) => (
                                                                            <td key={j} className="px-4 py-3 text-gray-600">{cell}</td>
                                                                        ))}
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Recommendation */}
                                            {msg.data.recommendation && (
                                                <div className="bg-green-50 p-4 rounded-xl border border-green-100 flex items-start gap-3">
                                                    <span className="text-lg">⚡</span>
                                                    <div>
                                                        <p className="font-semibold text-green-900">Recommendation</p>
                                                        <p className="text-sm text-green-800">{msg.data.recommendation}</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                 {/* FEEDBACK */}
                                {!feedbackGiven[i] && msg.role === "assistant" && msg.content !== undefined && i > 0 && (
                                    <div className="flex items-center gap-2 mt-2">
                                        <span className="text-xs text-gray-500">Was this helpful?</span>

                                        <button
                                            onClick={() => handleFeedback(i, "yes")}
                                            className="px-3 py-1 text-xs rounded-full bg-green-100 hover:bg-green-200"
                                        >
                                            👍 Yes
                                        </button>

                                        <button
                                            onClick={() => handleFeedback(i, "maybe")}
                                            className="px-3 py-1 text-xs rounded-full bg-yellow-100 hover:bg-yellow-200"
                                        >
                                            🤔 Maybe
                                        </button>

                                        <button
                                            onClick={() => handleFeedback(i, "no")}
                                            className="px-3 py-1 text-xs rounded-full bg-red-100 hover:bg-red-200"
                                        >
                                            👎 No
                                        </button>
                                    </div>
                                )}

                                {/* AFTER FEEDBACK */}
                                {feedbackGiven[i] && msg.role === "assistant" && (
                                    <p className="text-xs text-green-600 mt-2">✅ Feedback received</p>
                                )}

                                {/* ACTIONS */}
                                {msg.showActions && (
                                    <div className="flex gap-3">
                                        <button
                                            onClick={handleDownloadPDF}
                                            className="px-4 py-2 bg-green-500 text-white rounded-xl"
                                        >
                                            📄 Download PDF
                                        </button>

                                        <button
                                            onClick={() => sendMessage("Continue")}
                                            className="px-4 py-2 bg-gray-200 rounded-xl"
                                        >
                                            ➡️ Continue
                                        </button>
                                    </div>
                                )}

                                {msg.actions && msg.actions.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {msg.actions.map((action: any, idx: number) => {
                                            const isLoading = actionLoading === idx;
                                            const isSuccess = actionSuccess === idx;

                                            return (
                                                <button
                                                    key={idx}
                                                    onClick={() => handleActionClick(action, idx)}
                                                    disabled={isLoading || isSuccess}
                                                    className={`px-4 py-2 rounded-xl text-sm transition ${isSuccess
                                                        ? "bg-green-600 text-white"
                                                        : "bg-blue-600 text-white hover:bg-blue-700"
                                                        }`}
                                                >
                                                    {isLoading
                                                        ? "Processing..."
                                                        : isSuccess
                                                            ? "✓ Done"
                                                            : action.label}
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}

                                {/* QUICK OPTIONS */}
                                {!isCustomMode && msg.options && (
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {msg.options.map((opt: string, idx: number) => (
                                            <button
                                                key={idx}
                                                onClick={() => {
                                                    if (opt === "❓ Others") {
                                                        setIsCustomMode(true);
                                                    } else {
                                                        sendMessage(opt);
                                                        // ❌ DO NOT enable typing yet
                                                    }
                                                }}
                                                className="text-sm px-3 py-1.5 rounded-full bg-purple-100 hover:bg-purple-200 transition"
                                            >
                                                {opt}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                ))}

                {loading && (
                    <div className="flex flex-col gap-2 mt-2">
                        <p className="text-sm text-gray-500">🤖 AI thinking...</p>

                        <div className="text-xs text-gray-600 bg-gray-100 px-3 py-1 rounded-lg w-fit">
                            ⏱️ Generating response... {responseTime.toFixed(1)}s
                        </div>
                    </div>
                )}
                <div ref={bottomRef} />
            </div>

            {/* INPUT */}
            {isCustomMode && (
                <div className="mt-4 flex gap-2">
                    <input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                sendMessage(input);
                                setInput("");
                            }
                        }}
                        className="flex-1 border px-4 py-2 rounded-xl focus:ring-2 focus:ring-purple-500/50 outline-none"
                    />

                    <button
                        onClick={() => {
                            sendMessage(input);
                            setInput("");
                        }}
                        className="bg-blue-500 text-white px-5 rounded-xl font-medium hover:bg-blue-600 transition-colors"
                    >
                        Send
                    </button>
                </div>
            )}
        </div>
    );
}