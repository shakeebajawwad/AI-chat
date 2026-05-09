import { Message } from "../types";

export async function* sendMessageStream(prompt: string, history: Message[] = []) {
  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt, history }),
    });

    if (!response.ok) {
      let errorMessage = "Failed to connect to Lumina AI.";
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorMessage;
      } catch (e) {
        errorMessage = `Server Error (${response.status}): The API key may not be correctly configured on the server.`;
      }
      throw new Error(errorMessage);
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    if (!reader) throw new Error("Connection lost. Please try again.");

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      yield decoder.decode(value, { stream: true });
    }
  } catch (error: any) {
    console.error("Chat Interaction Error:", error);
    throw error;
  }
}
