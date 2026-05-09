import { GoogleGenAI } from "@google/genai";
import { Message } from "../types";

// Note: In Vite, process.env is replaced at build time (or via define). 
// The platform handles injecting GEMINI_API_KEY into the environment.
const apiKey = process.env.GEMINI_API_KEY || "";
const ai = new GoogleGenAI({ apiKey });

export async function* sendMessageStream(prompt: string, history: Message[] = []) {
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set. Please add it to the Secrets panel in AI Studio.");
  }

  // Format history for Gemini API as per skill requirements
  const formattedHistory = history.map(msg => ({
    role: msg.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: msg.content }]
  }));

  try {
    // Create a chat session using the modern @google/genai pattern
    const chat = ai.chats.create({
      model: "gemini-3-flash-preview",
      config: {
        systemInstruction: "You are Lumina AI, a highly intelligent, helpful, and professional AI assistant. You provide accurate, conversational, and context-aware responses. Maintain a polite and aesthetically pleasing tone. If asked about your identity, you are Lumina AI developed by Google AI Studio.",
      },
      history: formattedHistory,
    });

    // Send the message and handle the stream
    const streamResponse = await chat.sendMessageStream({
      message: prompt,
    });

    for await (const chunk of streamResponse) {
      if (chunk.text) {
        // According to the skill, chunk.text is a property, not a method
        yield chunk.text;
      }
    }
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    if (error?.message?.includes("API key not valid")) {
      throw new Error("The API key provided is invalid. Please check your Secrets in AI Studio.");
    }
    throw new Error(error.message || "Failed to generate response. Please try again.");
  }
}
