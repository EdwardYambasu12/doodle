import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());


// ✅ Chat endpoint using POST
// Frontend should send: { messages: [...] }

console.log("Chat endpoint is set up at /api/chat");
app.post("/api/chat", async (req, res) => {
  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ message: "Missing or invalid 'messages' array in request body." });
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
         {
  role: "system",
  content:
    "You are a structured symptom checker. Ask one question at a time, and always base your next question on the user's previous answer. " +
    "When you have gathered enough information, begin your final response with the phrase: 'Based on your symptoms,' followed by your analysis and recommendations. " +
    "This phrase signals that you are done collecting data and ready to summarize. " +
    "Keep responses concise and medically relevant. If unsure, advise the user to consult a healthcare professional."
},
          ...messages,
        ],
      }),
    });

    const data = await response.json();

    const aiReply = data.choices?.[0]?.message?.content || "I couldn’t process your input, please try again.";
    res.json({ message: aiReply });
  } catch (error) {
    console.error("❌ Chat error:", error);
    res.status(500).json({ message: "Server error, please try again." });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));