import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  allRelations,
  allStories,
  type Story,
  type TicketRelation,
} from "../data/stories";
import {
  ALL_TEAM_ROSTER_INITIALS,
  DEFAULT_WORKSPACE_ID,
  filterStoriesByWorkspace,
  getProjectIdsForWorkspace,
  getWorkspaceById,
  isBuiltinWorkspaceId,
  isValidWorkspaceId,
  mergeWorkspaces,
  persistCustomWorkspaces,
  persistProjectTeamOverrides,
  persistWorkspaceId,
  PROJECT_TEAM_BY_ID,
  PROJECT_WORKSPACE,
  projectTeamsEqual,
  PROTOTYPE_USER_INITIALS,
  readCustomWorkspaces,
  readProjectTeamOverrides,
  readStoredWorkspaceId,
  resolveWorkspaceTicketSystemId,
  type Workspace,
} from "../data/workspaces";
import {
  getTicketSystem,
  type TicketSystemDefinition,
  type TicketSystemId,
} from "../data/ticketSystems";
import {
  importJiraProjectData,
  type JiraConnectionInput,
} from "../services/jira/JiraService";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export type StoryAction = "kept" | "rejected" | "editing" | null;

export interface Notification {
  id: string;
  text: string;
  project: string;
  time: string;
  read: boolean;
  type: "success" | "warning" | "info" | "error";
  workspaceId?: string | null;
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

export interface CreateWorkspaceInput {
  name: string;
  logoSrc?: string;
  jiraConnection?: JiraConnectionInput;
}

export interface CreateWorkspaceOptions {
  signal?: AbortSignal;
  onJiraProgress?: (message: string) => void;
}

export interface WorkspaceSyncState {
  isSyncing: boolean;
  lastSyncAt?: string;
  lastError?: string;
  lastFetchedCount?: number;
  lastImportedCount?: number;
}

interface AppState {
  workspaces: Workspace[];
  selectedWorkspaceId: string;
  setSelectedWorkspaceId: (id: string) => void;
  selectedWorkspace: Workspace;
  ticketSystem: TicketSystemDefinition;

  addWorkspace: (input: {
    name: string;
    ticketSystemId: TicketSystemId;
  }) => void;
  updateWorkspace: (
    id: string,
    patch: { name?: string; ticketSystemId?: TicketSystemId },
  ) => void;
  removeWorkspace: (id: string) => void;

  stories: Story[];
  storiesInWorkspace: Story[];
  relations: TicketRelation[];

  updateStories: (updates: StoryUpdate[]) => void;

  createWorkspace: (
    input: CreateWorkspaceInput,
    options?: CreateWorkspaceOptions,
  ) => Promise<Workspace>;
  syncWorkspaceFromJira: (workspaceId: string) => Promise<void>;
  workspaceSyncStateById: Record<string, WorkspaceSyncState>;

  storyActions: Record<string, StoryAction>;
  setStoryAction: (storyId: string, action: StoryAction) => void;
  resetStoryActions: () => void;

  notifications: Notification[];
  notificationsInWorkspace: Notification[];
  markNotificationRead: (id: string) => void;
  unreadCount: number;

  exportHistory: ExportRecord[];
  addExportRecord: (record: Omit<ExportRecord, "id">) => void;

  showExportDialog: boolean;
  setShowExportDialog: (show: boolean) => void;
  exportScope: "stories" | "guidelines" | "tickets" | "all";
  setExportScope: (
    scope: "stories" | "guidelines" | "tickets" | "all",
  ) => void;

  /** Projekt-IDs im aktuellen Workspace, in deren Team Ihre Kennung (PO) geführt wird. */
  myProjectIdsInWorkspace: string[];
  getEffectiveProjectTeam: (projectId: string) => string[];
  addMemberToProjectTeam: (projectId: string, memberInitials: string) => void;
  removeMemberFromProjectTeam: (projectId: string, memberInitials: string) => void;
  isPrototypeUserOnProjectTeam: (projectId: string) => boolean;
}

/* ------------------------------------------------------------------ */
/*  Default notifications                                              */
/* ------------------------------------------------------------------ */

const defaultNotifications: Notification[] = [
  {
    id: "N-001",
    text: "Forecast-Schnittstelle — Abnahme-Workshop für morgen bestätigt",
    project: "BMW Group — Versuchsteile & Entwicklungs-Analytics",
    time: "vor 20 Min.",
    read: false,
    type: "success",
    workspaceId: "ws-bmw",
  },
  {
    id: "N-002",
    text: "Datenraum Mobilität — Consent-Texte rechtlich noch offen",
    project: "Volkswagen Group — Datenraum Mobilität",
    time: "vor 1 Std.",
    read: false,
    type: "warning",
    workspaceId: "ws-vw",
  },
  {
    id: "N-003",
    text: "HV-Batterie Feature-Flags — Review im Ticket-Tool abgeschlossen",
    project: "Mercedes-Benz Group — E-Mobility Software & Baukasten",
    time: "vor 2 Std.",
    read: true,
    type: "success",
    workspaceId: "ws-mercedes",
  },
  {
    id: "N-004",
    text: "Export abgeschlossen (Stories)",
    project: "AUDI — Infotainment & HMI",
    time: "vor 3 Std.",
    read: true,
    type: "info",
    workspaceId: "ws-audi",
  },
  {
    id: "N-005",
    text: "Neuer Regelkatalog für den Compliance Check importiert",
    project: "Global",
    time: "vor 5 Std.",
    read: true,
    type: "info",
    workspaceId: null,
  },
  {
    id: "N-006",
    text: "Telemetrie-Pipeline — Nachtlauf ohne Fehler",
    project: "Porsche AG — Motorsport & Fahrzeugdaten",
    time: "vor 25 Min.",
    read: false,
    type: "success",
    workspaceId: "ws-porsche",
  },
  {
    id: "N-007",
    text: "API-Gateway Rate-Limits — Abstimmung Partner-Portal",
    project: "AUDI — Vernetzung & Drittpartner-APIs",
    time: "vor 4 Std.",
    read: false,
    type: "info",
    workspaceId: "ws-audi",
  },
];

/* ------------------------------------------------------------------ */
/*  Context                                                            */
/* ------------------------------------------------------------------ */

const AppContext = createContext<AppState | null>(null);
const FALLBACK_WORKSPACE: Workspace = {
  id: DEFAULT_WORKSPACE_ID,
  name: "Workspace",
};

function keyByWorkspaceAndId(story: Story): string {
  return `${story.workspaceId ?? "__legacy__"}::${story.id}`;
}

function sanitizeWorkspaceIdPart(value: string): string {
  return value.replace(/[^A-Za-z0-9_-]/g, "_");
}

function hasFilledJiraConnection(ws: Workspace | undefined): boolean {
  if (!ws?.jira?.enabled) return false;
  return Boolean(
    ws.jira.baseUrl.trim() &&
      ws.jira.projectKey.trim() &&
      ws.jira.email.trim() &&
      ws.jira.apiToken.trim(),
  );
}

function isValidIsoDate(value: string | undefined): boolean {
  if (!value) return false;
  return !Number.isNaN(new Date(value).getTime());
}

function isAbortError(error: unknown): boolean {
  if (!error) return false;
  if (error instanceof DOMException && error.name === "AbortError") return true;
  return error instanceof Error && error.name === "AbortError";
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [customWorkspaces, setCustomWorkspaces] = useState<Workspace[]>(
    () => readCustomWorkspaces(),
  );

  const workspaces = useMemo(
    () => mergeWorkspaces(customWorkspaces),
    [customWorkspaces],
  );

  const [selectedWorkspaceId, setSelectedWorkspaceIdState] = useState(() => {
    const all = mergeWorkspaces(readCustomWorkspaces());
    const stored = readStoredWorkspaceId();
    return isValidWorkspaceId(stored, all) ? stored : DEFAULT_WORKSPACE_ID;
  });

  const [stories, setStories] = useState<Story[]>(allStories);
  const [relations, setRelations] = useState<TicketRelation[]>(allRelations);
  const [storyActions, setStoryActions] = useState<Record<string, StoryAction>>(
    {},
  );
  const [notifications, setNotifications] =
    useState<Notification[]>(defaultNotifications);
  const [exportHistory, setExportHistory] = useState<ExportRecord[]>([]);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [exportScope, setExportScope] = useState<
    "stories" | "guidelines" | "tickets" | "all"
  >("all");
  const [workspaceSyncStateById, setWorkspaceSyncStateById] = useState<
    Record<string, WorkspaceSyncState>
  >({});

  const [projectTeamOverrides, setProjectTeamOverrides] = useState<
    Record<string, string[]>
  >(() => readProjectTeamOverrides());

  const syncingWorkspaceIdsRef = useRef(new Set<string>());
  const storiesRef = useRef(stories);

  useEffect(() => {
    storiesRef.current = stories;
  }, [stories]);

  useEffect(() => {
    if (isValidWorkspaceId(selectedWorkspaceId, workspaces)) return;
    setSelectedWorkspaceIdState(DEFAULT_WORKSPACE_ID);
    persistWorkspaceId(DEFAULT_WORKSPACE_ID);
  }, [selectedWorkspaceId, workspaces]);

  const setSelectedWorkspaceId = useCallback(
    (id: string) => {
      const next = isValidWorkspaceId(id, workspaces) ? id : DEFAULT_WORKSPACE_ID;
      setSelectedWorkspaceIdState(next);
      persistWorkspaceId(next);
    },
    [workspaces],
  );

  const selectedWorkspace = useMemo(() => {
    return (
      getWorkspaceById(selectedWorkspaceId, workspaces) ??
      workspaces[0] ??
      FALLBACK_WORKSPACE
    );
  }, [selectedWorkspaceId, workspaces]);

  const ticketSystem = useMemo(
    () => getTicketSystem(resolveWorkspaceTicketSystemId(selectedWorkspace)),
    [selectedWorkspace],
  );

  const persistCustom = useCallback((next: Workspace[]) => {
    setCustomWorkspaces(next);
    persistCustomWorkspaces(next);
  }, []);

  const addWorkspace = useCallback(
    (input: { name: string; ticketSystemId: TicketSystemId }) => {
      const id = `ws-custom-manual-${Date.now().toString(36)}`;
      const workspace: Workspace = {
        id,
        name: input.name.trim() || "Neuer Workspace",
        ticketSystemId: input.ticketSystemId,
        isCustom: true,
      };
      const next = [...customWorkspaces, workspace];
      persistCustom(next);
      setSelectedWorkspaceIdState(id);
      persistWorkspaceId(id);
    },
    [customWorkspaces, persistCustom],
  );

  const updateWorkspace = useCallback(
    (
      id: string,
      patch: { name?: string; ticketSystemId?: TicketSystemId },
    ) => {
      if (isBuiltinWorkspaceId(id)) return;
      const idx = customWorkspaces.findIndex((w) => w.id === id);
      if (idx < 0) return;

      const next = customWorkspaces.map((ws) => {
        if (ws.id !== id) return ws;
        return {
          ...ws,
          ...(patch.name !== undefined
            ? { name: patch.name.trim() || ws.name }
            : {}),
          ...(patch.ticketSystemId !== undefined
            ? { ticketSystemId: patch.ticketSystemId }
            : {}),
        };
      });

      persistCustom(next);
    },
    [customWorkspaces, persistCustom],
  );

  const removeWorkspace = useCallback(
    (id: string) => {
      if (isBuiltinWorkspaceId(id)) return;
      if (!customWorkspaces.some((w) => w.id === id)) return;

      const next = customWorkspaces.filter((w) => w.id !== id);
      persistCustom(next);

      setWorkspaceSyncStateById((prev) => {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      });

      if (selectedWorkspaceId === id) {
        setSelectedWorkspaceIdState(DEFAULT_WORKSPACE_ID);
        persistWorkspaceId(DEFAULT_WORKSPACE_ID);
      }
    },
    [customWorkspaces, persistCustom, selectedWorkspaceId],
  );

  const updateCustomWorkspace = useCallback(
    (workspaceId: string, updater: (ws: Workspace) => Workspace) => {
      setCustomWorkspaces((prev) => {
        const next = prev.map((ws) =>
          ws.id === workspaceId ? updater(ws) : ws,
        );
        persistCustomWorkspaces(next);
        return next;
      });
    },
    [],
  );

  const syncWorkspaceFromJiraInternal = useCallback(
    async (workspaceId: string, workspaceOverride?: Workspace) => {
      const workspace = workspaceOverride ?? getWorkspaceById(workspaceId, workspaces);
      if (!hasFilledJiraConnection(workspace) || !workspace?.jira) return;

      if (syncingWorkspaceIdsRef.current.has(workspaceId)) return;
      syncingWorkspaceIdsRef.current.add(workspaceId);

      setWorkspaceSyncStateById((prev) => ({
        ...prev,
        [workspaceId]: {
          ...(prev[workspaceId] ?? { isSyncing: false }),
          isSyncing: true,
          lastError: undefined,
        },
      }));

      try {
        const existingInWorkspace = new Set(
          storiesRef.current
            .filter((s) => s.workspaceId === workspaceId)
            .map((s) => s.id),
        );
        const syncStartedAtIso = new Date().toISOString();
        const updatedSince =
          workspace.jira.lastSyncStatus === "success" &&
          isValidIsoDate(workspace.jira.lastSyncAt)
            ? workspace.jira.lastSyncAt
            : undefined;

        const result = await importJiraProjectData(
          {
            baseUrl: workspace.jira.baseUrl,
            projectKey: workspace.jira.projectKey,
            email: workspace.jira.email,
            apiToken: workspace.jira.apiToken,
          },
          workspaceId,
          {
            updatedSince,
            knownIssueIds: Array.from(existingInWorkspace),
          },
        );

        const importedNewCount = result.stories.filter(
          (s) => !existingInWorkspace.has(s.id),
        ).length;

        setStories((prev) => {
          const incomingMap = new Map(
            result.stories.map((s) => [keyByWorkspaceAndId(s), s]),
          );

          const merged = prev.map((s) => {
            const key = keyByWorkspaceAndId(s);
            const incoming = incomingMap.get(key);
            if (!incoming) return s;
            incomingMap.delete(key);
            return { ...s, ...incoming };
          });

          for (const story of incomingMap.values()) {
            merged.push(story);
          }

          return merged;
        });

        const jiraPrefix = `JR-${sanitizeWorkspaceIdPart(workspaceId)}-`;
        setRelations((prev) => {
          const touched = new Set(result.touchedIssueIds);
          const keepRelation = (r: TicketRelation) => {
            if (!r.id.startsWith(jiraPrefix)) return true;
            if (!result.isIncremental) return false;
            if (touched.size === 0) return true;
            return !touched.has(r.sourceId) && !touched.has(r.targetId);
          };
          const merged = [...prev.filter(keepRelation), ...result.relations];
          const byId = new Map(merged.map((r) => [r.id, r]));
          return Array.from(byId.values());
        });

        updateCustomWorkspace(workspaceId, (ws) => ({
          ...ws,
          ticketSystemId: "jira",
          jira: ws.jira
            ? {
                ...ws.jira,
                lastSyncAt: syncStartedAtIso,
                lastSyncStatus: "success",
                lastSyncError: undefined,
              }
            : ws.jira,
        }));

        setWorkspaceSyncStateById((prev) => ({
          ...prev,
          [workspaceId]: {
            isSyncing: false,
            lastSyncAt: syncStartedAtIso,
            lastFetchedCount: result.fetchedIssueCount,
            lastImportedCount: importedNewCount,
            lastError: undefined,
          },
        }));
      } catch (error) {
        const msg = error instanceof Error ? error.message : "Unbekannter Fehler";

        updateCustomWorkspace(workspaceId, (ws) => ({
          ...ws,
          jira: ws.jira
            ? {
                ...ws.jira,
                lastSyncStatus: "error",
                lastSyncError: msg,
              }
            : ws.jira,
        }));

        setWorkspaceSyncStateById((prev) => ({
          ...prev,
          [workspaceId]: {
            ...(prev[workspaceId] ?? { isSyncing: false }),
            isSyncing: false,
            lastError: msg,
          },
        }));
      } finally {
        syncingWorkspaceIdsRef.current.delete(workspaceId);
      }
    },
    [updateCustomWorkspace, workspaces],
  );

  const syncWorkspaceFromJira = useCallback(
    async (workspaceId: string) => {
      await syncWorkspaceFromJiraInternal(workspaceId);
    },
    [syncWorkspaceFromJiraInternal],
  );

  useEffect(() => {
    if (!hasFilledJiraConnection(selectedWorkspace)) return;
    void syncWorkspaceFromJira(selectedWorkspace.id);
  }, [
    selectedWorkspace.id,
    selectedWorkspace.jira?.enabled,
    selectedWorkspace.jira?.baseUrl,
    selectedWorkspace.jira?.projectKey,
    selectedWorkspace.jira?.email,
    selectedWorkspace.jira?.apiToken,
    syncWorkspaceFromJira,
  ]);

  const createWorkspace = useCallback(
    async (
      input: CreateWorkspaceInput,
      options?: CreateWorkspaceOptions,
    ): Promise<Workspace> => {
      const base = input.name.trim();
      const safeName = base || "Neuer Workspace";
      const slug = safeName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 36);
      const id = `ws-custom-${slug || "workspace"}-${Date.now().toString(36)}`;

      const jira = input.jiraConnection
        ? {
            enabled: true,
            baseUrl: input.jiraConnection.baseUrl.trim(),
            projectKey: input.jiraConnection.projectKey.trim(),
            email: input.jiraConnection.email.trim(),
            apiToken: input.jiraConnection.apiToken,
            lastSyncStatus: "idle" as const,
          }
        : undefined;

      const workspace: Workspace = {
        id,
        name: safeName,
        logoSrc: input.logoSrc,
        isCustom: true,
        ticketSystemId: jira ? "jira" : "none",
        jira,
      };

      if (hasFilledJiraConnection(workspace) && workspace.jira) {
        setWorkspaceSyncStateById((prev) => ({
          ...prev,
          [workspace.id]: {
            ...(prev[workspace.id] ?? { isSyncing: false }),
            isSyncing: true,
            lastError: undefined,
          },
        }));

        try {
          const syncStartedAtIso = new Date().toISOString();
          const result = await importJiraProjectData(
            {
              baseUrl: workspace.jira.baseUrl,
              projectKey: workspace.jira.projectKey,
              email: workspace.jira.email,
              apiToken: workspace.jira.apiToken,
            },
            workspace.id,
            {
              knownIssueIds: [],
              signal: options?.signal,
              onDebugLog: options?.onJiraProgress,
            },
          );

          setStories((prev) => {
            const incomingMap = new Map(
              result.stories.map((s) => [keyByWorkspaceAndId(s), s]),
            );

            const merged = prev.map((s) => {
              const key = keyByWorkspaceAndId(s);
              const incoming = incomingMap.get(key);
              if (!incoming) return s;
              incomingMap.delete(key);
              return { ...s, ...incoming };
            });

            for (const story of incomingMap.values()) {
              merged.push(story);
            }

            return merged;
          });

          setRelations((prev) => {
            const merged = [...prev, ...result.relations];
            const byId = new Map(merged.map((r) => [r.id, r]));
            return Array.from(byId.values());
          });

          workspace.jira = {
            ...workspace.jira,
            lastSyncAt: syncStartedAtIso,
            lastSyncStatus: "success",
            lastSyncError: undefined,
          };

          setWorkspaceSyncStateById((prev) => ({
            ...prev,
            [workspace.id]: {
              isSyncing: false,
              lastSyncAt: syncStartedAtIso,
              lastFetchedCount: result.fetchedIssueCount,
              lastImportedCount: result.stories.length,
              lastError: undefined,
            },
          }));
        } catch (error) {
          setWorkspaceSyncStateById((prev) => {
            const next = { ...prev };
            delete next[workspace.id];
            return next;
          });
          if (isAbortError(error)) {
            throw new Error("Jira-Import abgebrochen. Workspace wurde nicht erstellt.");
          }
          throw error;
        }
      }

      const nextCustom = [...customWorkspaces, workspace];
      persistCustom(nextCustom);

      setSelectedWorkspaceIdState(workspace.id);
      persistWorkspaceId(workspace.id);

      return workspace;
    },
    [customWorkspaces, persistCustom],
  );

  const storiesInWorkspace = useMemo(
    () => filterStoriesByWorkspace(stories, selectedWorkspaceId),
    [stories, selectedWorkspaceId],
  );

  const notificationsInWorkspace = useMemo(
    () =>
      notifications.filter(
        (n) => n.workspaceId == null || n.workspaceId === selectedWorkspaceId,
      ),
    [notifications, selectedWorkspaceId],
  );

  const unreadCount = notificationsInWorkspace.filter((n) => !n.read).length;

  const getEffectiveProjectTeam = useCallback(
    (projectId: string) =>
      projectTeamOverrides[projectId] ??
      PROJECT_TEAM_BY_ID[projectId] ??
      [],
    [projectTeamOverrides],
  );

  const isPrototypeUserOnProjectTeam = useCallback(
    (projectId: string) =>
      getEffectiveProjectTeam(projectId).includes(PROTOTYPE_USER_INITIALS),
    [getEffectiveProjectTeam],
  );

  const myProjectIdsInWorkspace = useMemo(() => {
    return getProjectIdsForWorkspace(selectedWorkspaceId).filter((pid) =>
      (
        projectTeamOverrides[pid] ??
        PROJECT_TEAM_BY_ID[pid] ??
        []
      ).includes(PROTOTYPE_USER_INITIALS),
    );
  }, [projectTeamOverrides, selectedWorkspaceId]);

  const addMemberToProjectTeam = useCallback(
    (projectId: string, memberInitials: string) => {
      if (PROJECT_WORKSPACE[projectId] !== selectedWorkspaceId) return;
      const member = memberInitials.trim();
      if (!member || !ALL_TEAM_ROSTER_INITIALS.includes(member)) return;
      setProjectTeamOverrides((prev) => {
        const base = PROJECT_TEAM_BY_ID[projectId] ?? [];
        const current = [...(prev[projectId] ?? base)];
        if (current.includes(member)) return prev;
        const next = [...current, member];
        const nextMap = { ...prev };
        if (projectTeamsEqual(next, base)) delete nextMap[projectId];
        else nextMap[projectId] = next;
        persistProjectTeamOverrides(nextMap);
        return nextMap;
      });
    },
    [selectedWorkspaceId],
  );

  const removeMemberFromProjectTeam = useCallback(
    (projectId: string, memberInitials: string) => {
      if (PROJECT_WORKSPACE[projectId] !== selectedWorkspaceId) return;
      setProjectTeamOverrides((prev) => {
        const base = PROJECT_TEAM_BY_ID[projectId] ?? [];
        const current = prev[projectId] ?? base;
        const next = current.filter((x) => x !== memberInitials);
        const nextMap = { ...prev };
        if (projectTeamsEqual(next, base)) delete nextMap[projectId];
        else nextMap[projectId] = next;
        persistProjectTeamOverrides(nextMap);
        return nextMap;
      });
    },
    [selectedWorkspaceId],
  );

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

  const addExportRecord = useCallback((record: Omit<ExportRecord, "id">) => {
    setExportHistory((prev) => [
      { ...record, id: `EXP-${Date.now()}` },
      ...prev,
    ]);
  }, []);

  const value: AppState = {
    workspaces,
    selectedWorkspaceId,
    setSelectedWorkspaceId,
    selectedWorkspace,
    ticketSystem,
    addWorkspace,
    updateWorkspace,
    removeWorkspace,
    stories,
    storiesInWorkspace,
    relations,
    updateStories,
    createWorkspace,
    syncWorkspaceFromJira,
    workspaceSyncStateById,
    storyActions,
    setStoryAction,
    resetStoryActions,
    notifications,
    notificationsInWorkspace,
    markNotificationRead,
    unreadCount,
    exportHistory,
    addExportRecord,
    showExportDialog,
    setShowExportDialog,
    exportScope,
    setExportScope,
    myProjectIdsInWorkspace,
    getEffectiveProjectTeam,
    addMemberToProjectTeam,
    removeMemberFromProjectTeam,
    isPrototypeUserOnProjectTeam,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useAppContext must be used within AppProvider");
  return ctx;
}
