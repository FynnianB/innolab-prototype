import { motion } from "motion/react";
import {
  History,
  MessageSquarePlus,
  Sparkles,
  X,
} from "lucide-react";
import { useChatContext } from "../../context/ChatContext";
import { MessageList } from "./MessageList";
import { ChatInput } from "./ChatInput";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

export function ChatPanel() {
  const { setOpen, startNewChat, pastSessions, loadPastSession } =
    useChatContext();

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
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
            <Sparkles className="w-4.5 h-4.5 text-white" />
          </div>
          <div className="min-w-0">
            <h3
              className="text-[13px] text-white leading-tight truncate"
              style={{ fontWeight: 600 }}
            >
              ReqWise AI Assistant
            </h3>
            <p className="text-[11px] text-white/70 leading-tight truncate">
              Bulk-Ops & Wissensabfragen
            </p>
          </div>
        </div>
        <div className="flex items-center gap-0.5 shrink-0">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="w-7 h-7 rounded-md hover:bg-white/20 flex items-center justify-center transition-colors disabled:opacity-40"
                aria-label="Chat-Verlauf"
                title="Chat-Verlauf"
                disabled={pastSessions.length === 0}
              >
                <History className="w-4 h-4 text-white" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[min(100vw-2rem,280px)] z-[200]">
              <DropdownMenuLabel className="text-[11px] text-muted-foreground font-normal">
                Frühere Chats
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {pastSessions.map((s) => (
                <DropdownMenuItem
                  key={s.id}
                  className="text-[12px] cursor-pointer"
                  onClick={() => loadPastSession(s.id)}
                >
                  <span className="truncate" title={s.title}>
                    {s.title}
                  </span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <button
            type="button"
            className="w-7 h-7 rounded-md hover:bg-white/20 flex items-center justify-center transition-colors"
            onClick={startNewChat}
            aria-label="Neuen Chat starten"
            title="Neuen Chat starten"
          >
            <MessageSquarePlus className="w-4 h-4 text-white" />
          </button>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="w-7 h-7 rounded-md hover:bg-white/20 flex items-center justify-center transition-colors"
            aria-label="Chat schließen"
            title="Chat schließen"
          >
            <X className="w-4 h-4 text-white" />
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
