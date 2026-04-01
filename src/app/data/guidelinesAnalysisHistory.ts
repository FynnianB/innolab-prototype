/**
 * Demo: abgeschlossene Guidelines-/Dokumentprüfungen (keine Persistenz).
 */

import { guidelinesDemoFileLabelFromSeed } from "./guidelinesCheckDemo";

export type GuidelinesAnalysisStatus = "abgeschlossen" | "fehlgeschlagen";

export interface GuidelinesAnalysisFindingCounts {
  critical: number;
  major: number;
  minor: number;
}

export interface GuidelinesAnalysisRun {
  id: string;
  workspaceId: string;
  projectId: string;
  documentLabel: string;
  finishedAt: string;
  status: GuidelinesAnalysisStatus;
  findingCounts: GuidelinesAnalysisFindingCounts;
  /** Optional: Guidelines-Quote 0–100 */
  quote?: number;
}

const RUNS: GuidelinesAnalysisRun[] = (
  [
  {
    id: "GA-001",
    workspaceId: "ws-bmw",
    projectId: "P-101",
    finishedAt: "31.03.2026, 08:12",
    status: "abgeschlossen",
    findingCounts: { critical: 2, major: 11, minor: 17 },
    quote: 72,
  },
  {
    id: "GA-002",
    workspaceId: "ws-bmw",
    projectId: "P-102",
    finishedAt: "30.03.2026, 16:45",
    status: "abgeschlossen",
    findingCounts: { critical: 1, major: 9, minor: 15 },
    quote: 78,
  },
  {
    id: "GA-003",
    workspaceId: "ws-bmw",
    projectId: "P-103",
    finishedAt: "29.03.2026, 11:20",
    status: "abgeschlossen",
    findingCounts: { critical: 3, major: 12, minor: 14 },
    quote: 69,
  },
  {
    id: "GA-004",
    workspaceId: "ws-bmw",
    projectId: "P-101",
    finishedAt: "25.03.2026, 14:00",
    status: "abgeschlossen",
    findingCounts: { critical: 3, major: 13, minor: 18 },
    quote: 68,
  },
  {
    id: "GA-005",
    workspaceId: "ws-vw",
    projectId: "P-201",
    finishedAt: "31.03.2026, 07:55",
    status: "abgeschlossen",
    findingCounts: { critical: 2, major: 10, minor: 16 },
    quote: 74,
  },
  {
    id: "GA-006",
    workspaceId: "ws-vw",
    projectId: "P-202",
    finishedAt: "30.03.2026, 19:10",
    status: "abgeschlossen",
    findingCounts: { critical: 1, major: 8, minor: 14 },
    quote: 81,
  },
  {
    id: "GA-007",
    workspaceId: "ws-vw",
    projectId: "P-203",
    finishedAt: "28.03.2026, 09:30",
    status: "fehlgeschlagen",
    findingCounts: { critical: 0, major: 0, minor: 0 },
  },
  {
    id: "GA-008",
    workspaceId: "ws-vw",
    projectId: "P-201",
    finishedAt: "22.03.2026, 12:15",
    status: "abgeschlossen",
    findingCounts: { critical: 2, major: 11, minor: 17 },
    quote: 71,
  },
  {
    id: "GA-009",
    workspaceId: "ws-mercedes",
    projectId: "P-301",
    finishedAt: "31.03.2026, 06:40",
    status: "abgeschlossen",
    findingCounts: { critical: 2, major: 10, minor: 16 },
    quote: 75,
  },
  {
    id: "GA-010",
    workspaceId: "ws-mercedes",
    projectId: "P-302",
    finishedAt: "29.03.2026, 15:22",
    status: "abgeschlossen",
    findingCounts: { critical: 1, major: 9, minor: 15 },
    quote: 79,
  },
  {
    id: "GA-011",
    workspaceId: "ws-mercedes",
    projectId: "P-303",
    finishedAt: "27.03.2026, 10:05",
    status: "abgeschlossen",
    findingCounts: { critical: 3, major: 12, minor: 14 },
    quote: 67,
  },
  {
    id: "GA-012",
    workspaceId: "ws-audi",
    projectId: "P-401",
    finishedAt: "30.03.2026, 13:50",
    status: "abgeschlossen",
    findingCounts: { critical: 2, major: 10, minor: 16 },
    quote: 73,
  },
  {
    id: "GA-013",
    workspaceId: "ws-audi",
    projectId: "P-402",
    finishedAt: "29.03.2026, 08:33",
    status: "abgeschlossen",
    findingCounts: { critical: 1, major: 9, minor: 15 },
    quote: 80,
  },
  {
    id: "GA-014",
    workspaceId: "ws-audi",
    projectId: "P-403",
    finishedAt: "26.03.2026, 17:40",
    status: "abgeschlossen",
    findingCounts: { critical: 2, major: 11, minor: 18 },
    quote: 70,
  },
  {
    id: "GA-015",
    workspaceId: "ws-porsche",
    projectId: "P-501",
    finishedAt: "31.03.2026, 05:18",
    status: "abgeschlossen",
    findingCounts: { critical: 2, major: 10, minor: 16 },
    quote: 76,
  },
  {
    id: "GA-016",
    workspaceId: "ws-porsche",
    projectId: "P-502",
    finishedAt: "29.03.2026, 17:20",
    status: "abgeschlossen",
    findingCounts: { critical: 1, major: 9, minor: 15 },
    quote: 77,
  },
  {
    id: "GA-017",
    workspaceId: "ws-porsche",
    projectId: "P-503",
    finishedAt: "28.03.2026, 20:10",
    status: "abgeschlossen",
    findingCounts: { critical: 2, major: 10, minor: 17 },
    quote: 72,
  },
  {
    id: "GA-018",
    workspaceId: "ws-bmw",
    projectId: "P-102",
    finishedAt: "20.03.2026, 09:00",
    status: "abgeschlossen",
    findingCounts: { critical: 2, major: 10, minor: 16 },
    quote: 74,
  },
  {
    id: "GA-019",
    workspaceId: "ws-vw",
    projectId: "P-202",
    finishedAt: "18.03.2026, 14:30",
    status: "abgeschlossen",
    findingCounts: { critical: 1, major: 8, minor: 13 },
    quote: 82,
  },
  {
    id: "GA-020",
    workspaceId: "ws-mercedes",
    projectId: "P-301",
    finishedAt: "15.03.2026, 11:00",
    status: "abgeschlossen",
    findingCounts: { critical: 2, major: 11, minor: 17 },
    quote: 72,
  },
] as Omit<GuidelinesAnalysisRun, "documentLabel">[]
).map((r) => ({
  ...r,
  documentLabel: guidelinesDemoFileLabelFromSeed(
    `${r.id}_${r.projectId}_${r.finishedAt}`,
  ),
}));

export function totalFindings(c: GuidelinesAnalysisFindingCounts): number {
  return c.critical + c.major + c.minor;
}

/**
 * Läufe für einen Workspace, neueste zuerst. Optional nur ein Projekt.
 */
export function getGuidelinesHistory(
  workspaceId: string,
  projectId?: string | null,
): GuidelinesAnalysisRun[] {
  let list = RUNS.filter((r) => r.workspaceId === workspaceId);
  if (projectId) {
    list = list.filter((r) => r.projectId === projectId);
  }
  return list.sort((a, b) => {
    const ta = parseDemoDate(b.finishedAt) - parseDemoDate(a.finishedAt);
    return ta;
  });
}

function parseDemoDate(s: string): number {
  const [d, t] = s.split(", ");
  const [day, month, year] = d.split(".").map(Number);
  const time = t?.split(":").map(Number) ?? [0, 0];
  return new Date(year, month - 1, day, time[0], time[1]).getTime();
}

