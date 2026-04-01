import {
  AlertTriangle,
  Bell,
  CheckCircle2,
  ChevronDown,
  Download,
  Info,
  Loader2,
  Menu,
  Plus,
  RefreshCw,
  Search,
  Settings2,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { useAppContext } from "../../context/AppContext";
import { useMobileNav } from "../../context/MobileNavContext";
import {
  PROJECT_LOGO_BY_ID,
  PROTOTYPE_USER_DISPLAY_NAME,
  PROTOTYPE_USER_INITIALS,
  PROTOTYPE_USER_ROLE,
} from "../../data/workspaces";
import type { Workspace } from "../../data/workspaces";
import { ManageWorkspacesDialog } from "../ManageWorkspacesDialog";
import { NewWorkspaceDialog } from "../NewWorkspaceDialog";
import {
  isSearchEasterEggQuery,
  SearchEasterEgg,
} from "../SearchEasterEgg";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";

/** Normalisiert Eingaben wie "us 001", "US001" → "US-001" / "PROJ-101". */
function normalizeIdCandidates(raw: string): string[] {
  const t = raw.trim();
  if (!t) return [];
  const out = new Set<string>();
  out.add(t);
  const compact = t.toUpperCase().replace(/\s+/g, "");
  out.add(compact);
  const m = compact.match(/^(US|PROJ)-?(\d+)$/i);
  if (m) out.add(`${m[1].toUpperCase()}-${m[2]}`);
  return [...out];
}

/** z. B. "p1", "P-01" → "P-001" */
function normalizeProjectIdCandidates(raw: string): string[] {
  const t = raw.trim();
  if (!t) return [];
  const out = new Set<string>();
  out.add(t);
  const u = t.toUpperCase().replace(/\s+/g, "");
  out.add(u);
  const m = u.match(/^P-?(\d{1,3})$/);
  if (m) {
    const n = m[1].padStart(3, "0");
    out.add(`P-${n}`);
  }
  return [...out];
}

function parseProjectKeys(raw: string): string[] {
  return raw
    .split(/[,\n;]/g)
    .map((x) => x.trim())
    .filter(Boolean)
    .filter((x, i, all) => all.indexOf(x) === i);
}

function WorkspaceGlyph({
  workspace,
  sizeClass = "w-6 h-6",
  textClass = "text-[11px]",
}: {
  workspace: Pick<Workspace, "name" | "logoSrc">;
  sizeClass?: string;
  textClass?: string;
}) {
  if (workspace.logoSrc) {
    return (
      <span
        className={`inline-flex items-center justify-center rounded-md border border-border bg-white overflow-hidden shrink-0 ${sizeClass}`}
      >
        <img
          src={workspace.logoSrc}
          alt=""
          className="max-w-[85%] max-h-[85%] w-auto h-auto object-contain"
          loading="lazy"
        />
      </span>
    );
  }
  return (
    <div
      className={`rounded-md bg-[#4f46e5]/10 flex items-center justify-center shrink-0 ${sizeClass}`}
    >
      <span
        className={`text-[#4f46e5] ${textClass}`}
        style={{ fontWeight: 600 }}
      >
        {workspace.name.charAt(0)}
      </span>
    </div>
  );
}

export function Topbar() {
  const navigate = useNavigate();
  const mobileNav = useMobileNav();
  const {
    workspaces,
    selectedWorkspace,
    selectedWorkspaceId,
    setSelectedWorkspaceId,
    storiesInWorkspace,
    workspaceProjects,
    notificationsInWorkspace,
    markNotificationRead,
    unreadCount,
    setShowExportDialog,
    setExportScope,
    createWorkspace,
    syncWorkspaceFromJira,
    workspaceSyncStateById,
    pushWorkspaceToJira,
    workspacePushStateById,
  } = useAppContext();
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [newWorkspaceOpen, setNewWorkspaceOpen] = useState(false);
  const [manageWorkspacesOpen, setManageWorkspacesOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showNewWorkspaceDialog, setShowNewWorkspaceDialog] = useState(false);
  const [isCreatingWorkspace, setIsCreatingWorkspace] = useState(false);
  const [workspaceFormError, setWorkspaceFormError] = useState<string | null>(null);
  const [workspaceCreatePhase, setWorkspaceCreatePhase] = useState<
    "form" | "loading" | "success" | "error"
  >("form");
  const [workspaceCreateMessage, setWorkspaceCreateMessage] =
    useState<string | null>(null);
  const [workspaceCreateLogs, setWorkspaceCreateLogs] = useState<string[]>([]);
  const [showJiraExportDialog, setShowJiraExportDialog] = useState(false);
  const [jiraExportPhase, setJiraExportPhase] = useState<
    "idle" | "running" | "success" | "error"
  >("idle");
  const [jiraExportLogs, setJiraExportLogs] = useState<string[]>([]);
  const [jiraExportMessage, setJiraExportMessage] = useState<string | null>(null);
  const [workspaceForm, setWorkspaceForm] = useState({
    name: "",
    logoSrc: "",
    enableJira: true,
    baseUrl: "",
    projectKeys: "",
    importAllProjects: false,
    email: "",
    apiToken: "",
  });
  const searchInputRef = useRef<HTMLInputElement>(null);
  const createAbortControllerRef = useRef<AbortController | null>(null);

  const appendWorkspaceLog = (line: string) => {
    setWorkspaceCreateLogs((prev) => [...prev, line]);
  };

  const appendJiraExportLog = (line: string) => {
    setJiraExportLogs((prev) => [...prev, line]);
  };

  const formatErrorForDialog = (error: unknown): string => {
    if (error instanceof Error) {
      const stack =
        typeof error.stack === "string"
          ? error.stack.split("\n").slice(0, 3).join("\n")
          : "";
      return stack ? `${error.name}: ${error.message}\n${stack}` : `${error.name}: ${error.message}`;
    }
    try {
      return JSON.stringify(error);
    } catch {
      return String(error);
    }
  };

  const storySearchMatches = useMemo(() => {
    const q = searchQuery.trim();
    if (q.length < 1) return [];
    const ql = q.toLowerCase();
    const candidates = normalizeIdCandidates(q).map((c) => c.toLowerCase());
    const seen = new Set<string>();
    const list: { id: string; title: string; project: string }[] = [];
    for (const s of storiesInWorkspace) {
      if (seen.has(s.id)) continue;
      const idl = s.id.toLowerCase();
      const titlel = s.title.toLowerCase();
      const idHit =
        idl.includes(ql) ||
        candidates.some(
          (c) => idl === c || idl.replace(/-/g, "") === c.replace(/-/g, ""),
        );
      const titleHit = titlel.includes(ql);
      if (!idHit && !titleHit) continue;
      seen.add(s.id);
      list.push({ id: s.id, title: s.title, project: s.project });
      if (list.length >= 10) break;
    }
    return list.sort((a, b) =>
      a.id.localeCompare(b.id, undefined, { numeric: true }),
    );
  }, [storiesInWorkspace, searchQuery]);

  const projectSearchMatches = useMemo(() => {
    const q = searchQuery.trim();
    if (q.length < 1) return [];
    const ql = q.toLowerCase();
    const pc = normalizeProjectIdCandidates(q).map((c) => c.toUpperCase());
    const out: { id: string; name: string }[] = [];
    for (const p of workspaceProjects) {
      const idl = p.id.toLowerCase();
      const idHit =
        idl.includes(ql) ||
        pc.some(
          (c) =>
          p.id.toUpperCase() === c ||
          p.id.toUpperCase().replace(/-/g, "") === c.replace(/-/g, ""),
        );
      const textHit =
        p.name.toLowerCase().includes(ql) ||
        p.description.toLowerCase().includes(ql);
      if (!idHit && !textHit) continue;
      out.push({ id: p.id, name: p.name });
      if (out.length >= 8) break;
    }
    return out.sort((a, b) =>
      a.id.localeCompare(b.id, undefined, { numeric: true }),
    );
  }, [searchQuery, workspaceProjects]);

  const flatSearchItems = useMemo(() => {
    const items: { kind: "story" | "project"; id: string }[] = [];
    for (const s of storySearchMatches)
      items.push({ kind: "story", id: s.id });
    for (const p of projectSearchMatches)
      items.push({ kind: "project", id: p.id });
    return items;
  }, [storySearchMatches, projectSearchMatches]);

  const [searchHighlightIndex, setSearchHighlightIndex] = useState(-1);

  useEffect(() => {
    setSearchHighlightIndex(-1);
  }, [searchQuery, selectedWorkspaceId]);

  useEffect(() => {
    setSearchHighlightIndex((prev) => {
      if (prev < 0) return prev;
      if (flatSearchItems.length === 0) return -1;
      return Math.min(prev, flatSearchItems.length - 1);
    });
  }, [flatSearchItems]);

  useEffect(() => {
    if (searchHighlightIndex < 0) return;
    document
      .getElementById(`topbar-search-option-${searchHighlightIndex}`)
      ?.scrollIntoView({ block: "nearest" });
  }, [searchHighlightIndex]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const openStory = (id: string) => {
    setSearchHighlightIndex(-1);
    navigate(`/story/${encodeURIComponent(id)}`);
    setSearchQuery("");
    setSearchFocused(false);
    searchInputRef.current?.blur();
  };

  const openProject = (id: string) => {
    setSearchHighlightIndex(-1);
    navigate(`/projects/${encodeURIComponent(id)}`);
    setSearchQuery("");
    setSearchFocused(false);
    searchInputRef.current?.blur();
  };

  const resolveSearch = () => {
    const q = searchQuery.trim();
    if (!q) return;
    if (isSearchEasterEggQuery(q)) return;
    const storyCand = normalizeIdCandidates(q);
    const byExactStory = storiesInWorkspace.find((s) =>
      storyCand.some((c) => s.id.toUpperCase() === c.toUpperCase()),
    );
    if (byExactStory) {
      openStory(byExactStory.id);
      return;
    }
    const projCand = normalizeProjectIdCandidates(q);
    const byExactProj = workspaceProjects.find((p) =>
      projCand.some((c) => p.id.toUpperCase() === c.toUpperCase()),
    );
    if (byExactProj) {
      openProject(byExactProj.id);
      return;
    }
    const ql = q.toLowerCase();
    const byIdStories = storiesInWorkspace.filter((s) =>
      s.id.toLowerCase().includes(ql),
    );
    if (byIdStories.length === 1) {
      openStory(byIdStories[0].id);
      return;
    }
    const byIdProjs = workspaceProjects.filter((p) =>
      p.id.toLowerCase().includes(ql),
    );
    if (byIdProjs.length === 1) {
      openProject(byIdProjs[0].id);
      return;
    }
    if (storySearchMatches.length === 1) {
      openStory(storySearchMatches[0].id);
      return;
    }
    if (projectSearchMatches.length === 1) {
      openProject(projectSearchMatches[0].id);
      return;
    }
    if (storySearchMatches.length >= 1) {
      openStory(storySearchMatches[0].id);
      return;
    }
    if (projectSearchMatches.length >= 1) {
      openProject(projectSearchMatches[0].id);
    }
  };

  const notifTypeIcon = (type: string) => {
    if (type === "success")
      return <CheckCircle2 className="w-3.5 h-3.5 text-[#10b981]" />;
    if (type === "warning")
      return <AlertTriangle className="w-3.5 h-3.5 text-[#f59e0b]" />;
    if (type === "error") return <X className="w-3.5 h-3.5 text-[#ef4444]" />;
    return <Info className="w-3.5 h-3.5 text-[#4f46e5]" />;
  };

  const resetWorkspaceForm = () => {
    setWorkspaceForm({
      name: "",
      logoSrc: "",
      enableJira: true,
      baseUrl: "",
      projectKeys: "",
      importAllProjects: false,
      email: "",
      apiToken: "",
    });
    setWorkspaceFormError(null);
    setWorkspaceCreatePhase("form");
    setWorkspaceCreateMessage(null);
    setWorkspaceCreateLogs([]);
  };

  const onLogoPicked = async (file: File | null) => {
    if (!file) return;
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ""));
      reader.onerror = () => reject(new Error("Logo konnte nicht geladen werden."));
      reader.readAsDataURL(file);
    });
    setWorkspaceForm((prev) => ({ ...prev, logoSrc: dataUrl }));
  };

  const submitNewWorkspace = async () => {
    const name = workspaceForm.name.trim();
    if (!name) {
      setWorkspaceFormError("Bitte einen Workspace-Namen eingeben.");
      return;
    }

    if (workspaceForm.enableJira) {
      const parsedProjectKeys = parseProjectKeys(workspaceForm.projectKeys);
      const missing = [
        workspaceForm.baseUrl.trim(),
        workspaceForm.email.trim(),
        workspaceForm.apiToken.trim(),
      ].some((v) => !v) || (!workspaceForm.importAllProjects && parsedProjectKeys.length === 0);
      if (missing) {
        setWorkspaceFormError(
          "Für die Jira-Verbindung bitte Base URL, E-Mail und API-Key ausfüllen. Bei deaktivierter Option \"Alle Projekte\" zusätzlich mindestens einen Projekt-Key angeben.",
        );
        return;
      }
    }

    setWorkspaceFormError(null);
    setWorkspaceCreateMessage(null);
    setWorkspaceCreateLogs([]);
    setWorkspaceCreatePhase("loading");
    setIsCreatingWorkspace(true);
    const controller = new AbortController();
    createAbortControllerRef.current = controller;
    appendWorkspaceLog("Workspace-Erstellung gestartet");
    appendWorkspaceLog("Initialer Jira-Import wird vorbereitet");
    try {
      const created = await createWorkspace({
        name,
        logoSrc: workspaceForm.logoSrc || undefined,
        jiraConnection: workspaceForm.enableJira
          ? {
              baseUrl: workspaceForm.baseUrl,
              projectKeys: parseProjectKeys(workspaceForm.projectKeys),
              importScope: workspaceForm.importAllProjects ? "all" : "selected",
              email: workspaceForm.email,
              apiToken: workspaceForm.apiToken,
            }
          : undefined,
      }, {
        signal: controller.signal,
        onJiraProgress: (message) => {
          appendWorkspaceLog(message);
        },
      });
      appendWorkspaceLog(`Workspace erstellt: ${created.id}`);
      setWorkspaceCreatePhase("success");
      setWorkspaceCreateMessage(
        `Workspace "${created.name}" wurde erfolgreich erstellt und importiert.`,
      );
      setWorkspaceForm((prev) => ({ ...prev, apiToken: "" }));
    } catch (error) {
      const msg = formatErrorForDialog(error);
      appendWorkspaceLog(`ERROR: ${msg}`);
      setWorkspaceFormError(msg);
      setWorkspaceCreatePhase("error");
      setWorkspaceCreateMessage(msg);
    } finally {
      createAbortControllerRef.current = null;
      setIsCreatingWorkspace(false);
    }
  };

  const renderConsoleLog = () => (
    <div className="rounded-md border border-border bg-[#0b1021] text-[#dbeafe] px-3 py-2 text-[11px] max-h-[220px] overflow-auto whitespace-pre-wrap break-all font-mono">
      {workspaceCreateLogs.length === 0
        ? "Noch keine Log-Ausgaben."
        : workspaceCreateLogs.join("\n")}
    </div>
  );

  const renderJiraExportLog = () => (
    <div className="rounded-md border border-border bg-[#0b1021] text-[#dbeafe] px-3 py-2 text-[11px] max-h-[260px] overflow-auto whitespace-pre-wrap break-all font-mono">
      {jiraExportLogs.length === 0
        ? "Noch keine Log-Ausgaben."
        : jiraExportLogs.join("\n")}
    </div>
  );

  const cancelWorkspaceCreation = () => {
    createAbortControllerRef.current?.abort();
  };

  const startJiraExport = async () => {
    setShowJiraExportDialog(true);
    setJiraExportPhase("running");
    setJiraExportMessage(null);
    setJiraExportLogs([]);
    appendJiraExportLog(`Export gestartet (${new Date().toLocaleTimeString("de-DE")})`);
    try {
      const result = await pushWorkspaceToJira(selectedWorkspace.id, {
        onProgress: (line) => appendJiraExportLog(line),
      });
      const summary = `Erstellt: ${result.createdCount}, Aktualisiert: ${result.updatedCount}, Übersprungen: ${result.skippedCount}, Konflikte (lokal gewinnt): ${result.conflictCount}, Fehler: ${result.failedCount}`;
      appendJiraExportLog(summary);
      setJiraExportMessage(summary);
      setJiraExportPhase("success");
    } catch (error) {
      const msg = formatErrorForDialog(error);
      appendJiraExportLog(`ERROR: ${msg}`);
      setJiraExportMessage(msg);
      setJiraExportPhase("error");
    }
  };

  const headerActions = (
    <>
      <Button
        variant="outline"
        size="sm"
        className="text-[13px] gap-1.5 sm:gap-2 h-9 px-2 sm:px-3 border-border"
        data-tour="topbar-export"
        onClick={() => {
          setExportScope("all");
          setShowExportDialog(true);
        }}
      >
        <Download className="w-4 h-4" />
        <span className="hidden sm:inline">Export</span>
      </Button>

      <DropdownMenu
        open={showNotifications}
        onOpenChange={setShowNotifications}
      >
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="relative p-2 rounded-lg hover:bg-[#f1f5f9] transition-colors"
          >
            <Bell className="w-[18px] h-[18px] text-[#64748b]" />
            {unreadCount > 0 && (
              <span
                className="absolute top-1 right-1 min-w-[16px] h-4 px-1 bg-[#ef4444] rounded-full flex items-center justify-center text-[9px] text-white"
                style={{ fontWeight: 700 }}
              >
                {unreadCount}
              </span>
            )}
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[360px] p-0">
          <div className="px-4 py-3 border-b border-border flex items-center justify-between">
            <span
              className="text-[13px] text-[#1e1e2e]"
              style={{ fontWeight: 600 }}
            >
              Benachrichtigungen
            </span>
            {unreadCount > 0 && (
              <Badge
                variant="secondary"
                className="text-[10px] bg-[#ef4444]/10 text-[#ef4444]"
              >
                {unreadCount} neu
              </Badge>
            )}
          </div>
          <div className="max-h-[320px] overflow-y-auto">
            {notificationsInWorkspace.length === 0 ? (
              <div className="px-4 py-8 text-center text-[12px] text-muted-foreground">
                Keine Benachrichtigungen in diesem Workspace.
              </div>
            ) : (
              notificationsInWorkspace.map((notif) => (
                <div
                  key={notif.id}
                  className={`px-4 py-3 border-b border-border last:border-0 hover:bg-[#f8fafc] cursor-pointer transition-colors ${
                    !notif.read ? "bg-[#f1f0ff]/30" : ""
                  }`}
                  onClick={() => markNotificationRead(notif.id)}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">{notifTypeIcon(notif.type)}</div>
                    <div className="flex-1 min-w-0">
                      <p
                        className="text-[12px] text-[#1e1e2e]"
                        style={{ fontWeight: notif.read ? 400 : 500 }}
                      >
                        {notif.text}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] text-muted-foreground">
                          {notif.project}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {notif.time}
                        </span>
                      </div>
                    </div>
                    {!notif.read && (
                      <div className="w-2 h-2 rounded-full bg-[#4f46e5] mt-1.5 flex-shrink-0" />
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="flex items-center gap-1.5 sm:gap-2 pl-2 sm:pl-3 pr-1 py-1 rounded-lg hover:bg-[#f1f5f9] transition-colors min-w-0"
          >
            <div className="text-right mr-0 sm:mr-1 min-w-0 hidden md:block">
              <p className="text-[13px] truncate" style={{ fontWeight: 500 }}>
                {PROTOTYPE_USER_DISPLAY_NAME}
              </p>
              <p className="text-[11px] text-muted-foreground -mt-0.5 truncate">
                {PROTOTYPE_USER_ROLE}
              </p>
            </div>
            <Avatar className="h-8 w-8 flex-shrink-0">
              <AvatarFallback className="bg-[#4f46e5] text-white text-[12px]">
                {PROTOTYPE_USER_INITIALS}
              </AvatarFallback>
            </Avatar>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[200px]">
          <DropdownMenuItem>Profil</DropdownMenuItem>
          <DropdownMenuItem>Team verwalten</DropdownMenuItem>
          <DropdownMenuItem>
            <div className="flex items-center justify-between w-full">
              Plan
              <Badge variant="secondary" className="text-[10px] ml-2">
                Enterprise
              </Badge>
            </div>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="text-[#ef4444]">
            Abmelden
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );

  const searchField = (
    <div className="relative w-full min-w-0 max-w-full" data-tour="topbar-search">
      <div
        className={`flex items-center gap-2 px-2 sm:px-3 py-1.5 rounded-lg border transition-all duration-200 ${
          searchFocused
            ? "border-[#4f46e5] bg-white shadow-sm"
            : "border-border bg-[#f8fafc]"
        }`}
      >
        <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
        <input
          ref={searchInputRef}
          type="search"
          autoComplete="off"
          aria-autocomplete="list"
          aria-controls="topbar-search-suggestions"
          aria-expanded={
            searchFocused &&
            searchQuery.trim().length > 0 &&
            !isSearchEasterEggQuery(searchQuery) &&
            flatSearchItems.length > 0
          }
          aria-activedescendant={
            searchHighlightIndex >= 0
              ? `topbar-search-option-${searchHighlightIndex}`
              : undefined
          }
          role="combobox"
          aria-label="Stories, Projekte und IDs im Workspace suchen"
          placeholder="Stories, Projekte… (Ctrl+K)"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => setSearchFocused(true)}
          onBlur={() => {
            window.setTimeout(() => setSearchFocused(false), 180);
          }}
          onKeyDown={(e) => {
            const suggestOpen =
              searchFocused &&
              searchQuery.trim().length > 0 &&
              !isSearchEasterEggQuery(searchQuery) &&
              flatSearchItems.length > 0;
            const len = flatSearchItems.length;

            if (e.key === "ArrowDown" && suggestOpen) {
              e.preventDefault();
              setSearchHighlightIndex((i) => (i < 0 ? 0 : (i + 1) % len));
              return;
            }
            if (e.key === "ArrowUp" && suggestOpen) {
              e.preventDefault();
              setSearchHighlightIndex((i) =>
                i < 0 ? len - 1 : (i - 1 + len) % len,
              );
              return;
            }
            if (e.key === "Enter") {
              e.preventDefault();
              if (
                searchHighlightIndex >= 0 &&
                searchHighlightIndex < flatSearchItems.length
              ) {
                const it = flatSearchItems[searchHighlightIndex];
                if (it.kind === "story") openStory(it.id);
                else openProject(it.id);
                return;
              }
              resolveSearch();
              return;
            }
            if (e.key === "Escape") {
              e.preventDefault();
              setSearchHighlightIndex(-1);
              setSearchQuery("");
              searchInputRef.current?.blur();
            }
          }}
          className="bg-transparent outline-none w-full min-w-0 text-[13px] placeholder:text-muted-foreground"
        />
      </div>
      {searchFocused &&
        searchQuery.trim().length > 0 &&
        !isSearchEasterEggQuery(searchQuery) && (
        <div
          id="topbar-search-suggestions"
          role="listbox"
          aria-label="Suchvorschläge"
          className="absolute left-0 right-0 top-full mt-1 z-50 rounded-lg border border-border bg-white shadow-lg max-h-[min(70vh,360px)] overflow-y-auto py-1"
          onMouseDown={(e) => e.preventDefault()}
        >
          {storySearchMatches.length === 0 &&
          projectSearchMatches.length === 0 ? (
            <div className="px-3 py-2.5 text-[12px] text-muted-foreground">
              Keine Stories oder Projekte im aktuellen Workspace.
            </div>
          ) : (
            <>
              {storySearchMatches.length > 0 && (
                <>
                  <div
                    className="px-3 py-1.5 text-[10px] uppercase tracking-wide text-muted-foreground"
                    style={{ fontWeight: 600 }}
                  >
                    Stories
                  </div>
                  {storySearchMatches.map((m, si) => {
                    const globalIdx = si;
                    const active = searchHighlightIndex === globalIdx;
                    return (
                    <button
                      key={m.id}
                      id={`topbar-search-option-${globalIdx}`}
                      type="button"
                      role="option"
                      aria-selected={active}
                      className={`w-full text-left px-3 py-2 flex flex-col gap-0.5 border-b border-transparent last:border-0 ${
                        active ? "bg-[#f1f5f9]" : "hover:bg-[#f8fafc]"
                      }`}
                      onMouseEnter={() => setSearchHighlightIndex(globalIdx)}
                      onClick={() => openStory(m.id)}
                    >
                      <span
                        className="text-[12px] text-[#4f46e5]"
                        style={{ fontWeight: 600 }}
                      >
                        {m.id}
                      </span>
                      <span className="text-[11px] text-[#1e1e2e] truncate">
                        {m.title}
                      </span>
                      <span className="text-[10px] text-muted-foreground truncate">
                        {m.project}
                      </span>
                    </button>
                    );
                  })}
                </>
              )}
              {projectSearchMatches.length > 0 && (
                <>
                  <div
                    className="px-3 py-1.5 text-[10px] uppercase tracking-wide text-muted-foreground"
                    style={{ fontWeight: 600 }}
                  >
                    Projekte
                  </div>
                  {projectSearchMatches.map((p, pi) => {
                    const globalIdx = storySearchMatches.length + pi;
                    const active = searchHighlightIndex === globalIdx;
                    return (
                    <button
                      key={p.id}
                      id={`topbar-search-option-${globalIdx}`}
                      type="button"
                      role="option"
                      aria-selected={active}
                      className={`w-full text-left px-3 py-2 flex items-start gap-2.5 ${
                        active ? "bg-[#f1f5f9]" : "hover:bg-[#f8fafc]"
                      }`}
                      onMouseEnter={() => setSearchHighlightIndex(globalIdx)}
                      onClick={() => openProject(p.id)}
                    >
                      {PROJECT_LOGO_BY_ID[p.id] ? (
                        <span className="w-9 h-9 shrink-0 rounded-md border border-border bg-white flex items-center justify-center">
                          <img
                            src={PROJECT_LOGO_BY_ID[p.id]}
                            alt=""
                            className="max-w-[26px] max-h-[26px] object-contain"
                            loading="lazy"
                          />
                        </span>
                      ) : null}
                      <div className="min-w-0 flex-1 flex flex-col gap-0.5">
                        <span
                          className="text-[12px] text-[#0d9488]"
                          style={{ fontWeight: 600 }}
                        >
                          {p.id}
                        </span>
                        <span className="text-[11px] text-[#1e1e2e] truncate">
                          {p.name}
                        </span>
                      </div>
                    </button>
                    );
                  })}
                </>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );

  return (
    <>
    <header
      className="grid shrink-0 min-w-0 border-b border-border bg-white px-4 py-2 sm:px-6 gap-x-2 gap-y-2
      grid-cols-[minmax(0,1fr)_auto]
      xl:grid-cols-[auto_minmax(0,1fr)_auto] xl:items-center xl:h-16 xl:gap-x-4 xl:py-0"
    >
      <div className="flex items-center gap-2 min-w-0 xl:col-start-1 xl:row-start-1">
        <button
          type="button"
          className="lg:hidden p-2 rounded-lg hover:bg-[#f1f5f9] transition-colors -ml-1 shrink-0"
          data-tour="topbar-mobile-menu"
          onClick={() => mobileNav?.openSidebar()}
          aria-label="Menü öffnen"
        >
          <Menu className="w-5 h-5 text-[#64748b]" />
        </button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              title={selectedWorkspace.name}
              data-tour="topbar-workspace"
              className="flex items-center gap-2 px-2 sm:px-3 py-1.5 rounded-lg hover:bg-[#f1f5f9] transition-colors text-[14px] min-w-0 max-w-full"
            >
              <WorkspaceGlyph workspace={selectedWorkspace} />
              <span
                className="hidden sm:inline truncate min-w-0 max-w-[100px] md:max-w-[160px] xl:max-w-[200px]"
                style={{ fontWeight: 500 }}
              >
                {selectedWorkspace.name}
              </span>
              <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-[260px]">
            {workspaces.map((ws) => {
              const sync = workspaceSyncStateById[ws.id];
              const push = workspacePushStateById[ws.id];
              return (
                <DropdownMenuItem
                  key={ws.id}
                  onClick={() => setSelectedWorkspaceId(ws.id)}
                  className={ws.id === selectedWorkspaceId ? "bg-[#f1f0ff]" : ""}
                >
                  <WorkspaceGlyph workspace={ws} sizeClass="w-6 h-6 mr-2" />
                  <span className="flex-1 truncate">{ws.name}</span>
                  {sync?.isSyncing || push?.isPushing ? (
                    <Loader2 className="w-3.5 h-3.5 text-[#4f46e5] animate-spin" />
                  ) : sync?.lastError || push?.lastError ? (
                    <AlertTriangle className="w-3.5 h-3.5 text-[#ef4444]" />
                  ) : ws.jira?.lastSyncStatus === "success" ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#10b981]" />
                  ) : null}
                </DropdownMenuItem>
              );
            })}
            {selectedWorkspace.jira?.enabled ? (
              <DropdownMenuItem
                onClick={() => {
                  void syncWorkspaceFromJira(selectedWorkspace.id);
                }}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Jira aktualisieren
              </DropdownMenuItem>
            ) : null}
            {selectedWorkspace.jira?.enabled ? (
              <DropdownMenuItem
                onClick={() => {
                  void startJiraExport();
                }}
              >
                <Download className="w-4 h-4 mr-2" />
                Änderungen nach Jira exportieren
              </DropdownMenuItem>
            ) : null}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => {
                setShowNewWorkspaceDialog(true);
                setWorkspaceFormError(null);
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Neuer Workspace
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onSelect={(e) => {
                e.preventDefault();
                setManageWorkspacesOpen(true);
              }}
            >
              <Settings2 className="w-4 h-4 mr-2" />
              Manage Workspaces
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Eine Instanz: Radix-Dropdowns dürfen nicht doppelt im DOM sein (geteilter open-State). */}
      <div className="flex items-center gap-1 sm:gap-3 shrink-0 justify-self-end row-start-1 col-start-2 xl:col-start-3 xl:row-start-1">
        {headerActions}
      </div>

      <div className="col-span-2 min-w-0 xl:col-span-1 xl:col-start-2 xl:row-start-1 xl:min-w-[180px] xl:max-w-2xl">
        {searchField}
      </div>
    </header>
    <NewWorkspaceDialog
      open={newWorkspaceOpen}
      onOpenChange={setNewWorkspaceOpen}
    />
    <ManageWorkspacesDialog
      open={manageWorkspacesOpen}
      onOpenChange={setManageWorkspacesOpen}
    />
    <SearchEasterEgg
      searchQuery={searchQuery}
      onClose={() => setSearchQuery("")}
    />

    <Dialog
      open={showNewWorkspaceDialog}
      onOpenChange={(open) => {
        if (!open && isCreatingWorkspace) {
          return;
        }
        setShowNewWorkspaceDialog(open);
        if (!open) resetWorkspaceForm();
      }}
    >
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Neuen Workspace anlegen</DialogTitle>
          <DialogDescription>
            Name, optionales Logo und Jira-Verbindung hinterlegen. Beim Speichern wird
            der initiale Jira-Import gestartet. Sie können mehrere Projekt-Keys
            angeben oder alle Projekte importieren.
          </DialogDescription>
        </DialogHeader>
        {workspaceCreatePhase === "loading" ? (
          <div className="py-8 flex flex-col items-center text-center gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-[#4f46e5]" />
            <div className="space-y-1">
              <p className="text-[14px] text-[#1e1e2e]" style={{ fontWeight: 600 }}>
                Jira-Import läuft
              </p>
              <p className="text-[12px] text-muted-foreground max-w-[360px]">
                Tickets werden aus Jira geladen und in den Workspace übernommen.
                Der Workspace wird erst nach erfolgreichem Import erstellt.
              </p>
            </div>
            <Button variant="outline" onClick={cancelWorkspaceCreation}>
              Abbrechen
            </Button>
            <div className="w-full max-w-[520px] text-left">
              {renderConsoleLog()}
            </div>
          </div>
        ) : workspaceCreatePhase === "success" ? (
          <div className="py-8 flex flex-col items-center text-center gap-4">
            <CheckCircle2 className="w-8 h-8 text-[#10b981]" />
            <div className="space-y-1">
              <p className="text-[14px] text-[#1e1e2e]" style={{ fontWeight: 600 }}>
                Import erfolgreich
              </p>
              <p className="text-[12px] text-muted-foreground max-w-[420px] whitespace-pre-wrap">
                {workspaceCreateMessage}
              </p>
            </div>
            <div className="w-full max-w-[520px] text-left">
              {renderConsoleLog()}
            </div>
            <Button
              onClick={() => {
                setShowNewWorkspaceDialog(false);
                resetWorkspaceForm();
              }}
            >
              Schließen
            </Button>
          </div>
        ) : workspaceCreatePhase === "error" ? (
          <div className="py-6 flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-[#ef4444]" />
              <p className="text-[14px] text-[#1e1e2e]" style={{ fontWeight: 600 }}>
                Import fehlgeschlagen
              </p>
            </div>
            <div className="text-[12px] text-[#7f1d1d] bg-[#fef2f2] border border-[#fecaca] rounded-md px-3 py-2 whitespace-pre-wrap break-all">
              {workspaceCreateMessage || "Unbekannter Fehler"}
            </div>
            {renderConsoleLog()}
            <div className="flex items-center justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setWorkspaceCreatePhase("form");
                }}
              >
                Zurück
              </Button>
              <Button
                onClick={() => {
                  setShowNewWorkspaceDialog(false);
                  resetWorkspaceForm();
                }}
              >
                Schließen
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="space-y-4 py-2">
              <div>
                <label className="text-[12px] text-muted-foreground block mb-1.5">
                  Workspace-Name
                </label>
                <input
                  value={workspaceForm.name}
                  onChange={(e) =>
                    setWorkspaceForm((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="z. B. Jira Beispielprojekt"
                  className="w-full px-3 py-2 rounded-md border border-border text-[13px] outline-none focus:ring-2 focus:ring-[#4f46e5]/20"
                />
              </div>

              <div>
                <label className="text-[12px] text-muted-foreground block mb-1.5">
                  Logo (optional)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const f = e.target.files?.[0] ?? null;
                      void onLogoPicked(f);
                    }}
                    className="text-[12px]"
                  />
                  {workspaceForm.logoSrc ? (
                    <span className="w-8 h-8 rounded border border-border bg-white overflow-hidden inline-flex items-center justify-center">
                      <img src={workspaceForm.logoSrc} alt="" className="max-w-[85%] max-h-[85%]" />
                    </span>
                  ) : null}
                </div>
              </div>

              <label className="flex items-center gap-2 text-[13px]">
                <input
                  type="checkbox"
                  checked={workspaceForm.enableJira}
                  onChange={(e) =>
                    setWorkspaceForm((prev) => ({ ...prev, enableJira: e.target.checked }))
                  }
                />
                Jira-Verbindung einrichten
              </label>

              {workspaceForm.enableJira ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="sm:col-span-2">
                    <label className="text-[12px] text-muted-foreground block mb-1.5">
                      Jira Base URL
                    </label>
                    <input
                      value={workspaceForm.baseUrl}
                      onChange={(e) =>
                        setWorkspaceForm((prev) => ({ ...prev, baseUrl: e.target.value }))
                      }
                      placeholder="https://deinprojekt.atlassian.net"
                      className="w-full px-3 py-2 rounded-md border border-border text-[13px] outline-none focus:ring-2 focus:ring-[#4f46e5]/20"
                    />
                  </div>
                  <div>
                    <label className="text-[12px] text-muted-foreground block mb-1.5">
                      Projekt-Keys
                    </label>
                    <input
                      value={workspaceForm.projectKeys}
                      onChange={(e) =>
                        setWorkspaceForm((prev) => ({ ...prev, projectKeys: e.target.value }))
                      }
                      placeholder="z. B. SCRUM, ABC (kommagetrennt)"
                      className="w-full px-3 py-2 rounded-md border border-border text-[13px] outline-none focus:ring-2 focus:ring-[#4f46e5]/20"
                      disabled={workspaceForm.importAllProjects}
                    />
                  </div>
                  <div>
                    <label className="text-[12px] text-muted-foreground block mb-1.5">
                      E-Mail
                    </label>
                    <input
                      value={workspaceForm.email}
                      onChange={(e) =>
                        setWorkspaceForm((prev) => ({ ...prev, email: e.target.value }))
                      }
                      placeholder="name@firma.de"
                      className="w-full px-3 py-2 rounded-md border border-border text-[13px] outline-none focus:ring-2 focus:ring-[#4f46e5]/20"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="flex items-center gap-2 text-[12px] text-muted-foreground mb-2">
                      <input
                        type="checkbox"
                        checked={workspaceForm.importAllProjects}
                        onChange={(e) =>
                          setWorkspaceForm((prev) => ({
                            ...prev,
                            importAllProjects: e.target.checked,
                          }))
                        }
                      />
                      Alle Jira-Projekte importieren (statt ausgewählter Keys)
                    </label>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-[12px] text-muted-foreground block mb-1.5">
                      API-Key
                    </label>
                    <input
                      type="password"
                      value={workspaceForm.apiToken}
                      onChange={(e) =>
                        setWorkspaceForm((prev) => ({ ...prev, apiToken: e.target.value }))
                      }
                      placeholder="Atlassian API Token"
                      className="w-full px-3 py-2 rounded-md border border-border text-[13px] outline-none focus:ring-2 focus:ring-[#4f46e5]/20"
                    />
                  </div>
                </div>
              ) : null}

              {workspaceFormError ? (
                <div className="text-[12px] text-[#ef4444] bg-[#fef2f2] border border-[#fecaca] rounded-md px-3 py-2">
                  {workspaceFormError}
                </div>
              ) : null}
              {workspaceCreateLogs.length > 0 ? renderConsoleLog() : null}
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setShowNewWorkspaceDialog(false);
                  resetWorkspaceForm();
                }}
                disabled={isCreatingWorkspace}
              >
                Abbrechen
              </Button>
              <Button
                onClick={() => {
                  void submitNewWorkspace();
                }}
                disabled={isCreatingWorkspace}
                className="bg-[#4f46e5] hover:bg-[#4338ca] text-white gap-2"
              >
                Workspace erstellen
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>

    <Dialog
      open={showJiraExportDialog}
      onOpenChange={(open) => {
        const pushing = workspacePushStateById[selectedWorkspace.id]?.isPushing;
        if (!open && pushing) return;
        setShowJiraExportDialog(open);
        if (!open) {
          setJiraExportPhase("idle");
          setJiraExportMessage(null);
          setJiraExportLogs([]);
        }
      }}
    >
      <DialogContent className="sm:max-w-[620px]">
        <DialogHeader>
          <DialogTitle>Jira Export</DialogTitle>
          <DialogDescription>
            Inkrementeller Export für den aktuellen Workspace. Bei Konflikten gewinnt die lokale Version.
          </DialogDescription>
        </DialogHeader>

        {jiraExportPhase === "running" ? (
          <div className="py-4 space-y-4">
            <div className="flex items-center gap-2 text-[13px] text-[#1e1e2e]">
              <Loader2 className="w-4 h-4 animate-spin text-[#4f46e5]" />
              Export läuft...
            </div>
            {renderJiraExportLog()}
            <div className="text-[11px] text-muted-foreground">
              Der Dialog bleibt offen. Schließen ist während des Exports deaktiviert.
            </div>
          </div>
        ) : jiraExportPhase === "success" ? (
          <div className="py-4 space-y-4">
            <div className="flex items-center gap-2 text-[13px] text-[#065f46]">
              <CheckCircle2 className="w-4 h-4 text-[#10b981]" />
              Export abgeschlossen
            </div>
            {jiraExportMessage ? (
              <div className="text-[12px] text-[#065f46] bg-[#ecfdf5] border border-[#bbf7d0] rounded-md px-3 py-2">
                {jiraExportMessage}
              </div>
            ) : null}
            {renderJiraExportLog()}
            <DialogFooter>
              <Button onClick={() => setShowJiraExportDialog(false)}>
                Schließen
              </Button>
            </DialogFooter>
          </div>
        ) : jiraExportPhase === "error" ? (
          <div className="py-4 space-y-4">
            <div className="flex items-center gap-2 text-[13px] text-[#7f1d1d]">
              <AlertTriangle className="w-4 h-4 text-[#ef4444]" />
              Export fehlgeschlagen
            </div>
            {jiraExportMessage ? (
              <div className="text-[12px] text-[#7f1d1d] bg-[#fef2f2] border border-[#fecaca] rounded-md px-3 py-2 whitespace-pre-wrap break-all">
                {jiraExportMessage}
              </div>
            ) : null}
            {renderJiraExportLog()}
            <DialogFooter>
              <Button variant="outline" onClick={() => void startJiraExport()}>
                Erneut versuchen
              </Button>
              <Button onClick={() => setShowJiraExportDialog(false)}>
                Schließen
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <div className="py-4 space-y-4">
            <div className="text-[13px] text-[#1e1e2e]">
              Starten Sie den Export für den aktuellen Workspace.
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowJiraExportDialog(false)}>
                Abbrechen
              </Button>
              <Button onClick={() => void startJiraExport()}>
                Export starten
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
    </>
  );
}
