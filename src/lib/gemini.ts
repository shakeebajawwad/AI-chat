import { GoogleGenAI } from "@google/genai";
import { Message } from "../types";

const apiKey = process.env.GEMINI_API_KEY || "";
const ai = new GoogleGenAI({ apiKey });

export async function* sendMessageStream(prompt: string, history: Message[] = []) {
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set. Please add it to your environment or Secrets panel.");
  }

  // Format history for Gemini API
  const formattedHistory = history.map(msg => ({
    role: msg.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: msg.content }]
  }));

  try {
    // Using the simplified chat creation as per the gemini-api skill
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
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
}
