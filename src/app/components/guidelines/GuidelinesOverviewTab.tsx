import { Link } from "react-router";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { QualityInsightsView } from "../QualityInsightsView";
import {
  aggregateWorkspaceQualityInsights,
  getProjectQualityInsights,
  getTopProblemsForProject,
} from "../../data/qualityInsights";
import {
  getProjectIdsForWorkspace,
  PROJECT_SEARCH_META,
} from "../../data/workspaces";
import type { GuidelinesScopeMode } from "./GuidelinesScopeBar";

interface GuidelinesOverviewTabProps {
  workspaceId: string;
  scopeMode: GuidelinesScopeMode;
  scopeProjectId: string | null;
  onRowProjectClick: (projectId: string) => void;
}

export function GuidelinesOverviewTab({
  workspaceId,
  scopeMode,
  scopeProjectId,
  onRowProjectClick,
}: GuidelinesOverviewTabProps) {
  if (scopeMode === "project") {
    if (!scopeProjectId) {
      return (
        <p className="text-[13px] text-muted-foreground py-8 text-center">
          Bitte wählen Sie ein Projekt im Auswertungsbereich oben.
        </p>
      );
    }
    const q = getProjectQualityInsights(scopeProjectId);
    if (!q) {
      return (
        <p className="text-[13px] text-muted-foreground py-8 text-center">
          Für dieses Projekt liegen noch keine aggregierten Prüfdaten vor.
        </p>
      );
    }
    return (
      <div className="space-y-4">
        <QualityInsightsView
          guidelinesByCategory={q.guidelinesByCategory}
          guidelinesBySeverity={q.guidelinesBySeverity}
          docReviewByType={q.docReviewByType}
          topProblems={getTopProblemsForProject(q)}
          lastAnalyzed={q.lastAnalyzed}
          showCategoryCharts
        />
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" className="text-[13px]" asChild>
            <Link to={`/guidelines?tab=check&project=${encodeURIComponent(scopeProjectId)}`}>
              Zu Dokumente prüfen
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const aggregate = aggregateWorkspaceQualityInsights(workspaceId);
  const projectIds = getProjectIdsForWorkspace(workspaceId).filter(
    (id) => getProjectQualityInsights(id) != null,
  );

  return (
    <div className="space-y-8">
      {aggregate.projectCount === 0 ? (
        <p className="text-[13px] text-muted-foreground py-6 text-center rounded-lg border border-dashed border-border bg-muted/20 px-4">
          Für Projekte in diesem Workspace liegen noch keine aggregierten Prüfdaten vor.
        </p>
      ) : (
        <QualityInsightsView
          guidelinesByCategory={aggregate.guidelinesByCategory}
          guidelinesBySeverity={aggregate.guidelinesBySeverity}
          docReviewByType={aggregate.docReviewByType}
          topProblems={aggregate.topProblems}
          subtitle={`${aggregate.projectCount} Projekt${
            aggregate.projectCount === 1 ? "" : "e"
          } mit Auswertung · ${aggregate.totalGuidelineFindings} Guideline-Befunde · ${aggregate.totalDocIssues} Doc-Issues`}
          showCategoryCharts
        />
      )}

      <Card className="border border-border bg-white">
        <CardHeader className="pb-2">
          <CardTitle className="text-[14px]" style={{ fontWeight: 600 }}>
            Projekte im Vergleich
          </CardTitle>
          <p className="text-[12px] text-muted-foreground font-normal">
            Klicken Sie eine Zeile, um dieses Projekt im Auswertungsbereich zu fokussieren.
          </p>
        </CardHeader>
        <CardContent className="px-0 pb-4">
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-border text-left text-muted-foreground">
                  <th className="px-5 py-2 font-medium">Projekt</th>
                  <th className="px-3 py-2 font-medium text-right tabular-nums">Befunde</th>
                  <th className="px-3 py-2 font-medium text-right tabular-nums">Kritisch</th>
                  <th className="px-5 py-2 font-medium text-right">Letzte Auswertung</th>
                </tr>
              </thead>
              <tbody>
                {projectIds.map((id) => {
                  const q = getProjectQualityInsights(id)!;
                  const total =
                    q.guidelinesBySeverity.critical +
                    q.guidelinesBySeverity.major +
                    q.guidelinesBySeverity.minor;
                  const name = PROJECT_SEARCH_META[id]?.name ?? id;
                  return (
                    <tr
                      key={id}
                      className="border-b border-border/80 hover:bg-[#f8fafc] cursor-pointer transition-colors"
                      onClick={() => onRowProjectClick(id)}
                    >
                      <td className="px-5 py-3 text-[#1e1e2e]" style={{ fontWeight: 500 }}>
                        {name}
                      </td>
                      <td className="px-3 py-3 text-right tabular-nums">{total}</td>
                      <td className="px-3 py-3 text-right tabular-nums text-[#dc2626]">
                        {q.guidelinesBySeverity.critical}
                      </td>
                      <td className="px-5 py-3 text-right text-muted-foreground">
                        {q.lastAnalyzed}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" className="text-[13px]" asChild>
          <Link to="/guidelines?tab=check">Zu Dokumente prüfen</Link>
        </Button>
      </div>
    </div>
  );
}
