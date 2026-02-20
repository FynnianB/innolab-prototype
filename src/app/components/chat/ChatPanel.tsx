import { motion } from "motion/react";
import { Sparkles, Minus, Plus } from "lucide-react";
import { useChatContext } from "../../context/ChatContext";
import { MessageList } from "./MessageList";
import { ChatInput } from "./ChatInput";

export function ChatPanel() {
  const { setOpen, startNewChat } = useChatContext();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="fixed bottom-24 right-6 z-50 w-[400px] h-[540px] bg-white rounded-2xl shadow-2xl border border-[#e2e8f0] flex flex-col overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#e2e8f0] bg-gradient-to-r from-[#4f46e5] to-[#6366f1]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
            <Sparkles className="w-4.5 h-4.5 text-white" />
          </div>
          <div>
            <h3
              className="text-[13px] text-white leading-tight"
              style={{ fontWeight: 600 }}
            >
              ReqWise AI Assistant
            </h3>
            <p className="text-[11px] text-white/70 leading-tight">
              Bulk-Ops & Wissensabfragen
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={startNewChat}
            className="w-7 h-7 rounded-md hover:bg-white/20 flex items-center justify-center transition-colors"
            aria-label="Neuer Chat"
            title="Neuer Chat"
          >
            <Plus className="w-4 h-4 text-white" />
          </button>
          <button
            onClick={() => setOpen(false)}
            className="w-7 h-7 rounded-md hover:bg-white/20 flex items-center justify-center transition-colors"
            aria-label="Chat minimieren"
          >
            <Minus className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <MessageList />

      {/* Input */}
      <ChatInput />
    </motion.div>
  );
}
