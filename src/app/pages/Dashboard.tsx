import { useState } from "react";
import { useNavigate } from "react-router";
import {
  Sparkles,
  AlertTriangle,
  ShieldCheck,
  TrendingUp,
  ArrowRight,
  Clock,
  FileText,
  MoreHorizontal,
  Zap,
  BarChart3,
  BookOpen,
  CheckCircle2,
  XCircle,
  FileWarning,
  Activity,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Progress } from "../components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../components/ui/tooltip";

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
    title: "Compliance Score",
    value: "94%",
    change: "+3% Verbesserung",
    trend: "up",
    icon: ShieldCheck,
    color: "#10b981",
    bgColor: "#d1fae5",
  },
  {
    title: "Aktive Projekte",
    value: "12",
    change: "3 in Analyse",
    trend: "neutral",
    icon: BarChart3,
    color: "#8b5cf6",
    bgColor: "#ede9fe",
  },
];

const recentProjects = [
  {
    name: "Automobil-Plattform Redesign",
    status: "In Analyse",
    stories: 234,
    compliance: 91,
    updated: "vor 2 Stunden",
    statusColor: "#4f46e5",
  },
  {
    name: "Banking App v3.2 Migration",
    status: "Review",
    stories: 187,
    compliance: 96,
    updated: "vor 5 Stunden",
    statusColor: "#f59e0b",
  },
  {
    name: "Healthcare Portal DSGVO",
    status: "Abgeschlossen",
    stories: 342,
    compliance: 99,
    updated: "Gestern",
    statusColor: "#10b981",
  },
  {
    name: "E-Commerce Checkout Flow",
    status: "In Analyse",
    stories: 89,
    compliance: 78,
    updated: "vor 1 Tag",
    statusColor: "#4f46e5",
  },
  {
    name: "IoT Dashboard Spezifikation",
    status: "Entwurf",
    stories: 56,
    compliance: 65,
    updated: "vor 3 Tagen",
    statusColor: "#94a3b8",
  },
];

const recentActivity = [
  { icon: CheckCircle2, text: "23 neue Stories generiert", project: "Automobil-Plattform", time: "vor 15 Min.", color: "#10b981" },
  { icon: XCircle, text: "3 Widersprüche erkannt", project: "Banking App v3.2", time: "vor 1 Std.", color: "#ef4444" },
  { icon: ShieldCheck, text: "Compliance-Check bestanden", project: "Healthcare Portal", time: "vor 2 Std.", color: "#10b981" },
  { icon: FileWarning, text: "5 unklare Formulierungen", project: "E-Commerce Checkout", time: "vor 3 Std.", color: "#f59e0b" },
  { icon: Activity, text: "Neue Regeln importiert", project: "Global", time: "vor 5 Std.", color: "#8b5cf6" },
];

export function Dashboard() {
  const navigate = useNavigate();
  const [hoveredKpi, setHoveredKpi] = useState<number | null>(null);

  return (
    <TooltipProvider>
      <div className="p-8 max-w-[1440px] mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-[#1e1e2e]">
              Willkommen zurück, Sarah
            </h1>
            <p className="text-[14px] text-muted-foreground mt-1">
              Hier ist Ihre Übersicht für heute. 3 Projekte benötigen Ihre Aufmerksamkeit.
            </p>
          </div>
          <Button
            onClick={() => navigate("/story-generator")}
            className="bg-[#4f46e5] hover:bg-[#4338ca] text-white gap-2 h-11 px-6 shadow-sm"
          >
            <Zap className="w-4 h-4" />
            Neue Analyse starten
          </Button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-4 gap-5 mb-8">
          {kpiCards.map((kpi, i) => (
            <Card
              key={i}
              className="border border-border bg-white hover:shadow-md transition-all duration-200 cursor-default overflow-hidden"
              onMouseEnter={() => setHoveredKpi(i)}
              onMouseLeave={() => setHoveredKpi(null)}
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center transition-transform duration-200"
                    style={{
                      backgroundColor: kpi.bgColor,
                      transform: hoveredKpi === i ? "scale(1.05)" : "scale(1)",
                    }}
                  >
                    <kpi.icon className="w-5 h-5" style={{ color: kpi.color }} />
                  </div>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button className="p-1 rounded hover:bg-[#f1f5f9] transition-colors">
                        <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>Details anzeigen</TooltipContent>
                  </Tooltip>
                </div>
                <p className="text-[13px] text-muted-foreground mb-1">{kpi.title}</p>
                <p className="text-[28px] text-[#1e1e2e] tracking-tight" style={{ fontWeight: 600, lineHeight: 1.2 }}>
                  {kpi.value}
                </p>
                <div className="flex items-center gap-1.5 mt-2">
                  {kpi.trend === "up" && <TrendingUp className="w-3.5 h-3.5 text-[#10b981]" />}
                  {kpi.trend === "down" && <TrendingUp className="w-3.5 h-3.5 text-[#10b981] rotate-180" />}
                  <span className="text-[12px] text-[#10b981]" style={{ fontWeight: 500 }}>{kpi.change}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-3 gap-5">
          {/* Recent Projects - 2 columns */}
          <div className="col-span-2">
            <Card className="border border-border bg-white">
              <CardHeader className="pb-3 flex flex-row items-center justify-between">
                <CardTitle className="text-[16px]" style={{ fontWeight: 600 }}>Letzte Projekte</CardTitle>
                <Button variant="ghost" size="sm" className="text-[13px] text-[#4f46e5] hover:text-[#4338ca] hover:bg-[#f1f0ff] gap-1">
                  Alle anzeigen
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </CardHeader>
              <CardContent className="px-5 pb-5">
                <div className="space-y-1">
                  {/* Table Header */}
                  <div className="grid grid-cols-[1fr_100px_80px_120px_100px] gap-3 px-3 py-2 text-[12px] text-muted-foreground" style={{ fontWeight: 500 }}>
                    <span>Projekt</span>
                    <span>Status</span>
                    <span className="text-center">Stories</span>
                    <span>Compliance</span>
                    <span className="text-right">Aktualisiert</span>
                  </div>
                  {recentProjects.map((project, i) => (
                    <div
                      key={i}
                      className="grid grid-cols-[1fr_100px_80px_120px_100px] gap-3 px-3 py-3 rounded-lg hover:bg-[#f8fafc] transition-colors cursor-pointer group items-center"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[#f1f5f9] flex items-center justify-center flex-shrink-0">
                          <FileText className="w-4 h-4 text-[#64748b]" />
                        </div>
                        <span className="text-[13px] text-[#1e1e2e] group-hover:text-[#4f46e5] transition-colors" style={{ fontWeight: 500 }}>
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
                        <Progress value={project.compliance} className="h-1.5 flex-1" />
                        <span className="text-[12px] text-muted-foreground" style={{ fontWeight: 500 }}>{project.compliance}%</span>
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

            {/* Quick Actions */}
            <div className="grid grid-cols-3 gap-4 mt-5">
              <Card
                className="border border-border bg-white hover:shadow-md hover:border-[#4f46e5]/20 transition-all duration-200 cursor-pointer group"
                onClick={() => navigate("/story-generator")}
              >
                <CardContent className="p-5">
                  <div className="w-10 h-10 rounded-xl bg-[#f1f0ff] flex items-center justify-center mb-3 group-hover:bg-[#4f46e5] transition-colors">
                    <Sparkles className="w-5 h-5 text-[#4f46e5] group-hover:text-white transition-colors" />
                  </div>
                  <p className="text-[14px] text-[#1e1e2e] mb-1" style={{ fontWeight: 500 }}>Story Generator</p>
                  <p className="text-[12px] text-muted-foreground">Dokumente hochladen und User Stories generieren</p>
                </CardContent>
              </Card>
              <Card
                className="border border-border bg-white hover:shadow-md hover:border-[#4f46e5]/20 transition-all duration-200 cursor-pointer group"
                onClick={() => navigate("/compliance")}
              >
                <CardContent className="p-5">
                  <div className="w-10 h-10 rounded-xl bg-[#d1fae5] flex items-center justify-center mb-3 group-hover:bg-[#10b981] transition-colors">
                    <ShieldCheck className="w-5 h-5 text-[#10b981] group-hover:text-white transition-colors" />
                  </div>
                  <p className="text-[14px] text-[#1e1e2e] mb-1" style={{ fontWeight: 500 }}>Compliance Check</p>
                  <p className="text-[12px] text-muted-foreground">Requirements gegen Regeln prüfen</p>
                </CardContent>
              </Card>
              <Card
                className="border border-border bg-white hover:shadow-md hover:border-[#4f46e5]/20 transition-all duration-200 cursor-pointer group"
                onClick={() => navigate("/rules")}
              >
                <CardContent className="p-5">
                  <div className="w-10 h-10 rounded-xl bg-[#ede9fe] flex items-center justify-center mb-3 group-hover:bg-[#8b5cf6] transition-colors">
                    <BookOpen className="w-5 h-5 text-[#8b5cf6] group-hover:text-white transition-colors" />
                  </div>
                  <p className="text-[14px] text-[#1e1e2e] mb-1" style={{ fontWeight: 500 }}>Regeln verwalten</p>
                  <p className="text-[12px] text-muted-foreground">Compliance-Regeln konfigurieren</p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Right Column - Activity Feed */}
          <div className="space-y-5">
            <Card className="border border-border bg-white">
              <CardHeader className="pb-3">
                <CardTitle className="text-[16px]" style={{ fontWeight: 600 }}>Letzte Aktivitäten</CardTitle>
              </CardHeader>
              <CardContent className="px-5 pb-5">
                <div className="space-y-4">
                  {recentActivity.map((activity, i) => (
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

            {/* Compliance Overview Mini */}
            <Card className="border border-border bg-white">
              <CardHeader className="pb-3">
                <CardTitle className="text-[16px]" style={{ fontWeight: 600 }}>Compliance-Überblick</CardTitle>
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

            {/* Pro Tip */}
            <Card className="border border-[#4f46e5]/20 bg-[#f1f0ff]/50">
              <CardContent className="p-5">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#4f46e5] flex items-center justify-center flex-shrink-0">
                    <Zap className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-[13px] text-[#4f46e5] mb-1" style={{ fontWeight: 600 }}>Tipp</p>
                    <p className="text-[12px] text-[#475569]">
                      Laden Sie Ihre Confluence-Seiten direkt hoch, um automatisch User Stories zu generieren. 
                      Die AI erkennt Duplikate und Widersprüche.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
