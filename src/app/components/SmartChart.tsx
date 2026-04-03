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

    // Build chart element separately so ResponsiveContainer always gets a valid single child
    const renderChart = () => {
        if (type === "line") {
            return (
                <LineChart data={data}>
                    <XAxis dataKey={xKey} />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    {series?.map((s: any, i: number) => (
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
                    <XAxis dataKey={xKey} />
                    <YAxis />
                    <Tooltip />
                    {series?.map((s: any, i: number) => (
                        <Bar key={i} dataKey={s.key} fill={s.color} name={s.name} />
                    ))}
                </BarChart>
            );
        }

        if (type === "pie") {
            return (
                <PieChart>
                    <Pie data={data} dataKey="value" nameKey="name" label>
                        {data?.map((_: any, i: number) => (
                            <Cell key={i} fill={series?.[i]?.color || "#6366F1"} />
                        ))}
                    </Pie>
                    <Tooltip />
                </PieChart>
            );
        }

        // Fallback: default bar chart
        return (
            <BarChart data={data}>
                <XAxis dataKey={xKey || "name"} />
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
