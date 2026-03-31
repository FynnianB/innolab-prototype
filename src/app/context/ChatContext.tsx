import {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  useEffect,
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

export interface ChatSessionSnapshot {
  id: string;
  title: string;
  updatedAt: number;
  messages: ChatMessage[];
}

interface ChatState {
  messages: ChatMessage[];
  isOpen: boolean;
  isTyping: boolean;
  pendingOperation: BulkOperationPreview | null;
  pastSessions: ChatSessionSnapshot[];
  toggleOpen: () => void;
  setOpen: (open: boolean) => void;
  sendMessage: (text: string) => void;
  startNewChat: () => void;
  loadPastSession: (sessionId: string) => void;
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
      "Hallo! Ich bin Ihr **Assistent**. Ich kann bei Bulk-Operationen auf Tickets helfen oder Fragen zu Projekten und Stories im aktuellen Workspace beantworten.",
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
          message: "Was ist der aktuelle Stand beim Projekt Versuchsteile?",
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
  const { storiesInWorkspace, updateStories } = useAppContext();
  const serviceRef = useRef<ChatService>(new SimulatedChatService());

  const [messages, setMessages] = useState<ChatMessage[]>(WELCOME_MESSAGES);
  const [pastSessions, setPastSessions] = useState<ChatSessionSnapshot[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [pendingOperation, setPendingOperation] =
    useState<BulkOperationPreview | null>(null);

  const messagesRef = useRef<ChatMessage[]>(messages);
  const pastSessionsRef = useRef<ChatSessionSnapshot[]>(pastSessions);
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);
  useEffect(() => {
    pastSessionsRef.current = pastSessions;
  }, [pastSessions]);

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
        .processMessage(trimmed, { stories: storiesInWorkspace })
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
    [storiesInWorkspace],
  );

  const applyBulkOperation = useCallback(() => {
    if (!pendingOperation) return;

    const { field, changes } = pendingOperation;
    const updates = changes.map((c) => ({
      id: c.id,
      [field]: c.newValue,
    }));
    updateStories(updates);

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
  }, [pendingOperation, updateStories]);

  const startNewChat = useCallback(() => {
    const prev = messagesRef.current;
    if (prev.some((m) => m.role === "user")) {
      const firstUser = prev.find((m) => m.role === "user");
      const raw =
        typeof firstUser?.content === "string" ? firstUser.content : "";
      const title = raw.trim().slice(0, 50) || "Gespeicherter Chat";
      setPastSessions((sessions) =>
        [
          {
            id: `sess-${Date.now()}`,
            title,
            updatedAt: Date.now(),
            messages: prev.map((m) => ({ ...m })),
          },
          ...sessions,
        ].slice(0, 25),
      );
    }
    setMessages([...WELCOME_MESSAGES]);
    setPendingOperation(null);
    setIsTyping(false);
  }, []);

  const loadPastSession = useCallback((sessionId: string) => {
    const sessions = pastSessionsRef.current;
    const target = sessions.find((s) => s.id === sessionId);
    if (!target) return;
    const prev = messagesRef.current;
    let next = sessions.filter((s) => s.id !== sessionId);
    if (prev.some((m) => m.role === "user")) {
      const firstUser = prev.find((m) => m.role === "user");
      const raw =
        typeof firstUser?.content === "string" ? firstUser.content : "";
      const title = raw.trim().slice(0, 50) || "Gespeicherter Chat";
      next = [
        {
          id: `sess-${Date.now()}`,
          title,
          updatedAt: Date.now(),
          messages: prev.map((m) => ({ ...m })),
        },
        ...next,
      ];
    }
    setPastSessions(next.slice(0, 25));
    setMessages(target.messages.map((m) => ({ ...m })));
    setPendingOperation(null);
    setIsTyping(false);
  }, []);

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
    pastSessions,
    toggleOpen,
    setOpen,
    sendMessage,
    startNewChat,
    loadPastSession,
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
