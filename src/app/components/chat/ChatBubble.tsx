import { motion, AnimatePresence } from "motion/react";
import { MessageCircle, X } from "lucide-react";
import { useChatContext } from "../../context/ChatContext";
import { ChatPanel } from "./ChatPanel";

export function ChatBubble() {
  const { isOpen, toggleOpen } = useChatContext();

  return (
    <>
      <AnimatePresence>
        {isOpen && <ChatPanel />}
      </AnimatePresence>

      <motion.button
        onClick={toggleOpen}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-[#4f46e5] text-white shadow-lg hover:bg-[#4338ca] transition-colors flex items-center justify-center"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label={isOpen ? "Chat schließen" : "Chat öffnen"}
      >
        <AnimatePresence mode="wait" initial={false}>
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <X className="w-6 h-6" />
            </motion.div>
          ) : (
            <motion.div
              key="open"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <MessageCircle className="w-6 h-6" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </>
  );
}
