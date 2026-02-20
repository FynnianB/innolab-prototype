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
      "As a Unternehmensadministrator, I want to mich \u00fcber Single Sign-On (SSO) anmelden k\u00f6nnen, so that ich keinen separaten Login ben\u00f6tige und die Sicherheitsrichtlinien eingehalten werden.",
    type: "Story",
    role: "Unternehmensadministrator",
    goal: "mich \u00fcber Single Sign-On (SSO) anmelden k\u00f6nnen",
    benefit: "ich keinen separaten Login ben\u00f6tige und die Sicherheitsrichtlinien eingehalten werden",
    acceptance: [
      "SSO-Integration mit Azure AD und Okta ist verf\u00fcgbar",
      "Session-Timeout nach 15 Minuten Inaktivit\u00e4t f\u00fcr administrative Accounts, 30 Minuten f\u00fcr Standard-Benutzer",
      "Multi-Faktor-Authentifizierung wird unterst\u00fctzt",
      "Fehlermeldung bei ung\u00fcltigen Credentials innerhalb von 2 Sekunden",
    ],
    effort: "Hoch",
    priority: "Hoch",
    status: "In Progress",
    project: "Automobil-Plattform Redesign",
    tags: ["Authentifizierung", "Sicherheit"],
    source: "ai-generated",
    complianceScore: 100,
    complianceChecks: [
      { label: 'User Story Format ("As a... I want... so that...")', description: "Story follows the standard user story format.", passed: true },
      { label: "Has Acceptance Criteria", description: "4 acceptance criteria defined.", passed: true },
      { label: "ACs Follow Given/When/Then Format", description: "All acceptance criteria follow the Given/When/Then pattern.", passed: true },
      { label: "ACs Are Specific (No Vague Language)", description: "Acceptance criteria use specific, unambiguous language.", passed: true },
      { label: "Title Is Concise and Descriptive", description: "Title is appropriately concise and descriptive.", passed: true },
      { label: "Description Has Appropriate Detail", description: "Description provides sufficient context without being overly verbose.", passed: true },
    ],
    acQuality: [
      { criterion: "SSO-Integration mit Azure AD und Okta ist verf\u00fcgbar", score: 90, suggestion: "Add measurable criteria (e.g., supported protocols, timeout values)." },
      { criterion: "Session-Timeout nach 15 Min (Admin), 30 Min (Standard)", score: 95, suggestion: "Well-defined with specific values." },
      { criterion: "Multi-Faktor-Authentifizierung wird unterst\u00fctzt", score: 80, suggestion: "Specify supported MFA methods (TOTP, SMS, hardware keys)." },
      { criterion: "Fehlermeldung bei ung\u00fcltigen Credentials innerhalb von 2 Sekunden", score: 90, suggestion: "Consider adding max retry limits." },
    ],
    suggestions: [
      "This ticket is well-structured. Consider adding non-functional requirements (performance, security) if applicable.",
    ],
  },
  {
    id: "US-002",
    title: "Dashboard-Personalisierung",
    description:
      "As a Endbenutzer, I want to mein Dashboard individuell anpassen k\u00f6nnen, so that ich die f\u00fcr mich konfigurierten KPI-Metriken, Projektstatusupdates und priorisierte Benachrichtigungen auf einen Blick sehe.",
    type: "Story",
    role: "Endbenutzer",
    goal: "mein Dashboard individuell anpassen k\u00f6nnen",
    benefit: "ich die f\u00fcr mich konfigurierten KPI-Metriken, Projektstatusupdates und priorisierte Benachrichtigungen auf einen Blick sehe",
    acceptance: [
      "Widgets k\u00f6nnen per Drag & Drop angeordnet werden",
      "Mindestens 8 verschiedene Widget-Typen verf\u00fcgbar",
      "Layout wird benutzerspezifisch gespeichert",
      "Standard-Layout mit 6 vordefinierten Widgets f\u00fcr neue Benutzer",
    ],
    effort: "Mittel",
    priority: "Mittel",
    status: "Draft",
    project: "Automobil-Plattform Redesign",
    tags: ["Frontend", "Dashboard"],
    source: "ai-generated",
    complianceScore: 85,
    complianceChecks: [
      { label: 'User Story Format ("As a... I want... so that...")', description: "Story follows the standard user story format.", passed: true },
      { label: "Has Acceptance Criteria", description: "4 acceptance criteria defined.", passed: true },
      { label: "ACs Follow Given/When/Then Format", description: "Not all ACs follow the Given/When/Then pattern.", passed: false },
      { label: "ACs Are Specific (No Vague Language)", description: "Acceptance criteria use specific, unambiguous language.", passed: true },
      { label: "Title Is Concise and Descriptive", description: "Title is appropriately concise and descriptive.", passed: true },
      { label: "Description Has Appropriate Detail", description: "Description provides sufficient context.", passed: true },
    ],
    acQuality: [
      { criterion: "Widgets k\u00f6nnen per Drag & Drop angeordnet werden", score: 75, suggestion: "Add keyboard accessibility alternative." },
      { criterion: "Mindestens 8 verschiedene Widget-Typen verf\u00fcgbar", score: 85, suggestion: "Add max limit and loading time." },
      { criterion: "Layout wird benutzerspezifisch gespeichert", score: 90, suggestion: "Specify sync behavior across devices." },
      { criterion: "Standard-Layout mit 6 vordefinierten Widgets", score: 85, suggestion: "Define which widgets are in the default set." },
    ],
    suggestions: [
      "Consider specifying accessibility requirements for the drag-and-drop interface.",
    ],
  },
  {
    id: "US-003",
    title: "Echtzeit-Benachrichtigungen",
    description:
      "As a Projektmanager, I want to Echtzeit-Benachrichtigungen bei Status\u00e4nderungen erhalten, so that ich sofort reagieren kann und keine wichtigen Updates verpasse.",
    type: "Story",
    role: "Projektmanager",
    goal: "Echtzeit-Benachrichtigungen bei Status\u00e4nderungen der Schweregrade P1 und P2 erhalten",
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
      { label: "User Story Format", description: "Story follows the standard format.", passed: true },
      { label: "Has Acceptance Criteria", description: "3 acceptance criteria defined.", passed: true },
      { label: "ACs Follow Given/When/Then Format", description: "ACs follow the pattern.", passed: true },
      { label: "ACs Are Specific", description: "Criteria use specific language.", passed: true },
      { label: "Title Is Concise", description: "Title is concise.", passed: true },
      { label: "Description Has Appropriate Detail", description: "Description is detailed.", passed: true },
    ],
    acQuality: [
      { criterion: "Push via WebSocket mit Reconnect", score: 90, suggestion: "Define fallback mechanism." },
      { criterion: "Konfigurierbare Regeln", score: 85, suggestion: "Specify default rules." },
      { criterion: "Benachrichtigungshistorie 90 Tage", score: 80, suggestion: "Add pagination and search." },
    ],
    suggestions: [],
  },
  {
    id: "US-004",
    title: "Datenexport in Standardformate",
    description:
      "As a Business Analyst, I want to Analysedaten in CSV, PDF und Excel exportieren k\u00f6nnen, so that ich die Daten in externen Tools weiterverarbeiten kann.",
    type: "Story",
    role: "Business Analyst",
    goal: "Analysedaten in CSV, PDF und Excel exportieren k\u00f6nnen",
    benefit: "ich die Daten in externen Tools weiterverarbeiten kann",
    acceptance: [
      "Export-Formate: CSV, PDF, XLSX",
      "Maximale Export-Gr\u00f6\u00dfe: 100.000 Datens\u00e4tze pro Einzelexport",
      "Export-Job l\u00e4uft asynchron mit Fortschrittsanzeige",
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
      { label: "User Story Format", description: "Follows standard format.", passed: true },
      { label: "Has Acceptance Criteria", description: "4 criteria defined.", passed: true },
      { label: "ACs Are Specific", description: "Criteria are specific.", passed: true },
      { label: "Title Is Concise", description: "Good title.", passed: true },
      { label: "Description Has Appropriate Detail", description: "Adequate detail.", passed: true },
      { label: "ACs Follow Given/When/Then Format", description: "Not all follow pattern.", passed: false },
    ],
    acQuality: [
      { criterion: "Export-Formate: CSV, PDF, XLSX", score: 85, suggestion: "Specify encoding and delimiter options." },
      { criterion: "Max 100.000 Datens\u00e4tze pro Export", score: 90, suggestion: "Well-defined limit." },
      { criterion: "Asynchroner Export mit Fortschrittsanzeige", score: 85, suggestion: "Add cancel option." },
      { criterion: "E-Mail-Benachrichtigung bei Abschluss", score: 80, suggestion: "Add in-app notification as alternative." },
    ],
    suggestions: ["Consider adding batch-export functionality for larger datasets."],
  },
  {
    id: "US-005",
    title: "Audit-Trail f\u00fcr alle \u00c4nderungen",
    description:
      "As a Compliance-Beauftragter, I want to einen vollst\u00e4ndigen Audit-Trail aller System\u00e4nderungen einsehen k\u00f6nnen, so that regulatorische Anforderungen erf\u00fcllt werden.",
    type: "Story",
    role: "Compliance-Beauftragter",
    goal: "einen vollst\u00e4ndigen Audit-Trail aller System\u00e4nderungen einsehen k\u00f6nnen",
    benefit: "regulatorische Anforderungen erf\u00fcllt werden und \u00c4nderungen nachvollziehbar sind",
    acceptance: [
      "Alle CRUD-Operationen werden protokolliert",
      "Audit-Daten sind unver\u00e4nderlich (Append-Only)",
      "Filterung nach Benutzer, Zeitraum und Aktion",
      "Aufbewahrungsdauer: 7 Jahre f\u00fcr steuerrelevante Daten",
    ],
    effort: "Hoch",
    priority: "Hoch",
    status: "In Progress",
    project: "Healthcare Portal DSGVO",
    tags: ["Audit", "Compliance"],
    source: "ai-generated",
    complianceScore: 95,
    complianceChecks: [
      { label: "User Story Format", description: "Follows format.", passed: true },
      { label: "Has Acceptance Criteria", description: "4 criteria.", passed: true },
      { label: "ACs Follow Given/When/Then Format", description: "Good format.", passed: true },
      { label: "ACs Are Specific", description: "Specific.", passed: true },
      { label: "Title Is Concise", description: "Good.", passed: true },
      { label: "Description Has Appropriate Detail", description: "Detailed.", passed: true },
    ],
    acQuality: [
      { criterion: "Alle CRUD-Operationen protokolliert", score: 90, suggestion: "Well-defined." },
      { criterion: "Append-Only Audit-Daten", score: 95, suggestion: "Excellent immutability requirement." },
      { criterion: "Filterung nach Benutzer, Zeitraum, Aktion", score: 85, suggestion: "Add export option for filtered results." },
      { criterion: "7 Jahre Aufbewahrung", score: 90, suggestion: "Matches regulatory requirements." },
    ],
    suggestions: [],
  },
  {
    id: "US-006",
    title: "Rollenbasierte Zugriffskontrolle",
    description:
      "As a Systemadministrator, I want to Benutzerrollen mit granularen Berechtigungen definieren k\u00f6nnen, so that das Prinzip der minimalen Rechtevergabe umgesetzt wird.",
    type: "Story",
    role: "Systemadministrator",
    goal: "Benutzerrollen mit granularen Berechtigungen definieren k\u00f6nnen",
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
      { label: "User Story Format", description: "Follows format.", passed: true },
      { label: "Has Acceptance Criteria", description: "3 criteria.", passed: true },
      { label: "ACs Are Specific", description: "Specific language.", passed: true },
      { label: "Title Is Concise", description: "Good title.", passed: true },
      { label: "Description Has Appropriate Detail", description: "Good detail.", passed: true },
      { label: "ACs Follow Given/When/Then Format", description: "Partially.", passed: false },
    ],
    acQuality: [
      { criterion: "5 vordefinierte Rollen", score: 85, suggestion: "Consider role hierarchy." },
      { criterion: "4-Augen-Prinzip", score: 90, suggestion: "Well-defined governance." },
      { criterion: "Berechtigungen auf Modul- und Aktionsebene", score: 80, suggestion: "Add permission matrix reference." },
    ],
    suggestions: ["Consider adding SoD (Separation of Duties) checks."],
  },
  {
    id: "US-007",
    title: "Automatisierte Regressionstests",
    description:
      "As a QA-Engineer, I want to automatisierte Regressionstests bei jedem Deployment ausf\u00fchren k\u00f6nnen, so that die Softwarequalit\u00e4t sichergestellt wird.",
    type: "Story",
    role: "QA-Engineer",
    goal: "automatisierte Regressionstests bei jedem Deployment ausf\u00fchren k\u00f6nnen",
    benefit: "die Softwarequalit\u00e4t kontinuierlich sichergestellt wird",
    acceptance: [
      "CI/CD-Pipeline f\u00fchrt automatisierte Tests bei jedem Merge-Request aus",
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
      { label: "Has Acceptance Criteria", description: "4 criteria.", passed: true },
      { label: "ACs Are Specific", description: "Specific.", passed: true },
      { label: "Title Is Concise", description: "Concise.", passed: true },
      { label: "Description Has Appropriate Detail", description: "Good.", passed: true },
      { label: "ACs Follow Given/When/Then Format", description: "Partially.", passed: false },
    ],
    acQuality: [
      { criterion: "CI/CD-Pipeline Tests bei Merge-Request", score: 90, suggestion: "Good CI/CD integration." },
      { criterion: "Testabdeckung 80%", score: 85, suggestion: "Define coverage types (line, branch)." },
      { criterion: "Dashboard-Visualisierung", score: 75, suggestion: "Specify trend view requirements." },
      { criterion: "Deployment-Blockierung", score: 90, suggestion: "Good quality gate." },
    ],
    suggestions: ["Consider adding performance test thresholds."],
  },
  {
    id: "US-010",
    title: "SEPA-\u00dcberweisungen in Echtzeit",
    description:
      "As a Bankkunde, I want to SEPA-\u00dcberweisungen in Echtzeit durchf\u00fchren k\u00f6nnen, so that Geldtransfers sofort beim Empf\u00e4nger eingehen und ich nicht auf Bankarbeitstage warten muss.",
    type: "Story",
    role: "Bankkunde",
    goal: "SEPA-\u00dcberweisungen in Echtzeit durchf\u00fchren k\u00f6nnen",
    benefit: "Geldtransfers sofort beim Empf\u00e4nger eingehen und ich nicht auf Bankarbeitstage warten muss",
    acceptance: [
      "SEPA Instant Payment gem\u00e4\u00df SCT Inst Scheme innerhalb von 10 Sekunden",
      "Transaktionslimit: 100.000 EUR pro Einzeltransaktion",
      "Echtzeit-Statusanzeige mit Fortschrittsindikator",
      "Fallback auf Standard-SEPA bei Nicht-Verf\u00fcgbarkeit mit Benutzerhinweis",
    ],
    effort: "Mittel",
    priority: "Hoch",
    status: "In Progress",
    project: "Banking App v3.2 Migration",
    tags: ["Payment", "SEPA", "Echtzeit"],
    source: "ai-generated",
    complianceScore: 94,
    complianceChecks: [
      { label: 'User Story Format ("As a... I want... so that...")', description: "Story follows the standard user story format.", passed: true },
      { label: "Has Acceptance Criteria", description: "4 acceptance criteria defined.", passed: true },
      { label: "ACs Follow Given/When/Then Format", description: "All ACs follow the pattern.", passed: true },
      { label: "ACs Are Specific (No Vague Language)", description: "Criteria are specific with measurable values.", passed: true },
      { label: "Title Is Concise and Descriptive", description: "Title is concise.", passed: true },
      { label: "Description Has Appropriate Detail", description: "Good detail level.", passed: true },
    ],
    acQuality: [
      { criterion: "SCT Inst innerhalb von 10 Sekunden", score: 95, suggestion: "Well-defined with specific protocol and timing." },
      { criterion: "Transaktionslimit 100.000 EUR", score: 90, suggestion: "Consider daily cumulative limit." },
      { criterion: "Echtzeit-Statusanzeige", score: 85, suggestion: "Specify push notification for completion." },
      { criterion: "Fallback auf Standard-SEPA", score: 90, suggestion: "Good degradation strategy." },
    ],
    suggestions: ["Consider adding fraud-detection checks for real-time transactions."],
  },
  {
    id: "US-011",
    title: "Biometrische Authentifizierung",
    description:
      "As a App-Benutzer, I want to mich per Fingerabdruck oder Face-ID anmelden k\u00f6nnen, so that der Login-Prozess schnell und sicher ist ohne Passw\u00f6rter eingeben zu m\u00fcssen.",
    type: "Story",
    role: "App-Benutzer",
    goal: "mich per Fingerabdruck oder Face-ID anmelden k\u00f6nnen",
    benefit: "der Login-Prozess schnell und sicher ist ohne Passw\u00f6rter eingeben zu m\u00fcssen",
    acceptance: [
      "Touch ID und Face ID auf iOS, Fingerprint und Face Unlock auf Android",
      "Fallback auf PIN-Eingabe bei fehlgeschlagener biometrischer Erkennung",
      "Biometrische Daten werden ausschlie\u00dflich lokal auf dem Ger\u00e4t gespeichert",
      "Re-Authentifizierung bei sicherheitskritischen Aktionen (z.B. \u00dcberweisungen > 1.000 EUR)",
    ],
    effort: "Mittel",
    priority: "Hoch",
    status: "Approved",
    project: "Banking App v3.2 Migration",
    tags: ["Authentifizierung", "Biometrie", "Mobile"],
    source: "ai-generated",
    complianceScore: 89,
    complianceChecks: [
      { label: 'User Story Format ("As a... I want... so that...")', description: "Story follows the standard format.", passed: true },
      { label: "Has Acceptance Criteria", description: "4 acceptance criteria defined.", passed: true },
      { label: "ACs Follow Given/When/Then Format", description: "ACs follow the pattern.", passed: true },
      { label: "ACs Are Specific (No Vague Language)", description: "Criteria are specific.", passed: true },
      { label: "Title Is Concise and Descriptive", description: "Concise title.", passed: true },
      { label: "Description Has Appropriate Detail", description: "Not all security aspects covered.", passed: false },
    ],
    acQuality: [
      { criterion: "Touch ID / Face ID / Fingerprint / Face Unlock", score: 90, suggestion: "Good cross-platform coverage." },
      { criterion: "Fallback auf PIN-Eingabe", score: 85, suggestion: "Specify max retry attempts before lockout." },
      { criterion: "Lokale Speicherung biometrischer Daten", score: 95, suggestion: "Excellent privacy-by-design approach." },
      { criterion: "Re-Authentifizierung bei kritischen Aktionen", score: 85, suggestion: "Define full list of critical actions." },
    ],
    suggestions: ["Consider specifying compliance with FIDO2/WebAuthn standards."],
  },
  // Jira-imported stories
  {
    id: "PROJ-101",
    title: "SSO-Authentifizierung mit Azure AD implementieren",
    description: "Implementierung der SSO-Anbindung an Azure Active Directory f\u00fcr die Automobil-Plattform.",
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
    description: "Aufbau eines modularen Widget-Frameworks f\u00fcr das Plattform-Dashboard.",
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
    description: "Einrichtung eines Push-Notification-Dienstes f\u00fcr Echtzeit-Benachrichtigungen.",
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
    title: "CSV/PDF Export f\u00fcr Reports",
    description: "Export-Funktionalit\u00e4t f\u00fcr Reports in CSV- und PDF-Format.",
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
    description: "Erarbeitung des Rollen- und Berechtigungskonzepts f\u00fcr die Banking App.",
    type: "Epic",
    status: "To Do",
    priority: "Hoch",
    effort: "Hoch",
    project: "Banking App v3.2 Migration",
    tags: ["RBAC", "Konzept"],
    source: "jira-import",
    assignee: "S. M\u00fcller",
    sprint: "Backlog",
    storyPoints: 34,
  },
  {
    id: "PROJ-210",
    title: "Audit-Log Viewer Komponente",
    description: "UI-Komponente zur Anzeige und Filterung von Audit-Log-Eintr\u00e4gen.",
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
    description: "Implementierung automatisierter End-to-End Tests mit Playwright.",
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
    description: "Offline-Synchronisations-Funktionalit\u00e4t f\u00fcr die Mobile Banking App.",
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
    description: "Dashboard zur \u00dcberwachung der Anwendungsperformance in Echtzeit.",
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
    description: "Implementierung von Rate Limiting f\u00fcr alle \u00f6ffentlichen API-Endpunkte.",
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
    description: "Integration des SEPA Instant Payment Gateways f\u00fcr Echtzeit-\u00dcberweisungen.",
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
    description: "Cross-Platform biometrische Login-Komponente f\u00fcr iOS und Android.",
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
];

/* ------------------------------------------------------------------ */
/*  Relations                                                          */
/* ------------------------------------------------------------------ */

export const allRelations: TicketRelation[] = [
  { id: "R-001", sourceId: "US-001", targetId: "PROJ-101", type: "related_to", confidence: 92, description: "Hohe thematische \u00dcberschneidung im Bereich SSO/Azure AD. Beide Stories behandeln Authentifizierung." },
  { id: "R-002", sourceId: "US-001", targetId: "PROJ-089", type: "duplicates", confidence: 78, description: "PROJ-089 (Legacy Okta SSO) k\u00f6nnte US-001 teilweise abdecken. Scope-Pr\u00fcfung empfohlen." },
  { id: "R-003", sourceId: "US-001", targetId: "US-006", type: "depends_on", confidence: 85, description: "SSO-Authentifizierung h\u00e4ngt von der rollenbasierten Zugriffskontrolle ab." },
  { id: "R-004", sourceId: "US-002", targetId: "PROJ-102", type: "related_to", confidence: 85, description: "Dashboard Widget-Framework ist die technische Basis f\u00fcr die Personalisierung." },
  { id: "R-005", sourceId: "US-002", targetId: "PROJ-315", type: "related_to", confidence: 65, description: "Performance-Monitoring Dashboard teilt UI-Komponenten mit der Personalisierung." },
  { id: "R-006", sourceId: "US-003", targetId: "PROJ-145", type: "related_to", confidence: 88, description: "Push-Notification Service ist die technische Grundlage f\u00fcr Echtzeit-Benachrichtigungen." },
  { id: "R-007", sourceId: "US-004", targetId: "PROJ-156", type: "related_to", confidence: 90, description: "CSV/PDF Export deckt einen Teil der Exportanforderungen ab. XLSX und Batch fehlen." },
  { id: "R-008", sourceId: "US-005", targetId: "PROJ-210", type: "depends_on", confidence: 82, description: "Audit-Trail ben\u00f6tigt die Audit-Log Viewer Komponente als UI." },
  { id: "R-009", sourceId: "US-006", targetId: "PROJ-200", type: "related_to", confidence: 88, description: "Rollen- und Berechtigungskonzept ist direkt verwandt mit der Zugriffskontrolle." },
  { id: "R-010", sourceId: "US-007", targetId: "PROJ-220", type: "related_to", confidence: 92, description: "E2E Tests mit Playwright sind Teil der automatisierten Regressionstests." },
  { id: "R-011", sourceId: "US-001", targetId: "US-005", type: "related_to", confidence: 70, description: "Authentifizierung und Audit-Trail teilen Sicherheitsanforderungen." },
  { id: "R-012", sourceId: "US-003", targetId: "US-002", type: "related_to", confidence: 60, description: "Benachrichtigungen k\u00f6nnen als Dashboard-Widget dargestellt werden." },
  { id: "R-013", sourceId: "PROJ-101", targetId: "PROJ-089", type: "related_to", confidence: 75, description: "Beide Stories behandeln SSO-Integration, PROJ-089 ist der Legacy-Vorg\u00e4nger." },
  { id: "R-014", sourceId: "US-004", targetId: "US-005", type: "related_to", confidence: 55, description: "Export-Funktionalit\u00e4t und Audit-Trail teilen Datenabfrage-Patterns." },
  { id: "R-015", sourceId: "PROJ-330", targetId: "PROJ-101", type: "related_to", confidence: 60, description: "API Rate Limiting betrifft auch SSO-Endpunkte." },
  { id: "R-016", sourceId: "US-010", targetId: "PROJ-401", type: "related_to", confidence: 94, description: "SEPA Instant Payment Gateway ist die technische Implementierung der Echtzeit-\u00dcberweisungen." },
  { id: "R-017", sourceId: "US-010", targetId: "PROJ-330", type: "related_to", confidence: 65, description: "API Rate Limiting betrifft auch Payment-Endpunkte f\u00fcr SEPA Instant." },
  { id: "R-018", sourceId: "US-011", targetId: "PROJ-410", type: "related_to", confidence: 91, description: "Biometrische Login-Komponente implementiert die Authentifizierungsanforderungen." },
  { id: "R-019", sourceId: "US-011", targetId: "US-001", type: "related_to", confidence: 72, description: "Biometrische Authentifizierung erg\u00e4nzt die SSO-Authentifizierung auf mobilen Ger\u00e4ten." },
  { id: "R-020", sourceId: "US-010", targetId: "US-011", type: "related_to", confidence: 68, description: "Echtzeit-\u00dcberweisungen erfordern biometrische Re-Authentifizierung bei hohen Betr\u00e4gen." },
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
export const allJiraTickets: Story[] = allStories.filter((s) => s.source === "jira-import");
