import {
  AlertCircle,
  AlertTriangle,
  Info,
  Layers,
  Lock,
  MessageSquare,
  Scale,
  ShieldCheck,
} from "lucide-react";
import { PROJECT_SEARCH_META, PROJECT_WORKSPACE } from "./workspaces";


export type GuidelinesPhase = "project-select" | "review";

export interface ProjectData {
  id: string;
  name: string;
  description: string;
  document: string;
  /** Demo: angezeigter Dateiname (Inhalt wie alle anderen Demo-Lastenhefte). */
  sourceFileName: string;
  lastReview: string;
  stories: number;
  status: string;
  statusColor: string;
  pages: DocumentPage[];
  issues: GuidelineFinding[];
}

export interface DocumentPage {
  pageNum: number;
  title: string;
  content: string;
}

export type IssueSeverity = "critical" | "major" | "minor";
export type IssueCategory = "dsgvo" | "legal" | "corporate" | "style" | "ambiguity" | "structure";

export interface GuidelineFinding {
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

export const categoryConfig: Record<IssueCategory, { label: string; icon: typeof AlertCircle; color: string; bg: string }> = {
  dsgvo: { label: "DSGVO-Verletzung", icon: Lock, color: "#dc2626", bg: "#fef2f2" },
  legal: { label: "Rechtlicher Verstoß", icon: Scale, color: "#9333ea", bg: "#faf5ff" },
  corporate: { label: "Unternehmensstandard", icon: ShieldCheck, color: "#ea580c", bg: "#fff7ed" },
  style: { label: "Stilistischer Fehler", icon: MessageSquare, color: "#0284c7", bg: "#f0f9ff" },
  ambiguity: { label: "Mehrdeutigkeit", icon: AlertTriangle, color: "#d97706", bg: "#fffbeb" },
  structure: { label: "Strukturproblem", icon: Layers, color: "#64748b", bg: "#f8fafc" },
};

export const severityConfig: Record<IssueSeverity, { label: string; color: string; bg: string; icon: typeof AlertCircle }> = {
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

const projectA_Issues: GuidelineFinding[] = [
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

/** Rotierende Demo-Dateinamen für Guidelines / Verlauf (Inhalt im Prototyp gleich). */
export const GUIDELINES_DEMO_SOURCE_FILES = [
  "Lastenheft_v2.3.pdf",
  "Pflichtenheft_ENTWURF.docx",
  "Anforderungen_KundeRev2.pdf",
  "Spezifikation_Telematik.pdf",
  "LH_Backend_Integration_v1.pdf",
  "Security_Anhang_signed.pdf",
  "UX_Spezifikation_Wireframes.pdf",
  "ReleaseNotes_Anhang.docx",
  "API_Contract_OpenAPI.pdf",
  "Datenschutz_Folgenabschaetzung.pdf",
  "Testkonzept_System.pdf",
  "Migration_Roadmap_Q3.pdf",
  "Voice_Assistant_Specs.pdf",
  "OTA_Update_Policy.pdf",
  "Flotten_Dashboard_Requirements.pdf",
] as const;

export function guidelinesDemoFileLabelForIndex(index: number): string {
  return GUIDELINES_DEMO_SOURCE_FILES[
    index % GUIDELINES_DEMO_SOURCE_FILES.length
  ];
}

/** Eindeutiger Demo-Dateiname pro beliebigem Seed (z. B. Lauf-ID + Projekt). */
export function guidelinesDemoFileLabelFromSeed(seed: string): string {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return GUIDELINES_DEMO_SOURCE_FILES[h % GUIDELINES_DEMO_SOURCE_FILES.length];
}

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

export function buildAllComplianceProjects(): ProjectData[] {
  return COMPLIANCE_PROJECT_IDS.map((id, index) => {
    const meta = PROJECT_SEARCH_META[id];
    return {
      id,
      name: meta.name,
      description: meta.description,
      document: "Lastenheft (Auszug) – Prototyp-Guidelines",
      sourceFileName: guidelinesDemoFileLabelForIndex(index),
      lastReview: "—",
      stories: 120,
      status: "Aktiv" as const,
      statusColor: "#4f46e5",
      pages: projectA_Pages,
      issues: projectA_Issues,
    };
  });
}

export function getComplianceProjectsForWorkspace(workspaceId: string): ProjectData[] {
  return buildAllComplianceProjects().filter(
    (p) => PROJECT_WORKSPACE[p.id] === workspaceId,
  );
}

/** Titel des Lastenhefts (vor „–“) und optionaler Zusatz für Unterzeilen. */
export function splitDocumentDisplayLabel(documentField: string): {
  title: string;
  detail?: string;
} {
  const idx = documentField.indexOf("–");
  if (idx === -1) return { title: documentField.trim() };
  return {
    title: documentField.slice(0, idx).trim(),
    detail: documentField.slice(idx + 1).trim(),
  };
}

export interface FixLogEntry {
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
