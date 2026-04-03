import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
 
// 🧹 CLEAN TEXT HELPER (Fixes scrambled characters/emojis for jsPDF)
const cleanText = (text: any): string => {
    if (typeof text !== "string") return String(text || "");
    
    // Remove JSON-like structures that GPT sometimes leaks into the message
    let cleaned = text.replace(/\{[\s\S]*?"type":\s*"(pie|line|bar)"[\s\S]*?\}/g, "");

    return cleaned
        .replace(/\*\*/g, "") // Remove bolding
        .replace(/###/g, "") // Remove headers
        .replace(/₹/g, "Rs.")
        .replace(/[^\x00-\x7F\n\r]/g, "") // Remove non-ASCII except newlines
        .trim();
};

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
    doc.text(`User: ${cleanText(userName)}`, pageWidth - 60, 15);
    doc.text(`Date: ${date}`, pageWidth - 60, 22);

    doc.setTextColor(0, 0, 0);
    y = 40;

    // 💬 SECTION: CONVERSATION HISTORY
    doc.setFontSize(14);
    doc.text("Conversation History", margin, y);
    y += 10;

    doc.setFontSize(10);
    messages.forEach((msg, index) => {
        const role = msg.role === "user" ? "You" : "Smart Finance AI";
        const content = msg.message || msg.content || "";

        if (!content) return;

        // Label
        doc.setFont("helvetica", "bold");
        doc.text(`${role}:`, margin, y);
        y += 5;

        // Message Content
        doc.setFont("helvetica", "normal");
        const cleanedContent = cleanText(content);
        if (!cleanedContent) return; // Skip if message became empty after cleaning (e.g. was just JSON)

        const lines = doc.splitTextToSize(cleanedContent, pageWidth - 2 * margin);
        
        // Page break check for text
        if (y + lines.length * 5 + 10 > 280) {
            doc.addPage();
            y = 20;
        }

        doc.text(lines, margin, y);
        y += lines.length * 5 + 2;

        // Render Chart Image if available for this message index
        if (data.chartImages && data.chartImages[index]) {
            const chartImg = data.chartImages[index];
            if (y + 60 > 280) { doc.addPage(); y = 20; }
            doc.addImage(chartImg, "PNG", margin, y, pageWidth - 2 * margin, 60);
            y += 65;
        }

        y += 3;
    });

    // 📑 SECTION: FINANCIAL SUMMARY & INSIGHTS
    // Only add a new page if we are low on space
    if (y + 60 > 280) {
        doc.addPage();
        y = 20;
    } else {
        y += 10;
        doc.setDrawColor(200);
        doc.line(margin, y, pageWidth - margin, y);
        y += 10;
    }

    // Sub-header for the final page
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("Financial Analysis & Insights", margin, y);
    y += 10;

    doc.setFontSize(14);
    doc.text("Financial Summary", margin, y);
    y += 8;

    const summary = [
        ["Income", `Rs. ${data?.income || 0}`],
        ["Expenses", `Rs. ${data?.expenses || 0}`],
        ["Savings", `Rs. ${data?.savings || 0}`],
        ["Investments", `Rs. ${data?.investments || 0}`],
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
    const insights = data.insights || (messages[messages.length - 1]?.data?.insights);
    if (insights) {
        let insightsArray: string[] = [];
        if (Array.isArray(insights)) {
            insightsArray = insights;
        } else if (typeof insights === "string") {
            insightsArray = insights.split('\n').filter((l: string) => l.trim().length > 5);
        }

        if (insightsArray.length > 0) {
            if (y + 30 > 280) { doc.addPage(); y = 20; }
            doc.setFontSize(14);
            doc.text("Insights & Observations", margin, y);
            y += 8;

            doc.setFontSize(11);
            doc.setFont("helvetica", "normal");

            insightsArray.forEach((insight: string) => {
                const cleaned = insight.replace(/^[-*•\d.]+\s*/, "").replace(/\*\*/g, "").trim();
                const splitText = doc.splitTextToSize(`- ${cleanText(cleaned)}`, pageWidth - 2 * margin);

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
    const tableData = data.table || (messages[messages.length - 1]?.data?.table);
    if (tableData?.headers && tableData?.rows) {
        if (y + 30 > 280) { doc.addPage(); y = 20; }
        doc.setFontSize(14);
        doc.text("Detailed Breakdown", margin, y);
        y += 6;

        const cleanedHeaders = tableData.headers.map((h: string) => cleanText(h));
        const cleanedRows = tableData.rows.map((row: any[]) => row.map(cell => cleanText(cell)));

        autoTable(doc, {
            startY: y,
            head: [cleanedHeaders],
            body: cleanedRows,
            theme: "striped",
            headStyles: { fillColor: [99, 102, 241] }, // Indigo
        });

        y = (doc as any).lastAutoTable.finalY + 12;
    }

    // ⚡ RECOMMENDATION
    const recData = data.recommendation || (messages[messages.length - 1]?.data?.recommendation);
    if (recData || (typeof data.insights === "string" && data.insights.includes("ACTION:"))) {
        let rec = recData;
        if (!rec && typeof data.insights === "string") {
            rec = data.insights.split("ACTION:")[1]?.trim();
        }

        if (rec) {
            if (y + 30 > 280) { doc.addPage(); y = 20; }
            doc.setFontSize(14);
            doc.text("Priority Recommendation", margin, y);
            y += 8;

            doc.setFontSize(11);
            const splitText = doc.splitTextToSize(cleanText(rec), pageWidth - 2 * margin);
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