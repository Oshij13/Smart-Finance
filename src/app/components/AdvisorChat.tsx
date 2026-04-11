import { useEffect, useState, useRef } from "react";
import html2canvas from "html2canvas";
import { useLocation } from "react-router";
import { getUserData } from "../store/userStore";
import { generateFinancePDF } from "../../utils/generatePDF";
import SmartChart from "./SmartChart";

export default function AdvisorChat() {
    const [messages, setMessages] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [input, setInput] = useState("");
    const [sessionId, setSessionId] = useState<string>("");
    const [isCustomMode, setIsCustomMode] = useState(false);
    const [actionLoading, setActionLoading] = useState<number | null>(null);
    const [actionSuccess, setActionSuccess] = useState<number | null>(null);
    const [resetBackend, setResetBackend] = useState(false);
    const [feedbackGiven, setFeedbackGiven] = useState<{ [key: number]: boolean }>({});

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
            sessionStorage.removeItem("sf_chat");
            setResetBackend(true);
        }

        const saved = sessionStorage.getItem("sf_chat");

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
        sessionStorage.setItem("sf_chat", JSON.stringify(messages));
    }, [messages]);


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
            messageIndex: index,
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

        try {
            // Wake up backend (Render sleep fix)
            await fetch("https://smart-finance-backend-w4ou.onrender.com");

            const currentSessionId = sessionId || sessionStorage.getItem("sessionId");

            const res = await fetch("https://smart-finance-backend-w4ou.onrender.com/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message: text,
                    userData: {
                        ...getUserData(),
                        insurance: getUserData()?.insurance || 0,
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
    };

    return (
        <div id="dashboard-content" className="flex flex-col h-[92vh] p-6 bg-gray-50">

            <h1 className="text-xl font-semibold mb-4">✨ AI Advisor</h1>

            <div className="flex-1 overflow-y-auto space-y-6 bg-white p-6 rounded-2xl shadow">

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
                            <div className="max-w-[85%] space-y-4">

                                {(msg.message ?? msg.content) && (
                                    <div className="bg-white border shadow px-5 py-4 rounded-xl">
                                        {(msg.message ?? msg.content)
                                            .replace(/\*\*/g, "") // Strip bolding
                                            .replace(/###/g, "") // Strip headers
                                            .split("\n")
                                            .map((p: string, i: number) =>
                                                p.trim() ? <p key={i}>{p}</p> : null
                                            )
                                        }
                                    </div>
                                )}

                                {/* FEEDBACK */}
                                {!feedbackGiven[i] && msg.role === "assistant" && i !== 0 && (
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

                                {/* STRUCTURED */}
                                {msg.data && msg.mode === "structured" && (

                                    <div className="space-y-4">

                                        {/* Insights */}
                                        {msg.data.insights && Array.isArray(msg.data.insights) && (
                                            <div className="bg-purple-50 p-4 rounded-xl">
                                                <p className="font-semibold mb-2">💡 Insights</p>
                                                <ul className="list-disc ml-4 text-sm">
                                                    {msg.data.insights.map((i: string, idx: number) => (
                                                        <li key={idx}>{i}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

                                        {/* Chart */}
                                        {msg.data?.chartConfig && (
                                            <div data-chart-id={i}>
                                                <SmartChart config={msg.data.chartConfig} />
                                            </div>
                                        )}

                                        {/* Table */}
                                        {msg.data.table && (
                                            <div className="border rounded-xl overflow-hidden">
                                                <table className="w-full text-sm">
                                                    <thead className="bg-gray-100">
                                                        <tr>
                                                            {(msg.data.table.headers || []).map((h: string, i: number) => (
                                                                <th key={i} className="p-2">{h}</th>
                                                            ))}
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {(msg.data.table.rows || []).map((row: any[], i: number) => (
                                                            <tr key={i}>
                                                                {(row || []).map((cell, j) => (
                                                                    <td key={j} className="p-2">{cell}</td>
                                                                ))}
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        )}

                                        {/* Recommendation */}
                                        {msg.data.recommendation && (
                                            <div className="bg-green-100 p-4 rounded-xl">
                                                ⚡ {msg.data.recommendation}
                                            </div>
                                        )}
                                    </div>
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

                {loading && <p>🤖 AI thinking...</p>}
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