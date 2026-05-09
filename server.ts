import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Use JSON middleware for API routes
  app.use(express.json());

  // Priority API route for chat
  app.post("/api/chat", async (req, res) => {
    const { prompt, history } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      console.error("GEMINI_API_KEY is missing in server environment.");
      return res.status(500).json({ error: "GEMINI_API_KEY is not configured on the server. Please check the Secrets panel in AI Studio." });
    }

    try {
      const genAI = new GoogleGenAI(apiKey);
      const model = genAI.getGenerativeModel({ 
        model: "gemini-1.5-flash",
        systemInstruction: "You are Lumina AI, a highly intelligent, helpful, and professional AI assistant. You provide accurate, conversational, and context-aware responses. Maintain a polite and aesthetically pleasing tone. If asked about your identity, you are Lumina AI developed by Google AI Studio.",
      });

      const formattedHistory = (history || []).map((msg: any) => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }]
      }));

      const chat = model.startChat({ history: formattedHistory });
      const result = await chat.sendMessageStream(prompt);

      // Set headers for streaming text
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.setHeader('Transfer-Encoding', 'chunked');

      for await (const chunk of result.stream) {
        const chunkText = chunk.text();
        res.write(chunkText);
      }

      res.end();
    } catch (error: any) {
      console.error("Gemini API Error:", error);
      if (!res.headersSent) {
        res.status(500).json({ error: error.message || "An error occurred during AI generation." });
      } else {
        res.end();
      }
    }
  });

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", env: !!process.env.GEMINI_API_KEY });
  });

  // Vite middleware for dev / static files for prod
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { 
        middlewareMode: true,
        host: '0.0.0.0',
        port: 3000
      },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
