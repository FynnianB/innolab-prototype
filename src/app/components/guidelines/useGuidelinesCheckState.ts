import { useState, useCallback } from "react";
import type {
  FixLogEntry,
  GuidelineFinding,
  GuidelinesPhase,
  ProjectData,
} from "../../data/guidelinesCheckDemo";

export function useGuidelinesCheckState() {
  const [phase, setPhase] = useState<GuidelinesPhase>("project-select");
  const [selectedProject, setSelectedProject] = useState<ProjectData | null>(
    null,
  );
  /** Gesetzt bei simuliertem/echtem Upload; sonst null → Titel aus `project.document`. */
  const [reviewFileLabel, setReviewFileLabel] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [documentTexts, setDocumentTexts] = useState<Record<number, string>>(
    {},
  );
  const [selectedIssue, setSelectedIssue] = useState<string | null>(null);
  const [severityFilter, setSeverityFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [fixedIssues, setFixedIssues] = useState<Set<string>>(new Set());
  const [showSuggestion, setShowSuggestion] = useState<string | null>(null);
  const [autoFixDialog, setAutoFixDialog] = useState<GuidelineFinding | null>(
    null,
  );
  const [fixLog, setFixLog] = useState<FixLogEntry[]>([]);
  const [showFixLog, setShowFixLog] = useState(false);

  const handleProjectSelect = useCallback(
    (project: ProjectData, opts?: { fileLabel?: string }) => {
      setSelectedProject(project);
      setReviewFileLabel(opts?.fileLabel?.trim() ? opts.fileLabel.trim() : null);
      const texts: Record<number, string> = {};
      project.pages.forEach((p) => {
        texts[p.pageNum] = p.content;
      });
      setDocumentTexts(texts);
      setCurrentPage(1);
      setPhase("review");
      setFixedIssues(new Set());
      setSeverityFilter("all");
      setCategoryFilter("all");
      setSelectedIssue(null);
    },
    [],
  );

  const resetCheckFlow = useCallback(() => {
    setPhase("project-select");
    setSelectedProject(null);
    setReviewFileLabel(null);
    setDocumentTexts({});
    setFixedIssues(new Set());
  }, []);

  const handleAutoFix = useCallback((issue: GuidelineFinding) => {
    setFixedIssues((prev) => new Set(prev).add(issue.id));
    setDocumentTexts((prev) => {
      const pageText = prev[issue.page];
      if (pageText && pageText.includes(issue.before)) {
        return {
          ...prev,
          [issue.page]: pageText.replace(issue.before, issue.after),
        };
      }
      return prev;
    });
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}:${now.getSeconds().toString().padStart(2, "0")}`;
    setFixLog((prev) => [
      {
        id: `LOG-${prev.length + 1}`,
        issueId: issue.id,
        issueTitle: issue.title,
        category: issue.category,
        severity: issue.severity,
        rule: issue.rule,
        before: issue.before,
        after: issue.after,
        timestamp: timeStr,
        appliedBy: "KI Auto-Fix",
      },
      ...prev,
    ]);
  }, []);

  const handleAutoFixAll = useCallback(
    (project: ProjectData, currentFixLogLength: number) => {
      const activeIssuesList = project.issues.filter(
        (i) => !fixedIssues.has(i.id),
      );
      setDocumentTexts((prev) => {
        const updated = { ...prev };
        activeIssuesList.forEach((issue) => {
          const pageText = updated[issue.page];
          if (pageText && pageText.includes(issue.before)) {
            updated[issue.page] = pageText.replace(issue.before, issue.after);
          }
        });
        return updated;
      });
      const now = new Date();
      const timeStr = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}:${now.getSeconds().toString().padStart(2, "0")}`;
      const newEntries: FixLogEntry[] = activeIssuesList.map((issue, idx) => ({
        id: `LOG-${currentFixLogLength + idx + 1}`,
        issueId: issue.id,
        issueTitle: issue.title,
        category: issue.category,
        severity: issue.severity,
        rule: issue.rule,
        before: issue.before,
        after: issue.after,
        timestamp: timeStr,
        appliedBy: "KI Auto-Fix (Batch)",
      }));
      setFixLog((prev) => [...newEntries.reverse(), ...prev]);
      activeIssuesList.forEach((i) =>
        setFixedIssues((prev) => new Set(prev).add(i.id)),
      );
    },
    [fixedIssues],
  );

  return {
    phase,
    setPhase,
    selectedProject,
    setSelectedProject,
    reviewFileLabel,
    currentPage,
    setCurrentPage,
    documentTexts,
    setDocumentTexts,
    selectedIssue,
    setSelectedIssue,
    severityFilter,
    setSeverityFilter,
    categoryFilter,
    setCategoryFilter,
    fixedIssues,
    setFixedIssues,
    showSuggestion,
    setShowSuggestion,
    autoFixDialog,
    setAutoFixDialog,
    fixLog,
    setFixLog,
    showFixLog,
    setShowFixLog,
    handleProjectSelect,
    resetCheckFlow,
    handleAutoFix,
    handleAutoFixAll,
  };
}

export type GuidelinesCheckState = ReturnType<typeof useGuidelinesCheckState>;
