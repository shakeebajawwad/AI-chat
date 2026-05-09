import { GoogleGenAI } from "@google/genai";
import { Message } from "../types";

// The API key is injected via vite.config.ts define.
// We use a getter to ensure it's evaluated when needed, 
// though with Vite define it's usually static replacement.
const getApiKey = () => {
  return process.env.GEMINI_API_KEY || (import.meta as any).env?.VITE_GEMINI_API_KEY || "";
};

export async function* sendMessageStream(prompt: string, history: Message[] = []) {
  const apiKey = getApiKey();
  
  if (!apiKey) {
    throw new Error("Lumina AI is not configured. Please ensure your GEMINI_API_KEY is active in the Secrets panel and then REFRESH the page.");
  }

  // Initialize the SDK with the key
  const ai = new GoogleGenAI({ apiKey });

  try {
    // Model selection based on gemini-api skill
    const chat = ai.chats.create({
      model: "gemini-3-flash-preview",
      config: {
        systemInstruction: "You are Lumina AI, a highly intelligent, helpful, and professional AI assistant. You provide accurate, conversational, and context-aware responses. Maintain a polite and aesthetically pleasing tone.",
      },
      history: history.map(msg => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }]
      })),
    });

    const streamResponse = await chat.sendMessageStream({
      message: prompt,
    });

    for await (const chunk of streamResponse) {
      if (chunk.text) {
        yield chunk.text;
      }
    }
  } catch (error: any) {
    console.error("Lumina AI Error:", error);
    
    const msg = error.message || "";
    if (msg.includes("API key not valid") || msg.includes("INVALID_ARGUMENT") || error.status === 400) {
      throw new Error("Lumina AI: The API key provided appears to be invalid. Please check your Secrets selection in AI Studio.");
    }
    
    throw new Error(error.message || "Lumina AI encountered an unexpected error. Please try again.");
  }
}
