/* ------------------------------------------------------------------ */
/*  Workspace ↔ Projekt-Zuordnung (eine Quelle der Wahrheit)           */
/*  Enterprise (Capgemini) ≠ Workspace (z. B. BMW Group)              */
/* ------------------------------------------------------------------ */

import type { Story } from "./stories";

export interface Workspace {
  id: string;
  name: string;
  /** Relativer Pfad unter `public/` für Kundenlogo in der Workspace-Auswahl */
  logoSrc?: string;
}

export const WORKSPACE_STORAGE_KEY = "reqwise.selectedWorkspaceId.v2";

export const DEFAULT_WORKSPACE_ID = "ws-bmw";

/**
 * Kundenlogos pro Projekt (Workspace-spezifische Vorhaben).
 */
export const PROJECT_LOGO_BY_ID: Record<string, string> = {
  "P-101": "/logos/bmw.svg",
  "P-102": "/logos/bmw.svg",
  "P-103": "/logos/bmw.svg",
  "P-201": "/logos/vw.svg",
  "P-202": "/logos/vw.svg",
  "P-203": "/logos/vw.svg",
  "P-301": "/logos/mercedes.svg",
  "P-302": "/logos/mercedes.svg",
  "P-303": "/logos/mercedes.svg",
  "P-401": "/logos/audi.svg",
  "P-402": "/logos/audi.svg",
  "P-403": "/logos/audi.svg",
  "P-501": "/logos/porsche.svg",
  "P-502": "/logos/porsche.svg",
  "P-503": "/logos/porsche.svg",
};

/** Workspaces = Kundenorganisationen (unter dem Enterprise Mandanten). */
export const WORKSPACES: Workspace[] = [
  {
    id: "ws-bmw",
    name: "BMW Group",
    logoSrc: "/logos/bmw.svg",
  },
  {
    id: "ws-vw",
    name: "Volkswagen Group",
    logoSrc: "/logos/vw.svg",
  },
  {
    id: "ws-mercedes",
    name: "Mercedes-Benz Group",
    logoSrc: "/logos/mercedes.svg",
  },
  {
    id: "ws-audi",
    name: "AUDI",
    logoSrc: "/logos/audi.svg",
  },
  {
    id: "ws-porsche",
    name: "Porsche AG",
    logoSrc: "/logos/porsche.svg",
  },
];

export const PROJECT_WORKSPACE: Record<string, string> = {
  "P-101": "ws-bmw",
  "P-102": "ws-bmw",
  "P-103": "ws-bmw",
  "P-201": "ws-vw",
  "P-202": "ws-vw",
  "P-203": "ws-vw",
  "P-301": "ws-mercedes",
  "P-302": "ws-mercedes",
  "P-303": "ws-mercedes",
  "P-401": "ws-audi",
  "P-402": "ws-audi",
  "P-403": "ws-audi",
  "P-501": "ws-porsche",
  "P-502": "ws-porsche",
  "P-503": "ws-porsche",
};

export const PROTOTYPE_USER_INITIALS = "SM";

/**
 * Funktionale Rolle pro Kennung im Demo-Roster (Projektteam, Tooltips).
 * SM = eingeloggte Prototyp-Persona — muss mit Topbar & Dashboard übereinstimmen.
 */
export const TEAM_MEMBER_ROLE_BY_INITIALS: Record<string, string> = {
  SM: "Requirements Lead",
  TK: "Solution Architect",
  AH: "Software Engineer",
  JR: "Product Owner",
  BW: "Quality Assurance",
  ML: "UX Design",
  KD: "Legal & Compliance",
  MK: "Scrum Master",
  SR: "Lead Engineer",
  LB: "Platform / DevOps",
  TH: "IT Security",
};

export const PROTOTYPE_USER_ROLE =
  TEAM_MEMBER_ROLE_BY_INITIALS[PROTOTYPE_USER_INITIALS] ?? "Requirements Lead";

export const PROJECT_TEAM_BY_ID: Record<string, string[]> = {
  "P-101": ["SM", "MK", "SR", "LB", "TH"],
  "P-102": ["SM", "MK", "SR"],
  "P-103": ["SM", "LB", "TH"],
  "P-201": ["SM", "MK", "AH"],
  "P-202": ["SM", "SR", "TH"],
  "P-203": ["LB", "MK"],
  "P-301": ["SM", "SR", "BW"],
  "P-302": ["SM", "MK", "TH"],
  "P-303": ["JR", "LB"],
  "P-401": ["SM", "MK", "SR", "LB"],
  "P-402": ["SM", "AH"],
  "P-403": ["TH", "BW"],
  "P-501": ["SM", "MK", "SR"],
  "P-502": ["SM", "LB", "JR"],
  "P-503": ["MK", "TH"],
};

export const TEAM_MEMBER_LABELS: Record<string, string> = {
  SM: "Dr. Sarah Müller (Sie)",
  TK: "Thomas König",
  AH: "Anna Hoffmann",
  JR: "Jonas Richter",
  BW: "Benjamin Weber",
  ML: "Maike Lorenz",
  KD: "Kim Drescher",
  MK: "Marie König",
  SR: "Stefan Richter",
  LB: "Lukas Brenner",
  TH: "Tim Hoffmann",
};

export const ALL_TEAM_ROSTER_INITIALS: string[] = Object.keys(
  TEAM_MEMBER_LABELS,
).sort();

export const STORY_PROJECT_TO_WORKSPACE: Record<string, string> = {
  "BMW Group — Versuchsteile & Entwicklungs-Analytics": "ws-bmw",
  "BMW Group — Fahrzeuglogistik & Vertriebs-Transparenz": "ws-bmw",
  "BMW Group — Digital Core & ERP-Roadmap": "ws-bmw",
  "Volkswagen Group — Datenraum Mobilität": "ws-vw",
  "Volkswagen Group — Konzern-IT & Integrationsplattform": "ws-vw",
  "Volkswagen Group — Marken-Apps & Partner-Ökosystem": "ws-vw",
  "Mercedes-Benz Group — E-Mobility Software & Baukasten": "ws-mercedes",
  "Mercedes-Benz Group — OTA & Fahrzeug-Software-Releases": "ws-mercedes",
  "Mercedes-Benz Group — Vertrieb & Aftersales Digital": "ws-mercedes",
  "AUDI — Infotainment & HMI": "ws-audi",
  "AUDI — Konfigurator & Commerce": "ws-audi",
  "AUDI — Vernetzung & Drittpartner-APIs": "ws-audi",
  "Porsche AG — Motorsport & Fahrzeugdaten": "ws-porsche",
  "Porsche AG — Kundenplattform & Personalisierung": "ws-porsche",
  "Porsche AG — Supply Chain & Teile-Transparenz": "ws-porsche",
};

export function getWorkspaceById(id: string): Workspace | undefined {
  return WORKSPACES.find((w) => w.id === id);
}

export function isValidWorkspaceId(id: string): boolean {
  return WORKSPACES.some((w) => w.id === id);
}

export function getProjectIdsForWorkspace(workspaceId: string): string[] {
  return Object.entries(PROJECT_WORKSPACE)
    .filter(([, ws]) => ws === workspaceId)
    .map(([pid]) => pid);
}

export const PROJECT_SEARCH_META: Record<
  string,
  { name: string; description: string }
> = {
  "P-101": {
    name: "BMW Group — Versuchsteile & Entwicklungs-Analytics",
    description:
      "SAP Analytics Cloud, Forecast und Versuchsteil-Transparenz: KPIs, Schnittstellen und Abnahme mit Engineering",
  },
  "P-102": {
    name: "BMW Group — Fahrzeuglogistik & Vertriebs-Transparenz",
    description:
      "IoT-/GPS-Tracking, ETA zu Händlern und Vertriebskanälen, operative Dashboards",
  },
  "P-103": {
    name: "BMW Group — Digital Core & ERP-Roadmap",
    description:
      "S/4HANA-Roadmap, Integrations-Governance und Release-Kadenz für Konzern-IT",
  },
  "P-201": {
    name: "Volkswagen Group — Datenraum Mobilität",
    description:
      "Gaia-X-orientierter Datenraum: Consent, Use Cases und souveräne Datenfreigaben",
  },
  "P-202": {
    name: "Volkswagen Group — Konzern-IT & Integrationsplattform",
    description:
      "API- und Event-Hub, IAM, Monitoring und Standardisierung über Marken hinweg",
  },
  "P-203": {
    name: "Volkswagen Group — Marken-Apps & Partner-Ökosystem",
    description:
      "SDK, OAuth, Deep Links und B2B-Partneranbindung für Marken-Apps",
  },
  "P-301": {
    name: "Mercedes-Benz Group — E-Mobility Software & Baukasten",
    description:
      "HV-Batterie-Software, Feature-Flags, Safety-Backlog und ASIL-relevante Anforderungen",
  },
  "P-302": {
    name: "Mercedes-Benz Group — OTA & Fahrzeug-Software-Releases",
    description:
      "Over-the-Air-Kampagnen, Signatur, Rollback und Fahrzeug-Flottensteuerung",
  },
  "P-303": {
    name: "Mercedes-Benz Group — Vertrieb & Aftersales Digital",
    description:
      "Leads, Werkstatt-Termine und OneWeb-Journeys für Vertrieb und Service",
  },
  "P-401": {
    name: "AUDI — Infotainment & HMI",
    description:
      "MMI, Voice, HUD und UX-Abnahme für Fahrzeug-HMI und Begleit-Apps",
  },
  "P-402": {
    name: "AUDI — Konfigurator & Commerce",
    description:
      "Fahrzeug-Konfigurator, Preislogik, Bestellung und Payment im Omnichannel",
  },
  "P-403": {
    name: "AUDI — Vernetzung & Drittpartner-APIs",
    description:
      "MQTT, SLA, Rate-Limits und Partner-APIs für vernetzte Fahrzeugfunktionen",
  },
  "P-501": {
    name: "Porsche AG — Motorsport & Fahrzeugdaten",
    description:
      "Telemetrie, Rundenzeiten, Latenz und Track-Daten für Motorsport und Serien-Feedback",
  },
  "P-502": {
    name: "Porsche AG — Kundenplattform & Personalisierung",
    description:
      "My Porsche, Garage-Ansicht, Notifications und personalisierte Inhalte",
  },
  "P-503": {
    name: "Porsche AG — Supply Chain & Teile-Transparenz",
    description:
      "VIN-basierte Teilelogistik, Lieferanten-ATP und Supply-Chain-Sichtbarkeit",
  },
};

/** Alle Demo-Projekte (für Story Generator & ähnliche globale Auswahlen). */
export const ALL_DEMO_PROJECT_OPTIONS: { id: string; name: string }[] = (
  Object.keys(PROJECT_SEARCH_META) as string[]
).map((id) => ({
  id,
  name: PROJECT_SEARCH_META[id]!.name,
}));

export function listProjectsForSearchInWorkspace(workspaceId: string) {
  return getProjectIdsForWorkspace(workspaceId)
    .map((id) => {
      const meta = PROJECT_SEARCH_META[id];
      if (!meta) return null;
      return { id, name: meta.name, description: meta.description };
    })
    .filter((p): p is { id: string; name: string; description: string } => p != null);
}

export function getWorkspaceIdForProjectId(projectId: string): string | undefined {
  return PROJECT_WORKSPACE[projectId];
}

export function storyBelongsToWorkspace(story: Story, workspaceId: string): boolean {
  const ws = STORY_PROJECT_TO_WORKSPACE[story.project];
  return ws === workspaceId;
}

export function filterStoriesByWorkspace(
  stories: Story[],
  workspaceId: string,
): Story[] {
  return stories.filter((s) => storyBelongsToWorkspace(s, workspaceId));
}

const LEGACY_WORKSPACE_IDS = new Set([
  "ws-capgemini",
  "ws-automobil",
  "ws-banking",
  "ws-healthcare",
  "ws-digital",
  "ws-deutsche-bahn",
  "ws-allianz",
  "ws-enbw",
  "ws-bayern",
  "ws-rewe",
]);

export function readStoredWorkspaceId(): string {
  if (typeof window === "undefined") return DEFAULT_WORKSPACE_ID;
  try {
    const v = window.localStorage.getItem(WORKSPACE_STORAGE_KEY);
    if (v && isValidWorkspaceId(v)) return v;
    const legacy = window.localStorage.getItem("reqwise.selectedWorkspaceId");
    if (legacy && isValidWorkspaceId(legacy)) return legacy;
    if (legacy && LEGACY_WORKSPACE_IDS.has(legacy)) return DEFAULT_WORKSPACE_ID;
  } catch {
    /* ignore */
  }
  return DEFAULT_WORKSPACE_ID;
}

export function persistWorkspaceId(id: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(WORKSPACE_STORAGE_KEY, id);
  } catch {
    /* ignore */
  }
}

export const PROJECT_TEAM_OVERRIDES_KEY = "reqwise.projectTeamOverrides";

export function projectTeamsEqual(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  const sa = [...a].sort();
  const sb = [...b].sort();
  return sa.every((v, i) => v === sb[i]);
}

export function readProjectTeamOverrides(): Record<string, string[]> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(PROJECT_TEAM_OVERRIDES_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object") return {};
    const out: Record<string, string[]> = {};
    for (const [pid, val] of Object.entries(parsed as Record<string, unknown>)) {
      if (!(pid in PROJECT_WORKSPACE)) continue;
      if (!Array.isArray(val)) continue;
      const members = val.filter(
        (x): x is string => typeof x === "string" && x.trim().length > 0,
      );
      out[pid] = members;
    }
    return out;
  } catch {
    return {};
  }
}

export function persistProjectTeamOverrides(
  map: Record<string, string[]>,
): void {
  if (typeof window === "undefined") return;
  try {
    const toStore: Record<string, string[]> = {};
    for (const [pid, team] of Object.entries(map)) {
      if (!(pid in PROJECT_WORKSPACE)) continue;
      const base = PROJECT_TEAM_BY_ID[pid] ?? [];
      if (!projectTeamsEqual(team, base)) toStore[pid] = [...team];
    }
    window.localStorage.setItem(
      PROJECT_TEAM_OVERRIDES_KEY,
      JSON.stringify(toStore),
    );
  } catch {
    /* ignore */
  }
}
