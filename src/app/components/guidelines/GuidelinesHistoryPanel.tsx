import { Badge } from "../ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import {
  getGuidelinesHistory,
  totalFindings,
  type GuidelinesAnalysisRun,
} from "../../data/guidelinesAnalysisHistory";
import { PROJECT_SEARCH_META } from "../../data/workspaces";

interface GuidelinesHistoryPanelProps {
  workspaceId: string;
  scopeProjectId: string | null;
  /** Nur für Teaser auf der Check-Seite */
  limit?: number;
  onRowClick?: (run: GuidelinesAnalysisRun) => void;
  title?: string;
  showCardChrome?: boolean;
}

export function GuidelinesHistoryPanel({
  workspaceId,
  scopeProjectId,
  limit,
  onRowClick,
  title = "Analyse-Verlauf",
  showCardChrome = true,
}: GuidelinesHistoryPanelProps) {
  const runs = getGuidelinesHistory(
    workspaceId,
    scopeProjectId ?? undefined,
  );
  const display = limit != null ? runs.slice(0, limit) : runs;

  const table = (
    <div className="overflow-x-auto">
      <table className="w-full text-[13px]">
        <thead>
          <tr className="border-b border-border text-left text-muted-foreground">
            <th className="px-3 py-2 font-medium">Datum</th>
            <th className="px-3 py-2 font-medium">Projekt</th>
            <th className="px-3 py-2 font-medium">Dokument</th>
            <th className="px-3 py-2 font-medium">Status</th>
            <th className="px-3 py-2 font-medium text-right tabular-nums">Befunde</th>
          </tr>
        </thead>
        <tbody>
          {display.length === 0 ? (
            <tr>
              <td colSpan={5} className="px-3 py-8 text-center text-muted-foreground">
                Keine Einträge für diese Auswahl.
              </td>
            </tr>
          ) : (
            display.map((run) => (
              <tr
                key={run.id}
                className={
                  onRowClick
                    ? "border-b border-border/80 hover:bg-[#f8fafc] cursor-pointer"
                    : "border-b border-border/80"
                }
                onClick={() => onRowClick?.(run)}
              >
                <td className="px-3 py-2.5 text-muted-foreground whitespace-nowrap">
                  {run.finishedAt}
                </td>
                <td className="px-3 py-2.5" style={{ fontWeight: 500 }}>
                  {PROJECT_SEARCH_META[run.projectId]?.name ?? run.projectId}
                </td>
                <td className="px-3 py-2.5 text-muted-foreground max-w-[200px] truncate">
                  {run.documentLabel}
                </td>
                <td className="px-3 py-2.5">
                  <Badge
                    variant="secondary"
                    className="text-[11px]"
                    style={{
                      backgroundColor:
                        run.status === "abgeschlossen" ? "#d1fae5" : "#fee2e2",
                      color: run.status === "abgeschlossen" ? "#059669" : "#dc2626",
                    }}
                  >
                    {run.status}
                  </Badge>
                </td>
                <td className="px-3 py-2.5 text-right tabular-nums">
                  {run.status === "fehlgeschlagen"
                    ? "—"
                    : totalFindings(run.findingCounts)}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );

  if (!showCardChrome) {
    return (
      <div>
        <p className="text-[14px] text-[#1e1e2e] mb-3" style={{ fontWeight: 600 }}>
          {title}
        </p>
        {table}
      </div>
    );
  }

  return (
    <Card className="border border-border bg-white">
      <CardHeader className="pb-2">
        <CardTitle className="text-[14px]" style={{ fontWeight: 600 }}>
          {title}
        </CardTitle>
        <p className="text-[12px] text-muted-foreground font-normal">
          Abgeschlossene und fehlgeschlagene Prüfläufe (Demo-Daten).
        </p>
      </CardHeader>
      <CardContent className="px-0 pb-4">{table}</CardContent>
    </Card>
  );
}
