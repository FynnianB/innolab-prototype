import { useState } from "react";
import { useNavigate } from "react-router";
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
  GitBranch,
  Star,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  History,
  Pencil,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { StoryLink } from "../components/StoryLink";
import { Progress } from "../components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "../components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../components/ui/dialog";
import { TooltipProvider } from "../components/ui/tooltip";

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
  name: string;
  description: string;
  status: string;
  statusColor: string;
  stories: number;
  compliance: number;
  issues: number;
  team: string[];
  versions: number;
  lastUpdated: string;
  starred: boolean;
  savedStories: SavedStory[];
  versionHistory: VersionEntry[];
}

const projects: Project[] = [
  {
    id: "P-001",
    name: "Automobil-Plattform Redesign",
    description: "Komplettes Redesign der Infotainment-Plattform inkl. OTA-Update-Funktionalität",
    status: "Aktiv",
    statusColor: "#4f46e5",
    stories: 234,
    compliance: 91,
    issues: 12,
    team: ["SM", "TK", "AH", "JR"],
    versions: 8,
    lastUpdated: "vor 2 Stunden",
    starred: true,
    savedStories: [
      {
        id: "US-001",
        title: "Benutzer-Authentifizierung via SSO",
        role: "Unternehmensadministrator",
        goal: "mich über Single Sign-On (SSO) anmelden können",
        conformityScore: 72,
        effort: "Hoch",
        priority: "Hoch",
        issuesCount: 3,
        resolvedIssues: 1,
        savedAt: "vor 3 Stunden",
        lastEdited: "vor 1 Stunde",
        version: 2,
      },
      {
        id: "US-003",
        title: "Echtzeit-Benachrichtigungen",
        role: "Projektmanager",
        goal: "Echtzeit-Benachrichtigungen bei kritischen Statusänderungen erhalten",
        conformityScore: 55,
        effort: "Hoch",
        priority: "Hoch",
        issuesCount: 4,
        resolvedIssues: 2,
        savedAt: "vor 5 Stunden",
        version: 1,
      },
      {
        id: "US-004",
        title: "Datenexport in Standardformate",
        role: "Business Analyst",
        goal: "Analysedaten in CSV, PDF und Excel exportieren können",
        conformityScore: 83,
        effort: "Mittel",
        priority: "Mittel",
        issuesCount: 2,
        resolvedIssues: 0,
        savedAt: "Gestern",
        version: 1,
      },
      {
        id: "US-006",
        title: "Rollenbasierte Zugriffskontrolle",
        role: "Systemadministrator",
        goal: "Benutzerrollen mit granularen Berechtigungen definieren können",
        conformityScore: 48,
        effort: "Hoch",
        priority: "Hoch",
        issuesCount: 4,
        resolvedIssues: 0,
        savedAt: "Gestern",
        version: 1,
      },
    ],
    versionHistory: [
      { version: "v2.3.1", date: "19.02.2026, 14:30", author: "Dr. Sarah Müller", changes: "3 User Stories hinzugefügt, 2 Issues behoben", storiesAdded: 3, issuesResolved: 2 },
      { version: "v2.3.0", date: "18.02.2026, 09:15", author: "Thomas König", changes: "Compliance-Regeln aktualisiert, DSGVO-Prüfung durchgeführt", storiesAdded: 0, issuesResolved: 5 },
      { version: "v2.2.0", date: "15.02.2026, 16:45", author: "Dr. Sarah Müller", changes: "12 neue User Stories aus Lastenheft v2.2 generiert", storiesAdded: 12, issuesResolved: 0 },
      { version: "v2.1.0", date: "10.02.2026, 11:00", author: "Anna Hoffmann", changes: "Performance-Anforderungen überarbeitet", storiesAdded: 5, issuesResolved: 8 },
      { version: "v2.0.0", date: "05.02.2026, 14:00", author: "Dr. Sarah Müller", changes: "Major Release: Komplette Überarbeitung der Anforderungen", storiesAdded: 45, issuesResolved: 15 },
    ],
  },
  {
    id: "P-002",
    name: "Banking App v3.2 Migration",
    description: "Migration der Legacy-Banking-App auf neue Microservice-Architektur",
    status: "Review",
    statusColor: "#f59e0b",
    stories: 187,
    compliance: 96,
    issues: 3,
    team: ["SM", "BW"],
    versions: 12,
    lastUpdated: "vor 5 Stunden",
    starred: true,
    savedStories: [
      {
        id: "US-010",
        title: "SEPA-Überweisungen in Echtzeit",
        role: "Bankkunde",
        goal: "SEPA-Überweisungen in Echtzeit durchführen können",
        conformityScore: 94,
        effort: "Mittel",
        priority: "Hoch",
        issuesCount: 1,
        resolvedIssues: 1,
        savedAt: "vor 4 Stunden",
        version: 3,
      },
      {
        id: "US-011",
        title: "Biometrische Authentifizierung",
        role: "App-Benutzer",
        goal: "mich per Fingerabdruck oder Face-ID anmelden können",
        conformityScore: 89,
        effort: "Mittel",
        priority: "Hoch",
        issuesCount: 2,
        resolvedIssues: 2,
        savedAt: "vor 1 Tag",
        version: 2,
      },
    ],
    versionHistory: [
      { version: "v3.2.4", date: "19.02.2026, 10:00", author: "Benjamin Weber", changes: "SCA-Anforderungen finalisiert", storiesAdded: 2, issuesResolved: 3 },
      { version: "v3.2.3", date: "16.02.2026, 15:30", author: "Dr. Sarah Müller", changes: "PSD2-Compliance überprüft", storiesAdded: 0, issuesResolved: 7 },
      { version: "v3.2.2", date: "12.02.2026, 09:00", author: "Benjamin Weber", changes: "API-Spezifikationen aktualisiert", storiesAdded: 8, issuesResolved: 4 },
    ],
  },
  {
    id: "P-003",
    name: "Healthcare Portal DSGVO",
    description: "DSGVO-konforme Patientenportal-Spezifikation für Kliniken",
    status: "Abgeschlossen",
    statusColor: "#10b981",
    stories: 342,
    compliance: 99,
    issues: 0,
    team: ["SM", "ML", "KD"],
    versions: 15,
    lastUpdated: "Gestern",
    starred: false,
    savedStories: [],
    versionHistory: [
      { version: "v1.0.0", date: "17.02.2026, 12:00", author: "Dr. Sarah Müller", changes: "Final Release – alle Compliance-Anforderungen erfüllt", storiesAdded: 0, issuesResolved: 2 },
    ],
  },
  {
    id: "P-004",
    name: "E-Commerce Checkout Flow",
    description: "Optimierung des Checkout-Prozesses für höhere Conversion Rate",
    status: "Aktiv",
    statusColor: "#4f46e5",
    stories: 89,
    compliance: 78,
    issues: 8,
    team: ["TK", "AH"],
    versions: 4,
    lastUpdated: "vor 1 Tag",
    starred: false,
    savedStories: [],
    versionHistory: [],
  },
  {
    id: "P-005",
    name: "IoT Dashboard Spezifikation",
    description: "Real-time Dashboard für IoT-Sensordaten in Produktionsumgebungen",
    status: "Entwurf",
    statusColor: "#94a3b8",
    stories: 56,
    compliance: 65,
    issues: 15,
    team: ["JR"],
    versions: 2,
    lastUpdated: "vor 3 Tagen",
    starred: false,
    savedStories: [],
    versionHistory: [],
  },
  {
    id: "P-006",
    name: "CRM Integration Suite",
    description: "Salesforce und HubSpot Integration für die Vertriebsabteilung",
    status: "Aktiv",
    statusColor: "#4f46e5",
    stories: 145,
    compliance: 85,
    issues: 6,
    team: ["SM", "BW", "ML"],
    versions: 6,
    lastUpdated: "vor 2 Tagen",
    starred: false,
    savedStories: [],
    versionHistory: [],
  },
];

const getScoreColor = (score: number) => {
  if (score >= 80) return "#10b981";
  if (score >= 60) return "#f59e0b";
  return "#ef4444";
};

const effortConfig: Record<string, { color: string; bg: string }> = {
  Niedrig: { color: "#10b981", bg: "#d1fae5" },
  Mittel: { color: "#f59e0b", bg: "#fef3c7" },
  Hoch: { color: "#ef4444", bg: "#fef2f2" },
};

export function Projects() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "stories" | "history">("overview");
  const [editingStory, setEditingStory] = useState<SavedStory | null>(null);

  const filteredProjects = projects.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase())
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
                onClick={() => { setSelectedProject(null); setActiveTab("overview"); }}
                className="text-muted-foreground gap-1"
              >
                <ArrowLeft className="w-4 h-4" />
                Projekte
              </Button>
              <div>
                <div className="flex items-center gap-3">
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
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="text-[13px] gap-2" onClick={() => navigate("/story-generator")}>
                <Sparkles className="w-4 h-4" />
                Stories generieren
              </Button>
              <Button variant="outline" size="sm" className="text-[13px] gap-2" onClick={() => navigate("/compliance")}>
                <ShieldCheck className="w-4 h-4" />
                Compliance Check
              </Button>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <Card className="border border-border bg-white">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#f1f0ff] flex items-center justify-center">
                  <FileText className="w-5 h-5 text-[#4f46e5]" />
                </div>
                <div>
                  <p className="text-[22px] text-[#1e1e2e]" style={{ fontWeight: 600 }}>{selectedProject.stories}</p>
                  <p className="text-[12px] text-muted-foreground">User Stories</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border border-border bg-white">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#d1fae5] flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5 text-[#10b981]" />
                </div>
                <div>
                  <p className="text-[22px]" style={{ fontWeight: 600, color: getScoreColor(selectedProject.compliance) }}>
                    {selectedProject.compliance}%
                  </p>
                  <p className="text-[12px] text-muted-foreground">Compliance</p>
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
              { key: "stories" as const, label: `Gespeicherte Stories (${selectedProject.savedStories.length})` },
              { key: "history" as const, label: "Versionshistorie" },
            ].map((tab) => (
              <button
                key={tab.key}
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
                  <div className="flex justify-between text-[13px]">
                    <span className="text-muted-foreground">Team</span>
                    <div className="flex items-center -space-x-2">
                      {selectedProject.team.map((m, i) => (
                        <div key={i} className="w-6 h-6 rounded-full bg-[#4f46e5] flex items-center justify-center border-2 border-white">
                          <span className="text-[9px] text-white" style={{ fontWeight: 600 }}>{m}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-between text-[13px]">
                    <span className="text-muted-foreground">Compliance-Score</span>
                    <div className="flex items-center gap-2">
                      <Progress value={selectedProject.compliance} className="h-1.5 w-24" />
                      <span style={{ fontWeight: 600, color: getScoreColor(selectedProject.compliance) }}>
                        {selectedProject.compliance}%
                      </span>
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

          {/* Tab Content: Saved Stories */}
          {activeTab === "stories" && (
            <div>
              {selectedProject.savedStories.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-16 h-16 rounded-2xl bg-[#f1f5f9] flex items-center justify-center mx-auto mb-4">
                    <FileText className="w-7 h-7 text-[#94a3b8]" />
                  </div>
                  <p className="text-[16px] text-[#1e1e2e] mb-1" style={{ fontWeight: 500 }}>Keine gespeicherten Stories</p>
                  <p className="text-[13px] text-muted-foreground mb-4">
                    Generieren Sie User Stories und speichern Sie sie in diesem Projekt.
                  </p>
                  <Button
                    className="bg-[#4f46e5] hover:bg-[#4338ca] text-white gap-2"
                    onClick={() => navigate("/story-generator")}
                  >
                    <Sparkles className="w-4 h-4" />
                    Stories generieren
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedProject.savedStories.map((story) => (
                    <Card key={story.id} className="border border-border bg-white hover:shadow-sm transition-all">
                      <CardContent className="p-5">
                        <div className="flex items-start gap-4">
                          {/* Score */}
                          <div className="flex-shrink-0 w-[56px]">
                            <div
                              className="w-[56px] h-[56px] rounded-xl flex items-center justify-center relative"
                              style={{ backgroundColor: `${getScoreColor(story.conformityScore)}10` }}
                            >
                              <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 56 56">
                                <circle cx="28" cy="28" r="22" fill="none" stroke="#e2e8f0" strokeWidth="3" />
                                <circle
                                  cx="28"
                                  cy="28"
                                  r="22"
                                  fill="none"
                                  stroke={getScoreColor(story.conformityScore)}
                                  strokeWidth="3"
                                  strokeDasharray={`${(story.conformityScore / 100) * 138.2} 138.2`}
                                  strokeLinecap="round"
                                />
                              </svg>
                              <span
                                className="text-[16px] relative z-10"
                                style={{ fontWeight: 700, color: getScoreColor(story.conformityScore) }}
                              >
                                {story.conformityScore}
                              </span>
                            </div>
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                              <StoryLink id={story.id} className="text-[11px]">
                                <Badge variant="outline" className="text-[11px] text-[#4f46e5] border-[#4f46e5]/30 px-1.5 hover:bg-[#f1f0ff] cursor-pointer">
                                  {story.id}
                                </Badge>
                              </StoryLink>
                              <Badge
                                variant="secondary"
                                className="text-[11px] px-1.5"
                                style={{
                                  backgroundColor: story.priority === "Hoch" ? "#fef2f2" : story.priority === "Mittel" ? "#fef3c7" : "#f1f5f9",
                                  color: story.priority === "Hoch" ? "#ef4444" : story.priority === "Mittel" ? "#f59e0b" : "#64748b",
                                }}
                              >
                                Prio: {story.priority}
                              </Badge>
                              <Badge
                                variant="secondary"
                                className="text-[11px] px-1.5"
                                style={{
                                  backgroundColor: effortConfig[story.effort].bg,
                                  color: effortConfig[story.effort].color,
                                }}
                              >
                                Aufwand: {story.effort}
                              </Badge>
                              <Badge variant="secondary" className="text-[11px] px-1.5 bg-[#f1f5f9] text-[#64748b]">
                                v{story.version}
                              </Badge>
                              {story.resolvedIssues < story.issuesCount ? (
                                <Badge variant="secondary" className="text-[11px] px-1.5 bg-[#fef2f2] text-[#ef4444]">
                                  <AlertTriangle className="w-3 h-3 mr-1" />
                                  {story.issuesCount - story.resolvedIssues} offen
                                </Badge>
                              ) : (
                                <Badge variant="secondary" className="text-[11px] px-1.5 bg-[#d1fae5] text-[#10b981]">
                                  <CheckCircle2 className="w-3 h-3 mr-1" />
                                  Konform
                                </Badge>
                              )}
                            </div>

                            <p className="text-[15px] text-[#1e1e2e] mb-1" style={{ fontWeight: 500 }}>
                              {story.title}
                            </p>
                            <p className="text-[13px] text-[#475569]">
                              Als <span style={{ fontWeight: 500 }}>{story.role}</span> möchte ich{" "}
                              <span style={{ fontWeight: 500 }}>{story.goal}</span>.
                            </p>

                            <div className="flex items-center gap-4 mt-3 text-[12px] text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                Gespeichert: {story.savedAt}
                              </span>
                              {story.lastEdited && (
                                <span className="flex items-center gap-1">
                                  <Pencil className="w-3 h-3" />
                                  Bearbeitet: {story.lastEdited}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-[12px] h-8 gap-1"
                              onClick={() => setEditingStory(story)}
                            >
                              <Edit3 className="w-3 h-3" />
                              Bearbeiten
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <button className="p-1.5 rounded hover:bg-[#f1f5f9] transition-colors">
                                  <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                                </button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem className="text-[13px] gap-2">
                                  <History className="w-3.5 h-3.5" /> Versionshistorie
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-[13px] gap-2">
                                  <Copy className="w-3.5 h-3.5" /> Duplizieren
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-[13px] gap-2">
                                  <Download className="w-3.5 h-3.5" /> Exportieren
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-[13px] gap-2 text-[#ef4444]">
                                  <Trash2 className="w-3.5 h-3.5" /> Entfernen
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
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

          {/* Edit Story Dialog */}
          <Dialog open={!!editingStory} onOpenChange={() => setEditingStory(null)}>
            <DialogContent className="sm:max-w-[560px]">
              <DialogHeader>
                <DialogTitle>Story bearbeiten</DialogTitle>
                <DialogDescription>
                  Bearbeiten Sie die User Story {editingStory?.id}. Änderungen werden als neue Version gespeichert.
                </DialogDescription>
              </DialogHeader>
              {editingStory && (
                <div className="space-y-4 my-4">
                  <div>
                    <label className="text-[13px] text-[#475569] mb-1.5 block">Titel</label>
                    <input
                      defaultValue={editingStory.title}
                      className="w-full px-3 py-2 rounded-lg border border-border bg-white text-[13px] outline-none focus:border-[#4f46e5] focus:ring-2 focus:ring-[#4f46e5]/10 transition-all"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[13px] text-[#475569] mb-1.5 block">Rolle</label>
                      <input
                        defaultValue={editingStory.role}
                        className="w-full px-3 py-2 rounded-lg border border-border bg-white text-[13px] outline-none focus:border-[#4f46e5] focus:ring-2 focus:ring-[#4f46e5]/10 transition-all"
                      />
                    </div>
                    <div>
                      <label className="text-[13px] text-[#475569] mb-1.5 block">Priorität</label>
                      <select
                        defaultValue={editingStory.priority}
                        className="w-full px-3 py-2 rounded-lg border border-border bg-white text-[13px] outline-none focus:border-[#4f46e5]"
                      >
                        <option>Hoch</option>
                        <option>Mittel</option>
                        <option>Niedrig</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="text-[13px] text-[#475569] mb-1.5 block">Ziel</label>
                    <textarea
                      defaultValue={editingStory.goal}
                      rows={3}
                      className="w-full px-3 py-2 rounded-lg border border-border bg-white text-[13px] outline-none focus:border-[#4f46e5] focus:ring-2 focus:ring-[#4f46e5]/10 transition-all resize-none"
                    />
                  </div>
                  <div className="px-3 py-2 rounded-lg bg-[#f1f0ff] border border-[#4f46e5]/20">
                    <p className="text-[12px] text-[#4f46e5]" style={{ fontWeight: 500 }}>
                      Aktuelle Version: v{editingStory.version} → Wird gespeichert als v{editingStory.version + 1}
                    </p>
                  </div>
                </div>
              )}
              <DialogFooter>
                <Button variant="outline" onClick={() => setEditingStory(null)}>
                  Abbrechen
                </Button>
                <Button
                  className="bg-[#4f46e5] hover:bg-[#4338ca] text-white gap-2"
                  onClick={() => setEditingStory(null)}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Speichern (v{editingStory ? editingStory.version + 1 : 1})
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </TooltipProvider>
    );
  }

  // Project List View
  return (
    <TooltipProvider>
      <div className="p-8 max-w-[1200px] mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-[#1e1e2e]">Projekte</h1>
            <p className="text-[14px] text-muted-foreground mt-1">
              {projects.length} Projekte, {projects.filter((p) => p.status === "Aktiv").length} aktiv
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
            <Button variant="outline" size="sm" className="text-[13px] gap-2">
              <ArrowUpDown className="w-4 h-4" />
              Sortieren
            </Button>
            <Button variant="outline" size="sm" className="text-[13px] gap-2">
              <Download className="w-4 h-4" />
              Export
            </Button>
          </div>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-2 gap-4">
          {filteredProjects.map((project) => (
            <Card
              key={project.id}
              className="border border-border bg-white hover:shadow-md transition-all duration-200 cursor-pointer group"
              onClick={() => setSelectedProject(project)}
            >
              <CardContent className="p-5">
                {/* Header Row */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-xl bg-[#f1f5f9] flex items-center justify-center flex-shrink-0 group-hover:bg-[#f1f0ff] transition-colors">
                      <FolderOpen className="w-5 h-5 text-[#64748b] group-hover:text-[#4f46e5] transition-colors" />
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
                <div className="grid grid-cols-3 gap-3 mb-4">
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

                {/* Saved Stories indicator */}
                {project.savedStories.length > 0 && (
                  <div className="flex items-center gap-1.5 mb-3 text-[12px] text-[#4f46e5]">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span style={{ fontWeight: 500 }}>{project.savedStories.length} gespeicherte Stories</span>
                  </div>
                )}

                {/* Compliance Bar */}
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-[11px] text-muted-foreground" style={{ fontWeight: 500 }}>Compliance</span>
                  <Progress value={project.compliance} className="h-1.5 flex-1" />
                  <span
                    className="text-[12px]"
                    style={{
                      fontWeight: 600,
                      color: project.compliance >= 90 ? "#10b981" : project.compliance >= 70 ? "#f59e0b" : "#ef4444",
                    }}
                  >
                    {project.compliance}%
                  </span>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-border">
                  <div className="flex items-center -space-x-2">
                    {project.team.map((member, i) => (
                      <div
                        key={i}
                        className="w-6 h-6 rounded-full bg-[#4f46e5] flex items-center justify-center border-2 border-white"
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
      </div>
    </TooltipProvider>
  );
}