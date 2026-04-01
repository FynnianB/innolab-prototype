/**
 * Aggregierte Demo-Daten zu Guidelines-Checks und Dokumentenprüfungen pro Projekt.
 * Dient Projekt-Tab „Qualität“ und Dashboard-Workspace-Aggregation.
 */

import { getProjectIdsForWorkspace } from "./workspaces";

export type GuidelineCategoryId =
  | "dsgvo"
  | "legal"
  | "corporate"
  | "style"
  | "ambiguity"
  | "structure";

export type DocReviewIssueTypeId =
  | "contradiction"
  | "duplication"
  | "ambiguity"
  | "inconsistency"
  | "gap";

export interface ProjectQualityInsights {
  projectId: string;
  guidelinesByCategory: Record<GuidelineCategoryId, number>;
  guidelinesBySeverity: {
    critical: number;
    major: number;
    minor: number;
  };
  docReviewByType: Record<DocReviewIssueTypeId, number>;
  /** Letzte vollständige Auswertung (Prototyp) */
  lastAnalyzed: string;
}

export const GUIDELINE_CATEGORY_META: Record<
  GuidelineCategoryId,
  { label: string; color: string; bg: string }
> = {
  dsgvo: { label: "DSGVO / Datenschutz", color: "#dc2626", bg: "#fef2f2" },
  legal: { label: "Recht & Verträge", color: "#9333ea", bg: "#faf5ff" },
  corporate: { label: "Unternehmensstandards", color: "#ea580c", bg: "#fff7ed" },
  style: { label: "Stil & Formulierung", color: "#0284c7", bg: "#f0f9ff" },
  ambiguity: { label: "Mehrdeutigkeit", color: "#d97706", bg: "#fffbeb" },
  structure: { label: "Struktur & Testbarkeit", color: "#64748b", bg: "#f8fafc" },
};

export const DOC_REVIEW_TYPE_META: Record<
  DocReviewIssueTypeId,
  { label: string; color: string; bg: string }
> = {
  contradiction: { label: "Widersprüche", color: "#ef4444", bg: "#fef2f2" },
  duplication: { label: "Dopplungen", color: "#f59e0b", bg: "#fef3c7" },
  ambiguity: { label: "Unklarheiten", color: "#d97706", bg: "#fffbeb" },
  inconsistency: { label: "Inkonsistenzen", color: "#8b5cf6", bg: "#ede9fe" },
  gap: { label: "Lücken", color: "#0ea5e9", bg: "#f0f9ff" },
};

/** Demo: leicht variierende Profile pro Projekt-ID */
const PROJECT_QUALITY_INSIGHTS: Record<string, ProjectQualityInsights> = {
  "P-101": {
    projectId: "P-101",
    guidelinesByCategory: {
      dsgvo: 4,
      legal: 2,
      corporate: 5,
      style: 6,
      ambiguity: 8,
      structure: 5,
    },
    guidelinesBySeverity: { critical: 2, major: 11, minor: 17 },
    docReviewByType: {
      contradiction: 4,
      duplication: 3,
      ambiguity: 7,
      inconsistency: 5,
      gap: 4,
    },
    lastAnalyzed: "30.03.2026, 09:40",
  },
  "P-102": {
    projectId: "P-102",
    guidelinesByCategory: {
      dsgvo: 2,
      legal: 3,
      corporate: 4,
      style: 5,
      ambiguity: 5,
      structure: 6,
    },
    guidelinesBySeverity: { critical: 1, major: 9, minor: 15 },
    docReviewByType: {
      contradiction: 2,
      duplication: 4,
      ambiguity: 5,
      inconsistency: 3,
      gap: 2,
    },
    lastAnalyzed: "29.03.2026, 16:15",
  },
  "P-103": {
    projectId: "P-103",
    guidelinesByCategory: {
      dsgvo: 5,
      legal: 4,
      corporate: 3,
      style: 4,
      ambiguity: 6,
      structure: 7,
    },
    guidelinesBySeverity: { critical: 3, major: 12, minor: 14 },
    docReviewByType: {
      contradiction: 5,
      duplication: 2,
      ambiguity: 4,
      inconsistency: 6,
      gap: 5,
    },
    lastAnalyzed: "28.03.2026, 11:00",
  },
  "P-201": {
    projectId: "P-201",
    guidelinesByCategory: {
      dsgvo: 6,
      legal: 3,
      corporate: 5,
      style: 4,
      ambiguity: 7,
      structure: 4,
    },
    guidelinesBySeverity: { critical: 2, major: 10, minor: 17 },
    docReviewByType: {
      contradiction: 3,
      duplication: 5,
      ambiguity: 6,
      inconsistency: 4,
      gap: 3,
    },
    lastAnalyzed: "30.03.2026, 08:20",
  },
  "P-202": {
    projectId: "P-202",
    guidelinesByCategory: {
      dsgvo: 3,
      legal: 2,
      corporate: 6,
      style: 7,
      ambiguity: 4,
      structure: 5,
    },
    guidelinesBySeverity: { critical: 1, major: 8, minor: 18 },
    docReviewByType: {
      contradiction: 2,
      duplication: 3,
      ambiguity: 4,
      inconsistency: 5,
      gap: 2,
    },
    lastAnalyzed: "29.03.2026, 14:30",
  },
  "P-203": {
    projectId: "P-203",
    guidelinesByCategory: {
      dsgvo: 4,
      legal: 5,
      corporate: 4,
      style: 8,
      ambiguity: 9,
      structure: 6,
    },
    guidelinesBySeverity: { critical: 2, major: 13, minor: 21 },
    docReviewByType: {
      contradiction: 4,
      duplication: 3,
      ambiguity: 8,
      inconsistency: 5,
      gap: 6,
    },
    lastAnalyzed: "27.03.2026, 10:05",
  },
  "P-301": {
    projectId: "P-301",
    guidelinesByCategory: {
      dsgvo: 3,
      legal: 2,
      corporate: 4,
      style: 5,
      ambiguity: 5,
      structure: 4,
    },
    guidelinesBySeverity: { critical: 1, major: 7, minor: 15 },
    docReviewByType: {
      contradiction: 2,
      duplication: 2,
      ambiguity: 4,
      inconsistency: 3,
      gap: 3,
    },
    lastAnalyzed: "30.03.2026, 07:55",
  },
  "P-302": {
    projectId: "P-302",
    guidelinesByCategory: {
      dsgvo: 2,
      legal: 3,
      corporate: 5,
      style: 4,
      ambiguity: 6,
      structure: 5,
    },
    guidelinesBySeverity: { critical: 1, major: 9, minor: 15 },
    docReviewByType: {
      contradiction: 3,
      duplication: 4,
      ambiguity: 5,
      inconsistency: 4,
      gap: 2,
    },
    lastAnalyzed: "29.03.2026, 18:00",
  },
  "P-303": {
    projectId: "P-303",
    guidelinesByCategory: {
      dsgvo: 5,
      legal: 4,
      corporate: 3,
      style: 6,
      ambiguity: 7,
      structure: 8,
    },
    guidelinesBySeverity: { critical: 2, major: 11, minor: 20 },
    docReviewByType: {
      contradiction: 4,
      duplication: 3,
      ambiguity: 6,
      inconsistency: 5,
      gap: 4,
    },
    lastAnalyzed: "26.03.2026, 15:40",
  },
  "P-401": {
    projectId: "P-401",
    guidelinesByCategory: {
      dsgvo: 3,
      legal: 2,
      corporate: 5,
      style: 6,
      ambiguity: 8,
      structure: 5,
    },
    guidelinesBySeverity: { critical: 2, major: 10, minor: 17 },
    docReviewByType: {
      contradiction: 4,
      duplication: 2,
      ambiguity: 7,
      inconsistency: 4,
      gap: 3,
    },
    lastAnalyzed: "30.03.2026, 12:10",
  },
  "P-402": {
    projectId: "P-402",
    guidelinesByCategory: {
      dsgvo: 2,
      legal: 3,
      corporate: 4,
      style: 5,
      ambiguity: 5,
      structure: 4,
    },
    guidelinesBySeverity: { critical: 1, major: 8, minor: 14 },
    docReviewByType: {
      contradiction: 2,
      duplication: 3,
      ambiguity: 4,
      inconsistency: 3,
      gap: 2,
    },
    lastAnalyzed: "29.03.2026, 09:30",
  },
  "P-403": {
    projectId: "P-403",
    guidelinesByCategory: {
      dsgvo: 4,
      legal: 3,
      corporate: 4,
      style: 7,
      ambiguity: 10,
      structure: 7,
    },
    guidelinesBySeverity: { critical: 3, major: 14, minor: 18 },
    docReviewByType: {
      contradiction: 5,
      duplication: 4,
      ambiguity: 9,
      inconsistency: 6,
      gap: 5,
    },
    lastAnalyzed: "25.03.2026, 13:25",
  },
  "P-501": {
    projectId: "P-501",
    guidelinesByCategory: {
      dsgvo: 3,
      legal: 2,
      corporate: 5,
      style: 4,
      ambiguity: 5,
      structure: 4,
    },
    guidelinesBySeverity: { critical: 1, major: 8, minor: 14 },
    docReviewByType: {
      contradiction: 3,
      duplication: 2,
      ambiguity: 4,
      inconsistency: 4,
      gap: 3,
    },
    lastAnalyzed: "30.03.2026, 06:45",
  },
  "P-502": {
    projectId: "P-502",
    guidelinesByCategory: {
      dsgvo: 2,
      legal: 2,
      corporate: 4,
      style: 6,
      ambiguity: 6,
      structure: 5,
    },
    guidelinesBySeverity: { critical: 1, major: 9, minor: 15 },
    docReviewByType: {
      contradiction: 2,
      duplication: 3,
      ambiguity: 5,
      inconsistency: 4,
      gap: 3,
    },
    lastAnalyzed: "29.03.2026, 17:20",
  },
  "P-503": {
    projectId: "P-503",
    guidelinesByCategory: {
      dsgvo: 4,
      legal: 3,
      corporate: 5,
      style: 5,
      ambiguity: 6,
      structure: 6,
    },
    guidelinesBySeverity: { critical: 2, major: 10, minor: 17 },
    docReviewByType: {
      contradiction: 3,
      duplication: 4,
      ambiguity: 5,
      inconsistency: 5,
      gap: 4,
    },
    lastAnalyzed: "28.03.2026, 20:10",
  },
};

const EMPTY_GUIDELINES: Record<GuidelineCategoryId, number> = {
  dsgvo: 0,
  legal: 0,
  corporate: 0,
  style: 0,
  ambiguity: 0,
  structure: 0,
};

const EMPTY_DOC: Record<DocReviewIssueTypeId, number> = {
  contradiction: 0,
  duplication: 0,
  ambiguity: 0,
  inconsistency: 0,
  gap: 0,
};

export function getProjectQualityInsights(
  projectId: string,
): ProjectQualityInsights | null {
  return PROJECT_QUALITY_INSIGHTS[projectId] ?? null;
}

export type WorkspaceQualityAggregate = {
  guidelinesByCategory: Record<GuidelineCategoryId, number>;
  guidelinesBySeverity: { critical: number; major: number; minor: number };
  docReviewByType: Record<DocReviewIssueTypeId, number>;
  totalGuidelineFindings: number;
  totalDocIssues: number;
  projectCount: number;
  /** Gemischte Rangliste für „häufigste Problemarten“ */
  topProblems: {
    key: string;
    label: string;
    count: number;
    source: "guidelines" | "documents";
    color: string;
  }[];
};

/** Rangliste häufigster Kategorien/Typen für ein einzelnes Projekt */
export function getTopProblemsForProject(
  q: ProjectQualityInsights,
  limit = 8,
): WorkspaceQualityAggregate["topProblems"] {
  const ranked: WorkspaceQualityAggregate["topProblems"] = [];
  (Object.keys(q.guidelinesByCategory) as GuidelineCategoryId[]).forEach((k) => {
    const c = q.guidelinesByCategory[k];
    if (c > 0) {
      ranked.push({
        key: `g-${k}`,
        label: GUIDELINE_CATEGORY_META[k].label,
        count: c,
        source: "guidelines",
        color: GUIDELINE_CATEGORY_META[k].color,
      });
    }
  });
  (Object.keys(q.docReviewByType) as DocReviewIssueTypeId[]).forEach((k) => {
    const c = q.docReviewByType[k];
    if (c > 0) {
      ranked.push({
        key: `d-${k}`,
        label: DOC_REVIEW_TYPE_META[k].label,
        count: c,
        source: "documents",
        color: DOC_REVIEW_TYPE_META[k].color,
      });
    }
  });
  ranked.sort((a, b) => b.count - a.count);
  return ranked.slice(0, limit);
}

function addGuidelineCategories(
  a: Record<GuidelineCategoryId, number>,
  b: Record<GuidelineCategoryId, number>,
): Record<GuidelineCategoryId, number> {
  return {
    dsgvo: a.dsgvo + b.dsgvo,
    legal: a.legal + b.legal,
    corporate: a.corporate + b.corporate,
    style: a.style + b.style,
    ambiguity: a.ambiguity + b.ambiguity,
    structure: a.structure + b.structure,
  };
}

function addDocTypes(
  a: Record<DocReviewIssueTypeId, number>,
  b: Record<DocReviewIssueTypeId, number>,
): Record<DocReviewIssueTypeId, number> {
  return {
    contradiction: a.contradiction + b.contradiction,
    duplication: a.duplication + b.duplication,
    ambiguity: a.ambiguity + b.ambiguity,
    inconsistency: a.inconsistency + b.inconsistency,
    gap: a.gap + b.gap,
  };
}

export function aggregateWorkspaceQualityInsights(
  workspaceId: string,
): WorkspaceQualityAggregate {
  const projectIds = getProjectIdsForWorkspace(workspaceId);
  let guidelinesByCategory: Record<GuidelineCategoryId, number> = {
    ...EMPTY_GUIDELINES,
  };
  let guidelinesBySeverity = { critical: 0, major: 0, minor: 0 };
  let docReviewByType: Record<DocReviewIssueTypeId, number> = { ...EMPTY_DOC };
  let n = 0;

  for (const pid of projectIds) {
    const q = PROJECT_QUALITY_INSIGHTS[pid];
    if (!q) continue;
    n += 1;
    guidelinesByCategory = addGuidelineCategories(
      guidelinesByCategory,
      q.guidelinesByCategory,
    );
    guidelinesBySeverity.critical += q.guidelinesBySeverity.critical;
    guidelinesBySeverity.major += q.guidelinesBySeverity.major;
    guidelinesBySeverity.minor += q.guidelinesBySeverity.minor;
    docReviewByType = addDocTypes(docReviewByType, q.docReviewByType);
  }

  const totalGuidelineFindings =
    guidelinesBySeverity.critical +
    guidelinesBySeverity.major +
    guidelinesBySeverity.minor;
  const totalDocIssues = Object.values(docReviewByType).reduce((s, v) => s + v, 0);

  const ranked: WorkspaceQualityAggregate["topProblems"] = [];

  (Object.keys(guidelinesByCategory) as GuidelineCategoryId[]).forEach((k) => {
    const c = guidelinesByCategory[k];
    if (c > 0) {
      ranked.push({
        key: `g-${k}`,
        label: GUIDELINE_CATEGORY_META[k].label,
        count: c,
        source: "guidelines",
        color: GUIDELINE_CATEGORY_META[k].color,
      });
    }
  });

  (Object.keys(docReviewByType) as DocReviewIssueTypeId[]).forEach((k) => {
    const c = docReviewByType[k];
    if (c > 0) {
      ranked.push({
        key: `d-${k}`,
        label: DOC_REVIEW_TYPE_META[k].label,
        count: c,
        source: "documents",
        color: DOC_REVIEW_TYPE_META[k].color,
      });
    }
  });

  ranked.sort((a, b) => b.count - a.count);

  return {
    guidelinesByCategory,
    guidelinesBySeverity,
    docReviewByType,
    totalGuidelineFindings,
    totalDocIssues,
    projectCount: n,
    topProblems: ranked.slice(0, 8),
  };
}
