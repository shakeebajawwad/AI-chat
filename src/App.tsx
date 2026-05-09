/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback } from "react";
import { Message, ChatSession, Theme } from "./types";
import Sidebar from "./components/Sidebar";
import ChatInterface from "./components/ChatInterface";
import { sendMessageStream } from "./lib/gemini";
import { v4 as uuidv4 } from "uuid";

export default function App() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [theme, setTheme] = useState<Theme>('dark');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Initialize data from local storage
  useEffect(() => {
    const savedSessions = localStorage.getItem("lumina_sessions");
    if (savedSessions) {
      const parsed = JSON.parse(savedSessions);
      setSessions(parsed);
      if (parsed.length > 0) {
        setActiveSessionId(parsed[0].id);
      }
    }

    const savedTheme = localStorage.getItem("lumina_theme") as Theme;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle('dark', savedTheme === 'dark');
    } else {
      document.documentElement.classList.add('dark');
    }
    
    // Auto-close sidebar on small screens
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  }, []);

  // Save sessions to local storage
  useEffect(() => {
    localStorage.setItem("lumina_sessions", JSON.stringify(sessions));
  }, [sessions]);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem("lumina_theme", newTheme);
    document.documentElement.classList.toggle('dark');
  };

  const handleNewChat = useCallback(() => {
    const newSession: ChatSession = {
      id: uuidv4(),
      title: "New Conversation",
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setSessions([newSession, ...sessions]);
    setActiveSessionId(newSession.id);
    if (window.innerWidth < 1024) setIsSidebarOpen(false);
  }, [sessions]);

  const handleDeleteSession = (id: string) => {
    const newSessions = sessions.filter(s => s.id !== id);
    setSessions(newSessions);
    if (activeSessionId === id) {
      setActiveSessionId(newSessions.length > 0 ? newSessions[0].id : null);
    }
  };

  const activeSession = sessions.find(s => s.id === activeSessionId) || null;

  const onSendMessage = async (content: string) => {
    if (!activeSessionId) {
      // Create a session if none exists
      const newId = uuidv4();
      const newSession: ChatSession = {
        id: newId,
        title: content.slice(0, 30) + (content.length > 30 ? "..." : ""),
        messages: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      setSessions([newSession, ...sessions]);
      setActiveSessionId(newId);
      processMessage(newId, content, []);
    } else {
      processMessage(activeSessionId, content, activeSession?.messages || []);
    }
  };

  const processMessage = async (sessionId: string, content: string, history: Message[]) => {
    const userMessage: Message = {
      id: uuidv4(),
      role: 'user',
      content,
      timestamp: Date.now(),
    };

    const assistantMessage: Message = {
      id: uuidv4(),
      role: 'assistant',
      content: "",
      timestamp: Date.now(),
    };

    // Update session with user message and empty assistant message
    setSessions(prev => prev.map(s => {
      if (s.id === sessionId) {
        const title = s.messages.length === 0 
          ? content.slice(0, 40) + (content.length > 40 ? "..." : "")
          : s.title;
        return {
          ...s,
          title,
          messages: [...s.messages, userMessage, assistantMessage],
          updatedAt: Date.now()
        };
      }
      return s;
    }));

    setIsLoading(true);
    let fullContent = "";

    try {
      const stream = sendMessageStream(content, history);
      for await (const chunk of stream) {
        fullContent += chunk;
        setSessions(prev => prev.map(s => {
          if (s.id === sessionId) {
            const messages = [...s.messages];
            const lastMessage = messages[messages.length - 1];
            if (lastMessage && lastMessage.role === 'assistant') {
              lastMessage.content = fullContent;
            }
            return { ...s, messages };
          }
          return s;
        }));
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred.";
      setSessions(prev => prev.map(s => {
        if (s.id === sessionId) {
          const messages = [...s.messages];
          const lastMessage = messages[messages.length - 1];
          if (lastMessage && lastMessage.role === 'assistant') {
            lastMessage.content = `Error: ${errorMessage}`;
          }
          return { ...s, messages };
        }
        return s;
      }));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden relative font-sans selection:bg-primary/10">
      {/* Decorative background elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500/5 blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-cyan-500/5 blur-[120px]"></div>
      </div>

      <Sidebar 
        sessions={sessions}
        activeSessionId={activeSessionId}
        theme={theme}
        onNewChat={handleNewChat}
        onSelectSession={(id) => {
          setActiveSessionId(id);
          if (window.innerWidth < 1024) setIsSidebarOpen(false);
        }}
        onDeleteSession={handleDeleteSession}
        onToggleTheme={toggleTheme}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
      />
      
      <main className="flex-1 flex flex-col min-w-0 h-full relative">
        <ChatInterface 
          messages={activeSession?.messages || []}
          isLoading={isLoading}
          onSendMessage={onSendMessage}
          onSelectPrompt={(prompt) => onSendMessage(prompt)}
        />
      </main>
    </div>
  );
}

