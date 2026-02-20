import { useState } from "react";
import {
  GitCompare,
  Search,
  CheckCircle2,
  XCircle,
  Layers,
  Link,
  Unlink,
  ArrowRight,
  Ban,
  Merge,
  Filter,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  FileText,
  ExternalLink,
  Eye,
  ThumbsUp,
  BarChart3,
  Info,
  Users,
  UserCheck,
  Copy,
  RefreshCw,
  AlertCircle as AlertCircleIcon,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../components/ui/tooltip";
import { StoryLink } from "../components/StoryLink";
import { TicketTypeIcon } from "../components/TicketTypeIcon";
import { useAppContext } from "../context/AppContext";

// --- Types ---
interface JiraTicket {
  key: string;
  summary: string;
  type: "Story" | "Epic" | "Bug" | "Task";
  status: "To Do" | "In Progress" | "Done" | "In Review";
  assignee: string;
  sprint: string;
  storyPoints: number;
  labels: string[];
}

interface UserStory {
  id: string;
  title: string;
  role: string;
  goal: string;
  project: string;
  effort: "Niedrig" | "Mittel" | "Hoch";
  priority: "Hoch" | "Mittel" | "Niedrig";
}

interface Relationship {
  id: string;
  storyId: string;
  ticketKey: string;
  type: "overlap" | "duplicate" | "contradiction" | "dependency" | "gap";
  confidence: number;
  description: string;
  recommendation: string;
  status: "detected" | "confirmed" | "dismissed";
}

// --- Mock Data ---
const mockJiraTickets: JiraTicket[] = [
  { key: "PROJ-101", summary: "SSO-Authentifizierung mit Azure AD implementieren", type: "Story", status: "In Progress", assignee: "M. Schmidt", sprint: "Sprint 43", storyPoints: 13, labels: ["auth", "security"] },
  { key: "PROJ-102", summary: "Dashboard Widget-Framework aufbauen", type: "Epic", status: "To Do", assignee: "L. Weber", sprint: "Sprint 44", storyPoints: 21, labels: ["frontend", "dashboard"] },
  { key: "PROJ-145", summary: "Push-Notification Service einrichten", type: "Story", status: "In Review", assignee: "K. Fischer", sprint: "Sprint 43", storyPoints: 8, labels: ["notifications"] },
  { key: "PROJ-156", summary: "CSV/PDF Export für Reports", type: "Story", status: "Done", assignee: "A. Braun", sprint: "Sprint 42", storyPoints: 5, labels: ["export", "reports"] },
  { key: "PROJ-200", summary: "Rollen- und Berechtigungskonzept", type: "Epic", status: "To Do", assignee: "S. Müller", sprint: "Backlog", storyPoints: 34, labels: ["auth", "rbac"] },
  { key: "PROJ-210", summary: "Audit-Log Viewer Komponente", type: "Task", status: "In Progress", assignee: "T. Hoffmann", sprint: "Sprint 43", storyPoints: 5, labels: ["audit", "compliance"] },
  { key: "PROJ-089", summary: "Okta SSO Integration (Legacy)", type: "Story", status: "Done", assignee: "M. Schmidt", sprint: "Sprint 38", storyPoints: 8, labels: ["auth", "legacy"] },
  { key: "PROJ-220", summary: "Automatisierte E2E Tests mit Playwright", type: "Story", status: "In Progress", assignee: "P. Richter", sprint: "Sprint 43", storyPoints: 13, labels: ["testing", "ci-cd"] },
  { key: "PROJ-301", summary: "Mobile-App Offline Sync", type: "Epic", status: "To Do", assignee: "Nicht zugewiesen", sprint: "Backlog", storyPoints: 21, labels: ["mobile", "offline"] },
  { key: "PROJ-315", summary: "Performance-Monitoring Dashboard", type: "Task", status: "To Do", assignee: "L. Weber", sprint: "Sprint 44", storyPoints: 8, labels: ["monitoring", "dashboard"] },
  { key: "PROJ-330", summary: "API Rate Limiting implementieren", type: "Story", status: "In Progress", assignee: "T. Hoffmann", sprint: "Sprint 43", storyPoints: 5, labels: ["api", "security"] },
  { key: "PROJ-345", summary: "DSGVO-konformes Löschkonzept", type: "Story", status: "To Do", assignee: "S. Müller", sprint: "Sprint 44", storyPoints: 13, labels: ["compliance", "dsgvo"] },
];

const mockUserStories: UserStory[] = [
  { id: "US-001", title: "Benutzer-Authentifizierung via SSO", role: "Unternehmensadministrator", goal: "mich über SSO anmelden können", project: "Automobil-Plattform Redesign", effort: "Hoch", priority: "Hoch" },
  { id: "US-002", title: "Dashboard-Personalisierung", role: "Endbenutzer", goal: "mein Dashboard individuell anpassen können", project: "Automobil-Plattform Redesign", effort: "Mittel", priority: "Mittel" },
  { id: "US-003", title: "Echtzeit-Benachrichtigungen", role: "Projektmanager", goal: "Echtzeit-Benachrichtigungen erhalten", project: "Automobil-Plattform Redesign", effort: "Hoch", priority: "Hoch" },
  { id: "US-004", title: "Datenexport in Standardformate", role: "Business Analyst", goal: "Daten in CSV, PDF und Excel exportieren", project: "Automobil-Plattform Redesign", effort: "Mittel", priority: "Mittel" },
  { id: "US-005", title: "Audit-Trail für alle Änderungen", role: "Compliance-Beauftragter", goal: "einen vollständigen Audit-Trail einsehen", project: "Healthcare Portal DSGVO", effort: "Hoch", priority: "Hoch" },
  { id: "US-006", title: "Rollenbasierte Zugriffskontrolle", role: "Systemadministrator", goal: "Benutzerrollen mit Berechtigungen definieren", project: "Banking App v3.2 Migration", effort: "Hoch", priority: "Hoch" },
  { id: "US-007", title: "Automatisierte Regressionstests", role: "QA-Engineer", goal: "automatisierte Tests bei jedem Deployment", project: "Automobil-Plattform Redesign", effort: "Mittel", priority: "Hoch" },
  { id: "US-008", title: "DSGVO-konforme Datenlöschung", role: "Datenschutzbeauftragter", goal: "personenbezogene Daten DSGVO-konform löschen", project: "Healthcare Portal DSGVO", effort: "Hoch", priority: "Hoch" },
  { id: "US-009", title: "API Performance Monitoring", role: "DevOps Engineer", goal: "API-Performance in Echtzeit überwachen", project: "Banking App v3.2 Migration", effort: "Mittel", priority: "Mittel" },
];

const initialRelationships: Relationship[] = [
  {
    id: "REL-001", storyId: "US-001", ticketKey: "PROJ-101",
    type: "overlap", confidence: 92,
    description: "US-001 definiert SSO für Azure AD und Okta. PROJ-101 implementiert nur Azure AD. Die Okta-Integration fehlt im Jira-Ticket.",
    recommendation: "PROJ-101 um Okta-Scope erweitern oder separates Ticket für Okta erstellen.",
    status: "detected",
  },
  {
    id: "REL-002", storyId: "US-001", ticketKey: "PROJ-089",
    type: "duplicate", confidence: 78,
    description: "PROJ-089 (Legacy Okta SSO) ist als 'Done' markiert, aber US-001 fordert eine neue Okta-Integration. Möglicher Scope-Konflikt.",
    recommendation: "Prüfen, ob PROJ-089 die Anforderungen aus US-001 bereits erfüllt. Falls nein: Migration-Ticket erstellen.",
    status: "detected",
  },
  {
    id: "REL-003", storyId: "US-002", ticketKey: "PROJ-102",
    type: "overlap", confidence: 85,
    description: "PROJ-102 (Dashboard Widget-Framework) deckt die technische Basis ab, aber ohne spezifische Widget-Typen oder Limits.",
    recommendation: "Akzeptanzkriterien von US-002 als Sub-Tasks in PROJ-102 übernehmen.",
    status: "detected",
  },
  {
    id: "REL-004", storyId: "US-003", ticketKey: "PROJ-145",
    type: "contradiction", confidence: 88,
    description: "PROJ-145 implementiert Push-Notifications über Firebase. US-003 fordert WebSocket-basierte Benachrichtigungen.",
    recommendation: "Technologie-Entscheidung treffen: WebSocket vs. Firebase. PROJ-145 ggf. anpassen.",
    status: "detected",
  },
  {
    id: "REL-005", storyId: "US-004", ticketKey: "PROJ-156",
    type: "overlap", confidence: 72,
    description: "PROJ-156 (CSV/PDF Export) ist als 'Done' markiert. US-004 erweitert um XLSX und Batch-Export.",
    recommendation: "Neues Ticket für XLSX-Export und Batch-Funktion erstellen. PROJ-156 als Basis-Implementierung behalten.",
    status: "detected",
  },
  {
    id: "REL-006", storyId: "US-005", ticketKey: "PROJ-210",
    type: "dependency", confidence: 90,
    description: "US-005 (Audit-Trail) hat eine funktionale Abhängigkeit zu PROJ-210 (Audit-Log Viewer). Die Viewer-Komponente muss die von US-005 geforderten Filter unterstützen.",
    recommendation: "PROJ-210 Akzeptanzkriterien mit US-005 Anforderungen abgleichen.",
    status: "detected",
  },
  {
    id: "REL-007", storyId: "US-006", ticketKey: "PROJ-200",
    type: "dependency", confidence: 95,
    description: "PROJ-200 definiert Rollen-Konzept ohne SoD-Prüfung und 4-Augen-Prinzip. US-006 erweitert die Anforderungen erheblich.",
    recommendation: "PROJ-200 Akzeptanzkriterien mit US-006 synchronisieren. Story Points anpassen.",
    status: "detected",
  },
  {
    id: "REL-008", storyId: "US-007", ticketKey: "PROJ-220",
    type: "overlap", confidence: 82,
    description: "PROJ-220 nutzt Playwright für E2E-Tests. US-007 ist technologie-agnostisch, fordert aber 80% Coverage.",
    recommendation: "Coverage-Anforderung aus US-007 in PROJ-220 Akzeptanzkriterien ergänzen.",
    status: "detected",
  },
  {
    id: "REL-009", storyId: "US-008", ticketKey: "PROJ-345",
    type: "overlap", confidence: 91,
    description: "Beide adressieren DSGVO-konforme Datenlöschung, aber aus unterschiedlichen Perspektiven. US-008 fokussiert auf Benutzer-Workflow, PROJ-345 auf technisches Konzept.",
    recommendation: "Anforderungen zusammenführen. PROJ-345 als technische Implementierung von US-008 definieren.",
    status: "detected",
  },
  {
    id: "REL-010", storyId: "US-009", ticketKey: "PROJ-315",
    type: "overlap", confidence: 76,
    description: "US-009 (API Performance Monitoring) und PROJ-315 (Performance-Monitoring Dashboard) haben erhebliche Überschneidungen im Scope.",
    recommendation: "Scopes klar abgrenzen: PROJ-315 = Dashboard UI, US-009 = Backend-Metriken & Alerting.",
    status: "detected",
  },
  {
    id: "REL-011", storyId: "", ticketKey: "PROJ-301",
    type: "gap", confidence: 65,
    description: "PROJ-301 (Mobile-App Offline Sync) hat kein Gegenstück in den vorhandenen User Stories.",
    recommendation: "Offline-Anforderung mit Product Owner klären. Falls relevant: neue User Story erstellen.",
    status: "detected",
  },
  {
    id: "REL-012", storyId: "", ticketKey: "PROJ-330",
    type: "gap", confidence: 58,
    description: "PROJ-330 (API Rate Limiting) hat kein Gegenstück in den User Stories. Sicherheitsrelevantes Feature ohne formale Anforderung.",
    recommendation: "Non-funktionale Anforderung für API-Sicherheit erstellen.",
    status: "detected",
  },
];

const typeConfig: Record<string, { label: string; icon: typeof GitCompare; color: string; bg: string }> = {
  overlap: { label: "Überschneidung", icon: GitCompare, color: "#4f46e5", bg: "#f1f0ff" },
  duplicate: { label: "Duplikat", icon: Layers, color: "#8b5cf6", bg: "#ede9fe" },
  contradiction: { label: "Widerspruch", icon: XCircle, color: "#ef4444", bg: "#fef2f2" },
  dependency: { label: "Abhängigkeit", icon: Link, color: "#0284c7", bg: "#f0f9ff" },
  gap: { label: "Lücke", icon: Unlink, color: "#ea580c", bg: "#fff7ed" },
};

const jiraStatusConfig: Record<string, { color: string; bg: string }> = {
  "To Do": { color: "#64748b", bg: "#f1f5f9" },
  "In Progress": { color: "#4f46e5", bg: "#f1f0ff" },
  "In Review": { color: "#f59e0b", bg: "#fef3c7" },
  "Done": { color: "#10b981", bg: "#d1fae5" },
};

const effortConfig: Record<string, { color: string; bg: string }> = {
  Niedrig: { color: "#10b981", bg: "#d1fae5" },
  Mittel: { color: "#f59e0b", bg: "#fef3c7" },
  Hoch: { color: "#ef4444", bg: "#fef2f2" },
};

// --- Duplicate Work Detection ---
interface DuplicateCluster {
  id: string;
  title: string;
  tickets: { key: string; summary: string; assignee: string; status: string }[];
  similarity: number;
  risk: "high" | "medium" | "low";
  recommendation: string;
}

const duplicateClusters: DuplicateCluster[] = [
  {
    id: "DUP-001",
    title: "SSO-Authentifizierung - Parallele Implementierung",
    tickets: [
      { key: "PROJ-101", summary: "SSO-Authentifizierung mit Azure AD implementieren", assignee: "M. Schmidt", status: "In Progress" },
      { key: "PROJ-089", summary: "Okta SSO Integration (Legacy)", assignee: "M. Schmidt", status: "Done" },
    ],
    similarity: 82,
    risk: "high",
    recommendation: "PROJ-089 ist als 'Done' markiert, aber PROJ-101 implementiert Azure AD parallel. Prüfen, ob der Legacy-Code wiederverwendet werden kann.",
  },
  {
    id: "DUP-002",
    title: "Performance-Monitoring - Überlappender Scope",
    tickets: [
      { key: "PROJ-315", summary: "Performance-Monitoring Dashboard", assignee: "L. Weber", status: "To Do" },
      { key: "PROJ-330", summary: "API Rate Limiting implementieren", assignee: "T. Hoffmann", status: "In Progress" },
    ],
    similarity: 64,
    risk: "medium",
    recommendation: "Beide Tickets berühren API-Performance. Rate-Limiting-Metriken sollten ins Monitoring-Dashboard integriert werden, um doppelte Dashboard-Arbeit zu vermeiden.",
  },
  {
    id: "DUP-003",
    title: "Compliance & Audit - Feature-Überschneidung",
    tickets: [
      { key: "PROJ-210", summary: "Audit-Log Viewer Komponente", assignee: "T. Hoffmann", status: "In Progress" },
      { key: "PROJ-345", summary: "DSGVO-konformes Löschkonzept", assignee: "S. Müller", status: "To Do" },
    ],
    similarity: 56,
    risk: "low",
    recommendation: "Beide Tickets benötigen Audit-Infrastruktur. Gemeinsame Basis-Komponenten sollten abgestimmt werden, um Code-Duplikation zu vermeiden.",
  },
];

// --- Auto-Assignment Suggestions ---
interface AssignmentSuggestion {
  ticketKey: string;
  summary: string;
  currentAssignee: string;
  suggestedAssignee: string;
  reason: string;
  workloadBefore: number;
  workloadAfter: number;
}

const assignmentSuggestions: AssignmentSuggestion[] = [
  {
    ticketKey: "PROJ-301",
    summary: "Mobile-App Offline Sync",
    currentAssignee: "Nicht zugewiesen",
    suggestedAssignee: "K. Fischer",
    reason: "Erfahrung mit Push-Notifications (PROJ-145), geringste Auslastung im Team",
    workloadBefore: 45,
    workloadAfter: 68,
  },
  {
    ticketKey: "PROJ-345",
    summary: "DSGVO-konformes Löschkonzept",
    currentAssignee: "S. Müller",
    suggestedAssignee: "T. Hoffmann",
    reason: "Arbeitet bereits an Audit-Log (PROJ-210), synergieeffekte bei Compliance-Themen",
    workloadBefore: 72,
    workloadAfter: 85,
  },
];

export function JiraComparison() {
  const { setShowExportDialog, setExportScope } = useAppContext();
  const [relationships, setRelationships] = useState<Relationship[]>(initialRelationships);
  const [filterType, setFilterType] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRelationship, setSelectedRelationship] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"mapping" | "analysis" | "duplicates">("mapping");
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  const [resolvedDuplicates, setResolvedDuplicates] = useState<Set<string>>(new Set());
  const [appliedAssignments, setAppliedAssignments] = useState<Set<string>>(new Set());

  const handleAction = (relId: string, action: "confirmed" | "dismissed") => {
    setRelationships((prev) => prev.map((r) => (r.id === relId ? { ...r, status: action } : r)));
  };

  const filteredRelationships = relationships.filter((r) => {
    if (filterType !== "all" && r.type !== filterType) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const story = mockUserStories.find((s) => s.id === r.storyId);
      const ticket = mockJiraTickets.find((t) => t.key === r.ticketKey);
      return (
        r.storyId.toLowerCase().includes(query) ||
        r.ticketKey.toLowerCase().includes(query) ||
        story?.title.toLowerCase().includes(query) ||
        ticket?.summary.toLowerCase().includes(query) ||
        r.description.toLowerCase().includes(query)
      );
    }
    return true;
  });

  const detectedCount = relationships.filter((r) => r.status === "detected").length;
  const confirmedCount = relationships.filter((r) => r.status === "confirmed").length;
  const dismissedCount = relationships.filter((r) => r.status === "dismissed").length;

  const toggleExpand = (id: string) => {
    setExpandedCards((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const getConfidenceColor = (c: number) => {
    if (c >= 85) return "#10b981";
    if (c >= 70) return "#f59e0b";
    return "#ef4444";
  };

  return (
    <TooltipProvider>
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="px-8 py-5 border-b border-border bg-white flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <div className="w-10 h-10 rounded-xl bg-[#4f46e5]/10 flex items-center justify-center">
                  <GitCompare className="w-5 h-5 text-[#4f46e5]" />
                </div>
                <div>
                  <h1 className="text-[#1e1e2e]">Jira-Story Abgleich</h1>
                  <p className="text-[13px] text-muted-foreground mt-0.5">
                    Vergleichen Sie bestehende Jira-Tickets mit Ihren User Stories und identifizieren Sie Zusammenhänge.
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                className="text-[12px] gap-1.5"
                onClick={() => { setExportScope("jira"); setShowExportDialog(true); }}
              >
                <FileText className="w-3.5 h-3.5" />
                Export
              </Button>
              <div className="flex items-center rounded-lg border border-border overflow-hidden bg-white">
                <button
                  onClick={() => setViewMode("mapping")}
                  className={`px-3 py-1.5 text-[12px] transition-colors ${viewMode === "mapping" ? "bg-[#4f46e5] text-white" : "text-[#475569] hover:bg-[#f1f5f9]"}`}
                  style={{ fontWeight: 500 }}
                >
                  Mapping
                </button>
                <button
                  onClick={() => setViewMode("duplicates")}
                  className={`px-3 py-1.5 text-[12px] transition-colors flex items-center gap-1 ${viewMode === "duplicates" ? "bg-[#4f46e5] text-white" : "text-[#475569] hover:bg-[#f1f5f9]"}`}
                  style={{ fontWeight: 500 }}
                >
                  Duplikate
                  {duplicateClusters.length > 0 && (
                    <span className={`text-[9px] px-1 py-0.5 rounded-full ${viewMode === "duplicates" ? "bg-white/20" : "bg-[#ef4444] text-white"}`} style={{ fontWeight: 700 }}>
                      {duplicateClusters.filter((d) => !resolvedDuplicates.has(d.id)).length}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setViewMode("analysis")}
                  className={`px-3 py-1.5 text-[12px] transition-colors ${viewMode === "analysis" ? "bg-[#4f46e5] text-white" : "text-[#475569] hover:bg-[#f1f5f9]"}`}
                  style={{ fontWeight: 500 }}
                >
                  Analyse
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="px-8 py-3 border-b border-border bg-[#fafbfc] flex items-center gap-6 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#f59e0b]" />
            <span className="text-[12px] text-[#475569]" style={{ fontWeight: 500 }}>Erkannt: <span style={{ fontWeight: 700 }}>{detectedCount}</span></span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#10b981]" />
            <span className="text-[12px] text-[#475569]" style={{ fontWeight: 500 }}>Bestätigt: <span style={{ fontWeight: 700 }}>{confirmedCount}</span></span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#94a3b8]" />
            <span className="text-[12px] text-[#475569]" style={{ fontWeight: 500 }}>Verworfen: <span style={{ fontWeight: 700 }}>{dismissedCount}</span></span>
          </div>
          <div className="flex-1" />
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-white">
            <Search className="w-4 h-4 text-muted-foreground" />
            <input
              placeholder="Tickets oder Stories suchen..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent outline-none text-[12px] w-[200px] placeholder:text-muted-foreground"
            />
          </div>
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-muted-foreground" />
            {[
              { key: "all", label: "Alle" },
              { key: "overlap", label: "Überschneidungen" },
              { key: "duplicate", label: "Duplikate" },
              { key: "contradiction", label: "Widersprüche" },
              { key: "dependency", label: "Abhängigkeiten" },
              { key: "gap", label: "Lücken" },
            ].map((f) => (
              <button
                key={f.key}
                onClick={() => setFilterType(f.key)}
                className={`px-2 py-1 rounded text-[11px] transition-colors ${
                  filterType === f.key
                    ? "bg-[#4f46e5] text-white"
                    : "bg-white border border-border text-[#475569] hover:bg-[#f1f5f9]"
                }`}
                style={{ fontWeight: 500 }}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          {viewMode === "mapping" ? (
            <>
              {/* Left: Jira Tickets */}
              <div className="w-[340px] overflow-y-auto bg-white border-r border-border p-4 flex-shrink-0">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-6 h-6 rounded bg-[#2684ff]/10 flex items-center justify-center">
                    <span className="text-[11px]" style={{ fontWeight: 700, color: "#2684ff" }}>J</span>
                  </div>
                  <h4 className="text-[13px] text-[#1e1e2e]" style={{ fontWeight: 600 }}>Jira-Tickets ({mockJiraTickets.length})</h4>
                </div>
                <div className="space-y-2">
                  {mockJiraTickets.map((ticket) => {
                    const statusConf = jiraStatusConfig[ticket.status];
                    const matchCount = relationships.filter((r) => r.ticketKey === ticket.key).length;
                    const isHighlighted = selectedRelationship
                      ? relationships.find((r) => r.id === selectedRelationship)?.ticketKey === ticket.key
                      : false;

                    return (
                      <div
                        key={ticket.key}
                        className={`p-3 rounded-lg border transition-all cursor-pointer ${
                          isHighlighted
                            ? "border-[#4f46e5] bg-[#f1f0ff]/50 shadow-sm"
                            : matchCount > 0
                            ? "border-[#4f46e5]/15 bg-white hover:border-[#4f46e5]/30"
                            : "border-border bg-white hover:bg-[#f8fafc]"
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <StoryLink id={ticket.key} className="text-[11px] !text-[#2684ff]" />
                          <Badge variant="secondary" className="text-[9px] px-1" style={{ backgroundColor: statusConf.bg, color: statusConf.color, fontWeight: 600 }}>
                            {ticket.status}
                          </Badge>
                          <TicketTypeIcon type={ticket.type} size="sm" showLabel />
                          {matchCount > 0 && (
                            <span className="ml-auto text-[9px] px-1.5 py-0.5 rounded-full bg-[#4f46e5] text-white" style={{ fontWeight: 600 }}>
                              {matchCount}
                            </span>
                          )}
                        </div>
                        <p className="text-[12px] text-[#1e1e2e] mb-1.5" style={{ fontWeight: 500 }}>{ticket.summary}</p>
                        <div className="flex items-center gap-2 text-[10px] text-muted-foreground flex-wrap">
                          <span>{ticket.assignee}</span>
                          <span>·</span>
                          <span>{ticket.sprint}</span>
                          <span>·</span>
                          <span>{ticket.storyPoints} SP</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Center: Relationships */}
              <div className="flex-1 overflow-y-auto p-5 bg-[#fafbfc]">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-[14px] text-[#1e1e2e]" style={{ fontWeight: 600 }}>
                    Erkannte Beziehungen ({filteredRelationships.length})
                  </h4>
                </div>

                <div className="space-y-3">
                  {filteredRelationships.map((rel) => {
                    const config = typeConfig[rel.type];
                    const story = mockUserStories.find((s) => s.id === rel.storyId);
                    const ticket = mockJiraTickets.find((t) => t.key === rel.ticketKey);
                    const isExpanded = expandedCards.has(rel.id);
                    const isSelected = selectedRelationship === rel.id;

                    return (
                      <Card
                        key={rel.id}
                        className={`border bg-white transition-all cursor-pointer ${
                          rel.status === "confirmed" ? "opacity-60" : rel.status === "dismissed" ? "opacity-40" : ""
                        } ${isSelected ? "ring-2 ring-[#4f46e5]/30" : ""}`}
                        style={{ borderColor: rel.status === "detected" ? `${config.color}30` : "#e2e8f0" }}
                        onClick={() => setSelectedRelationship(isSelected ? null : rel.id)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: config.bg }}>
                              <config.icon className="w-4 h-4" style={{ color: config.color }} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                                <Badge variant="secondary" className="text-[10px] px-1.5" style={{ backgroundColor: config.bg, color: config.color, fontWeight: 600 }}>
                                  {config.label}
                                </Badge>
                                <Tooltip>
                                  <TooltipTrigger>
                                    <span className="text-[10px] px-1.5 py-0.5 rounded" style={{
                                      backgroundColor: `${getConfidenceColor(rel.confidence)}15`,
                                      color: getConfidenceColor(rel.confidence),
                                      fontWeight: 600,
                                    }}>
                                      {rel.confidence}% Konfidenz
                                    </span>
                                  </TooltipTrigger>
                                  <TooltipContent>KI-Konfidenz der erkannten Beziehung</TooltipContent>
                                </Tooltip>
                                {rel.status === "confirmed" && (
                                  <Badge variant="secondary" className="text-[10px] px-1.5 bg-[#d1fae5] text-[#10b981]">
                                    <CheckCircle2 className="w-3 h-3 mr-0.5" /> Bestätigt
                                  </Badge>
                                )}
                                {rel.status === "dismissed" && (
                                  <Badge variant="secondary" className="text-[10px] px-1.5 bg-[#f1f5f9] text-[#94a3b8]">
                                    Verworfen
                                  </Badge>
                                )}
                              </div>

                              {/* Connection Line */}
                              <div className="flex items-center gap-2 mb-2 p-2.5 rounded-lg bg-[#f8fafc] border border-border">
                                {story ? (
                                  <div className="flex items-center gap-1.5">
                                    <StoryLink id={rel.storyId} className="text-[11px] px-2 py-0.5 rounded bg-[#4f46e5]/10 hover:bg-[#4f46e5]/20" />
                                    <span className="text-[10px] text-muted-foreground truncate max-w-[120px]">{story.title}</span>
                                  </div>
                                ) : (
                                  <span className="text-[11px] text-muted-foreground italic">Kein Story-Gegenstück</span>
                                )}
                                <ArrowRight className="w-3 h-3 text-muted-foreground flex-shrink-0 mx-1" />
                                {ticket && (
                                  <div className="flex items-center gap-1.5">
                                    <StoryLink id={rel.ticketKey} className="text-[11px] px-2 py-0.5 rounded bg-[#2684ff]/10 hover:bg-[#2684ff]/20 !text-[#2684ff]" />
                                    <span className="text-[10px] text-muted-foreground truncate max-w-[120px]">{ticket.summary}</span>
                                  </div>
                                )}
                              </div>

                              <p className="text-[12px] text-[#475569] mb-2">{rel.description}</p>

                              {isExpanded && (
                                <div className="p-2.5 rounded bg-[#f1f0ff]/50 border border-[#4f46e5]/10 mb-3">
                                  <p className="text-[11px] text-[#4f46e5]" style={{ fontWeight: 500 }}>
                                    Empfehlung: {rel.recommendation}
                                  </p>
                                </div>
                              )}

                              <div className="flex items-center gap-2">
                                <button
                                  onClick={(e) => { e.stopPropagation(); toggleExpand(rel.id); }}
                                  className="flex items-center gap-1 text-[11px] text-[#475569] hover:text-[#4f46e5] transition-colors"
                                  style={{ fontWeight: 500 }}
                                >
                                  {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                                  {isExpanded ? "Weniger" : "Details"}
                                </button>
                                {rel.status === "detected" && (
                                  <>
                                    <Button
                                      size="sm"
                                      className="text-[11px] h-6 bg-[#4f46e5] hover:bg-[#4338ca] text-white gap-1 px-2"
                                      onClick={(e) => { e.stopPropagation(); handleAction(rel.id, "confirmed"); }}
                                    >
                                      <CheckCircle2 className="w-3 h-3" /> Bestätigen
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="text-[11px] h-6 text-muted-foreground gap-1 px-2"
                                      onClick={(e) => { e.stopPropagation(); handleAction(rel.id, "dismissed"); }}
                                    >
                                      <Ban className="w-3 h-3" /> Verwerfen
                                    </Button>
                                  </>
                                )}
                                {rel.status !== "detected" && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-[11px] h-6 text-muted-foreground gap-1 px-2"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setRelationships((prev) => prev.map((r) => r.id === rel.id ? { ...r, status: "detected" } : r));
                                    }}
                                  >
                                    Zurücksetzen
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}

                  {filteredRelationships.length === 0 && (
                    <div className="text-center py-12">
                      <GitCompare className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-40" />
                      <p className="text-[14px] text-muted-foreground" style={{ fontWeight: 500 }}>Keine Beziehungen für diesen Filter gefunden.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Right: User Stories */}
              <div className="w-[340px] overflow-y-auto bg-white border-l border-border p-4 flex-shrink-0">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-6 h-6 rounded bg-[#4f46e5]/10 flex items-center justify-center">
                    <FileText className="w-3 h-3 text-[#4f46e5]" />
                  </div>
                  <h4 className="text-[13px] text-[#1e1e2e]" style={{ fontWeight: 600 }}>User Stories ({mockUserStories.length})</h4>
                </div>
                <div className="space-y-2">
                  {mockUserStories.map((story) => {
                    const matchCount = relationships.filter((r) => r.storyId === story.id).length;
                    const isHighlighted = selectedRelationship
                      ? relationships.find((r) => r.id === selectedRelationship)?.storyId === story.id
                      : false;

                    return (
                      <div
                        key={story.id}
                        className={`p-3 rounded-lg border transition-all cursor-pointer ${
                          isHighlighted
                            ? "border-[#4f46e5] bg-[#f1f0ff]/50 shadow-sm"
                            : matchCount > 0
                            ? "border-[#4f46e5]/15 bg-white hover:border-[#4f46e5]/30"
                            : "border-border bg-white hover:bg-[#f8fafc]"
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[11px] text-[#4f46e5]" style={{ fontWeight: 600 }}>{story.id}</span>
                          <Badge variant="secondary" className="text-[9px] px-1" style={{
                            backgroundColor: story.priority === "Hoch" ? "#fef2f2" : story.priority === "Mittel" ? "#fef3c7" : "#f1f5f9",
                            color: story.priority === "Hoch" ? "#ef4444" : story.priority === "Mittel" ? "#f59e0b" : "#64748b"
                          }}>
                            {story.priority}
                          </Badge>
                          <Badge variant="secondary" className="text-[9px] px-1" style={{ backgroundColor: effortConfig[story.effort].bg, color: effortConfig[story.effort].color }}>
                            {story.effort}
                          </Badge>
                          {matchCount > 0 && (
                            <span className="ml-auto text-[9px] px-1.5 py-0.5 rounded-full bg-[#4f46e5] text-white" style={{ fontWeight: 600 }}>
                              {matchCount}
                            </span>
                          )}
                        </div>
                        <p className="text-[12px] text-[#1e1e2e] mb-1" style={{ fontWeight: 500 }}>{story.title}</p>
                        <p className="text-[10px] text-muted-foreground">{story.project}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          ) : viewMode === "duplicates" ? (
            /* Duplicate Detection & Auto-Assignment View */
            <div className="flex-1 overflow-y-auto p-6">
              <div className="max-w-[1100px] mx-auto">
                {/* Duplicate Clusters */}
                <div className="mb-8">
                  <div className="flex items-center gap-2 mb-4">
                    <Copy className="w-5 h-5 text-[#ef4444]" />
                    <h3 className="text-[16px] text-[#1e1e2e]" style={{ fontWeight: 600 }}>
                      Duplikat-Erkennung & parallele Arbeit
                    </h3>
                    <Badge variant="secondary" className="text-[11px] px-2 bg-[#fef2f2] text-[#ef4444]">
                      {duplicateClusters.filter((d) => !resolvedDuplicates.has(d.id)).length} aktiv
                    </Badge>
                  </div>
                  <p className="text-[13px] text-muted-foreground mb-5">
                    Tickets mit überlappenden Scopes, die parallel von verschiedenen Entwicklern bearbeitet werden.
                  </p>

                  <div className="space-y-4">
                    {duplicateClusters.map((cluster) => {
                      const isResolved = resolvedDuplicates.has(cluster.id);
                      return (
                        <Card key={cluster.id} className={`border bg-white transition-all ${isResolved ? "opacity-50" : ""}`}
                          style={{ borderColor: isResolved ? "#e2e8f0" : cluster.risk === "high" ? "#ef444430" : cluster.risk === "medium" ? "#f59e0b30" : "#e2e8f0" }}>
                          <CardContent className="p-5">
                            <div className="flex items-start gap-3">
                              <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                                cluster.risk === "high" ? "bg-[#fef2f2]" : cluster.risk === "medium" ? "bg-[#fef3c7]" : "bg-[#f1f5f9]"
                              }`}>
                                <Copy className={`w-4 h-4 ${
                                  cluster.risk === "high" ? "text-[#ef4444]" : cluster.risk === "medium" ? "text-[#f59e0b]" : "text-[#64748b]"
                                }`} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1.5">
                                  <p className="text-[14px] text-[#1e1e2e]" style={{ fontWeight: 500 }}>{cluster.title}</p>
                                  <Badge variant="secondary" className="text-[10px] px-1.5" style={{
                                    backgroundColor: cluster.risk === "high" ? "#fef2f2" : cluster.risk === "medium" ? "#fef3c7" : "#f1f5f9",
                                    color: cluster.risk === "high" ? "#ef4444" : cluster.risk === "medium" ? "#f59e0b" : "#64748b",
                                    fontWeight: 600,
                                  }}>
                                    {cluster.risk === "high" ? "Hohes Risiko" : cluster.risk === "medium" ? "Mittleres Risiko" : "Geringes Risiko"}
                                  </Badge>
                                  <Tooltip>
                                    <TooltipTrigger>
                                      <span className="text-[10px] px-1.5 py-0.5 rounded" style={{
                                        backgroundColor: `${cluster.similarity >= 75 ? "#ef4444" : cluster.similarity >= 60 ? "#f59e0b" : "#64748b"}15`,
                                        color: cluster.similarity >= 75 ? "#ef4444" : cluster.similarity >= 60 ? "#f59e0b" : "#64748b",
                                        fontWeight: 600,
                                      }}>
                                        {cluster.similarity}% Ähnlichkeit
                                      </span>
                                    </TooltipTrigger>
                                    <TooltipContent>KI-berechnete inhaltliche Übereinstimmung</TooltipContent>
                                  </Tooltip>
                                  {isResolved && <Badge variant="secondary" className="text-[10px] px-1.5 bg-[#d1fae5] text-[#10b981]">Gelöst</Badge>}
                                </div>

                                <div className="grid grid-cols-2 gap-3 mb-3">
                                  {cluster.tickets.map((t) => {
                                    const sc = jiraStatusConfig[t.status as keyof typeof jiraStatusConfig] || { color: "#64748b", bg: "#f1f5f9" };
                                    return (
                                      <div key={t.key} className="p-2.5 rounded-lg border border-border bg-[#f8fafc]">
                                        <div className="flex items-center gap-2 mb-1">
                                          <StoryLink id={t.key} className="text-[11px] !text-[#2684ff]" />
                                          <Badge variant="secondary" className="text-[9px] px-1" style={{ backgroundColor: sc.bg, color: sc.color, fontWeight: 600 }}>{t.status}</Badge>
                                        </div>
                                        <p className="text-[12px] text-[#1e1e2e] mb-1" style={{ fontWeight: 500 }}>{t.summary}</p>
                                        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                                          <Users className="w-3 h-3" />
                                          <span>{t.assignee}</span>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>

                                <div className="p-2.5 rounded bg-[#f1f0ff]/50 border border-[#4f46e5]/10 mb-3">
                                  <p className="text-[11px] text-[#4f46e5]" style={{ fontWeight: 500 }}>
                                    Empfehlung: {cluster.recommendation}
                                  </p>
                                </div>

                                {!isResolved && (
                                  <div className="flex items-center gap-2">
                                    <Button size="sm" className="text-[11px] h-6 bg-[#4f46e5] hover:bg-[#4338ca] text-white gap-1 px-2"
                                      onClick={() => setResolvedDuplicates((prev) => new Set(prev).add(cluster.id))}>
                                      <CheckCircle2 className="w-3 h-3" /> Geprüft & Gelöst
                                    </Button>
                                    <Button variant="ghost" size="sm" className="text-[11px] h-6 text-muted-foreground gap-1 px-2"
                                      onClick={() => setResolvedDuplicates((prev) => new Set(prev).add(cluster.id))}>
                                      <Ban className="w-3 h-3" /> Kein Problem
                                    </Button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>

                {/* Auto-Assignment Suggestions */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <UserCheck className="w-5 h-5 text-[#4f46e5]" />
                    <h3 className="text-[16px] text-[#1e1e2e]" style={{ fontWeight: 600 }}>
                      Automatische Issue-Zuweisung
                    </h3>
                    <Badge variant="secondary" className="text-[11px] px-2 bg-[#f1f0ff] text-[#4f46e5]">KI-Vorschlag</Badge>
                  </div>
                  <p className="text-[13px] text-muted-foreground mb-5">
                    Basierend auf Skill-Matching, aktuellem Workload und thematischer Nähe zu bestehenden Tickets.
                  </p>

                  <div className="space-y-3">
                    {assignmentSuggestions.map((suggestion) => {
                      const isApplied = appliedAssignments.has(suggestion.ticketKey);
                      return (
                        <Card key={suggestion.ticketKey} className={`border bg-white transition-all ${isApplied ? "opacity-50" : ""}`}>
                          <CardContent className="p-5">
                            <div className="flex items-start gap-3">
                              <div className="w-9 h-9 rounded-lg bg-[#f1f0ff] flex items-center justify-center flex-shrink-0">
                                <UserCheck className="w-4 h-4 text-[#4f46e5]" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-2">
                                  <StoryLink id={suggestion.ticketKey} className="text-[11px] !text-[#2684ff]" />
                                  <span className="text-[13px] text-[#1e1e2e]" style={{ fontWeight: 500 }}>{suggestion.summary}</span>
                                  {isApplied && <Badge variant="secondary" className="text-[10px] px-1.5 bg-[#d1fae5] text-[#10b981]">Angewendet</Badge>}
                                </div>

                                <div className="flex items-center gap-4 mb-3">
                                  <div className="flex items-center gap-2 p-2 rounded-lg bg-[#fef2f2]/50 border border-[#ef4444]/10">
                                    <Users className="w-3.5 h-3.5 text-[#ef4444]" />
                                    <div>
                                      <p className="text-[10px] text-muted-foreground">Aktuell</p>
                                      <p className="text-[12px] text-[#1e1e2e]" style={{ fontWeight: 500 }}>{suggestion.currentAssignee}</p>
                                    </div>
                                  </div>
                                  <ArrowRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                                  <div className="flex items-center gap-2 p-2 rounded-lg bg-[#d1fae5]/50 border border-[#10b981]/10">
                                    <UserCheck className="w-3.5 h-3.5 text-[#10b981]" />
                                    <div>
                                      <p className="text-[10px] text-muted-foreground">Vorschlag</p>
                                      <p className="text-[12px] text-[#1e1e2e]" style={{ fontWeight: 500 }}>{suggestion.suggestedAssignee}</p>
                                    </div>
                                  </div>
                                  <div className="ml-2 flex-1">
                                    <p className="text-[10px] text-muted-foreground mb-1">Auslastung nach Zuweisung</p>
                                    <div className="h-2 rounded-full bg-[#f1f5f9] overflow-hidden">
                                      <div className="h-full rounded-full transition-all" style={{
                                        width: `${suggestion.workloadAfter}%`,
                                        backgroundColor: suggestion.workloadAfter > 80 ? "#f59e0b" : "#10b981",
                                      }} />
                                    </div>
                                    <p className="text-[10px] mt-0.5" style={{ fontWeight: 500, color: suggestion.workloadAfter > 80 ? "#f59e0b" : "#10b981" }}>
                                      {suggestion.workloadAfter}%
                                    </p>
                                  </div>
                                </div>

                                <p className="text-[12px] text-muted-foreground mb-3">
                                  <span style={{ fontWeight: 500, color: "#4f46e5" }}>Begründung:</span> {suggestion.reason}
                                </p>

                                {!isApplied && (
                                  <div className="flex items-center gap-2">
                                    <Button size="sm" className="text-[11px] h-6 bg-[#4f46e5] hover:bg-[#4338ca] text-white gap-1 px-2"
                                      onClick={() => setAppliedAssignments((prev) => new Set(prev).add(suggestion.ticketKey))}>
                                      <UserCheck className="w-3 h-3" /> Zuweisung übernehmen
                                    </Button>
                                    <Button variant="ghost" size="sm" className="text-[11px] h-6 text-muted-foreground gap-1 px-2"
                                      onClick={() => setAppliedAssignments((prev) => new Set(prev).add(suggestion.ticketKey))}>
                                      <Ban className="w-3 h-3" /> Ignorieren
                                    </Button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Analysis View */
            <div className="flex-1 overflow-y-auto p-6">
              <div className="max-w-[1100px] mx-auto">
                {/* Analysis Summary Cards */}
                <div className="grid grid-cols-5 gap-4 mb-6">
                  {Object.entries(typeConfig).map(([key, config]) => {
                    const count = relationships.filter((r) => r.type === key).length;
                    const confirmed = relationships.filter((r) => r.type === key && r.status === "confirmed").length;
                    return (
                      <Card key={key} className="border bg-white" style={{ borderColor: `${config.color}20` }}>
                        <CardContent className="p-4 text-center">
                          <div className="w-10 h-10 rounded-xl mx-auto mb-2 flex items-center justify-center" style={{ backgroundColor: config.bg }}>
                            <config.icon className="w-5 h-5" style={{ color: config.color }} />
                          </div>
                          <p className="text-[24px]" style={{ fontWeight: 700, color: config.color }}>{count}</p>
                          <p className="text-[11px] text-muted-foreground mb-1">{config.label}</p>
                          <p className="text-[10px]" style={{ color: "#10b981", fontWeight: 500 }}>{confirmed} bestätigt</p>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>

                {/* Detailed Analysis */}
                <div className="grid grid-cols-2 gap-6">
                  {/* Stories with most connections */}
                  <Card className="border border-border bg-white">
                    <CardHeader className="pb-3 border-b border-border">
                      <div className="flex items-center gap-2">
                        <BarChart3 className="w-4 h-4 text-[#4f46e5]" />
                        <CardTitle className="text-[14px]" style={{ fontWeight: 600 }}>Meiste Verbindungen (Stories)</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4">
                      <div className="space-y-2.5">
                        {mockUserStories
                          .map((s) => ({
                            ...s,
                            connections: relationships.filter((r) => r.storyId === s.id).length,
                          }))
                          .filter((s) => s.connections > 0)
                          .sort((a, b) => b.connections - a.connections)
                          .map((story) => (
                            <div key={story.id} className="flex items-center gap-3 p-2.5 rounded-lg border border-border">
                              <span className="text-[11px] text-[#4f46e5]" style={{ fontWeight: 600 }}>{story.id}</span>
                              <span className="text-[12px] text-[#1e1e2e] flex-1 truncate" style={{ fontWeight: 500 }}>{story.title}</span>
                              <div className="flex items-center gap-1.5">
                                <div className="h-2 rounded-full bg-[#4f46e5]/20" style={{ width: `${(story.connections / 3) * 40}px` }}>
                                  <div className="h-full rounded-full bg-[#4f46e5]" style={{ width: "100%" }} />
                                </div>
                                <span className="text-[11px] text-[#4f46e5]" style={{ fontWeight: 700 }}>{story.connections}</span>
                              </div>
                            </div>
                          ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Tickets with most connections */}
                  <Card className="border border-border bg-white">
                    <CardHeader className="pb-3 border-b border-border">
                      <div className="flex items-center gap-2">
                        <BarChart3 className="w-4 h-4 text-[#2684ff]" />
                        <CardTitle className="text-[14px]" style={{ fontWeight: 600 }}>Meiste Verbindungen (Jira)</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4">
                      <div className="space-y-2.5">
                        {mockJiraTickets
                          .map((t) => ({
                            ...t,
                            connections: relationships.filter((r) => r.ticketKey === t.key).length,
                          }))
                          .filter((t) => t.connections > 0)
                          .sort((a, b) => b.connections - a.connections)
                          .map((ticket) => (
                            <div key={ticket.key} className="flex items-center gap-3 p-2.5 rounded-lg border border-border">
                              <StoryLink id={ticket.key} className="text-[11px] !text-[#2684ff]" />
                              <span className="text-[12px] text-[#1e1e2e] flex-1 truncate" style={{ fontWeight: 500 }}>{ticket.summary}</span>
                              <div className="flex items-center gap-1.5">
                                <div className="h-2 rounded-full bg-[#2684ff]/20" style={{ width: `${(ticket.connections / 3) * 40}px` }}>
                                  <div className="h-full rounded-full bg-[#2684ff]" style={{ width: "100%" }} />
                                </div>
                                <span className="text-[11px] text-[#2684ff]" style={{ fontWeight: 700 }}>{ticket.connections}</span>
                              </div>
                            </div>
                          ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Unmatched Tickets (Gaps) */}
                  <Card className="border border-border bg-white">
                    <CardHeader className="pb-3 border-b border-border">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-[#ea580c]" />
                        <CardTitle className="text-[14px]" style={{ fontWeight: 600 }}>Jira-Tickets ohne Story-Zuordnung</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4">
                      <div className="space-y-2">
                        {mockJiraTickets
                          .filter((t) => !relationships.some((r) => r.ticketKey === t.key && r.storyId))
                          .map((ticket) => {
                            const statusConf = jiraStatusConfig[ticket.status];
                            return (
                              <div key={ticket.key} className="flex items-center gap-2 p-2.5 rounded-lg border border-[#ea580c]/15 bg-[#fff7ed]/30">
                                <Unlink className="w-3.5 h-3.5 text-[#ea580c] flex-shrink-0" />
                                <StoryLink id={ticket.key} className="text-[11px] !text-[#2684ff]" />
                                <span className="text-[12px] text-[#1e1e2e] flex-1 truncate" style={{ fontWeight: 500 }}>{ticket.summary}</span>
                                <Badge variant="secondary" className="text-[9px] px-1" style={{ backgroundColor: statusConf.bg, color: statusConf.color }}>
                                  {ticket.status}
                                </Badge>
                              </div>
                            );
                          })}
                        {mockJiraTickets.filter((t) => !relationships.some((r) => r.ticketKey === t.key && r.storyId)).length === 0 && (
                          <div className="text-center py-4">
                            <CheckCircle2 className="w-6 h-6 text-[#10b981] mx-auto mb-1" />
                            <p className="text-[12px] text-muted-foreground">Alle Tickets zugeordnet</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Confidence Distribution */}
                  <Card className="border border-border bg-white">
                    <CardHeader className="pb-3 border-b border-border">
                      <div className="flex items-center gap-2">
                        <Info className="w-4 h-4 text-[#4f46e5]" />
                        <CardTitle className="text-[14px]" style={{ fontWeight: 600 }}>Konfidenz-Verteilung</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4">
                      <div className="space-y-2">
                        {relationships
                          .sort((a, b) => b.confidence - a.confidence)
                          .map((rel) => {
                            const config = typeConfig[rel.type];
                            return (
                              <div key={rel.id} className="flex items-center gap-2">
                                <div className="w-5 h-5 rounded flex items-center justify-center" style={{ backgroundColor: config.bg }}>
                                  <config.icon className="w-2.5 h-2.5" style={{ color: config.color }} />
                                </div>
                                <StoryLink id={rel.storyId || rel.ticketKey} className="text-[10px] w-[56px] flex-shrink-0" />
                                <div className="flex-1 h-2 rounded-full bg-[#f1f5f9] overflow-hidden">
                                  <div
                                    className="h-full rounded-full transition-all"
                                    style={{ width: `${rel.confidence}%`, backgroundColor: getConfidenceColor(rel.confidence) }}
                                  />
                                </div>
                                <span className="text-[10px] w-[32px] text-right" style={{ fontWeight: 600, color: getConfidenceColor(rel.confidence) }}>
                                  {rel.confidence}%
                                </span>
                              </div>
                            );
                          })}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
}
