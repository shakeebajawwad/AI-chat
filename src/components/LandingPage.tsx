import { motion } from "motion/react";
import { Sparkles, MessageSquare, Code, Lightbulb, Zap } from "lucide-react";

interface LandingPageProps {
  onSelectPrompt: (prompt: string) => void;
}

const suggestedPrompts = [
  {
    icon: <MessageSquare className="w-5 h-5 text-blue-500" />,
    title: "Casual Conversation",
    description: "Tell me a fun fact about space",
    prompt: "Tell me a fun fact about space"
  },
  {
    icon: <Code className="w-5 h-5 text-green-500" />,
    title: "Technical Help",
    description: "Write a React hook for local storage",
    prompt: "Write a React hook for local storage with TypeScript"
  },
  {
    icon: <Lightbulb className="w-5 h-5 text-yellow-500" />,
    title: "Creative Ideas",
    description: "Give me name ideas for a coffee shop",
    prompt: "Give me 5 creative and modern name ideas for a coffee shop in a tech hub"
  },
  {
    icon: <Zap className="w-5 h-5 text-purple-500" />,
    title: "Quick Explanation",
    description: "Explain quantum computing simply",
    prompt: "Explain quantum computing to me like I'm five years old"
  }
];

export default function LandingPage({ onSelectPrompt }: LandingPageProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] max-w-4xl mx-auto px-6 text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <div className="relative inline-block">
          <div className="absolute -inset-2 bg-accent-gradient rounded-full blur-xl opacity-20 animate-pulse"></div>
          <div className="relative glass rounded-2xl p-4 border border-border/50">
            <Sparkles className="w-12 h-12 text-[#A855F7]" />
          </div>
        </div>
        <h1 className="mt-8 text-4xl sm:text-6xl font-bold tracking-tighter text-white">
          How can I help you <span className="text-transparent bg-clip-text bg-accent-gradient">today?</span>
        </h1>
        <p className="mt-6 text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
          Welcome to Lumina AI. Explore the boundaries of intelligence with our premium assistant.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full mt-10">
        {suggestedPrompts.map((item, index) => (
          <motion.button
            key={item.title}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            onClick={() => onSelectPrompt(item.prompt)}
            className="flex items-start gap-4 p-5 rounded-2xl border border-border bg-glass-bg hover:border-primary/50 hover:bg-secondary/20 transition-all text-left group"
          >
            <div className="p-2.5 rounded-xl bg-secondary/50 group-hover:bg-accent-gradient group-hover:text-white transition-all text-muted-foreground group-hover:shadow-accent">
              {item.icon}
            </div>
            <div>
              <div className="font-semibold text-white group-hover:text-primary transition-colors">{item.title}</div>
              <div className="text-sm text-muted-foreground mt-1 line-clamp-1">{item.description}</div>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
