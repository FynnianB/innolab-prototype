import { Link } from "react-router";
import { BarChart3, ClipboardCheck, FileSearch, ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import type {
  DocReviewIssueTypeId,
  GuidelineCategoryId,
} from "../data/qualityInsights";
import {
  DOC_REVIEW_TYPE_META,
  GUIDELINE_CATEGORY_META,
} from "../data/qualityInsights";

const GUIDELINE_ORDER: GuidelineCategoryId[] = [
  "dsgvo",
  "legal",
  "corporate",
  "style",
  "ambiguity",
  "structure",
];

const DOC_ORDER: DocReviewIssueTypeId[] = [
  "contradiction",
  "duplication",
  "ambiguity",
  "inconsistency",
  "gap",
];

export type TopProblemRow = {
  key: string;
  label: string;
  count: number;
  source: "guidelines" | "documents";
  color: string;
};

export interface QualityInsightsViewProps {
  guidelinesByCategory: Record<GuidelineCategoryId, number>;
  guidelinesBySeverity: { critical: number; major: number; minor: number };
  docReviewByType: Record<DocReviewIssueTypeId, number>;
  topProblems: TopProblemRow[];
  /** Projekt: letzte Auswertung */
  lastAnalyzed?: string | null;
  /** Workspace: z. B. „3 Projekte mit Daten“ */
  subtitle?: string | null;
  /** Zeigt Aktions-Buttons (nur Projekt-Tab) */
  showActionLinks?: boolean;
  /** Etwas kompakteres Layout (Dashboard-Karte) */
  compact?: boolean;
  /** Wenn false: keine Balkendiagramme je Kategorie/Typ (schmale Spalte) */
  showCategoryCharts?: boolean;
  /** Deep-Link zu Guidelines „Dokumente prüfen“ für dieses Projekt */
  guidelinesCheckProjectId?: string;
}

function maxCount(values: number[]): number {
  const m = Math.max(0, ...values);
  return m > 0 ? m : 1;
}

function BarRow({
  label,
  count,
  max,
  color,
}: {
  label: string;
  count: number;
  max: number;
  color: string;
}) {
  const pct = Math.round((count / max) * 100);
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between gap-2 text-[12px]">
        <span className="text-[#475569] truncate">{label}</span>
        <span className="tabular-nums shrink-0" style={{ fontWeight: 600, color }}>
          {count}
        </span>
      </div>
      <div className="h-2 rounded-full bg-[#f1f5f9] overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, backgroundColor: color }}
          role="presentation"
        />
      </div>
    </div>
  );
}

export function QualityInsightsView({
  guidelinesByCategory,
  guidelinesBySeverity,
  docReviewByType,
  topProblems,
  lastAnalyzed,
  subtitle,
  showActionLinks,
  compact,
  showCategoryCharts = true,
  guidelinesCheckProjectId,
}: QualityInsightsViewProps) {
  const guidelinesCheckTo =
    guidelinesCheckProjectId != null && guidelinesCheckProjectId !== ""
      ? `/guidelines?tab=check&scope=project&project=${encodeURIComponent(guidelinesCheckProjectId)}`
      : "/guidelines?tab=check";
  const gMax = maxCount(GUIDELINE_ORDER.map((k) => guidelinesByCategory[k]));
  const dMax = maxCount(DOC_ORDER.map((k) => docReviewByType[k]));
  const totalG =
    guidelinesBySeverity.critical +
    guidelinesBySeverity.major +
    guidelinesBySeverity.minor;
  const totalD = DOC_ORDER.reduce((s, k) => s + docReviewByType[k], 0);
  const gap = compact ? "gap-4" : "gap-6";
  const cardPad = compact ? "pb-4" : "pb-5";
  const narrowSummary = Boolean(compact && !showCategoryCharts);

  return (
    <div className={compact ? "space-y-4" : "space-y-6"}>
      {(lastAnalyzed || subtitle) && (
        <div className="flex flex-wrap items-center gap-2 text-[12px] text-muted-foreground">
          {lastAnalyzed ? (
            <span>
              Letzte Auswertung:{" "}
              <span className="text-[#475569]" style={{ fontWeight: 500 }}>
                {lastAnalyzed}
              </span>
            </span>
          ) : null}
          {subtitle ? (
            <Badge variant="secondary" className="text-[11px] font-normal">
              {subtitle}
            </Badge>
          ) : null}
        </div>
      )}

      <div
        className={
          narrowSummary
            ? `grid grid-cols-1 ${gap}`
            : `grid grid-cols-1 lg:grid-cols-3 ${gap}`
        }
      >
        <Card
          className={
            narrowSummary
              ? "border border-border bg-white"
              : "border border-border bg-white lg:col-span-2"
          }
        >
          <CardHeader className={`pb-2 ${compact ? "pt-4 px-4" : ""}`}>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#f1f0ff] flex items-center justify-center">
                <BarChart3 className="w-4 h-4 text-[#4f46e5]" />
              </div>
              <div>
                <CardTitle className="text-[14px]" style={{ fontWeight: 600 }}>
                  Häufigste Themen
                </CardTitle>
                <p className="text-[11px] text-muted-foreground font-normal mt-0.5">
                  Guideline-Kategorien und Dokumentenprüfungen nach Häufigkeit
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className={`px-5 ${cardPad} space-y-3`}>
            {topProblems.length === 0 ? (
              <p className="text-[13px] text-muted-foreground py-4 text-center">
                Keine erfassten Befunde in dieser Ansicht.
              </p>
            ) : (
              topProblems.map((row, i) => (
                <div
                  key={row.key}
                  className="flex items-center gap-3 rounded-lg border border-border/80 bg-[#fafafa]/80 px-3 py-2.5"
                >
                  <span
                    className="w-7 h-7 rounded-md flex items-center justify-center text-[12px] tabular-nums shrink-0 text-white"
                    style={{
                      backgroundColor: row.color,
                      fontWeight: 700,
                    }}
                  >
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] text-[#1e1e2e] truncate" style={{ fontWeight: 500 }}>
                      {row.label}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {row.source === "guidelines" ? "Guideline-Check" : "Dokumentenprüfung"}
                    </p>
                  </div>
                  <span
                    className="text-[15px] tabular-nums shrink-0"
                    style={{ fontWeight: 700, color: row.color }}
                  >
                    {row.count}
                  </span>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="border border-border bg-white">
          <CardHeader className={`pb-2 ${compact ? "pt-4 px-4" : ""}`}>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#fef2f2] flex items-center justify-center">
                <ClipboardCheck className="w-4 h-4 text-[#dc2626]" />
              </div>
              <div>
                <CardTitle className="text-[14px]" style={{ fontWeight: 600 }}>
                  Schweregrade
                </CardTitle>
                <p className="text-[11px] text-muted-foreground font-normal mt-0.5">
                  {totalG} Guideline-Befunde gesamt
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className={`px-5 ${cardPad} space-y-3`}>
            {[
              {
                k: "critical" as const,
                label: "Kritisch",
                n: guidelinesBySeverity.critical,
                color: "#dc2626",
              },
              {
                k: "major" as const,
                label: "Wesentlich",
                n: guidelinesBySeverity.major,
                color: "#ea580c",
              },
              {
                k: "minor" as const,
                label: "Gering",
                n: guidelinesBySeverity.minor,
                color: "#64748b",
              },
            ].map((s) => (
              <div key={s.k} className="flex items-center justify-between text-[13px] gap-2">
                <span className="text-muted-foreground">{s.label}</span>
                <span className="tabular-nums" style={{ fontWeight: 700, color: s.color }}>
                  {s.n}
                </span>
              </div>
            ))}
            <div className="pt-2 mt-2 border-t border-border">
              <p className="text-[11px] text-muted-foreground mb-2 flex items-center gap-1.5">
                <FileSearch className="w-3.5 h-3.5" />
                Dokumenten-Issues:{" "}
                <span className="text-[#1e1e2e] tabular-nums" style={{ fontWeight: 600 }}>
                  {totalD}
                </span>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {showCategoryCharts ? (
        <div className={`grid grid-cols-1 md:grid-cols-2 ${gap}`}>
          <Card className="border border-border bg-white">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#4f46e5]" />
                <CardTitle className="text-[14px]" style={{ fontWeight: 600 }}>
                  Guideline-Checks nach Kategorie
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className={`px-5 ${cardPad} space-y-3`}>
              {GUIDELINE_ORDER.map((k) => {
                const meta = GUIDELINE_CATEGORY_META[k];
                const count = guidelinesByCategory[k];
                return (
                  <BarRow
                    key={k}
                    label={meta.label}
                    count={count}
                    max={gMax}
                    color={meta.color}
                  />
                );
              })}
            </CardContent>
          </Card>

          <Card className="border border-border bg-white">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <FileSearch className="w-4 h-4 text-[#0ea5e9]" />
                <CardTitle className="text-[14px]" style={{ fontWeight: 600 }}>
                  Dokumentenprüfung nach Typ
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className={`px-5 ${cardPad} space-y-3`}>
              {DOC_ORDER.map((k) => {
                const meta = DOC_REVIEW_TYPE_META[k];
                const count = docReviewByType[k];
                return (
                  <BarRow
                    key={k}
                    label={meta.label}
                    count={count}
                    max={dMax}
                    color={meta.color}
                  />
                );
              })}
            </CardContent>
          </Card>
        </div>
      ) : null}

      {showActionLinks ? (
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" className="text-[13px] gap-2" asChild>
            <Link to={guidelinesCheckTo}>
              <ShieldCheck className="w-4 h-4" />
              Guidelines prüfen
            </Link>
          </Button>
          <Button variant="outline" size="sm" className="text-[13px] gap-2" asChild>
            <Link to="/story-generator">
              <Sparkles className="w-4 h-4" />
              Stories & Dokumente
            </Link>
          </Button>
        </div>
      ) : null}
    </div>
  );
}
