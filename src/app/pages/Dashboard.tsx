import { useMemo } from "react";
import { useNavigate } from "react-router";
import {
  Sparkles,
  AlertTriangle,
  ShieldCheck,
  TrendingUp,
  ArrowRight,
  Clock,
  FileText,
  Zap,
  BarChart3,
  CheckCircle2,
  FileWarning,
  Activity,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Progress } from "../components/ui/progress";
import { TooltipProvider } from "../components/ui/tooltip";
import { useAppContext } from "../context/AppContext";
import {
  getProjectIdsForWorkspace,
  PROJECT_LOGO_BY_ID,
  PROJECT_WORKSPACE,
  PROTOTYPE_USER_ROLE,
} from "../data/workspaces";

const kpiCards = [
  {
    title: "Generierte User Stories",
    value: "1.284",
    change: "+127 diese Woche",
    trend: "up",
    icon: Sparkles,
    color: "#4f46e5",
    bgColor: "#f1f0ff",
  },
  {
    title: "Erkannte Widersprüche",
    value: "47",
    change: "-12 vs. letzte Woche",
    trend: "down",
    icon: AlertTriangle,
    color: "#f59e0b",
    bgColor: "#fef3c7",
  },
  {
    title: "Guidelines-Quote",
    value: "94%",
    change: "+3% Verbesserung",
    trend: "up",
    icon: ShieldCheck,
    color: "#10b981",
    bgColor: "#d1fae5",
  },
  {
    title: "Aktive Projekte",
    value: "15",
    change: "Automotive-Demo (5 OEM)",
    trend: "neutral",
    icon: BarChart3,
    color: "#8b5cf6",
    bgColor: "#ede9fe",
  },
];

const recentProjects = [
  { id: "P-101", name: "BMW Group — Versuchsteile & Entwicklungs-Analytics", status: "Aktiv", stories: 7, guidelinesQuote: 86, updated: "vor 35 Min.", statusColor: "#1c69d4" },
  { id: "P-102", name: "BMW Group — Fahrzeuglogistik & Vertriebs-Transparenz", status: "Aktiv", stories: 7, guidelinesQuote: 89, updated: "vor 2 Std.", statusColor: "#1c69d4" },
  { id: "P-103", name: "BMW Group — Digital Core & ERP-Roadmap", status: "Review", stories: 7, guidelinesQuote: 91, updated: "Gestern", statusColor: "#f59e0b" },
  { id: "P-201", name: "Volkswagen Group — Datenraum Mobilität", status: "Aktiv", stories: 7, guidelinesQuote: 88, updated: "vor 50 Min.", statusColor: "#001e50" },
  { id: "P-202", name: "Volkswagen Group — Konzern-IT & Integrationsplattform", status: "Aktiv", stories: 7, guidelinesQuote: 90, updated: "vor 4 Std.", statusColor: "#001e50" },
  { id: "P-203", name: "Volkswagen Group — Marken-Apps & Partner-Ökosystem", status: "Entwurf", stories: 7, guidelinesQuote: 78, updated: "vor 2 Tagen", statusColor: "#64748b" },
  { id: "P-301", name: "Mercedes-Benz Group — E-Mobility Software & Baukasten", status: "Aktiv", stories: 7, guidelinesQuote: 92, updated: "vor 20 Min.", statusColor: "#00adef" },
  { id: "P-302", name: "Mercedes-Benz Group — OTA & Fahrzeug-Software-Releases", status: "Aktiv", stories: 7, guidelinesQuote: 87, updated: "vor 6 Std.", statusColor: "#00adef" },
  { id: "P-303", name: "Mercedes-Benz Group — Vertrieb & Aftersales Digital", status: "Review", stories: 7, guidelinesQuote: 85, updated: "vor 1 Tag", statusColor: "#f59e0b" },
  { id: "P-401", name: "AUDI — Infotainment & HMI", status: "Aktiv", stories: 7, guidelinesQuote: 88, updated: "vor 90 Min.", statusColor: "#bb0a30" },
  { id: "P-402", name: "AUDI — Konfigurator & Commerce", status: "Aktiv", stories: 7, guidelinesQuote: 86, updated: "vor 5 Std.", statusColor: "#bb0a30" },
  { id: "P-403", name: "AUDI — Vernetzung & Drittpartner-APIs", status: "Entwurf", stories: 7, guidelinesQuote: 74, updated: "vor 3 Tagen", statusColor: "#94a3b8" },
  { id: "P-501", name: "Porsche AG — Motorsport & Fahrzeugdaten", status: "Aktiv", stories: 7, guidelinesQuote: 90, updated: "vor 40 Min.", statusColor: "#d5001c" },
  { id: "P-502", name: "Porsche AG — Kundenplattform & Personalisierung", status: "Aktiv", stories: 7, guidelinesQuote: 88, updated: "vor 8 Std.", statusColor: "#d5001c" },
  { id: "P-503", name: "Porsche AG — Supply Chain & Teile-Transparenz", status: "Review", stories: 7, guidelinesQuote: 84, updated: "Gestern", statusColor: "#f59e0b" },
];

const recentActivity: {
  icon: typeof CheckCircle2;
  text: string;
  project: string;
  time: string;
  color: string;
  workspaceId?: string | null;
}[] = [
  { icon: Zap, text: "SAC-KPI-Workshop abgeschlossen — nächster Schritt Abnahme", project: "BMW Versuchsteile", time: "vor 25 Min.", color: "#10b981", workspaceId: "ws-bmw" },
  { icon: FileWarning, text: "Consent-Modell Datenraum — offene rechtliche Review-Punkte", project: "VW Datenraum", time: "vor 2 Std.", color: "#f59e0b", workspaceId: "ws-vw" },
  { icon: ShieldCheck, text: "OTA-Signatur-Pipeline für Pilotflotte freigegeben", project: "Mercedes OTA", time: "vor 3 Std.", color: "#10b981", workspaceId: "ws-mercedes" },
  { icon: CheckCircle2, text: "MMI Voice-Regressionstest Sprint grün", project: "AUDI Infotainment", time: "vor 5 Std.", color: "#10b981", workspaceId: "ws-audi" },
  { icon: Activity, text: "Neuer Regelkatalog für Guidelines importiert", project: "Global", time: "vor 6 Std.", color: "#8b5cf6", workspaceId: null },
  { icon: FileWarning, text: "Telemetrie-Latenz Track-Tag über Schwelle (Alert)", project: "Porsche Motorsport", time: "vor 1 Std.", color: "#f59e0b", workspaceId: "ws-porsche" },
];

export function Dashboard() {
  const navigate = useNavigate();
  const {
    selectedWorkspaceId,
    selectedWorkspace,
    storiesInWorkspace,
    myProjectIdsInWorkspace,
    isPrototypeUserOnProjectTeam,
  } = useAppContext();

  const dashboardRecentProjects = useMemo(
    () =>
      recentProjects.filter(
        (p) => PROJECT_WORKSPACE[p.id] === selectedWorkspaceId,
      ),
    [selectedWorkspaceId],
  );

  /** Projekte, in deren Team Ihre Kennung (SM / Dr. Sarah Müller) geführt wird. */
  const displayedRecentProjects = useMemo(
    () =>
      dashboardRecentProjects.filter((p) =>
        isPrototypeUserOnProjectTeam(p.id),
      ),
    [dashboardRecentProjects, isPrototypeUserOnProjectTeam],
  );

  const dashboardActivity = useMemo(
    () =>
      recentActivity.filter(
        (a) =>
          a.workspaceId == null || a.workspaceId === selectedWorkspaceId,
      ),
    [selectedWorkspaceId],
  );

  const workspaceProjectCount = getProjectIdsForWorkspace(
    selectedWorkspaceId,
  ).length;

  const myProjectCount = myProjectIdsInWorkspace.length;

  const kpiCardsResolved = useMemo(() => {
    return kpiCards.map((kpi, i) =>
      i === 3
        ? {
            ...kpi,
            value: String(myProjectCount),
            change: "Projekte, in denen Sie im Team stehen",
          }
        : i === 0
          ? {
              ...kpi,
              value: String(storiesInWorkspace.length),
              change: "Stories in diesem Workspace",
            }
          : kpi,
    );
  }, [
    myProjectCount,
    selectedWorkspace.name,
    storiesInWorkspace.length,
  ]);

  return (
    <TooltipProvider>
      <div className="p-4 sm:p-6 lg:p-8 max-w-[1440px] mx-auto min-w-0">
        {/* Header */}
        <div className="mb-6 sm:mb-8 min-w-0">
          <h1 className="text-[#1e1e2e] text-xl sm:text-2xl">
            Willkommen zurück, Dr. Sarah Müller
          </h1>
          <p className="text-[13px] text-slate-500 mt-0.5">
            {PROTOTYPE_USER_ROLE} · Demo-Persona für diese Oberfläche
          </p>
          <p className="text-[14px] text-muted-foreground mt-2 flex flex-wrap items-center gap-2">
            {selectedWorkspace.logoSrc ? (
              <span className="inline-flex w-8 h-8 rounded-lg border border-border bg-white items-center justify-center shrink-0 shadow-sm">
                <img
                  src={selectedWorkspace.logoSrc}
                  alt=""
                  className="max-w-[26px] max-h-[26px] object-contain"
                  loading="lazy"
                />
              </span>
            ) : null}
            <span>
              Übersicht für{" "}
              <span className="text-[#475569]" style={{ fontWeight: 500 }}>
                {selectedWorkspace.name}
              </span>
              {" · "}
              {myProjectCount} Ihr{myProjectCount === 1 ? " Projekt" : "e Projekte"} mit Team ·{" "}
              {workspaceProjectCount} gesamt im Workspace
            </span>
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5">
          {/* Recent Projects - 2 columns */}
          <div className="lg:col-span-2 min-w-0">
            <Card className="border border-border bg-white" data-tour="dashboard-projects-card">
              <CardHeader className="pb-3 flex flex-row items-center justify-between gap-3">
                <div className="min-w-0">
                  <CardTitle className="text-[16px]" style={{ fontWeight: 600 }}>
                    Ihre Projekte
                  </CardTitle>
                  <p className="text-[12px] text-muted-foreground font-normal mt-1 leading-snug">
                    Nur Projekte, in deren Team Sie (SM) sind — alle Projekte unter{" "}
                    <span className="text-[#475569]" style={{ fontWeight: 500 }}>Projekte</span>.
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-[13px] text-[#4f46e5] hover:text-[#4338ca] hover:bg-[#f1f0ff] gap-1 shrink-0 self-start sm:self-center"
                  onClick={() => navigate("/projects")}
                >
                  Alle anzeigen
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </CardHeader>
              <CardContent className="px-3 sm:px-5 pb-5 overflow-x-auto">
                <div className="space-y-1 min-w-[480px]">
                  {/* Table Header */}
                  <div className="grid grid-cols-[1fr_80px_60px_90px_80px] sm:grid-cols-[1fr_100px_80px_120px_100px] gap-2 sm:gap-3 px-2 sm:px-3 py-2 text-[12px] text-muted-foreground" style={{ fontWeight: 500 }}>
                    <span>Projekt</span>
                    <span>Status</span>
                    <span className="text-center">Stories</span>
                    <span>Guidelines-Quote</span>
                    <span className="text-right">Aktualisiert</span>
                  </div>
                  {displayedRecentProjects.length === 0 ? (
                    <div className="px-3 py-8 text-center space-y-3">
                      {dashboardRecentProjects.length > 0 ? (
                        <>
                          <p className="text-[13px] text-muted-foreground max-w-sm mx-auto leading-relaxed">
                            Sie sind in diesem Workspace keinem Projektteam zugewiesen.
                            Treten Sie unter Projekte einem Team bei, um es hier zu sehen.
                          </p>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-[13px]"
                            onClick={() => navigate("/projects")}
                          >
                            Zu den Projekten
                          </Button>
                        </>
                      ) : (
                        <p className="text-[13px] text-muted-foreground">
                          Keine Projekte in diesem Workspace in der Kurzliste.
                        </p>
                      )}
                    </div>
                  ) : null}
                  {displayedRecentProjects.map((project) => (
                    <div
                      key={project.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => navigate(`/projects/${project.id}`)}
                      onKeyDown={(e) => e.key === "Enter" && navigate(`/projects/${project.id}`)}
                      className="grid grid-cols-[1fr_80px_60px_90px_80px] sm:grid-cols-[1fr_100px_80px_120px_100px] gap-2 sm:gap-3 px-2 sm:px-3 py-3 rounded-lg hover:bg-[#f8fafc] transition-colors cursor-pointer group items-center"
                    >
                      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-[#f1f5f9] flex items-center justify-center flex-shrink-0 border border-[#e2e8f0] overflow-hidden group-hover:border-[#e0e7ff] transition-colors">
                          {PROJECT_LOGO_BY_ID[project.id] ? (
                            <img
                              src={PROJECT_LOGO_BY_ID[project.id]}
                              alt=""
                              className="w-5 h-5 object-contain"
                              loading="lazy"
                            />
                          ) : (
                            <FileText className="w-4 h-4 text-[#64748b]" />
                          )}
                        </div>
                        <span className="text-[13px] text-[#1e1e2e] group-hover:text-[#4f46e5] transition-colors truncate" style={{ fontWeight: 500 }}>
                          {project.name}
                        </span>
                      </div>
                      <Badge
                        variant="secondary"
                        className="text-[11px] justify-center px-2 py-0.5"
                        style={{
                          backgroundColor: `${project.statusColor}15`,
                          color: project.statusColor,
                          fontWeight: 500,
                        }}
                      >
                        {project.status}
                      </Badge>
                      <span className="text-[13px] text-center text-muted-foreground">{project.stories}</span>
                      <div className="flex items-center gap-2">
                        <Progress value={project.guidelinesQuote} className="h-1.5 flex-1" />
                        <span className="text-[12px] text-muted-foreground" style={{ fontWeight: 500 }}>{project.guidelinesQuote}%</span>
                      </div>
                      <div className="flex items-center justify-end gap-1 text-[12px] text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        {project.updated}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border border-border bg-white mt-4 sm:mt-5" data-tour="dashboard-activity-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-[16px]" style={{ fontWeight: 600 }}>
                  Letzte Aktivitäten
                </CardTitle>
                <p className="text-[12px] text-muted-foreground font-normal mt-1 leading-snug">
                  Wo Sie zuletzt in diesem Workspace gearbeitet haben
                </p>
              </CardHeader>
              <CardContent className="px-5 pb-5">
                <div className="space-y-4">
                  {dashboardActivity.length === 0 ? (
                    <p className="text-[13px] text-muted-foreground text-center py-4">
                      Keine Aktivitäten für diesen Workspace.
                    </p>
                  ) : null}
                  {dashboardActivity.map((activity, i) => (
                    <div key={i} className="flex items-start gap-3 group">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                        style={{ backgroundColor: `${activity.color}15` }}
                      >
                        <activity.icon className="w-4 h-4" style={{ color: activity.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] text-[#1e1e2e]" style={{ fontWeight: 500 }}>{activity.text}</p>
                        <p className="text-[12px] text-muted-foreground">{activity.project}</p>
                      </div>
                      <span className="text-[11px] text-muted-foreground flex-shrink-0 mt-0.5">{activity.time}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-4 sm:space-y-5 min-w-0">
            <Card className="border border-border bg-white">
              <CardHeader className="pb-3">
                <CardTitle className="text-[16px]" style={{ fontWeight: 600 }}>
                  Wochen-Recap
                </CardTitle>
                <p className="text-[12px] text-muted-foreground font-normal mt-1 leading-snug">
                  Kurzüberblick · Schätzung diese Woche
                </p>
              </CardHeader>
              <CardContent className="px-5 pb-5 pt-0">
                <ul className="divide-y divide-border">
                  {kpiCardsResolved.map((kpi, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-3 py-2.5 first:pt-0 last:pb-0"
                    >
                      <div
                        className="w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: kpi.bgColor }}
                      >
                        <kpi.icon className="w-3.5 h-3.5" style={{ color: kpi.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] text-muted-foreground leading-tight">{kpi.title}</p>
                        <p
                          className="text-[15px] text-[#1e1e2e] tabular-nums mt-0.5"
                          style={{ fontWeight: 600 }}
                        >
                          {kpi.value}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0 max-w-[45%] pt-0.5">
                        <span className="inline-flex flex-wrap items-center justify-end gap-1 text-[10px] text-muted-foreground leading-tight">
                          {kpi.trend === "up" ? (
                            <TrendingUp className="w-3 h-3 text-[#059669] flex-shrink-0" aria-hidden />
                          ) : kpi.trend === "down" ? (
                            <TrendingUp className="w-3 h-3 rotate-180 text-[#059669] flex-shrink-0" aria-hidden />
                          ) : null}
                          <span>{kpi.change}</span>
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Guidelines-Überblick (Mini) */}
            <Card className="border border-border bg-white">
              <CardHeader className="pb-3">
                <CardTitle className="text-[16px]" style={{ fontWeight: 600 }}>Guidelines-Überblick</CardTitle>
              </CardHeader>
              <CardContent className="px-5 pb-5 space-y-4">
                {[
                  { label: "Sprachliche Standards", score: 97, color: "#10b981" },
                  { label: "Strukturvorgaben", score: 91, color: "#4f46e5" },
                  { label: "DSGVO / Rechtlich", score: 88, color: "#f59e0b" },
                  { label: "ISO 29148", score: 95, color: "#10b981" },
                ].map((item, i) => (
                  <div key={i}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[13px] text-[#475569]">{item.label}</span>
                      <span className="text-[13px]" style={{ color: item.color, fontWeight: 600 }}>{item.score}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-[#f1f5f9] overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${item.score}%`, backgroundColor: item.color }}
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
