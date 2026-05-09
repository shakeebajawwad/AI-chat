import { GoogleGenAI } from "@google/genai";
import { Message } from "../types";

// In Vite, process.env is replaced at build time via the define config in vite.config.ts.
const getApiKey = () => {
  try {
    return process.env.GEMINI_API_KEY || "";
  } catch (e) {
    return "";
  }
};

export async function* sendMessageStream(prompt: string, history: Message[] = []) {
  const apiKey = getApiKey();
  
  if (!apiKey) {
    throw new Error("Lumina AI is not configured. Please ensure your GEMINI_API_KEY is active in the Secrets panel and REFRESH the page to apply changes.");
  }

  // Proper initialization using the modern SDK
  const ai = new GoogleGenAI({ apiKey });

  // Format history for the Gemini SDK
  const formattedHistory = history.map(msg => ({
    role: msg.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: msg.content }]
  }));

  try {
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
      if (chunk.text) {
        yield chunk.text;
      }
    }
  } catch (error: any) {
    console.error("Lumina AI Error:", error);
    
    // Explicitly handle common API errors mapping to the "Dirty Dozen" or typical failures
    const msg = error.message || "";
    if (msg.includes("API key not valid") || msg.includes("INVALID_ARGUMENT") || error.status === 400) {
      throw new Error("Lumina AI: The API key provided appears to be invalid. Please check your Secrets selection in AI Studio.");
    }
    
    throw new Error(error.message || "Lumina AI encountered an unexpected error. Please try again.");
  }
}
