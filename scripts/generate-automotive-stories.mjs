/**
 * Generiert src/app/data/stories.ts für Automotive-OEM-Workspaces.
 * Ausführen: node scripts/generate-automotive-stories.mjs
 */
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

const projects = [
  {
    ws: "ws-bmw",
    prefix: "BMW",
    pid: ["P-101", "P-102", "P-103"],
    names: [
      "BMW Group — Versuchsteile & Entwicklungs-Analytics",
      "BMW Group — Fahrzeuglogistik & Vertriebs-Transparenz",
      "BMW Group — Digital Core & ERP-Roadmap",
    ],
    themes: [
      ["SAP Analytics Cloud", "Forecast", "Versuchsteil", "Supply Chain"],
      ["IoT", "GPS", "ETA", "Händler"],
      ["S/4HANA", "Governance", "Integration", "Roadmap"],
    ],
  },
  {
    ws: "ws-vw",
    prefix: "VW",
    pid: ["P-201", "P-202", "P-203"],
    names: [
      "Volkswagen Group — Datenraum Mobilität",
      "Volkswagen Group — Konzern-IT & Integrationsplattform",
      "Volkswagen Group — Marken-Apps & Partner-Ökosystem",
    ],
    themes: [
      ["Gaia-X", "Datensouveränität", "Use Case", "Consent"],
      ["API", "Event Hub", "IAM", "Monitoring"],
      ["SDK", "OAuth", "Deep Link", "B2B"],
    ],
  },
  {
    ws: "ws-mercedes",
    prefix: "MB",
    pid: ["P-301", "P-302", "P-303"],
    names: [
      "Mercedes-Benz Group — E-Mobility Software & Baukasten",
      "Mercedes-Benz Group — OTA & Fahrzeug-Software-Releases",
      "Mercedes-Benz Group — Vertrieb & Aftersales Digital",
    ],
    themes: [
      ["HV-Batterie", "Feature-Flag", "Backlog", "ASIL"],
      ["Rollback", "Campaign", "Signatur", "Fahrzeug"],
      ["Lead", "Werkstatt", "Termin", "OneWeb"],
    ],
  },
  {
    ws: "ws-audi",
    prefix: "AU",
    pid: ["P-401", "P-402", "P-403"],
    names: [
      "AUDI — Infotainment & HMI",
      "AUDI — Konfigurator & Commerce",
      "AUDI — Vernetzung & Drittpartner-APIs",
    ],
    themes: [
      ["MMI", "Voice", "HUD", "UX"],
      ["Konfigurator", "Preis", "Bestellung", "Payment"],
      ["MQTT", "SLA", "Rate Limit", "Partner"],
    ],
  },
  {
    ws: "ws-porsche",
    prefix: "PO",
    pid: ["P-501", "P-502", "P-503"],
    names: [
      "Porsche AG — Motorsport & Fahrzeugdaten",
      "Porsche AG — Kundenplattform & Personalisierung",
      "Porsche AG — Supply Chain & Teile-Transparenz",
    ],
    themes: [
      ["Telemetrie", "Runde", "Latenz", "Track"],
      ["My Porsche", "Garage", "Notification"],
      ["VIN", "Teile", "Lieferant", "ATP"],
    ],
  },
];

let usCounter = 200;
let projCounter = 600;

function nextUsId() {
  usCounter += 1;
  return `US-${usCounter}`;
}
function nextProjId() {
  projCounter += 1;
  return `PROJ-${projCounter}`;
}

const statuses = ["Draft", "To Do", "In Review", "In Progress", "Approved", "Done"];
const priorities = ["Hoch", "Mittel", "Niedrig"];
const efforts = ["Niedrig", "Mittel", "Hoch"];

function pick(i, arr) {
  return arr[i % arr.length];
}

const stories = [];
const storyIdsByProject = {};

for (const block of projects) {
  for (let pi = 0; pi < 3; pi++) {
    const pname = block.names[pi];
    const themes = block.themes[pi];
    storyIdsByProject[pname] = [];
    for (let s = 0; s < 5; s++) {
      const id = nextUsId();
      storyIdsByProject[pname].push(id);
      const t1 = themes[s % themes.length];
      const t2 = themes[(s + 1) % themes.length];
      stories.push({
        id,
        title: `${t1}-Anforderung: ${pname.split(" — ")[1] ?? pname} (${s + 1})`,
        description: `As a Stakeholder, I want ${t1.toLowerCase()}-relevante Funktionen konsistent mit ${t2} umzusetzen, so that Liefertermine und Abnahmen planbar bleiben.`,
        type: s === 0 ? "Epic" : "Story",
        role: pick(s, ["Product Owner", "Entwicklungsingenieur", "IT-Architekt", "QA Lead", "Betrieb"]),
        goal: `die ${t1}-Schnittstelle fachlich und technisch abzusichern`,
        benefit: `Risiken in ${t2} früh erkannt werden`,
        acceptance: [
          `Messbare KPI für ${t1} dokumentiert (Zielwert im Review abgestimmt)`,
          `Schnittstellenvertrag (OpenAPI/Event-Schema) versioniert in Git`,
          `Nicht-funktionale Anforderungen: Verfügbarkeit und Latenz benannt`,
          `Abnahmekriterien mit Testfällen in Xray/Jira verlinkt`,
        ],
        effort: pick(s, efforts),
        priority: pick(s + pi, priorities),
        status: pick(s + pi * 2, statuses),
        project: pname,
        tags: [t1, t2, block.prefix],
        source: s % 3 === 0 ? "jira-import" : "ai-generated",
        guidelinesScore: 70 + ((s + pi * 7) % 25),
        guidelineChecks: [
          { label: "User Story Format", description: "Format ok.", passed: true },
          { label: "Has Acceptance Criteria", description: "4 ACs.", passed: true },
          { label: "ACs Are Specific", description: "Messbar.", passed: s % 4 !== 0 },
          { label: "Title Is Concise", description: "Ok.", passed: true },
        ],
        acQuality: [
          {
            criterion: `${t1} Scope`,
            score: 75 + (s % 20),
            suggestion: "Abhängigkeit zu Nachbarsystem explizit machen.",
          },
        ],
        suggestions: [`Workshop mit Fachbereich ${block.prefix} terminieren.`],
        assignee: pick(s, ["S. Richter", "M. König", "T. Hoffmann", "L. Brenner", "Nicht zugewiesen"]),
        sprint: pick(s, ["Sprint 24.1", "Sprint 24.2", "Backlog", "PI 3.2", "Hardening"]),
        storyPoints: [3, 5, 8, 13, 2][s % 5],
      });
    }
    for (let j = 0; j < 2; j++) {
      const id = nextProjId();
      storyIdsByProject[pname].push(id);
      stories.push({
        id,
        title: `Backend: ${themes[j]} Pipeline Stabilität`,
        description: `Technisches Ticket: Monitoring, Alerts und Runbooks für ${themes[j]} im Kontext ${pname}.`,
        type: pick(j, ["Task", "Story", "Bug"]),
        status: pick(j + 1, statuses),
        priority: pick(j, priorities),
        effort: pick(j + 1, efforts),
        project: pname,
        tags: [themes[j], "Backend", "Operations"],
        source: "jira-import",
        assignee: pick(j, ["A. Hoffmann", "P. Richter", "K. Fischer"]),
        sprint: pick(j, ["Sprint Ops-4", "Backlog"]),
        storyPoints: [3, 5][j % 2],
      });
    }
  }
}

const relations = [];
let rid = 800;

function addRel(sourceId, targetId, type, conf, desc) {
  rid += 1;
  relations.push({
    id: `R-${rid}`,
    sourceId,
    targetId,
    type,
    confidence: conf,
    description: desc,
  });
}

for (const block of projects) {
  for (let pi = 0; pi < 3; pi++) {
    const pname = block.names[pi];
    const ids = storyIdsByProject[pname];
    for (let i = 0; i < ids.length - 1; i += 2) {
      addRel(
        ids[i],
        ids[i + 1],
        i % 4 === 0 ? "depends_on" : "related_to",
        72 + (i % 25),
        `Thematische Nähe im Projekt ${pname.split(" — ")[1] ?? pname}: gemeinsame Schnittstellen oder KPIs.`,
      );
    }
    if (pi > 0) {
      const prev = block.names[pi - 1];
      const a = storyIdsByProject[pname][0];
      const b = storyIdsByProject[prev][1];
      if (a && b)
        addRel(a, b, "related_to", 61, "Abstimmung zwischen benachbarten Vorhaben im gleichen OEM-Workspace.");
    }
  }
}

addRel(storyIdsByProject[projects[0].names[0]][0], storyIdsByProject[projects[1].names[0]][0], "related_to", 55, "Referenzarchitektur Analytics / Datenraum (informatorisch).");

const header = `/* ------------------------------------------------------------------ */
/*  Unified story data for the prototype — Automotive OEM Demo         */
/*  Generiert durch scripts/generate-automotive-stories.mjs            */
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

  role?: string;
  goal?: string;
  benefit?: string;
  acceptance?: string[];
  guidelinesScore?: number;
  guidelineChecks?: { label: string; description: string; passed: boolean }[];
  acQuality?: { criterion: string; score: number; suggestion: string }[];
  suggestions?: string[];

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

export const allStories: Story[] = `;

function serializeStory(s) {
  const lines = [`  {`];
  const keys = Object.keys(s);
  for (const k of keys) {
    const v = s[k];
    if (v === undefined) continue;
    if (typeof v === "string") {
      lines.push(`    ${k}: ${JSON.stringify(v)},`);
    } else if (typeof v === "number" || typeof v === "boolean") {
      lines.push(`    ${k}: ${v},`);
    } else {
      lines.push(`    ${k}: ${JSON.stringify(v)},`);
    }
  }
  lines.push(`  }`);
  return lines.join("\n");
}

const storiesBody = stories.map(serializeStory).join(",\n");

const relHeader = `

/* ------------------------------------------------------------------ */
/*  Relations                                                          */
/* ------------------------------------------------------------------ */

export const allRelations: TicketRelation[] = [
`;

function serializeRel(r) {
  return `  {
    id: "${r.id}",
    sourceId: "${r.sourceId}",
    targetId: "${r.targetId}",
    type: "${r.type}",
    confidence: ${r.confidence},
    description: ${JSON.stringify(r.description)},
  }`;
}

const relBody = relations.map(serializeRel).join(",\n");

const footer = `
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
`;

const out = header + `[\n${storiesBody},\n];` + relHeader + relBody + footer;
writeFileSync(join(root, "src/app/data/stories.ts"), out, "utf8");
console.log("Wrote", stories.length, "stories,", relations.length, "relations");
