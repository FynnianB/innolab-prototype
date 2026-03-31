/* ------------------------------------------------------------------ */
/*  Workspace ↔ Projekt-Zuordnung (eine Quelle der Wahrheit)           */
/* ------------------------------------------------------------------ */

import type { Story } from "./stories";

export interface Workspace {
  id: string;
  name: string;
}

export const WORKSPACE_STORAGE_KEY = "reqwise.selectedWorkspaceId";

export const DEFAULT_WORKSPACE_ID = "ws-automobil";

/** Workspaces wie in der Topbar (Anzeigenamen). */
export const WORKSPACES: Workspace[] = [
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
};

/**
 * Story-Feld `project` (Name) → Workspace.
 * Muss mit den Namen in Projects.tsx / stories.ts übereinstimmen.
 */
export const STORY_PROJECT_TO_WORKSPACE: Record<string, string> = {
  "Automobil-Plattform Redesign": "ws-automobil",
  "Banking App v3.2 Migration": "ws-banking",
  "Healthcare Portal DSGVO": "ws-healthcare",
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
