const express = require("express");
const router = express.Router();
const Groq = require("groq-sdk");
const auth = require("../middleware/auth");
const Dataset = require("../models/Dataset");

let groq = null;
if (process.env.GROQ_API_KEY) {
  groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
}

router.post("/ask", auth, async (req, res) => {
  try {
    if (!groq) return res.status(500).json({ message: "Groq API key not configured" });

    const { question, datasetId } = req.body;
    console.log("AI REQUEST - question:", question, "datasetId:", datasetId);

    const dataset = await Dataset.findOne({ _id: datasetId, userId: req.user.id });
    console.log("DATASET FOUND:", dataset ? "yes" : "no");
    if (!dataset) return res.status(404).json({ message: "Dataset not found" });

    const dataSummary = `
      Dataset: ${dataset.originalName}
      Columns: ${dataset.columns.join(", ")}
      Total Rows: ${dataset.rows.length}
      Sample Data: ${JSON.stringify(dataset.rows.slice(0, 50))}
    `;

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: `You are SAPSight AI Copilot, an expert business analyst. 
          Analyze business data and provide clear insights with actual numbers.
          Be direct and professional.`
        },
        {
          role: "user",
          content: `Data:\n${dataSummary}\n\nQuestion: ${question}`
        }
      ],
      temperature: 0.3,
      max_tokens: 1024
    });

    const reply = completion.choices[0].message.content;
    res.json({ reply });

  } catch (err) {
    console.error("AI ROUTE ERROR:", err.message);
    console.error("FULL ERROR:", err);
    res.status(500).json({ message: "AI error", error: err.message });
  }
});

module.exports = router;