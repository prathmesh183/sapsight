const express = require("express");
const router = express.Router();
const Groq = require("groq-sdk");
const auth = require("../middleware/auth");
const Dataset = require("../models/dataset");

let groq = null;
if (process.env.GROQ_API_KEY) {
  groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
}

router.post("/chat", auth, async (req, res) => {
  try {
   if (!groq) return res.status(500).json({ message: "Groq API key not configured yet" });
const { message, datasetId } = req.body;

    // Get the dataset
    const dataset = await Dataset.findOne({ _id: datasetId, userId: req.user.id });
    if (!dataset) return res.status(404).json({ message: "Dataset not found" });

    // Prepare data summary for Groq
    const dataSummary = `
      Dataset: ${dataset.originalName}
      Columns: ${dataset.columns.join(", ")}
      Total Rows: ${dataset.rows.length}
      Sample Data (first 50 rows): ${JSON.stringify(dataset.rows.slice(0, 50))}
      Full Data: ${JSON.stringify(dataset.rows)}
    `;

    const completion = await groq.chat.completions.create({
      model: "llama3-70b-8192",
      messages: [
        {
          role: "system",
          content: `You are SAPSight AI Copilot — an expert business analyst assistant similar to SAP Joule. 
          You analyze business data and provide clear, concise insights with actual numbers from the data.
          Always back your answers with specific figures from the dataset.
          Format numbers clearly (e.g., $1,234,567 or 1.2M).
          Be direct and professional like a senior SAP consultant.`
        },
        {
          role: "user",
          content: `Here is the business data you need to analyze:\n${dataSummary}\n\nUser Question: ${message}`
        }
      ],
      temperature: 0.3,
      max_tokens: 1024
    });

    const reply = completion.choices[0].message.content;
    res.json({ reply });

  } catch (err) {
    res.status(500).json({ message: "AI error", error: err.message });
  }
});

module.exports = router;