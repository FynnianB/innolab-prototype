import { useCallback, useMemo } from "react";
import { useNavigate, useParams } from "react-router";
import { motion } from "motion/react";
import {
  ReactFlow,
  Background,
  Controls,
  type Node,
  type Edge,
  MarkerType,
  Position,
  Handle,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import {
  ArrowLeft,
  Pencil,
  RefreshCw,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Link2,
  ExternalLink,
  Lightbulb,
  ChevronRight,
} from "lucide-react";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Progress } from "../components/ui/progress";
import { TicketTypeIcon } from "../components/TicketTypeIcon";
import {
  allStories,
  allJiraTickets,
  getRelationsForId,
  getItemTitle,
  getItemProject,
  isUserStory,
  type StoryData,
  type JiraTicketData,
  type TicketRelation,
} from "../data/stories";

/* ------------------------------------------------------------------ */
/*  Custom Graph Node                                                   */
/* ------------------------------------------------------------------ */

interface TicketNodeData {
  label: string;
  project: string;
  isCurrent: boolean;
  isStory: boolean;
  [key: string]: unknown;
}

function TicketNode({ data }: { data: TicketNodeData }) {
  return (
    <>
      <Handle type="target" position={Position.Top} className="!bg-transparent !border-0 !w-3 !h-3" />
      <Handle type="target" position={Position.Left} className="!bg-transparent !border-0 !w-3 !h-3" id="left-target" />
      <div
        className={`px-4 py-2.5 rounded-xl border-2 shadow-sm text-center min-w-[160px] max-w-[220px] transition-all ${
          data.isCurrent
            ? "bg-[#4f46e5] border-[#4f46e5] text-white shadow-lg shadow-indigo-200/60"
            : "bg-white border-slate-200 hover:border-indigo-300 hover:shadow-md"
        }`}
      >
        <div
          className={`text-[12px] truncate ${
            data.isCurrent ? "text-white" : "text-slate-800"
          }`}
          style={{ fontWeight: 500 }}
        >
          {data.label}
        </div>
        <div
          className={`text-[10px] mt-0.5 ${
            data.isCurrent ? "text-indigo-200" : "text-slate-400"
          }`}
        >
          {data.project}
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} className="!bg-transparent !border-0 !w-3 !h-3" />
      <Handle type="source" position={Position.Right} className="!bg-transparent !border-0 !w-3 !h-3" id="right-source" />
    </>
  );
}

const nodeTypes = { ticketNode: TicketNode };

const fitViewOpts = { padding: 0.3 };
const proOpts = { hideAttribution: true };
const defaultEdgeOpts = { type: "default" as const };

/* ------------------------------------------------------------------ */
/*  Relation type config                                                */
/* ------------------------------------------------------------------ */

const relationTypeConfig: Record<
  string,
  { label: string; color: string; bg: string; edgeColor: string }
> = {
  depends_on: {
    label: "depends on",
    color: "#ef4444",
    bg: "#fef2f2",
    edgeColor: "#ef4444",
  },
  related_to: {
    label: "related to",
    color: "#4f46e5",
    bg: "#f1f0ff",
    edgeColor: "#6366f1",
  },
  blocks: {
    label: "blocks",
    color: "#f59e0b",
    bg: "#fef3c7",
    edgeColor: "#f59e0b",
  },
  duplicates: {
    label: "duplicates",
    color: "#8b5cf6",
    bg: "#ede9fe",
    edgeColor: "#8b5cf6",
  },
};

/* ------------------------------------------------------------------ */
/*  Helper: build graph nodes and edges                                 */
/* ------------------------------------------------------------------ */

function buildGraph(
  currentId: string,
  relations: TicketRelation[]
): { nodes: Node[]; edges: Edge[] } {
  const nodeIds = new Set<string>([currentId]);
  relations.forEach((r) => {
    nodeIds.add(r.sourceId);
    nodeIds.add(r.targetId);
  });

  const idList = Array.from(nodeIds);
  const currentIndex = idList.indexOf(currentId);
  // Place current node in center
  if (currentIndex > 0) {
    [idList[0], idList[currentIndex]] = [idList[currentIndex], idList[0]];
  }

  // Layout: current node in center, others around it in a circle
  const centerX = 400;
  const centerY = 280;
  const radiusX = 280;
  const radiusY = 200;
  const otherNodes = idList.slice(1);
  const angleStep = (2 * Math.PI) / Math.max(otherNodes.length, 1);
  // Start from top
  const startAngle = -Math.PI / 2;

  const nodes: Node[] = [
    {
      id: currentId,
      type: "ticketNode",
      position: { x: centerX - 90, y: centerY - 25 },
      data: {
        label: getItemTitle(currentId),
        project: getItemProject(currentId),
        isCurrent: true,
        isStory: isUserStory(currentId),
      },
    },
    ...otherNodes.map((id, i) => {
      const angle = startAngle + i * angleStep;
      return {
        id,
        type: "ticketNode" as const,
        position: {
          x: centerX - 90 + Math.cos(angle) * radiusX,
          y: centerY - 25 + Math.sin(angle) * radiusY,
        },
        data: {
          label: getItemTitle(id),
          project: getItemProject(id),
          isCurrent: false,
          isStory: isUserStory(id),
        },
      };
    }),
  ];

  const edges: Edge[] = relations.map((r) => {
    const config = relationTypeConfig[r.type] || relationTypeConfig.related_to;
    return {
      id: r.id,
      source: r.sourceId,
      target: r.targetId,
      type: "default",
      animated: r.type === "depends_on",
      label: config.label,
      labelStyle: { fontSize: 10, fill: config.edgeColor, fontWeight: 500 },
      labelBgStyle: { fill: "white", fillOpacity: 0.9 },
      labelBgPadding: [4, 2] as [number, number],
      style: { stroke: config.edgeColor, strokeWidth: 1.5 },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: config.edgeColor,
        width: 16,
        height: 16,
      },
    };
  });

  return { nodes, edges };
}

/* ------------------------------------------------------------------ */
/*  Status badge                                                        */
/* ------------------------------------------------------------------ */

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { color: string; bg: string }> = {
    Draft: { color: "#64748b", bg: "#f1f5f9" },
    "In Review": { color: "#f59e0b", bg: "#fef3c7" },
    Approved: { color: "#10b981", bg: "#d1fae5" },
    "In Progress": { color: "#4f46e5", bg: "#f1f0ff" },
    Done: { color: "#10b981", bg: "#d1fae5" },
    "To Do": { color: "#64748b", bg: "#f1f5f9" },
  };
  const c = config[status] || config.Draft;
  return (
    <span
      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px]"
      style={{ color: c.color, backgroundColor: c.bg, fontWeight: 500 }}
    >
      {status}
    </span>
  );
}

function PriorityBadge({ priority }: { priority: string }) {
  const config: Record<string, { color: string; bg: string }> = {
    Hoch: { color: "#ef4444", bg: "#fef2f2" },
    Mittel: { color: "#f59e0b", bg: "#fef3c7" },
    Niedrig: { color: "#10b981", bg: "#d1fae5" },
  };
  const c = config[priority] || config.Mittel;
  return (
    <span
      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px]"
      style={{ color: c.color, backgroundColor: c.bg, fontWeight: 500 }}
    >
      {priority}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  MAIN COMPONENT                                                      */
/* ------------------------------------------------------------------ */

export function StoryDetail() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const decodedId = id ? decodeURIComponent(id) : "";

  // Find the item
  const story = allStories.find((s) => s.id === decodedId);
  const ticket = allJiraTickets.find((t) => t.key === decodedId);

  // Build graph data (always computed, even if not found)
  const relations = getRelationsForId(decodedId);
  const { nodes, edges } = useMemo(
    () => buildGraph(decodedId, relations),
    [decodedId, relations.length]
  );

  // Related items list (for the bottom section)
  const relatedItems = useMemo(() => {
    return relations.map((r) => {
      const otherId = r.sourceId === decodedId ? r.targetId : r.sourceId;
      return {
        relation: r,
        id: otherId,
        title: getItemTitle(otherId),
        project: getItemProject(otherId),
        isStory: isUserStory(otherId),
      };
    });
  }, [decodedId, relations.length]);

  const handleNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      if (node.id !== decodedId) {
        navigate(`/story/${encodeURIComponent(node.id)}`);
      }
    },
    [navigate, decodedId]
  );

  // Not found state
  if (!story && !ticket) {
    return (
      <div className="p-8 max-w-[1000px] mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-[14px] text-slate-500 hover:text-[#4f46e5] transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <div className="text-center py-20">
          <AlertTriangle className="w-12 h-12 text-amber-400 mx-auto mb-4" />
          <h2 className="text-slate-900 mb-2">Ticket nicht gefunden</h2>
          <p className="text-slate-500 text-[14px]">
            Das Ticket mit der ID &quot;{decodedId}&quot; konnte nicht gefunden werden.
          </p>
        </div>
      </div>
    );
  }

  /* ── Render: User Story ── */
  if (story) {
    return <StoryView story={story} nodes={nodes} edges={edges} relatedItems={relatedItems} onNodeClick={handleNodeClick} />;
  }

  /* ── Render: Jira Ticket ── */
  return <TicketView ticket={ticket!} nodes={nodes} edges={edges} relatedItems={relatedItems} onNodeClick={handleNodeClick} />;
}

/* ------------------------------------------------------------------ */
/*  USER STORY VIEW                                                     */
/* ------------------------------------------------------------------ */

function StoryView({
  story,
  nodes,
  edges,
  relatedItems,
  onNodeClick,
}: {
  story: StoryData;
  nodes: Node[];
  edges: Edge[];
  relatedItems: { relation: TicketRelation; id: string; title: string; project: string; isStory: boolean }[];
  onNodeClick: (event: React.MouseEvent, node: Node) => void;
}) {
  const navigate = useNavigate();

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-8 max-w-[1100px] mx-auto pb-16">
        {/* Back */}
        <motion.button
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-[14px] text-slate-500 hover:text-[#4f46e5] transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </motion.button>

        {/* Header Card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mb-5"
        >
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className="text-[11px] text-[#4f46e5] border-[#4f46e5]/30 bg-[#f1f0ff]">
                  {story.id}
                </Badge>
                <StatusBadge status={story.status} />
                <PriorityBadge priority={story.priority} />
              </div>
              <h1 className="text-[22px] text-slate-900" style={{ fontWeight: 600 }}>
                {story.title}
              </h1>
            </div>
            <div className="flex items-center gap-2 shrink-0 ml-4">
              <Button variant="outline" size="sm" className="gap-1.5 text-[12px]">
                <Pencil className="w-3.5 h-3.5" />
                Edit
              </Button>
              <Button size="sm" className="gap-1.5 text-[12px] bg-[#4f46e5] hover:bg-[#4338ca]">
                <RefreshCw className="w-3.5 h-3.5" />
                Re-Analyze
              </Button>
            </div>
          </div>

          {/* Tags */}
          <div className="flex items-center gap-2 mb-4">
            {story.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-[11px]">
                {tag}
              </Badge>
            ))}
          </div>

          {/* Description */}
          <p className="text-[14px] text-slate-600 leading-relaxed mb-5">
            {story.description}
          </p>

          {/* Acceptance Criteria */}
          <div>
            <h3 className="text-[14px] text-slate-900 mb-3" style={{ fontWeight: 600 }}>
              Acceptance Criteria
            </h3>
            <div className="space-y-2">
              {story.acceptance.map((ac, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 bg-slate-50 rounded-lg border border-slate-100 px-4 py-3"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                  <span className="text-[13px] text-slate-700">{ac}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Analysis Results */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 gap-5 mb-5"
        >
          {/* Compliance Check */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[15px] text-slate-900" style={{ fontWeight: 600 }}>
                Compliance Check
              </h3>
              <span className="text-[22px] text-emerald-500" style={{ fontWeight: 700 }}>
                {story.complianceScore}%
              </span>
            </div>
            <Progress value={story.complianceScore} className="mb-5 h-2 [&>div]:bg-emerald-500" />
            <div className="space-y-3">
              {story.complianceChecks.map((check, i) => (
                <div key={i} className="flex items-start gap-3">
                  {check.passed ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                  )}
                  <div>
                    <div className="text-[13px] text-slate-800" style={{ fontWeight: 500 }}>
                      {check.label}
                    </div>
                    <div className="text-[11px] text-slate-500">{check.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AC Quality */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h3 className="text-[15px] text-slate-900 mb-4" style={{ fontWeight: 600 }}>
              Acceptance Criteria Quality
            </h3>
            <div className="space-y-4">
              {story.acQuality.map((ac, i) => (
                <div key={i}>
                  <div className="flex items-start justify-between gap-3 mb-1">
                    <span className="text-[12px] text-slate-700 leading-snug flex-1">
                      {ac.criterion}
                    </span>
                    <span className="text-[12px] text-emerald-600 shrink-0" style={{ fontWeight: 600 }}>
                      {ac.score}%
                    </span>
                  </div>
                  <Progress value={ac.score} className="mb-1 h-1.5 [&>div]:bg-emerald-500" />
                  <p className="text-[10px] text-amber-600">{ac.suggestion}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Contradictions & Suggestions */}
        {story.suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mb-5"
          >
            <h3 className="text-[15px] text-slate-900 mb-3" style={{ fontWeight: 600 }}>
              Contradictions & Suggestions
            </h3>
            <p className="text-[13px] text-slate-500 mb-3">
              No contradictions detected with other tickets.
            </p>
            <div className="text-[11px] text-slate-400 uppercase tracking-wider mb-2" style={{ fontWeight: 600 }}>
              Suggestions
            </div>
            {story.suggestions.map((s, i) => (
              <div key={i} className="flex items-start gap-2">
                <Lightbulb className="w-3.5 h-3.5 text-blue-500 mt-0.5 shrink-0" />
                <span className="text-[13px] text-slate-600">{s}</span>
              </div>
            ))}
          </motion.div>
        )}

        {/* Dependencies Graph */}
        <DependencyGraph
          nodes={nodes}
          edges={edges}
          relatedItems={relatedItems}
          onNodeClick={onNodeClick}
          delay={0.2}
        />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  JIRA TICKET VIEW (simplified)                                       */
/* ------------------------------------------------------------------ */

function TicketView({
  ticket,
  nodes,
  edges,
  relatedItems,
  onNodeClick,
}: {
  ticket: JiraTicketData;
  nodes: Node[];
  edges: Edge[];
  relatedItems: { relation: TicketRelation; id: string; title: string; project: string; isStory: boolean }[];
  onNodeClick: (event: React.MouseEvent, node: Node) => void;
}) {
  const navigate = useNavigate();

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-8 max-w-[1100px] mx-auto pb-16">
        <motion.button
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-[14px] text-slate-500 hover:text-[#4f46e5] transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </motion.button>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mb-5"
        >
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className="text-[11px] text-[#4f46e5] border-[#4f46e5]/30 bg-[#f1f0ff]">
                  {ticket.key}
                </Badge>
                <TicketTypeIcon type={ticket.type} size="md" showLabel />
                <StatusBadge status={ticket.status} />
              </div>
              <h1 className="text-[22px] text-slate-900" style={{ fontWeight: 600 }}>
                {ticket.summary}
              </h1>
            </div>
            <Button variant="outline" size="sm" className="gap-1.5 text-[12px] shrink-0 ml-4">
              <ExternalLink className="w-3.5 h-3.5" />
              Open in Jira
            </Button>
          </div>

          <div className="grid grid-cols-4 gap-4 mt-4">
            <div className="bg-slate-50 rounded-lg p-3">
              <div className="text-[11px] text-slate-400 mb-1">Assignee</div>
              <div className="text-[13px] text-slate-700" style={{ fontWeight: 500 }}>{ticket.assignee}</div>
            </div>
            <div className="bg-slate-50 rounded-lg p-3">
              <div className="text-[11px] text-slate-400 mb-1">Sprint</div>
              <div className="text-[13px] text-slate-700" style={{ fontWeight: 500 }}>{ticket.sprint}</div>
            </div>
            <div className="bg-slate-50 rounded-lg p-3">
              <div className="text-[11px] text-slate-400 mb-1">Story Points</div>
              <div className="text-[13px] text-slate-700" style={{ fontWeight: 500 }}>{ticket.storyPoints}</div>
            </div>
            <div className="bg-slate-50 rounded-lg p-3">
              <div className="text-[11px] text-slate-400 mb-1">Project</div>
              <div className="text-[13px] text-slate-700" style={{ fontWeight: 500 }}>{ticket.project}</div>
            </div>
          </div>
        </motion.div>

        <DependencyGraph
          nodes={nodes}
          edges={edges}
          relatedItems={relatedItems}
          onNodeClick={onNodeClick}
          delay={0.1}
        />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  DEPENDENCY GRAPH + RELATED TICKETS                                  */
/* ------------------------------------------------------------------ */

function DependencyGraph({
  nodes,
  edges,
  relatedItems,
  onNodeClick,
  delay = 0,
}: {
  nodes: Node[];
  edges: Edge[];
  relatedItems: { relation: TicketRelation; id: string; title: string; project: string; isStory: boolean }[];
  onNodeClick: (event: React.MouseEvent, node: Node) => void;
  delay?: number;
}) {
  const navigate = useNavigate();

  return (
    <>
      {/* Dependencies & Relations Graph */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay }}
        className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-5"
      >
        <div className="p-6 pb-0">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-[15px] text-slate-900" style={{ fontWeight: 600 }}>
              Dependencies & Relations
            </h3>
            {/* Graph Legend */}
            <div className="flex items-center gap-4 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-100">
              {Object.entries(relationTypeConfig).map(([key, config]) => (
                <div key={key} className="flex items-center gap-1.5">
                  <div className="w-4 h-0.5 rounded" style={{ backgroundColor: config.edgeColor }} />
                  <span className="text-[10px] text-slate-500" style={{ fontWeight: 500 }}>{config.label}</span>
                </div>
              ))}
              <div className="flex items-center gap-1.5 pl-2 border-l border-slate-200">
                <div className="w-3 h-3 rounded bg-[#4f46e5]" />
                <span className="text-[10px] text-slate-500" style={{ fontWeight: 500 }}>Aktuell</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded border-2 border-slate-200 bg-white" />
                <span className="text-[10px] text-slate-500" style={{ fontWeight: 500 }}>Verbunden</span>
              </div>
            </div>
          </div>
          <p className="text-[12px] text-slate-400 mb-4">
            Klicke auf einen Knoten, um zum Ticket zu navigieren
          </p>
        </div>
        <div className="h-[460px] w-full bg-slate-50/50">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            onNodeClick={onNodeClick}
            fitView
            fitViewOptions={fitViewOpts}
            minZoom={0.4}
            maxZoom={1.5}
            proOptions={proOpts}
            defaultEdgeOptions={defaultEdgeOpts}
          >
            <Background color="#e2e8f0" gap={20} size={1} />
            <Controls
              showInteractive={false}
              className="!border-slate-200 !rounded-lg !shadow-sm [&>button]:!border-slate-200 [&>button]:!bg-white [&>button:hover]:!bg-slate-50"
            />
          </ReactFlow>
        </div>
      </motion.div>

      {/* Related Tickets List */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: delay + 0.05 }}
        className="bg-white rounded-xl border border-slate-200 shadow-sm p-6"
      >
        <div className="flex items-center gap-3 mb-5">
          <Link2 className="w-5 h-5 text-slate-400" />
          <h3 className="text-[15px] text-slate-900" style={{ fontWeight: 600 }}>
            Related Tickets
          </h3>
          <span className="text-[12px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
            {relatedItems.length}
          </span>
        </div>

        <div className="space-y-3">
          {relatedItems.map((item) => {
            const config = relationTypeConfig[item.relation.type] || relationTypeConfig.related_to;
            return (
              <div
                key={item.relation.id}
                className="group border border-slate-100 rounded-xl px-5 py-4 hover:border-indigo-200 hover:shadow-sm transition-all cursor-pointer"
                onClick={() => navigate(`/story/${encodeURIComponent(item.id)}`)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[11px] text-[#4f46e5]" style={{ fontWeight: 600 }}>
                        {item.id}
                      </span>
                      <span className="text-[14px] text-slate-800 truncate" style={{ fontWeight: 500 }}>
                        {item.title}
                      </span>
                    </div>
                    <p className="text-[12px] text-slate-500 leading-relaxed">
                      {item.relation.description}
                    </p>
                    <div className="flex items-center gap-3 mt-2">
                      <span
                        className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px]"
                        style={{
                          color: config.color,
                          backgroundColor: config.bg,
                          fontWeight: 500,
                        }}
                      >
                        {config.label}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <div className="w-16 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${item.relation.confidence}%`,
                              backgroundColor: config.color,
                            }}
                          />
                        </div>
                        <span className="text-[10px] text-slate-400">
                          {item.relation.confidence}%
                        </span>
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-400 shrink-0 mt-1 transition-colors" />
                </div>
              </div>
            );
          })}

          {relatedItems.length === 0 && (
            <div className="text-center py-8 text-slate-400 text-[13px]">
              Keine verwandten Tickets gefunden.
            </div>
          )}
        </div>
      </motion.div>
    </>
  );
}