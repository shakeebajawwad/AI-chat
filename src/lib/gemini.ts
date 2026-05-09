import { GoogleGenAI } from "@google/genai";
import { Message } from "../types";

// The API key is injected via vite.config.ts define
const getApiKey = () => {
  return process.env.GEMINI_API_KEY || "";
};

export async function* sendMessageStream(prompt: string, history: Message[] = []) {
  const apiKey = getApiKey();
  
  if (!apiKey) {
    throw new Error("Lumina AI: No API key found. Please ensure 'Gemini API' is selected in the Secrets panel and REFRESH the page.");
  }

  const ai = new GoogleGenAI({ apiKey });

  try {
    // Format history for the contents array
    const contents = history.map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));

    // Add the current prompt
    contents.push({
      role: 'user',
      parts: [{ text: prompt }]
    });

    // Use the exact method from the gemini-api skill
    const stream = await ai.models.generateContentStream({
      model: "gemini-3-flash-preview",
      contents: contents,
      config: {
        systemInstruction: "You are Lumina AI, a highly intelligent, helpful, and professional AI assistant. You provide accurate, conversational, and context-aware responses. Maintain a polite and aesthetically pleasing tone. Developed by Google AI Studio.",
      },
    });

    for await (const chunk of stream) {
      if (chunk.text) {
        yield chunk.text;
      }
    }
  } catch (error: any) {
    console.error("Lumina AI SDK Error:", error);
    
    const msg = error.message || "";
    if (msg.includes("API key not valid") || msg.includes("INVALID_ARGUMENT") || error.status === 400) {
      throw new Error("Lumina AI: The API key provided is invalid. This can happen if the key is not correctly selected in AI Studio's Secrets panel or if there is a quota limit.");
    }
    
    throw new Error(error.message || "An error occurred during AI generation.");
  }
}
