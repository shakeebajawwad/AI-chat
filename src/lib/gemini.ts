import { GoogleGenAI } from "@google/genai";
import { Message } from "../types";

// The API key is injected via vite.config.ts define
const apiKey = process.env.GEMINI_API_KEY || "";
const ai = new GoogleGenAI({ apiKey });

export async function* sendMessageStream(prompt: string, history: Message[] = []) {
  if (!apiKey) {
    throw new Error("Lumina AI is not configured. Please ensure your GEMINI_API_KEY is active in the Secrets panel and REFRESH the page.");
  }

  try {
    // Format history for the Gemini SDK
    const formattedHistory = history.map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));

    // Use the correct methods as per gemini-api skill
    const chat = ai.chats.create({
      model: "gemini-3-flash-preview",
      config: {
        systemInstruction: "You are Lumina AI, a highly intelligent, helpful, and professional AI assistant. You provide accurate, conversational, and context-aware responses. Maintain a polite and aesthetically pleasing tone.",
      },
      history: formattedHistory,
    });

    const streamResponse = await chat.sendMessageStream({
      message: prompt,
    });

    for await (const chunk of streamResponse) {
      // chunk.text is a property in @google/genai
      if (chunk.text) {
        yield chunk.text;
      }
    }
  } catch (error: any) {
    console.error("Lumina AI Error:", error);
    
    const msg = error.message || "";
    if (msg.includes("API key not valid") || msg.includes("INVALID_ARGUMENT")) {
      throw new Error("Lumina AI: The API key provided is invalid. Please check your Secrets selection in AI Studio.");
    }
    
    throw new Error(error.message || "An error occurred while generating a response.");
  }
}
