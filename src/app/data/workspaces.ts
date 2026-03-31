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
