/* ------------------------------------------------------------------ */
/*  Workspace ↔ Projekt-Zuordnung (eine Quelle der Wahrheit)           */
/* ------------------------------------------------------------------ */

import type { Story } from "./stories";

export interface Workspace {
  id: string;
  name: string;
  /** Relativer Pfad unter `public/`, z. B. `/logos/capgemini.svg` */
  logoSrc?: string;
}

export const WORKSPACE_STORAGE_KEY = "reqwise.selectedWorkspaceId";

export const DEFAULT_WORKSPACE_ID = "ws-capgemini";

/**
 * Kunden-/Marken-Logos (Wikimedia Commons / Marken-SVGs lokal unter `public/logos/`).
 */
export const PROJECT_LOGO_BY_ID: Record<string, string> = {
  "P-007": "/logos/db.svg",
  "P-008": "/logos/allianz.svg",
  "P-009": "/logos/enbw.svg",
  "P-010": "/logos/bayern.svg",
  "P-011": "/logos/rewe.svg",
};

/** Workspaces wie in der Topbar (Anzeigenamen). */
export const WORKSPACES: Workspace[] = [
  {
    id: "ws-capgemini",
    name: "Capgemini",
    logoSrc: "/logos/capgemini.svg",
  },
  { id: "ws-automobil", name: "Automobil-Projekt Alpha" },
  { id: "ws-banking", name: "Banking Platform v3" },
  { id: "ws-healthcare", name: "Healthcare Portal" },
  { id: "ws-digital", name: "Digital & Growth" },
];

/**
 * Projekt-IDs aus Projects.tsx → Workspace.
 * Mehrere Projekte pro Workspace (z. B. Digital & Growth).
 */
export const PROJECT_WORKSPACE: Record<string, string> = {
  "P-001": "ws-automobil",
  "P-002": "ws-banking",
  "P-003": "ws-healthcare",
  "P-004": "ws-digital",
  "P-005": "ws-digital",
  "P-006": "ws-digital",
  "P-007": "ws-capgemini",
  "P-008": "ws-capgemini",
  "P-009": "ws-capgemini",
  "P-010": "ws-capgemini",
  "P-011": "ws-capgemini",
};

/**
 * Standard-Projektteams (Initialen). Prototyp-Nutzerin Sarah entspricht **SM**
 * (vgl. Dashboard / Versionshistorie „Dr. Sarah Müller“).
 * Dashboard „Letzte Projekte“ = nur Projekte, deren Team SM enthält.
 */
export const PROTOTYPE_USER_INITIALS = "SM";

/** Default-Teams pro Projekt (Quelle für Anzeige + Vergleich bei localStorage-Overrides). */
export const PROJECT_TEAM_BY_ID: Record<string, string[]> = {
  "P-001": ["SM", "TK", "AH", "JR"],
  "P-002": ["SM", "BW"],
  "P-003": ["SM", "ML", "KD"],
  "P-004": ["TK", "AH"],
  "P-005": ["JR"],
  "P-006": ["SM", "BW", "ML"],
  "P-007": ["SM", "MK", "SR", "LB", "TH"],
  "P-008": ["SM", "LB", "MK", "AH"],
  "P-009": ["SM", "SR", "TH", "BW"],
  "P-010": ["SM", "MK", "JR"],
  "P-011": ["TH", "LB"],
};

/** Anzeigenamen für den Team-Tab (Initialen → Person, Prototyp). */
export const TEAM_MEMBER_LABELS: Record<string, string> = {
  SM: "Sarah Müller (Sie)",
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

/** Alle zuweisbaren Kolleg:innen (für „Hinzufügen“ im Team-Tab). */
export const ALL_TEAM_ROSTER_INITIALS: string[] = Object.keys(
  TEAM_MEMBER_LABELS,
).sort();

/**
 * Story-Feld `project` (Name) → Workspace.
 * Muss mit den Namen in Projects.tsx / stories.ts übereinstimmen.
 */
export const STORY_PROJECT_TO_WORKSPACE: Record<string, string> = {
  "Automobil-Plattform Redesign": "ws-automobil",
  "Banking App v3.2 Migration": "ws-banking",
  "Healthcare Portal DSGVO": "ws-healthcare",
  "Deutsche Bahn — Reisenden-Navigator 2.0": "ws-capgemini",
  "Allianz — Schaden-FNOL Portal": "ws-capgemini",
  "EnBW — MeinEnBW Transformation": "ws-capgemini",
  "Freistaat Bayern — Bürgerportal Suite": "ws-capgemini",
  "REWE digital — Filialbestand Echtzeit": "ws-capgemini",
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

/**
 * Namen/Beschreibungen für globale Suche (IDs wie in Projects.tsx / PROJECT_WORKSPACE).
 */
export const PROJECT_SEARCH_META: Record<
  string,
  { name: string; description: string }
> = {
  "P-001": {
    name: "Automobil-Plattform Redesign",
    description:
      "Komplettes Redesign der Infotainment-Plattform inkl. OTA-Update-Funktionalität",
  },
  "P-002": {
    name: "Banking App v3.2 Migration",
    description:
      "Migration der Legacy-Banking-App auf neue Microservice-Architektur",
  },
  "P-003": {
    name: "Healthcare Portal DSGVO",
    description:
      "DSGVO-konforme Patientenportal-Spezifikation für Kliniken",
  },
  "P-004": {
    name: "E-Commerce Checkout Flow",
    description:
      "Optimierung des Checkout-Prozesses für höhere Conversion Rate",
  },
  "P-005": {
    name: "IoT Dashboard Spezifikation",
    description:
      "Real-time Dashboard für IoT-Sensordaten in Produktionsumgebungen",
  },
  "P-006": {
    name: "CRM Integration Suite",
    description:
      "Salesforce und HubSpot Integration für die Vertriebsabteilung",
  },
  "P-007": {
    name: "Deutsche Bahn — Reisenden-Navigator 2.0",
    description:
      "Ausbau DB Navigator: Störungskommunikation, Touch&Travel, barrierefreie Reisekette",
  },
  "P-008": {
    name: "Allianz — Schaden-FNOL Portal",
    description:
      "First Notice of Loss: Self-Service Schadenmeldung mit Medien-Upload und Status-Tracking",
  },
  "P-009": {
    name: "EnBW — MeinEnBW Transformation",
    description:
      "B2C-Energieportal: Vertragswechsel, dynamische Tarife, Verbrauchstransparenz und E-Mobilität",
  },
  "P-010": {
    name: "Freistaat Bayern — Bürgerportal Suite",
    description:
      "Landesweite digitale Antragswege, BAYERN-ID-Anbindung und Once-Only-Prinzip",
  },
  "P-011": {
    name: "REWE digital — Filialbestand Echtzeit",
    description:
      "Omnichannel: Lagerbestand Filiale vs. Online, Reservierung und Abholfenster",
  },
};

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

export function readStoredWorkspaceId(): string {
  if (typeof window === "undefined") return DEFAULT_WORKSPACE_ID;
  try {
    const v = window.localStorage.getItem(WORKSPACE_STORAGE_KEY);
    if (v && isValidWorkspaceId(v)) return v;
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

/* ------------------------------------------------------------------ */
/*  Projektteams: Overrides (localStorage)                            */
/* ------------------------------------------------------------------ */

export const PROJECT_TEAM_OVERRIDES_KEY = "reqwise.projectTeamOverrides";

export function projectTeamsEqual(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  const sa = [...a].sort();
  const sb = [...b].sort();
  return sa.every((v, i) => v === sb[i]);
}

/** Nur Projekte mit bekannter ID; Arrays aus nicht-leeren Strings. */
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
