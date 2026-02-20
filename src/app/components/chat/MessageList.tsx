import { useEffect, useRef } from "react";
import { motion } from "motion/react";
import { useChatContext } from "../../context/ChatContext";
import type { ChatMessage } from "../../services/chat/types";
import { BulkOperationPreview } from "./BulkOperationPreview";
import { QueryResultCard } from "./QueryResultCard";
import { SuggestionChips } from "./SuggestionChips";

function TypingIndicator() {
  return (
    <div className="flex items-start gap-2 px-4">
      <div className="bg-[#f1f5f9] rounded-2xl rounded-bl-md px-4 py-2.5 flex items-center gap-1">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-[#94a3b8]"
            animate={{ y: [0, -4, 0] }}
            transition={{
              duration: 0.6,
              repeat: Infinity,
              delay: i * 0.15,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
    </div>
  );
}

function renderMarkdown(text: string): string {
  return text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
             .replace(/\n/g, '<br/>');
}

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";

  if (message.type === "bulk_preview" && message.metadata && "changes" in message.metadata) {
    return <BulkOperationPreview data={message.metadata} />;
  }

  if (message.type === "query_result" && message.metadata && "items" in message.metadata) {
    return <QueryResultCard data={message.metadata} />;
  }

  if (message.type === "suggestion_chips" && message.metadata && "chips" in message.metadata) {
    return <SuggestionChips data={message.metadata} />;
  }

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed ${
          isUser
            ? "bg-[#4f46e5] text-white rounded-br-md"
            : "bg-[#f1f5f9] text-[#1e1e2e] rounded-bl-md"
        }`}
        dangerouslySetInnerHTML={{ __html: renderMarkdown(message.content) }}
      />
    </div>
  );
}

export function MessageList() {
  const { messages, isTyping } = useChatContext();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
      {messages.map((msg) => (
        <motion.div
          key={msg.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          <MessageBubble message={msg} />
        </motion.div>
      ))}
      {isTyping && <TypingIndicator />}
      <div ref={bottomRef} />
    </div>
  );
}
