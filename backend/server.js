import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";

console.log("🔥 SERVER FILE LOADED");

dotenv.config();

const app = express();
app.use(cors({ origin: "*" }));
app.use(express.json());

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Test route
app.get("/", (req, res) => {
  res.send("Backend is running ✅");
});

/* ===========================
   SHARED ADVISOR FUNCTION
=========================== */
const handleAdvisor = async (req, res) => {
  try {
    const { message, userData } = req.body;

    const {
      income = 0,
      expenses = 0,
      savings = 0,
      investments = 0,
    } = userData || {};

    const prompt = `
You are Smart Finance, a friendly and knowledgeable AI financial advisor for Indian users. Your job is to make personal finance simple, clear, and actionable.

User Data:
- Monthly Income: ₹${income}
- Monthly Expenses: ₹${expenses}
- Monthly Savings: ₹${savings}
- Investments: ₹${investments}

User's message: ${message}

RESPONSE RULES (FOLLOW STRICTLY):
1. NEVER use markdown in the "message" string. No **bold**, no ###headers, no | tables |. Plain text only. Use numbered lists (1. 2. 3.) and newlines (\\n\\n) for structure.
2. Always end with a follow-up question to keep the conversation going.
3. For ANY response involving budgeting, savings, investments, tax, or growth — you MUST include a "chartConfig" in the data object.
4. For structured financial plans/comparisons, set mode to "structured".
5. Use "insights" array and "table" object when helpful.
6. For tax questions, include the full tax comparison schema.

CHART RULES — MANDATORY:
- Budget / 50-30-20 breakdown → PIE CHART
- Investment growth / SIP / future value → LINE CHART (year-by-year, minimum 5 years)
- Comparisons (options, instruments, regimes) → BAR CHART
- Always include a "chartConfig" whenever you mention numbers, percentages, or projections.

chartConfig FORMAT (use exactly this schema):

For PIE (budget, allocation):
"chartConfig": {
  "type": "pie",
  "title": "Budget Breakdown",
  "data": [
    { "name": "Needs (50%)", "value": 11500 },
    { "name": "Wants (30%)", "value": 6900 },
    { "name": "Savings (20%)", "value": 4600 }
  ],
  "series": [
    { "color": "#6366F1" },
    { "color": "#f59e0b" },
    { "color": "#10b981" }
  ]
}

For LINE (SIP growth):
"chartConfig": {
  "type": "line",
  "title": "Investment Growth Over 5 Years",
  "data": [
    { "year": "Year 1", "investment": 12000, "value": 13200 },
    { "year": "Year 2", "investment": 24000, "value": 28000 }
  ],
  "xKey": "year",
  "series": [
    { "key": "investment", "color": "#94a3b8", "name": "Amount Invested" },
    { "key": "value", "color": "#6366F1", "name": "Portfolio Value" }
  ]
}

For BAR (comparison):
"chartConfig": {
  "type": "bar",
  "title": "Investment Options",
  "data": [
    { "name": "FD", "value": 7 },
    { "name": "Index Fund", "value": 12 },
    { "name": "PPF", "value": 7.1 }
  ],
  "xKey": "name",
  "series": [
    { "key": "value", "color": "#6366F1", "name": "Return %" }
  ]
}

OUTPUT — STRICT JSON ONLY (no markdown code fences, no text outside JSON):
{
  "mode": "chat | structured",
  "message": "Plain text response here. No markdown. \\n\\n Use newlines for paragraphs.",
  "data": {
    "chartConfig": { ...as per schema above... },
    "insights": ["Point 1", "Point 2"],
    "table": {
      "headers": ["Option", "Return", "Risk"],
      "rows": [["FD", "7%", "Low"], ["Index Fund", "12%", "Med"]]
    },
    "recommendation": "One clear action step",
    "type": "tax",
    "oldRegime": { "tax": 215000 },
    "newRegime": { "tax": 120000 },
    "recommended": "new",
    "insight": "Personalized tax insight here"
  }
}
Note: Omit keys in "data" that are not relevant to the query. Always include chartConfig when numbers/visuals are relevant.
`;

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    });

    let reply;
    try {
      reply = JSON.parse(response.choices[0].message.content);
    } catch {
      reply = {
        mode: "chat",
        message: "Sorry, something went wrong.",
      };
    }

    res.json({ reply });

  } catch (error) {
    console.error("❌ ERROR:", error);
    res.status(500).json({ reply: "Error" });
  }
};

/* ===========================
   ROUTES
=========================== */

// Original route
app.post("/advisor", handleAdvisor);

// ✅ NEW ROUTE (IMPORTANT FIX)
app.post("/api/chat", handleAdvisor);

/* ===========================
   ANALYZE FINANCE
=========================== */
app.post("/api/analyze-finance", async (req, res) => {
  console.log("🚨 ANALYZE ROUTE WORKING");

  try {
    const { income, expenses, savings, investments, occupation } = req.body;

    const inc = Number(income) || 0;
    const exp = Number(expenses) || 0;
    const sav = Number(savings) || 0;
    const inv = Number(investments) || 0;

    const savingsRate = inc > 0 ? Math.round((sav / inc) * 100) : 0;
    const remainingIncome = inc - exp;
    const emergencyFundTarget = exp * 6;
    const emergencyFundMonths = exp > 0 ? (sav / exp).toFixed(1) : 0;
    const investmentRatio = inc > 0 ? Math.round((inv / inc) * 100) : 0;

    const prompt = `
You are a smart financial advisor.

User:
Income: ₹${inc}
Expenses: ₹${exp}
Savings: ₹${sav}
Investments: ₹${inv}

Give:
- 3 insights
- 1 action
`;

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
    });

    const aiText = response.choices[0].message.content;

    res.json({
      metrics: {
        savingsRate,
        remainingIncome,
        emergencyFundTarget,
        emergencyFundMonths,
        investmentRatio,
      },
      insights: aiText,
    });

  } catch (error) {
    console.error("❌ ERROR:", error);
    res.status(500).json({
      error: "AI failed",
      insights: "Unable to generate insights",
    });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});