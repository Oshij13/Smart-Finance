import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const generateFinancePDF = ({
    userName,
    data,
    messages = [],
}: {
    userName: string;
    data: any;
    messages?: any[];
}) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 14;
    const date = new Date().toLocaleDateString();

    let y = 20;

    // 🎨 HEADER
    doc.setFillColor(99, 102, 241);
    doc.rect(0, 0, pageWidth, 30, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.text("Smart Finance Report", margin, 18);

    doc.setFontSize(10);
    doc.text(`User: ${userName}`, pageWidth - 60, 15);
    doc.text(`Date: ${date}`, pageWidth - 60, 22);

    doc.setTextColor(0, 0, 0);
    y = 40;

    // 💬 SECTION: CONVERSATION HISTORY
    doc.setFontSize(14);
    doc.text("Conversation History", margin, y);
    y += 10;

    doc.setFontSize(10);
    messages.forEach((msg) => {
        const role = msg.role === "user" ? "You" : "Smart Finance AI";
        const content = msg.message || msg.content || "";

        if (!content) return;

        // Label
        doc.setFont("helvetica", "bold");
        doc.text(`${role}:`, margin, y);
        y += 5;

        // Message Content
        doc.setFont("helvetica", "normal");
        const lines = doc.splitTextToSize(content, pageWidth - 2 * margin);
        
        // Page break check for text
        if (y + lines.length * 5 > 280) {
            doc.addPage();
            y = 20;
        }

        doc.text(lines, margin, y);
        y += lines.length * 5 + 5;

        // Extra space between messages
        y += 2;
    });

    // 📑 SECTION: FINANCIAL SUMMARY & INSIGHTS (FINAL PAGE)
    doc.addPage();
    y = 20;

    // Sub-header for the final page
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("Financial Analysis & Insights", margin, y);
    y += 10;

    doc.setFontSize(14);
    doc.text("Financial Summary", margin, y);
    y += 8;

    const summary = [
        ["Income", `₹${data?.income || 0}`],
        ["Expenses", `₹${data?.expenses || 0}`],
        ["Savings", `₹${data?.savings || 0}`],
        ["Investments", `₹${data?.investments || 0}`],
    ];

    autoTable(doc, {
        startY: y,
        head: [["Category", "Amount"]],
        body: summary,
        theme: "grid",
        styles: { fontSize: 11 },
        headStyles: { fillColor: [16, 185, 129] }, // Emerald Green
    });

    y = (doc as any).lastAutoTable.finalY + 12;

    // 💡 INSIGHTS
    if (data?.insights) {
        let insightsArray: string[] = [];
        if (Array.isArray(data.insights)) {
            insightsArray = data.insights;
        } else if (typeof data.insights === "string") {
            insightsArray = data.insights.split('\n').filter((l: string) => l.trim().length > 5);
        }

        if (insightsArray.length > 0) {
            doc.setFontSize(14);
            doc.text("Insights & Observations", margin, y);
            y += 8;

            doc.setFontSize(11);
            doc.setFont("helvetica", "normal");

            insightsArray.forEach((insight: string) => {
                const cleaned = insight.replace(/^[-*•\d.]+\s*/, "").replace(/\*\*/g, "").trim();
                const splitText = doc.splitTextToSize(`• ${cleaned}`, pageWidth - 2 * margin);

                if (y + splitText.length * 6 > 280) {
                    doc.addPage();
                    y = 20;
                }

                doc.text(splitText, margin, y);
                y += splitText.length * 6 + 2;
            });
            y += 5;
        }
    }

    // 📊 TABLE
    if (data?.table?.headers && data?.table?.rows) {
        if (y + 30 > 280) { doc.addPage(); y = 20; }
        doc.setFontSize(14);
        doc.text("Detailed Breakdown", margin, y);
        y += 6;

        autoTable(doc, {
            startY: y,
            head: [data.table.headers],
            body: data.table.rows,
            theme: "striped",
            headStyles: { fillColor: [99, 102, 241] }, // Indigo
        });

        y = (doc as any).lastAutoTable.finalY + 12;
    }

    // ⚡ RECOMMENDATION
    if (data?.recommendation || (typeof data.insights === "string" && data.insights.includes("ACTION:"))) {
        let rec = data.recommendation;
        if (!rec && typeof data.insights === "string") {
            rec = data.insights.split("ACTION:")[1]?.trim();
        }

        if (rec) {
            if (y + 30 > 280) { doc.addPage(); y = 20; }
            doc.setFontSize(14);
            doc.text("Priority Recommendation", margin, y);
            y += 8;

            doc.setFontSize(11);
            const splitText = doc.splitTextToSize(rec, pageWidth - 2 * margin);
            doc.text(splitText, margin, y);
        }
    }

    // ✅ FOOTER
    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(9);
        doc.setTextColor(150);
        doc.text(`Page ${i} of ${pageCount}`, pageWidth - 40, 290);
    }

    // 💾 SAVE
    doc.save("SmartFinance_Report.pdf");
};