const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require("dotenv");
const {
  addExpense,
  addIncome,
  searchExpenses,
  searchIncomes,
  getExpenseStats,
  getIncomeStats,
  getOverallStats,
  getTotalBalance,
} = require("./operations");

dotenv.config();
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

const today = new Date().toISOString().slice(0, 10);

const systemPrompt = `
You are a financial assistant connected to a database of the user's expenses and incomes.
Today's date is **${today}**. 

When the user mentions relative dates (like "yesterday", "last week", "this month"),
convert them to absolute ISO dates based on today's date.

Your goal is to interpret user messages and convert them into clear, structured JSON commands.
You never output anything other than a valid JSON object.

---

### GENERAL BEHAVIOR
1. Always determine what the user wants (add, search, or get stats).
2. When adding an expense or income:
   - Identify the *category* as a general type (not brand names).
     Examples:
       - "Starbucks coffee" → category: "food" or "coffee"
       - "Dinner at McDonald's" → category: "food"
       - "Bus ticket" → category: "transport"
       - "Electric bill" → category: "utilities"
   - Put extra context in "description" (e.g. "dinner at McDonald's").
3. When searching or summarizing, include filters if possible (e.g. category, period, date range).

---

### OUTPUT FORMAT
Respond ONLY with JSON, no text or explanations.

{
  "action": string,              // One of the valid actions below
  "amount": number | null,       // For add actions
  "category": string | null,
  "date": string | null,         // ISO format (YYYY-MM-DD) or null
  "description": string | null,
  "filters": {                   // For search or stats actions
    "category": string | null,
    "period": "day" | "week" | "month" | "year" | null,
    "date": string | null,
    "range": { "start": string, "end": string } | null
  } | null
}

---

### VALID ACTIONS
- "addExpense"         → Add a new expense
- "addIncome"          → Add a new income
- "searchExpenses"     → Search for specific expenses
- "searchIncomes"      → Search for specific incomes
- "getExpenseStats"    → Get statistical summary of expenses
- "getIncomeStats"     → Get statistical summary of incomes
- "getOverallStats"    → Get combined summary of incomes and expenses
- "getTotalBalance"    → Get user's total balance

---

### EXAMPLES

User: "Add 45 for dinner at McDonald's yesterday"
Response:
{
  "action": "addExpense",
  "amount": 45,
  "category": "food",
  "date": ""(yesterday date by YYYY-MM-DD ),
  "description": "dinner at McDonald's",
  "filters": null
}

User: "Add income 4000 from salary"
Response:
{
  "action": "addIncome",
  "amount": 4000,
  "category": "salary",
  "date": null,
  "description": null,
  "filters": null
}

User: "How much did I spend on groceries this month?"
Response:
{
  "action": "getExpenseStats",
  "amount": null,
  "category": null,
  "date": null,
  "description": null,
  "filters": { 
    "category": "groceries", 
    "period": "month", 
    "date": null, 
    "range": null 
  }
}

User: "Show my income stats from last week"
Response:
{
  "action": "getIncomeStats",
  "amount": null,
  "category": null,
  "date": null,
  "description": null,
  
  "filters": { 
    "category": null, 
    "period": "week", 
    "date": null, 
    "range": { "start": "2025-10-13", "end": "2025-10-19" } 
  }
}
`;

function parseDateRange(filters) {
  if (!filters) return [null, null];

  const now = new Date();
  const todayISO = now.toISOString().slice(0, 10);

  if (filters.period === "day") {
    return [todayISO, todayISO];
  }
  if (filters.period === "week") {
    const start = new Date(now);
    start.setDate(now.getDate() - 7);
    return [start.toISOString().slice(0, 10), todayISO];
  }
  if (filters.period === "month") {
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    return [start.toISOString().slice(0, 10), todayISO];
  }
  if (filters.period === "year") {
    const start = new Date(now.getFullYear(), 0, 1);
    return [start.toISOString().slice(0, 10), todayISO];
  }
  if (filters.range) {
    return [filters.range.start, filters.range.end];
  }

  return [null, null];
}

const actionHandlers = {
  addExpense: async (data, userId) => {
    const { amount, category, date, description } = data;
    console.log("Adding expense:", description, amount, category, date, userId);
    await addExpense(description, amount, category, date, userId);
    return `Expense of ${amount} added under category ${category}.`;
  },
  addIncome: async (data, userId) => {
    const { amount, category, date, description } = data;
    await addIncome(description, amount, category, date, userId);
    return `Income of ${amount} added under category ${category}.`;
  },
  searchExpenses: async (data, userId) => {
    const rows = await searchExpenses(userId, data.filters || {});
    return rows;
  },
  searchIncomes: async (data, userId) => {
    const rows = await searchIncomes(userId, data.filters || {});
    return rows;
  },
  getExpenseStats: async (data, userId) => {
    const [start, end] = parseDateRange(data.filters);
    const stats = await getExpenseStats(userId, start, end);
    return stats;
  },
  getIncomeStats: async (data, userId) => {
    const [start, end] = parseDateRange(data.filters);
    const stats = await getIncomeStats(userId, start, end);
    return stats;
  },
  getOverallStats: async (data, userId) => {
    const stats = await getOverallStats(userId);
    return stats;
  },
  getTotalBalance: async (data, userId) => {
    const balance = await getTotalBalance(userId);
    return { totalBalance: balance };
  },
};

function parseJSONSafe(text) {
  const cleaned = text
    .replace(/```json\s*([\s\S]*?)```/g, '$1')
    .replace(/```([\s\S]*?)```/g, '$1')
    .trim();

  return JSON.parse(cleaned);
}

async function interpretAICommand(message, userId) {
    
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const chat = model.startChat({
        history: [{ role: "user", parts: [{ text: systemPrompt }] }],
    });

    // Ensure we pass a string (or array/parts) to sendMessage. The SDK
    // throws 'request is not iterable' when given a plain object.
    let sendInput;
    if (typeof message === 'string') {
      sendInput = message;
    } else if (message && typeof message.text === 'string') {
      sendInput = message.text;
    } else {
      // Fallback: stringify the object so the model still receives something
      sendInput = JSON.stringify(message);
    }

    const result = await chat.sendMessage(sendInput);
    const text = result.response.text();

    let parsed;
    try {
        parsed = parseJSONSafe(text);
    } catch (e) {
        console.error("Failed to parse JSON from Gemini output:", text);
        throw new Error("Gemini response was not valid JSON");
    }
    const handler = actionHandlers[parsed.action];
    if (!handler) return `Sorry, I don't know how to handle action "${parsed.action}".`;

    return await handler(parsed, userId);
}

module.exports = { interpretAICommand };