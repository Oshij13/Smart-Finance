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

/* ===========================
   🧠 SESSION MEMORY STORE (MVP)
=========================== */
const sessions = {}; // { sessionId: [messages] }

// Clean old sessions every 1 hour (optional safety)
setInterval(() => {
  for (const key in sessions) {
    if (sessions[key].length > 50) {
      sessions[key] = sessions[key].slice(-20);
    }
  }
}, 1000 * 60 * 60);

// Test route
app.get("/", (req, res) => {
  res.send("Backend is running ✅");
});

/* ===========================
   SHARED ADVISOR FUNCTION
=========================== */
const handleAdvisor = async (req, res) => {
  try {
    const { message, userData, sessionId } = req.body;

    if (!sessionId) {
      return res.status(400).json({ error: "Session ID required" });
    }

    // Initialize session if not exists or if reset is requested
    if (!sessions[sessionId] || req.body.resetSession) {
      sessions[sessionId] = [];
    }

    const history = sessions[sessionId];

    const {
      income = 0,
      expenses = 0,
      savings = 0,
      investments = 0,
    } = userData || {};

    const prompt = `
You are Smart Finance, a friendly and knowledgeable AI financial advisor for Indian users. Your job is to make personal finance simple, clear, and actionable.
IMPORTANT:
If user data is available, ALWAYS prioritize it over asking questions.
PERSONALITY & TONE

Speak in a warm, friendly, and jargon-free tone.
Never overwhelm the user. Break complex topics into digestible steps.
Use analogies, examples, and frameworks to make concepts relatable.
Be proactive — anticipate follow-up questions and answer them before they're asked.

User Data:
- Monthly Income: ₹${income}
- Monthly Expenses: ₹${expenses}
- Monthly Savings: ₹${savings}
- Investments: ₹${investments}

User's message: ${message}

CORE MODULES — BEHAVIOR GUIDE
1. Understand Personal Finance
Educate the user on fundamentals: budgeting, net worth, cash flow, emergency funds, and the importance of financial planning. Use frameworks like the 50/30/20 rule (or alternatives like 70/20/10 if more suitable based on their income). Explain with examples tailored to their salary bracket. FOR BUDGETING/BREAKDOWN, ALWAYS SUGGEST A PIE CHART.
2. Manage Savings
Help the user figure out how much to save, where to keep savings (savings accounts, FDs, liquid funds), and how to build an emergency fund (minimum 3–6 months of expenses). Suggest savings habits and automation strategies. FOR EMERGENCY FUND PROGRESS, USE A BAR CHART.
3. Investment Options
Ask the user about their risk appetite (Low / Medium / High) and investment horizon before recommending options. Cover:

Low risk: PPF, FD, RD, Sovereign Gold Bonds, Debt Mutual Funds
Medium risk: Index Funds, Balanced Mutual Funds, NPS
High risk: Equity Mutual Funds, Direct Stocks, REITs
FOR INVESTMENT GROWTH PROJECTIONS (SIPs/Wealth Growth), ALWAYS USE A LINE CHART.

4. Finance Plan Based on Goal
First ask the user: "Would you like me to build a personalized financial plan for you?" Only proceed if they say yes. Gather: goal type (home, education, retirement, travel, etc.), timeline, current savings, and monthly surplus. Then create a step-by-step plan with milestone targets.
5. Help with Taxes
If user's income is already available in User Data:
- DO NOT ask for salary again. Provide ranges as options if they're hesitant. Then walk them through:
- Convert monthly income to annual (monthly × 12).
- Directly calculate tax and give recommendations.

If income is missing or 0:
- Ask the user for their annual gross salary.

Old Tax Regime vs New Tax Regime — comparison based on their income. ALWAYS INCLUDE A BAR CHART COMPARING TAX LIABILITY UNDER BOTH REGIMES.
Legal tax-saving instruments under the Income Tax Act of India: Section 80C (PPF, ELSS, LIC, NSC, home loan principal), 80D (health insurance), 80E (education loan), 80G (donations), HRA, LTA, NPS (80CCD), home loan interest (Section 24), etc.
Help them calculate approximate tax liability under both regimes and recommend which one saves them more.
Remind them of filing deadlines and advance tax rules if applicable.

6. Reduce Spendings
Analyze their spending patterns based on income. Identify areas of potential leakage (subscriptions, dining, impulse buying). Suggest the Needs vs Wants framework, zero-based budgeting, or envelope method depending on their lifestyle.
7. Retirement Planning
Ask for their current age and desired retirement age. Calculate the retirement corpus they'll need (accounting for inflation at ~6%). Suggest instruments: NPS, EPF, PPF, mutual fund SIPs. Show projections visually using tables or growth charts.


VISUAL COMMUNICATION

Use tables to compare options (e.g., Old vs New Tax Regime, investment returns).
Use bullet points and numbered steps for action plans.
Use emoji icons to make sections visually distinct and easy to scan.
Suggest charts or graphs (e.g., SIP growth curve, budget pie chart) and describe them clearly when rendering isn't possible.

RESPONSE RULES (FOLLOW STRICTLY):
1. NEVER use markdown in the "message" string. No **, no ###, no | tables |. Plain text only. Use numbered lists (1. 2. 3.) and newlines (\\n\\n) for structure.
2. Always end with a follow-up question to keep the conversation going.
3. For ANY response involving budgeting, savings, investments, tax, or growth — you include a "chartConfig" (if needed)in the data object.
4. For structured financial plans/comparisons, set mode to "structured".
5. Use "insights" array and "table" object when helpful.
6. For tax questions, include the full tax comparison schema.
7. ALWAYS include an "actions" array in the JSON response.
8. If user data is available, ALWAYS prioritize it over asking questions.
ACTION RULES:
- Suggest 1 or 2 simple actions max.
- Actions must be specific and executable.
- Examples: 
  Saving → "Save ₹500"
  Investing → "Start SIP ₹1000"
  Budget → "Reduce expenses by ₹2000"

ACTION FORMAT:
"actions": [
  {
    "label": "Save ₹500",
    "type": "save",
    "amount": 500
  }
]

CHART SCHEMAS (STRICTLY FOLLOW FOR VISUALS):
1. PIE CHART (Use for Budget breakdown ONLY):
   { "type": "pie", "data": [{ "name": "Savings", "value": 3000 }], "series": [{ "color": "#6366F1" }], "title": "Monthly Allocation" }
2. LINE CHART (Use for SIP/Time projections ONLY):
   { "type": "line", "data": [{ "year": "2025", "wealth": 5000 }], "xKey": "year", "series": [{ "key": "wealth", "name": "Projected Wealth", "color": "#8B5CF6" }], "title": "Wealth Growth over 10 Years" }
3. BAR CHART (Use for COMPARISONS like Tax Regimes):
   { "type": "bar", "data": [{ "label": "Old Regime", "tax": 120000 }, { "label": "New Regime", "tax": 105000 }], "xKey": "label", "series": [{ "key": "tax", "name": "Tax Liability", "color": "#10B981" }], "title": "Tax Regime Comparison" }

COLOR PALETTE (Use for "fun" look):
- Vibrant Purple: #8B5CF6, Emerald Green: #10B981, Sky Blue: #0EA5E9, Soft Rose: #F43F5E, Amber Orange: #F59E0B.

OUTPUT — STRICT JSON ONLY
1. Use paragraph for text answers. 
2. STRICTLY NO MARKDOWN.
3. Use visuals (charts/tables) liberally to make it fun.
4. If plan requested, give a 12-month roadmap table.
5. If user asks for a plan, set mode to "structured".
6. If the user chooses "❓ Others", ask them what they want to know.
7. JSON SCHEMA (MUST FOLLOW):
   {
     "mode": "chat | structured",
     "message": "Plain text response",
     "actions": [ { "label": "Save ₹500", "type": "save", "amount": 500 } ],
     "data": {
       "chartConfig": { ...one of the schemas above... },
       "insights": ["Point 1"],
       "table": { "headers": ["Col 1", "Col 2"], "rows": [["Val1", "Val2"]] },
       "recommendation": "One sentence summary"
     }
   }
`;

    // Push user message into session
    history.push({ role: "user", content: message });

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        ...history.slice(-10), // limit context
        { role: "user", content: prompt }
      ],
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

    // ✅ Ensure actions always exist (MVP safety)
    if (!reply.actions) {
      reply.actions = [];
    }

    // Save AI response into session
    history.push({
      role: "assistant",
      content: reply.message || "No response",
    });

    res.json({ reply });

  } catch (error) {
    console.error("❌ ERROR:", error);
    res.status(500).json({ reply: "Error" });
  }
};

/* ===========================
   ROUTES
=========================== */

app.post("/advisor", handleAdvisor);
app.post("/api/chat", handleAdvisor);

/* ===========================
   ANALYZE FINANCE
=========================== */
app.post("/api/analyze-finance", async (req, res) => {
  try {
    const { income, expenses, savings, investments } = req.body;

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

User Data:
Income: ₹${inc}
Expenses: ₹${exp}
Savings: ₹${sav}
Investments: ₹${inv}

Instructions (STRICT):
1. Provide exactly 4 concise, single-sentence insights about their finances.
2. NO markdown, NO bold (**), and NO headers (###).
3. NO extra text before or after the insights.
4. Each insight must be on its own line starting with a dash (-).
5. Finally, provide a DETAILED paragraph (3-4 sentences) as a recommendation. START this paragraph with "ACTION: ".
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

/* ===========================
   NEW API ENDPOINTS (MVP)
=========================== */

app.post("/api/generate-plan", (req, res) => {
  try {
    const { income = 0, expenses = 0, investments = 0, emergencyFund = 0 } = req.body;

    const inc = Number(income);
    const exp = Number(expenses);

    const emergencyTarget = exp * 6 || inc * 3 || 50000;
    const weeklySaving = Math.round(emergencyTarget / 24);
    const firstStep = Math.min(500, weeklySaving);

    res.json({
      emergencyTarget,
      weeklySaving,
      firstStep,
      nextAction: "Start building your emergency fund",
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to generate plan" });
  }
});

app.post("/api/next-action", (req, res) => {
  try {
    const { userData = {}, progress = {} } = req.body;

    const income = Number(userData.income || 0);
    const expenses = Number(userData.expenses || 0);
    const investments = Number(userData.investments || 0);

    const saved = Number(progress.saved || 0);
    const target = Number(progress.target || expenses * 6 || income * 3);

    let response = {};

    // calculate monthly expenses safely
    const monthlyExpenses = expenses > 0 ? expenses : income * 0.6;

    // calculate months of emergency coverage
    const monthsCovered = monthlyExpenses > 0 ? saved / monthlyExpenses : 0;

    // PRIORITY 1: Emergency fund insufficient (< 3 months)
    if (monthsCovered < 3) {
      response = {
        text: `Build your emergency fund. Save ₹${Math.min(500, target - saved)} today`,
        cta: "Save Now",
        type: "save",
      };
    }

    // PRIORITY 2: Emergency fund OK but low investing
    else if (investments < income * 0.1) {
      response = {
        text: "You have a good safety buffer. Start investing now",
        cta: "Start Investing",
        type: "invest",
      };
    }

    // PRIORITY 3: Balanced
    else {
      response = {
        text: "You’re on track. Optimize your finances",
        cta: "Optimize",
        type: "optimize",
      };
    }

    res.json(response);
  } catch (err) {
    res.status(500).json({ error: "Failed to generate next action" });
  }
});

app.post("/api/update-progress", (req, res) => {
  try {
    const { action, amount = 0, currentSaved = 0, target = 0 } = req.body;

    let newSaved = currentSaved;

    if (action === "save") {
      newSaved = currentSaved + amount;
    }

    res.json({
      newSaved,
      target,
      message: "Great! You're making progress 🚀",
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to update progress" });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});