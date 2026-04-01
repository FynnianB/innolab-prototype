import {
  AlertTriangle,
  Bell,
  CheckCircle2,
  ChevronDown,
  Download,
  Info,
  Menu,
  Plus,
  Search,
  Settings2,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { useAppContext } from "../../context/AppContext";
import { useMobileNav } from "../../context/MobileNavContext";
import { getTicketSystem } from "../../data/ticketSystems";
import {
  listProjectsForSearchInWorkspace,
  PROJECT_LOGO_BY_ID,
  PROTOTYPE_USER_ROLE,
  resolveWorkspaceTicketSystemId,
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
    notificationsInWorkspace,
    markNotificationRead,
    unreadCount,
    setShowExportDialog,
    setExportScope,
  } = useAppContext();
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [newWorkspaceOpen, setNewWorkspaceOpen] = useState(false);
  const [manageWorkspacesOpen, setManageWorkspacesOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

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
    const projects = listProjectsForSearchInWorkspace(selectedWorkspaceId);
    const out: { id: string; name: string }[] = [];
    for (const p of projects) {
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
  }, [selectedWorkspaceId, searchQuery]);

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
    const workspaceProjects = listProjectsForSearchInWorkspace(
      selectedWorkspaceId,
    );
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
                Dr. Sarah Müller
              </p>
              <p className="text-[11px] text-muted-foreground -mt-0.5 truncate">
                {PROTOTYPE_USER_ROLE}
              </p>
            </div>
            <Avatar className="h-8 w-8 flex-shrink-0">
              <AvatarFallback className="bg-[#4f46e5] text-white text-[12px]">
                SM
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
            {workspaces.map((ws) => (
              <DropdownMenuItem
                key={ws.id}
                onClick={() => setSelectedWorkspaceId(ws.id)}
                className={ws.id === selectedWorkspaceId ? "bg-[#f1f0ff]" : ""}
              >
                <WorkspaceGlyph workspace={ws} sizeClass="w-6 h-6 mr-2 shrink-0" />
                <div className="flex flex-col min-w-0 gap-0.5">
                  <span className="truncate">{ws.name}</span>
                  <span className="text-[10px] text-muted-foreground truncate">
                    {getTicketSystem(resolveWorkspaceTicketSystemId(ws)).name}
                  </span>
                </div>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onSelect={(e) => {
                e.preventDefault();
                setNewWorkspaceOpen(true);
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
    </>
  );
}
