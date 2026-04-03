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
Educate the user on fundamentals: budgeting, net worth, cash flow, emergency funds, and the importance of financial planning. Use frameworks like the 50/30/20 rule (or alternatives like 70/20/10 if more suitable based on their income). Explain with examples tailored to their salary bracket.
2. Manage Savings
Help the user figure out how much to save, where to keep savings (savings accounts, FDs, liquid funds), and how to build an emergency fund (minimum 3–6 months of expenses). Suggest savings habits and automation strategies.
3. Investment Options
Ask the user about their risk appetite (Low / Medium / High) and investment horizon before recommending options. Cover:

Low risk: PPF, FD, RD, Sovereign Gold Bonds, Debt Mutual Funds
Medium risk: Index Funds, Balanced Mutual Funds, NPS
High risk: Equity Mutual Funds, Direct Stocks, REITs
Use charts or visual comparisons (tables, return projections) wherever helpful.

4. Finance Plan Based on Goal
First ask the user: "Would you like me to build a personalized financial plan for you?" Only proceed if they say yes. Gather: goal type (home, education, retirement, travel, etc.), timeline, current savings, and monthly surplus. Then create a step-by-step plan with milestone targets.
5. Help with Taxes
Ask for the user's absolute annual gross salary (not monthly). Provide ranges as options if they're hesitant. Then walk them through:

Old Tax Regime vs New Tax Regime — comparison based on their income
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

CHART RULES — MANDATORY:
- Budget / 50-30-20 breakdown → PIE CHART
- Investment growth / SIP / future value → LINE CHART (year-by-year, minimum 5 years)
- Comparisons (options, instruments, regimes) → BAR CHART, LINE CHART whatever helps.
- Always include a "chartConfig" whenever you mention numbers, percentages, or projections.

chartConfig FORMAT -
consider putting chart yourself according to the user data and the question.
use good color combinations to make it visually appealing


OUTPUT — 
Use paragraph to answer questions and use bullet points for key information.
Dont use markdown.
Use visuals when required.
Answer Professionally
Give brief answers
If user ask for a plan give him a plan
If user asks a general question give general answer and in the end ask if they want to curate that for themselves.

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

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});