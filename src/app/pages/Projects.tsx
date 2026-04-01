import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";
import {
  FolderOpen,
  Plus,
  Search,
  MoreHorizontal,
  Clock,
  FileText,
  ShieldCheck,
  Download,
  Trash2,
  Edit3,
  Copy,
  ArrowUpDown,
  Check,
  GitBranch,
  Star,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  History,
  UserPlus,
  Users,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Progress } from "../components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "../components/ui/dropdown-menu";
import {
  isSearchEasterEggQuery,
  SearchEasterEgg,
} from "../components/SearchEasterEgg";
import { TooltipProvider } from "../components/ui/tooltip";
import { useAppContext } from "../context/AppContext";
import {
  ALL_TEAM_ROSTER_INITIALS,
  PROJECT_LOGO_BY_ID,
  PROJECT_SEARCH_META,
  PROJECT_TEAM_BY_ID,
  PROTOTYPE_USER_INITIALS,
  TEAM_MEMBER_LABELS,
  TEAM_MEMBER_ROLE_BY_INITIALS,
} from "../data/workspaces";
interface SavedStory {
  id: string;
  title: string;
  role: string;
  goal: string;
  conformityScore: number;
  effort: "Niedrig" | "Mittel" | "Hoch";
  priority: "Hoch" | "Mittel" | "Niedrig";
  issuesCount: number;
  resolvedIssues: number;
  savedAt: string;
  lastEdited?: string;
  version: number;
}

interface VersionEntry {
  version: string;
  date: string;
  author: string;
  changes: string;
  storiesAdded: number;
  issuesResolved: number;
}

interface Project {
  id: string;
  workspaceId: string;
  name: string;
  description: string;
  status: string;
  statusColor: string;
  stories: number;
  guidelinesQuote: number;
  issues: number;
  team: string[];
  versions: number;
  lastUpdated: string;
  starred: boolean;
  savedStories: SavedStory[];
  versionHistory: VersionEntry[];
}

function makeProject(
  spec: {
    id: string;
    workspaceId: string;
    status: string;
    statusColor: string;
    stories: number;
    guidelinesQuote: number;
    issues: number;
    versions: number;
    lastUpdated: string;
    starred: boolean;
    savedStories?: SavedStory[];
    versionHistory?: VersionEntry[];
  },
): Project {
  const meta = PROJECT_SEARCH_META[spec.id];
  if (!meta) throw new Error(`Unknown project ${spec.id}`);
  return {
    id: spec.id,
    workspaceId: spec.workspaceId,
    name: meta.name,
    description: meta.description,
    status: spec.status,
    statusColor: spec.statusColor,
    stories: spec.stories,
    guidelinesQuote: spec.guidelinesQuote,
    issues: spec.issues,
    team: [...(PROJECT_TEAM_BY_ID[spec.id] ?? [])],
    versions: spec.versions,
    lastUpdated: spec.lastUpdated,
    starred: spec.starred,
    savedStories: spec.savedStories ?? [],
    versionHistory: spec.versionHistory ?? [],
  };
}

const projects: Project[] = [
  makeProject({
    id: "P-101",
    workspaceId: "ws-bmw",
    status: "Aktiv",
    statusColor: "#1c69d4",
    stories: 7,
    guidelinesQuote: 86,
    issues: 12,
    versions: 11,
    lastUpdated: "vor 35 Min.",
    starred: true,
    savedStories: [
      {
        id: "US-202",
        title: "Forecast-Anforderung: Versuchsteile & Entwicklungs-Analytics (2)",
        role: "Entwicklungsingenieur",
        goal: "die Forecast-Schnittstelle fachlich und technisch abzusichern",
        conformityScore: 84,
        effort: "Mittel",
        priority: "Mittel",
        issuesCount: 2,
        resolvedIssues: 1,
        savedAt: "vor 3 Stunden",
        version: 3,
      },
    ],
    versionHistory: [
      {
        version: "v11.2",
        date: "30.03.2026, 09:15",
        author: "Marie König",
        changes: "SAC-Datenmodell-Review, KPI-Zielwerte und Schnittstellenvertrag ergänzt",
        storiesAdded: 2,
        issuesResolved: 3,
      },
    ],
  }),
  makeProject({
    id: "P-102",
    workspaceId: "ws-bmw",
    status: "Aktiv",
    statusColor: "#1c69d4",
    stories: 7,
    guidelinesQuote: 89,
    issues: 8,
    versions: 7,
    lastUpdated: "vor 2 Std.",
    starred: true,
    versionHistory: [
      {
        version: "v7.1",
        date: "29.03.2026, 14:00",
        author: "Stefan Richter",
        changes: "ETA-Berechnung für Händler-Pilot, IoT-Event-Schema v0.9",
        storiesAdded: 1,
        issuesResolved: 2,
      },
    ],
  }),
  makeProject({
    id: "P-103",
    workspaceId: "ws-bmw",
    status: "Review",
    statusColor: "#f59e0b",
    stories: 7,
    guidelinesQuote: 91,
    issues: 6,
    versions: 5,
    lastUpdated: "Gestern",
    starred: false,
  }),
  makeProject({
    id: "P-201",
    workspaceId: "ws-vw",
    status: "Aktiv",
    statusColor: "#001e50",
    stories: 7,
    guidelinesQuote: 88,
    issues: 10,
    versions: 8,
    lastUpdated: "vor 50 Min.",
    starred: true,
  }),
  makeProject({
    id: "P-202",
    workspaceId: "ws-vw",
    status: "Aktiv",
    statusColor: "#001e50",
    stories: 7,
    guidelinesQuote: 90,
    issues: 7,
    versions: 12,
    lastUpdated: "vor 4 Std.",
    starred: false,
  }),
  makeProject({
    id: "P-203",
    workspaceId: "ws-vw",
    status: "Entwurf",
    statusColor: "#64748b",
    stories: 7,
    guidelinesQuote: 78,
    issues: 14,
    versions: 3,
    lastUpdated: "vor 2 Tagen",
    starred: false,
  }),
  makeProject({
    id: "P-301",
    workspaceId: "ws-mercedes",
    status: "Aktiv",
    statusColor: "#00adef",
    stories: 7,
    guidelinesQuote: 92,
    issues: 9,
    versions: 15,
    lastUpdated: "vor 20 Min.",
    starred: true,
  }),
  makeProject({
    id: "P-302",
    workspaceId: "ws-mercedes",
    status: "Aktiv",
    statusColor: "#00adef",
    stories: 7,
    guidelinesQuote: 87,
    issues: 11,
    versions: 9,
    lastUpdated: "vor 6 Std.",
    starred: true,
  }),
  makeProject({
    id: "P-303",
    workspaceId: "ws-mercedes",
    status: "Review",
    statusColor: "#f59e0b",
    stories: 7,
    guidelinesQuote: 85,
    issues: 5,
    versions: 4,
    lastUpdated: "vor 1 Tag",
    starred: false,
  }),
  makeProject({
    id: "P-401",
    workspaceId: "ws-audi",
    status: "Aktiv",
    statusColor: "#bb0a30",
    stories: 7,
    guidelinesQuote: 88,
    issues: 8,
    versions: 10,
    lastUpdated: "vor 90 Min.",
    starred: true,
  }),
  makeProject({
    id: "P-402",
    workspaceId: "ws-audi",
    status: "Aktiv",
    statusColor: "#bb0a30",
    stories: 7,
    guidelinesQuote: 86,
    issues: 9,
    versions: 6,
    lastUpdated: "vor 5 Std.",
    starred: false,
  }),
  makeProject({
    id: "P-403",
    workspaceId: "ws-audi",
    status: "Entwurf",
    statusColor: "#94a3b8",
    stories: 7,
    guidelinesQuote: 74,
    issues: 16,
    versions: 2,
    lastUpdated: "vor 3 Tagen",
    starred: false,
  }),
  makeProject({
    id: "P-501",
    workspaceId: "ws-porsche",
    status: "Aktiv",
    statusColor: "#d5001c",
    stories: 7,
    guidelinesQuote: 90,
    issues: 7,
    versions: 8,
    lastUpdated: "vor 40 Min.",
    starred: true,
  }),
  makeProject({
    id: "P-502",
    workspaceId: "ws-porsche",
    status: "Aktiv",
    statusColor: "#d5001c",
    stories: 7,
    guidelinesQuote: 88,
    issues: 6,
    versions: 5,
    lastUpdated: "vor 8 Std.",
    starred: true,
  }),
  makeProject({
    id: "P-503",
    workspaceId: "ws-porsche",
    status: "Review",
    statusColor: "#f59e0b",
    stories: 7,
    guidelinesQuote: 84,
    issues: 10,
    versions: 4,
    lastUpdated: "Gestern",
    starred: false,
  }),
];

const getScoreColor = (score: number) => {
  if (score >= 80) return "#10b981";
  if (score >= 60) return "#f59e0b";
  return "#ef4444";
};

const PROJECT_SORT_OPTIONS = [
  { value: "name-asc" as const, label: "Name A → Z" },
  { value: "name-desc" as const, label: "Name Z → A" },
  { value: "starred-first" as const, label: "Favoriten zuerst" },
  { value: "guidelines-quote-desc" as const, label: "Guidelines-Quote (höchste zuerst)" },
  { value: "guidelines-quote-asc" as const, label: "Guidelines-Quote (niedrigste zuerst)" },
  { value: "stories-desc" as const, label: "Meiste Stories zuerst" },
  { value: "stories-asc" as const, label: "Wenigste Stories zuerst" },
  { value: "id-asc" as const, label: "Projekt-ID (aufsteigend)" },
] as const;

type ProjectSortOption = (typeof PROJECT_SORT_OPTIONS)[number]["value"];

function projectIdNumeric(id: string): number {
  const m = id.match(/^P-(\d+)$/i);
  return m ? parseInt(m[1], 10) : 0;
}

function sortProjects(list: Project[], option: ProjectSortOption): Project[] {
  const arr = [...list];
  const byName = (a: Project, b: Project) =>
    a.name.localeCompare(b.name, "de", { sensitivity: "base" });
  switch (option) {
    case "name-asc":
      arr.sort(byName);
      break;
    case "name-desc":
      arr.sort((a, b) => byName(b, a));
      break;
    case "starred-first":
      arr.sort(
        (a, b) =>
          Number(b.starred) - Number(a.starred) || byName(a, b),
      );
      break;
    case "guidelines-quote-desc":
      arr.sort(
        (a, b) => b.guidelinesQuote - a.guidelinesQuote || byName(a, b),
      );
      break;
    case "guidelines-quote-asc":
      arr.sort(
        (a, b) => a.guidelinesQuote - b.guidelinesQuote || byName(a, b),
      );
      break;
    case "stories-desc":
      arr.sort((a, b) => b.stories - a.stories || byName(a, b));
      break;
    case "stories-asc":
      arr.sort((a, b) => a.stories - b.stories || byName(a, b));
      break;
    case "id-asc":
      arr.sort(
        (a, b) =>
          projectIdNumeric(a.id) - projectIdNumeric(b.id) || byName(a, b),
      );
      break;
  }
  return arr;
}

export function Projects() {
  const navigate = useNavigate();
  const { projectId } = useParams<{ projectId?: string }>();
  const {
    selectedWorkspaceId,
    selectedWorkspace,
    getEffectiveProjectTeam,
    isPrototypeUserOnProjectTeam,
    addMemberToProjectTeam,
    removeMemberFromProjectTeam,
  } = useAppContext();
  const [searchQuery, setSearchQuery] = useState("");
  const [projectSort, setProjectSort] = useState<ProjectSortOption>("name-asc");
  const [activeTab, setActiveTab] = useState<
    "overview" | "history" | "team"
  >("overview");

  const selectedProject = projectId
    ? (projects.find((p) => p.id === projectId) || null)
    : null;

  const detailEffectiveTeam = useMemo(() => {
    if (!selectedProject) return [];
    return getEffectiveProjectTeam(selectedProject.id);
  }, [selectedProject, getEffectiveProjectTeam]);

  const rosterAvailableToAdd = useMemo(
    () =>
      ALL_TEAM_ROSTER_INITIALS.filter((i) => !detailEffectiveTeam.includes(i)),
    [detailEffectiveTeam],
  );

  useEffect(() => {
    setActiveTab("overview");
  }, [projectId]);

  useEffect(() => {
    if (
      selectedProject &&
      selectedProject.workspaceId !== selectedWorkspaceId
    ) {
      navigate("/projects", { replace: true });
    }
  }, [selectedProject, selectedWorkspaceId, navigate]);

  const filteredProjects = useMemo(
    () =>
      projects
        .filter((p) => p.workspaceId === selectedWorkspaceId)
        .filter((p) => {
          if (isSearchEasterEggQuery(searchQuery)) return true;
          const q = searchQuery.toLowerCase();
          return (
            p.name.toLowerCase().includes(q) ||
            p.description.toLowerCase().includes(q)
          );
        }),
    [selectedWorkspaceId, searchQuery],
  );

  const sortedProjects = useMemo(
    () => sortProjects(filteredProjects, projectSort),
    [filteredProjects, projectSort],
  );

  // Project Detail View
  if (selectedProject) {
    return (
      <TooltipProvider>
        <div className="p-8 max-w-[1200px] mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => { navigate("/projects"); setActiveTab("overview"); }}
                className="text-muted-foreground gap-1"
              >
                <ArrowLeft className="w-4 h-4" />
                Projekte
              </Button>
              <div className="flex items-start gap-4 min-w-0">
                {PROJECT_LOGO_BY_ID[selectedProject.id] ? (
                  <div className="w-14 h-14 rounded-xl border border-border bg-white flex items-center justify-center shrink-0 shadow-sm">
                    <img
                      src={PROJECT_LOGO_BY_ID[selectedProject.id]}
                      alt=""
                      className="max-w-[44px] max-h-[44px] object-contain"
                      loading="lazy"
                    />
                  </div>
                ) : null}
                <div className="min-w-0">
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-[#1e1e2e]">{selectedProject.name}</h1>
                  <Badge
                    variant="secondary"
                    className="text-[12px] px-2"
                    style={{
                      backgroundColor: `${selectedProject.statusColor}15`,
                      color: selectedProject.statusColor,
                      fontWeight: 500,
                    }}
                  >
                    {selectedProject.status}
                  </Badge>
                </div>
                <p className="text-[14px] text-muted-foreground mt-1">{selectedProject.description}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap justify-end">
              <Button variant="outline" size="sm" className="text-[13px] gap-2" onClick={() => navigate("/story-generator")}>
                <Sparkles className="w-4 h-4" />
                Stories generieren
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-[13px] gap-2"
                onClick={() =>
                  navigate(
                    `/guidelines?tab=overview&scope=project&project=${encodeURIComponent(selectedProject.id)}`,
                  )
                }
              >
                <ShieldCheck className="w-4 h-4" />
                Guidelines
              </Button>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <Card
              role="button"
              tabIndex={0}
              className="border border-border bg-white cursor-pointer hover:border-[#4f46e5]/30 hover:shadow-sm transition-all outline-none focus-visible:ring-2 focus-visible:ring-[#4f46e5]/25"
              onClick={() =>
                navigate(`/stories?projectId=${selectedProject.id}`)
              }
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ")
                  navigate(`/stories?projectId=${selectedProject.id}`);
              }}
            >
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#f1f0ff] flex items-center justify-center">
                  <FileText className="w-5 h-5 text-[#4f46e5]" />
                </div>
                <div>
                  <p className="text-[22px] text-[#1e1e2e]" style={{ fontWeight: 600 }}>{selectedProject.stories}</p>
                  <p className="text-[12px] text-muted-foreground">User Stories</p>
                  <p className="text-[11px] text-[#4f46e5] mt-0.5" style={{ fontWeight: 500 }}>Zu allen Stories</p>
                </div>
              </CardContent>
            </Card>
            <Card
              role="button"
              tabIndex={0}
              className="border border-border bg-white cursor-pointer hover:border-[#4f46e5]/30 hover:shadow-sm transition-all outline-none focus-visible:ring-2 focus-visible:ring-[#4f46e5]/25"
              onClick={() =>
                navigate(
                  `/guidelines?tab=overview&scope=project&project=${encodeURIComponent(selectedProject.id)}`,
                )
              }
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ")
                  navigate(
                    `/guidelines?tab=overview&scope=project&project=${encodeURIComponent(selectedProject.id)}`,
                  );
              }}
            >
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#d1fae5] flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5 text-[#10b981]" />
                </div>
                <div>
                  <p className="text-[22px]" style={{ fontWeight: 600, color: getScoreColor(selectedProject.guidelinesQuote) }}>
                    {selectedProject.guidelinesQuote}%
                  </p>
                  <p className="text-[12px] text-muted-foreground">Guidelines-Quote</p>
                  <p className="text-[11px] text-[#4f46e5] mt-0.5" style={{ fontWeight: 500 }}>
                    Zur Analyse in Guidelines
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card className="border border-border bg-white">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#fef2f2] flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-[#ef4444]" />
                </div>
                <div>
                  <p className="text-[22px] text-[#1e1e2e]" style={{ fontWeight: 600 }}>{selectedProject.issues}</p>
                  <p className="text-[12px] text-muted-foreground">Offene Issues</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border border-border bg-white">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#ede9fe] flex items-center justify-center">
                  <GitBranch className="w-5 h-5 text-[#8b5cf6]" />
                </div>
                <div>
                  <p className="text-[22px] text-[#1e1e2e]" style={{ fontWeight: 600 }}>{selectedProject.versions}</p>
                  <p className="text-[12px] text-muted-foreground">Versionen</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-1 border-b border-border mb-6">
            {[
              { key: "overview" as const, label: "Übersicht" },
              { key: "history" as const, label: "Versionshistorie" },
              {
                key: "team" as const,
                label: `Team (${detailEffectiveTeam.length})`,
              },
            ].map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-2.5 text-[13px] border-b-2 transition-colors ${
                  activeTab === tab.key
                    ? "border-[#4f46e5] text-[#4f46e5]"
                    : "border-transparent text-muted-foreground hover:text-[#1e1e2e]"
                }`}
                style={{ fontWeight: activeTab === tab.key ? 600 : 400 }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content: Overview */}
          {activeTab === "overview" && (
            <div className="grid grid-cols-2 gap-6">
              <Card className="border border-border bg-white">
                <CardHeader className="pb-3">
                  <CardTitle className="text-[14px]" style={{ fontWeight: 600 }}>Projekt-Details</CardTitle>
                </CardHeader>
                <CardContent className="px-5 pb-5 space-y-3">
                  <div className="flex justify-between text-[13px]">
                    <span className="text-muted-foreground">Erstellt</span>
                    <span className="text-[#1e1e2e]" style={{ fontWeight: 500 }}>01.01.2026</span>
                  </div>
                  <div className="flex justify-between text-[13px]">
                    <span className="text-muted-foreground">Letzte Änderung</span>
                    <span className="text-[#1e1e2e]" style={{ fontWeight: 500 }}>{selectedProject.lastUpdated}</span>
                  </div>
                  <div className="flex justify-between items-center text-[13px] gap-3">
                    <span className="text-muted-foreground shrink-0">Team</span>
                    <div className="flex items-center gap-2 min-w-0 justify-end">
                      <div className="flex items-center -space-x-2">
                        {getEffectiveProjectTeam(selectedProject.id).map((m, i) => (
                          <div
                            key={`${m}-${i}`}
                            className={`w-6 h-6 rounded-full flex items-center justify-center border-2 border-white ${
                              m === PROTOTYPE_USER_INITIALS
                                ? "bg-[#059669]"
                                : "bg-[#4f46e5]"
                            }`}
                          >
                            <span className="text-[9px] text-white" style={{ fontWeight: 600 }}>{m}</span>
                          </div>
                        ))}
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-[12px] h-8 px-2 text-[#4f46e5] shrink-0"
                        onClick={() => setActiveTab("team")}
                      >
                        Verwalten
                      </Button>
                    </div>
                  </div>
                  <div className="flex justify-between items-center text-[13px] gap-2">
                    <span className="text-muted-foreground shrink-0">Guidelines-Quote</span>
                    <div className="flex items-center gap-2 min-w-0">
                      <Progress value={selectedProject.guidelinesQuote} className="h-1.5 w-24 shrink" />
                      <span
                        className="shrink-0"
                        style={{ fontWeight: 600, color: getScoreColor(selectedProject.guidelinesQuote) }}
                      >
                        {selectedProject.guidelinesQuote}%
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-[12px] h-8 px-2 text-[#4f46e5] shrink-0"
                        onClick={() =>
                          navigate(
                            `/guidelines?tab=overview&scope=project&project=${encodeURIComponent(selectedProject.id)}`,
                          )
                        }
                      >
                        Guidelines
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-border bg-white">
                <CardHeader className="pb-3">
                  <CardTitle className="text-[14px]" style={{ fontWeight: 600 }}>Letzte Aktivität</CardTitle>
                </CardHeader>
                <CardContent className="px-5 pb-5 space-y-3">
                  {selectedProject.versionHistory.slice(0, 4).map((v, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-[#f1f0ff] flex items-center justify-center flex-shrink-0 mt-0.5">
                        <History className="w-3 h-3 text-[#4f46e5]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] text-[#1e1e2e]" style={{ fontWeight: 500 }}>{v.changes}</p>
                        <p className="text-[11px] text-muted-foreground">{v.author} • {v.date}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Tab Content: Version History */}
          {activeTab === "history" && (
            <div>
              {selectedProject.versionHistory.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-16 h-16 rounded-2xl bg-[#f1f5f9] flex items-center justify-center mx-auto mb-4">
                    <History className="w-7 h-7 text-[#94a3b8]" />
                  </div>
                  <p className="text-[16px] text-[#1e1e2e] mb-1" style={{ fontWeight: 500 }}>Keine Versionshistorie</p>
                  <p className="text-[13px] text-muted-foreground">
                    Änderungen am Projekt werden hier automatisch dokumentiert.
                  </p>
                </div>
              ) : (
                <div className="relative">
                  {/* Timeline line */}
                  <div className="absolute left-[23px] top-0 bottom-0 w-px bg-[#e2e8f0]" />

                  <div className="space-y-0">
                    {selectedProject.versionHistory.map((v, i) => (
                      <div key={i} className="relative flex items-start gap-4 pb-6">
                        {/* Timeline dot */}
                        <div className={`w-[48px] h-[48px] rounded-xl flex items-center justify-center flex-shrink-0 relative z-10 ${
                          i === 0 ? "bg-[#4f46e5]" : "bg-white border-2 border-[#e2e8f0]"
                        }`}>
                          <GitBranch className={`w-5 h-5 ${i === 0 ? "text-white" : "text-[#94a3b8]"}`} />
                        </div>

                        <Card className={`flex-1 border bg-white ${i === 0 ? "border-[#4f46e5]/20 shadow-sm" : "border-border"}`}>
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <Badge
                                    variant="secondary"
                                    className="text-[12px] px-2"
                                    style={{
                                      backgroundColor: i === 0 ? "#f1f0ff" : "#f1f5f9",
                                      color: i === 0 ? "#4f46e5" : "#64748b",
                                      fontWeight: 600,
                                    }}
                                  >
                                    {v.version}
                                  </Badge>
                                  {i === 0 && (
                                    <Badge variant="secondary" className="text-[11px] px-1.5 bg-[#d1fae5] text-[#10b981]">
                                      Aktuell
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-[14px] text-[#1e1e2e] mb-1" style={{ fontWeight: 500 }}>
                                  {v.changes}
                                </p>
                                <p className="text-[12px] text-muted-foreground">
                                  {v.author} • {v.date}
                                </p>
                              </div>
                              <div className="flex items-center gap-3 text-[12px] text-muted-foreground flex-shrink-0">
                                {v.storiesAdded > 0 && (
                                  <span className="flex items-center gap-1 text-[#4f46e5]">
                                    <Plus className="w-3 h-3" />
                                    {v.storiesAdded} Stories
                                  </span>
                                )}
                                {v.issuesResolved > 0 && (
                                  <span className="flex items-center gap-1 text-[#10b981]">
                                    <CheckCircle2 className="w-3 h-3" />
                                    {v.issuesResolved} behoben
                                  </span>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tab Content: Team */}
          {activeTab === "team" && (
            <Card className="border border-border bg-white max-w-[720px]">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-lg bg-[#f1f0ff] flex items-center justify-center">
                    <Users className="w-4 h-4 text-[#4f46e5]" />
                  </div>
                  <div>
                    <CardTitle className="text-[15px]" style={{ fontWeight: 600 }}>
                      Projektteam
                    </CardTitle>
                    <p className="text-[12px] text-muted-foreground font-normal mt-0.5 leading-snug">
                      Alle hier genannten Personen sind dem Vorhaben zugeordnet. Ist Ihre Kennung{" "}
                      <span className="text-[#475569]" style={{ fontWeight: 500 }}>
                        {PROTOTYPE_USER_INITIALS}
                      </span>{" "}
                      dabei, erscheint das Projekt unter „Letzte Projekte“ auf dem Dashboard.
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="px-5 pb-6 space-y-6">
                <ul className="divide-y divide-border rounded-lg border border-border overflow-hidden">
                  {detailEffectiveTeam.length === 0 ? (
                    <li className="px-4 py-8 text-center text-[13px] text-muted-foreground">
                      Noch keine Teammitglieder. Fügen Sie sich oder Kolleg:innen unten hinzu.
                    </li>
                  ) : (
                    detailEffectiveTeam.map((initials) => (
                      <li
                        key={initials}
                        className="flex items-center justify-between gap-3 px-4 py-3 bg-white"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                              initials === PROTOTYPE_USER_INITIALS
                                ? "bg-[#059669]"
                                : "bg-[#4f46e5]"
                            }`}
                          >
                            <span
                              className="text-[11px] text-white"
                              style={{ fontWeight: 600 }}
                            >
                              {initials}
                            </span>
                          </div>
                          <div className="min-w-0">
                            <p
                              className="text-[13px] text-[#1e1e2e] truncate"
                              style={{ fontWeight: 500 }}
                            >
                              {TEAM_MEMBER_LABELS[initials] ?? initials}
                            </p>
                            <p className="text-[11px] text-muted-foreground">
                              {TEAM_MEMBER_ROLE_BY_INITIALS[initials] ?? "Mitwirkende:r"}
                            </p>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="text-[12px] shrink-0 text-[#b45309] border-[#fde68a] hover:bg-[#fffbeb]"
                          onClick={() =>
                            removeMemberFromProjectTeam(
                              selectedProject.id,
                              initials,
                            )
                          }
                        >
                          Entfernen
                        </Button>
                      </li>
                    ))
                  )}
                </ul>

                {!isPrototypeUserOnProjectTeam(selectedProject.id) ? (
                  <div className="rounded-lg border border-dashed border-[#c7d2fe] bg-[#f8fafc] p-4">
                    <p className="text-[13px] text-[#1e1e2e] mb-2" style={{ fontWeight: 500 }}>
                      Sie sind noch nicht im Team
                    </p>
                    <p className="text-[12px] text-muted-foreground mb-3">
                      Treten Sie als {TEAM_MEMBER_LABELS[PROTOTYPE_USER_INITIALS] ?? "Prototyp-Nutzer:in"} (
                      {PROTOTYPE_USER_INITIALS}) bei — dann zählt dieses Projekt zu Ihren zuletzt
                      genutzten Vorhaben.
                    </p>
                    <Button
                      type="button"
                      size="sm"
                      className="bg-[#059669] hover:bg-[#047857] text-white gap-2 text-[13px]"
                      onClick={() =>
                        addMemberToProjectTeam(
                          selectedProject.id,
                          PROTOTYPE_USER_INITIALS,
                        )
                      }
                    >
                      <UserPlus className="w-4 h-4" />
                      Mich zum Team hinzufügen
                    </Button>
                  </div>
                ) : null}

                {rosterAvailableToAdd.length > 0 ? (
                  <div>
                    <p className="text-[13px] text-[#1e1e2e] mb-2" style={{ fontWeight: 600 }}>
                      Kolleg:innen hinzufügen
                    </p>
                    <p className="text-[12px] text-muted-foreground mb-3">
                      Ergänzen Sie Kolleg:innen aus dem Demo-Roster — mit Rolle und Kurzkennung, wie
                      in echten Teams.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {rosterAvailableToAdd.map((init) => (
                        <Button
                          key={init}
                          type="button"
                          variant="outline"
                          size="sm"
                          className="text-[12px] h-9 gap-1.5"
                          onClick={() =>
                            addMemberToProjectTeam(selectedProject.id, init)
                          }
                        >
                          <UserPlus className="w-3.5 h-3.5" />
                          <span className="max-w-[200px] truncate">
                            {TEAM_MEMBER_LABELS[init] ?? init}
                          </span>
                        </Button>
                      ))}
                    </div>
                  </div>
                ) : null}
              </CardContent>
            </Card>
          )}

        </div>
      </TooltipProvider>
    );
  }

  // Project List View
  return (
    <TooltipProvider>
      <>
      <div className="p-8 max-w-[1200px] mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-[#1e1e2e]">Projekte</h1>
            <p className="text-[14px] text-muted-foreground mt-1">
              Workspace: <span className="text-[#475569]" style={{ fontWeight: 500 }}>{selectedWorkspace.name}</span>
              {" · "}
              {filteredProjects.length} Projekt
              {filteredProjects.length === 1 ? "" : "e"}
              {filteredProjects.length > 0
                ? `, ${filteredProjects.filter((p) => p.status === "Aktiv").length} aktiv`
                : ""}
            </p>
          </div>
          <Button className="bg-[#4f46e5] hover:bg-[#4338ca] text-white gap-2 text-[13px]">
            <Plus className="w-4 h-4" />
            Neues Projekt
          </Button>
        </div>

        {/* Search + Filters */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-white flex-1 max-w-md">
            <Search className="w-4 h-4 text-muted-foreground" />
            <input
              placeholder="Projekte durchsuchen..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent outline-none w-full text-[13px] placeholder:text-muted-foreground"
            />
          </div>
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="text-[13px] gap-2">
                  <ArrowUpDown className="w-4 h-4" />
                  Sortieren
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[min(100vw-2rem,280px)]">
                <DropdownMenuLabel className="text-[11px] text-muted-foreground font-normal">
                  Sortierung
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {PROJECT_SORT_OPTIONS.map((opt) => (
                  <DropdownMenuItem
                    key={opt.value}
                    className="text-[13px] gap-2"
                    onSelect={() => setProjectSort(opt.value)}
                  >
                    <span className="w-4 h-4 flex items-center justify-center shrink-0">
                      {projectSort === opt.value ? (
                        <Check className="w-4 h-4 text-[#4f46e5]" />
                      ) : null}
                    </span>
                    {opt.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="outline" size="sm" className="text-[13px] gap-2">
              <Download className="w-4 h-4" />
              Export
            </Button>
          </div>
        </div>

        {/* Projects Grid */}
        <div>
        {sortedProjects.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-[#fafbfc] py-16 text-center">
            <FolderOpen className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-60" />
            <p className="text-[14px] text-muted-foreground">
              Keine Projekte in diesem Workspace oder keine Treffer für die Suche.
            </p>
          </div>
        ) : (
        <div className="grid grid-cols-2 gap-4">
          {sortedProjects.map((project) => (
            <Card
              key={project.id}
              className="border border-border bg-white hover:shadow-md transition-all duration-200 cursor-pointer group"
              onClick={() => navigate(`/projects/${project.id}`)}
            >
              <CardContent className="p-5">
                {/* Header Row */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-xl bg-[#f1f5f9] flex items-center justify-center flex-shrink-0 group-hover:bg-[#f1f0ff] transition-colors border border-transparent group-hover:border-[#e0e7ff] overflow-hidden">
                      {PROJECT_LOGO_BY_ID[project.id] ? (
                        <img
                          src={PROJECT_LOGO_BY_ID[project.id]}
                          alt=""
                          className="w-7 h-7 object-contain"
                          loading="lazy"
                        />
                      ) : (
                        <FolderOpen className="w-5 h-5 text-[#64748b] group-hover:text-[#4f46e5] transition-colors" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-[14px] text-[#1e1e2e] group-hover:text-[#4f46e5] transition-colors" style={{ fontWeight: 500 }}>
                          {project.name}
                        </p>
                        {project.starred && <Star className="w-3.5 h-3.5 text-[#f59e0b] fill-[#f59e0b]" />}
                      </div>
                      <p className="text-[11px] text-muted-foreground">{project.id}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Badge
                      variant="secondary"
                      className="text-[11px] px-2"
                      style={{
                        backgroundColor: `${project.statusColor}15`,
                        color: project.statusColor,
                        fontWeight: 500,
                      }}
                    >
                      {project.status}
                    </Badge>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          className="p-1 rounded hover:bg-[#f1f5f9] transition-colors"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem className="text-[13px] gap-2">
                          <Edit3 className="w-3.5 h-3.5" /> Bearbeiten
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-[13px] gap-2">
                          <Copy className="w-3.5 h-3.5" /> Duplizieren
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-[13px] gap-2">
                          <Download className="w-3.5 h-3.5" /> Exportieren
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-[13px] gap-2 text-[#ef4444]">
                          <Trash2 className="w-3.5 h-3.5" /> Löschen
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                <p className="text-[12px] text-muted-foreground mb-4 line-clamp-1">{project.description}</p>

                {/* Stats Row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                  <div className="flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-[#4f46e5]" />
                    <span className="text-[12px] text-muted-foreground">
                      <span style={{ fontWeight: 600, color: "#1e1e2e" }}>{project.stories}</span> Stories
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <GitBranch className="w-3.5 h-3.5 text-[#8b5cf6]" />
                    <span className="text-[12px] text-muted-foreground">
                      <span style={{ fontWeight: 600, color: "#1e1e2e" }}>{project.versions}</span> Versionen
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-[#f59e0b]" />
                    <span className="text-[12px] text-muted-foreground">
                      <span style={{ fontWeight: 600, color: "#1e1e2e" }}>{project.issues}</span> Issues
                    </span>
                  </div>
                </div>

                {/* Link zu Story-Abhängigkeiten mit Projektfilter */}
                {project.savedStories.length > 0 && (
                  <button
                    type="button"
                    className="flex items-center gap-1.5 mb-3 text-[12px] text-[#4f46e5] hover:underline text-left"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/stories?projectId=${project.id}`);
                    }}
                  >
                    <Sparkles className="w-3.5 h-3.5 shrink-0" />
                    <span style={{ fontWeight: 500 }}>
                      Stories anzeigen ({project.savedStories.length})
                    </span>
                  </button>
                )}

                {/* Guidelines-Quote */}
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-[11px] text-muted-foreground" style={{ fontWeight: 500 }}>Guidelines-Quote</span>
                  <Progress value={project.guidelinesQuote} className="h-1.5 flex-1" />
                  <span
                    className="text-[12px]"
                    style={{
                      fontWeight: 600,
                      color: project.guidelinesQuote >= 90 ? "#10b981" : project.guidelinesQuote >= 70 ? "#f59e0b" : "#ef4444",
                    }}
                  >
                    {project.guidelinesQuote}%
                  </span>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-border">
                  <div className="flex items-center -space-x-2">
                    {getEffectiveProjectTeam(project.id).map((member, i) => (
                      <div
                        key={`${member}-${i}`}
                        className={`w-6 h-6 rounded-full flex items-center justify-center border-2 border-white ${
                          member === PROTOTYPE_USER_INITIALS
                            ? "bg-[#059669]"
                            : "bg-[#4f46e5]"
                        }`}
                      >
                        <span className="text-[9px] text-white" style={{ fontWeight: 600 }}>{member}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    {project.lastUpdated}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        )}
        </div>
      </div>
      <SearchEasterEgg
        searchQuery={searchQuery}
        onClose={() => setSearchQuery("")}
      />
      </>
    </TooltipProvider>
  );
}