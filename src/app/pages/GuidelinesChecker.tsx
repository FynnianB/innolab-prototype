import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import {
  ShieldCheck,
  ArrowRight,
  FolderOpen,
  FileText,
  Layers,
  Eye,
  Upload,
} from "lucide-react";
import { Card, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { TooltipProvider } from "../components/ui/tooltip";
import { useAppContext } from "../context/AppContext";
import {
  PROJECT_LOGO_BY_ID,
  getProjectIdsForWorkspace,
} from "../data/workspaces";
import {
  getComplianceProjectsForWorkspace,
  GUIDELINES_DEMO_SOURCE_FILES,
  splitDocumentDisplayLabel,
} from "../data/guidelinesCheckDemo";
import type { GuidelinesAnalysisRun } from "../data/guidelinesAnalysisHistory";
import { RuleManagementContent } from "../components/RuleManagementContent";
import {
  GuidelinesScopeBar,
  GUIDELINES_SCOPE_WORKSPACE,
  type GuidelinesScopeMode,
} from "../components/guidelines/GuidelinesScopeBar";
import {
  GuidelinesTabNav,
  type GuidelinesMainTab,
} from "../components/guidelines/GuidelinesTabNav";
import { GuidelinesOverviewTab } from "../components/guidelines/GuidelinesOverviewTab";
import { GuidelinesHistoryPanel } from "../components/guidelines/GuidelinesHistoryPanel";
import { GuidelinesCheckReview } from "../components/guidelines/GuidelinesCheckReview";
import { useGuidelinesCheckState } from "../components/guidelines/useGuidelinesCheckState";
import { GuidelinesJoyride } from "../onboarding/GuidelinesJoyride";

const VALID_TABS: GuidelinesMainTab[] = ["overview", "rules", "check"];

type SessionUploadedGuidelineDoc = {
  id: string;
  fileName: string;
  projectId: string;
};

function parseTab(raw: string | null): GuidelinesMainTab {
  if (raw === "history") return "check";
  if (raw && VALID_TABS.includes(raw as GuidelinesMainTab)) {
    return raw as GuidelinesMainTab;
  }
  return "overview";
}

export function GuidelinesChecker() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const {
    setShowExportDialog,
    setExportScope,
    selectedWorkspaceId,
    selectedWorkspace,
  } = useAppContext();

  const check = useGuidelinesCheckState();
  const mockUploadSeq = useRef(0);
  const [pendingMockFileName, setPendingMockFileName] = useState<string | null>(
    null,
  );
  const [sessionUploadedDocs, setSessionUploadedDocs] = useState<
    SessionUploadedGuidelineDoc[]
  >([]);

  useEffect(() => {
    check.resetCheckFlow();
    setPendingMockFileName(null);
    setSessionUploadedDocs([]);
    mockUploadSeq.current = 0;
  }, [selectedWorkspaceId, check.resetCheckFlow]);

  useEffect(() => {
    if (searchParams.get("tab") !== "history") return;
    setSearchParams(
      (prev) => {
        const n = new URLSearchParams(prev);
        n.set("tab", "check");
        return n;
      },
      { replace: true },
    );
  }, [searchParams, setSearchParams]);

  const simulateDocumentUpload = useCallback(() => {
    const i = mockUploadSeq.current % GUIDELINES_DEMO_SOURCE_FILES.length;
    setPendingMockFileName(GUIDELINES_DEMO_SOURCE_FILES[i]);
    mockUploadSeq.current += 1;
  }, []);

  const workspaceProjects = useMemo(
    () => getComplianceProjectsForWorkspace(selectedWorkspaceId),
    [selectedWorkspaceId],
  );

  const workspaceProjectIds = useMemo(
    () => getProjectIdsForWorkspace(selectedWorkspaceId),
    [selectedWorkspaceId],
  );

  const firstProjectId = workspaceProjects[0]?.id ?? null;

  const activeTab = parseTab(searchParams.get("tab"));
  const scopeMode: GuidelinesScopeMode =
    searchParams.get("scope") === "project" ? "project" : "workspace";

  const urlProject = searchParams.get("project");
  const scopeProjectId =
    scopeMode === "project"
      ? urlProject && workspaceProjectIds.includes(urlProject)
        ? urlProject
        : firstProjectId
      : null;

  const scopeBarValue =
    scopeMode === "workspace" || scopeProjectId == null
      ? GUIDELINES_SCOPE_WORKSPACE
      : scopeProjectId;

  const guidelinesRulesEvalScope = useMemo(() => {
    if (scopeMode === "workspace" || scopeProjectId == null) return undefined;
    return { kind: "project" as const, projectId: scopeProjectId };
  }, [scopeMode, scopeProjectId]);

  const syncQuery = useCallback(
    (patch: {
      tab?: GuidelinesMainTab;
      scope?: GuidelinesScopeMode;
      project?: string | null;
    }) => {
      setSearchParams(
        (prev) => {
          const n = new URLSearchParams(prev);
          if (patch.tab != null) n.set("tab", patch.tab);
          if (patch.scope != null) {
            n.set("scope", patch.scope);
            if (patch.scope === "workspace") n.delete("project");
          }
          if (patch.project !== undefined) {
            if (patch.project) n.set("project", patch.project);
            else n.delete("project");
          }
          return n;
        },
        { replace: true },
      );
    },
    [setSearchParams],
  );

  const setActiveTab = useCallback(
    (tab: GuidelinesMainTab) => {
      if (tab !== "check" && check.phase === "review") {
        check.resetCheckFlow();
      }
      syncQuery({ tab });
    },
    [syncQuery, check.phase, check.resetCheckFlow],
  );

  const setScopeFromSelect = useCallback(
    (v: string) => {
      if (v === GUIDELINES_SCOPE_WORKSPACE) {
        syncQuery({ scope: "workspace", project: null });
      } else {
        syncQuery({ scope: "project", project: v });
      }
    },
    [syncQuery],
  );

  const openCheckFromHistoryRun = useCallback(
    (run: GuidelinesAnalysisRun) => {
      syncQuery({ tab: "check", scope: "project", project: run.projectId });
      const proj = workspaceProjects.find((p) => p.id === run.projectId);
      if (proj) {
        check.handleProjectSelect(proj, { fileLabel: run.documentLabel });
      }
    },
    [syncQuery, workspaceProjects, check],
  );

  const listProjects =
    scopeMode === "project" && scopeProjectId
      ? workspaceProjects.filter((p) => p.id === scopeProjectId)
      : workspaceProjects;

  const showReviewShell =
    check.phase === "review" && check.selectedProject != null;

  const goToRulesFromReview = useCallback(() => {
    check.resetCheckFlow();
    syncQuery({ tab: "rules" });
  }, [check, syncQuery]);

  if (showReviewShell) {
    return (
      <GuidelinesCheckReview
        check={check}
        navigate={navigate}
        setShowExportDialog={setShowExportDialog}
        setExportScope={setExportScope}
        onNavigateToRules={goToRulesFromReview}
      />
    );
  }

  return (
    <TooltipProvider>
      <div className="p-8 max-w-[1200px] mx-auto pb-16">
        <div className="mb-6" data-tour="guidelines-intro">
          <h1 className="text-[#1e1e2e]">Guidelines</h1>
          <p className="text-[14px] text-muted-foreground mt-1 max-w-[720px]">
            Regeln verwalten, den Workspace und einzelne Projekte auswerten sowie
            Dokumente gegen den Regelkatalog prüfen — im Kontext von{" "}
            <span className="text-foreground font-medium">{selectedWorkspace.name}</span>.
          </p>
        </div>

        <GuidelinesScopeBar
          workspaceId={selectedWorkspaceId}
          value={scopeBarValue}
          onValueChange={setScopeFromSelect}
        />

        <GuidelinesTabNav activeTab={activeTab} onTabChange={setActiveTab} />

        {activeTab === "overview" && (
          <GuidelinesOverviewTab
            workspaceId={selectedWorkspaceId}
            scopeMode={scopeMode}
            scopeProjectId={scopeProjectId}
            onRowProjectClick={(id) => {
              syncQuery({ scope: "project", project: id });
            }}
          />
        )}

        {activeTab === "rules" && (
          <RuleManagementContent
            embedded
            hideGeltungsbereich
            guidelinesEvalScope={guidelinesRulesEvalScope}
          />
        )}

        {activeTab === "check" && (
          <div className="space-y-8">
            <p className="text-[14px] text-muted-foreground">
              „Hochladen“ simuliert je Klick einen anderen Demo-Dateinamen (ohne Dateidialog). Nach
              dem Start der Analyse erscheint der Eintrag in der Liste; der Analyse-Verlauf steht
              ganz unten. Es wird kein echter Dateiinhalt verarbeitet.
            </p>

            <Card className="border border-dashed border-border bg-[#fafbfc]">
              <CardContent className="p-6 space-y-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-[#f1f0ff] flex items-center justify-center shrink-0">
                      <Upload className="w-5 h-5 text-[#4f46e5]" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[14px] text-[#1e1e2e]" style={{ fontWeight: 600 }}>
                        Dokument hochladen
                      </p>
                      <p className="text-[12px] text-muted-foreground mt-1">
                        Simuliert den Upload einer Datei (ohne Systemdialog). Die Prüfung nutzt das
                        Demo-Lastenheft; der Kontext kommt vom ersten Projekt in der Liste unten
                        {scopeMode === "project" && scopeProjectId
                          ? " (aktuell gefiltert auf Ihre Projektauswahl oben)."
                          : scopeMode === "workspace" && listProjects.length > 1
                            ? " — filtern Sie oben auf ein Projekt für einen anderen Kontext."
                            : "."}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="text-[13px] gap-2"
                      disabled={listProjects.length === 0}
                      onClick={simulateDocumentUpload}
                    >
                      <Upload className="w-4 h-4" />
                      Hochladen
                    </Button>
                    {pendingMockFileName ? (
                      <span className="text-[12px] text-muted-foreground truncate max-w-[200px] sm:max-w-[280px]">
                        <span className="text-foreground font-medium">{pendingMockFileName}</span>
                      </span>
                    ) : null}
                    <Button
                      type="button"
                      size="sm"
                      className="text-[13px] bg-[#4f46e5] hover:bg-[#4338ca] text-white"
                      disabled={!pendingMockFileName || listProjects.length === 0}
                      onClick={() => {
                        const target = listProjects[0];
                        const fileName = pendingMockFileName;
                        if (!target || !fileName) return;
                        setSessionUploadedDocs((prev) => [
                          ...prev,
                          {
                            id: `sess-${Date.now()}`,
                            fileName,
                            projectId: target.id,
                          },
                        ]);
                        setPendingMockFileName(null);
                        check.handleProjectSelect(target, {
                          fileLabel: fileName,
                        });
                      }}
                    >
                      Guidelines-Analyse starten
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-3">
              <h3 className="text-[14px] text-[#1e1e2e]" style={{ fontWeight: 600 }}>
                Hinterlegte Lastenhefte
              </h3>
              <p className="text-[12px] text-muted-foreground -mt-1">
                Jedes Dokument ist einem Projekt zugeordnet; die Analyse zeigt dasselbe
                Demo-Lastenheft mit projektbezogenem Kontext.
              </p>
            </div>

            <div className="space-y-4" data-tour="guidelines-document-list">
              {listProjects.length === 0 && (
                <p className="text-[14px] text-muted-foreground rounded-lg border border-dashed border-border bg-muted/30 px-4 py-8 text-center">
                  Für diesen Workspace sind keine Demo-Dokumente für die Guidelines-Prüfung
                  hinterlegt.
                </p>
              )}
              {listProjects.map((project) => {
                const docLabel = splitDocumentDisplayLabel(project.document);
                return (
                  <Card
                    key={project.id}
                    className="border border-border bg-white hover:shadow-md hover:border-[#4f46e5]/20 transition-all duration-200 cursor-pointer group"
                    onClick={() => check.handleProjectSelect(project)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start gap-5">
                        <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 border border-transparent overflow-hidden transition-colors group-hover:border-[#e0e7ff] bg-[#f1f0ff] group-hover:bg-[#eef2ff]">
                          <FileText className="w-7 h-7 text-[#4f46e5] group-hover:text-[#4338ca] transition-colors" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-1 flex-wrap">
                            <p
                              className="text-[16px] text-[#1e1e2e] group-hover:text-[#4f46e5] transition-colors"
                              style={{ fontWeight: 600 }}
                            >
                              {project.sourceFileName}
                            </p>
                            <Badge
                              variant="secondary"
                              className="text-[11px] px-2 bg-[#f1f5f9] text-[#475569]"
                              style={{ fontWeight: 500 }}
                            >
                              Projekt: {project.name}
                            </Badge>
                            <Badge
                              variant="secondary"
                              className="text-[11px] px-2"
                              style={{
                                backgroundColor: `${project.statusColor}15`,
                                color: project.statusColor,
                                fontWeight: 500,
                              }}
                            >
                              {project.status}
                            </Badge>
                          </div>
                          <p className="text-[12px] text-muted-foreground mb-2">
                            {docLabel.title}
                            {docLabel.detail ? ` · ${docLabel.detail}` : ""}
                            {" — gleicher Demo-Inhalt für alle Karten."}
                          </p>
                          <p className="text-[13px] text-muted-foreground mb-3 line-clamp-2">
                            {project.description}
                          </p>
                          <div className="flex items-center gap-4 flex-wrap">
                            <div className="flex items-center gap-1.5 text-[12px] text-muted-foreground">
                              <Layers className="w-3.5 h-3.5 text-[#8b5cf6]" />
                              <span>{project.pages.length} Seiten</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-[12px] text-muted-foreground">
                              <ShieldCheck className="w-3.5 h-3.5 text-[#10b981]" />
                              <span>{project.issues.length} Hinweise im Katalog</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-[12px] text-muted-foreground">
                              <Eye className="w-3.5 h-3.5 text-[#64748b]" />
                              <span>Letztes Review: {project.lastReview}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2 shrink-0">
                          {PROJECT_LOGO_BY_ID[project.id] ? (
                            <img
                              src={PROJECT_LOGO_BY_ID[project.id]}
                              alt=""
                              className="w-10 h-10 object-contain opacity-90 group-hover:opacity-100"
                              loading="lazy"
                            />
                          ) : (
                            <FolderOpen className="w-8 h-8 text-[#94a3b8]" />
                          )}
                          <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-[#4f46e5] transition-colors" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}

              {sessionUploadedDocs.length > 0 ? (
                <>
                  <div className="pt-4 border-t border-border space-y-2">
                    <h4 className="text-[13px] text-[#1e1e2e]" style={{ fontWeight: 600 }}>
                      In dieser Sitzung „hochgeladen“
                    </h4>
                    <p className="text-[12px] text-muted-foreground">
                      Erscheint nach „Guidelines-Analyse starten“; Klick öffnet erneut die Prüfung.
                    </p>
                  </div>
                  {sessionUploadedDocs.map((entry) => {
                    const project = workspaceProjects.find(
                      (p) => p.id === entry.projectId,
                    );
                    if (!project) return null;
                    return (
                      <Card
                        key={entry.id}
                        className="border border-dashed border-[#4f46e5]/25 bg-[#fafbff] hover:shadow-md hover:border-[#4f46e5]/35 transition-all duration-200 cursor-pointer group"
                        onClick={() =>
                          check.handleProjectSelect(project, {
                            fileLabel: entry.fileName,
                          })
                        }
                      >
                        <CardContent className="p-6">
                          <div className="flex items-start gap-5">
                            <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 border border-[#4f46e5]/15 bg-[#f1f0ff] group-hover:bg-[#eef2ff]">
                              <FileText className="w-7 h-7 text-[#4f46e5]" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-3 mb-1 flex-wrap">
                                <p
                                  className="text-[16px] text-[#1e1e2e] group-hover:text-[#4f46e5] transition-colors"
                                  style={{ fontWeight: 600 }}
                                >
                                  {entry.fileName}
                                </p>
                                <Badge
                                  variant="secondary"
                                  className="text-[11px] px-2 bg-[#eef2ff] text-[#4338ca]"
                                  style={{ fontWeight: 500 }}
                                >
                                  Simuliert
                                </Badge>
                                <Badge
                                  variant="secondary"
                                  className="text-[11px] px-2 bg-[#f1f5f9] text-[#475569]"
                                  style={{ fontWeight: 500 }}
                                >
                                  Projekt: {project.name}
                                </Badge>
                              </div>
                              <p className="text-[13px] text-muted-foreground mb-3">
                                Gleicher Demo-Inhalt wie die hinterlegten Lastenhefte; Dateiname aus
                                dem simulierten Upload.
                              </p>
                              <div className="flex items-center gap-4 flex-wrap">
                                <div className="flex items-center gap-1.5 text-[12px] text-muted-foreground">
                                  <Layers className="w-3.5 h-3.5 text-[#8b5cf6]" />
                                  <span>{project.pages.length} Seiten</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-[12px] text-muted-foreground">
                                  <ShieldCheck className="w-3.5 h-3.5 text-[#10b981]" />
                                  <span>{project.issues.length} Hinweise im Katalog</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex flex-col items-end gap-2 shrink-0">
                              {PROJECT_LOGO_BY_ID[project.id] ? (
                                <img
                                  src={PROJECT_LOGO_BY_ID[project.id]}
                                  alt=""
                                  className="w-10 h-10 object-contain opacity-90"
                                  loading="lazy"
                                />
                              ) : (
                                <FolderOpen className="w-8 h-8 text-[#94a3b8]" />
                              )}
                              <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-[#4f46e5] transition-colors" />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </>
              ) : null}
            </div>

            <div className="pt-4" data-tour="guidelines-history">
              <GuidelinesHistoryPanel
                workspaceId={selectedWorkspaceId}
                scopeProjectId={scopeMode === "project" ? scopeProjectId : null}
                onRowClick={openCheckFromHistoryRun}
              />
            </div>
          </div>
        )}
      </div>
      <GuidelinesJoyride setActiveTab={setActiveTab} />
    </TooltipProvider>
  );
}
