import { useState, useRef, useEffect } from "react";
import { Send, Sparkles, Mic, Paperclip, ChevronDown, RefreshCw, Search, Bot } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Message } from "../types";
import MessageItem from "./MessageItem";
import LandingPage from "./LandingPage";
import { cn } from "../lib/utils";

interface ChatInterfaceProps {
  messages: Message[];
  isLoading: boolean;
  onSendMessage: (content: string) => void;
  onSelectPrompt: (prompt: string) => void;
}

export default function ChatInterface({
  messages,
  isLoading,
  onSendMessage,
  onSelectPrompt
}: ChatInterfaceProps) {
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth"
      });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;
    onSendMessage(input);
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
      inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 200)}px`;
    }
  }, [input]);

  return (
    <div className="flex-1 flex flex-col relative h-full bg-background mt-4 lg:mt-0">
      {/* Header */}
      <header className="h-16 px-6 flex items-center justify-between border-b border-border bg-[#151921CC] backdrop-blur-md sticky top-0 z-30">
        <div className="flex items-center gap-2 lg:hidden">
          <div className="w-7 h-7 rounded-lg bg-accent-gradient flex items-center justify-center">
             <span className="text-white font-bold text-xs text-center">L</span>
          </div>
          <span className="font-bold text-lg tracking-tight">Lumina AI</span>
        </div>
        <div className="hidden lg:flex items-center gap-2">
           <div className="bg-glass-bg px-3 py-1.5 rounded-full border border-border text-xs flex items-center gap-2 text-muted-foreground">
              <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
              <span>Nexus-4 Turbo</span>
              <ChevronDown className="w-3 h-3" />
           </div>
        </div>
        <div className="flex items-center gap-4">
           <Search className="w-5 h-5 text-muted-foreground cursor-pointer" />
           <RefreshCw className="w-5 h-5 text-muted-foreground cursor-pointer" />
        </div>
      </header>

      {/* Messages View */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto pt-8 pb-48"
      >
        {messages.length === 0 ? (
          <LandingPage onSelectPrompt={onSelectPrompt} />
        ) : (
          <div className="max-w-5xl mx-auto w-full">
            {messages.map((message) => (
              <MessageItem key={message.id} message={message} />
            ))}
            {isLoading && (
              <div className="px-6 md:px-20 py-4">
                <div className="flex gap-4">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-accent-gradient flex-shrink-0">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                  <div className="glass p-4 rounded-2xl rounded-tl-none border border-border">
                    <div className="flex gap-1.5 py-2">
                      <div className="w-2 h-2 rounded-full bg-white/30 animate-bounce [animation-delay:-0.3s]"></div>
                      <div className="w-2 h-2 rounded-full bg-white/30 animate-bounce [animation-delay:-0.15s]"></div>
                      <div className="w-2 h-2 rounded-full bg-white/30 animate-bounce"></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Controls Overlay */}
      <AnimatePresence>
        {messages.length > 5 && (
           <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            onClick={scrollToBottom}
            className="absolute bottom-44 right-1/2 translate-x-1/2 p-2 rounded-full glass border border-border shadow-lg text-foreground/70 hover:text-foreground transition-all z-20"
           >
            <ChevronDown className="w-5 h-5" />
           </motion.button>
        )}
      </AnimatePresence>

      {/* Input Area */}
      <div className="fixed lg:absolute bottom-0 left-0 right-0 p-6 md:p-10 bg-gradient-to-t from-background via-background to-transparent pt-20 z-30 pointer-events-none">
        <div className="max-w-5xl mx-auto w-full pointer-events-auto">
          {/* Suggestions block */}
          {messages.length > 0 && messages.length < 4 && (
            <div className="flex gap-3 justify-center mb-6 overflow-x-auto pb-2 no-scrollbar">
              <button 
                onClick={() => onSelectPrompt("Tell me more about this")}
                className="glass px-4 py-2 rounded-full border border-border text-xs text-muted-foreground hover:border-primary hover:text-white transition-all whitespace-nowrap"
              >
                Tell me more about this
              </button>
              <button 
                onClick={() => onSelectPrompt("Give me an example")}
                className="glass px-4 py-2 rounded-full border border-border text-xs text-muted-foreground hover:border-primary hover:text-white transition-all whitespace-nowrap"
              >
                Give me an example
              </button>
            </div>
          )}

          <form 
            onSubmit={handleSubmit}
            className="glass rounded-2xl border border-border shadow-input focus-within:border-primary/50 transition-all p-3"
          >
            <div className="flex items-center gap-3">
              <button 
                type="button"
                className="p-2 text-muted-foreground hover:text-foreground transition-all"
                title="Attach"
              >
                <Paperclip className="w-5 h-5" />
              </button>
              
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask anything..."
                rows={1}
                className="flex-1 bg-transparent border-none outline-none py-2 text-foreground font-medium text-base placeholder:text-muted-foreground/60 resize-none no-scrollbar"
              />

              <div className="flex items-center gap-3">
                <button 
                  type="button"
                  className="p-2 text-muted-foreground hover:text-foreground hidden sm:block"
                  title="Voice input"
                >
                  <Mic className="w-5 h-5" />
                </button>
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className={cn(
                    "p-2 rounded-lg transition-all active:scale-95",
                    input.trim() && !isLoading 
                      ? "bg-accent-gradient text-white shadow-accent" 
                      : "bg-muted text-muted-foreground cursor-not-allowed opacity-50"
                  )}
                >
                  <Send className={cn("w-5 h-5", isLoading && "animate-pulse")} />
                </button>
              </div>
            </div>
          </form>
          <p className="text-[11px] text-center text-muted-foreground mt-4 font-medium">
            Nexus AI can make mistakes. Check important info.
          </p>
        </div>
      </div>
    </div>
  );
}
