import { GoogleGenAI } from "@google/genai";
import { Message } from "../types";

// In Vite, process.env is replaced at build time via the define config in vite.config.ts
const apiKey = process.env.GEMINI_API_KEY || "";
const ai = new GoogleGenAI({ apiKey });

export async function* sendMessageStream(prompt: string, history: Message[] = []) {
  if (!apiKey) {
    throw new Error("Lumina AI is not configured. Please ensure the GEMINI_API_KEY is active in the Secrets panel and refresh.");
  }

  // Format history for the Gemini SDK
  const formattedHistory = history.map(msg => ({
    role: msg.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: msg.content }]
  }));

  try {
    // Model selection based on gemini-api skill for basic text/chat tasks
    const chat = ai.chats.create({
      model: "gemini-3-flash-preview",
      config: {
        systemInstruction: "You are Lumina AI, a highly intelligent, helpful, and professional AI assistant. You provide accurate, conversational, and context-aware responses. Maintain a polite and aesthetically pleasing tone. If asked about your identity, you are Lumina AI developed by Google AI Studio.",
      },
      history: formattedHistory,
    });

    const streamResponse = await chat.sendMessageStream({
      message: prompt,
    });

    for await (const chunk of streamResponse) {
      // Accessing chunk.text directly (it's a getter, do not call as a function)
      if (chunk.text) {
        yield chunk.text;
      }
    }
  } catch (error: any) {
    console.error("Lumina AI Error:", error);
    
    // Check for specific error types to provide better user feedback
    if (error.message?.includes("API key not valid") || error.status === 403) {
      throw new Error("Lumina AI: The API key in your Secrets panel seems invalid. Please check your AI Studio settings.");
    }
    
    throw new Error(error.message || "Lumina AI encountered an unexpected error. Please try again.");
  }
}
