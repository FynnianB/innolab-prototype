import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { allStories, type Story } from "../data/stories";

/* ------------------------------------------------------------------ */
/*  Types                                                               */
/* ------------------------------------------------------------------ */

export type StoryAction = "kept" | "rejected" | "editing" | null;

export interface Notification {
  id: string;
  text: string;
  project: string;
  time: string;
  read: boolean;
  type: "success" | "warning" | "info" | "error";
}

export interface ExportRecord {
  id: string;
  format: "PDF" | "CSV" | "XLSX";
  filename: string;
  timestamp: string;
  itemCount: number;
  status: "completed" | "failed";
}

interface StoryUpdate {
  id: string;
  [key: string]: unknown;
}

interface AppState {
  selectedWorkspace: string;
  setSelectedWorkspace: (ws: string) => void;

  stories: Story[];
  updateStories: (updates: StoryUpdate[]) => void;

  storyActions: Record<string, StoryAction>;
  setStoryAction: (storyId: string, action: StoryAction) => void;
  resetStoryActions: () => void;

  notifications: Notification[];
  markNotificationRead: (id: string) => void;
  unreadCount: number;

  exportHistory: ExportRecord[];
  addExportRecord: (record: Omit<ExportRecord, "id">) => void;

  showExportDialog: boolean;
  setShowExportDialog: (show: boolean) => void;
  exportScope: "stories" | "compliance" | "jira" | "all";
  setExportScope: (scope: "stories" | "compliance" | "jira" | "all") => void;
}

/* ------------------------------------------------------------------ */
/*  Default notifications                                               */
/* ------------------------------------------------------------------ */

const defaultNotifications: Notification[] = [
  { id: "N-001", text: "23 neue Stories generiert", project: "Automobil-Plattform", time: "vor 15 Min.", read: false, type: "success" },
  { id: "N-002", text: "3 Widerspr\u00fcche erkannt", project: "Banking App v3.2", time: "vor 1 Std.", read: false, type: "warning" },
  { id: "N-003", text: "Compliance-Check bestanden", project: "Healthcare Portal", time: "vor 2 Std.", read: true, type: "success" },
  { id: "N-004", text: "Export abgeschlossen (7 Stories)", project: "Automobil-Plattform", time: "vor 3 Std.", read: true, type: "info" },
  { id: "N-005", text: "Neue Compliance-Regeln importiert", project: "Global", time: "vor 5 Std.", read: true, type: "info" },
];

/* ------------------------------------------------------------------ */
/*  Context                                                             */
/* ------------------------------------------------------------------ */

const AppContext = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [selectedWorkspace, setSelectedWorkspace] = useState("Automobil-Projekt Alpha");
  const [stories, setStories] = useState<Story[]>(allStories);
  const [storyActions, setStoryActions] = useState<Record<string, StoryAction>>({});
  const [notifications, setNotifications] = useState<Notification[]>(defaultNotifications);
  const [exportHistory, setExportHistory] = useState<ExportRecord[]>([]);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [exportScope, setExportScope] = useState<"stories" | "compliance" | "jira" | "all">("all");

  const updateStories = useCallback((updates: StoryUpdate[]) => {
    setStories((prev) => {
      const updateMap = new Map(updates.map((u) => [u.id, u]));
      return prev.map((s) => {
        const upd = updateMap.get(s.id);
        return upd ? { ...s, ...upd } : s;
      });
    });
  }, []);

  const setStoryAction = useCallback((storyId: string, action: StoryAction) => {
    setStoryActions((prev) => {
      if (action === null) {
        const next = { ...prev };
        delete next[storyId];
        return next;
      }
      return { ...prev, [storyId]: action };
    });
  }, []);

  const resetStoryActions = useCallback(() => {
    setStoryActions({});
  }, []);

  const markNotificationRead = useCallback((id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const addExportRecord = useCallback((record: Omit<ExportRecord, "id">) => {
    setExportHistory((prev) => [
      { ...record, id: `EXP-${Date.now()}` },
      ...prev,
    ]);
  }, []);

  const value: AppState = {
    selectedWorkspace,
    setSelectedWorkspace,
    stories,
    updateStories,
    storyActions,
    setStoryAction,
    resetStoryActions,
    notifications,
    markNotificationRead,
    unreadCount,
    exportHistory,
    addExportRecord,
    showExportDialog,
    setShowExportDialog,
    exportScope,
    setExportScope,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useAppContext must be used within AppProvider");
  return ctx;
}
