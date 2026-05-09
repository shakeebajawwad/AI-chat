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
      // CORRECT INITIALIZATION: { apiKey }
      const ai = new GoogleGenAI({ apiKey });
      
      // The skill says to use ai.chats.create
      const formattedHistory = (history || []).map((msg: any) => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }]
      }));

      const chat = ai.chats.create({
        model: "gemini-3-flash-preview",
        config: {
          systemInstruction: "You are Lumina AI, a highly intelligent, helpful, and professional AI assistant. You provide accurate, conversational, and context-aware responses. Maintain a polite and aesthetically pleasing tone. If asked about your identity, you are Lumina AI developed by Google AI Studio.",
        },
        history: formattedHistory,
      });

      const result = await chat.sendMessageStream({
        message: prompt,
      });

      // Set headers for streaming text
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.setHeader('Transfer-Encoding', 'chunked');

      for await (const chunk of result) {
        if (chunk.text) {
          res.write(chunk.text);
        }
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

  // Health check to verify environment
  app.get("/api/health", (req, res) => {
    res.json({ 
      status: "ok", 
      hasKey: !!process.env.GEMINI_API_KEY,
      nodeEnv: process.env.NODE_ENV
    });
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
    if (process.env.GEMINI_API_KEY) {
      console.log("GEMINI_API_KEY is detected.");
    } else {
      console.warn("GEMINI_API_KEY is NOT detected. Please check Secrets.");
    }
  });
}

startServer();
