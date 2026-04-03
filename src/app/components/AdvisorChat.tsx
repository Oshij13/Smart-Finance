import { useEffect, useState, useRef } from "react";
import { useLocation } from "react-router";
import { getUserData } from "../store/userStore";
import { generateFinancePDF } from "../../utils/generatePDF";
import SmartChart from "./SmartChart";

export default function AdvisorChat() {
    const [messages, setMessages] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [input, setInput] = useState("");

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
    ];

    useEffect(() => {
        setMessages([
            {
                role: "assistant",
                content:
                    "👋 Hi! I'm your Smart Finance AI.\n\nAsk me anything about your money — budgeting, savings, taxes, or planning.",
                options: quickOptions,
            },
        ]);
    }, []);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, loading]);

    useEffect(() => {
        if (location.state?.query) {
            sendMessage(location.state.query);
        }
    }, [location.state]);

    // ✅ FIXED PDF FUNCTION
    const handleDownloadPDF = () => {
        const latestMessage = messages[messages.length - 1];

        generateFinancePDF({
            userName: getUserData()?.name || "User",
            data: {
                ...getUserData(),
                insights: latestMessage?.data?.insights || [],
                table: latestMessage?.data?.table || null,
                recommendation: latestMessage?.data?.recommendation || "",
                chartCanvas: chartRef.current || null,
            },
        });
    };

    const sendMessage = async (text: string) => {
        if (!text.trim()) return;

        setMessages((prev) => [...prev, { role: "user", content: text }]);
        setLoading(true);

        try {
            // Wake up backend (Render sleep fix)
            await fetch("https://smart-finance-backend-w4ou.onrender.com");

            const res = await fetch("https://smart-finance-backend-w4ou.onrender.com/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message: text,
                    userData: getUserData(),
                }),
            });

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
                    data: data.reply?.data || data.reply,
                    mode: data.reply?.mode,
                    showActions: shouldShowActions,
                },
            ]);
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
                                        { (msg.message ?? msg.content)
                                            .replace(/\*\*/g, "") // Strip bolding
                                            .replace(/###/g, "") // Strip headers
                                            .split("\n")
                                            .map((p: string, i: number) =>
                                                p.trim() ? <p key={i}>{p}</p> : null
                                            )
                                        }
                                    </div>
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
                                            <SmartChart config={msg.data.chartConfig} />
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

                                {/* QUICK OPTIONS */}
                                {msg.options && (
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {msg.options.map((opt: string, idx: number) => (
                                            <button
                                                key={idx}
                                                onClick={() => sendMessage(opt)}
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
                    className="flex-1 border px-4 py-2 rounded-xl"
                />

                <button
                    onClick={() => {
                        sendMessage(input);
                        setInput("");
                    }}
                    className="bg-blue-500 text-white px-5 rounded-xl"
                >
                    Send
                </button>
            </div>
        </div>
    );
}