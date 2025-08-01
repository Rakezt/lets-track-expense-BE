// controllers/expensesController.js
const axios = require('axios');
const Expense = require('../models/expenses');

exports.analyzeExpenses = async (req, res) => {
  let expenses = req.body.expenses;
  const query = req.body.query?.toLowerCase?.().trim();

  // 1️⃣ Load from DB if `query` provided
  if (!Array.isArray(expenses)) {
    if (!query) {
      return res
        .status(400)
        .json({ error: 'Provide `expenses` array or `query` string' });
    }
    const filter = { user: req.userId };
    if (query.includes('july')) {
      filter.date = {
        $gte: new Date('2025-07-01'),
        $lt: new Date('2025-08-01'),
      };
    }
    expenses = await Expense.find(filter).lean();
    if (!expenses.length) {
      return res
        .status(404)
        .json({ error: 'No expenses found for that query' });
    }
  }

  // 2️⃣ Render expenses as plain text for summarization
  const textToSummarize = expenses
    .map(
      (e) =>
        `On ${new Date(e.date).toLocaleDateString()}, ${e.category} ₹${
          e.amount
        }.`
    )
    .join(' ');

  // 3️⃣ Call Gemini API for analysis
  try {
    const geminiRes = await axios.post(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
      {
        contents: [
          {
            parts: [
              {
                text: `Here are my recent expenses:\n\n${textToSummarize}\n\nPlease summarize where I’m overspending and give two actionable tips to improve my budget`,
              },
            ],
          },
        ],
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-goog-api-key': process.env.GEMINI_API_KEY,
        },
      }
    );

    // Gemini returns candidates[].content.parts[].text
    const insight =
      geminiRes.data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ||
      'No insight generated';

    return res.json({ insight });
  } catch (err) {
    console.error('Gemini analysis error status:', err.response?.status);
    console.error(
      'Gemini analysis error data:',
      err.response?.data || err.message
    );
    return res
      .status(500)
      .json({ error: 'AI analysis failed', details: err.response?.data });
  }
};
