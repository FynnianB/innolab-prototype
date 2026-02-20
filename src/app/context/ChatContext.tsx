import {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  type ReactNode,
} from "react";
import type {
  ChatMessage,
  BulkOperationPreview,
  ChatService,
} from "../services/chat/types";
import { SimulatedChatService } from "../services/chat/SimulatedChatService";
import { useAppContext } from "./AppContext";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface ChatState {
  messages: ChatMessage[];
  isOpen: boolean;
  isTyping: boolean;
  pendingOperation: BulkOperationPreview | null;
  toggleOpen: () => void;
  setOpen: (open: boolean) => void;
  sendMessage: (text: string) => void;
  applyBulkOperation: () => void;
  dismissBulkOperation: () => void;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

let msgCounter = 0;
function nextId() {
  return `msg-${++msgCounter}-${Date.now()}`;
}

const WELCOME_MESSAGES: ChatMessage[] = [
  {
    id: "msg-welcome-1",
    role: "assistant",
    type: "text",
    content:
      "Hallo! Ich bin der **ReqWise AI Assistant**. Ich kann dir bei Bulk-Operationen auf deinen Tickets helfen oder Fragen zu bestehenden Projekten und Stories beantworten.",
    timestamp: Date.now(),
  },
  {
    id: "msg-welcome-2",
    role: "assistant",
    type: "suggestion_chips",
    content: "",
    timestamp: Date.now() + 1,
    metadata: {
      chips: [
        {
          label: "Priorität ändern",
          message: "Setze die Priorität aller Draft-Stories auf Hoch",
        },
        {
          label: "Tickets suchen",
          message: "Gibt es Tickets zum Thema Authentifizierung?",
        },
        {
          label: "Projektstatus",
          message: "Was ist der aktuelle Stand vom Automobil-Projekt?",
        },
        {
          label: "Stories auflisten",
          message: "Zeige alle Stories mit Status In Progress",
        },
      ],
    },
  },
];

/* ------------------------------------------------------------------ */
/*  Context                                                            */
/* ------------------------------------------------------------------ */

const ChatContext = createContext<ChatState | null>(null);

export function ChatProvider({ children }: { children: ReactNode }) {
  const { stories, jiraTickets, updateStories, updateJiraTickets } =
    useAppContext();
  const serviceRef = useRef<ChatService>(new SimulatedChatService());

  const [messages, setMessages] = useState<ChatMessage[]>(WELCOME_MESSAGES);
  const [isOpen, setIsOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [pendingOperation, setPendingOperation] =
    useState<BulkOperationPreview | null>(null);

  const toggleOpen = useCallback(() => setIsOpen((v) => !v), []);
  const setOpen = useCallback((open: boolean) => setIsOpen(open), []);

  const sendMessage = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;

      const userMsg: ChatMessage = {
        id: nextId(),
        role: "user",
        type: "text",
        content: trimmed,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, userMsg]);
      setIsTyping(true);

      serviceRef.current
        .processMessage(trimmed, { stories, jiraTickets })
        .then((response) => {
          const newMessages: ChatMessage[] = response.messages.map((m) => ({
            ...m,
            id: nextId(),
            timestamp: Date.now(),
          }));
          setMessages((prev) => [...prev, ...newMessages]);
          if (response.pendingOperation) {
            setPendingOperation(response.pendingOperation);
          }
        })
        .finally(() => setIsTyping(false));
    },
    [stories, jiraTickets],
  );

  const applyBulkOperation = useCallback(() => {
    if (!pendingOperation) return;

    const { entityType, field, changes } = pendingOperation;

    if (entityType === "story") {
      const updates = changes.map((c) => ({
        id: c.id,
        [field]: c.newValue,
      }));
      updateStories(updates);
    } else {
      const updates = changes.map((c) => ({
        key: c.id,
        [field]: c.newValue,
      }));
      updateJiraTickets(updates);
    }

    // Mark the preview as applied
    setMessages((prev) =>
      prev.map((m) => {
        if (
          m.type === "bulk_preview" &&
          m.metadata &&
          "changes" in m.metadata &&
          !m.metadata.applied
        ) {
          return {
            ...m,
            metadata: { ...m.metadata, applied: true },
          };
        }
        return m;
      }),
    );

    const successMsg: ChatMessage = {
      id: nextId(),
      role: "assistant",
      type: "text",
      content: `**${changes.length} Einträge** wurden erfolgreich aktualisiert! Das Feld „${field}" wurde auf „${pendingOperation.newValue}" gesetzt.`,
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, successMsg]);
    setPendingOperation(null);
  }, [pendingOperation, updateStories, updateJiraTickets]);

  const dismissBulkOperation = useCallback(() => {
    setPendingOperation(null);

    setMessages((prev) =>
      prev.map((m) => {
        if (
          m.type === "bulk_preview" &&
          m.metadata &&
          "changes" in m.metadata &&
          !m.metadata.applied
        ) {
          return {
            ...m,
            metadata: { ...m.metadata, applied: true },
          };
        }
        return m;
      }),
    );

    const dismissMsg: ChatMessage = {
      id: nextId(),
      role: "assistant",
      type: "text",
      content: "Operation abgebrochen. Wie kann ich dir sonst helfen?",
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, dismissMsg]);
  }, []);

  const value: ChatState = {
    messages,
    isOpen,
    isTyping,
    pendingOperation,
    toggleOpen,
    setOpen,
    sendMessage,
    applyBulkOperation,
    dismissBulkOperation,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChatContext() {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error("useChatContext must be used within ChatProvider");
  return ctx;
}
