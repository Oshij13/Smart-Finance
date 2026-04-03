import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const generateFinancePDF = ({
    userName,
    data,
}: {
    userName: string;
    data: any;
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

    // 🧾 SECTION: SUMMARY
    doc.setFontSize(14);
    doc.text("Financial Summary", margin, y);
    y += 8;

    doc.setFontSize(11);

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
    });

    y = (doc as any).lastAutoTable.finalY + 10;

    // 💡 INSIGHTS
    if (data?.insights?.length) {
        doc.setFontSize(14);
        doc.text("Insights", margin, y);
        y += 6;

        doc.setFontSize(11);

        data.insights.forEach((insight: string) => {
            const splitText = doc.splitTextToSize(`• ${insight}`, pageWidth - 2 * margin);

            // Page break check
            if (y + splitText.length * 6 > 280) {
                doc.addPage();
                y = 20;
            }

            doc.text(splitText, margin, y);
            y += splitText.length * 6;
        });

        y += 5;
    }

    // 📊 TABLE
    if (data?.table?.headers && data?.table?.rows) {
        doc.setFontSize(14);
        doc.text("Comparison Table", margin, y);
        y += 5;

        autoTable(doc, {
            startY: y,
            head: [data.table.headers],
            body: data.table.rows,
            theme: "striped",
        });

        y = (doc as any).lastAutoTable.finalY + 10;
    }

    // 📈 CHART (SAFE VERSION)
    if (data?.chartCanvas) {
        try {
            let canvas = data.chartCanvas;

            // Handle Recharts container case
            if (canvas?.container) {
                canvas = canvas.container.querySelector("canvas");
            }

            if (canvas && canvas.toDataURL) {
                const img = canvas.toDataURL("image/png");

                // Page break check
                if (y + 90 > 280) {
                    doc.addPage();
                    y = 20;
                }

                doc.setFontSize(14);
                doc.text("Growth Chart", margin, y);
                y += 5;

                doc.addImage(img, "PNG", margin, y, 180, 80);
                y += 90;
            }
        } catch (e) {
            console.log("Chart export failed");
        }
    }

    // ⚡ RECOMMENDATION
    if (data?.recommendation) {
        if (y + 20 > 280) {
            doc.addPage();
            y = 20;
        }

        doc.setFontSize(14);
        doc.text("Recommendation", margin, y);
        y += 6;

        doc.setFontSize(11);

        const splitText = doc.splitTextToSize(
            data.recommendation,
            pageWidth - 2 * margin
        );

        doc.text(splitText, margin, y);
    }

    // ✅ FOOTER
    const pageCount = (doc as any).internal.getNumberOfPages();

    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(9);
        doc.setTextColor(150);
        doc.text(
            `Page ${i} of ${pageCount}`,
            pageWidth - 40,
            290
        );
    }

    // 💾 SAVE
    doc.save("SmartFinance_Report.pdf");
};