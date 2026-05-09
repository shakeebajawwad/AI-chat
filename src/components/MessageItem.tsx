import { motion } from "motion/react";
import ReactMarkdown from "react-markdown";
import { User, Bot, Copy, Check, Share2 } from "lucide-react";
import { useState } from "react";
import { Message } from "../types";
import { cn, formatTimestamp } from "../lib/utils";

interface MessageItemProps {
  message: Message;
}

export default function MessageItem({ message }: MessageItemProps) {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === 'user';

  const copyToClipboard = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "flex w-full gap-4 px-6 md:px-20 py-4 group",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
    >
      <div className="flex-shrink-0">
        <div className={cn(
          "w-9 h-9 rounded-lg flex items-center justify-center shadow-sm",
          isUser ? "bg-[#334155] text-white" : "bg-accent-gradient text-white"
        )}>
          {isUser ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
        </div>
      </div>
      
      <div className={cn(
        "flex-1 min-w-0 flex flex-col",
        isUser ? "items-end" : "items-start"
      )}>
        <div className={cn(
          "bubble p-4 rounded-2xl text-[15px] leading-relaxed",
          isUser 
            ? "bg-accent-gradient text-white rounded-tr-none shadow-accent" 
            : "glass text-[#E2E8F0] rounded-tl-none border border-border"
        )}>
          {message.content ? (
            <div className="prose prose-invert prose-p:leading-relaxed prose-pre:bg-secondary/50 prose-pre:border prose-pre:border-border prose-code:text-primary max-w-none">
              <ReactMarkdown>{message.content}</ReactMarkdown>
            </div>
          ) : (
            <div className="flex gap-1.5 py-2">
              <div className="w-2 h-2 rounded-full bg-white/30 animate-bounce [animation-delay:-0.3s]"></div>
              <div className="w-2 h-2 rounded-full bg-white/30 animate-bounce [animation-delay:-0.15s]"></div>
              <div className="w-2 h-2 rounded-full bg-white/30 animate-bounce"></div>
            </div>
          )}
        </div>

        <div className={cn(
          "flex items-center gap-2 mt-2 px-1",
          isUser && "flex-row-reverse"
        )}>
          <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
            {formatTimestamp(message.timestamp)}
          </span>
          {!isUser && message.content && (
            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={copyToClipboard}
                className="text-muted-foreground hover:text-foreground transition-all"
                title="Copy"
              >
                {copied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
