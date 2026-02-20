import { useState, useMemo } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import {
  Search,
  ArrowLeft,
  ChevronRight,
  GitCompare,
  Copy,
  AlertTriangle,
  Link2,
  Layers,
  Filter,
  Download,
  FileText,
  Bug,
  ClipboardList,
  Sparkles,
  Globe,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { StoryLink } from "../components/StoryLink";
import { useAppContext } from "../context/AppContext";
import {
  allRelations,
  getRelationsForId,
  type Story,
  type TicketRelation,
} from "../data/stories";

/* ------------------------------------------------------------------ */
/*  Config                                                              */
/* ------------------------------------------------------------------ */

const relationTypeConfig: Record<
  string,
  { label: string; color: string; bg: string; icon: typeof Copy }
> = {
  duplicates: { label: "Duplikat", color: "#9333ea", bg: "#faf5ff", icon: Copy },
  depends_on: { label: "Abh\u00e4ngigkeit", color: "#2563eb", bg: "#eff6ff", icon: Link2 },
  blocks: { label: "Blockiert", color: "#dc2626", bg: "#fef2f2", icon: AlertTriangle },
  related_to: { label: "Verwandt", color: "#4f46e5", bg: "#f1f0ff", icon: Layers },
};

const statusConfig: Record<string, { color: string; bg: string }> = {
  Draft: { color: "#64748b", bg: "#f1f5f9" },
  "To Do": { color: "#64748b", bg: "#f1f5f9" },
  "In Review": { color: "#92400e", bg: "#fef3c7" },
  "In Progress": { color: "#1e40af", bg: "#dbeafe" },
  Approved: { color: "#065f46", bg: "#d1fae5" },
  Done: { color: "#065f46", bg: "#d1fae5" },
};

const sourceConfig: Record<string, { label: string; icon: typeof Sparkles; color: string }> = {
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

/* ------------------------------------------------------------------ */
/*  Summary Cards                                                      */
/* ------------------------------------------------------------------ */

function SummaryCards({ relations }: { relations: TicketRelation[] }) {
  const counts = useMemo(() => {
    const c = { duplicates: 0, depends_on: 0, blocks: 0, related_to: 0 };
    relations.forEach((r) => {
      if (r.type in c) c[r.type as keyof typeof c]++;
    });
    return c;
  }, [relations]);

  const cards = [
    { type: "duplicates" as const, label: "Duplikate", count: counts.duplicates },
    { type: "depends_on" as const, label: "Abh\u00e4ngigkeiten", count: counts.depends_on },
    { type: "blocks" as const, label: "Blockaden", count: counts.blocks },
    { type: "related_to" as const, label: "Verwandt", count: counts.related_to },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {cards.map((card) => {
        const cfg = relationTypeConfig[card.type];
        return (
          <div
            key={card.type}
            className="rounded-xl border border-slate-200 bg-white p-4 flex items-center gap-3"
          >
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: cfg.bg }}
            >
              <cfg.icon className="w-5 h-5" style={{ color: cfg.color }} />
            </div>
            <div>
              <div className="text-[22px] text-slate-900" style={{ fontWeight: 700 }}>
                {card.count}
              </div>
              <div className="text-[12px] text-slate-500">{card.label}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Story List Item                                                    */
/* ------------------------------------------------------------------ */

function StoryListItem({
  story,
  relationCount,
  onSelect,
}: {
  story: Story;
  relationCount: number;
  onSelect: () => void;
}) {
  const sc = statusConfig[story.status] || statusConfig.Draft;
  const src = sourceConfig[story.source] || sourceConfig.manual;
  const TypeIcon = typeIcons[story.type] || FileText;

  return (
    <button
      onClick={onSelect}
      className="w-full flex items-center gap-4 p-4 rounded-xl border border-slate-200 bg-white hover:border-indigo-200 hover:shadow-sm transition-all text-left group"
    >
      <div className="w-9 h-9 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center flex-shrink-0">
        <TypeIcon className="w-4 h-4 text-slate-400" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5 flex-wrap">
          <span className="text-[12px] text-[#4f46e5]" style={{ fontWeight: 600 }}>
            {story.id}
          </span>
          <Badge
            variant="secondary"
            className="text-[10px] px-1.5"
            style={{ backgroundColor: sc.bg, color: sc.color, fontWeight: 500 }}
          >
            {story.status}
          </Badge>
          <span className="text-[10px] text-slate-400 flex items-center gap-1">
            <src.icon className="w-3 h-3" style={{ color: src.color }} />
            {src.label}
          </span>
        </div>
        <p className="text-[13px] text-slate-800 truncate" style={{ fontWeight: 500 }}>
          {story.title}
        </p>
        <span className="text-[11px] text-slate-400">{story.project}</span>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        {relationCount > 0 && (
          <span className="text-[11px] text-[#4f46e5] bg-[#f1f0ff] px-2 py-0.5 rounded-full" style={{ fontWeight: 500 }}>
            {relationCount} Bez.
          </span>
        )}
        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-400 transition-colors" />
      </div>
    </button>
  );
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
  const cfg = relationTypeConfig[relation.type] || relationTypeConfig.related_to;
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
              style={{ color: cfg.color, backgroundColor: cfg.bg, fontWeight: 500 }}
            >
              {cfg.label}
            </span>
            {isConfirmed && (
              <span className="text-[10px] text-green-600 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Best\u00e4tigt
              </span>
            )}
            {isDismissed && (
              <span className="text-[10px] text-slate-400 flex items-center gap-1">
                <XCircle className="w-3 h-3" /> Verworfen
              </span>
            )}
          </div>
          {otherStory && (
            <p className="text-[13px] text-slate-800 mb-1" style={{ fontWeight: 500 }}>
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
              <span className="text-[10px] text-slate-400">{otherStory.project}</span>
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
            <CheckCircle2 className="w-3 h-3" /> Best\u00e4tigen
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
/*  Focus Mode                                                         */
/* ------------------------------------------------------------------ */

function FocusView({
  story,
  stories,
  onBack,
  confirmedIds,
  dismissedIds,
  onConfirm,
  onDismiss,
}: {
  story: Story;
  stories: Story[];
  onBack: () => void;
  confirmedIds: Set<string>;
  dismissedIds: Set<string>;
  onConfirm: (id: string) => void;
  onDismiss: (id: string) => void;
}) {
  const navigate = useNavigate();
  const relations = useMemo(() => getRelationsForId(story.id), [story.id]);

  const grouped = useMemo(() => {
    const groups: Record<string, { relation: TicketRelation; other: Story | undefined }[]> = {
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
    duplicates: "Duplikate / \u00dcberschneidungen",
    depends_on: "Abh\u00e4ngigkeiten",
    blocks: "Blockaden",
    related_to: "Verwandte Stories",
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-5"
    >
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-[13px] text-slate-500 hover:text-[#4f46e5] transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Zur\u00fcck zur \u00dcbersicht
      </button>

      {/* Selected story header */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <Badge
                variant="outline"
                className="text-[11px] text-[#4f46e5] border-[#4f46e5]/30 bg-[#f1f0ff]"
              >
                {story.id}
              </Badge>
              <Badge variant="secondary" className="text-[11px]" style={{ backgroundColor: sc.bg, color: sc.color }}>
                {story.status}
              </Badge>
              <span className="text-[11px] text-slate-400 flex items-center gap-1">
                <src.icon className="w-3 h-3" style={{ color: src.color }} />
                {src.label}
              </span>
              {story.priority && (
                <Badge
                  variant="secondary"
                  className="text-[11px]"
                  style={{
                    backgroundColor: story.priority === "Hoch" ? "#fef2f2" : story.priority === "Mittel" ? "#fef3c7" : "#f1f5f9",
                    color: story.priority === "Hoch" ? "#dc2626" : story.priority === "Mittel" ? "#f59e0b" : "#64748b",
                  }}
                >
                  {story.priority}
                </Badge>
              )}
            </div>
            <h2 className="text-[18px] text-slate-900 mb-1" style={{ fontWeight: 600 }}>
              {story.title}
            </h2>
            <p className="text-[13px] text-slate-500 line-clamp-2">{story.description}</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 text-[12px] shrink-0 ml-4"
            onClick={() => navigate(`/story/${story.id}`)}
          >
            Details anzeigen
          </Button>
        </div>
        {(story.assignee || story.sprint || story.storyPoints != null) && (
          <div className="flex items-center gap-4 mt-3 pt-3 border-t border-slate-100">
            {story.assignee && (
              <span className="text-[12px] text-slate-500">
                <span className="text-slate-400">Assignee:</span> {story.assignee}
              </span>
            )}
            {story.sprint && (
              <span className="text-[12px] text-slate-500">
                <span className="text-slate-400">Sprint:</span> {story.sprint}
              </span>
            )}
            {story.storyPoints != null && (
              <span className="text-[12px] text-slate-500">
                <span className="text-slate-400">SP:</span> {story.storyPoints}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Grouped relations */}
      {relations.length === 0 ? (
        <div className="text-center py-12 text-slate-400 text-[13px]">
          Keine Beziehungen f\u00fcr diese Story gefunden.
        </div>
      ) : (
        Object.entries(grouped).map(([type, items]) => {
          if (items.length === 0) return null;
          const cfg = relationTypeConfig[type] || relationTypeConfig.related_to;
          return (
            <div key={type}>
              <div className="flex items-center gap-2 mb-3">
                <cfg.icon className="w-4 h-4" style={{ color: cfg.color }} />
                <h3 className="text-[14px] text-slate-800" style={{ fontWeight: 600 }}>
                  {groupLabels[type] || type}
                </h3>
                <span className="text-[11px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                  {items.length}
                </span>
              </div>
              <div className="space-y-3">
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
        })
      )}
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */

export function StoryAnalysis() {
  const { stories, setShowExportDialog, setExportScope } = useAppContext();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStoryId, setSelectedStoryId] = useState<string | null>(null);
  const [sourceFilter, setSourceFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [confirmedIds, setConfirmedIds] = useState<Set<string>>(new Set());
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());

  const relationCountMap = useMemo(() => {
    const counts: Record<string, number> = {};
    allRelations.forEach((r) => {
      counts[r.sourceId] = (counts[r.sourceId] || 0) + 1;
      counts[r.targetId] = (counts[r.targetId] || 0) + 1;
    });
    return counts;
  }, []);

  const filteredStories = useMemo(() => {
    let result = stories;
    if (sourceFilter !== "all") result = result.filter((s) => s.source === sourceFilter);
    if (typeFilter !== "all") result = result.filter((s) => s.type === typeFilter);
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
  }, [stories, sourceFilter, typeFilter, searchQuery]);

  const selectedStory = selectedStoryId
    ? stories.find((s) => s.id === selectedStoryId) || null
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

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1200px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#f1f0ff] flex items-center justify-center">
            <GitCompare className="w-5 h-5 text-[#4f46e5]" />
          </div>
          <div>
            <h1 className="text-[20px] text-slate-900" style={{ fontWeight: 700 }}>
              Story-Analyse
            </h1>
            <p className="text-[13px] text-slate-500">
              Beziehungen, Duplikate und Abh\u00e4ngigkeiten zwischen Stories analysieren
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 text-[12px]"
          onClick={() => {
            setExportScope("jira");
            setShowExportDialog(true);
          }}
        >
          <Download className="w-3.5 h-3.5" />
          Export
        </Button>
      </div>

      <AnimatePresence mode="wait">
        {selectedStory ? (
          <FocusView
            key="focus"
            story={selectedStory}
            stories={stories}
            onBack={() => setSelectedStoryId(null)}
            confirmedIds={confirmedIds}
            dismissedIds={dismissedIds}
            onConfirm={handleConfirm}
            onDismiss={handleDismiss}
          />
        ) : (
          <motion.div
            key="overview"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-5"
          >
            {/* Summary */}
            <SummaryCards relations={allRelations} />

            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Stories suchen..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-[13px] text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#4f46e5]/20 focus:border-[#4f46e5]/50"
                />
              </div>

              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-slate-400" />
                <select
                  value={sourceFilter}
                  onChange={(e) => setSourceFilter(e.target.value)}
                  className="text-[12px] border border-slate-200 rounded-lg px-3 py-2.5 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#4f46e5]/20"
                >
                  <option value="all">Alle Quellen</option>
                  <option value="ai-generated">AI-generiert</option>
                  <option value="jira-import">Jira-Import</option>
                  <option value="manual">Manuell</option>
                </select>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="text-[12px] border border-slate-200 rounded-lg px-3 py-2.5 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#4f46e5]/20"
                >
                  <option value="all">Alle Typen</option>
                  <option value="Story">Story</option>
                  <option value="Epic">Epic</option>
                  <option value="Bug">Bug</option>
                  <option value="Task">Task</option>
                </select>
              </div>
            </div>

            {/* Story List */}
            <div className="space-y-2">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[12px] text-slate-400">
                  {filteredStories.length} Stories
                </span>
              </div>
              {filteredStories.map((story) => (
                <StoryListItem
                  key={story.id}
                  story={story}
                  relationCount={relationCountMap[story.id] || 0}
                  onSelect={() => setSelectedStoryId(story.id)}
                />
              ))}
              {filteredStories.length === 0 && (
                <div className="text-center py-12 text-slate-400 text-[13px]">
                  Keine Stories f\u00fcr die ausgew\u00e4hlten Filter gefunden.
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
