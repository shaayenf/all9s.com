// server.ts
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
dotenv.config();
var __filename = fileURLToPath(import.meta.url);
var __dirname = path.dirname(__filename);
var app = express();
var PORT = parseInt(process.env.PORT || "3000", 10);
app.use(express.json());
app.get(["/healthz", "/api/health"], (_req, res) => {
  res.status(200).json({
    status: "ok",
    service: "All9s Edexcel IGCSE Terminal",
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  });
});
app.post("/api/ai/ask", async (req, res) => {
  try {
    const { message, nickname, subject } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({
        error: "GEMINI_API_KEY is not configured on the server."
      });
    }
    const ai = new GoogleGenAI({ apiKey });
    const systemPrompt = `You are Opencode, an encouraging and rigorous Edexcel IGCSE academic tutor on the All9s terminal. Address the candidate as ${nickname || "Candidate"}. Focus strictly on official Edexcel IGCSE syllabus standards (Grade 9 target). Subject context: ${subject || "General IGCSE Revision"}. Keep answers concise, clear, and structured with key formulas and mark scheme points where relevant.`;
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: message,
      config: {
        systemInstruction: systemPrompt
      }
    });
    return res.json({ reply: response.text });
  } catch (error) {
    console.error("[Gemini API Proxy Error]:", error);
    return res.status(500).json({ error: error?.message || "Failed to generate response" });
  }
});
var distPath = path.resolve(__dirname, "dist");
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get("*", (_req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
} else {
  app.get("*", (_req, res) => {
    res.status(200).send("All9s Production Server is starting. Dist assets loading...");
  });
}
app.listen(PORT, "0.0.0.0", () => {
  console.log(`[All9s Server] Running on http://0.0.0.0:${PORT} in ${process.env.NODE_ENV || "production"} mode`);
});
