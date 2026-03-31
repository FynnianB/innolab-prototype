import {
  AlertTriangle,
  Bug,
  CheckCircle2,
  ChevronDown,
  ClipboardList,
  Copy,
  Download,
  FileText,
  GitCompare,
  Globe,
  Layers,
  Link2,
  Search,
  Sparkles,
  X,
  XCircle,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useNavigate, useSearchParams } from "react-router";
import { StoryLink } from "../components/StoryLink";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Checkbox } from "../components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../components/ui/popover";
import { cn } from "../components/ui/utils";
import { useAppContext } from "../context/AppContext";
import {
  allRelations,
  getRelationsForId,
  type Story,
  type TicketRelation,
} from "../data/stories";
import {
  getProjectIdsForWorkspace,
  PROJECT_SEARCH_META,
  PROJECT_WORKSPACE,
} from "../data/workspaces";

/* ------------------------------------------------------------------ */
/*  Config                                                              */
/* ------------------------------------------------------------------ */

const relationTypeConfig: Record<
  string,
  { label: string; color: string; bg: string; icon: typeof Copy }
> = {
  duplicates: {
    label: "Duplikat",
    color: "#9333ea",
    bg: "#faf5ff",
    icon: Copy,
  },
  depends_on: {
    label: "Abhängigkeit",
    color: "#2563eb",
    bg: "#eff6ff",
    icon: Link2,
  },
  blocks: {
    label: "Blockiert",
    color: "#dc2626",
    bg: "#fef2f2",
    icon: AlertTriangle,
  },
  related_to: {
    label: "Verwandt",
    color: "#4f46e5",
    bg: "#f1f0ff",
    icon: Layers,
  },
};

const statusConfig: Record<string, { color: string; bg: string }> = {
  Draft: { color: "#64748b", bg: "#f1f5f9" },
  "To Do": { color: "#64748b", bg: "#f1f5f9" },
  "In Review": { color: "#92400e", bg: "#fef3c7" },
  "In Progress": { color: "#1e40af", bg: "#dbeafe" },
  Approved: { color: "#065f46", bg: "#d1fae5" },
  Done: { color: "#065f46", bg: "#d1fae5" },
};

const sourceConfig: Record<
  string,
  { label: string; icon: typeof Sparkles; color: string }
> = {
  "ai-generated": { label: "AI-generiert", icon: Sparkles, color: "#4f46e5" },
  "jira-import": { label: "Jira-Import", icon: Globe, color: "#2684ff" },
  manual: { label: "Manuell", icon: FileText, color: "#64748b" },
};

const typeIcons: Record<string, typeof FileText> = {
  Story: FileText,
  Epic: Layers,
  Bug: Bug,
  Task: ClipboardList,
};

type RelationType = TicketRelation["type"];
type StatusQuickFilter = "all" | "open" | "active" | "done";

function countRelationsByType(relations: TicketRelation[]) {
  const c = { duplicates: 0, depends_on: 0, blocks: 0, related_to: 0 };
  relations.forEach((r) => {
    if (r.type in c) c[r.type as keyof typeof c]++;
  });
  return c;
}

function storyIdsTouchingRelationType(
  workspaceStoryIds: Set<string>,
  type: RelationType,
): Set<string> {
  const ids = new Set<string>();
  allRelations.forEach((r) => {
    if (r.type !== type) return;
    if (workspaceStoryIds.has(r.sourceId)) ids.add(r.sourceId);
    if (workspaceStoryIds.has(r.targetId)) ids.add(r.targetId);
  });
  return ids;
}

/* ------------------------------------------------------------------ */
/*  Relation Card (in focus mode)                                      */
/* ------------------------------------------------------------------ */

function RelationCard({
  relation,
  otherStory,
  confirmedIds,
  dismissedIds,
  onConfirm,
  onDismiss,
}: {
  relation: TicketRelation;
  otherStory: Story | undefined;
  confirmedIds: Set<string>;
  dismissedIds: Set<string>;
  onConfirm: (id: string) => void;
  onDismiss: (id: string) => void;
}) {
  const cfg =
    relationTypeConfig[relation.type] || relationTypeConfig.related_to;
  const isConfirmed = confirmedIds.has(relation.id);
  const isDismissed = dismissedIds.has(relation.id);

  return (
    <div
      className={`border rounded-xl p-4 transition-all ${
        isDismissed
          ? "border-slate-100 bg-slate-50/50 opacity-60"
          : isConfirmed
            ? "border-green-200 bg-green-50/30"
            : "border-slate-200 bg-white hover:border-indigo-200 hover:shadow-sm"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <StoryLink
              id={otherStory?.id || relation.sourceId}
              className="text-[12px]"
            />
            <span
              className="text-[10px] px-2 py-0.5 rounded-full"
              style={{
                color: cfg.color,
                backgroundColor: cfg.bg,
                fontWeight: 500,
              }}
            >
              {cfg.label}
            </span>
            {isConfirmed && (
              <span className="text-[10px] text-green-600 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Bestätigt
              </span>
            )}
            {isDismissed && (
              <span className="text-[10px] text-slate-400 flex items-center gap-1">
                <XCircle className="w-3 h-3" /> Verworfen
              </span>
            )}
          </div>
          {otherStory && (
            <p
              className="text-[13px] text-slate-800 mb-1"
              style={{ fontWeight: 500 }}
            >
              {otherStory.title}
            </p>
          )}
          <p className="text-[12px] text-slate-500 leading-relaxed">
            {relation.description}
          </p>
          <div className="flex items-center gap-3 mt-2">
            <div className="flex items-center gap-1.5">
              <div className="w-16 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${relation.confidence}%`,
                    backgroundColor:
                      relation.confidence >= 85
                        ? "#10b981"
                        : relation.confidence >= 70
                          ? "#f59e0b"
                          : "#ef4444",
                  }}
                />
              </div>
              <span className="text-[10px] text-slate-400">
                {relation.confidence}%
              </span>
            </div>
            {otherStory && (
              <span className="text-[10px] text-slate-400">
                {otherStory.project}
              </span>
            )}
          </div>
        </div>
      </div>
      {!isConfirmed && !isDismissed && (
        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-100">
          <Button
            size="sm"
            variant="outline"
            className="text-[11px] h-7 gap-1 text-green-600 border-green-200 hover:bg-green-50"
            onClick={() => onConfirm(relation.id)}
          >
            <CheckCircle2 className="w-3 h-3" /> Bestätigen
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="text-[11px] h-7 gap-1 text-slate-400 hover:bg-slate-50"
            onClick={() => onDismiss(relation.id)}
          >
            <XCircle className="w-3 h-3" /> Verwerfen
          </Button>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Issue detail — Jira-ähnlich: Hauptinhalt + rechte Metadaten-Spalte   */
/*  (Farben & Typo wie Rest der App: Indigo / Slate)                    */
/* ------------------------------------------------------------------ */

function IssueDetailPane({
  story,
  stories,
  onClose,
  confirmedIds,
  dismissedIds,
  onConfirm,
  onDismiss,
}: {
  story: Story;
  stories: Story[];
  onClose: () => void;
  confirmedIds: Set<string>;
  dismissedIds: Set<string>;
  onConfirm: (id: string) => void;
  onDismiss: (id: string) => void;
}) {
  const navigate = useNavigate();
  const relations = useMemo(() => getRelationsForId(story.id), [story.id]);

  const grouped = useMemo(() => {
    const groups: Record<
      string,
      { relation: TicketRelation; other: Story | undefined }[]
    > = {
      duplicates: [],
      depends_on: [],
      blocks: [],
      related_to: [],
    };
    relations.forEach((r) => {
      const otherId = r.sourceId === story.id ? r.targetId : r.sourceId;
      const other = stories.find((s) => s.id === otherId);
      const key = r.type in groups ? r.type : "related_to";
      groups[key].push({ relation: r, other });
    });
    return groups;
  }, [relations, story.id, stories]);

  const sc = statusConfig[story.status] || statusConfig.Draft;
  const src = sourceConfig[story.source] || sourceConfig.manual;

  const groupLabels: Record<string, string> = {
    duplicates: "Duplikate / Überschneidungen",
    depends_on: "Abhängigkeiten",
    blocks: "Blockaden",
    related_to: "Verwandte Stories",
  };

  const fieldRow = (label: string, value: ReactNode) => (
    <div className="grid grid-cols-[minmax(0,38%)_1fr] gap-x-3 gap-y-0.5 py-2.5 border-b border-slate-100/90 last:border-0">
      <dt className="text-[11px] text-slate-500 leading-snug pt-0.5">{label}</dt>
      <dd className="text-[12px] text-slate-800 min-w-0 break-words leading-snug m-0">
        {value}
      </dd>
    </div>
  );

  return (
    <div className="flex flex-1 min-w-0 min-h-0 flex-col lg:flex-row bg-white">
      <div className="flex-1 min-w-0 min-h-0 overflow-y-auto border-b lg:border-b-0 lg:border-r border-slate-200">
        <div className="sticky top-0 z-[1] flex items-center justify-between gap-2 px-4 py-3 border-b border-slate-100 bg-white/95 backdrop-blur-sm">
          <div className="min-w-0 flex items-center gap-2 flex-wrap">
            <span
              className="text-[13px] text-[#4f46e5] truncate"
              style={{ fontWeight: 600 }}
            >
              {story.id}
            </span>
            <Badge
              variant="secondary"
              className="text-[10px] shrink-0"
              style={{ backgroundColor: sc.bg, color: sc.color, fontWeight: 500 }}
            >
              {story.status}
            </Badge>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0 text-slate-500 hover:text-slate-800 lg:hidden"
            onClick={onClose}
            aria-label="Auswahl schließen"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="p-4 sm:p-5 space-y-5">
          <div>
            <h2
              className="text-[17px] sm:text-[18px] text-slate-900 leading-snug mb-2"
              style={{ fontWeight: 600 }}
            >
              {story.title}
            </h2>
            <p className="text-[13px] text-slate-600 leading-relaxed">
              {story.description}
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            className="text-[12px] border-slate-200 text-[#4f46e5] hover:bg-[#f1f5ff]"
            onClick={() => navigate(`/story/${story.id}`)}
          >
            Vollständige Story-Ansicht
          </Button>

          <div id="story-relations" className="scroll-mt-4">
            <div className="flex items-center gap-2 mb-3">
              <GitCompare className="w-4 h-4 text-[#4f46e5]" />
              <h3
                className="text-[14px] text-slate-900"
                style={{ fontWeight: 600 }}
              >
                Zusammenhänge
              </h3>
              {relations.length > 0 && (
                <span className="text-[11px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                  {relations.length}
                </span>
              )}
            </div>
            {relations.length === 0 ? (
              <p className="text-[13px] text-slate-500 py-4 rounded-xl border border-dashed border-slate-200 bg-slate-50/50 text-center">
                Keine Zusammenhänge für diesen Vorgang.
              </p>
            ) : (
              <p className="text-[12px] text-slate-500 mb-3">
                Duplikate, Abhängigkeiten und Beziehungen — bestätigen oder
                verwerfen.
              </p>
            )}
            {relations.length > 0 &&
              Object.entries(grouped).map(([type, items]) => {
                if (items.length === 0) return null;
                const cfg = relationTypeConfig[type] || relationTypeConfig.related_to;
                return (
                  <div key={type} className="mb-5 last:mb-0">
                    <div className="flex items-center gap-2 mb-2">
                      <cfg.icon className="w-4 h-4" style={{ color: cfg.color }} />
                      <h4
                        className="text-[13px] text-slate-800"
                        style={{ fontWeight: 600 }}
                      >
                        {groupLabels[type] || type}
                      </h4>
                      <span className="text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                        {items.length}
                      </span>
                    </div>
                    <div className="space-y-2">
                      {items.map(({ relation, other }) => (
                        <RelationCard
                          key={relation.id}
                          relation={relation}
                          otherStory={other}
                          confirmedIds={confirmedIds}
                          dismissedIds={dismissedIds}
                          onConfirm={onConfirm}
                          onDismiss={onDismiss}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>

      <aside className="w-full lg:w-[300px] xl:w-[320px] shrink-0 flex flex-col overflow-hidden border-t lg:border-t-0 lg:border-l border-slate-200 bg-gradient-to-b from-[#f8f7ff] via-white to-slate-50/90">
        <div className="shrink-0 px-4 py-3 border-b border-slate-200/80 bg-white/90 backdrop-blur-sm">
          <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-1" style={{ fontWeight: 600 }}>
            Kontext
          </p>
          <p className="text-[13px] text-[#4f46e5] truncate" style={{ fontWeight: 600 }}>
            {story.id}
          </p>
          <p className="text-[11px] text-slate-500 truncate mt-0.5" title={story.project}>
            {story.project}
          </p>
        </div>
        <div className="flex-1 min-h-0 overflow-y-auto p-4">
          <div className="rounded-xl border border-slate-200/90 bg-white shadow-sm ring-1 ring-slate-100/80 overflow-hidden">
            <div className="px-3 py-2 bg-gradient-to-r from-[#f1f5ff] to-white border-b border-slate-100">
              <p className="text-[11px] text-[#4f46e5]" style={{ fontWeight: 600 }}>
                Eigenschaften
              </p>
            </div>
            <dl className="px-3 pb-1">
              {fieldRow("Typ", (() => {
                const TypeIc = typeIcons[story.type] || FileText;
                return (
                  <span className="flex items-center gap-1.5">
                    <TypeIc className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    {story.type}
                  </span>
                );
              })())}
              {fieldRow(
                "Quelle",
                <span className="flex items-center gap-1.5 min-w-0">
                  <src.icon className="w-3.5 h-3.5 shrink-0" style={{ color: src.color }} />
                  <span className="truncate">{src.label}</span>
                </span>,
              )}
              {fieldRow(
                "Priorität",
                story.priority ? (
                  <Badge
                    variant="secondary"
                    className="text-[10px] font-medium"
                    style={{
                      backgroundColor:
                        story.priority === "Hoch"
                          ? "#fef2f2"
                          : story.priority === "Mittel"
                            ? "#fef3c7"
                            : "#f1f5f9",
                      color:
                        story.priority === "Hoch"
                          ? "#dc2626"
                          : story.priority === "Mittel"
                            ? "#f59e0b"
                            : "#64748b",
                    }}
                  >
                    {story.priority}
                  </Badge>
                ) : (
                  "—"
                ),
              )}
              {story.assignee && fieldRow("Assignee", story.assignee)}
              {story.sprint && fieldRow("Sprint", story.sprint)}
              {story.storyPoints != null &&
                fieldRow("Story Points", String(story.storyPoints))}
            </dl>
          </div>
        </div>
      </aside>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */

export function StoryAnalysis() {
  const {
    storiesInWorkspace: stories,
    stories: allStoriesForRelations,
    selectedWorkspace,
    selectedWorkspaceId,
    setShowExportDialog,
    setExportScope,
  } = useAppContext();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStoryId, setSelectedStoryId] = useState<string | null>(null);
  const [sourceFilter, setSourceFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [confirmedIds, setConfirmedIds] = useState<Set<string>>(new Set());
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());
  const [selectedProjectIds, setSelectedProjectIds] = useState<Set<string>>(
    () => new Set(),
  );
  const [statusQuickFilter, setStatusQuickFilter] =
    useState<StatusQuickFilter>("all");
  const [filterWithLinks, setFilterWithLinks] = useState(false);
  const [filterHighPriority, setFilterHighPriority] = useState(false);
  const [relationTypeFilter, setRelationTypeFilter] =
    useState<RelationType | null>(null);

  /** Verhindert, dass die URL bei jedem Render die Projekt-Mehrfachauswahl überschreibt. */
  const lastSyncedProjectIdFromUrl = useRef<string | null>(null);

  const projectIdFromUrl = searchParams.get("projectId");
  const projectSelectionKey = useMemo(
    () => [...selectedProjectIds].sort().join("\0"),
    [selectedProjectIds],
  );

  const projectOptions = useMemo(() => {
    return getProjectIdsForWorkspace(selectedWorkspaceId)
      .map((id) => {
        const meta = PROJECT_SEARCH_META[id];
        if (!meta) return null;
        return { id, name: meta.name };
      })
      .filter(Boolean) as { id: string; name: string }[];
  }, [selectedWorkspaceId]);

  const prevWorkspaceIdRef = useRef(selectedWorkspaceId);

  useLayoutEffect(() => {
    const pid = projectIdFromUrl;
    const ws = selectedWorkspaceId;
    const workspaceChanged = prevWorkspaceIdRef.current !== ws;
    if (workspaceChanged) {
      prevWorkspaceIdRef.current = ws;
      if (pid && PROJECT_SEARCH_META[pid] && PROJECT_WORKSPACE[pid] === ws) {
        lastSyncedProjectIdFromUrl.current = pid;
        setSelectedProjectIds(new Set([pid]));
      } else {
        setSelectedProjectIds(new Set());
        lastSyncedProjectIdFromUrl.current = null;
        if (pid) {
          setSearchParams(
            (prev) => {
              const next = new URLSearchParams(prev);
              next.delete("projectId");
              return next;
            },
            { replace: true },
          );
        }
      }
      return;
    }

    if (pid && PROJECT_SEARCH_META[pid] && PROJECT_WORKSPACE[pid] === ws) {
      if (lastSyncedProjectIdFromUrl.current !== pid) {
        lastSyncedProjectIdFromUrl.current = pid;
        setSelectedProjectIds(new Set([pid]));
      }
      return;
    }
    if (pid && PROJECT_SEARCH_META[pid] && PROJECT_WORKSPACE[pid] !== ws) {
      lastSyncedProjectIdFromUrl.current = null;
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          next.delete("projectId");
          return next;
        },
        { replace: true },
      );
      return;
    }
    if (pid && !PROJECT_SEARCH_META[pid]) {
      lastSyncedProjectIdFromUrl.current = null;
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          next.delete("projectId");
          return next;
        },
        { replace: true },
      );
    }
  }, [projectIdFromUrl, selectedWorkspaceId, setSearchParams]);

  useEffect(() => {
    if (selectedProjectIds.size === 1) {
      const only = [...selectedProjectIds][0];
      if (projectIdFromUrl !== only) {
        setSearchParams(
          (prev) => {
            const next = new URLSearchParams(prev);
            next.set("projectId", only);
            return next;
          },
          { replace: true },
        );
      }
      return;
    }
    if (selectedProjectIds.size !== 1 && projectIdFromUrl) {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          next.delete("projectId");
          return next;
        },
        { replace: true },
      );
    }
  }, [projectSelectionKey, selectedProjectIds, projectIdFromUrl, setSearchParams]);

  const toggleProjectId = useCallback((id: string) => {
    setSelectedProjectIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const clearProjectSelection = useCallback(() => {
    lastSyncedProjectIdFromUrl.current = null;
    setSelectedProjectIds(new Set());
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.delete("projectId");
        return next;
      },
      { replace: true },
    );
  }, [setSearchParams]);

  const onRelationTypeFilterClick = useCallback((type: RelationType) => {
    setRelationTypeFilter((prev) => (prev === type ? null : type));
  }, []);

  const openIssueDetails = useCallback((id: string) => {
    setSelectedStoryId(id);
  }, []);

  const relationsTouchingWorkspace = useMemo(() => {
    const ids = new Set(stories.map((s) => s.id));
    return allRelations.filter(
      (r) => ids.has(r.sourceId) || ids.has(r.targetId),
    );
  }, [stories]);

  /** Nur Kanten im Workspace — konsistent mit „Mit Verknüpfungen“ und Badge. */
  const relationCountMap = useMemo(() => {
    const counts: Record<string, number> = {};
    relationsTouchingWorkspace.forEach((r) => {
      counts[r.sourceId] = (counts[r.sourceId] || 0) + 1;
      counts[r.targetId] = (counts[r.targetId] || 0) + 1;
    });
    return counts;
  }, [relationsTouchingWorkspace]);

  const relationTypeCounts = useMemo(
    () => countRelationsByType(relationsTouchingWorkspace),
    [relationsTouchingWorkspace],
  );

  const workspaceStoryIdSet = useMemo(
    () => new Set(stories.map((s) => s.id)),
    [stories],
  );

  const filteredStories = useMemo(() => {
    let result = stories;

    if (selectedProjectIds.size > 0) {
      const names = [...selectedProjectIds]
        .map((id) => PROJECT_SEARCH_META[id]?.name)
        .filter(Boolean) as string[];
      result = result.filter((s) => names.includes(s.project));
    }

    if (relationTypeFilter) {
      const allowed = storyIdsTouchingRelationType(
        workspaceStoryIdSet,
        relationTypeFilter,
      );
      result = result.filter((s) => allowed.has(s.id));
    }

    if (statusQuickFilter === "open") {
      result = result.filter(
        (s) => s.status !== "Done" && s.status !== "Approved",
      );
    } else if (statusQuickFilter === "active") {
      result = result.filter(
        (s) => s.status === "In Progress" || s.status === "In Review",
      );
    } else if (statusQuickFilter === "done") {
      result = result.filter(
        (s) => s.status === "Done" || s.status === "Approved",
      );
    }

    if (filterWithLinks) {
      result = result.filter((s) => (relationCountMap[s.id] || 0) > 0);
    }
    if (filterHighPriority) {
      result = result.filter((s) => s.priority === "Hoch");
    }

    if (sourceFilter !== "all")
      result = result.filter((s) => s.source === sourceFilter);
    if (typeFilter !== "all")
      result = result.filter((s) => s.type === typeFilter);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (s) =>
          s.id.toLowerCase().includes(q) ||
          s.title.toLowerCase().includes(q) ||
          s.project.toLowerCase().includes(q) ||
          (s.description || "").toLowerCase().includes(q),
      );
    }
    return result;
  }, [
    stories,
    selectedProjectIds,
    relationTypeFilter,
    workspaceStoryIdSet,
    statusQuickFilter,
    filterWithLinks,
    filterHighPriority,
    relationCountMap,
    sourceFilter,
    typeFilter,
    searchQuery,
  ]);

  const selectedStory = selectedStoryId
    ? stories.find((s) => s.id === selectedStoryId) ??
      allStoriesForRelations.find((s) => s.id === selectedStoryId) ??
      null
    : null;

  const handleConfirm = (id: string) => {
    setConfirmedIds((prev) => new Set([...prev, id]));
    setDismissedIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  const handleDismiss = (id: string) => {
    setDismissedIds((prev) => new Set([...prev, id]));
    setConfirmedIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  const statusQuickOptions: { value: StatusQuickFilter; label: string }[] = [
    { value: "all", label: "Alle" },
    { value: "open", label: "Offen" },
    { value: "active", label: "In Arbeit" },
    { value: "done", label: "Fertig" },
  ];

  const relationFilterRows: {
    type: RelationType;
    label: string;
    count: number;
  }[] = [
    { type: "duplicates", label: "Duplikate", count: relationTypeCounts.duplicates },
    {
      type: "depends_on",
      label: "Abhängigkeiten",
      count: relationTypeCounts.depends_on,
    },
    { type: "blocks", label: "Blockaden", count: relationTypeCounts.blocks },
    { type: "related_to", label: "Verwandt", count: relationTypeCounts.related_to },
  ];

  const chipBase =
    "px-3 py-1.5 rounded-full text-[12px] border transition-colors";
  const chipOn = "border-[#4f46e5] bg-[#4f46e5] text-white";
  const chipOff = "border-slate-200 bg-white text-slate-600 hover:bg-slate-50";

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1440px] mx-auto min-w-0 flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-[#f1f0ff] flex items-center justify-center shrink-0 border border-[#e0e7ff]">
            <ClipboardList className="w-5 h-5 text-[#4f46e5]" />
          </div>
          <div className="min-w-0">
            <h1
              className="text-[20px] text-slate-900"
              style={{ fontWeight: 700 }}
            >
              Alle Stories
            </h1>
            <p className="text-[13px] text-slate-500 truncate">
              Workspace:{" "}
              <span className="text-slate-700" style={{ fontWeight: 500 }}>
                {selectedWorkspace.name}
              </span>
              {" · "}
              Navigator: Vorgangsliste links, Details rechts
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 text-[12px] shrink-0 border-slate-200"
          onClick={() => {
            setExportScope("jira");
            setShowExportDialog(true);
          }}
        >
          <Download className="w-3.5 h-3.5" />
          Export
        </Button>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm flex flex-col min-h-[min(72vh,760px)]">
        <div className="shrink-0 border-b border-slate-200 px-3 sm:px-4 py-3 space-y-3 bg-white">
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 min-w-[200px] max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Vorgänge durchsuchen (ID, Titel, Projekt …)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-[13px] bg-white border border-slate-200 rounded-xl text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#4f46e5]/20 focus:border-[#4f46e5]/40"
              />
            </div>

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className={cn(
                    "h-9 gap-1.5 text-[12px] border-slate-200 bg-white text-slate-700 font-normal shrink-0",
                    selectedProjectIds.size > 0 && "border-[#4f46e5]/40 bg-[#f1f5ff]/50",
                  )}
                >
                  Projekt
                  {selectedProjectIds.size > 0 && (
                    <span className="text-[10px] bg-[#4f46e5] text-white px-1.5 py-0.5 rounded-full font-semibold">
                      {selectedProjectIds.size}
                    </span>
                  )}
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[min(100vw-2rem,320px)] p-0" align="start">
                <div className="px-3 py-2 border-b border-slate-100 text-[11px] text-slate-500" style={{ fontWeight: 600 }}>
                  Projekte im Workspace
                </div>
                <div className="p-2 border-b border-slate-100">
                  <button
                    type="button"
                    className="w-full text-left px-2 py-2 rounded-lg text-[12px] text-[#4f46e5] hover:bg-[#f1f5ff]"
                    style={{ fontWeight: 600 }}
                    onClick={clearProjectSelection}
                  >
                    Alle Projekte anzeigen
                  </button>
                </div>
                <div className="max-h-[240px] overflow-y-auto p-2 space-y-0.5">
                  {projectOptions.map(({ id, name }) => (
                    <label
                      key={id}
                      className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-50 cursor-pointer text-[12px] text-slate-800"
                    >
                      <Checkbox
                        checked={selectedProjectIds.has(id)}
                        onCheckedChange={(checked) => {
                          if (checked === "indeterminate") return;
                          toggleProjectId(id);
                        }}
                      />
                      <span className="truncate" title={name}>
                        {name}
                      </span>
                    </label>
                  ))}
                </div>
              </PopoverContent>
            </Popover>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="h-9 text-[12px] border border-slate-200 rounded-lg px-2.5 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#4f46e5]/20 shrink-0"
            >
              <option value="all">Alle Typen</option>
              <option value="Story">Story</option>
              <option value="Epic">Epic</option>
              <option value="Bug">Bug</option>
              <option value="Task">Task</option>
            </select>

            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="h-9 text-[12px] border border-slate-200 rounded-lg px-2.5 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#4f46e5]/20 shrink-0"
            >
              <option value="all">Alle Quellen</option>
              <option value="ai-generated">AI-generiert</option>
              <option value="jira-import">Jira-Import</option>
              <option value="manual">Manuell</option>
            </select>

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className={cn(
                    "h-9 gap-1.5 text-[12px] border-slate-200 bg-white text-slate-700 font-normal shrink-0",
                    relationTypeFilter && "border-[#4f46e5]/50 bg-[#f1f5ff]/60",
                  )}
                >
                  Beziehungen
                  {relationTypeFilter && (
                    <span className="text-[10px] text-[#4f46e5] font-semibold">
                      1
                    </span>
                  )}
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[min(100vw-2rem,280px)] p-0" align="end">
                <div className="px-3 py-2 border-b border-slate-100 flex items-center justify-between gap-2">
                  <span className="text-[11px] text-slate-500" style={{ fontWeight: 600 }}>
                    Nach Beziehungstyp
                  </span>
                  {relationTypeFilter && (
                    <button
                      type="button"
                      className="text-[11px] text-[#4f46e5] hover:underline font-medium"
                      onClick={() => setRelationTypeFilter(null)}
                    >
                      Zurücksetzen
                    </button>
                  )}
                </div>
                <div className="p-1.5 space-y-0.5">
                  {relationFilterRows.map(({ type, label, count }) => {
                    const active = relationTypeFilter === type;
                    const cfg = relationTypeConfig[type];
                    return (
                      <button
                        key={type}
                        type="button"
                        onClick={() => onRelationTypeFilterClick(type)}
                        className={cn(
                          "w-full flex items-center gap-2 px-2 py-2 rounded-lg text-left text-[12px] transition-colors",
                          active
                            ? "bg-[#f1f5ff] text-[#4f46e5]"
                            : "hover:bg-slate-50 text-slate-800",
                        )}
                      >
                        <cfg.icon className="w-4 h-4 shrink-0" style={{ color: cfg.color }} />
                        <span className="flex-1 truncate">{label}</span>
                        <span className="text-[11px] text-slate-400 tabular-nums">{count}</span>
                      </button>
                    );
                  })}
                </div>
              </PopoverContent>
            </Popover>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] text-slate-500 uppercase tracking-wide mr-0.5" style={{ fontWeight: 600 }}>
              Quick-Filter
            </span>
            {statusQuickOptions.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                onClick={() => setStatusQuickFilter(value)}
                className={cn(
                  chipBase,
                  statusQuickFilter === value ? chipOn : chipOff,
                )}
                style={{ fontWeight: statusQuickFilter === value ? 600 : 500 }}
              >
                {label}
              </button>
            ))}
            <span className="hidden sm:inline w-px h-5 bg-slate-200 mx-1" aria-hidden />
            <button
              type="button"
              onClick={() => setFilterWithLinks((v) => !v)}
              className={cn(chipBase, filterWithLinks ? chipOn : chipOff)}
              style={{ fontWeight: filterWithLinks ? 600 : 500 }}
            >
              Mit Verknüpfungen
            </button>
            <button
              type="button"
              onClick={() => setFilterHighPriority((v) => !v)}
              className={cn(chipBase, filterHighPriority ? chipOn : chipOff)}
              style={{ fontWeight: filterHighPriority ? 600 : 500 }}
            >
              Hohe Priorität
            </button>
          </div>
        </div>

        <div className="flex flex-1 min-h-0 flex-col lg:flex-row">
          {/* Linke Vorgangsliste (Navigator) */}
          <div className="w-full lg:w-[min(100%,400px)] xl:w-[420px] shrink-0 flex flex-col border-b lg:border-b-0 lg:border-r border-slate-200 bg-slate-50/40 min-h-[240px] max-h-[42vh] lg:max-h-none lg:min-h-0">
            <div className="px-3 py-2 border-b border-slate-200 bg-white/80 flex items-center justify-between shrink-0">
              <span className="text-[12px] text-slate-600" style={{ fontWeight: 600 }}>
                {filteredStories.length} Vorgänge
              </span>
              <span className="text-[11px] text-slate-400 tabular-nums">
                {stories.length} im Workspace
              </span>
            </div>
            <div className="overflow-y-auto flex-1 min-h-0 p-2 space-y-1">
              {filteredStories.length === 0 ? (
                <p className="text-center text-[13px] text-slate-500 py-10 px-2">
                  Keine Vorgänge für die ausgewählten Filter.
                </p>
              ) : (
                filteredStories.map((story) => {
                  const sc = statusConfig[story.status] || statusConfig.Draft;
                  const TypeIcon = typeIcons[story.type] || FileText;
                  const rc = relationCountMap[story.id] || 0;
                  const selected = selectedStoryId === story.id;
                  return (
                    <div
                      key={story.id}
                      className={cn(
                        "rounded-xl border bg-white transition-shadow",
                        selected
                          ? "border-[#4f46e5]/35 shadow-sm ring-1 ring-[#4f46e5]/20 border-l-[3px] border-l-[#4f46e5] pl-[calc(0.75rem-3px)]"
                          : "border-slate-200 hover:border-slate-300 hover:shadow-sm border-l-[3px] border-l-transparent",
                      )}
                    >
                      <button
                        type="button"
                        onClick={() => openIssueDetails(story.id)}
                        className="w-full text-left p-3 pr-2"
                      >
                        <div className="flex gap-3">
                          <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 border border-slate-200/80">
                            <TypeIcon className="w-4 h-4 text-slate-600" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div
                              className="text-[12px] text-[#4f46e5] mb-0.5"
                              style={{ fontWeight: 600 }}
                            >
                              {story.id}
                            </div>
                            <div
                              className="text-[13px] text-slate-800 line-clamp-2 leading-snug"
                              style={{ fontWeight: 500 }}
                            >
                              {story.title}
                            </div>
                            <div className="flex items-center justify-between gap-2 mt-2">
                              <Badge
                                variant="secondary"
                                className="text-[9px] px-1.5 py-0 h-5"
                                style={{
                                  backgroundColor: sc.bg,
                                  color: sc.color,
                                  fontWeight: 500,
                                }}
                              >
                                {story.status}
                              </Badge>
                              <div className="flex items-center gap-1.5 shrink-0">
                                {rc > 0 && (
                                  <span
                                    className="text-[10px] text-[#4f46e5] bg-[#f1f5ff] px-1.5 py-0.5 rounded-full font-medium tabular-nums"
                                  >
                                    {rc}
                                  </span>
                                )}
                                {story.assignee && (
                                  <span
                                    className="text-[10px] text-slate-500 truncate max-w-[72px]"
                                    title={story.assignee}
                                  >
                                    {story.assignee}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Rechter Detailbereich */}
          <div className="flex-1 min-w-0 min-h-0 flex flex-col bg-white max-h-[52vh] lg:max-h-none">
            {selectedStory ? (
              <IssueDetailPane
                story={selectedStory}
                stories={allStoriesForRelations}
                onClose={() => setSelectedStoryId(null)}
                confirmedIds={confirmedIds}
                dismissedIds={dismissedIds}
                onConfirm={handleConfirm}
                onDismiss={handleDismiss}
              />
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-slate-500 min-h-[200px]">
                <GitCompare className="w-10 h-10 text-slate-300 mb-3" />
                <p className="text-[15px] text-slate-700 mb-1" style={{ fontWeight: 600 }}>
                  Vorgang auswählen
                </p>
                <p className="text-[13px] text-slate-500 max-w-sm">
                  Wählen Sie links einen Vorgang aus, um Details und
                  Zusammenhänge zu sehen — wie im Jira-Vorgangsnavigator.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
