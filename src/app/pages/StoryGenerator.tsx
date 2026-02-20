import { useState, useCallback } from "react";
import { useNavigate } from "react-router";
import {
  Upload,
  FileText,
  Link2,
  Sparkles,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  XCircle,
  Wand2,
  Ban,
  Copy,
  Download,
  ArrowLeft,
  Search,
  AlertCircle,
  AlertTriangle,
  Layers,
  Loader2,
  Save,
  FolderOpen,
  ArrowDown,
  ArrowRight,
  BookOpen,
  GitCompare,
  Link,
  Unlink,
  Merge,
  RefreshCw,
  FileSearch,
  ClipboardCheck,
  Pencil,
  ThumbsUp,
  ThumbsDown,
  Mic,
  ExternalLink,
  Send,
  Clock,
  Users,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Progress } from "../components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../components/ui/dialog";
import { TooltipProvider } from "../components/ui/tooltip";
import { WorkflowStepper } from "../components/WorkflowStepper";
import { StoryLink } from "../components/StoryLink";
import { useAppContext } from "../context/AppContext";

// --- Types ---
type Phase =
  | "upload"
  | "doc-analyzing"
  | "doc-review"
  | "generating"
  | "results"
  | "jira-compare"
  | "save";

type StoryAction = "kept" | "rejected" | "editing" | null;

interface DocIssue {
  id: string;
  type: "contradiction" | "duplication" | "ambiguity" | "inconsistency" | "gap";
  severity: "critical" | "major" | "minor";
  title: string;
  description: string;
  location: string;
  before: string;
  after: string;
  status: "pending" | "confirmed" | "dismissed" | "fixed";
}

interface UserStory {
  id: string;
  title: string;
  role: string;
  goal: string;
  benefit: string;
  acceptance: string[];
  effort: "Niedrig" | "Mittel" | "Hoch";
  priority: "Hoch" | "Mittel" | "Niedrig";
}

interface JiraTicket {
  key: string;
  summary: string;
  type: "Story" | "Epic" | "Bug" | "Task";
  status: "To Do" | "In Progress" | "Done" | "In Review";
  assignee: string;
  sprint: string;
  storyPoints: number;
}

interface JiraMatch {
  id: string;
  storyId: string;
  ticketKey: string;
  type: "overlap" | "duplicate" | "contradiction" | "dependency" | "gap";
  severity: "critical" | "major" | "minor";
  description: string;
  recommendation: string;
  status: "pending" | "confirmed" | "merged" | "dismissed";
}

// --- Static data ---
const workflowSteps = [
  { label: "Upload", shortLabel: "Upload" },
  { label: "Dokumentenprüfung", shortLabel: "Dok.-Prüfung" },
  { label: "Story-Generierung", shortLabel: "Generierung" },
  { label: "Jira-Abgleich", shortLabel: "Jira" },
  { label: "Speichern", shortLabel: "Speichern" },
];

const initialDocIssues: DocIssue[] = [
  {
    id: "DOC-001",
    type: "contradiction",
    severity: "critical",
    title: "Widersprüchliche Timeout-Angaben",
    description:
      "Im Lastenheft §2.3 wird ein Session-Timeout von 30 Minuten gefordert, in den Meeting-Notizen (Sprint 42, TOP 5) wurde jedoch ein 15-Minuten-Timeout für administrative Accounts vereinbart.",
    location: "Lastenheft §2.3 ↔ Meeting_Notizen S.4",
    before: "Session-Timeout: 30 Minuten für alle Benutzer",
    after: "Session-Timeout: 15 Minuten für administrative Accounts, 30 Minuten für Standard-Benutzer (gemäß Meeting-Beschluss Sprint 42)",
    status: "pending",
  },
  {
    id: "DOC-002",
    type: "duplication",
    severity: "major",
    title: "Doppelte SSO-Anforderung",
    description:
      "Die SSO-Anforderung ist sowohl im Lastenheft §2.3 (Authentifizierung) als auch in der Anforderungsdatei §4.1 (Sicherheit) identisch formuliert.",
    location: "Lastenheft §2.3 ↔ Anforderungen_Kunde §4.1",
    before: "SSO-Anforderung doppelt definiert in zwei Dokumenten",
    after: "SSO-Anforderung konsolidiert in §2.3 mit Referenz aus §4.1",
    status: "pending",
  },
  {
    id: "DOC-003",
    type: "ambiguity",
    severity: "major",
    title: "Unspezifische Performance-Angabe",
    description:
      "Das Lastenheft fordert 'gute Performance' ohne messbare Kriterien.",
    location: "Lastenheft §3.4",
    before: "Das System soll eine gute Performance aufweisen",
    after: "Das System muss eine Antwortzeit von max. 200ms für API-Aufrufe und max. 2s für den vollständigen Seitenaufbau unter Standard-Last (500 gleichzeitige Benutzer) gewährleisten",
    status: "pending",
  },
  {
    id: "DOC-004",
    type: "contradiction",
    severity: "critical",
    title: "Widersprüchliche Export-Limits",
    description:
      "Lastenheft §3.2 definiert ein Export-Limit von 100.000 Datensätzen, während die Kundenanforderungen §5.1 eine 'unbegrenzte Export-Möglichkeit' fordern.",
    location: "Lastenheft §3.2 ↔ Anforderungen_Kunde §5.1",
    before: "Export-Limit: 100.000 (Lastenheft) vs. unbegrenzt (Kunde)",
    after: "Export-Limit: 100.000 Datensätze pro einzelnem Export. Für größere Exporte: Batch-Export mit automatischer Aufteilung.",
    status: "pending",
  },
  {
    id: "DOC-005",
    type: "gap",
    severity: "major",
    title: "Fehlende Offline-Strategie",
    description:
      "Die Meeting-Notizen erwähnen eine Offline-Fähigkeit als Anforderung, die in keinem der Spezifikationsdokumente adressiert wird.",
    location: "Meeting_Notizen S.7 (nicht im Lastenheft)",
    before: "Offline-Fähigkeit wird in Meeting erwähnt, fehlt in Spezifikation",
    after: "Offline-Modus: Lesezugriff auf zuletzt synchronisierte Daten. Automatische Synchronisation bei Wiederherstellung der Verbindung.",
    status: "pending",
  },
  {
    id: "DOC-006",
    type: "inconsistency",
    severity: "minor",
    title: "Inkonsistente Terminologie",
    description:
      "Das Lastenheft verwendet 'Benutzer', die Meeting-Notizen 'User' und die Kundenanforderungen 'Anwender' für dasselbe Konzept.",
    location: "Alle Dokumente",
    before: "'Benutzer' / 'User' / 'Anwender' gemischt verwendet",
    after: "Einheitliche Terminologie 'Benutzer' in allen Dokumenten (gemäß Glossar GL-2024-v1)",
    status: "pending",
  },
  {
    id: "DOC-007",
    type: "ambiguity",
    severity: "minor",
    title: "Unklare Datenhaltungsdauer",
    description:
      "Die Anforderung 'Daten müssen sicher gespeichert werden' enthält keine Angabe zur Aufbewahrungsdauer.",
    location: "Anforderungen_Kunde §2.1",
    before: "Daten müssen sicher gespeichert werden",
    after: "Daten müssen gemäß AES-256 verschlüsselt gespeichert werden. Aufbewahrungsdauer: 7 Jahre für steuerrelevante Daten, 3 Jahre für operationale Daten.",
    status: "pending",
  },
];

const initialStories: UserStory[] = [
  {
    id: "US-001",
    title: "Benutzer-Authentifizierung via SSO",
    role: "Unternehmensadministrator",
    goal: "mich über Single Sign-On (SSO) anmelden können",
    benefit: "ich keinen separaten Login benötige und die Sicherheitsrichtlinien eingehalten werden",
    acceptance: [
      "SSO-Integration mit Azure AD und Okta ist verfügbar",
      "Session-Timeout nach 15 Minuten Inaktivität für administrative Accounts, 30 Minuten für Standard-Benutzer",
      "Multi-Faktor-Authentifizierung wird unterstützt",
      "Fehlermeldung bei ungültigen Credentials innerhalb von 2 Sekunden",
      "Bei SSO-Ausfall steht eine lokale Fallback-Authentifizierung mit Zeitbegrenzung von 4 Stunden zur Verfügung",
    ],
    effort: "Hoch",
    priority: "Hoch",
  },
  {
    id: "US-002",
    title: "Dashboard-Personalisierung",
    role: "Endbenutzer",
    goal: "mein Dashboard individuell anpassen können",
    benefit: "ich die für mich konfigurierten KPI-Metriken, Projektstatusupdates und priorisierte Benachrichtigungen auf einen Blick sehe",
    acceptance: [
      "Widgets können per Drag & Drop oder alternativ über Tastatur-Navigation angeordnet werden",
      "Mindestens 8 verschiedene Widget-Typen stehen zur Verfügung. Maximal 12 Widgets pro Dashboard. Ladezeit unter 3 Sekunden.",
      "Layout wird benutzerspezifisch gespeichert",
      "Neuen Benutzern wird ein Standard-Layout mit 6 vordefinierten Widgets zugewiesen",
    ],
    effort: "Mittel",
    priority: "Mittel",
  },
  {
    id: "US-003",
    title: "Echtzeit-Benachrichtigungen",
    role: "Projektmanager",
    goal: "Echtzeit-Benachrichtigungen bei Statusänderungen der Schweregrade P1 und P2 erhalten",
    benefit: "ich sofort reagieren kann und keine wichtigen Updates verpasse",
    acceptance: [
      "Push-Benachrichtigungen via WebSocket mit automatischem Reconnect nach 5 Sekunden",
      "Konfigurierbare Benachrichtigungsregeln pro Projekt und Schweregrad",
      "Benachrichtigungshistorie der letzten 90 Tage",
    ],
    effort: "Hoch",
    priority: "Hoch",
  },
  {
    id: "US-004",
    title: "Datenexport in Standardformate",
    role: "Business Analyst",
    goal: "Analysedaten in CSV, PDF und Excel exportieren können",
    benefit: "ich die Daten in externen Tools weiterverarbeiten kann",
    acceptance: [
      "Export-Formate: CSV, PDF, XLSX",
      "Maximale Export-Größe: 100.000 Datensätze pro Einzelexport. Batch-Export für größere Datenmengen.",
      "Export-Job läuft asynchron mit Fortschrittsanzeige und Audit-Trail-Protokollierung",
      "E-Mail-Benachrichtigung bei Abschluss",
    ],
    effort: "Mittel",
    priority: "Mittel",
  },
  {
    id: "US-005",
    title: "Audit-Trail für alle Änderungen",
    role: "Compliance-Beauftragter",
    goal: "einen vollständigen Audit-Trail aller Systemänderungen einsehen können",
    benefit: "regulatorische Anforderungen erfüllt werden und Änderungen nachvollziehbar sind",
    acceptance: [
      "Alle CRUD-Operationen werden protokolliert",
      "Audit-Daten sind unveränderlich (Append-Only)",
      "Filterung nach Benutzer, Zeitraum und Aktion",
      "Aufbewahrungsdauer: 7 Jahre für steuerrelevante, 3 Jahre für operationale Daten",
    ],
    effort: "Hoch",
    priority: "Hoch",
  },
  {
    id: "US-006",
    title: "Rollenbasierte Zugriffskontrolle",
    role: "Systemadministrator",
    goal: "Benutzerrollen mit granularen Berechtigungen definieren können",
    benefit: "das Prinzip der minimalen Rechtevergabe umgesetzt wird",
    acceptance: [
      "5 vordefinierte Rollen: Administrator, Projektleiter, Requirements Engineer, Reviewer, Auditor",
      "Benutzerdefinierte Rollen sind erstellbar, unterliegen einem 4-Augen-Prinzip mit SoD-Prüfung",
      "Berechtigungen auf Modul- und Aktionsebene gemäß Berechtigungsmatrix BM-2024-v1",
    ],
    effort: "Hoch",
    priority: "Hoch",
  },
  {
    id: "US-007",
    title: "Automatisierte Regressionstests",
    role: "QA-Engineer",
    goal: "automatisierte Regressionstests bei jedem Deployment ausführen können",
    benefit: "die Softwarequalität kontinuierlich sichergestellt wird und Fehler frühzeitig erkannt werden",
    acceptance: [
      "CI/CD-Pipeline führt automatisierte Tests bei jedem Merge-Request aus",
      "Testabdeckung (Code Coverage) muss mindestens 80% betragen",
      "Testergebnisse werden im Dashboard mit Trend-Verlauf visualisiert",
      "Fehlgeschlagene Tests blockieren das Deployment automatisch",
      "Benachrichtigung an das Entwicklungsteam bei Testfehlern innerhalb von 5 Minuten",
    ],
    effort: "Mittel",
    priority: "Hoch",
  },
];

const mockJiraTickets: JiraTicket[] = [
  { key: "PROJ-101", summary: "SSO-Authentifizierung mit Azure AD implementieren", type: "Story", status: "In Progress", assignee: "M. Schmidt", sprint: "Sprint 43", storyPoints: 13 },
  { key: "PROJ-102", summary: "Dashboard Widget-Framework aufbauen", type: "Epic", status: "To Do", assignee: "L. Weber", sprint: "Sprint 44", storyPoints: 21 },
  { key: "PROJ-145", summary: "Push-Notification Service einrichten", type: "Story", status: "In Review", assignee: "K. Fischer", sprint: "Sprint 43", storyPoints: 8 },
  { key: "PROJ-156", summary: "CSV/PDF Export für Reports", type: "Story", status: "Done", assignee: "A. Braun", sprint: "Sprint 42", storyPoints: 5 },
  { key: "PROJ-200", summary: "Rollen- und Berechtigungskonzept", type: "Epic", status: "To Do", assignee: "S. Müller", sprint: "Backlog", storyPoints: 34 },
  { key: "PROJ-210", summary: "Audit-Log Viewer Komponente", type: "Task", status: "In Progress", assignee: "T. Hoffmann", sprint: "Sprint 43", storyPoints: 5 },
  { key: "PROJ-089", summary: "Okta SSO Integration (Legacy)", type: "Story", status: "Done", assignee: "M. Schmidt", sprint: "Sprint 38", storyPoints: 8 },
  { key: "PROJ-220", summary: "Automatisierte E2E Tests mit Playwright", type: "Story", status: "In Progress", assignee: "P. Richter", sprint: "Sprint 43", storyPoints: 13 },
  { key: "PROJ-301", summary: "Mobile-App Offline Sync", type: "Epic", status: "To Do", assignee: "Nicht zugewiesen", sprint: "Backlog", storyPoints: 21 },
];

const initialJiraMatches: JiraMatch[] = [
  {
    id: "JM-001", storyId: "US-001", ticketKey: "PROJ-101",
    type: "overlap", severity: "major",
    description: "US-001 definiert SSO für Azure AD und Okta. PROJ-101 implementiert nur Azure AD.",
    recommendation: "PROJ-101 um Okta-Scope erweitern oder separates Ticket erstellen.",
    status: "pending",
  },
  {
    id: "JM-002", storyId: "US-001", ticketKey: "PROJ-089",
    type: "duplicate", severity: "critical",
    description: "PROJ-089 (Legacy Okta SSO) ist als 'Done' markiert, aber US-001 fordert eine neue Okta-Integration.",
    recommendation: "Prüfen, ob PROJ-089 die Anforderungen aus US-001 bereits erfüllt.",
    status: "pending",
  },
  {
    id: "JM-003", storyId: "US-002", ticketKey: "PROJ-102",
    type: "overlap", severity: "minor",
    description: "PROJ-102 (Dashboard Widget-Framework) deckt die technische Basis ab, enthält aber keine spezifischen Widget-Typen.",
    recommendation: "Akzeptanzkriterien von US-002 als Sub-Tasks in PROJ-102 übernehmen.",
    status: "pending",
  },
  {
    id: "JM-004", storyId: "US-003", ticketKey: "PROJ-145",
    type: "contradiction", severity: "critical",
    description: "PROJ-145 implementiert Push-Notifications über Firebase. US-003 fordert WebSocket-basierte Benachrichtigungen.",
    recommendation: "Technologie-Entscheidung treffen: WebSocket vs. Firebase.",
    status: "pending",
  },
  {
    id: "JM-005", storyId: "US-004", ticketKey: "PROJ-156",
    type: "overlap", severity: "minor",
    description: "PROJ-156 (CSV/PDF Export) ist als 'Done'. US-004 erweitert um XLSX und Batch-Export.",
    recommendation: "Neues Ticket für XLSX-Export und Batch-Funktion erstellen.",
    status: "pending",
  },
  {
    id: "JM-006", storyId: "US-006", ticketKey: "PROJ-200",
    type: "dependency", severity: "major",
    description: "PROJ-200 definiert Rollen-Konzept ohne SoD-Prüfung. US-006 erweitert die Anforderungen erheblich.",
    recommendation: "PROJ-200 Akzeptanzkriterien mit US-006 synchronisieren.",
    status: "pending",
  },
  {
    id: "JM-007", storyId: "US-007", ticketKey: "PROJ-220",
    type: "overlap", severity: "minor",
    description: "PROJ-220 nutzt Playwright für E2E-Tests. Coverage-Anforderung (80%) fehlt in PROJ-220.",
    recommendation: "Coverage-Anforderung aus US-007 in PROJ-220 ergänzen.",
    status: "pending",
  },
  {
    id: "JM-008", storyId: "", ticketKey: "PROJ-301",
    type: "gap", severity: "major",
    description: "PROJ-301 (Mobile-App Offline Sync) hat kein Gegenstück in den generierten User Stories.",
    recommendation: "Offline-Anforderung mit Product Owner klären.",
    status: "pending",
  },
];

const availableProjects = [
  { id: "P-001", name: "Automobil-Plattform Redesign" },
  { id: "P-002", name: "Banking App v3.2 Migration" },
  { id: "P-003", name: "Healthcare Portal DSGVO" },
  { id: "P-004", name: "E-Commerce Checkout Flow" },
];

const docAnalyzeSteps = [
  { label: "Dokumente parsen" },
  { label: "Audio-Aufnahmen transkribieren" },
  { label: "Strukturanalyse durchführen" },
  { label: "Duplikate identifizieren" },
  { label: "Widersprüche prüfen" },
  { label: "Lückenanalyse" },
];

const storyGenerateSteps = [
  { label: "Bereinigte Anforderungen extrahieren" },
  { label: "User Stories ableiten" },
  { label: "Qualitätsprüfung & Validierung" },
  { label: "Stories finalisieren" },
];

const docIssueTypeConfig: Record<string, { label: string; icon: typeof AlertCircle; color: string }> = {
  contradiction: { label: "Widerspruch", icon: XCircle, color: "#ef4444" },
  duplication: { label: "Duplikat", icon: Layers, color: "#8b5cf6" },
  ambiguity: { label: "Mehrdeutigkeit", icon: AlertTriangle, color: "#f59e0b" },
  inconsistency: { label: "Inkonsistenz", icon: RefreshCw, color: "#f59e0b" },
  gap: { label: "Lücke", icon: AlertCircle, color: "#ea580c" },
};

const jiraMatchTypeConfig: Record<string, { label: string; icon: typeof AlertCircle; color: string; bg: string }> = {
  overlap: { label: "Überschneidung", icon: GitCompare, color: "#4f46e5", bg: "#f1f0ff" },
  duplicate: { label: "Duplikat", icon: Layers, color: "#8b5cf6", bg: "#ede9fe" },
  contradiction: { label: "Widerspruch", icon: XCircle, color: "#ef4444", bg: "#fef2f2" },
  dependency: { label: "Abhängigkeit", icon: Link, color: "#0284c7", bg: "#f0f9ff" },
  gap: { label: "Lücke", icon: Unlink, color: "#ea580c", bg: "#fff7ed" },
};

const severityConfig: Record<string, { label: string; color: string; bg: string }> = {
  critical: { label: "Kritisch", color: "#ef4444", bg: "#fef2f2" },
  major: { label: "Wichtig", color: "#f59e0b", bg: "#fef3c7" },
  minor: { label: "Gering", color: "#64748b", bg: "#f1f5f9" },
};

const effortConfig: Record<string, { color: string; bg: string }> = {
  Niedrig: { color: "#10b981", bg: "#d1fae5" },
  Mittel: { color: "#f59e0b", bg: "#fef3c7" },
  Hoch: { color: "#ef4444", bg: "#fef2f2" },
};

export function StoryGenerator() {
  const navigate = useNavigate();
  const { setShowExportDialog, setExportScope } = useAppContext();
  const [phase, setPhase] = useState<Phase>("upload");
  const [dragOver, setDragOver] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const [analyzeStep, setAnalyzeStep] = useState(0);
  const [analyzeProgress, setAnalyzeProgress] = useState(0);
  const [docIssues, setDocIssues] = useState<DocIssue[]>(initialDocIssues);
  const [stories, setStories] = useState<UserStory[]>(initialStories);
  const [expandedStories, setExpandedStories] = useState<Set<string>>(new Set());
  const [docFixDialog, setDocFixDialog] = useState<DocIssue | null>(null);
  const [selectedProject, setSelectedProject] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [jiraMatches, setJiraMatches] = useState<JiraMatch[]>(initialJiraMatches);
  const [jiraFilter, setJiraFilter] = useState<string>("all");
  const [storyActions, setStoryActions] = useState<Record<string, StoryAction>>({});
  const [editingStory, setEditingStory] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{ goal: string; benefit: string }>({ goal: "", benefit: "" });
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [jiraExportDialog, setJiraExportDialog] = useState(false);
  const [jiraExportProgress, setJiraExportProgress] = useState(0);
  const [jiraExportPhase, setJiraExportPhase] = useState<"config" | "exporting" | "done">("config");
  const [confluenceSync, setConfluenceSync] = useState(true);
  const [jiraExportConfig, setJiraExportConfig] = useState({
    project: "PROJ",
    sprintTarget: "Sprint 44",
    autoAssign: true,
    createEpic: true,
    syncConfluence: true,
  });

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    setUploadedFiles(["Lastenheft_v2.3.pdf", "Meeting_Notizen_Sprint42.docx", "Anforderungen_Kunde.pdf", "Meeting_Recording_Sprint42.mp3"]);
  }, []);

  const simulateUpload = () => {
    setUploadedFiles(["Lastenheft_v2.3.pdf", "Meeting_Notizen_Sprint42.docx", "Anforderungen_Kunde.pdf", "Meeting_Recording_Sprint42.mp3"]);
  };

  const startDocAnalysis = () => {
    setPhase("doc-analyzing");
    setAnalyzeStep(0);
    setAnalyzeProgress(0);
    let step = 0;
    const totalSteps = docAnalyzeSteps.length;
    const interval = setInterval(() => {
      step++;
      setAnalyzeStep(step);
      setAnalyzeProgress(Math.min(Math.round((step / totalSteps) * 100), 100));
      if (step >= totalSteps) {
        clearInterval(interval);
        setTimeout(() => {
          setPhase("doc-review");
          setDocIssues(initialDocIssues);
        }, 500);
      }
    }, 700);
  };

  const startStoryGeneration = () => {
    setPhase("generating");
    setAnalyzeStep(0);
    setAnalyzeProgress(0);
    let step = 0;
    const totalSteps = storyGenerateSteps.length;
    const interval = setInterval(() => {
      step++;
      setAnalyzeStep(step);
      setAnalyzeProgress(Math.min(Math.round((step / totalSteps) * 100), 100));
      if (step >= totalSteps) {
        clearInterval(interval);
        setTimeout(() => setPhase("results"), 500);
      }
    }, 900);
  };

  const handleDocIssueAction = (issueId: string, action: "confirmed" | "dismissed" | "fixed") => {
    setDocIssues((prev) => prev.map((i) => (i.id === issueId ? { ...i, status: action } : i)));
  };

  const toggleStory = (id: string) => {
    setExpandedStories((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleStoryAction = (storyId: string, action: StoryAction) => {
    setStoryActions((prev) => ({ ...prev, [storyId]: action }));
    if (action === "editing") {
      const story = stories.find((s) => s.id === storyId);
      if (story) {
        setEditingStory(storyId);
        setEditForm({ goal: story.goal, benefit: story.benefit });
      }
    }
  };

  const handleSaveEdit = (storyId: string) => {
    setStories((prev) =>
      prev.map((s) =>
        s.id === storyId ? { ...s, goal: editForm.goal, benefit: editForm.benefit } : s
      )
    );
    setStoryActions((prev) => ({ ...prev, [storyId]: "kept" }));
    setEditingStory(null);
  };

  const handleCancelEdit = (storyId: string) => {
    setStoryActions((prev) => {
      const next = { ...prev };
      delete next[storyId];
      return next;
    });
    setEditingStory(null);
  };

  const handleJiraMatchAction = (matchId: string, action: "confirmed" | "merged" | "dismissed") => {
    setJiraMatches((prev) => prev.map((m) => (m.id === matchId ? { ...m, status: action } : m)));
  };

  const handleSaveAll = () => {
    if (!selectedProject) return;
    setSaveSuccess(true);
    setTimeout(() => {
      navigate("/");
    }, 2000);
  };

  const startJiraExport = () => {
    setJiraExportPhase("exporting");
    setJiraExportProgress(0);
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 15 + 5;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setTimeout(() => setJiraExportPhase("done"), 400);
      }
      setJiraExportProgress(Math.min(Math.round(progress), 100));
    }, 600);
  };

  const pendingDocIssues = docIssues.filter((i) => i.status === "pending").length;
  const allResolved = pendingDocIssues === 0;
  const docFixedCount = docIssues.filter((i) => i.status === "fixed").length;

  const filteredStories = stories.filter(
    (s) =>
      !searchQuery ||
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const rejectedCount = Object.values(storyActions).filter((a) => a === "rejected").length;

  const filteredJiraMatches = jiraMatches.filter((m) => {
    if (m.status !== "pending") return false;
    if (jiraFilter === "all") return true;
    return m.type === jiraFilter;
  });

  const resolvedJiraMatches = jiraMatches.filter((m) => m.status !== "pending").length;

  // ==============================
  // UPLOAD PHASE
  // ==============================
  if (phase === "upload") {
    return (
      <div className="p-8 max-w-[1000px] mx-auto">
        <div className="mb-6">
          <h1 className="text-[#1e1e2e]">AI Story Generator</h1>
          <p className="text-[14px] text-muted-foreground mt-1">
            Laden Sie Ihre Dokumente hoch und lassen Sie die KI automatisch User Stories generieren.
          </p>
        </div>

        <WorkflowStepper steps={workflowSteps} currentStep={0} className="mb-8" />

        <Card className="border-2 border-dashed border-border bg-white mb-6 overflow-hidden">
          <CardContent className="p-0">
            <div
              className={`p-12 text-center transition-all duration-200 ${
                dragOver ? "bg-[#f1f0ff] border-[#4f46e5]" : "bg-white"
              }`}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
            >
              <div className="w-16 h-16 rounded-2xl bg-[#f1f0ff] flex items-center justify-center mx-auto mb-4">
                <Upload className="w-7 h-7 text-[#4f46e5]" />
              </div>
              <p className="text-[16px] text-[#1e1e2e] mb-2" style={{ fontWeight: 500 }}>
                Dateien hierher ziehen
              </p>
              <p className="text-[13px] text-muted-foreground mb-4">
                PDF, DOCX, TXT, Markdown, MP3/WAV (Aufnahmen) - Max. 50MB pro Datei
              </p>
              <Button variant="outline" className="text-[13px] gap-2" onClick={simulateUpload}>
                <Upload className="w-4 h-4" />
                Dateien auswählen
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card className="border border-border bg-white hover:shadow-sm transition-all cursor-pointer group">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#2684ff]/10 flex items-center justify-center flex-shrink-0">
                <span className="text-[14px]" style={{ fontWeight: 700, color: "#2684ff" }}>J</span>
              </div>
              <div className="flex-1">
                <p className="text-[14px] text-[#1e1e2e]" style={{ fontWeight: 500 }}>Jira importieren</p>
                <p className="text-[12px] text-muted-foreground">Epics und Issues einlesen</p>
              </div>
              <Link2 className="w-4 h-4 text-muted-foreground group-hover:text-[#4f46e5] transition-colors" />
            </CardContent>
          </Card>
          <Card className="border border-border bg-white hover:shadow-sm transition-all cursor-pointer group">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#0052cc]/10 flex items-center justify-center flex-shrink-0">
                <span className="text-[14px]" style={{ fontWeight: 700, color: "#0052cc" }}>C</span>
              </div>
              <div className="flex-1">
                <p className="text-[14px] text-[#1e1e2e]" style={{ fontWeight: 500 }}>Confluence verknüpfen</p>
                <p className="text-[12px] text-muted-foreground">Seiten und Spaces durchsuchen</p>
              </div>
              <Link2 className="w-4 h-4 text-muted-foreground group-hover:text-[#4f46e5] transition-colors" />
            </CardContent>
          </Card>
          <Card
            className="border border-border bg-white hover:shadow-sm transition-all cursor-pointer group"
            onClick={() => setUploadedFiles((prev) => prev.includes("Meeting_Recording_Sprint42.mp3") ? prev : [...prev, "Meeting_Recording_Sprint42.mp3"])}
          >
            <CardContent className="p-5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#7c3aed]/10 flex items-center justify-center flex-shrink-0">
                <Mic className="w-5 h-5 text-[#7c3aed]" />
              </div>
              <div className="flex-1">
                <p className="text-[14px] text-[#1e1e2e]" style={{ fontWeight: 500 }}>Audio/Recording</p>
                <p className="text-[12px] text-muted-foreground">Meeting-Aufnahmen (MP3)</p>
              </div>
              <Link2 className="w-4 h-4 text-muted-foreground group-hover:text-[#7c3aed] transition-colors" />
            </CardContent>
          </Card>
        </div>

        {uploadedFiles.length > 0 && (
          <Card className="border border-border bg-white mb-6">
            <CardHeader className="pb-3">
              <CardTitle className="text-[14px]" style={{ fontWeight: 600 }}>
                Hochgeladene Dateien ({uploadedFiles.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-5 space-y-2">
              {uploadedFiles.map((file, i) => {
                const isAudio = file.endsWith(".mp3") || file.endsWith(".wav");
                return (
                  <div key={i} className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-[#f8fafc] border border-border">
                    {isAudio ? <Mic className="w-4 h-4 text-[#7c3aed]" /> : <FileText className="w-4 h-4 text-[#4f46e5]" />}
                    <span className="text-[13px] flex-1" style={{ fontWeight: 500 }}>{file}</span>
                    {isAudio && (
                      <Badge variant="secondary" className="text-[10px] px-1.5 bg-[#7c3aed]/10 text-[#7c3aed]">Transkription via KI</Badge>
                    )}
                    <CheckCircle2 className="w-4 h-4 text-[#10b981]" />
                  </div>
                );
              })}
            </CardContent>
          </Card>
        )}

        <Button
          className="w-full h-12 bg-[#4f46e5] hover:bg-[#4338ca] text-white gap-2 shadow-sm"
          disabled={uploadedFiles.length === 0}
          onClick={startDocAnalysis}
        >
          <FileSearch className="w-5 h-5" />
          Dokumentenprüfung starten
        </Button>
      </div>
    );
  }

  // ==============================
  // DOC ANALYZING PHASE
  // ==============================
  if (phase === "doc-analyzing") {
    return (
      <div className="p-8 max-w-[600px] mx-auto mt-8">
        <WorkflowStepper steps={workflowSteps} currentStep={1} className="mb-8 justify-center" />
        <Card className="border border-border bg-white">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 rounded-2xl bg-[#f1f0ff] flex items-center justify-center mx-auto mb-6">
              <Loader2 className="w-7 h-7 text-[#4f46e5] animate-spin" />
            </div>
            <h2 className="text-[#1e1e2e] mb-2">Dokumentenprüfung...</h2>
            <p className="text-[14px] text-muted-foreground mb-8">
              Die KI analysiert Ihre Dokumente auf Widersprüche, Duplikate und Unklarheiten.
            </p>
            <Progress value={analyzeProgress} className="h-2 mb-6" />
            <div className="space-y-3 text-left">
              {docAnalyzeSteps.map((step, i) => (
                <div key={i} className="flex items-center gap-3 px-4 py-2.5 rounded-lg">
                  {i < analyzeStep ? (
                    <CheckCircle2 className="w-5 h-5 text-[#10b981] flex-shrink-0" />
                  ) : i === analyzeStep ? (
                    <Loader2 className="w-5 h-5 text-[#4f46e5] animate-spin flex-shrink-0" />
                  ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-[#e2e8f0] flex-shrink-0" />
                  )}
                  <span
                    className={`text-[14px] ${
                      i < analyzeStep ? "text-[#10b981]" : i === analyzeStep ? "text-[#4f46e5]" : "text-muted-foreground"
                    }`}
                    style={{ fontWeight: i === analyzeStep ? 500 : 400 }}
                  >
                    {step.label}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ==============================
  // DOC REVIEW PHASE
  // ==============================
  if (phase === "doc-review") {
    const fixedCount = docIssues.filter((i) => i.status === "fixed").length;
    const confirmedCount = docIssues.filter((i) => i.status === "confirmed").length;
    const dismissedCount = docIssues.filter((i) => i.status === "dismissed").length;
    const resolvedCount = fixedCount + confirmedCount + dismissedCount;

    return (
      <TooltipProvider>
        <div className="h-full flex flex-col">
          <div className="px-8 py-4 border-b border-border bg-white flex-shrink-0">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" onClick={() => setPhase("upload")} className="text-muted-foreground gap-1">
                  <ArrowLeft className="w-4 h-4" /> Zurück
                </Button>
                <div>
                  <h2 className="text-[#1e1e2e]">Dokumentenprüfung</h2>
                  <p className="text-[13px] text-muted-foreground mt-0.5">
                    {docIssues.length} Probleme in 3 Dokumenten gefunden - Bitte prüfen und bereinigen
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-[#f8fafc]">
                  <ClipboardCheck className="w-4 h-4 text-muted-foreground" />
                  <span className="text-[12px] text-muted-foreground">Fortschritt:</span>
                  <span className="text-[13px]" style={{ fontWeight: 600, color: allResolved ? "#10b981" : "#4f46e5" }}>
                    {resolvedCount}/{docIssues.length}
                  </span>
                </div>
                <Button
                  className="bg-[#4f46e5] hover:bg-[#4338ca] text-white gap-2 text-[13px]"
                  disabled={!allResolved}
                  onClick={startStoryGeneration}
                >
                  <Sparkles className="w-4 h-4" />
                  User Stories generieren
                </Button>
              </div>
            </div>
            <WorkflowStepper steps={workflowSteps} currentStep={1} />
          </div>

          <div className="flex-1 flex overflow-hidden">
            <div className="flex-1 overflow-y-auto p-6">
              <Card className="border border-border bg-white">
                <CardHeader className="pb-3 border-b border-border">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-[#4f46e5]" />
                    <CardTitle className="text-[14px]" style={{ fontWeight: 600 }}>Analysierte Dokumente</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-5">
                  {uploadedFiles.map((file, i) => (
                    <div key={i} className="flex items-center gap-3 px-3 py-3 rounded-lg border border-border mb-3 last:mb-0">
                      <FileText className="w-5 h-5 text-[#4f46e5]" />
                      <div className="flex-1">
                        <p className="text-[13px] text-[#1e1e2e]" style={{ fontWeight: 500 }}>{file}</p>
                        <p className="text-[11px] text-muted-foreground">
                          {i === 0 ? "47 Seiten, 186 Anforderungen" : i === 1 ? "12 Seiten, 34 Beschlüsse" : "23 Seiten, 89 Anforderungen"}
                        </p>
                      </div>
                      <Badge variant="secondary" className="text-[11px]" style={{ backgroundColor: "#d1fae5", color: "#10b981" }}>
                        Analysiert
                      </Badge>
                    </div>
                  ))}

                  <div className="mt-6 pt-5 border-t border-border">
                    <p className="text-[13px] text-[#1e1e2e] mb-3" style={{ fontWeight: 600 }}>Zusammenfassung der Analyse</p>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="p-3 rounded-lg bg-[#fef2f2] border border-[#ef4444]/10 text-center">
                        <p className="text-[20px] text-[#ef4444]" style={{ fontWeight: 700 }}>
                          {docIssues.filter((i) => i.type === "contradiction").length}
                        </p>
                        <p className="text-[11px] text-[#ef4444]">Widersprüche</p>
                      </div>
                      <div className="p-3 rounded-lg bg-[#ede9fe] border border-[#8b5cf6]/10 text-center">
                        <p className="text-[20px] text-[#8b5cf6]" style={{ fontWeight: 700 }}>
                          {docIssues.filter((i) => i.type === "duplication").length}
                        </p>
                        <p className="text-[11px] text-[#8b5cf6]">Duplikate</p>
                      </div>
                      <div className="p-3 rounded-lg bg-[#fef3c7] border border-[#f59e0b]/10 text-center">
                        <p className="text-[20px] text-[#f59e0b]" style={{ fontWeight: 700 }}>
                          {docIssues.filter((i) => i.type === "ambiguity" || i.type === "inconsistency" || i.type === "gap").length}
                        </p>
                        <p className="text-[11px] text-[#f59e0b]">Unklarheiten/Lücken</p>
                      </div>
                    </div>
                  </div>

                  {allResolved && (
                    <div className="mt-5 p-4 rounded-lg bg-[#d1fae5]/50 border border-[#10b981]/20 flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-[#10b981]" />
                      <div>
                        <p className="text-[13px] text-[#10b981]" style={{ fontWeight: 600 }}>Alle Probleme bearbeitet!</p>
                        <p className="text-[12px] text-[#475569]">
                          {fixedCount} behoben, {confirmedCount} bestätigt, {dismissedCount} abgelehnt. Sie können jetzt User Stories generieren.
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="w-[480px] overflow-y-auto bg-[#fafbfc] border-l border-border p-5 flex-shrink-0">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-[14px] text-[#1e1e2e]" style={{ fontWeight: 600 }}>
                  Erkannte Dokumentprobleme
                </h4>
                <Badge variant="secondary" className="text-[12px]" style={{ backgroundColor: allResolved ? "#d1fae5" : "#fef2f2", color: allResolved ? "#10b981" : "#ef4444" }}>
                  {pendingDocIssues} offen
                </Badge>
              </div>

              <div className="space-y-3">
                {docIssues.map((issue) => {
                  const typeConf = docIssueTypeConfig[issue.type];
                  const sevConf = severityConfig[issue.severity];
                  const isResolved = issue.status !== "pending";

                  return (
                    <Card
                      key={issue.id}
                      className={`border bg-white transition-all duration-300 overflow-hidden ${
                        isResolved ? "opacity-60" : ""
                      }`}
                      style={{ borderColor: isResolved ? "#e2e8f0" : `${typeConf.color}30` }}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div
                            className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                            style={{ backgroundColor: isResolved ? "#d1fae515" : `${typeConf.color}15` }}
                          >
                            {isResolved ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-[#10b981]" />
                            ) : (
                              <typeConf.icon className="w-3.5 h-3.5" style={{ color: typeConf.color }} />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                              <Badge variant="secondary" className="text-[10px] px-1.5" style={{ backgroundColor: `${typeConf.color}15`, color: typeConf.color, fontWeight: 600 }}>
                                {typeConf.label}
                              </Badge>
                              <Badge variant="secondary" className="text-[10px] px-1.5" style={{ backgroundColor: sevConf.bg, color: sevConf.color, fontWeight: 600 }}>
                                {sevConf.label}
                              </Badge>
                              {isResolved && (
                                <Badge variant="secondary" className="text-[10px] px-1.5 bg-[#d1fae5] text-[#10b981]">
                                  {issue.status === "fixed" ? "Behoben" : issue.status === "confirmed" ? "Bestätigt" : "Abgelehnt"}
                                </Badge>
                              )}
                            </div>
                            <p className="text-[13px] text-[#1e1e2e] mb-1" style={{ fontWeight: 500 }}>
                              {isResolved ? <s className="opacity-60">{issue.title}</s> : issue.title}
                            </p>
                            <p className="text-[12px] text-muted-foreground mb-1.5">{issue.description}</p>
                            <p className="text-[11px] text-[#4f46e5] flex items-center gap-1 mb-2">
                              <FileText className="w-3 h-3" />
                              {issue.location}
                            </p>

                            {!isResolved && (
                              <div className="flex items-center gap-2">
                                <Button
                                  size="sm"
                                  className="text-[11px] h-6 bg-[#4f46e5] hover:bg-[#4338ca] text-white gap-1 px-2"
                                  onClick={() => setDocFixDialog(issue)}
                                >
                                  <Wand2 className="w-3 h-3" /> Auto-Fix
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-[11px] h-6 gap-1 px-2"
                                  onClick={() => handleDocIssueAction(issue.id, "confirmed")}
                                >
                                  <CheckCircle2 className="w-3 h-3" /> Bestätigen
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-[11px] h-6 text-muted-foreground gap-1 px-2"
                                  onClick={() => handleDocIssueAction(issue.id, "dismissed")}
                                >
                                  <Ban className="w-3 h-3" /> Ablehnen
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

          {/* Doc Fix Dialog */}
          <Dialog open={!!docFixDialog} onOpenChange={() => setDocFixDialog(null)}>
            <DialogContent className="sm:max-w-[560px]">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Wand2 className="w-5 h-5 text-[#4f46e5]" /> Automatische Dokumentbereinigung
                </DialogTitle>
                <DialogDescription>
                  Die KI hat einen Korrekturvorschlag generiert. Prüfen Sie die Änderung.
                </DialogDescription>
              </DialogHeader>
              {docFixDialog && (
                <div className="my-4 space-y-4">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="secondary" className="text-[11px] px-1.5" style={{ backgroundColor: `${docIssueTypeConfig[docFixDialog.type]?.color}15`, color: docIssueTypeConfig[docFixDialog.type]?.color, fontWeight: 600 }}>
                      {docIssueTypeConfig[docFixDialog.type]?.label}
                    </Badge>
                    <Badge variant="secondary" className="text-[11px] px-1.5" style={{ backgroundColor: severityConfig[docFixDialog.severity]?.bg, color: severityConfig[docFixDialog.severity]?.color, fontWeight: 600 }}>
                      {severityConfig[docFixDialog.severity]?.label}
                    </Badge>
                  </div>
                  <p className="text-[13px] text-[#475569]">{docFixDialog.description}</p>
                  <div className="p-4 rounded-lg bg-[#fef2f2] border border-[#ef4444]/20">
                    <div className="flex items-center gap-2 mb-2">
                      <XCircle className="w-4 h-4 text-[#ef4444]" />
                      <p className="text-[12px] text-[#ef4444]" style={{ fontWeight: 600 }}>Vorher</p>
                    </div>
                    <p className="text-[13px] text-[#475569] bg-white/60 rounded px-3 py-2 border border-[#ef4444]/10">{docFixDialog.before}</p>
                  </div>
                  <div className="flex justify-center">
                    <div className="w-8 h-8 rounded-full bg-[#f1f0ff] flex items-center justify-center">
                      <ArrowDown className="w-4 h-4 text-[#4f46e5]" />
                    </div>
                  </div>
                  <div className="p-4 rounded-lg bg-[#d1fae5]/50 border border-[#10b981]/20">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle2 className="w-4 h-4 text-[#10b981]" />
                      <p className="text-[12px] text-[#10b981]" style={{ fontWeight: 600 }}>Nachher (KI-Vorschlag)</p>
                    </div>
                    <p className="text-[13px] text-[#475569] bg-white/60 rounded px-3 py-2 border border-[#10b981]/10">{docFixDialog.after}</p>
                  </div>
                </div>
              )}
              <DialogFooter>
                <Button variant="outline" onClick={() => setDocFixDialog(null)}>Abbrechen</Button>
                <Button className="bg-[#4f46e5] hover:bg-[#4338ca] text-white gap-2" onClick={() => {
                  if (docFixDialog) handleDocIssueAction(docFixDialog.id, "fixed");
                  setDocFixDialog(null);
                }}>
                  <Wand2 className="w-4 h-4" /> Korrektur übernehmen
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </TooltipProvider>
    );
  }

  // ==============================
  // GENERATING PHASE
  // ==============================
  if (phase === "generating") {
    return (
      <div className="p-8 max-w-[600px] mx-auto mt-8">
        <WorkflowStepper steps={workflowSteps} currentStep={2} className="mb-8 justify-center" />
        <Card className="border border-border bg-white">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 rounded-2xl bg-[#f1f0ff] flex items-center justify-center mx-auto mb-6">
              <Loader2 className="w-7 h-7 text-[#4f46e5] animate-spin" />
            </div>
            <h2 className="text-[#1e1e2e] mb-2">User Stories werden generiert...</h2>
            <p className="text-[14px] text-muted-foreground mb-2">
              Die KI generiert User Stories basierend auf den bereinigten Dokumenten.
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#d1fae5]/50 border border-[#10b981]/20 mb-6">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#10b981]" />
              <span className="text-[12px] text-[#10b981]" style={{ fontWeight: 500 }}>
                Dokumente vorab bereinigt ({docIssues.filter((i) => i.status === "fixed").length} Korrekturen angewendet)
              </span>
            </div>
            <Progress value={analyzeProgress} className="h-2 mb-6" />
            <div className="space-y-3 text-left">
              {storyGenerateSteps.map((step, i) => (
                <div key={i} className="flex items-center gap-3 px-4 py-2.5 rounded-lg">
                  {i < analyzeStep ? (
                    <CheckCircle2 className="w-5 h-5 text-[#10b981] flex-shrink-0" />
                  ) : i === analyzeStep ? (
                    <Loader2 className="w-5 h-5 text-[#4f46e5] animate-spin flex-shrink-0" />
                  ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-[#e2e8f0] flex-shrink-0" />
                  )}
                  <span
                    className={`text-[14px] ${i < analyzeStep ? "text-[#10b981]" : i === analyzeStep ? "text-[#4f46e5]" : "text-muted-foreground"}`}
                    style={{ fontWeight: i === analyzeStep ? 500 : 400 }}
                  >
                    {step.label}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ==============================
  // JIRA COMPARE PHASE
  // ==============================
  if (phase === "jira-compare") {
    const jiraStatusConfig: Record<string, { color: string; bg: string }> = {
      "To Do": { color: "#64748b", bg: "#f1f5f9" },
      "In Progress": { color: "#4f46e5", bg: "#f1f0ff" },
      "In Review": { color: "#f59e0b", bg: "#fef3c7" },
      "Done": { color: "#10b981", bg: "#d1fae5" },
    };

    return (
      <TooltipProvider>
        <div className="h-full flex flex-col">
          <div className="px-8 py-4 border-b border-border bg-white flex-shrink-0">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" onClick={() => setPhase("results")} className="text-muted-foreground gap-1">
                  <ArrowLeft className="w-4 h-4" /> Zurück zu Stories
                </Button>
                <div>
                  <h2 className="text-[#1e1e2e]">Jira-Backlog Abgleich</h2>
                  <p className="text-[13px] text-muted-foreground mt-0.5">
                    Vergleich der generierten Stories mit {mockJiraTickets.length} bestehenden Jira-Tickets
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-[#f8fafc]">
                  <GitCompare className="w-4 h-4 text-muted-foreground" />
                  <span className="text-[12px] text-muted-foreground">Bearbeitet:</span>
                  <span className="text-[13px]" style={{ fontWeight: 600, color: "#4f46e5" }}>
                    {resolvedJiraMatches}/{jiraMatches.length}
                  </span>
                </div>
                <Button
                  className="bg-[#4f46e5] hover:bg-[#4338ca] text-white gap-2 text-[13px]"
                  onClick={() => setPhase("save")}
                >
                  <ArrowRight className="w-4 h-4" />
                  Weiter zum Speichern
                </Button>
              </div>
            </div>
            <WorkflowStepper steps={workflowSteps} currentStep={3} />
          </div>

          <div className="flex-1 flex overflow-hidden">
            <div className="w-[360px] overflow-y-auto bg-[#fafbfc] border-r border-border p-5 flex-shrink-0">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 rounded bg-[#2684ff]/10 flex items-center justify-center">
                  <span className="text-[11px]" style={{ fontWeight: 700, color: "#2684ff" }}>J</span>
                </div>
                <h4 className="text-[14px] text-[#1e1e2e]" style={{ fontWeight: 600 }}>Bestehende Jira-Tickets</h4>
              </div>
              <div className="space-y-2">
                {mockJiraTickets.map((ticket) => {
                  const statusConf = jiraStatusConfig[ticket.status];
                  const hasMatch = jiraMatches.some((m) => m.ticketKey === ticket.key);
                  return (
                    <div
                      key={ticket.key}
                      className={`p-3 rounded-lg border bg-white transition-all ${
                        hasMatch ? "border-[#4f46e5]/20" : "border-border"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[11px] text-[#2684ff]" style={{ fontWeight: 600 }}>{ticket.key}</span>
                        <Badge variant="secondary" className="text-[9px] px-1" style={{ backgroundColor: statusConf.bg, color: statusConf.color, fontWeight: 600 }}>
                          {ticket.status}
                        </Badge>
                        {hasMatch && <div className="w-1.5 h-1.5 rounded-full bg-[#4f46e5]" />}
                      </div>
                      <p className="text-[12px] text-[#1e1e2e] mb-1" style={{ fontWeight: 500 }}>{ticket.summary}</p>
                      <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                        <span>{ticket.type}</span>
                        <span>{ticket.assignee}</span>
                        <span>{ticket.storyPoints} SP</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-5">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-[14px] text-[#1e1e2e]" style={{ fontWeight: 600 }}>
                  Erkannte Zusammenhänge
                </h4>
                <div className="flex items-center gap-2">
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
                      onClick={() => setJiraFilter(f.key)}
                      className={`px-2 py-1 rounded-lg text-[11px] transition-colors ${
                        jiraFilter === f.key
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

              <div className="space-y-3">
                {filteredJiraMatches.map((match) => {
                  const matchConf = jiraMatchTypeConfig[match.type];
                  const sevConf = severityConfig[match.severity];
                  const story = stories.find((s) => s.id === match.storyId);
                  const ticket = mockJiraTickets.find((t) => t.key === match.ticketKey);

                  return (
                    <Card key={match.id} className="border bg-white" style={{ borderColor: `${matchConf.color}25` }}>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: matchConf.bg }}>
                            <matchConf.icon className="w-4 h-4" style={{ color: matchConf.color }} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                              <Badge variant="secondary" className="text-[10px] px-1.5" style={{ backgroundColor: matchConf.bg, color: matchConf.color, fontWeight: 600 }}>
                                {matchConf.label}
                              </Badge>
                              <Badge variant="secondary" className="text-[10px] px-1.5" style={{ backgroundColor: sevConf.bg, color: sevConf.color, fontWeight: 600 }}>
                                {sevConf.label}
                              </Badge>
                            </div>

                            <div className="flex items-center gap-2 mb-2 p-2 rounded-lg bg-[#f8fafc] border border-border">
                              {story && (
                                <StoryLink id={match.storyId} className="text-[11px] px-2 py-0.5 rounded bg-[#4f46e5]/10 hover:bg-[#4f46e5]/20" />
                              )}
                              {match.storyId && match.ticketKey && (
                                <ArrowRight className="w-3 h-3 text-muted-foreground" />
                              )}
                              {ticket && (
                                <StoryLink id={match.ticketKey} className="text-[11px] px-2 py-0.5 rounded bg-[#2684ff]/10 hover:bg-[#2684ff]/20 !text-[#2684ff]" />
                              )}
                              {!match.storyId && (
                                <span className="text-[11px] text-muted-foreground italic">Kein Story-Gegenstück</span>
                              )}
                            </div>

                            <p className="text-[12px] text-[#475569] mb-2">{match.description}</p>

                            <div className="p-2 rounded bg-[#f1f0ff]/50 border border-[#4f46e5]/10 mb-3">
                              <p className="text-[11px] text-[#4f46e5]" style={{ fontWeight: 500 }}>
                                Empfehlung: {match.recommendation}
                              </p>
                            </div>

                            <div className="flex items-center gap-2">
                              <Button size="sm" className="text-[11px] h-6 bg-[#4f46e5] hover:bg-[#4338ca] text-white gap-1 px-2"
                                onClick={() => handleJiraMatchAction(match.id, "confirmed")}
                              >
                                <CheckCircle2 className="w-3 h-3" /> Bestätigen
                              </Button>
                              {(match.type === "duplicate" || match.type === "overlap") && (
                                <Button variant="outline" size="sm" className="text-[11px] h-6 gap-1 px-2"
                                  onClick={() => handleJiraMatchAction(match.id, "merged")}
                                >
                                  <Merge className="w-3 h-3" /> Zusammenführen
                                </Button>
                              )}
                              <Button variant="ghost" size="sm" className="text-[11px] h-6 text-muted-foreground gap-1 px-2"
                                onClick={() => handleJiraMatchAction(match.id, "dismissed")}
                              >
                                <Ban className="w-3 h-3" /> Ignorieren
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}

                {filteredJiraMatches.length === 0 && (
                  <div className="text-center py-8">
                    <CheckCircle2 className="w-10 h-10 text-[#10b981] mx-auto mb-3" />
                    <p className="text-[14px] text-[#1e1e2e]" style={{ fontWeight: 500 }}>Alle Zusammenhänge bearbeitet!</p>
                    <p className="text-[12px] text-muted-foreground mt-1">Sie können nun mit dem Speichern fortfahren.</p>
                  </div>
                )}
              </div>
            </div>

            <div className="w-[280px] overflow-y-auto bg-[#fafbfc] border-l border-border p-5 flex-shrink-0">
              <h4 className="text-[13px] text-[#1e1e2e] mb-3" style={{ fontWeight: 600 }}>Abgleich-Übersicht</h4>
              <div className="space-y-2.5">
                {Object.entries(jiraMatchTypeConfig).map(([key, config]) => {
                  const count = jiraMatches.filter((m) => m.type === key).length;
                  const open = jiraMatches.filter((m) => m.type === key && m.status === "pending").length;
                  if (count === 0) return null;
                  return (
                    <div key={key} className="flex items-center gap-2.5 p-2 rounded-lg bg-white border border-border">
                      <div className="w-6 h-6 rounded flex items-center justify-center" style={{ backgroundColor: config.bg }}>
                        <config.icon className="w-3 h-3" style={{ color: config.color }} />
                      </div>
                      <div className="flex-1">
                        <p className="text-[11px] text-[#1e1e2e]" style={{ fontWeight: 500 }}>{config.label}</p>
                      </div>
                      <span className="text-[11px]" style={{ fontWeight: 600, color: open > 0 ? config.color : "#10b981" }}>
                        {open}/{count}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="mt-5 pt-4 border-t border-border">
                <p className="text-[12px] text-muted-foreground mb-2" style={{ fontWeight: 500 }}>Betroffene Stories</p>
                {stories.filter((s) => jiraMatches.some((m) => m.storyId === s.id)).map((s) => (
                  <div key={s.id} className="flex items-center gap-2 py-1.5">
                    <StoryLink id={s.id} className="text-[11px]" />
                    <span className="text-[11px] text-muted-foreground truncate">{s.title}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </TooltipProvider>
    );
  }

  // ==============================
  // SAVE PHASE
  // ==============================
  if (phase === "save") {
    const projectName = availableProjects.find((p) => p.id === selectedProject)?.name || "";
    const storiesToSave = stories.filter((s) => storyActions[s.id] !== "rejected");

    return (
      <div className="p-8 max-w-[800px] mx-auto">
        <div className="mb-4">
          <Button variant="ghost" size="sm" onClick={() => setPhase("jira-compare")} className="text-muted-foreground gap-1 mb-3">
            <ArrowLeft className="w-4 h-4" /> Zurück zum Jira-Abgleich
          </Button>
          <h1 className="text-[#1e1e2e]">User Stories speichern</h1>
          <p className="text-[14px] text-muted-foreground mt-1">
            Wählen Sie ein Zielprojekt und speichern Sie die generierten User Stories.
          </p>
        </div>

        <WorkflowStepper steps={workflowSteps} currentStep={4} className="mb-8" />

        {/* Success Message */}
        {saveSuccess && (
          <div className="mb-6 p-5 rounded-xl bg-[#d1fae5] border border-[#10b981]/30 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#10b981] flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-[16px] text-[#065f46]" style={{ fontWeight: 600 }}>
                User Stories erfolgreich gespeichert!
              </p>
              <p className="text-[13px] text-[#047857] mt-0.5">
                {storiesToSave.length} Stories wurden in "{projectName}" gespeichert. Sie werden zum Dashboard weitergeleitet...
              </p>
            </div>
          </div>
        )}

        {!saveSuccess && (
          <>
            {/* Project Selection */}
            <Card className="border border-border bg-white mb-6">
              <CardHeader className="pb-3 border-b border-border">
                <div className="flex items-center gap-2">
                  <FolderOpen className="w-4 h-4 text-[#4f46e5]" />
                  <CardTitle className="text-[14px]" style={{ fontWeight: 600 }}>Zielprojekt auswählen</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-5">
                <select
                  value={selectedProject}
                  onChange={(e) => setSelectedProject(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-border bg-white text-[14px] outline-none focus:border-[#4f46e5] focus:ring-2 focus:ring-[#4f46e5]/10 transition-all"
                >
                  <option value="">Projekt wählen...</option>
                  {availableProjects.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </CardContent>
            </Card>

            {/* Summary */}
            <Card className="border border-border bg-white mb-6">
              <CardHeader className="pb-3 border-b border-border">
                <CardTitle className="text-[14px]" style={{ fontWeight: 600 }}>Zusammenfassung</CardTitle>
              </CardHeader>
              <CardContent className="p-5">
                <div className="grid grid-cols-3 gap-4 mb-5">
                  <div className="p-4 rounded-xl bg-[#f1f0ff] border border-[#4f46e5]/10 text-center">
                    <p className="text-[28px] text-[#4f46e5]" style={{ fontWeight: 700 }}>{storiesToSave.length}</p>
                    <p className="text-[12px] text-[#4f46e5]/70">Stories übernommen</p>
                  </div>
                  <div className="p-4 rounded-xl bg-[#fef2f2] border border-[#ef4444]/10 text-center">
                    <p className="text-[28px] text-[#ef4444]" style={{ fontWeight: 700 }}>{rejectedCount}</p>
                    <p className="text-[12px] text-[#ef4444]/70">Stories abgelehnt</p>
                  </div>
                  <div className="p-4 rounded-xl bg-[#d1fae5] border border-[#10b981]/10 text-center">
                    <p className="text-[28px] text-[#10b981]" style={{ fontWeight: 700 }}>{docFixedCount}</p>
                    <p className="text-[12px] text-[#10b981]/70">Dok.-Korrekturen</p>
                  </div>
                </div>

                <div className="space-y-2">
                  {storiesToSave.map((story) => (
                    <div key={story.id} className="flex items-center gap-3 px-4 py-3 rounded-lg border border-border bg-[#f8fafc]">
                      <CheckCircle2 className="w-4 h-4 text-[#10b981] flex-shrink-0" />
                      <StoryLink id={story.id} className="text-[12px]" />
                      <span className="text-[13px] text-[#1e1e2e] flex-1" style={{ fontWeight: 500 }}>{story.title}</span>
                      <Badge variant="secondary" className="text-[10px]" style={{ backgroundColor: effortConfig[story.effort].bg, color: effortConfig[story.effort].color }}>
                        {story.effort}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Integration Options */}
            <Card className="border border-border bg-white mb-6">
              <CardHeader className="pb-3 border-b border-border">
                <div className="flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 text-[#4f46e5]" />
                  <CardTitle className="text-[14px]" style={{ fontWeight: 600 }}>Integrationen</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-5 space-y-3">
                <label className="flex items-center gap-3 p-3 rounded-lg border border-[#0052cc]/20 hover:bg-[#0052cc]/5 cursor-pointer transition-colors">
                  <input type="checkbox" checked={confluenceSync} onChange={(e) => setConfluenceSync(e.target.checked)} className="w-4 h-4 accent-[#0052cc]" />
                  <div className="flex-1">
                    <p className="text-[13px] text-[#1e1e2e] flex items-center gap-1.5" style={{ fontWeight: 500 }}>
                      <span className="w-5 h-5 rounded bg-[#0052cc]/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-[10px]" style={{ fontWeight: 700, color: "#0052cc" }}>C</span>
                      </span>
                      Confluence automatisch aktualisieren
                      <Badge variant="secondary" className="text-[9px] px-1 bg-[#0052cc]/10 text-[#0052cc]">Auto-Sync</Badge>
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">Anforderungsseiten werden automatisch mit neuen Stories aktualisiert</p>
                  </div>
                </label>
                <div className="p-3 rounded-lg bg-[#f8fafc] border border-border">
                  <div className="flex items-center gap-2 mb-1.5">
                    <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                    <p className="text-[11px] text-muted-foreground">Letzte Confluence-Synchronisation: vor 2 Stunden</p>
                  </div>
                  <p className="text-[11px] text-muted-foreground">Zielseite: <span style={{ fontWeight: 500, color: "#0052cc" }}>Anforderungen / Sprint-44 / User Stories</span></p>
                </div>
              </CardContent>
            </Card>

            {/* Save Button */}
            <div className="space-y-3">
              <Button
                className="w-full h-12 bg-[#4f46e5] hover:bg-[#4338ca] text-white gap-2 shadow-sm text-[15px]"
                disabled={!selectedProject}
                onClick={handleSaveAll}
              >
                <Save className="w-5 h-5" />
                {storiesToSave.length} User Stories speichern
              </Button>
              <Button
                variant="outline"
                className="w-full h-10 gap-2 text-[13px] border-[#2684ff]/30 text-[#2684ff] hover:bg-[#2684ff]/5"
                onClick={() => { setJiraExportDialog(true); setJiraExportPhase("config"); setJiraExportProgress(0); }}
              >
                <ExternalLink className="w-4 h-4" />
                Direkt nach Jira exportieren (automatisiert)
              </Button>
            </div>
          </>
        )}
      </div>
    );
  }

  // ==============================
  // RESULTS PHASE (Clean, final stories)
  // ==============================
  return (
    <TooltipProvider>
      <div className="h-full flex flex-col">
        {/* Results Header */}
        <div className="px-8 py-4 border-b border-border bg-white flex-shrink-0">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setPhase("upload");
                  setUploadedFiles([]);
                  setStories(initialStories);
                  setDocIssues(initialDocIssues);
                  setJiraMatches(initialJiraMatches);
                  setStoryActions({});
                }}
                className="text-muted-foreground gap-1"
              >
                <ArrowLeft className="w-4 h-4" />
                Neue Analyse
              </Button>
              <div>
                <h2 className="text-[#1e1e2e]">Generierte User Stories</h2>
                <div className="flex items-center gap-3 mt-0.5">
                  <span className="text-[12px] text-muted-foreground">{stories.length} Stories generiert</span>
                  <span className="text-[12px] text-muted-foreground">|</span>
                  <span className="text-[12px] text-[#10b981] flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Dokumente bereinigt
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {docFixedCount > 0 && (
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#d1fae5]/50 border border-[#10b981]/20">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#10b981]" />
                  <span className="text-[11px] text-[#10b981]" style={{ fontWeight: 500 }}>
                    {docFixedCount} Korrekturen angewendet
                  </span>
                </div>
              )}
              <Button variant="outline" className="text-[13px] gap-2" onClick={() => { setExportScope("stories"); setShowExportDialog(true); }}>
                <Download className="w-4 h-4" />
                CSV/PDF
              </Button>
              <Button
                variant="outline"
                className="text-[13px] gap-2 border-[#2684ff]/30 text-[#2684ff] hover:bg-[#2684ff]/5"
                onClick={() => { setJiraExportDialog(true); setJiraExportPhase("config"); setJiraExportProgress(0); }}
              >
                <ExternalLink className="w-4 h-4" />
                Jira-Export
              </Button>
              <Button
                className="bg-[#4f46e5] hover:bg-[#4338ca] text-white gap-2 text-[13px]"
                onClick={() => setPhase("jira-compare")}
              >
                <ArrowRight className="w-4 h-4" />
                Weiter zum Jira-Abgleich
              </Button>
            </div>
          </div>
          <WorkflowStepper steps={workflowSteps} currentStep={2} />
        </div>

        {/* Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Main: Stories */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[#1e1e2e]">Prüfen & Auswählen</h3>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-white">
                <Search className="w-4 h-4 text-muted-foreground" />
                <input
                  placeholder="Stories durchsuchen..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent outline-none text-[13px] w-[160px] placeholder:text-muted-foreground"
                />
              </div>
            </div>

            <div className="space-y-4">
              {filteredStories.map((story) => {
                const action = storyActions[story.id];
                const isExpanded = expandedStories.has(story.id);
                const isEditing = editingStory === story.id;
                const isRejected = action === "rejected";
                const isKept = action === "kept";

                return (
                  <Card
                    key={story.id}
                    className={`border bg-white hover:shadow-sm transition-all overflow-hidden ${
                      isRejected ? "opacity-50" : ""
                    }`}
                    style={{
                      borderColor: isKept ? "#10b98140" : isRejected ? "#ef444430" : undefined,
                    }}
                  >
                    <CardContent className="p-0">
                      <div className="p-5">
                        <div className="flex items-start gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                              <StoryLink id={story.id} className="text-[11px]"><Badge variant="outline" className="text-[11px] text-[#4f46e5] border-[#4f46e5]/30 px-1.5 hover:bg-[#f1f0ff] cursor-pointer">{story.id}</Badge></StoryLink>
                              <Badge variant="secondary" className="text-[11px] px-1.5" style={{
                                backgroundColor: story.priority === "Hoch" ? "#fef2f2" : story.priority === "Mittel" ? "#fef3c7" : "#f1f5f9",
                                color: story.priority === "Hoch" ? "#ef4444" : story.priority === "Mittel" ? "#f59e0b" : "#64748b"
                              }}>
                                Prio: {story.priority}
                              </Badge>
                              <Badge variant="secondary" className="text-[11px] px-1.5" style={{ backgroundColor: effortConfig[story.effort].bg, color: effortConfig[story.effort].color }}>
                                Aufwand: {story.effort}
                              </Badge>
                              {isKept && (
                                <Badge variant="secondary" className="text-[11px] px-1.5 bg-[#d1fae5] text-[#10b981]">
                                  <ThumbsUp className="w-3 h-3 mr-1" />Übernommen
                                </Badge>
                              )}
                              {isRejected && (
                                <Badge variant="secondary" className="text-[11px] px-1.5 bg-[#fef2f2] text-[#ef4444]">
                                  <ThumbsDown className="w-3 h-3 mr-1" />Abgelehnt
                                </Badge>
                              )}
                            </div>

                            <p className="text-[15px] text-[#1e1e2e] mb-1.5" style={{ fontWeight: 500 }}>
                              {isRejected ? <s>{story.title}</s> : story.title}
                            </p>

                            {isEditing ? (
                              <div className="space-y-3 mt-3 p-4 rounded-lg bg-[#f8fafc] border border-[#4f46e5]/20">
                                <div>
                                  <label className="text-[11px] text-muted-foreground mb-1 block" style={{ fontWeight: 600 }}>Ziel (Goal)</label>
                                  <textarea
                                    value={editForm.goal}
                                    onChange={(e) => setEditForm((f) => ({ ...f, goal: e.target.value }))}
                                    className="w-full px-3 py-2 rounded-lg border border-border text-[13px] outline-none focus:border-[#4f46e5] min-h-[60px] resize-y"
                                  />
                                </div>
                                <div>
                                  <label className="text-[11px] text-muted-foreground mb-1 block" style={{ fontWeight: 600 }}>Nutzen (Benefit)</label>
                                  <textarea
                                    value={editForm.benefit}
                                    onChange={(e) => setEditForm((f) => ({ ...f, benefit: e.target.value }))}
                                    className="w-full px-3 py-2 rounded-lg border border-border text-[13px] outline-none focus:border-[#4f46e5] min-h-[60px] resize-y"
                                  />
                                </div>
                                <div className="flex items-center gap-2">
                                  <Button size="sm" className="text-[12px] h-7 bg-[#4f46e5] hover:bg-[#4338ca] text-white gap-1" onClick={() => handleSaveEdit(story.id)}>
                                    <CheckCircle2 className="w-3 h-3" /> Speichern
                                  </Button>
                                  <Button variant="outline" size="sm" className="text-[12px] h-7" onClick={() => handleCancelEdit(story.id)}>
                                    Abbrechen
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <p className="text-[13px] text-[#475569] leading-relaxed">
                                Als <span style={{ fontWeight: 500 }}>{story.role}</span> möchte ich{" "}
                                <span style={{ fontWeight: 500 }}>{story.goal}</span>, damit{" "}
                                <span style={{ fontWeight: 500 }}>{story.benefit}</span>.
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => toggleStory(story.id)}
                              className="flex items-center gap-1 px-2.5 py-1 rounded-md text-[12px] text-[#475569] hover:bg-[#f1f5f9] transition-colors"
                              style={{ fontWeight: 500 }}
                            >
                              {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                              Akzeptanzkriterien ({story.acceptance.length})
                            </button>
                            <Button variant="ghost" size="sm" className="text-[12px] h-7 gap-1 text-muted-foreground">
                              <Copy className="w-3 h-3" />Kopieren
                            </Button>
                          </div>
                          {!isRejected && !isKept && !isEditing && (
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                className="text-[12px] h-7 gap-1 bg-[#10b981] hover:bg-[#059669] text-white"
                                onClick={() => handleStoryAction(story.id, "kept")}
                              >
                                <ThumbsUp className="w-3 h-3" /> Übernehmen
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-[12px] h-7 gap-1"
                                onClick={() => handleStoryAction(story.id, "editing")}
                              >
                                <Pencil className="w-3 h-3" /> Bearbeiten
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-[12px] h-7 gap-1 text-[#ef4444] hover:text-[#ef4444] hover:bg-[#fef2f2]"
                                onClick={() => handleStoryAction(story.id, "rejected")}
                              >
                                <ThumbsDown className="w-3 h-3" /> Ablehnen
                              </Button>
                            </div>
                          )}
                          {(isKept || isRejected) && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-[12px] h-7 gap-1 text-muted-foreground"
                              onClick={() => setStoryActions((prev) => {
                                const next = { ...prev };
                                delete next[story.id];
                                return next;
                              })}
                            >
                              Zurücksetzen
                            </Button>
                          )}
                        </div>
                      </div>

                      {/* Expanded: Acceptance Criteria */}
                      {isExpanded && (
                        <div className="px-5 pb-4 border-t border-border bg-[#fafbfc]">
                          <div className="pt-4">
                            <p className="text-[11px] text-muted-foreground mb-2 uppercase tracking-wider" style={{ fontWeight: 600 }}>
                              Akzeptanzkriterien
                            </p>
                            <ul className="space-y-2">
                              {story.acceptance.map((ac, i) => (
                                <li key={i} className="flex items-start gap-2 text-[13px] text-[#475569]">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-[#10b981] mt-0.5 flex-shrink-0" />
                                  {ac}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Right: Summary Panel */}
          <div className="w-[320px] overflow-y-auto bg-[#fafbfc] border-l border-border p-5 flex-shrink-0">
            <h3 className="text-[#1e1e2e] mb-4">Übersicht</h3>

            <div className="grid grid-cols-2 gap-3 mb-5">
              <div className="bg-white rounded-xl border border-border p-3 text-center">
                <p className="text-[24px] text-[#4f46e5]" style={{ fontWeight: 700 }}>{stories.length}</p>
                <p className="text-[11px] text-muted-foreground">Generiert</p>
              </div>
              <div className="bg-white rounded-xl border border-[#10b981]/20 p-3 text-center">
                <p className="text-[24px] text-[#10b981]" style={{ fontWeight: 700 }}>
                  {Object.values(storyActions).filter((a) => a === "kept").length}
                </p>
                <p className="text-[11px] text-muted-foreground">Übernommen</p>
              </div>
              <div className="bg-white rounded-xl border border-[#ef4444]/20 p-3 text-center">
                <p className="text-[24px] text-[#ef4444]" style={{ fontWeight: 700 }}>{rejectedCount}</p>
                <p className="text-[11px] text-muted-foreground">Abgelehnt</p>
              </div>
              <div className="bg-white rounded-xl border border-border p-3 text-center">
                <p className="text-[24px] text-[#f59e0b]" style={{ fontWeight: 700 }}>
                  {stories.length - Object.keys(storyActions).length}
                </p>
                <p className="text-[11px] text-muted-foreground">Ausstehend</p>
              </div>
            </div>

            {/* Story List with Status */}
            <div className="mb-5">
              <p className="text-[12px] text-muted-foreground mb-2" style={{ fontWeight: 500 }}>Story-Status</p>
              <div className="space-y-1.5">
                {stories.map((s) => {
                  const a = storyActions[s.id];
                  return (
                    <div key={s.id} className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-white border border-border">
                      {a === "kept" ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#10b981]" />
                      ) : a === "rejected" ? (
                        <XCircle className="w-3.5 h-3.5 text-[#ef4444]" />
                      ) : (
                        <div className="w-3.5 h-3.5 rounded-full border-2 border-[#e2e8f0]" />
                      )}
                      <StoryLink id={s.id} className="text-[11px]" />
                      <span className="text-[11px] text-muted-foreground truncate flex-1">{s.title}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Effort Distribution */}
            <div className="bg-white rounded-xl border border-border p-3 mb-5">
              <p className="text-[12px] text-muted-foreground mb-2" style={{ fontWeight: 500 }}>Aufwandsverteilung</p>
              {(["Hoch", "Mittel", "Niedrig"] as const).map((effort) => {
                const count = stories.filter((s) => s.effort === effort).length;
                return (
                  <div key={effort} className="flex items-center gap-2 mb-1.5 last:mb-0">
                    <span className="text-[11px] w-[52px]" style={{ fontWeight: 500, color: effortConfig[effort].color }}>{effort}</span>
                    <div className="flex-1 h-2 rounded-full bg-[#f1f5f9] overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${(count / stories.length) * 100}%`, backgroundColor: effortConfig[effort].color }} />
                    </div>
                    <span className="text-[11px] w-[20px] text-right" style={{ fontWeight: 600 }}>{count}</span>
                  </div>
                );
              })}
            </div>

            {/* Quick Actions */}
            <div className="space-y-2">
              <Button
                className="w-full text-[12px] gap-2 bg-[#10b981] hover:bg-[#059669] text-white"
                onClick={() => {
                  const newActions: Record<string, StoryAction> = {};
                  stories.forEach((s) => { if (!storyActions[s.id]) newActions[s.id] = "kept"; });
                  setStoryActions((prev) => ({ ...prev, ...newActions }));
                }}
              >
                <ThumbsUp className="w-3.5 h-3.5" /> Alle übernehmen
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Jira Export Dialog */}
      <Dialog open={jiraExportDialog} onOpenChange={(open) => { if (!open) { setJiraExportDialog(false); setJiraExportPhase("config"); } }}>
        <DialogContent className="sm:max-w-[560px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-[#2684ff]/10 flex items-center justify-center">
                <span className="text-[12px]" style={{ fontWeight: 700, color: "#2684ff" }}>J</span>
              </div>
              Jira-Export automatisieren
            </DialogTitle>
            <DialogDescription>
              Stories direkt als Jira-Tickets erstellen – kein Copy-Paste erforderlich.
            </DialogDescription>
          </DialogHeader>

          {jiraExportPhase === "config" && (
            <div className="my-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[12px] text-muted-foreground mb-1 block" style={{ fontWeight: 500 }}>Jira-Projekt</label>
                  <select
                    value={jiraExportConfig.project}
                    onChange={(e) => setJiraExportConfig((c) => ({ ...c, project: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-white text-[13px] outline-none focus:border-[#4f46e5]"
                  >
                    <option value="PROJ">PROJ - Automobil-Plattform</option>
                    <option value="BANK">BANK - Banking App</option>
                    <option value="HC">HC - Healthcare Portal</option>
                  </select>
                </div>
                <div>
                  <label className="text-[12px] text-muted-foreground mb-1 block" style={{ fontWeight: 500 }}>Ziel-Sprint</label>
                  <select
                    value={jiraExportConfig.sprintTarget}
                    onChange={(e) => setJiraExportConfig((c) => ({ ...c, sprintTarget: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-white text-[13px] outline-none focus:border-[#4f46e5]"
                  >
                    <option value="Sprint 44">Sprint 44</option>
                    <option value="Sprint 45">Sprint 45</option>
                    <option value="Backlog">Backlog</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2.5">
                <label className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-[#f8fafc] cursor-pointer transition-colors">
                  <input type="checkbox" checked={jiraExportConfig.createEpic} onChange={(e) => setJiraExportConfig((c) => ({ ...c, createEpic: e.target.checked }))} className="w-4 h-4 accent-[#4f46e5]" />
                  <div className="flex-1">
                    <p className="text-[13px] text-[#1e1e2e]" style={{ fontWeight: 500 }}>Epic automatisch erstellen</p>
                    <p className="text-[11px] text-muted-foreground">Gruppiert generierte Stories unter einem neuen Epic</p>
                  </div>
                </label>
                <label className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-[#f8fafc] cursor-pointer transition-colors">
                  <input type="checkbox" checked={jiraExportConfig.autoAssign} onChange={(e) => setJiraExportConfig((c) => ({ ...c, autoAssign: e.target.checked }))} className="w-4 h-4 accent-[#4f46e5]" />
                  <div className="flex-1">
                    <p className="text-[13px] text-[#1e1e2e]" style={{ fontWeight: 500 }}>Automatische Zuweisung</p>
                    <p className="text-[11px] text-muted-foreground">Basierend auf Skill-Matching und aktuellem Workload</p>
                  </div>
                </label>
                <label className="flex items-center gap-3 p-3 rounded-lg border border-[#0052cc]/20 hover:bg-[#0052cc]/5 cursor-pointer transition-colors">
                  <input type="checkbox" checked={jiraExportConfig.syncConfluence} onChange={(e) => setJiraExportConfig((c) => ({ ...c, syncConfluence: e.target.checked }))} className="w-4 h-4 accent-[#0052cc]" />
                  <div className="flex-1">
                    <p className="text-[13px] text-[#1e1e2e] flex items-center gap-1.5" style={{ fontWeight: 500 }}>
                      Confluence automatisch aktualisieren
                      <Badge variant="secondary" className="text-[9px] px-1 bg-[#0052cc]/10 text-[#0052cc]">Auto-Sync</Badge>
                    </p>
                    <p className="text-[11px] text-muted-foreground">Anforderungsseite in Confluence wird automatisch mit neuen Stories aktualisiert</p>
                  </div>
                </label>
              </div>

              <div className="p-3 rounded-lg bg-[#f1f0ff]/50 border border-[#4f46e5]/10">
                <p className="text-[12px] text-[#4f46e5]" style={{ fontWeight: 500 }}>
                  {stories.filter((s) => storyActions[s.id] !== "rejected").length} Stories werden als Jira-Tickets erstellt
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Duplikat-Prüfung gegen bestehende Tickets wird automatisch durchgeführt
                </p>
              </div>
            </div>
          )}

          {jiraExportPhase === "exporting" && (
            <div className="my-6 text-center">
              <div className="w-12 h-12 rounded-2xl bg-[#2684ff]/10 flex items-center justify-center mx-auto mb-4">
                <Loader2 className="w-6 h-6 text-[#2684ff] animate-spin" />
              </div>
              <p className="text-[14px] text-[#1e1e2e] mb-1" style={{ fontWeight: 500 }}>Tickets werden erstellt...</p>
              <p className="text-[12px] text-muted-foreground mb-4">Duplikat-Check, Story-Erstellung, Verlinkung</p>
              <Progress value={jiraExportProgress} className="h-2 mb-3" />
              <p className="text-[11px] text-muted-foreground">{jiraExportProgress}% abgeschlossen</p>
            </div>
          )}

          {jiraExportPhase === "done" && (
            <div className="my-6">
              <div className="text-center mb-4">
                <div className="w-12 h-12 rounded-2xl bg-[#d1fae5] flex items-center justify-center mx-auto mb-3">
                  <CheckCircle2 className="w-6 h-6 text-[#10b981]" />
                </div>
                <p className="text-[14px] text-[#1e1e2e]" style={{ fontWeight: 600 }}>Export erfolgreich!</p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 p-2.5 rounded-lg bg-[#d1fae5]/50 border border-[#10b981]/20">
                  <CheckCircle2 className="w-4 h-4 text-[#10b981]" />
                  <span className="text-[12px] text-[#1e1e2e]" style={{ fontWeight: 500 }}>{stories.filter((s) => storyActions[s.id] !== "rejected").length} Jira-Tickets erstellt</span>
                  <span className="text-[11px] text-muted-foreground ml-auto">{jiraExportConfig.project}-401 bis {jiraExportConfig.project}-407</span>
                </div>
                {jiraExportConfig.createEpic && (
                  <div className="flex items-center gap-2 p-2.5 rounded-lg bg-[#d1fae5]/50 border border-[#10b981]/20">
                    <CheckCircle2 className="w-4 h-4 text-[#10b981]" />
                    <span className="text-[12px] text-[#1e1e2e]" style={{ fontWeight: 500 }}>Epic "{jiraExportConfig.project}-400" erstellt</span>
                  </div>
                )}
                {jiraExportConfig.autoAssign && (
                  <div className="flex items-center gap-2 p-2.5 rounded-lg bg-[#d1fae5]/50 border border-[#10b981]/20">
                    <Users className="w-4 h-4 text-[#10b981]" />
                    <span className="text-[12px] text-[#1e1e2e]" style={{ fontWeight: 500 }}>Automatische Zuweisung an 4 Entwickler</span>
                  </div>
                )}
                {jiraExportConfig.syncConfluence && (
                  <div className="flex items-center gap-2 p-2.5 rounded-lg bg-[#0052cc]/5 border border-[#0052cc]/20">
                    <CheckCircle2 className="w-4 h-4 text-[#0052cc]" />
                    <span className="text-[12px] text-[#1e1e2e]" style={{ fontWeight: 500 }}>Confluence-Seite aktualisiert</span>
                    <span className="text-[11px] text-muted-foreground ml-auto">Anforderungen/Sprint-44</span>
                  </div>
                )}
                <div className="flex items-center gap-2 p-2.5 rounded-lg bg-[#fef3c7]/50 border border-[#f59e0b]/20">
                  <AlertTriangle className="w-4 h-4 text-[#f59e0b]" />
                  <span className="text-[12px] text-[#1e1e2e]" style={{ fontWeight: 500 }}>1 Duplikat erkannt und übersprungen</span>
                  <span className="text-[11px] text-muted-foreground ml-auto">PROJ-156 (CSV/PDF Export)</span>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            {jiraExportPhase === "config" && (
              <>
                <Button variant="outline" onClick={() => setJiraExportDialog(false)}>Abbrechen</Button>
                <Button className="bg-[#2684ff] hover:bg-[#1a73e8] text-white gap-2" onClick={startJiraExport}>
                  <Send className="w-4 h-4" /> Export starten
                </Button>
              </>
            )}
            {jiraExportPhase === "done" && (
              <Button className="bg-[#4f46e5] hover:bg-[#4338ca] text-white" onClick={() => setJiraExportDialog(false)}>
                Schließen
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
}
