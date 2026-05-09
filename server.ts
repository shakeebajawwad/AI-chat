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

  app.use(express.json());

  // API route for Gemini interaction
  app.post("/api/chat", async (req, res) => {
    const { prompt, history } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      console.error("DEBUG: GEMINI_API_KEY is null or undefined in server process.");
      return res.status(500).json({ 
        error: "GEMINI_API_KEY is not found on the server. Please ensure you have selected a key in the Secrets panel and that it is active." 
      });
    }

    try {
      // Correct initialization using the @google/genai syntax from the skill
      const ai = new GoogleGenAI({ apiKey });
      
      const formattedHistory = (history || []).map((msg: any) => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }]
      }));

      // Use the modern chat API
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

      // Stream the response back to the client
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.setHeader('Transfer-Encoding', 'chunked');

      for await (const chunk of result) {
        if (chunk.text) {
          res.write(chunk.text);
        }
      }

      res.end();
    } catch (error: any) {
      console.error("Gemini Server Error:", error);
      if (!res.headersSent) {
        res.status(500).json({ error: error.message || "An error occurred during AI generation." });
      } else {
        res.end();
      }
    }
  });

  // Environment health check
  app.get("/api/health", (req, res) => {
    res.json({ 
      status: "ok", 
      hasKey: !!process.env.GEMINI_API_KEY,
      keyLength: process.env.GEMINI_API_KEY?.length || 0,
      envKeys: Object.keys(process.env).filter(k => k.includes('GEMINI'))
    });
  });

  // Setup Vite middleware
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
    console.log(`Server listening on port ${PORT}`);
    if (process.env.GEMINI_API_KEY) {
      console.log("GEMINI_API_KEY is present in the environment.");
    } else {
      console.error("GEMINI_API_KEY is MISSING in the environment.");
    }
  });
}

startServer();
