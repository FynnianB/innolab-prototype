import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import {
  ShieldCheck,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  Wand2,
  BookOpen,
  ArrowRight,
  Info,
  X,
  FolderOpen,
  ArrowLeft,
  FileText,
  Lock,
  Scale,
  Layers,
  MessageSquare,
  Eye,
  ArrowDown,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Clock,
  ClipboardList,
  ChevronUp,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../components/ui/dialog";
import { useAppContext } from "../context/AppContext";
import {
  PROJECT_LOGO_BY_ID,
  PROJECT_SEARCH_META,
  PROJECT_WORKSPACE,
} from "../data/workspaces";

type CompliancePhase = "project-select" | "review";

interface ProjectData {
  id: string;
  name: string;
  description: string;
  document: string;
  lastReview: string;
  stories: number;
  status: string;
  statusColor: string;
  pages: DocumentPage[];
  issues: ComplianceIssue[];
}

interface DocumentPage {
  pageNum: number;
  title: string;
  content: string;
}

type IssueSeverity = "critical" | "major" | "minor";
type IssueCategory = "dsgvo" | "legal" | "corporate" | "style" | "ambiguity" | "structure";

interface ComplianceIssue {
  id: string;
  severity: IssueSeverity;
  category: IssueCategory;
  title: string;
  description: string;
  rule: string;
  suggestion: string;
  before: string;
  after: string;
  textHighlight: string;
  section: string;
  page: number;
}

const categoryConfig: Record<IssueCategory, { label: string; icon: typeof AlertCircle; color: string; bg: string }> = {
  dsgvo: { label: "DSGVO-Verletzung", icon: Lock, color: "#dc2626", bg: "#fef2f2" },
  legal: { label: "Rechtlicher Verstoß", icon: Scale, color: "#9333ea", bg: "#faf5ff" },
  corporate: { label: "Unternehmensstandard", icon: ShieldCheck, color: "#ea580c", bg: "#fff7ed" },
  style: { label: "Stilistischer Fehler", icon: MessageSquare, color: "#0284c7", bg: "#f0f9ff" },
  ambiguity: { label: "Mehrdeutigkeit", icon: AlertTriangle, color: "#d97706", bg: "#fffbeb" },
  structure: { label: "Strukturproblem", icon: Layers, color: "#64748b", bg: "#f8fafc" },
};

const severityConfig: Record<IssueSeverity, { label: string; color: string; bg: string; icon: typeof AlertCircle }> = {
  critical: { label: "Kritisch", color: "#ef4444", bg: "#fef2f2", icon: AlertCircle },
  major: { label: "Wichtig", color: "#f59e0b", bg: "#fef3c7", icon: AlertTriangle },
  minor: { label: "Gering", color: "#64748b", bg: "#f1f5f9", icon: Info },
};

// ============================================================
// Demo-Lastenheft (mehrseitig) — für alle Kundenprojekte wiederverwendet
// ============================================================
const projectA_Pages: DocumentPage[] = [
  {
    pageNum: 1,
    title: "Authentifizierung & Datenverwaltung",
    content: `1. Systemanforderungen

1.1 Benutzerauthentifizierung
Das System muss eine sichere Authentifizierung über SSO bereitstellen. Benutzer sollen sich mit ihren Unternehmens-Credentials anmelden können. Die Passwort-Policy muss mindestens 8 Zeichen, einen Großbuchstaben und ein Sonderzeichen erfordern.

1.2 Datenverwaltung
Alle Benutzerdaten werden in einer zentralen Datenbank gespeichert. Das System sollte schnelle Antwortzeiten haben. Daten müssen gemäß DSGVO verarbeitet werden. Personenbezogene Daten dürfen nur mit Einwilligung erhoben werden.

1.3 Berichtswesen
Das System muss Reports generieren können. Die Reports sollen verschiedene Formate unterstützen. Der Export muss zeitnah erfolgen. Berichte mit personenbezogenen Daten müssen anonymisiert werden können.

1.4 Performance-Anforderungen
Das System muss performant sein und schnell reagieren. Alle Seiten müssen in akzeptabler Zeit laden. Die Datenbank muss effizient arbeiten.`,
  },
  {
    pageNum: 2,
    title: "Sicherheit & Barrierefreiheit",
    content: `1.5 Sicherheitsanforderungen
Alle Daten müssen verschlüsselt übertragen werden. Das System muss gegen unbefugten Zugriff geschützt sein. Sicherheitsupdates müssen regelmäßig eingespielt werden. Der Zugriff auf sensible Daten muss protokolliert werden.

1.6 Barrierefreiheit
Die Anwendung soll barrierefrei sein. Die Benutzeroberfläche muss WCAG 2.1 AA-konform sein. Alle Bilder müssen Alternativtexte haben.

1.7 Datenaufbewahrung
Benutzerdaten werden unbegrenzt gespeichert. Löschanfragen werden manuell bearbeitet. Ein automatisierter Löschmechanismus ist nicht vorgesehen.`,
  },
  {
    pageNum: 3,
    title: "Fahrzeug-Telematik",
    content: `2. Fahrzeug-Telematik-Modul

2.1 Datenerfassung
Das System muss Telemetriedaten von vernetzten Fahrzeugen in Echtzeit empfangen. Die Datenübertragung erfolgt über MQTT-Protokoll. Maximale Latenz: unter 500ms. Mindestens 100.000 gleichzeitige Fahrzeugverbindungen müssen unterstützt werden.

2.2 Diagnose-Dashboard
Ein Dashboard zur Fahrzeugdiagnose muss bereitgestellt werden. Fehlercodes (DTC) werden automatisch interpretiert. Historische Diagnosedaten müssen mindestens 5 Jahre verfügbar sein.

2.3 OTA-Updates
Over-the-Air Updates müssen für Steuergeräte-Software unterstützt werden. Update-Pakete müssen digital signiert sein. Rollback-Mechanismus bei fehlgeschlagenen Updates ist obligatorisch.`,
  },
  {
    pageNum: 4,
    title: "Infotainment & Navigation",
    content: `3. Infotainment-System

3.1 Media-Integration
Das System muss Apple CarPlay und Android Auto unterstützen. Streaming-Dienste (Spotify, Tidal) müssen integrierbar sein. Audio-Qualität: mindestens 320kbps.

3.2 Navigationssystem
Echtzeit-Navigation mit Verkehrsdaten muss verfügbar sein. Kartenmaterial muss offline verfügbar sein. POI-Suche und Routenplanung mit Zwischenstopps müssen unterstützt werden.

3.3 Sprachsteuerung
Ein Sprachassistent muss für die Steuerung des Infotainment-Systems verfügbar sein. Natural Language Processing für deutsche und englische Befehle. Offline-Spracherkennung für Basisfunktionen.`,
  },
  {
    pageNum: 5,
    title: "Flottenmanagement",
    content: `4. Flottenmanagement-Modul

4.1 Fahrzeugübersicht
Alle Fahrzeuge der Flotte müssen auf einer Kartenansicht dargestellt werden. Echtzeit-Standortverfolgung mit GPS-Genauigkeit. Status-Übersicht: aktiv, inaktiv, in Wartung.

4.2 Wartungsplanung
Vorausschauende Wartung basierend auf Telemetriedaten. Automatische Benachrichtigung bei Wartungsbedarf. Integration mit Werkstatt-Management-System.

4.3 Kostenanalyse
Kraftstoffverbrauch und Energiekosten pro Fahrzeug tracken. TCO-Berechnung über den gesamten Lebenszyklus. Vergleichsberichte zwischen Fahrzeuggruppen.`,
  },
  {
    pageNum: 6,
    title: "Nicht-funktionale Anforderungen",
    content: `5. Nicht-funktionale Anforderungen

5.1 Skalierbarkeit
Das System muss horizontal skalierbar sein. Microservice-Architektur mit Kubernetes-Orchestrierung. Auto-Scaling basierend auf Last-Metriken.

5.2 Verfügbarkeit
99,9% Verfügbarkeit (SLA) pro Monat. Geo-redundante Deployment-Strategie. Maximum Recovery Time: 4 Stunden, Recovery Point: 1 Stunde.

5.3 Internationalisierung
Unterstützung für mindestens 12 Sprachen. Lokalisierung von Datums-, Zeit- und Währungsformaten. RTL-Layoutunterstützung für arabische Märkte.`,
  },
];

const projectA_Issues: ComplianceIssue[] = [
  {
    id: "C-001", severity: "critical", category: "dsgvo",
    title: "DSGVO: Unbegrenzte Datenspeicherung",
    description: "Art. 5 Abs. 1e DSGVO fordert eine Speicherbegrenzung. 'Unbegrenzt' verstößt gegen das Prinzip der Datenminimierung.",
    rule: "DSGVO Art. 5 Abs. 1e – Speicherbegrenzung",
    suggestion: "Benutzerdaten werden gemäß definierten Aufbewahrungsfristen gespeichert: Aktive Konten max. 3 Jahre nach letzter Aktivität, danach automatische Anonymisierung.",
    before: "Benutzerdaten werden unbegrenzt gespeichert",
    after: "Benutzerdaten werden gemäß definierten Aufbewahrungsfristen gespeichert: Aktive Konten max. 3 Jahre nach letzter Aktivität, danach automatische Anonymisierung. Aufbewahrungsrichtlinie DR-2024-v1 gilt.",
    textHighlight: "Benutzerdaten werden unbegrenzt gespeichert",
    section: "1.7", page: 2,
  },
  {
    id: "C-002", severity: "critical", category: "dsgvo",
    title: "DSGVO: Kein automatisierter Löschmechanismus",
    description: "Art. 17 DSGVO (Recht auf Löschung) erfordert technische Maßnahmen zur automatisierten Löschung auf Anfrage.",
    rule: "DSGVO Art. 17 – Recht auf Löschung",
    suggestion: "Das System muss Löschanfragen innerhalb von 30 Tagen automatisiert verarbeiten, inkl. Bestätigungsemail an den Betroffenen.",
    before: "Löschanfragen werden manuell bearbeitet. Ein automatisierter Löschmechanismus ist nicht vorgesehen",
    after: "Löschanfragen werden innerhalb von 72 Stunden automatisiert verarbeitet. Das System stellt einen Self-Service-Löschmechanismus bereit. Bestätigung per E-Mail innerhalb von 24 Stunden.",
    textHighlight: "Löschanfragen werden manuell bearbeitet",
    section: "1.7", page: 2,
  },
  {
    id: "C-003", severity: "critical", category: "ambiguity",
    title: "Unspezifische Anforderung: 'schnelle Antwortzeiten'",
    description: "'Das System sollte schnelle Antwortzeiten haben' ist nicht messbar. Verwenden Sie konkrete Metriken gemäß ISO 29148.",
    rule: "ISO 29148 §5.2.5 – Messbarkeit",
    suggestion: "Das System muss eine Antwortzeit von maximal 200ms für API-Aufrufe und 2 Sekunden für Seitenaufbau gewährleisten.",
    before: "Das System sollte schnelle Antwortzeiten haben",
    after: "Das System muss eine Antwortzeit von maximal 200ms für API-Aufrufe und 2 Sekunden für den vollständigen Seitenaufbau unter Standard-Last (500 gleichzeitige Benutzer) gewährleisten.",
    textHighlight: "Das System sollte schnelle Antwortzeiten haben",
    section: "1.2", page: 1,
  },
  {
    id: "C-004", severity: "critical", category: "ambiguity",
    title: "Vage Formulierung: 'performant und schnell'",
    description: "'Das System muss performant sein und schnell reagieren' enthält keine messbaren Kriterien.",
    rule: "Sprachstandard §3.1 – Quantifizierbarkeit",
    suggestion: "Definieren Sie konkrete Performance-Ziele mit messbaren Werten.",
    before: "Das System muss performant sein und schnell reagieren",
    after: "Das System muss bei einer Last von 500 gleichzeitigen Benutzern eine CPU-Auslastung unter 80% halten und eine Antwortzeit von unter 500ms pro Anfrage garantieren. 99,5% Verfügbarkeit pro Monat.",
    textHighlight: "Das System muss performant sein und schnell reagieren",
    section: "1.4", page: 1,
  },
  {
    id: "C-005", severity: "major", category: "legal",
    title: "Unzureichende Verschlüsselungsspezifikation",
    description: "'Verschlüsselt übertragen' spezifiziert kein Verschlüsselungsverfahren. Gesetzliche Mindeststandards (TLS 1.2+) müssen benannt werden.",
    rule: "BSI TR-02102-2 – Kryptographische Verfahren",
    suggestion: "Alle Daten müssen mit TLS 1.3 (mindestens TLS 1.2) übertragen werden. Ruhende Daten sind mit AES-256 zu verschlüsseln.",
    before: "Alle Daten müssen verschlüsselt übertragen werden",
    after: "Alle Daten müssen mittels TLS 1.3 (Fallback: TLS 1.2) übertragen werden. Ruhende Daten (data at rest) sind mit AES-256 zu verschlüsseln. Schlüsselrotation alle 90 Tage gemäß BSI TR-02102-2.",
    textHighlight: "Alle Daten müssen verschlüsselt übertragen werden",
    section: "1.5", page: 2,
  },
  {
    id: "C-006", severity: "major", category: "ambiguity",
    title: "Unbestimmter Zeitbegriff: 'zeitnah'",
    description: "'zeitnah' ist nicht präzise definiert. Verwenden Sie konkrete Zeitangaben.",
    rule: "Sprachstandard §2.4 – Zeitangaben",
    suggestion: "Der Export muss innerhalb von 30 Sekunden für Datensätze bis 10.000 Einträge abgeschlossen sein.",
    before: "Der Export muss zeitnah erfolgen",
    after: "Der Export muss innerhalb von 30 Sekunden für Datensätze bis 10.000 Einträge abgeschlossen sein. Bei größeren Datensätzen: asynchroner Export mit Fortschrittsanzeige und E-Mail-Benachrichtigung.",
    textHighlight: "Der Export muss zeitnah erfolgen",
    section: "1.3", page: 1,
  },
  {
    id: "C-007", severity: "major", category: "structure",
    title: "Fehlende Spezifikation der Formate",
    description: "'verschiedene Formate' ist nicht ausreichend spezifiziert. Listen Sie die unterstützten Formate auf.",
    rule: "Strukturvorgabe §4.2 – Vollständigkeit",
    suggestion: "Die Reports müssen in den Formaten PDF, CSV, XLSX und HTML exportiert werden können.",
    before: "Die Reports sollen verschiedene Formate unterstützen",
    after: "Die Reports müssen in den Formaten PDF (ISO 32000-2), CSV (RFC 4180), XLSX und HTML5 exportiert werden können. Optionaler JSON-Export für API-Integration.",
    textHighlight: "Die Reports sollen verschiedene Formate unterstützen",
    section: "1.3", page: 1,
  },
  {
    id: "C-008", severity: "major", category: "corporate",
    title: "Unklare Update-Häufigkeit: 'regelmäßig'",
    description: "'regelmäßig' ist nicht definiert. Der Unternehmensstandard fordert konkrete Update-Zyklen.",
    rule: "Sicherheitsrichtlinie SR-2024-001 §6.2",
    suggestion: "Sicherheitsupdates müssen innerhalb von 72 Stunden nach Veröffentlichung eingespielt werden.",
    before: "Sicherheitsupdates müssen regelmäßig eingespielt werden",
    after: "Sicherheitsupdates müssen innerhalb von 72 Stunden nach Veröffentlichung durch den Hersteller eingespielt werden. Kritische CVE-Patches (CVSS >= 9.0) innerhalb von 24 Stunden. Monatliches Patch-Review obligatorisch.",
    textHighlight: "Sicherheitsupdates müssen regelmäßig eingespielt werden",
    section: "1.5", page: 2,
  },
  {
    id: "C-009", severity: "minor", category: "style",
    title: "Inkonsistente Modalverben",
    description: "'sollte' und 'muss' werden inkonsistent verwendet. 'sollte' impliziert optional, 'muss' ist verbindlich.",
    rule: "Sprachstandard §1.2 – Modalverben",
    suggestion: "Verwenden Sie 'muss' für verbindliche Anforderungen und 'sollte' nur für optionale Wunschanforderungen.",
    before: "Das System sollte schnelle Antwortzeiten haben",
    after: "Das System muss definierte Antwortzeiten einhalten (siehe Performance-Anforderungen §1.4)",
    textHighlight: "Benutzer sollen sich mit ihren Unternehmens-Credentials anmelden können",
    section: "1.1", page: 1,
  },
  {
    id: "C-010", severity: "minor", category: "style",
    title: "Passive Formulierung",
    description: "'Alle Benutzerdaten werden ... gespeichert' ist passiv. Aktive Formulierungen sind klarer und eindeutiger.",
    rule: "Sprachstandard §1.5 – Aktiv vs. Passiv",
    suggestion: "Das System muss alle Benutzerdaten in einer zentralen, redundant ausgelegten PostgreSQL-Datenbank speichern.",
    before: "Alle Benutzerdaten werden in einer zentralen Datenbank gespeichert",
    after: "Das System muss alle Benutzerdaten in einer zentralen, redundant ausgelegten PostgreSQL-Datenbank speichern. Georedundante Replikation ist obligatorisch.",
    textHighlight: "Alle Benutzerdaten werden in einer zentralen Datenbank gespeichert",
    section: "1.2", page: 1,
  },
  {
    id: "C-011", severity: "minor", category: "structure",
    title: "Fehlende Priorisierung der Akzeptanzkriterien",
    description: "Die Barrierefreiheits-Anforderungen haben keine klare Priorisierung oder Testbarkeit definiert.",
    rule: "Strukturvorgabe §3.1 – Testbarkeit",
    suggestion: "Ergänzen Sie testbare Kriterien und eine Priorisierung für die WCAG-Konformität.",
    before: "Die Anwendung soll barrierefrei sein",
    after: "Die Anwendung muss WCAG 2.1 Level AA erfüllen. Automatisierte Accessibility-Tests (axe-core) müssen in die CI/CD-Pipeline integriert werden. Manuelle Tests mit Screen-Reader quartalsweise.",
    textHighlight: "Die Anwendung soll barrierefrei sein",
    section: "1.6", page: 2,
  },
  {
    id: "C-012", severity: "major", category: "dsgvo",
    title: "DSGVO: Fehlende Einwilligungsspezifikation",
    description: "Art. 7 DSGVO fordert eine nachweisbare, informierte Einwilligung. Die Art der Einholung ist nicht spezifiziert.",
    rule: "DSGVO Art. 7 – Bedingungen für die Einwilligung",
    suggestion: "Spezifizieren Sie Double-Opt-In, granulare Einwilligungsoptionen und Widerrufsmöglichkeit.",
    before: "Personenbezogene Daten dürfen nur mit Einwilligung erhoben werden",
    after: "Personenbezogene Daten dürfen nur mit nachweisbarer Einwilligung erhoben werden (Double-Opt-In). Granulare Einwilligungsoptionen je Verarbeitungszweck. Widerruf jederzeit möglich mit sofortiger Wirkung.",
    textHighlight: "Personenbezogene Daten dürfen nur mit Einwilligung erhoben werden",
    section: "1.2", page: 1,
  },
];

const COMPLIANCE_PROJECT_IDS = [
  "P-101",
  "P-102",
  "P-103",
  "P-201",
  "P-202",
  "P-203",
  "P-301",
  "P-302",
  "P-303",
  "P-401",
  "P-402",
  "P-403",
  "P-501",
  "P-502",
  "P-503",
] as const;

const projects: ProjectData[] = COMPLIANCE_PROJECT_IDS.map((id) => {
  const meta = PROJECT_SEARCH_META[id];
  return {
    id,
    name: meta.name,
    description: meta.description,
    document: "Lastenheft (Auszug) – Prototyp-Compliance",
    lastReview: "—",
    stories: 120,
    status: "Aktiv" as const,
    statusColor: "#4f46e5",
    pages: projectA_Pages,
    issues: projectA_Issues,
  };
});

interface FixLogEntry {
  id: string;
  issueId: string;
  issueTitle: string;
  category: IssueCategory;
  severity: IssueSeverity;
  rule: string;
  before: string;
  after: string;
  timestamp: string;
  appliedBy: string;
}

export function ComplianceChecker() {
  const navigate = useNavigate();
  const {
    setShowExportDialog,
    setExportScope,
    selectedWorkspaceId,
    selectedWorkspace,
  } = useAppContext();

  const workspaceProjects = useMemo(
    () =>
      projects.filter(
        (p) => PROJECT_WORKSPACE[p.id] === selectedWorkspaceId,
      ),
    [selectedWorkspaceId],
  );
  const [phase, setPhase] = useState<CompliancePhase>("project-select");
  const [selectedProject, setSelectedProject] = useState<ProjectData | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [documentTexts, setDocumentTexts] = useState<Record<number, string>>({});
  const [selectedIssue, setSelectedIssue] = useState<string | null>(null);
  const [severityFilter, setSeverityFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [fixedIssues, setFixedIssues] = useState<Set<string>>(new Set());
  const [showSuggestion, setShowSuggestion] = useState<string | null>(null);
  const [autoFixDialog, setAutoFixDialog] = useState<ComplianceIssue | null>(null);
  const [fixLog, setFixLog] = useState<FixLogEntry[]>([]);
  const [showFixLog, setShowFixLog] = useState(false);

  const handleProjectSelect = (project: ProjectData) => {
    setSelectedProject(project);
    const texts: Record<number, string> = {};
    project.pages.forEach((p) => { texts[p.pageNum] = p.content; });
    setDocumentTexts(texts);
    setCurrentPage(1);
    setPhase("review");
    setFixedIssues(new Set());
    setSeverityFilter("all");
    setCategoryFilter("all");
    setSelectedIssue(null);
  };

  const handleAutoFix = (issue: ComplianceIssue) => {
    setFixedIssues((prev) => new Set(prev).add(issue.id));
    setDocumentTexts((prev) => {
      const pageText = prev[issue.page];
      if (pageText && pageText.includes(issue.before)) {
        return { ...prev, [issue.page]: pageText.replace(issue.before, issue.after) };
      }
      return prev;
    });
    // Log the fix for audit trail
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}:${now.getSeconds().toString().padStart(2, "0")}`;
    setFixLog((prev) => [
      {
        id: `LOG-${prev.length + 1}`,
        issueId: issue.id,
        issueTitle: issue.title,
        category: issue.category,
        severity: issue.severity,
        rule: issue.rule,
        before: issue.before,
        after: issue.after,
        timestamp: timeStr,
        appliedBy: "KI Auto-Fix",
      },
      ...prev,
    ]);
  };

  const handleAutoFixAll = () => {
    if (!selectedProject) return;
    const activeIssuesList = selectedProject.issues.filter((i) => !fixedIssues.has(i.id));
    setDocumentTexts((prev) => {
      const updated = { ...prev };
      activeIssuesList.forEach((issue) => {
        const pageText = updated[issue.page];
        if (pageText && pageText.includes(issue.before)) {
          updated[issue.page] = pageText.replace(issue.before, issue.after);
        }
      });
      return updated;
    });
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}:${now.getSeconds().toString().padStart(2, "0")}`;
    const newEntries: FixLogEntry[] = activeIssuesList.map((issue, idx) => ({
      id: `LOG-${fixLog.length + idx + 1}`,
      issueId: issue.id,
      issueTitle: issue.title,
      category: issue.category,
      severity: issue.severity,
      rule: issue.rule,
      before: issue.before,
      after: issue.after,
      timestamp: timeStr,
      appliedBy: "KI Auto-Fix (Batch)",
    }));
    setFixLog((prev) => [...newEntries.reverse(), ...prev]);
    activeIssuesList.forEach((i) =>
      setFixedIssues((prev) => new Set(prev).add(i.id))
    );
  };

  // PROJECT SELECTION
  if (phase === "project-select") {
    return (
      <TooltipProvider>
        <div className="p-8 max-w-[900px] mx-auto">
          <div
            className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"
            data-tour="compliance-intro"
          >
            <div className="min-w-0">
              <h1 className="text-[#1e1e2e]">Compliance Checker</h1>
              <p className="text-[14px] text-muted-foreground mt-1">
                Workspace:{" "}
                <span className="text-foreground font-medium">
                  {selectedWorkspace.name}
                </span>
                {" · "}
                Wählen Sie ein Projekt, um die Anforderungen gegen Compliance-Regeln zu prüfen.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              className="gap-2 text-[13px] shrink-0 self-start"
              data-tour="compliance-rules-btn"
              onClick={() => navigate("/rules")}
            >
              <BookOpen className="w-4 h-4" />
              Regeln verwalten
            </Button>
          </div>

          <div className="space-y-4" data-tour="compliance-project-list">
            {workspaceProjects.length === 0 && (
              <p className="text-[14px] text-muted-foreground rounded-lg border border-dashed border-border bg-muted/30 px-4 py-8 text-center">
                Für diesen Workspace sind keine Compliance-Projekte hinterlegt.
              </p>
            )}
            {workspaceProjects.map((project) => (
              <Card
                key={project.id}
                className="border border-border bg-white hover:shadow-md hover:border-[#4f46e5]/20 transition-all duration-200 cursor-pointer group"
                onClick={() => handleProjectSelect(project)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-5">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 border border-transparent overflow-hidden transition-colors group-hover:border-[#e0e7ff] bg-[#f1f5f9] group-hover:bg-[#f1f0ff]">
                      {PROJECT_LOGO_BY_ID[project.id] ? (
                        <img
                          src={PROJECT_LOGO_BY_ID[project.id]}
                          alt=""
                          className="w-9 h-9 object-contain"
                          loading="lazy"
                        />
                      ) : (
                        <FolderOpen className="w-7 h-7 text-[#64748b] group-hover:text-[#4f46e5] transition-colors" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <p className="text-[16px] text-[#1e1e2e] group-hover:text-[#4f46e5] transition-colors" style={{ fontWeight: 600 }}>
                          {project.name}
                        </p>
                        <Badge variant="secondary" className="text-[11px] px-2" style={{ backgroundColor: `${project.statusColor}15`, color: project.statusColor, fontWeight: 500 }}>
                          {project.status}
                        </Badge>
                      </div>
                      <p className="text-[13px] text-muted-foreground mb-3">{project.description}</p>
                      <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2 text-[12px] text-muted-foreground">
                          <FileText className="w-3.5 h-3.5 text-[#4f46e5]" />
                          {project.document}
                        </div>
                      </div>
                      <div className="flex items-center gap-4 mt-3">
                        <div className="flex items-center gap-1.5 text-[12px] text-muted-foreground">
                          <Layers className="w-3.5 h-3.5 text-[#8b5cf6]" />
                          <span>{project.pages.length} Seiten</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[12px] text-muted-foreground">
                          <ShieldCheck className="w-3.5 h-3.5 text-[#10b981]" />
                          <span>{project.issues.length} potenzielle Probleme</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[12px] text-muted-foreground">
                          <FileText className="w-3.5 h-3.5 text-[#8b5cf6]" />
                          <span>{project.stories} User Stories</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[12px] text-muted-foreground">
                          <Eye className="w-3.5 h-3.5 text-[#64748b]" />
                          <span>Letztes Review: {project.lastReview}</span>
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-[#4f46e5] transition-colors flex-shrink-0 mt-4" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </TooltipProvider>
    );
  }

  // REVIEW PHASE
  if (!selectedProject) return null;

  const totalPages = selectedProject.pages.length;
  const activeIssues = selectedProject.issues.filter((i) => !fixedIssues.has(i.id));
  const currentPageIssues = activeIssues.filter((i) => i.page === currentPage);
  const filteredIssues = selectedProject.issues.filter((issue) => {
    if (fixedIssues.has(issue.id)) return false;
    if (severityFilter !== "all" && issue.severity !== severityFilter) return false;
    if (categoryFilter !== "all" && issue.category !== categoryFilter) return false;
    return true;
  });

  const totalScore = Math.round(
    100 - ((selectedProject.issues.length - fixedIssues.size) / Math.max(selectedProject.issues.length, 1)) * 35
  );

  const criticalCount = activeIssues.filter((i) => i.severity === "critical").length;
  const majorCount = activeIssues.filter((i) => i.severity === "major").length;
  const minorCount = activeIssues.filter((i) => i.severity === "minor").length;

  const categoryStats = Object.entries(categoryConfig).map(([key, config]) => {
    const total = selectedProject.issues.filter((i) => i.category === key).length;
    const open = activeIssues.filter((i) => i.category === key).length;
    const pct = total > 0 ? Math.round(((total - open) / total) * 100) : 100;
    return { key, ...config, total, open, percentage: pct };
  }).filter((c) => c.total > 0);

  const renderHighlightedText = () => {
    const text = documentTexts[currentPage] || "";
    const lines = text.split("\n");
    const pageActiveIssues = activeIssues.filter((i) => i.page === currentPage);

    return lines.map((line, lineIdx) => {
      if (!line.trim()) return <div key={lineIdx} className="h-3" />;

      const isMainHeading = /^\d+\.\s/.test(line) && !/^\d+\.\d+/.test(line);
      const isSubHeading = /^\d+\.\d+\s/.test(line);

      if (isMainHeading) {
        return (
          <p key={lineIdx} className="text-[15px] text-[#1e1e2e] mt-5 mb-2" style={{ fontWeight: 600 }}>
            {line}
          </p>
        );
      }
      if (isSubHeading) {
        return (
          <p key={lineIdx} className="text-[14px] text-[#1e1e2e] mt-4 mb-1" style={{ fontWeight: 500 }}>
            {line}
          </p>
        );
      }

      let segments: React.ReactNode[] = [];
      let remaining = line;
      let segIdx = 0;

      for (const issue of pageActiveIssues) {
        const idx = remaining.indexOf(issue.textHighlight);
        if (idx !== -1) {
          if (idx > 0) {
            segments.push(<span key={segIdx++}>{remaining.slice(0, idx)}</span>);
          }
          const catConf = categoryConfig[issue.category];
          const sevConf = severityConfig[issue.severity];
          segments.push(
            <Tooltip key={segIdx++}>
              <TooltipTrigger asChild>
                <span
                  className="cursor-pointer px-0.5 rounded transition-all duration-200 hover:opacity-80"
                  style={{
                    backgroundColor: `${catConf.color}12`,
                    borderBottom: `2px solid ${catConf.color}`,
                    color: selectedIssue === issue.id ? catConf.color : undefined,
                  }}
                  onClick={() => setSelectedIssue(issue.id)}
                >
                  {issue.textHighlight}
                </span>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-[320px]">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="secondary" className="text-[10px] px-1" style={{ backgroundColor: catConf.bg, color: catConf.color, fontWeight: 600 }}>{catConf.label}</Badge>
                  <Badge variant="secondary" className="text-[10px] px-1" style={{ backgroundColor: sevConf.bg, color: sevConf.color, fontWeight: 600 }}>{sevConf.label}</Badge>
                </div>
                <p className="text-[12px]" style={{ fontWeight: 500 }}>{issue.title}</p>
                <p className="text-[11px] opacity-80 mt-0.5">{issue.rule}</p>
              </TooltipContent>
            </Tooltip>
          );
          remaining = remaining.slice(idx + issue.textHighlight.length);
        }
      }

      if (remaining) {
        segments.push(<span key={segIdx++}>{remaining}</span>);
      }
      if (segments.length === 0) {
        segments = [<span key={0}>{line}</span>];
      }

      return (
        <p key={lineIdx} className="text-[13px] text-[#475569] leading-[1.85]">
          {segments}
        </p>
      );
    });
  };

  return (
    <TooltipProvider>
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="px-8 py-4 border-b border-border bg-white flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setPhase("project-select");
                  setSelectedProject(null);
                  setDocumentTexts({});
                  setFixedIssues(new Set());
                }}
                className="text-muted-foreground gap-1"
              >
                <ArrowLeft className="w-4 h-4" />Projekte
              </Button>
              <div className="flex items-start gap-3 min-w-0">
                {PROJECT_LOGO_BY_ID[selectedProject.id] ? (
                  <div className="w-11 h-11 rounded-xl border border-border bg-white flex items-center justify-center shrink-0 shadow-sm">
                    <img
                      src={PROJECT_LOGO_BY_ID[selectedProject.id]}
                      alt=""
                      className="max-w-[36px] max-h-[36px] object-contain"
                      loading="lazy"
                    />
                  </div>
                ) : (
                  <div className="w-11 h-11 rounded-xl bg-[#f1f5f9] flex items-center justify-center shrink-0 border border-border">
                    <FolderOpen className="w-5 h-5 text-[#64748b]" />
                  </div>
                )}
                <div className="min-w-0">
                  <h2 className="text-[#1e1e2e]">Requirements Review</h2>
                  <p className="text-[13px] text-muted-foreground mt-0.5">
                    {selectedProject.name} – {selectedProject.document.split("–")[0].trim()}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-white border border-border">
                <div className="relative w-12 h-12">
                  <svg className="w-12 h-12 -rotate-90" viewBox="0 0 48 48">
                    <circle cx="24" cy="24" r="20" fill="none" stroke="#e2e8f0" strokeWidth="4" />
                    <circle cx="24" cy="24" r="20" fill="none" stroke={totalScore >= 80 ? "#10b981" : totalScore >= 60 ? "#f59e0b" : "#ef4444"} strokeWidth="4" strokeDasharray={`${(totalScore / 100) * 125.6} 125.6`} strokeLinecap="round" />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-[13px]" style={{ fontWeight: 700 }}>{totalScore}</span>
                </div>
                <div>
                  <p className="text-[12px] text-muted-foreground">Compliance Score</p>
                  <p className="text-[14px] text-[#1e1e2e]" style={{ fontWeight: 600 }}>
                    {totalScore >= 80 ? "Gut" : totalScore >= 60 ? "Verbesserungsbedarf" : "Kritisch"}
                  </p>
                </div>
              </div>
              {fixLog.length > 0 && (
                <Button
                  variant="outline"
                  className={`text-[13px] gap-2 ${showFixLog ? "border-[#4f46e5] bg-[#f1f0ff]" : ""}`}
                  onClick={() => setShowFixLog(!showFixLog)}
                >
                  <ClipboardList className="w-4 h-4" />
                  Änderungslog ({fixLog.length})
                </Button>
              )}
              <Button
                variant="outline"
                className="text-[13px] gap-2"
                onClick={() => navigate("/rules")}
              >
                <BookOpen className="w-4 h-4" />
                Regeln
              </Button>
              <Button
                variant="outline"
                className="text-[13px] gap-2"
                onClick={() => { setExportScope("compliance"); setShowExportDialog(true); }}
              >
                <FileText className="w-4 h-4" />
                Export
              </Button>
              <Button className="bg-[#4f46e5] hover:bg-[#4338ca] text-white gap-2 text-[13px]" onClick={handleAutoFixAll}>
                <Wand2 className="w-4 h-4" />Alle auto-korrigieren
              </Button>
            </div>
          </div>
        </div>

        {/* Fix Audit Log */}
        {showFixLog && fixLog.length > 0 && (
          <div className="border-b border-border bg-[#fafbfc] px-8 py-3 flex-shrink-0 max-h-[220px] overflow-y-auto">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <ClipboardList className="w-4 h-4 text-[#4f46e5]" />
                <p className="text-[13px] text-[#1e1e2e]" style={{ fontWeight: 600 }}>
                  Änderungsprotokoll
                </p>
                <Badge variant="secondary" className="text-[10px] bg-[#f1f0ff] text-[#4f46e5]">{fixLog.length} Einträge</Badge>
              </div>
              <Button variant="ghost" size="sm" className="text-[11px] h-6 gap-1 text-muted-foreground" onClick={() => setShowFixLog(false)}>
                Ausblenden <ChevronUp className="w-3 h-3" />
              </Button>
            </div>
            <div className="space-y-1.5">
              {fixLog.map((entry) => {
                const catConf = categoryConfig[entry.category];
                return (
                  <div key={entry.id} className="flex items-start gap-3 p-2.5 rounded-lg bg-white border border-border">
                    <div className="w-6 h-6 rounded flex items-center justify-center flex-shrink-0 mt-0.5" style={{ backgroundColor: catConf.bg }}>
                      <catConf.icon className="w-3 h-3" style={{ color: catConf.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                        <span className="text-[11px] text-[#4f46e5]" style={{ fontWeight: 600 }}>{entry.issueId}</span>
                        <span className="text-[12px] text-[#1e1e2e] truncate" style={{ fontWeight: 500 }}>{entry.issueTitle}</span>
                      </div>
                      <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{entry.timestamp}</span>
                        <span>{entry.appliedBy}</span>
                        <span style={{ color: catConf.color }}>{catConf.label}</span>
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-1">
                        Regel: <span style={{ fontWeight: 500 }}>{entry.rule}</span>
                      </p>
                    </div>
                    <Badge variant="secondary" className="text-[9px] px-1.5 bg-[#d1fae5] text-[#10b981] flex-shrink-0">
                      Angewendet
                    </Badge>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Split Screen */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left: Document Editor with Pagination */}
          <div className="flex-1 overflow-y-auto p-6 flex flex-col">
            <Card className="border border-border bg-white flex-1 flex flex-col">
              <CardHeader className="pb-3 border-b border-border flex-shrink-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-[#4f46e5]" />
                    <CardTitle className="text-[14px]" style={{ fontWeight: 600 }}>
                      Anforderungsdokument
                    </CardTitle>
                    <Badge variant="secondary" className="text-[11px] bg-[#f1f0ff] text-[#4f46e5]">
                      {selectedProject.pages[currentPage - 1]?.title}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 text-[12px] text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#ef4444]" /> {criticalCount} Kritisch
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b]" /> {majorCount} Wichtig
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#94a3b8]" /> {minorCount} Gering
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6 flex-1 overflow-y-auto">
                {renderHighlightedText()}
              </CardContent>

              {/* Page Navigation */}
              <div className="px-6 py-3 border-t border-border bg-[#fafbfc] flex items-center justify-between flex-shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-[12px] gap-1"
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  Vorherige
                </Button>

                <div className="flex items-center gap-2">
                  {selectedProject.pages.map((p) => {
                    const pageIssueCount = activeIssues.filter((i) => i.page === p.pageNum).length;
                    return (
                      <button
                        key={p.pageNum}
                        onClick={() => setCurrentPage(p.pageNum)}
                        className={`w-8 h-8 rounded-lg flex items-center justify-center text-[12px] transition-all relative ${
                          currentPage === p.pageNum
                            ? "bg-[#4f46e5] text-white shadow-sm"
                            : "bg-white border border-border text-[#475569] hover:bg-[#f1f5f9]"
                        }`}
                        style={{ fontWeight: currentPage === p.pageNum ? 600 : 400 }}
                      >
                        {p.pageNum}
                        {pageIssueCount > 0 && currentPage !== p.pageNum && (
                          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#ef4444] text-white text-[9px] flex items-center justify-center" style={{ fontWeight: 600 }}>
                            {pageIssueCount}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-[12px] text-muted-foreground">
                    Seite {currentPage} von {totalPages}
                    {currentPageIssues.length > 0 && (
                      <span className="text-[#ef4444] ml-1">
                        ({currentPageIssues.length} Probleme auf dieser Seite)
                      </span>
                    )}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-[12px] gap-1"
                    disabled={currentPage >= totalPages}
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  >
                    Nächste
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          {/* Right: Review Panel */}
          <div className="w-[440px] overflow-y-auto bg-[#fafbfc] border-l border-border flex-shrink-0">
            {/* Category Breakdown */}
            <div className="p-5 border-b border-border">
              <h4 className="text-[13px] text-[#1e1e2e] mb-3" style={{ fontWeight: 600 }}>Kategorien-Übersicht</h4>
              <div className="space-y-2.5">
                {categoryStats.map((cat) => (
                  <button
                    key={cat.key}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all text-left ${
                      categoryFilter === cat.key ? "bg-white border border-[#4f46e5]/30 shadow-sm" : "hover:bg-white/80"
                    }`}
                    onClick={() => setCategoryFilter(categoryFilter === cat.key ? "all" : cat.key)}
                  >
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: cat.bg }}>
                      <cat.icon className="w-3.5 h-3.5" style={{ color: cat.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-[12px] text-[#1e1e2e] truncate" style={{ fontWeight: 500 }}>{cat.label}</span>
                        <span className="text-[11px] text-muted-foreground ml-2">{cat.open}/{cat.total} offen</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-[#e2e8f0] overflow-hidden">
                        <div className="h-full rounded-full transition-all" style={{ width: `${cat.percentage}%`, backgroundColor: cat.percentage === 100 ? "#10b981" : cat.color }} />
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Issue List */}
            <div className="p-5">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-[14px] text-[#1e1e2e]" style={{ fontWeight: 600 }}>Erkannte Probleme</h4>
                <span className="text-[12px] text-muted-foreground">{filteredIssues.length} Probleme</span>
              </div>

              {/* Severity Filter */}
              <div className="flex items-center gap-2 mb-4">
                {[
                  { key: "all", label: "Alle", count: activeIssues.length },
                  { key: "critical", label: "Kritisch", count: criticalCount },
                  { key: "major", label: "Wichtig", count: majorCount },
                  { key: "minor", label: "Gering", count: minorCount },
                ].map((f) => (
                  <button
                    key={f.key}
                    onClick={() => setSeverityFilter(f.key)}
                    className={`px-2 py-1 rounded-lg text-[11px] transition-colors flex items-center gap-1 ${
                      severityFilter === f.key
                        ? "bg-[#4f46e5] text-white"
                        : "bg-white border border-border text-[#475569] hover:bg-[#f1f5f9]"
                    }`}
                    style={{ fontWeight: 500 }}
                  >
                    {f.label}
                    <span
                      className={`text-[10px] px-1 py-0.5 rounded-full ${
                        severityFilter === f.key ? "bg-white/20 text-white" : "bg-[#f1f5f9] text-muted-foreground"
                      }`}
                      style={{ fontWeight: 600 }}
                    >
                      {f.count}
                    </span>
                  </button>
                ))}
              </div>

              {categoryFilter !== "all" && (
                <div className="flex items-center gap-2 mb-3">
                  <Badge
                    variant="secondary"
                    className="text-[11px] gap-1 cursor-pointer hover:bg-[#e2e8f0]"
                    style={{
                      backgroundColor: categoryConfig[categoryFilter as IssueCategory]?.bg,
                      color: categoryConfig[categoryFilter as IssueCategory]?.color,
                    }}
                    onClick={() => setCategoryFilter("all")}
                  >
                    {categoryConfig[categoryFilter as IssueCategory]?.label}
                    <X className="w-3 h-3" />
                  </Badge>
                </div>
              )}

              {/* Issues */}
              <div className="space-y-3">
                {filteredIssues.map((issue) => {
                  const sevConf = severityConfig[issue.severity];
                  const catConf = categoryConfig[issue.category];
                  const isSelected = selectedIssue === issue.id;
                  return (
                    <Card
                      key={issue.id}
                      className={`border bg-white cursor-pointer transition-all duration-200 ${
                        isSelected ? "ring-2 ring-[#4f46e5]/30 shadow-sm" : "hover:shadow-sm"
                      }`}
                      style={{ borderColor: isSelected ? "#4f46e5" : `${catConf.color}25` }}
                      onClick={() => {
                        setSelectedIssue(isSelected ? null : issue.id);
                        if (issue.page !== currentPage) setCurrentPage(issue.page);
                      }}
                    >
                      <CardContent className="p-3.5">
                        <div className="flex items-start gap-2.5">
                          <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: catConf.bg }}>
                            <catConf.icon className="w-3.5 h-3.5" style={{ color: catConf.color }} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                              <Badge variant="secondary" className="text-[9px] px-1" style={{ backgroundColor: catConf.bg, color: catConf.color, fontWeight: 600 }}>{catConf.label}</Badge>
                              <Badge variant="secondary" className="text-[9px] px-1" style={{ backgroundColor: sevConf.bg, color: sevConf.color, fontWeight: 600 }}>{sevConf.label}</Badge>
                              <span className="text-[10px] text-muted-foreground">§ {issue.section}</span>
                              <Badge variant="secondary" className="text-[9px] px-1 bg-[#f1f5f9] text-[#64748b]">S.{issue.page}</Badge>
                            </div>
                            <p className="text-[13px] text-[#1e1e2e] mb-1" style={{ fontWeight: 500 }}>{issue.title}</p>
                            <p className="text-[11px] text-muted-foreground mb-2">{issue.description}</p>

                            <div className="px-2 py-1 rounded bg-[#f8fafc] border border-[#e2e8f0] mb-2.5 inline-block">
                              <p className="text-[10px] text-muted-foreground">
                                <span style={{ fontWeight: 500 }}>Regel:</span> {issue.rule}
                              </p>
                            </div>

                            {showSuggestion === issue.id && (
                              <div className="p-3 rounded-lg bg-[#d1fae5]/50 border border-[#10b981]/20 mb-2.5">
                                <p className="text-[10px] text-[#10b981] mb-1" style={{ fontWeight: 600 }}>Verbesserungsvorschlag</p>
                                <p className="text-[12px] text-[#475569]">{issue.suggestion}</p>
                              </div>
                            )}

                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                className="text-[10px] h-6 bg-[#4f46e5] hover:bg-[#4338ca] text-white gap-1 px-2"
                                onClick={(e) => { e.stopPropagation(); setAutoFixDialog(issue); }}
                              >
                                <Wand2 className="w-3 h-3" />Auto-Fix
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-[10px] h-6 gap-1 px-2"
                                onClick={(e) => { e.stopPropagation(); setShowSuggestion(showSuggestion === issue.id ? null : issue.id); }}
                              >
                                {showSuggestion === issue.id ? <><X className="w-3 h-3" />Ausblenden</> : <><Eye className="w-3 h-3" />Vorschlag</>}
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}

                {filteredIssues.length === 0 && (
                  <div className="text-center py-8">
                    <CheckCircle2 className="w-10 h-10 text-[#10b981] mx-auto mb-3" />
                    <p className="text-[14px] text-[#1e1e2e]" style={{ fontWeight: 500 }}>
                      {activeIssues.length === 0 ? "Alle Probleme behoben!" : "Keine Treffer für diesen Filter."}
                    </p>
                    <p className="text-[12px] text-muted-foreground mt-1">
                      {activeIssues.length === 0
                        ? "Das Dokument entspricht den Compliance-Regeln."
                        : "Passen Sie die Filter an, um weitere Probleme zu sehen."}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Auto-Fix Dialog */}
        <Dialog open={!!autoFixDialog} onOpenChange={() => setAutoFixDialog(null)}>
          <DialogContent className="sm:max-w-[560px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Wand2 className="w-5 h-5 text-[#4f46e5]" />Automatische Korrektur
              </DialogTitle>
              <DialogDescription>
                Die KI hat einen Verbesserungsvorschlag generiert. Prüfen Sie die Änderung und übernehmen Sie sie in das Dokument.
              </DialogDescription>
            </DialogHeader>
            {autoFixDialog && (
              <div className="my-4 space-y-4">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="secondary" className="text-[11px] px-1.5" style={{ backgroundColor: categoryConfig[autoFixDialog.category]?.bg, color: categoryConfig[autoFixDialog.category]?.color, fontWeight: 600 }}>
                    {categoryConfig[autoFixDialog.category]?.label}
                  </Badge>
                  <Badge variant="secondary" className="text-[11px] px-1.5" style={{ backgroundColor: severityConfig[autoFixDialog.severity]?.bg, color: severityConfig[autoFixDialog.severity]?.color, fontWeight: 600 }}>
                    {severityConfig[autoFixDialog.severity]?.label}
                  </Badge>
                  <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                    <BookOpen className="w-3.5 h-3.5" />{autoFixDialog.rule}
                  </span>
                  <Badge variant="secondary" className="text-[10px] px-1.5 bg-[#f1f5f9] text-[#64748b]">Seite {autoFixDialog.page}</Badge>
                </div>
                <p className="text-[13px] text-[#475569]">{autoFixDialog.description}</p>
                <div className="p-4 rounded-lg bg-[#fef2f2] border border-[#ef4444]/20">
                  <div className="flex items-center gap-2 mb-2">
                    <XCircle className="w-4 h-4 text-[#ef4444]" />
                    <p className="text-[12px] text-[#ef4444]" style={{ fontWeight: 600 }}>Vorher</p>
                  </div>
                  <p className="text-[13px] text-[#475569] bg-white/60 rounded px-3 py-2 border border-[#ef4444]/10">{autoFixDialog.before}</p>
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
                  <p className="text-[13px] text-[#475569] bg-white/60 rounded px-3 py-2 border border-[#10b981]/10">{autoFixDialog.after}</p>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setAutoFixDialog(null)}>Abbrechen</Button>
              <Button className="bg-[#4f46e5] hover:bg-[#4338ca] text-white gap-2" onClick={() => {
                if (autoFixDialog) handleAutoFix(autoFixDialog);
                setAutoFixDialog(null);
              }}>
                <Wand2 className="w-4 h-4" />Korrektur übernehmen
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
}
