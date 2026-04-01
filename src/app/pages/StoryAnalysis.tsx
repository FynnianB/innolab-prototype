import {
  AlertTriangle,
  Bug,
  CheckCircle2,
  ChevronDown,
  ClipboardList,
  Copy,
  FileText,
  FolderOpen,
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../components/ui/popover";
import { RadioGroup, RadioGroupItem } from "../components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
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
  PROJECT_LOGO_BY_ID,
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

/** Einheitliche Filter-Trigger (Popover / Radix-Select): neutral, Akzent nur bei open oder aktivem Filter. */
const filterFieldTriggerClass =
  "rounded-xl border border-slate-200 bg-white text-[12px] text-slate-700 shadow-sm transition-[border-color,box-shadow,background-color] duration-150 hover:border-slate-300 hover:bg-slate-50/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4f46e5]/20 data-[state=open]:border-[#4f46e5]/40 data-[state=open]:ring-2 data-[state=open]:ring-[#4f46e5]/12";

const filterSelectContentClass =
  "z-[200] rounded-xl border border-slate-200 bg-white shadow-lg";

function ProjectFilterGlyph({
  projectId,
  size = "md",
}: {
  /** `null` = „Alle Projekte“ */
  projectId: string | null;
  size?: "sm" | "md";
}) {
  const outer =
    size === "sm"
      ? "flex size-7 shrink-0 items-center justify-center overflow-hidden rounded-md border border-slate-200/90 bg-white"
      : "flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-slate-200/90 bg-white";
  const imgClass =
    size === "sm" ? "size-5 object-contain" : "size-[22px] object-contain";

  if (!projectId) {
    return (
      <span className={cn(outer, "bg-slate-50")} aria-hidden>
        <Layers
          className={
            size === "sm" ? "size-3.5 text-slate-500" : "size-4 text-slate-500"
          }
        />
      </span>
    );
  }
  const src = PROJECT_LOGO_BY_ID[projectId];
  if (src) {
    return (
      <span className={outer} aria-hidden>
        <img src={src} alt="" className={imgClass} loading="lazy" />
      </span>
    );
  }
  return (
    <span className={cn(outer, "bg-slate-50")} aria-hidden>
      <FolderOpen
        className={
          size === "sm" ? "size-3.5 text-slate-500" : "size-4 text-slate-500"
        }
      />
    </span>
  );
}

function countRelationsByType(relations: TicketRelation[]) {
  const c = { duplicates: 0, depends_on: 0, blocks: 0, related_to: 0 };
  relations.forEach((r) => {
    if (r.type in c) c[r.type as keyof typeof c]++;
  });
  return c;
}

/** Kanten nur aus `relations` (z. B. workspace-gefiltert) — gleiche Menge wie Badges/Zähler. */
function storyIdsTouchingRelationType(
  relations: TicketRelation[],
  workspaceStoryIds: Set<string>,
  type: RelationType,
): Set<string> {
  const ids = new Set<string>();
  for (const r of relations) {
    if (r.type !== type) continue;
    if (workspaceStoryIds.has(r.sourceId)) ids.add(r.sourceId);
    if (workspaceStoryIds.has(r.targetId)) ids.add(r.targetId);
  }
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
  ticketImportLabel,
}: {
  story: Story;
  stories: Story[];
  onClose: () => void;
  confirmedIds: Set<string>;
  dismissedIds: Set<string>;
  onConfirm: (id: string) => void;
  onDismiss: (id: string) => void;
  ticketImportLabel: string;
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
  const src =
    story.source === "jira-import"
      ? {
          ...sourceConfig["jira-import"],
          label: ticketImportLabel,
        }
      : sourceConfig[story.source] || sourceConfig.manual;

  const groupLabels: Record<string, string> = {
    duplicates: "Duplikate / Überschneidungen",
    depends_on: "Abhängigkeiten",
    blocks: "Blockaden",
    related_to: "Verwandte Stories",
  };

  const fieldRow = (label: string, value: ReactNode) => (
    <div className="grid grid-cols-[minmax(0,38%)_1fr] gap-x-3 gap-y-0.5 py-2.5 border-b border-slate-100/90 last:border-0">
      <dt className="text-[11px] text-slate-500 leading-snug pt-0.5">
        {label}
      </dt>
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
              style={{
                backgroundColor: sc.bg,
                color: sc.color,
                fontWeight: 500,
              }}
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
          <div data-tour="stories-detail-hero">
            <h2
              className="text-[17px] sm:text-[18px] text-slate-900 leading-snug mb-2"
              style={{ fontWeight: 600 }}
            >
              {story.title}
            </h2>
            <p className="text-[13px] text-slate-600 leading-relaxed">
              {story.description}
            </p>
            <Button
              variant="outline"
              size="sm"
              className="text-[12px] border-slate-200 text-[#4f46e5] hover:bg-[#f1f5ff] mt-4"
              onClick={() => navigate(`/story/${story.id}`)}
            >
              Vollständige Story-Ansicht
            </Button>
          </div>

          <div
            id="story-relations"
            data-tour="stories-detail-relations"
            className="scroll-mt-4"
          >
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
                const cfg =
                  relationTypeConfig[type] || relationTypeConfig.related_to;
                return (
                  <div key={type} className="mb-5 last:mb-0">
                    <div className="flex items-center gap-2 mb-2">
                      <cfg.icon
                        className="w-4 h-4"
                        style={{ color: cfg.color }}
                      />
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
          <p
            className="text-[10px] uppercase tracking-wider text-slate-500 mb-1"
            style={{ fontWeight: 600 }}
          >
            Kontext
          </p>
          <p
            className="text-[13px] text-[#4f46e5] truncate"
            style={{ fontWeight: 600 }}
          >
            {story.id}
          </p>
          <p
            className="text-[11px] text-slate-500 truncate mt-0.5"
            title={story.project}
          >
            {story.project}
          </p>
        </div>
        <div className="flex-1 min-h-0 overflow-y-auto p-4">
          <div className="rounded-xl border border-slate-200/90 bg-white shadow-sm ring-1 ring-slate-100/80 overflow-hidden">
            <div className="px-3 py-2 bg-gradient-to-r from-[#f1f5ff] to-white border-b border-slate-100">
              <p
                className="text-[11px] text-[#4f46e5]"
                style={{ fontWeight: 600 }}
              >
                Eigenschaften
              </p>
            </div>
            <dl className="px-3 pb-1">
              {fieldRow(
                "Typ",
                (() => {
                  const TypeIc = typeIcons[story.type] || FileText;
                  return (
                    <span className="flex items-center gap-1.5">
                      <TypeIc className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      {story.type}
                    </span>
                  );
                })(),
              )}
              {fieldRow(
                "Quelle",
                <span className="flex items-center gap-1.5 min-w-0">
                  <src.icon
                    className="w-3.5 h-3.5 shrink-0"
                    style={{ color: src.color }}
                  />
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
    myProjectIdsInWorkspace,
    ticketSystem,
  } = useAppContext();
  const ticketImportLabel = `${ticketSystem.name}-Import`;
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStoryId, setSelectedStoryId] = useState<string | null>(null);
  const [sourceFilter, setSourceFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [confirmedIds, setConfirmedIds] = useState<Set<string>>(new Set());
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());
  /** `null` = alle Projekte im Workspace; sonst genau eine Projekt-ID. */
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    null,
  );
  const [statusQuickFilter, setStatusQuickFilter] =
    useState<StatusQuickFilter>("all");
  const [filterWithLinks, setFilterWithLinks] = useState(false);
  const [relationTypeFilter, setRelationTypeFilter] =
    useState<RelationType | null>(null);
  const [projectFilterOpen, setProjectFilterOpen] = useState(false);

  const prevWorkspaceForFilters = useRef(selectedWorkspaceId);

  useLayoutEffect(() => {
    if (prevWorkspaceForFilters.current === selectedWorkspaceId) return;
    prevWorkspaceForFilters.current = selectedWorkspaceId;
    setTypeFilter("all");
    setSourceFilter("all");
    setRelationTypeFilter(null);
    setStatusQuickFilter("all");
    setFilterWithLinks(false);
    setSearchQuery("");
  }, [selectedWorkspaceId]);

  /** Verhindert, dass die URL bei jedem Render die Projekt-Mehrfachauswahl überschreibt. */
  const lastSyncedProjectIdFromUrl = useRef<string | null>(null);
  /** Default „Meine Projekte“ nur einmal pro Workspace (ohne projectId in der URL). */
  const defaultsAppliedForWorkspace = useRef<string | null>(null);

  const projectIdFromUrl = searchParams.get("projectId");

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
        setSelectedProjectId(pid);
      } else {
        lastSyncedProjectIdFromUrl.current = null;
        const first =
          myProjectIdsInWorkspace.length > 0
            ? myProjectIdsInWorkspace[0]
            : null;
        setSelectedProjectId(first);
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
        setSelectedProjectId(pid);
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
  }, [
    projectIdFromUrl,
    selectedWorkspaceId,
    setSearchParams,
    myProjectIdsInWorkspace,
  ]);

  useEffect(() => {
    const ws = selectedWorkspaceId;
    if (projectIdFromUrl) {
      defaultsAppliedForWorkspace.current = ws;
      return;
    }
    if (defaultsAppliedForWorkspace.current !== ws) {
      defaultsAppliedForWorkspace.current = ws;
      const first =
        myProjectIdsInWorkspace.length > 0 ? myProjectIdsInWorkspace[0] : null;
      setSelectedProjectId(first);
    }
  }, [selectedWorkspaceId, projectIdFromUrl, myProjectIdsInWorkspace]);

  /** State → URL (Deep Links / Teilen), ohne Schleife wenn bereits konsistent. */
  useEffect(() => {
    const pid = projectIdFromUrl;
    if (selectedProjectId) {
      if (pid === selectedProjectId) return;
    } else if (!pid) {
      return;
    }
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (selectedProjectId) next.set("projectId", selectedProjectId);
        else next.delete("projectId");
        return next;
      },
      { replace: true },
    );
  }, [selectedProjectId, projectIdFromUrl, setSearchParams]);

  const clearProjectSelection = useCallback(() => {
    lastSyncedProjectIdFromUrl.current = null;
    setSelectedProjectId(null);
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.delete("projectId");
        return next;
      },
      { replace: true },
    );
    setProjectFilterOpen(false);
  }, [setSearchParams]);

  const selectSingleProject = useCallback((id: string) => {
    lastSyncedProjectIdFromUrl.current = id;
    setSelectedProjectId(id);
    setProjectFilterOpen(false);
  }, []);

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

  const activeProjectName = useMemo(() => {
    if (!selectedProjectId) return null;
    return PROJECT_SEARCH_META[selectedProjectId]?.name ?? null;
  }, [selectedProjectId]);

  const projectTriggerLabel = useMemo(() => {
    if (!selectedProjectId) return "Alle Projekte";
    return PROJECT_SEARCH_META[selectedProjectId]?.name ?? "Projekt wählen";
  }, [selectedProjectId]);

  const filteredStories = useMemo(() => {
    let result = stories;

    if (activeProjectName) {
      result = result.filter((s) => s.project === activeProjectName);
    }

    if (relationTypeFilter) {
      const allowed = storyIdsTouchingRelationType(
        relationsTouchingWorkspace,
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
    activeProjectName,
    relationTypeFilter,
    relationsTouchingWorkspace,
    workspaceStoryIdSet,
    statusQuickFilter,
    filterWithLinks,
    relationCountMap,
    sourceFilter,
    typeFilter,
    searchQuery,
  ]);

  useLayoutEffect(() => {
    if (filteredStories.length === 0) {
      setSelectedStoryId(null);
      return;
    }
    const stillValid =
      selectedStoryId != null &&
      filteredStories.some((s) => s.id === selectedStoryId);
    if (stillValid) return;
    setSelectedStoryId(filteredStories[0].id);
  }, [filteredStories, selectedStoryId]);

  const selectedStory = selectedStoryId
    ? (stories.find((s) => s.id === selectedStoryId) ??
      allStoriesForRelations.find((s) => s.id === selectedStoryId) ??
      null)
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
    {
      type: "duplicates",
      label: "Duplikate",
      count: relationTypeCounts.duplicates,
    },
    {
      type: "depends_on",
      label: "Abhängigkeiten",
      count: relationTypeCounts.depends_on,
    },
    { type: "blocks", label: "Blockaden", count: relationTypeCounts.blocks },
    {
      type: "related_to",
      label: "Verwandt",
      count: relationTypeCounts.related_to,
    },
  ];

  const chipBase =
    "px-3 py-1.5 rounded-xl text-[12px] border transition-[color,background-color,border-color,box-shadow] duration-150";
  const chipOn =
    "border-[#4f46e5]/50 bg-[#4f46e5] text-white shadow-sm shadow-[#4f46e5]/20";
  const chipOff =
    "border-slate-200/90 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50/90";

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
              Story-Abhängigkeiten
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
      </div>

      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm flex flex-col min-h-[min(72vh,760px)]">
        <div className="shrink-0 border-b border-slate-200 px-3 sm:px-4 py-3 space-y-3 bg-white">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <Popover
              modal={false}
              open={projectFilterOpen}
              onOpenChange={setProjectFilterOpen}
            >
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  data-tour="stories-project-filter"
                  className={cn(
                    filterFieldTriggerClass,
                    "h-10 min-h-10 w-full max-w-full justify-between gap-2 px-3.5 font-medium sm:w-fit sm:min-w-[240px] sm:max-w-[min(100vw-2rem,22rem)] border-slate-200 bg-white shadow-sm hover:bg-slate-50/80",
                  )}
                >
                  <span className="flex items-center gap-2.5 min-w-0 text-left">
                    <ProjectFilterGlyph
                      projectId={selectedProjectId}
                      size="md"
                    />
                    <span className="min-w-0 truncate text-[13px] text-slate-800">
                      {projectTriggerLabel}
                    </span>
                  </span>
                  <ChevronDown className="w-4 h-4 shrink-0 text-slate-400" />
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-[min(100vw-2rem,320px)] rounded-xl border border-slate-200 p-0 shadow-lg z-[200]"
                align="start"
              >
                <div
                  className="px-3 py-2 border-b border-slate-100 text-[11px] text-slate-500"
                  style={{ fontWeight: 600 }}
                >
                  Projekt (eine Auswahl)
                </div>
                <RadioGroup
                  value={selectedProjectId ?? "__all__"}
                  onValueChange={(v) => {
                    if (v === "__all__") clearProjectSelection();
                    else selectSingleProject(v);
                  }}
                  className="gap-0"
                >
                  <label
                    htmlFor="story-proj-all"
                    className="flex cursor-pointer items-center gap-2.5 border-b border-slate-100 px-3 py-2.5 text-[12px] text-slate-800 hover:bg-slate-50/90"
                  >
                    <RadioGroupItem value="__all__" id="story-proj-all" />
                    <ProjectFilterGlyph projectId={null} size="sm" />
                    <span className="min-w-0 flex-1 font-medium text-[#4f46e5]">
                      Alle Projekte
                    </span>
                  </label>
                  <div className="max-h-[min(52vh,280px)] overflow-y-auto p-2">
                    {projectOptions.map(({ id, name }) => (
                      <label
                        key={id}
                        htmlFor={`story-proj-${id}`}
                        className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-2 text-[12px] text-slate-800 hover:bg-slate-50"
                      >
                        <RadioGroupItem value={id} id={`story-proj-${id}`} />
                        <ProjectFilterGlyph projectId={id} size="sm" />
                        <span className="min-w-0 flex-1 truncate" title={name}>
                          {name}
                        </span>
                      </label>
                    ))}
                  </div>
                </RadioGroup>
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-3" data-tour="stories-filters">
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

              <Select
                key={`type-${selectedWorkspaceId}`}
                value={typeFilter}
                onValueChange={setTypeFilter}
              >
                <SelectTrigger
                  className={cn(
                    filterFieldTriggerClass,
                    "h-9 min-h-9 w-[min(100%,9.75rem)] shrink-0 px-3 font-normal",
                  )}
                >
                  <SelectValue placeholder="Typ" />
                </SelectTrigger>
                <SelectContent
                  position="popper"
                  className={filterSelectContentClass}
                >
                  <SelectItem value="all" className="rounded-lg text-[12px]">
                    Alle Typen
                  </SelectItem>
                  <SelectItem value="Story" className="rounded-lg text-[12px]">
                    Story
                  </SelectItem>
                  <SelectItem value="Epic" className="rounded-lg text-[12px]">
                    Epic
                  </SelectItem>
                  <SelectItem value="Bug" className="rounded-lg text-[12px]">
                    Bug
                  </SelectItem>
                  <SelectItem value="Task" className="rounded-lg text-[12px]">
                    Task
                  </SelectItem>
                </SelectContent>
              </Select>

              <Select
                key={`source-${selectedWorkspaceId}`}
                value={sourceFilter}
                onValueChange={setSourceFilter}
              >
                <SelectTrigger
                  className={cn(
                    filterFieldTriggerClass,
                    "h-9 min-h-9 w-[min(100%,11rem)] shrink-0 px-3 font-normal",
                  )}
                >
                  <SelectValue placeholder="Quelle" />
                </SelectTrigger>
                <SelectContent
                  position="popper"
                  className={filterSelectContentClass}
                >
                  <SelectItem value="all" className="rounded-lg text-[12px]">
                    Alle Quellen
                  </SelectItem>
                  <SelectItem
                    value="ai-generated"
                    className="rounded-lg text-[12px]"
                  >
                    AI-generiert
                  </SelectItem>
                  <SelectItem
                    value="jira-import"
                    className="rounded-lg text-[12px]"
                  >
                    {ticketImportLabel}
                  </SelectItem>
                  <SelectItem value="manual" className="rounded-lg text-[12px]">
                    Manuell
                  </SelectItem>
                </SelectContent>
              </Select>

              <Popover modal={false}>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className={cn(
                      filterFieldTriggerClass,
                      "h-9 min-h-9 min-w-[9.5rem] gap-1.5 px-3 font-normal",
                      relationTypeFilter && "text-[#4f46e5]",
                    )}
                  >
                    <span className="truncate">Beziehungen</span>
                    {relationTypeFilter ? (
                      <span
                        className="size-1.5 shrink-0 rounded-full bg-[#4f46e5]"
                        aria-hidden
                      />
                    ) : null}
                    <ChevronDown className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-[min(100vw-2rem,280px)] rounded-xl border border-slate-200 p-0 shadow-lg z-[200]"
                  align="end"
                >
                  <div className="px-3 py-2 border-b border-slate-100 flex items-center justify-between gap-2">
                    <span
                      className="text-[11px] text-slate-500"
                      style={{ fontWeight: 600 }}
                    >
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
                          <cfg.icon
                            className="w-4 h-4 shrink-0"
                            style={{ color: cfg.color }}
                          />
                          <span className="flex-1 truncate">{label}</span>
                          <span className="text-[11px] text-slate-400 tabular-nums">
                            {count}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span
                className="text-[11px] text-slate-500 uppercase tracking-wide mr-0.5"
                style={{ fontWeight: 600 }}
              >
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
                  style={{
                    fontWeight: statusQuickFilter === value ? 600 : 500,
                  }}
                >
                  {label}
                </button>
              ))}
              <span
                className="hidden sm:inline w-px h-5 bg-slate-200 mx-1"
                aria-hidden
              />
              <button
                type="button"
                onClick={() => setFilterWithLinks((v) => !v)}
                className={cn(chipBase, filterWithLinks ? chipOn : chipOff)}
                style={{ fontWeight: filterWithLinks ? 600 : 500 }}
              >
                Mit Verknüpfungen
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-1 min-h-0 flex-col lg:flex-row">
          {/* Linke Vorgangsliste (Navigator) */}
          <div
            className="w-full lg:w-[min(100%,400px)] xl:w-[420px] shrink-0 flex flex-col border-b lg:border-b-0 lg:border-r border-slate-200 bg-slate-50/40 min-h-[240px] max-h-[42vh] lg:max-h-none lg:min-h-0"
            data-tour="stories-story-list"
          >
            <div className="px-3 py-2 border-b border-slate-200 bg-white/80 flex items-center justify-between shrink-0">
              <span
                className="text-[12px] text-slate-600"
                style={{ fontWeight: 600 }}
              >
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
                                  <span className="text-[10px] text-[#4f46e5] bg-[#f1f5ff] px-1.5 py-0.5 rounded-full font-medium tabular-nums">
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
                ticketImportLabel={ticketImportLabel}
              />
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-slate-500 min-h-[200px]">
                <GitCompare className="w-10 h-10 text-slate-300 mb-3" />
                <p
                  className="text-[15px] text-slate-700 mb-1"
                  style={{ fontWeight: 600 }}
                >
                  Vorgang auswählen
                </p>
                <p className="text-[13px] text-slate-500 max-w-sm">
                  Wählen Sie links einen Vorgang aus, um Details und
                  Zusammenhänge zu sehen — vergleichbar mit dem Vorgangsnavigator
                  in {ticketSystem.name}.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
