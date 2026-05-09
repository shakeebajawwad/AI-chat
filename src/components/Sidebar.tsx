import { motion, AnimatePresence } from "motion/react";
import { 
  Plus, 
  MessageSquare, 
  Settings, 
  Trash2, 
  Search, 
  Moon, 
  Sun,
  PanelLeftClose,
  PanelLeftOpen,
  HelpCircle,
  LogOut
} from "lucide-react";
import { Theme, ChatSession } from "../types";
import { cn } from "../lib/utils";
import { useState } from "react";

interface SidebarProps {
  sessions: ChatSession[];
  activeSessionId: string | null;
  theme: Theme;
  onNewChat: () => void;
  onSelectSession: (id: string) => void;
  onDeleteSession: (id: string) => void;
  onToggleTheme: () => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export default function Sidebar({
  sessions,
  activeSessionId,
  theme,
  onNewChat,
  onSelectSession,
  onDeleteSession,
  onToggleTheme,
  isOpen,
  setIsOpen
}: SidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredSessions = sessions.filter(s => 
    s.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      {/* Mobile Backdrop */}
      <AnimatePresence>
        {!isOpen && (
          <button 
            onClick={() => setIsOpen(true)}
            className="fixed top-4 left-4 z-50 lg:hidden p-2 rounded-xl glass shadow-lg text-foreground transition-transform hover:scale-105 active:scale-95"
          >
            <PanelLeftOpen className="w-5 h-5" />
          </button>
        )}
      </AnimatePresence>

      <motion.aside
        initial={false}
        animate={{ 
          width: isOpen ? 300 : 0,
          x: isOpen ? 0 : -300,
          opacity: isOpen ? 1 : 0
        }}
        className={cn(
          "fixed top-0 left-0 h-full z-40 bg-card border-r border-border/60 transition-all overflow-hidden flex flex-col pt-4 shadow-2xl lg:shadow-none lg:relative",
          !isOpen && "lg:hidden"
        )}
      >
        <div className="px-4 mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2 px-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">L</span>
            </div>
            <span className="font-bold text-xl tracking-tight text-foreground">Lumina AI</span>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground lg:hidden"
          >
            <PanelLeftClose className="w-5 h-5" />
          </button>
          <button 
            onClick={() => setIsOpen(false)}
            className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hidden lg:block"
          >
            <PanelLeftClose className="w-5 h-5" />
          </button>
        </div>

        <div className="px-4 mb-4">
          <button
            onClick={onNewChat}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-accent-gradient text-white font-semibold transition-all hover:opacity-90 active:scale-[0.98] shadow-accent"
          >
            <Plus className="w-5 h-5 stroke-[2.5]" />
            New Chat
          </button>
        </div>

        <div className="px-4 mb-2">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <input 
              type="text"
              placeholder="Search chats..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-glass-bg border border-border focus:border-primary/50 rounded-xl py-2 pl-10 pr-4 text-sm outline-none transition-all text-foreground"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-2 space-y-1">
          <div className="px-3 py-2 text-[10px] uppercase tracking-widest font-semibold text-muted-foreground">
            Recent Conversations
          </div>
          {filteredSessions.length === 0 ? (
            <div className="px-4 py-12 text-center">
              <MessageSquare className="w-8 h-8 mx-auto text-muted-foreground/20 mb-2" />
              <p className="text-xs text-muted-foreground">No chats found</p>
            </div>
          ) : (
            filteredSessions.map((session) => (
              <div 
                key={session.id}
                className={cn(
                  "group relative rounded-xl transition-all duration-200",
                  activeSessionId === session.id 
                    ? "bg-muted text-foreground" 
                    : "hover:bg-muted/50 text-muted-foreground hover:text-foreground"
                )}
              >
                <button
                  onClick={() => onSelectSession(session.id)}
                  className="w-full text-left px-3 py-3 pr-10 flex items-center gap-3 truncate text-sm font-medium"
                >
                  <MessageSquare className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{session.title}</span>
                </button>
                <button
                  onClick={() => onDeleteSession(session.id)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 opacity-0 group-hover:opacity-100 hover:text-destructive transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>

        <div className="p-4 border-t border-border/50 space-y-1 bg-card/50 backdrop-blur-sm">
          <button 
            onClick={onToggleTheme}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-all text-sm font-medium"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
          </button>
          <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-all text-sm font-medium">
            <HelpCircle className="w-4 h-4" />
            Help & FAQ
          </button>
          <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-all text-sm font-medium">
            <Settings className="w-4 h-4" />
            Settings
          </button>
          
          <div className="pt-2 mt-2 border-t border-border/30 flex items-center gap-3 px-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-cyan-400 p-0.5 shadow-sm">
              <div className="w-full h-full rounded-full border-2 border-card overflow-hidden">
                <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="User Avatar" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-foreground truncate">AI Explorer</p>
              <p className="text-[10px] text-muted-foreground truncate">Free Plan</p>
            </div>
            <button className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground transition-colors">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.aside>
    </>
  );
}
