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
You are Smart Finance, a friendly and knowledgeable AI financial advisor for Indian users. Your job is to provide real-time, dynamic financial analysis and advice.

User Data (USE THIS FOR ALL CALCULATIONS):
- Monthly Income: ₹${income}
- Monthly Expenses: ₹${expenses}
- Monthly Savings: ₹${savings}
- Investments: ₹${investments}

User's message: ${message}

CORE RESPONSIBILITIES:
1. PERFORM REAL CALCULATIONS: Calculate tax (Old vs New Regime based on latest Indian budget FY 2024-25), SIP growth (assume 12% if unspecified), or budget gaps based ON THE USER'S ACTUAL DATA.
2. NO STATIC DATA: Never use the example values (like "₹11,500" or "tax: 215000") in your response unless they coincidentally match your calculations.
3. BE SPECIFIC: Use the user's income and expenses to give personalized insights.

RESPONSE RULES:
1. NEVER use markdown in the "message" string. No **, no ###, no | tables |. Plain text only. Use numbered lists (1. 2. 3.) and newlines (\\n\\n) for structure.
2. Always end with a follow-up question.
3. For ANY numerical analysis (budget, savings, investments, tax, growth) — you MUST include a dynamic "chartConfig".
4. For comparisons or plans, set mode to "structured".
5. For tax queries, you MUST provide a detailed "oldRegime" vs "newRegime" comparison in the "data" object.

CHART TYPES (GENERATE DATA DYNAMICALLY):
- Budget / 50-30-20 → PIE CHART (Calculate values based on User's Income)
- Investment / SIP / Future Value → LINE CHART (Projected values for 5-10 years)
- Comparisons → BAR CHART

OUTPUT — STRICT JSON ONLY (Follow this schema but fill it with DYNAMIC CALCULATED DATA):
{
  "mode": "chat | structured",
  "message": "Direct, personalized response based on user data...",
  "data": {
    "chartConfig": { 
        "type": "pie | line | bar",
        "title": "Descriptive Title",
        "data": [ ...dynamic data... ],
        "series": [ ...styling... ],
        "xKey": "string (for line/bar)"
    },
    "insights": ["Point 1", "Point 2"],
    "table": {
      "headers": ["Col 1", "Col 2"],
      "rows": [["Val 1", "Val 2"]]
    },
    "recommendation": "One clear action step",
    "type": "tax | investment | budget | etc",
    "oldRegime": { "tax": <Calculated Value> },
    "newRegime": { "tax": <Calculated Value> },
    "recommended": "old | new",
    "insight": "Specific insight about the calculation"
  }
}
Note: Omit keys in "data" that are not relevant to the current user query.
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
You are a professional financial analyst. Analyze the following Indian user's monthly data and provide structured insights.

User Data:
Income: ₹${inc}
Expenses: ₹${exp}
Savings: ₹${sav}
Investments: ₹${inv}

TASKS:
1. Calculate the Savings Rate.
2. Identify high-risk areas (e.g., high expenses, low investments).
3. Provide 3-4 specific, actionable insights.
4. Provide ONE clear, priority "recommendation" for the month.

OUTPUT FORMAT (STRICT JSON):
{
  "insights": ["array of 3-4 strings"],
  "recommendation": "string (clear action step)"
}
`;

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    });

    const aiData = JSON.parse(response.choices[0].message.content);

    res.json({
      metrics: {
        savingsRate,
        remainingIncome,
        emergencyFundTarget,
        emergencyFundMonths,
        investmentRatio,
      },
      ...aiData,
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