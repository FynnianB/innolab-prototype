/* ------------------------------------------------------------------ */
/*  Unified story data for the prototype                               */
/* ------------------------------------------------------------------ */

export interface Story {
  id: string;
  title: string;
  description: string;
  type: "Story" | "Epic" | "Bug" | "Task";
  status: "Draft" | "To Do" | "In Review" | "In Progress" | "Approved" | "Done";
  priority: "Hoch" | "Mittel" | "Niedrig";
  effort: "Niedrig" | "Mittel" | "Hoch";
  project: string;
  tags: string[];
  source: "ai-generated" | "jira-import" | "manual";

  // Requirements-specific (AI-generated stories)
  role?: string;
  goal?: string;
  benefit?: string;
  acceptance?: string[];
  complianceScore?: number;
  complianceChecks?: { label: string; description: string; passed: boolean }[];
  acQuality?: { criterion: string; score: number; suggestion: string }[];
  suggestions?: string[];

  // Jira-specific (imported tickets)
  assignee?: string;
  sprint?: string;
  storyPoints?: number;
}

/** @deprecated Use Story instead */
export type StoryData = Story;
/** @deprecated Use Story instead */
export type JiraTicketData = Story;

export interface TicketRelation {
  id: string;
  sourceId: string;
  targetId: string;
  type: "depends_on" | "related_to" | "blocks" | "duplicates";
  confidence: number;
  description: string;
}

/* ------------------------------------------------------------------ */
/*  Story data                                                         */
/* ------------------------------------------------------------------ */

export const allStories: Story[] = [
  {
    id: "US-001",
    title: "Benutzer-Authentifizierung via SSO",
    description:
      "As a Unternehmensadministrator, I want to mich über Single Sign-On (SSO) anmelden können, so that ich keinen separaten Login benötige und die Sicherheitsrichtlinien eingehalten werden.",
    type: "Story",
    role: "Unternehmensadministrator",
    goal: "mich über Single Sign-On (SSO) anmelden können",
    benefit:
      "ich keinen separaten Login benötige und die Sicherheitsrichtlinien eingehalten werden",
    acceptance: [
      "SSO-Integration mit Azure AD und Okta ist verfügbar",
      "Session-Timeout nach 15 Minuten Inaktivität für administrative Accounts, 30 Minuten für Standard-Benutzer",
      "Multi-Faktor-Authentifizierung wird unterstützt",
      "Fehlermeldung bei ungültigen Credentials innerhalb von 2 Sekunden",
    ],
    effort: "Hoch",
    priority: "Hoch",
    status: "In Progress",
    project: "Automobil-Plattform Redesign",
    tags: ["Authentifizierung", "Sicherheit"],
    source: "ai-generated",
    complianceScore: 100,
    complianceChecks: [
      {
        label: 'User Story Format ("As a... I want... so that...")',
        description: "Story follows the standard user story format.",
        passed: true,
      },
      {
        label: "Has Acceptance Criteria",
        description: "4 acceptance criteria defined.",
        passed: true,
      },
      {
        label: "ACs Follow Given/When/Then Format",
        description:
          "All acceptance criteria follow the Given/When/Then pattern.",
        passed: true,
      },
      {
        label: "ACs Are Specific (No Vague Language)",
        description: "Acceptance criteria use specific, unambiguous language.",
        passed: true,
      },
      {
        label: "Title Is Concise and Descriptive",
        description: "Title is appropriately concise and descriptive.",
        passed: true,
      },
      {
        label: "Description Has Appropriate Detail",
        description:
          "Description provides sufficient context without being overly verbose.",
        passed: true,
      },
    ],
    acQuality: [
      {
        criterion: "SSO-Integration mit Azure AD und Okta ist verfügbar",
        score: 90,
        suggestion:
          "Add measurable criteria (e.g., supported protocols, timeout values).",
      },
      {
        criterion: "Session-Timeout nach 15 Min (Admin), 30 Min (Standard)",
        score: 95,
        suggestion: "Well-defined with specific values.",
      },
      {
        criterion: "Multi-Faktor-Authentifizierung wird unterstützt",
        score: 80,
        suggestion: "Specify supported MFA methods (TOTP, SMS, hardware keys).",
      },
      {
        criterion:
          "Fehlermeldung bei ungültigen Credentials innerhalb von 2 Sekunden",
        score: 90,
        suggestion: "Consider adding max retry limits.",
      },
    ],
    suggestions: [
      "This ticket is well-structured. Consider adding non-functional requirements (performance, security) if applicable.",
    ],
  },
  {
    id: "US-002",
    title: "Dashboard-Personalisierung",
    description:
      "As a Endbenutzer, I want to mein Dashboard individuell anpassen können, so that ich die für mich konfigurierten KPI-Metriken, Projektstatusupdates und priorisierte Benachrichtigungen auf einen Blick sehe.",
    type: "Story",
    role: "Endbenutzer",
    goal: "mein Dashboard individuell anpassen können",
    benefit:
      "ich die für mich konfigurierten KPI-Metriken, Projektstatusupdates und priorisierte Benachrichtigungen auf einen Blick sehe",
    acceptance: [
      "Widgets können per Drag & Drop angeordnet werden",
      "Mindestens 8 verschiedene Widget-Typen verfügbar",
      "Layout wird benutzerspezifisch gespeichert",
      "Standard-Layout mit 6 vordefinierten Widgets für neue Benutzer",
    ],
    effort: "Mittel",
    priority: "Mittel",
    status: "Draft",
    project: "Automobil-Plattform Redesign",
    tags: ["Frontend", "Dashboard"],
    source: "ai-generated",
    complianceScore: 85,
    complianceChecks: [
      {
        label: 'User Story Format ("As a... I want... so that...")',
        description: "Story follows the standard user story format.",
        passed: true,
      },
      {
        label: "Has Acceptance Criteria",
        description: "4 acceptance criteria defined.",
        passed: true,
      },
      {
        label: "ACs Follow Given/When/Then Format",
        description: "Not all ACs follow the Given/When/Then pattern.",
        passed: false,
      },
      {
        label: "ACs Are Specific (No Vague Language)",
        description: "Acceptance criteria use specific, unambiguous language.",
        passed: true,
      },
      {
        label: "Title Is Concise and Descriptive",
        description: "Title is appropriately concise and descriptive.",
        passed: true,
      },
      {
        label: "Description Has Appropriate Detail",
        description: "Description provides sufficient context.",
        passed: true,
      },
    ],
    acQuality: [
      {
        criterion: "Widgets können per Drag & Drop angeordnet werden",
        score: 75,
        suggestion: "Add keyboard accessibility alternative.",
      },
      {
        criterion: "Mindestens 8 verschiedene Widget-Typen verfügbar",
        score: 85,
        suggestion: "Add max limit and loading time.",
      },
      {
        criterion: "Layout wird benutzerspezifisch gespeichert",
        score: 90,
        suggestion: "Specify sync behavior across devices.",
      },
      {
        criterion: "Standard-Layout mit 6 vordefinierten Widgets",
        score: 85,
        suggestion: "Define which widgets are in the default set.",
      },
    ],
    suggestions: [
      "Consider specifying accessibility requirements for the drag-and-drop interface.",
    ],
  },
  {
    id: "US-003",
    title: "Echtzeit-Benachrichtigungen",
    description:
      "As a Projektmanager, I want to Echtzeit-Benachrichtigungen bei Statusänderungen erhalten, so that ich sofort reagieren kann und keine wichtigen Updates verpasse.",
    type: "Story",
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
    status: "In Review",
    project: "Automobil-Plattform Redesign",
    tags: ["Notifications", "WebSocket"],
    source: "ai-generated",
    complianceScore: 92,
    complianceChecks: [
      {
        label: "User Story Format",
        description: "Story follows the standard format.",
        passed: true,
      },
      {
        label: "Has Acceptance Criteria",
        description: "3 acceptance criteria defined.",
        passed: true,
      },
      {
        label: "ACs Follow Given/When/Then Format",
        description: "ACs follow the pattern.",
        passed: true,
      },
      {
        label: "ACs Are Specific",
        description: "Criteria use specific language.",
        passed: true,
      },
      {
        label: "Title Is Concise",
        description: "Title is concise.",
        passed: true,
      },
      {
        label: "Description Has Appropriate Detail",
        description: "Description is detailed.",
        passed: true,
      },
    ],
    acQuality: [
      {
        criterion: "Push via WebSocket mit Reconnect",
        score: 90,
        suggestion: "Define fallback mechanism.",
      },
      {
        criterion: "Konfigurierbare Regeln",
        score: 85,
        suggestion: "Specify default rules.",
      },
      {
        criterion: "Benachrichtigungshistorie 90 Tage",
        score: 80,
        suggestion: "Add pagination and search.",
      },
    ],
    suggestions: [],
  },
  {
    id: "US-004",
    title: "Datenexport in Standardformate",
    description:
      "As a Business Analyst, I want to Analysedaten in CSV, PDF und Excel exportieren können, so that ich die Daten in externen Tools weiterverarbeiten kann.",
    type: "Story",
    role: "Business Analyst",
    goal: "Analysedaten in CSV, PDF und Excel exportieren können",
    benefit: "ich die Daten in externen Tools weiterverarbeiten kann",
    acceptance: [
      "Export-Formate: CSV, PDF, XLSX",
      "Maximale Export-Größe: 100.000 Datensätze pro Einzelexport",
      "Export-Job läuft asynchron mit Fortschrittsanzeige",
      "E-Mail-Benachrichtigung bei Abschluss",
    ],
    effort: "Mittel",
    priority: "Mittel",
    status: "Approved",
    project: "Automobil-Plattform Redesign",
    tags: ["Export", "Reports"],
    source: "ai-generated",
    complianceScore: 88,
    complianceChecks: [
      {
        label: "User Story Format",
        description: "Follows standard format.",
        passed: true,
      },
      {
        label: "Has Acceptance Criteria",
        description: "4 criteria defined.",
        passed: true,
      },
      {
        label: "ACs Are Specific",
        description: "Criteria are specific.",
        passed: true,
      },
      { label: "Title Is Concise", description: "Good title.", passed: true },
      {
        label: "Description Has Appropriate Detail",
        description: "Adequate detail.",
        passed: true,
      },
      {
        label: "ACs Follow Given/When/Then Format",
        description: "Not all follow pattern.",
        passed: false,
      },
    ],
    acQuality: [
      {
        criterion: "Export-Formate: CSV, PDF, XLSX",
        score: 85,
        suggestion: "Specify encoding and delimiter options.",
      },
      {
        criterion: "Max 100.000 Datensätze pro Export",
        score: 90,
        suggestion: "Well-defined limit.",
      },
      {
        criterion: "Asynchroner Export mit Fortschrittsanzeige",
        score: 85,
        suggestion: "Add cancel option.",
      },
      {
        criterion: "E-Mail-Benachrichtigung bei Abschluss",
        score: 80,
        suggestion: "Add in-app notification as alternative.",
      },
    ],
    suggestions: [
      "Consider adding batch-export functionality for larger datasets.",
    ],
  },
  {
    id: "US-005",
    title: "Audit-Trail für alle Änderungen",
    description:
      "As a Compliance-Beauftragter, I want to einen vollständigen Audit-Trail aller Systemänderungen einsehen können, so that regulatorische Anforderungen erfüllt werden.",
    type: "Story",
    role: "Compliance-Beauftragter",
    goal: "einen vollständigen Audit-Trail aller Systemänderungen einsehen können",
    benefit:
      "regulatorische Anforderungen erfüllt werden und Änderungen nachvollziehbar sind",
    acceptance: [
      "Alle CRUD-Operationen werden protokolliert",
      "Audit-Daten sind unveränderlich (Append-Only)",
      "Filterung nach Benutzer, Zeitraum und Aktion",
      "Aufbewahrungsdauer: 7 Jahre für steuerrelevante Daten",
    ],
    effort: "Hoch",
    priority: "Hoch",
    status: "In Progress",
    project: "Healthcare Portal DSGVO",
    tags: ["Audit", "Compliance"],
    source: "ai-generated",
    complianceScore: 95,
    complianceChecks: [
      {
        label: "User Story Format",
        description: "Follows format.",
        passed: true,
      },
      {
        label: "Has Acceptance Criteria",
        description: "4 criteria.",
        passed: true,
      },
      {
        label: "ACs Follow Given/When/Then Format",
        description: "Good format.",
        passed: true,
      },
      { label: "ACs Are Specific", description: "Specific.", passed: true },
      { label: "Title Is Concise", description: "Good.", passed: true },
      {
        label: "Description Has Appropriate Detail",
        description: "Detailed.",
        passed: true,
      },
    ],
    acQuality: [
      {
        criterion: "Alle CRUD-Operationen protokolliert",
        score: 90,
        suggestion: "Well-defined.",
      },
      {
        criterion: "Append-Only Audit-Daten",
        score: 95,
        suggestion: "Excellent immutability requirement.",
      },
      {
        criterion: "Filterung nach Benutzer, Zeitraum, Aktion",
        score: 85,
        suggestion: "Add export option for filtered results.",
      },
      {
        criterion: "7 Jahre Aufbewahrung",
        score: 90,
        suggestion: "Matches regulatory requirements.",
      },
    ],
    suggestions: [],
  },
  {
    id: "US-006",
    title: "Rollenbasierte Zugriffskontrolle",
    description:
      "As a Systemadministrator, I want to Benutzerrollen mit granularen Berechtigungen definieren können, so that das Prinzip der minimalen Rechtevergabe umgesetzt wird.",
    type: "Story",
    role: "Systemadministrator",
    goal: "Benutzerrollen mit granularen Berechtigungen definieren können",
    benefit: "das Prinzip der minimalen Rechtevergabe umgesetzt wird",
    acceptance: [
      "5 vordefinierte Rollen: Administrator, Projektleiter, Requirements Engineer, Reviewer, Auditor",
      "Benutzerdefinierte Rollen erstellbar mit 4-Augen-Prinzip",
      "Berechtigungen auf Modul- und Aktionsebene",
    ],
    effort: "Hoch",
    priority: "Hoch",
    status: "Draft",
    project: "Banking App v3.2 Migration",
    tags: ["RBAC", "Sicherheit"],
    source: "ai-generated",
    complianceScore: 90,
    complianceChecks: [
      {
        label: "User Story Format",
        description: "Follows format.",
        passed: true,
      },
      {
        label: "Has Acceptance Criteria",
        description: "3 criteria.",
        passed: true,
      },
      {
        label: "ACs Are Specific",
        description: "Specific language.",
        passed: true,
      },
      { label: "Title Is Concise", description: "Good title.", passed: true },
      {
        label: "Description Has Appropriate Detail",
        description: "Good detail.",
        passed: true,
      },
      {
        label: "ACs Follow Given/When/Then Format",
        description: "Partially.",
        passed: false,
      },
    ],
    acQuality: [
      {
        criterion: "5 vordefinierte Rollen",
        score: 85,
        suggestion: "Consider role hierarchy.",
      },
      {
        criterion: "4-Augen-Prinzip",
        score: 90,
        suggestion: "Well-defined governance.",
      },
      {
        criterion: "Berechtigungen auf Modul- und Aktionsebene",
        score: 80,
        suggestion: "Add permission matrix reference.",
      },
    ],
    suggestions: ["Consider adding SoD (Separation of Duties) checks."],
  },
  {
    id: "US-007",
    title: "Automatisierte Regressionstests",
    description:
      "As a QA-Engineer, I want to automatisierte Regressionstests bei jedem Deployment ausführen können, so that die Softwarequalität sichergestellt wird.",
    type: "Story",
    role: "QA-Engineer",
    goal: "automatisierte Regressionstests bei jedem Deployment ausführen können",
    benefit: "die Softwarequalität kontinuierlich sichergestellt wird",
    acceptance: [
      "CI/CD-Pipeline führt automatisierte Tests bei jedem Merge-Request aus",
      "Testabdeckung muss mindestens 80% betragen",
      "Testergebnisse werden im Dashboard visualisiert",
      "Fehlgeschlagene Tests blockieren das Deployment",
    ],
    effort: "Mittel",
    priority: "Hoch",
    status: "In Progress",
    project: "Automobil-Plattform Redesign",
    tags: ["Testing", "CI/CD"],
    source: "ai-generated",
    complianceScore: 88,
    complianceChecks: [
      { label: "User Story Format", description: "Good format.", passed: true },
      {
        label: "Has Acceptance Criteria",
        description: "4 criteria.",
        passed: true,
      },
      { label: "ACs Are Specific", description: "Specific.", passed: true },
      { label: "Title Is Concise", description: "Concise.", passed: true },
      {
        label: "Description Has Appropriate Detail",
        description: "Good.",
        passed: true,
      },
      {
        label: "ACs Follow Given/When/Then Format",
        description: "Partially.",
        passed: false,
      },
    ],
    acQuality: [
      {
        criterion: "CI/CD-Pipeline Tests bei Merge-Request",
        score: 90,
        suggestion: "Good CI/CD integration.",
      },
      {
        criterion: "Testabdeckung 80%",
        score: 85,
        suggestion: "Define coverage types (line, branch).",
      },
      {
        criterion: "Dashboard-Visualisierung",
        score: 75,
        suggestion: "Specify trend view requirements.",
      },
      {
        criterion: "Deployment-Blockierung",
        score: 90,
        suggestion: "Good quality gate.",
      },
    ],
    suggestions: ["Consider adding performance test thresholds."],
  },
  {
    id: "US-010",
    title: "SEPA-Überweisungen in Echtzeit",
    description:
      "As a Bankkunde, I want to SEPA-Überweisungen in Echtzeit durchführen können, so that Geldtransfers sofort beim Empfänger eingehen und ich nicht auf Bankarbeitstage warten muss.",
    type: "Story",
    role: "Bankkunde",
    goal: "SEPA-Überweisungen in Echtzeit durchführen können",
    benefit:
      "Geldtransfers sofort beim Empfänger eingehen und ich nicht auf Bankarbeitstage warten muss",
    acceptance: [
      "SEPA Instant Payment gemäß SCT Inst Scheme innerhalb von 10 Sekunden",
      "Transaktionslimit: 100.000 EUR pro Einzeltransaktion",
      "Echtzeit-Statusanzeige mit Fortschrittsindikator",
      "Fallback auf Standard-SEPA bei Nicht-Verfügbarkeit mit Benutzerhinweis",
    ],
    effort: "Mittel",
    priority: "Hoch",
    status: "In Progress",
    project: "Banking App v3.2 Migration",
    tags: ["Payment", "SEPA", "Echtzeit"],
    source: "ai-generated",
    complianceScore: 94,
    complianceChecks: [
      {
        label: 'User Story Format ("As a... I want... so that...")',
        description: "Story follows the standard user story format.",
        passed: true,
      },
      {
        label: "Has Acceptance Criteria",
        description: "4 acceptance criteria defined.",
        passed: true,
      },
      {
        label: "ACs Follow Given/When/Then Format",
        description: "All ACs follow the pattern.",
        passed: true,
      },
      {
        label: "ACs Are Specific (No Vague Language)",
        description: "Criteria are specific with measurable values.",
        passed: true,
      },
      {
        label: "Title Is Concise and Descriptive",
        description: "Title is concise.",
        passed: true,
      },
      {
        label: "Description Has Appropriate Detail",
        description: "Good detail level.",
        passed: true,
      },
    ],
    acQuality: [
      {
        criterion: "SCT Inst innerhalb von 10 Sekunden",
        score: 95,
        suggestion: "Well-defined with specific protocol and timing.",
      },
      {
        criterion: "Transaktionslimit 100.000 EUR",
        score: 90,
        suggestion: "Consider daily cumulative limit.",
      },
      {
        criterion: "Echtzeit-Statusanzeige",
        score: 85,
        suggestion: "Specify push notification for completion.",
      },
      {
        criterion: "Fallback auf Standard-SEPA",
        score: 90,
        suggestion: "Good degradation strategy.",
      },
    ],
    suggestions: [
      "Consider adding fraud-detection checks for real-time transactions.",
    ],
  },
  {
    id: "US-011",
    title: "Biometrische Authentifizierung",
    description:
      "As a App-Benutzer, I want to mich per Fingerabdruck oder Face-ID anmelden können, so that der Login-Prozess schnell und sicher ist ohne Passwörter eingeben zu müssen.",
    type: "Story",
    role: "App-Benutzer",
    goal: "mich per Fingerabdruck oder Face-ID anmelden können",
    benefit:
      "der Login-Prozess schnell und sicher ist ohne Passwörter eingeben zu müssen",
    acceptance: [
      "Touch ID und Face ID auf iOS, Fingerprint und Face Unlock auf Android",
      "Fallback auf PIN-Eingabe bei fehlgeschlagener biometrischer Erkennung",
      "Biometrische Daten werden ausschließlich lokal auf dem Gerät gespeichert",
      "Re-Authentifizierung bei sicherheitskritischen Aktionen (z.B. Überweisungen > 1.000 EUR)",
    ],
    effort: "Mittel",
    priority: "Hoch",
    status: "Approved",
    project: "Banking App v3.2 Migration",
    tags: ["Authentifizierung", "Biometrie", "Mobile"],
    source: "ai-generated",
    complianceScore: 89,
    complianceChecks: [
      {
        label: 'User Story Format ("As a... I want... so that...")',
        description: "Story follows the standard format.",
        passed: true,
      },
      {
        label: "Has Acceptance Criteria",
        description: "4 acceptance criteria defined.",
        passed: true,
      },
      {
        label: "ACs Follow Given/When/Then Format",
        description: "ACs follow the pattern.",
        passed: true,
      },
      {
        label: "ACs Are Specific (No Vague Language)",
        description: "Criteria are specific.",
        passed: true,
      },
      {
        label: "Title Is Concise and Descriptive",
        description: "Concise title.",
        passed: true,
      },
      {
        label: "Description Has Appropriate Detail",
        description: "Not all security aspects covered.",
        passed: false,
      },
    ],
    acQuality: [
      {
        criterion: "Touch ID / Face ID / Fingerprint / Face Unlock",
        score: 90,
        suggestion: "Good cross-platform coverage.",
      },
      {
        criterion: "Fallback auf PIN-Eingabe",
        score: 85,
        suggestion: "Specify max retry attempts before lockout.",
      },
      {
        criterion: "Lokale Speicherung biometrischer Daten",
        score: 95,
        suggestion: "Excellent privacy-by-design approach.",
      },
      {
        criterion: "Re-Authentifizierung bei kritischen Aktionen",
        score: 85,
        suggestion: "Define full list of critical actions.",
      },
    ],
    suggestions: [
      "Consider specifying compliance with FIDO2/WebAuthn standards.",
    ],
  },
  /* Capgemini DACH — Kunden als Projekte */
  {
    id: "US-012",
    title: "Echtzeit-Störungsampel im Reisenden-Navigator",
    description:
      "As a Reisender, I want auf einen Blick zu sehen, ob meine geplante Verbindung pünktlich oder eingeschränkt ist, so that ich rechtzeitig Alternativen planen kann.",
    type: "Story",
    role: "Reisender",
    goal: "Störungs- und Pünktlichkeitsstatus ohne manuelles Aktualisieren zu sehen",
    benefit: "ich rechtzeitig Umstiege oder andere Verbindungen einplanen kann",
    acceptance: [
      "Ampel-Status (grün/gelb/rot) pro Teilstrecke basierend auf IRIS-API-Latenzen < 3 s",
      "Bei Rot: konkrete Ersatzvorschläge mit maximal 2 Umstiegen anzeigen",
      "Offline-Hinweis wenn Daten älter als 5 Minuten",
      "Barrierefrei: Status zusätzlich als Text und nicht nur Farbe",
    ],
    effort: "Hoch",
    priority: "Hoch",
    status: "In Progress",
    project: "Deutsche Bahn — Reisenden-Navigator 2.0",
    tags: ["Mobilität", "Echtzeit", "Barrierefreiheit"],
    source: "ai-generated",
    complianceScore: 86,
    complianceChecks: [
      { label: "User Story Format", description: "Format ok.", passed: true },
      { label: "Has Acceptance Criteria", description: "4 ACs.", passed: true },
      { label: "ACs Are Specific", description: "Zeitwerte genannt.", passed: true },
      { label: "Title Is Concise", description: "Ok.", passed: true },
    ],
    acQuality: [
      { criterion: "IRIS-Latenzen < 3 s", score: 88, suggestion: "Fallback bei Timeout spezifizieren." },
      { criterion: "Ersatzvorschläge max. 2 Umstiege", score: 82, suggestion: "Peak-Zeiten erwähnen." },
    ],
    suggestions: ["Abstimmung mit Touch&Travel-Pilot-Strecken dokumentieren."],
  },
  {
    id: "US-013",
    title: "Barrierefreie Reiseketten-Ansicht (Screenreader)",
    description:
      "As a Reisender mit Sehbeeinträchtigung, I want die gesamte Reisekette linear und vollständig per Screenreader erfahren, so that ich Anschlüsse und Gleiswechsel sicher bewältige.",
    type: "Story",
    role: "Reisender mit Sehbeeinträchtigung",
    goal: "Reisekette vollständig per Screenreader nutzen zu können",
    benefit: "Anschlüsse und Gleisinformationen zuverlässig erfahre",
    acceptance: [
      "WCAG 2.2 AA für alle Schritte der Reisekette",
      "Gleis- und Wagenpositions-Hinweise in logischer Lesereihenfolge",
      "Keine rein farbcodierten Pflichtinformationen",
      "Fokus-Management bei dynamischen Updates (Verspätung)",
    ],
    effort: "Hoch",
    priority: "Hoch",
    status: "In Review",
    project: "Deutsche Bahn — Reisenden-Navigator 2.0",
    tags: ["A11y", "WCAG", "Mobilität"],
    source: "ai-generated",
    complianceScore: 91,
    complianceChecks: [
      { label: "User Story Format", description: "Ok.", passed: true },
      { label: "Has Acceptance Criteria", description: "4 ACs.", passed: true },
      { label: "ACs Are Specific", description: "WCAG-Version genannt.", passed: true },
    ],
    acQuality: [
      { criterion: "WCAG 2.2 AA", score: 90, suggestion: "Testprotokoll mit NVDA/JAWS referenzieren." },
    ],
    suggestions: [],
  },
  {
    id: "US-014",
    title: "KFZ-Schaden FNOL mit Foto-Upload und KI-Vorschaden",
    description:
      "As a Versicherungsnehmer, I want einen KFZ-Schaden in wenigen Minuten mit Fotos melden zu können, so that die Bearbeitung ohne Papierkram startet.",
    type: "Story",
    role: "Versicherungsnehmer",
    goal: "Schaden digital mit Medien erfassen zu können",
    benefit: "die Regulierung schneller und transparenter abläuft",
    acceptance: [
      "Bis 12 Fotos, max. 25 MB gesamt, Virenscan vor Speicherung",
      "KI schlägt Schadenkategorie vor (editierbar durch Kunden)",
      "Einwilligung DSGVO Art. 6/9 nachvollziehbar protokolliert",
      "Vorgangsnummer sofort per E-Mail und in der App",
    ],
    effort: "Hoch",
    priority: "Hoch",
    status: "In Progress",
    project: "Allianz — Schaden-FNOL Portal",
    tags: ["Insurance", "FNOL", "DSGVO"],
    source: "ai-generated",
    complianceScore: 93,
    complianceChecks: [
      { label: "User Story Format", description: "Ok.", passed: true },
      { label: "Has Acceptance Criteria", description: "4 ACs.", passed: true },
      { label: "ACs Are Specific", description: "Limits genannt.", passed: true },
    ],
    acQuality: [
      { criterion: "DSGVO-Einwilligung", score: 92, suggestion: "Widerruf im gleichen Flow." },
    ],
    suggestions: ["Abgleich mit Kernsystem-Timeout für Medien-Upload."],
  },
  {
    id: "US-015",
    title: "Push-Benachrichtigung bei Schadenstatusänderung",
    description:
      "As a Versicherungsnehmer, I want über wesentliche Statuswechsel informiert zu werden, so that ich keine E-Mails verpassen muss.",
    type: "Story",
    role: "Versicherungsnehmer",
    goal: "Push bei Statusänderung (z. B. Gutachter zugewiesen) zu erhalten",
    benefit: "ich den Prozess verfolgen kann ohne Portal zu prüfen",
    acceptance: [
      "Opt-in für Push, jederzeit in den Einstellungen deaktivierbar",
      "Maximal 1 Push pro Statuswechsel, keine Werbe-Pushes",
      "Deep-Link öffnet Vorgang im FNOL-Portal",
      "Quiet Hours 22–07 Uhr respektieren (Zusammenfassung morgens)",
    ],
    effort: "Mittel",
    priority: "Mittel",
    status: "To Do",
    project: "Allianz — Schaden-FNOL Portal",
    tags: ["Notifications", "Mobile"],
    source: "ai-generated",
    complianceScore: 87,
    complianceChecks: [
      { label: "User Story Format", description: "Ok.", passed: true },
      { label: "Has Acceptance Criteria", description: "4 ACs.", passed: true },
    ],
    acQuality: [
      { criterion: "Quiet Hours", score: 80, suggestion: "Zeitzone Kunde vs. Server klären." },
    ],
    suggestions: [],
  },
  {
    id: "US-016",
    title: "Verbrauchs-Ampel und Monatsbudget im Kundenportal",
    description:
      "As a Energiekunde, I want meinen aktuellen Verbrauch gegen mein selbst gesetztes Budget zu sehen, so that ich frühzeitig sparen oder anpassen kann.",
    type: "Story",
    role: "Energiekunde (Privat)",
    goal: "Verbrauch und Budget in einer Ampel-Übersicht zu sehen",
    benefit: "ich Kosten besser steuern kann",
    acceptance: [
      "Tages-, Wochen- und Monatsansicht mit Smart-Meter-Daten (15-Min-Raster)",
      "Budget überschritten: Hinweis + Link zu Spar-Tipps",
      "Datenexport CSV für Verbraucher",
      "Hinweis wenn Smart Meter noch nicht ausgerollt (Schätzung markiert)",
    ],
    effort: "Mittel",
    priority: "Hoch",
    status: "In Progress",
    project: "EnBW — MeinEnBW Transformation",
    tags: ["Energy", "Smart Meter", "B2C"],
    source: "ai-generated",
    complianceScore: 89,
    complianceChecks: [
      { label: "User Story Format", description: "Ok.", passed: true },
      { label: "Has Acceptance Criteria", description: "4 ACs.", passed: true },
    ],
    acQuality: [
      { criterion: "15-Min-Raster", score: 85, suggestion: "SLA Datenlieferant MDM erwähnen." },
    ],
    suggestions: [],
  },
  {
    id: "US-017",
    title: "Marktlage-Preiswechsel ohne Kundenservice-Anruf",
    description:
      "As a Energiekunde, I want zwischen dynamischer Marktlage und Festpreis wechseln zu können, so that ich flexibel auf Marktentwicklungen reagieren kann.",
    type: "Story",
    role: "Energiekunde (Privat)",
    goal: "Tarifwechsel vollständig digital und rechtsverbindlich abschließen zu können",
    benefit: "ich keinen Callcenter-Kontakt brauche",
    acceptance: [
      "Wechsel nur nach transparentem Preisvergleich (PDF-Bestätigung)",
      "Widerrufsbelehrung und Fristen BGB-konform",
      "Bestätigung per SMS-TAN oder qualifizierter Signatur",
      "Übergangsdatum max. 6 Wochen in die Zukunft wählbar",
    ],
    effort: "Hoch",
    priority: "Hoch",
    status: "In Review",
    project: "EnBW — MeinEnBW Transformation",
    tags: ["Tarif", "Compliance", "B2C"],
    source: "ai-generated",
    complianceScore: 94,
    complianceChecks: [
      { label: "User Story Format", description: "Ok.", passed: true },
      { label: "Has Acceptance Criteria", description: "4 ACs.", passed: true },
      { label: "ACs Are Specific", description: "Fristen genannt.", passed: true },
    ],
    acQuality: [
      { criterion: "Widerrufsbelehrung", score: 93, suggestion: "Juristische Freigabe referenzieren." },
    ],
    suggestions: [],
  },
  {
    id: "US-018",
    title: "Once-Only: Antragsdaten aus BAYERN-ID übernehmen",
    description:
      "As a Bürgerin, I want bereits bei BAYERN-ID gespeicherte Stammdaten in einen Antrag übernehmen zu können, so that ich keine Doppeleingaben machen muss.",
    type: "Story",
    role: "Bürgerin",
    goal: "Stammdaten aus BAYERN-ID in Anträge zu übernehmen",
    benefit: "Anträge schneller und fehlerärmer ausfüllen kann",
    acceptance: [
      "OAuth/OIDC-Flow mit BAYERN-ID gemäß Leitfaden IT-Dienstleister",
      "Übernommene Felder editierbar mit Hinweis auf Quelle",
      "Keine Speicherung ohne erneute Einwilligung pro Antrag",
      "Audit-Log: welche Felder wann aus ID übernommen wurden",
    ],
    effort: "Hoch",
    priority: "Hoch",
    status: "In Progress",
    project: "Freistaat Bayern — Bürgerportal Suite",
    tags: ["eGovernment", "BAYERN-ID", "Once-Only"],
    source: "ai-generated",
    complianceScore: 95,
    complianceChecks: [
      { label: "User Story Format", description: "Ok.", passed: true },
      { label: "Has Acceptance Criteria", description: "4 ACs.", passed: true },
      { label: "ACs Are Specific", description: "Audit-Log gefordert.", passed: true },
    ],
    acQuality: [
      { criterion: "OAuth/OIDC BAYERN-ID", score: 92, suggestion: "Version des Leitfadens angeben." },
    ],
    suggestions: ["Abgleich mit Gemeinde-Schnittstellen (Föderalismus)."],
  },
  {
    id: "US-019",
    title: "Filial-Lagerbestand für Click&Collect in Echtzeit",
    description:
      "As a Kundin, I want sehen ob mein Wunschartikel in der gewählten Filiale verfügbar ist, so that ich zuverlässig reservieren oder abholen kann.",
    type: "Story",
    role: "Kundin",
    goal: "Filialbestand live vor Reservierung sehen zu können",
    benefit: "keine leeren Fahrten zur Filiale mache",
    acceptance: [
      "Bestandsabfrage < 2 s p95 unter normaler Last",
      "Unterscheidung: im Regal vs. im Hochregal (nur für Personal sichtbar)",
      "Reservierung hält Artikel mindestens 4 Stunden",
      "Bei Diskrepanz: Kunde erhält Ersatzvorschlag oder nächste Filiale",
    ],
    effort: "Hoch",
    priority: "Hoch",
    status: "Draft",
    project: "REWE digital — Filialbestand Echtzeit",
    tags: ["Retail", "Omnichannel", "OMS"],
    source: "ai-generated",
    complianceScore: 78,
    complianceChecks: [
      { label: "User Story Format", description: "Ok.", passed: true },
      { label: "Has Acceptance Criteria", description: "4 ACs.", passed: true },
      { label: "ACs Are Specific", description: "SLA p95 genannt.", passed: true },
    ],
    acQuality: [
      { criterion: "p95 < 2 s", score: 75, suggestion: "Lasttest-Szenario definieren." },
    ],
    suggestions: ["Event-Sourcing vs. Polling mit OMS-Team abstimmen."],
  },
  // Jira-imported stories
  {
    id: "PROJ-101",
    title: "SSO-Authentifizierung mit Azure AD implementieren",
    description:
      "Implementierung der SSO-Anbindung an Azure Active Directory für die Automobil-Plattform.",
    type: "Story",
    status: "In Progress",
    priority: "Hoch",
    effort: "Hoch",
    project: "Automobil-Plattform Redesign",
    tags: ["SSO", "Azure AD"],
    source: "jira-import",
    assignee: "M. Schmidt",
    sprint: "Sprint 43",
    storyPoints: 13,
  },
  {
    id: "PROJ-102",
    title: "Dashboard Widget-Framework aufbauen",
    description:
      "Aufbau eines modularen Widget-Frameworks für das Plattform-Dashboard.",
    type: "Epic",
    status: "To Do",
    priority: "Mittel",
    effort: "Hoch",
    project: "Automobil-Plattform Redesign",
    tags: ["Dashboard", "Framework"],
    source: "jira-import",
    assignee: "L. Weber",
    sprint: "Sprint 44",
    storyPoints: 21,
  },
  {
    id: "PROJ-145",
    title: "Push-Notification Service einrichten",
    description:
      "Einrichtung eines Push-Notification-Dienstes für Echtzeit-Benachrichtigungen.",
    type: "Story",
    status: "In Review",
    priority: "Mittel",
    effort: "Mittel",
    project: "Automobil-Plattform Redesign",
    tags: ["Notifications", "Push"],
    source: "jira-import",
    assignee: "K. Fischer",
    sprint: "Sprint 43",
    storyPoints: 8,
  },
  {
    id: "PROJ-156",
    title: "CSV/PDF Export für Reports",
    description: "Export-Funktionalität für Reports in CSV- und PDF-Format.",
    type: "Story",
    status: "Done",
    priority: "Niedrig",
    effort: "Niedrig",
    project: "Automobil-Plattform Redesign",
    tags: ["Export", "Reports"],
    source: "jira-import",
    assignee: "A. Braun",
    sprint: "Sprint 42",
    storyPoints: 5,
  },
  {
    id: "PROJ-200",
    title: "Rollen- und Berechtigungskonzept",
    description:
      "Erarbeitung des Rollen- und Berechtigungskonzepts für die Banking App.",
    type: "Epic",
    status: "To Do",
    priority: "Hoch",
    effort: "Hoch",
    project: "Banking App v3.2 Migration",
    tags: ["RBAC", "Konzept"],
    source: "jira-import",
    assignee: "S. Müller",
    sprint: "Backlog",
    storyPoints: 34,
  },
  {
    id: "PROJ-210",
    title: "Audit-Log Viewer Komponente",
    description:
      "UI-Komponente zur Anzeige und Filterung von Audit-Log-Einträgen.",
    type: "Task",
    status: "In Progress",
    priority: "Mittel",
    effort: "Niedrig",
    project: "Healthcare Portal DSGVO",
    tags: ["Audit", "UI"],
    source: "jira-import",
    assignee: "T. Hoffmann",
    sprint: "Sprint 43",
    storyPoints: 5,
  },
  {
    id: "PROJ-089",
    title: "Okta SSO Integration (Legacy)",
    description: "Legacy-Integration der Okta SSO-Authentifizierung.",
    type: "Story",
    status: "Done",
    priority: "Niedrig",
    effort: "Mittel",
    project: "Automobil-Plattform Redesign",
    tags: ["SSO", "Okta", "Legacy"],
    source: "jira-import",
    assignee: "M. Schmidt",
    sprint: "Sprint 38",
    storyPoints: 8,
  },
  {
    id: "PROJ-220",
    title: "Automatisierte E2E Tests mit Playwright",
    description:
      "Implementierung automatisierter End-to-End Tests mit Playwright.",
    type: "Story",
    status: "In Progress",
    priority: "Hoch",
    effort: "Hoch",
    project: "Automobil-Plattform Redesign",
    tags: ["Testing", "E2E", "Playwright"],
    source: "jira-import",
    assignee: "P. Richter",
    sprint: "Sprint 43",
    storyPoints: 13,
  },
  {
    id: "PROJ-301",
    title: "Mobile-App Offline Sync",
    description:
      "Offline-Synchronisations-Funktionalität für die Mobile Banking App.",
    type: "Epic",
    status: "To Do",
    priority: "Mittel",
    effort: "Hoch",
    project: "Banking App v3.2 Migration",
    tags: ["Mobile", "Offline", "Sync"],
    source: "jira-import",
    assignee: "Nicht zugewiesen",
    sprint: "Backlog",
    storyPoints: 21,
  },
  {
    id: "PROJ-315",
    title: "Performance-Monitoring Dashboard",
    description:
      "Dashboard zur Überwachung der Anwendungsperformance in Echtzeit.",
    type: "Task",
    status: "To Do",
    priority: "Niedrig",
    effort: "Mittel",
    project: "Automobil-Plattform Redesign",
    tags: ["Performance", "Monitoring"],
    source: "jira-import",
    assignee: "L. Weber",
    sprint: "Sprint 44",
    storyPoints: 8,
  },
  {
    id: "PROJ-330",
    title: "API Rate Limiting implementieren",
    description:
      "Implementierung von Rate Limiting für alle öffentlichen API-Endpunkte.",
    type: "Story",
    status: "In Progress",
    priority: "Mittel",
    effort: "Niedrig",
    project: "Banking App v3.2 Migration",
    tags: ["API", "Security"],
    source: "jira-import",
    assignee: "T. Hoffmann",
    sprint: "Sprint 43",
    storyPoints: 5,
  },
  {
    id: "PROJ-401",
    title: "SEPA Instant Payment Gateway Integration",
    description:
      "Integration des SEPA Instant Payment Gateways für Echtzeit-Überweisungen.",
    type: "Story",
    status: "In Progress",
    priority: "Hoch",
    effort: "Hoch",
    project: "Banking App v3.2 Migration",
    tags: ["SEPA", "Payment", "Gateway"],
    source: "jira-import",
    assignee: "B. Weber",
    sprint: "Sprint 43",
    storyPoints: 13,
  },
  {
    id: "PROJ-410",
    title: "Biometrische Login-Komponente (iOS/Android)",
    description:
      "Cross-Platform biometrische Login-Komponente für iOS und Android.",
    type: "Story",
    status: "In Review",
    priority: "Hoch",
    effort: "Mittel",
    project: "Banking App v3.2 Migration",
    tags: ["Biometrie", "Mobile", "Login"],
    source: "jira-import",
    assignee: "K. Fischer",
    sprint: "Sprint 44",
    storyPoints: 8,
  },
  {
    id: "PROJ-501",
    title: "Touch&Travel Backend — Belegvalidierung",
    description:
      "Microservice zur Validierung von digitalen Fahrscheinen im Pilotkorridor; Anbindung an zentrale Abrechnung.",
    type: "Story",
    status: "In Progress",
    priority: "Hoch",
    effort: "Hoch",
    project: "Deutsche Bahn — Reisenden-Navigator 2.0",
    tags: ["Touch&Travel", "Backend", "PKI"],
    source: "jira-import",
    assignee: "S. Richter",
    sprint: "Sprint Cap-12",
    storyPoints: 13,
  },
  {
    id: "PROJ-502",
    title: "Guidewire ClaimCenter — FNOL Event-Mapping",
    description:
      "Mapping der FNOL-Domain-Events auf Guidewire-APIs (Policy, Claim, Exposure).",
    type: "Epic",
    status: "To Do",
    priority: "Hoch",
    effort: "Hoch",
    project: "Allianz — Schaden-FNOL Portal",
    tags: ["Guidewire", "Integration"],
    source: "jira-import",
    assignee: "L. Brenner",
    sprint: "Backlog",
    storyPoints: 21,
  },
  {
    id: "PROJ-503",
    title: "MDM — Smart-Meter Messwert-Normalisierung",
    description:
      "ETL-Pipeline für 15-Minuten-Zählerstände inkl. Plausibilitätsprüfung und fehlende Werte.",
    type: "Story",
    status: "In Review",
    priority: "Mittel",
    effort: "Mittel",
    project: "EnBW — MeinEnBW Transformation",
    tags: ["MDM", "Smart Meter", "ETL"],
    source: "jira-import",
    assignee: "T. Hoffmann",
    sprint: "Sprint Cap-11",
    storyPoints: 8,
  },
  {
    id: "PROJ-504",
    title: "FIM / BAYERN-ID — Testmandanten Absicherung",
    description:
      "Härtung der Testumgebung: Zertifikatsrotation, IP-Allowlist, Logging gemäß Landesvorgaben.",
    type: "Task",
    status: "In Progress",
    priority: "Mittel",
    effort: "Niedrig",
    project: "Freistaat Bayern — Bürgerportal Suite",
    tags: ["Security", "BAYERN-ID"],
    source: "jira-import",
    assignee: "M. König",
    sprint: "Sprint Cap-12",
    storyPoints: 5,
  },
  {
    id: "PROJ-505",
    title: "OMS — Filialbestand Event-Stream (Kafka)",
    description:
      "Consumer für Filial-Lager-Events; Konsistenzregeln gegen Online-Warenkorb.",
    type: "Story",
    status: "To Do",
    priority: "Hoch",
    effort: "Hoch",
    project: "REWE digital — Filialbestand Echtzeit",
    tags: ["Kafka", "OMS", "Retail"],
    source: "jira-import",
    assignee: "Nicht zugewiesen",
    sprint: "Backlog",
    storyPoints: 13,
  },
];

/* ------------------------------------------------------------------ */
/*  Relations                                                          */
/* ------------------------------------------------------------------ */

export const allRelations: TicketRelation[] = [
  {
    id: "R-001",
    sourceId: "US-001",
    targetId: "PROJ-101",
    type: "related_to",
    confidence: 92,
    description:
      "Hohe thematische Überschneidung im Bereich SSO/Azure AD. Beide Stories behandeln Authentifizierung.",
  },
  {
    id: "R-002",
    sourceId: "US-001",
    targetId: "PROJ-089",
    type: "duplicates",
    confidence: 78,
    description:
      "PROJ-089 (Legacy Okta SSO) könnte US-001 teilweise abdecken. Scope-Prüfung empfohlen.",
  },
  {
    id: "R-003",
    sourceId: "US-001",
    targetId: "US-006",
    type: "depends_on",
    confidence: 85,
    description:
      "SSO-Authentifizierung hängt von der rollenbasierten Zugriffskontrolle ab.",
  },
  {
    id: "R-004",
    sourceId: "US-002",
    targetId: "PROJ-102",
    type: "related_to",
    confidence: 85,
    description:
      "Dashboard Widget-Framework ist die technische Basis für die Personalisierung.",
  },
  {
    id: "R-005",
    sourceId: "US-002",
    targetId: "PROJ-315",
    type: "related_to",
    confidence: 65,
    description:
      "Performance-Monitoring Dashboard teilt UI-Komponenten mit der Personalisierung.",
  },
  {
    id: "R-006",
    sourceId: "US-003",
    targetId: "PROJ-145",
    type: "related_to",
    confidence: 88,
    description:
      "Push-Notification Service ist die technische Grundlage für Echtzeit-Benachrichtigungen.",
  },
  {
    id: "R-007",
    sourceId: "US-004",
    targetId: "PROJ-156",
    type: "related_to",
    confidence: 90,
    description:
      "CSV/PDF Export deckt einen Teil der Exportanforderungen ab. XLSX und Batch fehlen.",
  },
  {
    id: "R-008",
    sourceId: "US-005",
    targetId: "PROJ-210",
    type: "depends_on",
    confidence: 82,
    description: "Audit-Trail benötigt die Audit-Log Viewer Komponente als UI.",
  },
  {
    id: "R-009",
    sourceId: "US-006",
    targetId: "PROJ-200",
    type: "related_to",
    confidence: 88,
    description:
      "Rollen- und Berechtigungskonzept ist direkt verwandt mit der Zugriffskontrolle.",
  },
  {
    id: "R-010",
    sourceId: "US-007",
    targetId: "PROJ-220",
    type: "related_to",
    confidence: 92,
    description:
      "E2E Tests mit Playwright sind Teil der automatisierten Regressionstests.",
  },
  {
    id: "R-011",
    sourceId: "US-001",
    targetId: "US-005",
    type: "related_to",
    confidence: 70,
    description:
      "Authentifizierung und Audit-Trail teilen Sicherheitsanforderungen.",
  },
  {
    id: "R-012",
    sourceId: "US-003",
    targetId: "US-002",
    type: "related_to",
    confidence: 60,
    description:
      "Benachrichtigungen können als Dashboard-Widget dargestellt werden.",
  },
  {
    id: "R-013",
    sourceId: "PROJ-101",
    targetId: "PROJ-089",
    type: "related_to",
    confidence: 75,
    description:
      "Beide Stories behandeln SSO-Integration, PROJ-089 ist der Legacy-Vorgänger.",
  },
  {
    id: "R-014",
    sourceId: "US-004",
    targetId: "US-005",
    type: "related_to",
    confidence: 55,
    description:
      "Export-Funktionalität und Audit-Trail teilen Datenabfrage-Patterns.",
  },
  {
    id: "R-015",
    sourceId: "PROJ-330",
    targetId: "PROJ-101",
    type: "related_to",
    confidence: 60,
    description: "API Rate Limiting betrifft auch SSO-Endpunkte.",
  },
  {
    id: "R-016",
    sourceId: "US-010",
    targetId: "PROJ-401",
    type: "related_to",
    confidence: 94,
    description:
      "SEPA Instant Payment Gateway ist die technische Implementierung der Echtzeit-Überweisungen.",
  },
  {
    id: "R-017",
    sourceId: "US-010",
    targetId: "PROJ-330",
    type: "related_to",
    confidence: 65,
    description:
      "API Rate Limiting betrifft auch Payment-Endpunkte für SEPA Instant.",
  },
  {
    id: "R-018",
    sourceId: "US-011",
    targetId: "PROJ-410",
    type: "related_to",
    confidence: 91,
    description:
      "Biometrische Login-Komponente implementiert die Authentifizierungsanforderungen.",
  },
  {
    id: "R-019",
    sourceId: "US-011",
    targetId: "US-001",
    type: "related_to",
    confidence: 72,
    description:
      "Biometrische Authentifizierung ergänzt die SSO-Authentifizierung auf mobilen Geräten.",
  },
  {
    id: "R-020",
    sourceId: "US-010",
    targetId: "US-011",
    type: "related_to",
    confidence: 68,
    description:
      "Echtzeit-Überweisungen erfordern biometrische Re-Authentifizierung bei hohen Beträgen.",
  },
  /* Capgemini-DACH Workspace (DB, Allianz, EnBW, Bayern, REWE) */
  {
    id: "R-021",
    sourceId: "US-012",
    targetId: "PROJ-501",
    type: "depends_on",
    confidence: 88,
    description:
      "Die Störungsampel benötigt valide, zeitnahe Fahrplan- und Störungsdaten aus dem Touch&Travel-/Backend-Pfad; ohne stabile Beleg- und Status-Schnittstelle keine belastbare Ampel.",
  },
  {
    id: "R-022",
    sourceId: "PROJ-501",
    targetId: "US-012",
    type: "blocks",
    confidence: 84,
    description:
      "Pilot-Belegvalidierung noch nicht für alle Korridore ausgerollt — Release der Ampel an Produkt abgestellt, bis p95-Latenzen der Validierung bestätigt sind.",
  },
  {
    id: "R-023",
    sourceId: "US-012",
    targetId: "US-013",
    type: "related_to",
    confidence: 79,
    description:
      "Gleiche Reisekontext-APIs: Ampel-Status muss für Screenreader als Text ausgegeben werden (WCAG), nicht nur farbcodiert.",
  },
  {
    id: "R-024",
    sourceId: "US-013",
    targetId: "PROJ-501",
    type: "related_to",
    confidence: 72,
    description:
      "Dynamische Gleis- und Wagenpositions-Updates hängen an denselben Echtzeit-Fahrplan-Deltas wie das Touch&Travel-Backend.",
  },
  {
    id: "R-025",
    sourceId: "US-014",
    targetId: "PROJ-502",
    type: "depends_on",
    confidence: 91,
    description:
      "FNOL inkl. KI-Vorschaden und Vorgangsnummer setzt das Guidewire ClaimCenter Event-Mapping (Policy/Claim/Exposure) voraus.",
  },
  {
    id: "R-026",
    sourceId: "PROJ-502",
    targetId: "US-014",
    type: "blocks",
    confidence: 86,
    description:
      "Go-Live des Foto-FNOL blockiert, bis kritische Exposure-Felder im Mapping freigegeben sind (Workshop mit Kernsystem).",
  },
  {
    id: "R-027",
    sourceId: "US-015",
    targetId: "US-014",
    type: "depends_on",
    confidence: 83,
    description:
      "Push bei Statuswechsel setzt einen durchgängig geführten Schaden-Vorgang voraus (Vorgangsnummer, konsistente Status-Codes).",
  },
  {
    id: "R-028",
    sourceId: "US-015",
    targetId: "PROJ-502",
    type: "related_to",
    confidence: 74,
    description:
      "Push-Payload und Deep-Link müssen dieselben Status-Übergänge abbilden wie das FNOL-Backend und Guidewire.",
  },
  {
    id: "R-029",
    sourceId: "US-016",
    targetId: "PROJ-503",
    type: "depends_on",
    confidence: 90,
    description:
      "Verbrauchs-Ampel und Monatsbudget benötigen normalisierte 15-Minuten-Messwerte aus der MDM-ETL-Pipeline (Plausibilisierung, Lückenfüllung).",
  },
  {
    id: "R-030",
    sourceId: "PROJ-503",
    targetId: "US-016",
    type: "blocks",
    confidence: 81,
    description:
      "Release der Ampel an UX gekoppelt: ohne stabile MDM-Lieferung keine belastbare Budget-Gegenüberstellung.",
  },
  {
    id: "R-031",
    sourceId: "US-017",
    targetId: "US-016",
    type: "related_to",
    confidence: 77,
    description:
      "Tarifwechsel und Budget-Ampel teilen Kundenstamm, Zählerpunkt und Darstellung von Verbrauchshistorie.",
  },
  {
    id: "R-032",
    sourceId: "US-018",
    targetId: "PROJ-504",
    type: "depends_on",
    confidence: 89,
    description:
      "Once-Only aus BAYERN-ID setzt gehärtete FIM-Testmandanten, Zertifikatsrotation und revisionssicheres Logging voraus.",
  },
  {
    id: "R-033",
    sourceId: "PROJ-504",
    targetId: "US-018",
    type: "blocks",
    confidence: 85,
    description:
      "Abnahme Once-Only blockiert, bis Allowlist und Logging den Landesvorgaben entsprechen (Security-Sign-off).",
  },
  {
    id: "R-034",
    sourceId: "US-019",
    targetId: "PROJ-505",
    type: "depends_on",
    confidence: 92,
    description:
      "Live-Filialbestand und Reservierung benötigen den Kafka-Consumer aus dem OMS (Konsistenz Online-Warenkorb vs. Filiale).",
  },
  {
    id: "R-035",
    sourceId: "PROJ-505",
    targetId: "US-019",
    type: "blocks",
    confidence: 87,
    description:
      "Kein produktives Reservierungsfenster, bis Event-Lag und Konfliktauflösung gegen den Warenkorb abgenommen sind.",
  },
  {
    id: "R-036",
    sourceId: "US-014",
    targetId: "US-018",
    type: "related_to",
    confidence: 66,
    description:
      "DSGVO-Einwilligung und nachvollziehbare Protokollierung beim Foto-FNOL ähneln den Anforderungen an Audit-Log und Einwilligung pro Antrag (Once-Only).",
  },
  {
    id: "R-037",
    sourceId: "US-012",
    targetId: "US-016",
    type: "related_to",
    confidence: 58,
    description:
      "Beide Projekte definieren harte Echtzeit-SLAs (IRIS p95 vs. Bestandsabfrage); Last- und Fallback-Patterns werden im Architecture Board abgestimmt.",
  },
  {
    id: "R-038",
    sourceId: "US-017",
    targetId: "PROJ-503",
    type: "related_to",
    confidence: 71,
    description:
      "Dynamische Marktlage-Tarife nutzen aggregierte Last- und Verbrauchsprofile, die auch in der MDM-Normalisierung angebunden werden.",
  },
];

/* ------------------------------------------------------------------ */
/*  Helper functions                                                   */
/* ------------------------------------------------------------------ */

export function getStoryById(id: string): Story | undefined {
  return allStories.find((s) => s.id === id);
}

/** @deprecated Use getStoryById */
export function getItemById(id: string): Story | undefined {
  return getStoryById(id);
}

export function getRelationsForId(id: string): TicketRelation[] {
  return allRelations.filter((r) => r.sourceId === id || r.targetId === id);
}

export function getRelatedIds(id: string): string[] {
  const relations = getRelationsForId(id);
  const ids = new Set<string>();
  relations.forEach((r) => {
    if (r.sourceId !== id) ids.add(r.sourceId);
    if (r.targetId !== id) ids.add(r.targetId);
  });
  return Array.from(ids);
}

export function getItemTitle(id: string): string {
  return allStories.find((s) => s.id === id)?.title || id;
}

export function getItemProject(id: string): string {
  return allStories.find((s) => s.id === id)?.project || "";
}

/** @deprecated No longer needed with unified model */
export function isUserStory(id: string): boolean {
  return id.startsWith("US-");
}

/** @deprecated No longer needed with unified model */
export function isJiraTicket(id: string): boolean {
  return id.startsWith("PROJ-");
}

/** @deprecated Use allStories directly */
export const allJiraTickets: Story[] = allStories.filter(
  (s) => s.source === "jira-import",
);
