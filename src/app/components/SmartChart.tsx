import {
    LineChart,
    Line,
    BarChart,
    Bar,
    PieChart,
    Pie,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
    ResponsiveContainer,
    Cell,
} from "recharts";

export default function SmartChart({ config }: { config: any }) {
    if (!config) return null;

    const { type, data, xKey, series, title } = config;

    if (!data || !Array.isArray(data) || data.length === 0) {
        return <div className="p-10 text-center text-gray-400">No data available for chart</div>;
    }

    // 🛡️ FALLBACK: If series is missing, try to auto-detect numeric keys from data
    const finalSeries = (series && series.length > 0) ? series : (() => {
        const firstObj = data[0];
        const keys = Object.keys(firstObj).filter(k => k !== xKey && typeof firstObj[k] === 'number');
        return keys.slice(0, 3).map((k, i) => ({
            key: k,
            name: k.charAt(0).toUpperCase() + k.slice(1),
            color: ["#8B5CF6", "#10B981", "#0EA5E9", "#F43F5E"][i % 4]
        }));
    })();

    // 🛡️ FALLBACK: If xKey is missing, try to find a string key
    const finalXKey = xKey || Object.keys(data[0]).find(k => typeof data[0][k] === 'string') || "name";

    // Build chart element separately so ResponsiveContainer always gets a valid single child
    const renderChart = () => {
        if (type === "line") {
            return (
                <LineChart data={data}>
                    <XAxis dataKey={finalXKey} />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    {finalSeries.map((s: any, i: number) => (
                        <Line
                            key={i}
                            dataKey={s.key}
                            stroke={s.color}
                            name={s.name}
                            strokeWidth={2}
                        />
                    ))}
                </LineChart>
            );
        }

        if (type === "bar") {
            return (
                <BarChart data={data}>
                    <XAxis dataKey={finalXKey} />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    {finalSeries.map((s: any, i: number) => (
                        <Bar key={i} dataKey={s.key} fill={s.color} name={s.name} />
                    ))}
                </BarChart>
            );
        }

        if (type === "pie") {
            const nameKey = Object.keys(data[0]).find(k => typeof data[0][k] === 'string') || "name";
            const valKey = Object.keys(data[0]).find(k => typeof data[0][k] === 'number') || "value";
            return (
                <PieChart>
                    <Pie data={data} dataKey={valKey} nameKey={nameKey} label>
                        {data?.map((_: any, i: number) => (
                            <Cell key={i} fill={["#8B5CF6", "#10B981", "#0EA5E9", "#F43F5E"][i % 4]} />
                        ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                </PieChart>
            );
        }

        // Fallback: default bar chart
        return (
            <BarChart data={data}>
                <XAxis dataKey={finalXKey} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#6366F1" />
            </BarChart>
        );
    };

    return (
        <div className="bg-white p-4 rounded-xl shadow">
            {title && <p className="text-sm font-semibold mb-2">{title}</p>}
            <ResponsiveContainer width="100%" height={250}>
                {renderChart()}
            </ResponsiveContainer>
        </div>
    );
}
