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

  // API route for chat interaction
  app.post("/api/chat", async (req, res) => {
    const { prompt, history } = req.body;
    
    // Check both possible names for the API key in AI Studio
    const apiKey = process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEYS;

    if (!apiKey) {
      return res.status(500).json({ 
        error: "Lumina AI is not configured. No GEMINI_API_KEY found on the server. Please ensure a key is selected in the Secrets panel." 
      });
    }

    try {
      const ai = new GoogleGenAI({ apiKey });
      
      // Use the modern chat API from the @google/genai SDK
      const chat = ai.chats.create({
        model: "gemini-3-flash-preview",
        config: {
          systemInstruction: "You are Lumina AI, a highly intelligent, helpful, and professional AI assistant. You provide accurate, conversational, and context-aware responses. Maintain a polite and aesthetically pleasing tone. You are developed by Google AI Studio.",
        },
        history: (history || []).map((msg: any) => ({
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: msg.content }]
        })),
      });

      const responseStream = await chat.sendMessageStream({
        message: prompt,
      });

      // Stream the response back to the client
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.setHeader('Transfer-Encoding', 'chunked');

      for await (const chunk of responseStream) {
        // chunk.text is a property, not a function in the new SDK
        if (chunk.text) {
          res.write(chunk.text);
        }
      }

      res.end();
    } catch (error: any) {
      console.error("Gemini API Server Error:", error);
      const statusCode = error.status || 500;
      const message = error.message || "An error occurred during AI generation.";
      
      if (!res.headersSent) {
        res.status(statusCode).json({ error: message });
      } else {
        res.end();
      }
    }
  });

  // Health check to verify key presence on server
  app.get("/api/health", (req, res) => {
    res.json({ 
      status: "ok", 
      hasKey: !!(process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEYS),
      keyNames: Object.keys(process.env).filter(k => k.startsWith('GEMINI'))
    });
  });

  // Setup Vite middleware for dev or serve dist for production
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
  });
}

startServer();
