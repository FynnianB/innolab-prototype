import { useState, useRef, useCallback, type KeyboardEvent } from "react";
import { Send } from "lucide-react";
import { useChatContext } from "../../context/ChatContext";

export function ChatInput() {
  const { sendMessage, isTyping } = useChatContext();
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = useCallback(() => {
    if (!value.trim() || isTyping) return;
    sendMessage(value);
    setValue("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  }, [value, isTyping, sendMessage]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend],
  );

  const handleInput = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 100) + "px";
  }, []);

  return (
    <div className="border-t border-[#e2e8f0] px-3 py-2.5 flex items-end gap-2">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          handleInput();
        }}
        onKeyDown={handleKeyDown}
        placeholder={
          isTyping ? "Bitte warten..." : "Nachricht eingeben..."
        }
        disabled={isTyping}
        rows={1}
        className="flex-1 resize-none rounded-xl border border-[#e2e8f0] bg-[#f8fafc] px-3 py-2 text-[13px] text-[#1e1e2e] placeholder:text-[#94a3b8] focus:outline-none focus:ring-2 focus:ring-[#4f46e5]/20 focus:border-[#4f46e5] disabled:opacity-50 transition-all"
        style={{ minHeight: 36, maxHeight: 100 }}
      />
      <button
        onClick={handleSend}
        disabled={!value.trim() || isTyping}
        className="w-9 h-9 rounded-xl bg-[#4f46e5] text-white flex items-center justify-center hover:bg-[#4338ca] disabled:opacity-40 disabled:hover:bg-[#4f46e5] transition-colors flex-shrink-0"
        aria-label="Nachricht senden"
      >
        <Send className="w-4 h-4" />
      </button>
    </div>
  );
}
