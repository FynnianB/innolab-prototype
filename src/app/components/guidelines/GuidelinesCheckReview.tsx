import type { ReactNode } from "react";
import type { NavigateFunction } from "react-router";
import {
  CheckCircle2,
  Wand2,
  BookOpen,
  X,
  ArrowLeft,
  FileText,
  Eye,
  ArrowDown,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Clock,
  ClipboardList,
  ChevronUp,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../ui/dialog';
import { PROJECT_LOGO_BY_ID } from '../../data/workspaces';
import {
  categoryConfig,
  severityConfig,
  splitDocumentDisplayLabel,
  type IssueCategory,
} from "../../data/guidelinesCheckDemo";
import type { GuidelinesCheckState } from "./useGuidelinesCheckState";

export interface GuidelinesCheckReviewProps {
  check: GuidelinesCheckState;
  navigate: NavigateFunction;
  setShowExportDialog: (open: boolean) => void;
  setExportScope: (
    scope: "stories" | "guidelines" | "tickets" | "all",
  ) => void;
  onNavigateToRules?: () => void;
}

export function GuidelinesCheckReview({
  check,
  navigate,
  setShowExportDialog,
  setExportScope,
  onNavigateToRules,
}: GuidelinesCheckReviewProps) {
  const {
    selectedProject,
    reviewFileLabel,
    currentPage,
    setCurrentPage,
    documentTexts,
    selectedIssue,
    setSelectedIssue,
    severityFilter,
    setSeverityFilter,
    categoryFilter,
    setCategoryFilter,
    fixedIssues,
    showSuggestion,
    setShowSuggestion,
    autoFixDialog,
    setAutoFixDialog,
    fixLog,
    showFixLog,
    setShowFixLog,
    resetCheckFlow,
    handleAutoFix,
    handleAutoFixAll,
  } = check;

  if (!selectedProject) return null;

  const docParts = splitDocumentDisplayLabel(selectedProject.document);
  const documentTitle =
    reviewFileLabel?.trim() || docParts.title;

  const totalPages = selectedProject.pages.length;
  const activeIssues = selectedProject.issues.filter((i) => !fixedIssues.has(i.id));
  const currentPageIssues = activeIssues.filter((i) => i.page === currentPage);
  const filteredIssues = selectedProject.issues.filter((issue) => {
    if (fixedIssues.has(issue.id)) return false;
    if (severityFilter !== "all" && issue.severity !== severityFilter) return false;
    if (categoryFilter !== "all" && issue.category !== categoryFilter) return false;
    return true;
  });

  const totalScore = Math.round(
    100 - ((selectedProject.issues.length - fixedIssues.size) / Math.max(selectedProject.issues.length, 1)) * 35
  );

  const criticalCount = activeIssues.filter((i) => i.severity === "critical").length;
  const majorCount = activeIssues.filter((i) => i.severity === "major").length;
  const minorCount = activeIssues.filter((i) => i.severity === "minor").length;

  const categoryStats = Object.entries(categoryConfig).map(([key, config]) => {
    const total = selectedProject.issues.filter((i) => i.category === key).length;
    const open = activeIssues.filter((i) => i.category === key).length;
    const pct = total > 0 ? Math.round(((total - open) / total) * 100) : 100;
    return { key, ...config, total, open, percentage: pct };
  }).filter((c) => c.total > 0);

  const renderHighlightedText = () => {
    const text = documentTexts[currentPage] || "";
    const lines = text.split("\n");
    const pageActiveIssues = activeIssues.filter((i) => i.page === currentPage);

    return lines.map((line, lineIdx) => {
      if (!line.trim()) return <div key={lineIdx} className="h-3" />;

      const isMainHeading = /^\d+\.\s/.test(line) && !/^\d+\.\d+/.test(line);
      const isSubHeading = /^\d+\.\d+\s/.test(line);

      if (isMainHeading) {
        return (
          <p key={lineIdx} className="text-[15px] text-[#1e1e2e] mt-5 mb-2" style={{ fontWeight: 600 }}>
            {line}
          </p>
        );
      }
      if (isSubHeading) {
        return (
          <p key={lineIdx} className="text-[14px] text-[#1e1e2e] mt-4 mb-1" style={{ fontWeight: 500 }}>
            {line}
          </p>
        );
      }

      let segments: ReactNode[] = [];
      let remaining = line;
      let segIdx = 0;

      for (const issue of pageActiveIssues) {
        const idx = remaining.indexOf(issue.textHighlight);
        if (idx !== -1) {
          if (idx > 0) {
            segments.push(<span key={segIdx++}>{remaining.slice(0, idx)}</span>);
          }
          const catConf = categoryConfig[issue.category];
          const sevConf = severityConfig[issue.severity];
          segments.push(
            <Tooltip key={segIdx++}>
              <TooltipTrigger asChild>
                <span
                  className="cursor-pointer px-0.5 rounded transition-all duration-200 hover:opacity-80"
                  style={{
                    backgroundColor: `${catConf.color}12`,
                    borderBottom: `2px solid ${catConf.color}`,
                    color: selectedIssue === issue.id ? catConf.color : undefined,
                  }}
                  onClick={() => setSelectedIssue(issue.id)}
                >
                  {issue.textHighlight}
                </span>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-[320px]">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="secondary" className="text-[10px] px-1" style={{ backgroundColor: catConf.bg, color: catConf.color, fontWeight: 600 }}>{catConf.label}</Badge>
                  <Badge variant="secondary" className="text-[10px] px-1" style={{ backgroundColor: sevConf.bg, color: sevConf.color, fontWeight: 600 }}>{sevConf.label}</Badge>
                </div>
                <p className="text-[12px]" style={{ fontWeight: 500 }}>{issue.title}</p>
                <p className="text-[11px] opacity-80 mt-0.5">{issue.rule}</p>
              </TooltipContent>
            </Tooltip>
          );
          remaining = remaining.slice(idx + issue.textHighlight.length);
        }
      }

      if (remaining) {
        segments.push(<span key={segIdx++}>{remaining}</span>);
      }
      if (segments.length === 0) {
        segments = [<span key={0}>{line}</span>];
      }

      return (
        <p key={lineIdx} className="text-[13px] text-[#475569] leading-[1.85]">
          {segments}
        </p>
      );
    });
  };

  return (
    <TooltipProvider>
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="px-8 py-4 border-b border-border bg-white flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => resetCheckFlow()}
                className="text-muted-foreground gap-1 shrink-0"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden md:inline">Zurück zu Dokumente prüfen</span>
                <span className="md:hidden">Zurück</span>
              </Button>
              <div className="flex items-start gap-3 min-w-0">
                <div className="w-11 h-11 rounded-xl border border-border bg-[#f1f0ff] flex items-center justify-center shrink-0 shadow-sm">
                  <FileText className="w-5 h-5 text-[#4f46e5]" />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] uppercase tracking-wide text-muted-foreground font-semibold">
                    Guidelines-Prüfung
                  </p>
                  <h2 className="text-[#1e1e2e] text-lg truncate" style={{ fontWeight: 600 }}>
                    {documentTitle}
                  </h2>
                  <p className="text-[13px] text-muted-foreground mt-0.5 flex items-center gap-2 flex-wrap">
                    {PROJECT_LOGO_BY_ID[selectedProject.id] ? (
                      <img
                        src={PROJECT_LOGO_BY_ID[selectedProject.id]}
                        alt=""
                        className="w-4 h-4 object-contain shrink-0"
                        loading="lazy"
                      />
                    ) : null}
                    <span>
                      Projektkontext:{" "}
                      <span className="text-foreground font-medium">{selectedProject.name}</span>
                    </span>
                    {reviewFileLabel ? (
                      <span className="text-[12px] opacity-80">
                        · Demo-Text wie Bibliotheksdatei „{selectedProject.sourceFileName}“
                      </span>
                    ) : null}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-white border border-border">
                <div className="relative w-12 h-12">
                  <svg className="w-12 h-12 -rotate-90" viewBox="0 0 48 48">
                    <circle cx="24" cy="24" r="20" fill="none" stroke="#e2e8f0" strokeWidth="4" />
                    <circle cx="24" cy="24" r="20" fill="none" stroke={totalScore >= 80 ? "#10b981" : totalScore >= 60 ? "#f59e0b" : "#ef4444"} strokeWidth="4" strokeDasharray={`${(totalScore / 100) * 125.6} 125.6`} strokeLinecap="round" />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-[13px]" style={{ fontWeight: 700 }}>{totalScore}</span>
                </div>
                <div>
                  <p className="text-[12px] text-muted-foreground">Guidelines-Quote</p>
                  <p className="text-[14px] text-[#1e1e2e]" style={{ fontWeight: 600 }}>
                    {totalScore >= 80 ? "Gut" : totalScore >= 60 ? "Verbesserungsbedarf" : "Kritisch"}
                  </p>
                </div>
              </div>
              {fixLog.length > 0 && (
                <Button
                  variant="outline"
                  className={`text-[13px] gap-2 ${showFixLog ? "border-[#4f46e5] bg-[#f1f0ff]" : ""}`}
                  onClick={() => setShowFixLog(!showFixLog)}
                >
                  <ClipboardList className="w-4 h-4" />
                  Änderungslog ({fixLog.length})
                </Button>
              )}
              <Button
                variant="outline"
                className="text-[13px] gap-2"
                onClick={() =>
                  onNavigateToRules
                    ? onNavigateToRules()
                    : navigate("/guidelines?tab=rules")
                }
              >
                <BookOpen className="w-4 h-4" />
                Regeln
              </Button>
              <Button
                variant="outline"
                className="text-[13px] gap-2"
                onClick={() => { setExportScope("guidelines"); setShowExportDialog(true); }}
              >
                <FileText className="w-4 h-4" />
                Export
              </Button>
              <Button
                className="bg-[#4f46e5] hover:bg-[#4338ca] text-white gap-2 text-[13px]"
                onClick={() => handleAutoFixAll(selectedProject, fixLog.length)}
              >
                <Wand2 className="w-4 h-4" />Alle auto-korrigieren
              </Button>
            </div>
          </div>
        </div>

        {/* Fix Audit Log */}
        {showFixLog && fixLog.length > 0 && (
          <div className="border-b border-border bg-[#fafbfc] px-8 py-3 flex-shrink-0 max-h-[220px] overflow-y-auto">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <ClipboardList className="w-4 h-4 text-[#4f46e5]" />
                <p className="text-[13px] text-[#1e1e2e]" style={{ fontWeight: 600 }}>
                  Änderungsprotokoll
                </p>
                <Badge variant="secondary" className="text-[10px] bg-[#f1f0ff] text-[#4f46e5]">{fixLog.length} Einträge</Badge>
              </div>
              <Button variant="ghost" size="sm" className="text-[11px] h-6 gap-1 text-muted-foreground" onClick={() => setShowFixLog(false)}>
                Ausblenden <ChevronUp className="w-3 h-3" />
              </Button>
            </div>
            <div className="space-y-1.5">
              {fixLog.map((entry) => {
                const catConf = categoryConfig[entry.category];
                return (
                  <div key={entry.id} className="flex items-start gap-3 p-2.5 rounded-lg bg-white border border-border">
                    <div className="w-6 h-6 rounded flex items-center justify-center flex-shrink-0 mt-0.5" style={{ backgroundColor: catConf.bg }}>
                      <catConf.icon className="w-3 h-3" style={{ color: catConf.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                        <span className="text-[11px] text-[#4f46e5]" style={{ fontWeight: 600 }}>{entry.issueId}</span>
                        <span className="text-[12px] text-[#1e1e2e] truncate" style={{ fontWeight: 500 }}>{entry.issueTitle}</span>
                      </div>
                      <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{entry.timestamp}</span>
                        <span>{entry.appliedBy}</span>
                        <span style={{ color: catConf.color }}>{catConf.label}</span>
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-1">
                        Regel: <span style={{ fontWeight: 500 }}>{entry.rule}</span>
                      </p>
                    </div>
                    <Badge variant="secondary" className="text-[9px] px-1.5 bg-[#d1fae5] text-[#10b981] flex-shrink-0">
                      Angewendet
                    </Badge>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Split Screen */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left: Document Editor with Pagination */}
          <div className="flex-1 overflow-y-auto p-6 flex flex-col">
            <Card className="border border-border bg-white flex-1 flex flex-col">
              <CardHeader className="pb-3 border-b border-border flex-shrink-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-[#4f46e5]" />
                    <CardTitle className="text-[14px]" style={{ fontWeight: 600 }}>
                      Anforderungsdokument
                    </CardTitle>
                    <Badge variant="secondary" className="text-[11px] bg-[#f1f0ff] text-[#4f46e5]">
                      {selectedProject.pages[currentPage - 1]?.title}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 text-[12px] text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#ef4444]" /> {criticalCount} Kritisch
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b]" /> {majorCount} Wichtig
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#94a3b8]" /> {minorCount} Gering
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6 flex-1 overflow-y-auto">
                {renderHighlightedText()}
              </CardContent>

              {/* Page Navigation */}
              <div className="px-6 py-3 border-t border-border bg-[#fafbfc] flex items-center justify-between flex-shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-[12px] gap-1"
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  Vorherige
                </Button>

                <div className="flex items-center gap-2">
                  {selectedProject.pages.map((p) => {
                    const pageIssueCount = activeIssues.filter((i) => i.page === p.pageNum).length;
                    return (
                      <button
                        key={p.pageNum}
                        onClick={() => setCurrentPage(p.pageNum)}
                        className={`w-8 h-8 rounded-lg flex items-center justify-center text-[12px] transition-all relative ${
                          currentPage === p.pageNum
                            ? "bg-[#4f46e5] text-white shadow-sm"
                            : "bg-white border border-border text-[#475569] hover:bg-[#f1f5f9]"
                        }`}
                        style={{ fontWeight: currentPage === p.pageNum ? 600 : 400 }}
                      >
                        {p.pageNum}
                        {pageIssueCount > 0 && currentPage !== p.pageNum && (
                          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#ef4444] text-white text-[9px] flex items-center justify-center" style={{ fontWeight: 600 }}>
                            {pageIssueCount}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-[12px] text-muted-foreground">
                    Seite {currentPage} von {totalPages}
                    {currentPageIssues.length > 0 && (
                      <span className="text-[#ef4444] ml-1">
                        ({currentPageIssues.length} Probleme auf dieser Seite)
                      </span>
                    )}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-[12px] gap-1"
                    disabled={currentPage >= totalPages}
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  >
                    Nächste
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          {/* Right: Review Panel */}
          <div className="w-[440px] overflow-y-auto bg-[#fafbfc] border-l border-border flex-shrink-0">
            {/* Category Breakdown */}
            <div className="p-5 border-b border-border">
              <h4 className="text-[13px] text-[#1e1e2e] mb-3" style={{ fontWeight: 600 }}>Kategorien-Übersicht</h4>
              <div className="space-y-2.5">
                {categoryStats.map((cat) => (
                  <button
                    key={cat.key}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all text-left ${
                      categoryFilter === cat.key ? "bg-white border border-[#4f46e5]/30 shadow-sm" : "hover:bg-white/80"
                    }`}
                    onClick={() => setCategoryFilter(categoryFilter === cat.key ? "all" : cat.key)}
                  >
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: cat.bg }}>
                      <cat.icon className="w-3.5 h-3.5" style={{ color: cat.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-[12px] text-[#1e1e2e] truncate" style={{ fontWeight: 500 }}>{cat.label}</span>
                        <span className="text-[11px] text-muted-foreground ml-2">{cat.open}/{cat.total} offen</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-[#e2e8f0] overflow-hidden">
                        <div className="h-full rounded-full transition-all" style={{ width: `${cat.percentage}%`, backgroundColor: cat.percentage === 100 ? "#10b981" : cat.color }} />
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Issue List */}
            <div className="p-5">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-[14px] text-[#1e1e2e]" style={{ fontWeight: 600 }}>Erkannte Probleme</h4>
                <span className="text-[12px] text-muted-foreground">{filteredIssues.length} Probleme</span>
              </div>

              {/* Severity Filter */}
              <div className="flex items-center gap-2 mb-4">
                {[
                  { key: "all", label: "Alle", count: activeIssues.length },
                  { key: "critical", label: "Kritisch", count: criticalCount },
                  { key: "major", label: "Wichtig", count: majorCount },
                  { key: "minor", label: "Gering", count: minorCount },
                ].map((f) => (
                  <button
                    key={f.key}
                    onClick={() => setSeverityFilter(f.key)}
                    className={`px-2 py-1 rounded-lg text-[11px] transition-colors flex items-center gap-1 ${
                      severityFilter === f.key
                        ? "bg-[#4f46e5] text-white"
                        : "bg-white border border-border text-[#475569] hover:bg-[#f1f5f9]"
                    }`}
                    style={{ fontWeight: 500 }}
                  >
                    {f.label}
                    <span
                      className={`text-[10px] px-1 py-0.5 rounded-full ${
                        severityFilter === f.key ? "bg-white/20 text-white" : "bg-[#f1f5f9] text-muted-foreground"
                      }`}
                      style={{ fontWeight: 600 }}
                    >
                      {f.count}
                    </span>
                  </button>
                ))}
              </div>

              {categoryFilter !== "all" && (
                <div className="flex items-center gap-2 mb-3">
                  <Badge
                    variant="secondary"
                    className="text-[11px] gap-1 cursor-pointer hover:bg-[#e2e8f0]"
                    style={{
                      backgroundColor: categoryConfig[categoryFilter as IssueCategory]?.bg,
                      color: categoryConfig[categoryFilter as IssueCategory]?.color,
                    }}
                    onClick={() => setCategoryFilter("all")}
                  >
                    {categoryConfig[categoryFilter as IssueCategory]?.label}
                    <X className="w-3 h-3" />
                  </Badge>
                </div>
              )}

              {/* Issues */}
              <div className="space-y-3">
                {filteredIssues.map((issue) => {
                  const sevConf = severityConfig[issue.severity];
                  const catConf = categoryConfig[issue.category];
                  const isSelected = selectedIssue === issue.id;
                  return (
                    <Card
                      key={issue.id}
                      className={`border bg-white cursor-pointer transition-all duration-200 ${
                        isSelected ? "ring-2 ring-[#4f46e5]/30 shadow-sm" : "hover:shadow-sm"
                      }`}
                      style={{ borderColor: isSelected ? "#4f46e5" : `${catConf.color}25` }}
                      onClick={() => {
                        setSelectedIssue(isSelected ? null : issue.id);
                        if (issue.page !== currentPage) setCurrentPage(issue.page);
                      }}
                    >
                      <CardContent className="p-3.5">
                        <div className="flex items-start gap-2.5">
                          <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: catConf.bg }}>
                            <catConf.icon className="w-3.5 h-3.5" style={{ color: catConf.color }} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                              <Badge variant="secondary" className="text-[9px] px-1" style={{ backgroundColor: catConf.bg, color: catConf.color, fontWeight: 600 }}>{catConf.label}</Badge>
                              <Badge variant="secondary" className="text-[9px] px-1" style={{ backgroundColor: sevConf.bg, color: sevConf.color, fontWeight: 600 }}>{sevConf.label}</Badge>
                              <span className="text-[10px] text-muted-foreground">§ {issue.section}</span>
                              <Badge variant="secondary" className="text-[9px] px-1 bg-[#f1f5f9] text-[#64748b]">S.{issue.page}</Badge>
                            </div>
                            <p className="text-[13px] text-[#1e1e2e] mb-1" style={{ fontWeight: 500 }}>{issue.title}</p>
                            <p className="text-[11px] text-muted-foreground mb-2">{issue.description}</p>

                            <div className="px-2 py-1 rounded bg-[#f8fafc] border border-[#e2e8f0] mb-2.5 inline-block">
                              <p className="text-[10px] text-muted-foreground">
                                <span style={{ fontWeight: 500 }}>Regel:</span> {issue.rule}
                              </p>
                            </div>

                            {showSuggestion === issue.id && (
                              <div className="p-3 rounded-lg bg-[#d1fae5]/50 border border-[#10b981]/20 mb-2.5">
                                <p className="text-[10px] text-[#10b981] mb-1" style={{ fontWeight: 600 }}>Verbesserungsvorschlag</p>
                                <p className="text-[12px] text-[#475569]">{issue.suggestion}</p>
                              </div>
                            )}

                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                className="text-[10px] h-6 bg-[#4f46e5] hover:bg-[#4338ca] text-white gap-1 px-2"
                                onClick={(e) => { e.stopPropagation(); setAutoFixDialog(issue); }}
                              >
                                <Wand2 className="w-3 h-3" />Auto-Fix
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-[10px] h-6 gap-1 px-2"
                                onClick={(e) => { e.stopPropagation(); setShowSuggestion(showSuggestion === issue.id ? null : issue.id); }}
                              >
                                {showSuggestion === issue.id ? <><X className="w-3 h-3" />Ausblenden</> : <><Eye className="w-3 h-3" />Vorschlag</>}
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}

                {filteredIssues.length === 0 && (
                  <div className="text-center py-8">
                    <CheckCircle2 className="w-10 h-10 text-[#10b981] mx-auto mb-3" />
                    <p className="text-[14px] text-[#1e1e2e]" style={{ fontWeight: 500 }}>
                      {activeIssues.length === 0 ? "Alle Probleme behoben!" : "Keine Treffer für diesen Filter."}
                    </p>
                    <p className="text-[12px] text-muted-foreground mt-1">
                      {activeIssues.length === 0
                        ? "Das Dokument entspricht den definierten Guidelines."
                        : "Passen Sie die Filter an, um weitere Probleme zu sehen."}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Auto-Fix Dialog */}
        <Dialog open={!!autoFixDialog} onOpenChange={() => setAutoFixDialog(null)}>
          <DialogContent className="sm:max-w-[560px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Wand2 className="w-5 h-5 text-[#4f46e5]" />Automatische Korrektur
              </DialogTitle>
              <DialogDescription>
                Die KI hat einen Verbesserungsvorschlag generiert. Prüfen Sie die Änderung und übernehmen Sie sie in das Dokument.
              </DialogDescription>
            </DialogHeader>
            {autoFixDialog && (
              <div className="my-4 space-y-4">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="secondary" className="text-[11px] px-1.5" style={{ backgroundColor: categoryConfig[autoFixDialog.category]?.bg, color: categoryConfig[autoFixDialog.category]?.color, fontWeight: 600 }}>
                    {categoryConfig[autoFixDialog.category]?.label}
                  </Badge>
                  <Badge variant="secondary" className="text-[11px] px-1.5" style={{ backgroundColor: severityConfig[autoFixDialog.severity]?.bg, color: severityConfig[autoFixDialog.severity]?.color, fontWeight: 600 }}>
                    {severityConfig[autoFixDialog.severity]?.label}
                  </Badge>
                  <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                    <BookOpen className="w-3.5 h-3.5" />{autoFixDialog.rule}
                  </span>
                  <Badge variant="secondary" className="text-[10px] px-1.5 bg-[#f1f5f9] text-[#64748b]">Seite {autoFixDialog.page}</Badge>
                </div>
                <p className="text-[13px] text-[#475569]">{autoFixDialog.description}</p>
                <div className="p-4 rounded-lg bg-[#fef2f2] border border-[#ef4444]/20">
                  <div className="flex items-center gap-2 mb-2">
                    <XCircle className="w-4 h-4 text-[#ef4444]" />
                    <p className="text-[12px] text-[#ef4444]" style={{ fontWeight: 600 }}>Vorher</p>
                  </div>
                  <p className="text-[13px] text-[#475569] bg-white/60 rounded px-3 py-2 border border-[#ef4444]/10">{autoFixDialog.before}</p>
                </div>
                <div className="flex justify-center">
                  <div className="w-8 h-8 rounded-full bg-[#f1f0ff] flex items-center justify-center">
                    <ArrowDown className="w-4 h-4 text-[#4f46e5]" />
                  </div>
                </div>
                <div className="p-4 rounded-lg bg-[#d1fae5]/50 border border-[#10b981]/20">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="w-4 h-4 text-[#10b981]" />
                    <p className="text-[12px] text-[#10b981]" style={{ fontWeight: 600 }}>Nachher (KI-Vorschlag)</p>
                  </div>
                  <p className="text-[13px] text-[#475569] bg-white/60 rounded px-3 py-2 border border-[#10b981]/10">{autoFixDialog.after}</p>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setAutoFixDialog(null)}>Abbrechen</Button>
              <Button className="bg-[#4f46e5] hover:bg-[#4338ca] text-white gap-2" onClick={() => {
                if (autoFixDialog) handleAutoFix(autoFixDialog);
                setAutoFixDialog(null);
              }}>
                <Wand2 className="w-4 h-4" />Korrektur übernehmen
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
}
