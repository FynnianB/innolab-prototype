import { useState, useRef } from "react";
import { motion } from "motion/react";
import {
  FolderSearch,
  Upload,
  FileCheck,
  Sparkles,
  CheckSquare,
  GitCompare,
  Save,
  Users,
  User,
  Building2,
  Target,
  Brain,
  AlertTriangle,
  Lightbulb,
  Heart,
  ChevronLeft,
  ChevronRight,
  Zap,
  Shield,
  MessageCircleQuestion,
  MousePointerClick,
  Crosshair,
  ThumbsUp,
  Bot,
  ShieldCheck,
  ArrowRight,
  Briefcase,
  FileText,
  ClipboardList,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  DATA                                                               */
/* ------------------------------------------------------------------ */

interface Phase {
  id: string;
  number: number;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  color: string;         // tailwind bg color for badges
  colorLight: string;    // light bg
  colorText: string;     // text color
  colorBorder: string;   // border color
  actions: string[];
  goals: string[];
  thoughts: string[];
  painPoints: string[];
  opportunities: string[];
  emotionScore: number;  // 1-10
  emotionLabel: string;
  isAiHighlight: boolean;
  isTrustCritical: boolean;
}

const phases: Phase[] = [
  {
    id: "prepare",
    number: 1,
    title: "Vorbereitung",
    subtitle: "Dokumente sammeln",
    icon: <FolderSearch className="w-5 h-5" />,
    color: "bg-slate-600",
    colorLight: "bg-slate-50",
    colorText: "text-slate-700",
    colorBorder: "border-slate-200",
    actions: [
      "Anforderungsdokumente aus verschiedenen Quellen zusammentragen",
      "Meeting-Notizen, Protokolle und E-Mails sichten",
      "Bestehende Spezifikationen und Standards identifizieren",
    ],
    goals: [
      "Vollständige Dokumentenbasis schaffen",
      "Keine relevanten Anforderungen übersehen",
      "Effizient alle Quellen konsolidieren",
    ],
    thoughts: [
      `„Habe ich wirklich alle relevanten Dokumente?"`,
      `„Welche Formate werden unterstützt?"`,
      `„Wie umfangreich darf ein Upload sein?"`,
    ],
    painPoints: [
      "Dokumente liegen in verschiedenen Formaten und Systemen verstreut",
      "Hoher manueller Aufwand beim Zusammensuchen",
      "Unklarheit, ob die Dokumentenbasis vollständig ist",
    ],
    opportunities: [
      "Connector zu Confluence/SharePoint für automatischen Import",
      "Checkliste für vollständige Dokumentenbasis anbieten",
      "Drag-and-Drop aus verschiedenen Quellen ermöglichen",
    ],
    emotionScore: 4,
    emotionLabel: "Gestresst & unsicher",
    isAiHighlight: false,
    isTrustCritical: false,
  },
  {
    id: "upload",
    number: 2,
    title: "Dokumente hochladen",
    subtitle: "In ReqWise AI importieren",
    icon: <Upload className="w-5 h-5" />,
    color: "bg-blue-600",
    colorLight: "bg-blue-50",
    colorText: "text-blue-700",
    colorBorder: "border-blue-200",
    actions: [
      "PDF-, Word- oder Text-Dateien per Drag & Drop hochladen",
      "Batch-Upload für mehrere Dokumente durchführen",
      "Dokument-Metadaten und Projekt zuordnen",
    ],
    goals: [
      "Schneller, reibungsloser Upload-Prozess",
      "Sofortiges Feedback über Uploadstatus",
      "Vertrauen, dass die Daten sicher verarbeitet werden",
    ],
    thoughts: [
      `„Funktioniert der Upload mit meinen Dateiformaten?"`,
      `„Wie lange dauert die Verarbeitung?"`,
      `„Sind meine Daten hier sicher?"`,
    ],
    painPoints: [
      "Unsicherheit über unterstützte Dateiformate",
      "Fehlende Fortschrittsanzeige bei großen Dateien",
      "Keine Vorschau vor dem Upload möglich",
    ],
    opportunities: [
      "Format-Validierung vor dem Upload anzeigen",
      "Live-Fortschrittsanzeige mit geschätzter Restzeit",
      "Quick-Preview des Dokumenteninhalts",
    ],
    emotionScore: 6,
    emotionLabel: "Motiviert & gespannt",
    isAiHighlight: false,
    isTrustCritical: true,
  },
  {
    id: "review",
    number: 3,
    title: "Dokumentenprüfung",
    subtitle: "Analyse verstehen & bestätigen",
    icon: <FileCheck className="w-5 h-5" />,
    color: "bg-cyan-600",
    colorLight: "bg-cyan-50",
    colorText: "text-cyan-700",
    colorBorder: "border-cyan-200",
    actions: [
      "Automatische Dokumentenanalyse überprüfen",
      "Erkannte Struktur und Abschnitte validieren",
      "Irrelevante Abschnitte ausschließen oder markieren",
    ],
    goals: [
      "Verstehen, wie die KI das Dokument interpretiert",
      "Sicherstellen, dass keine Inhalte falsch zugeordnet wurden",
      "Kontrolle über den Input behalten",
    ],
    thoughts: [
      `„Hat die KI alles richtig erkannt?"`,
      `„Was passiert, wenn etwas falsch zugeordnet ist?"`,
      `„Kann ich nachträglich Korrekturen vornehmen?"`,
    ],
    painPoints: [
      "Schwer nachvollziehbar, wie die KI Abschnitte interpretiert",
      "Kein einfaches Undo bei falscher Bestätigung",
      "Wartezeit bei umfangreichen Dokumenten",
    ],
    opportunities: [
      "Transparente Erklärung der KI-Analyse (Explainability)",
      "Inline-Annotationen zum Nachvollziehen der Zuordnung",
      "Möglichkeit, Abschnitte manuell zu korrigieren",
    ],
    emotionScore: 5,
    emotionLabel: "Prüfend & vorsichtig",
    isAiHighlight: true,
    isTrustCritical: true,
  },
  {
    id: "generate",
    number: 4,
    title: "Stories generieren",
    subtitle: "KI erstellt User Stories",
    icon: <Sparkles className="w-5 h-5" />,
    color: "bg-violet-600",
    colorLight: "bg-violet-50",
    colorText: "text-violet-700",
    colorBorder: "border-violet-200",
    actions: [
      "Story-Generierung starten und Fortschritt beobachten",
      "Generierungsparameter bei Bedarf anpassen",
      "Erste Ergebnisse in Echtzeit sichten",
    ],
    goals: [
      "Qualitativ hochwertige, verwendbare User Stories erhalten",
      "Zeitersparnis gegenüber manueller Erstellung",
      "Stories im gewünschten Format (As a… I want… So that…)",
    ],
    thoughts: [
      `„Wie gut ist die Qualität der generierten Stories?"`,
      `„Spart mir das wirklich signifikant Zeit?"`,
      `„Kann ich den Detailgrad der Stories beeinflussen?"`,
    ],
    painPoints: [
      "Wartezeit bei großen Dokumentensätzen",
      "Unklarheit über Qualitätskriterien der KI",
      "Fehlende Möglichkeit, den Generierungsprozess zu beeinflussen",
    ],
    opportunities: [
      "Echtzeit-Fortschritt mit Story-Preview während der Generierung",
      "Konfigurierbare Story-Templates und Detailtiefe",
      "Qualitätsscore pro generierter Story anzeigen",
    ],
    emotionScore: 8,
    emotionLabel: "Beeindruckt & begeistert",
    isAiHighlight: true,
    isTrustCritical: false,
  },
  {
    id: "select",
    number: 5,
    title: "Stories prüfen",
    subtitle: "Auswählen & anpassen",
    icon: <CheckSquare className="w-5 h-5" />,
    color: "bg-emerald-600",
    colorLight: "bg-emerald-50",
    colorText: "text-emerald-700",
    colorBorder: "border-emerald-200",
    actions: [
      "Generierte Stories einzeln durchgehen und bewerten",
      "Stories bearbeiten, zusammenführen oder aufteilen",
      "Akzeptanzkriterien ergänzen und verfeinern",
    ],
    goals: [
      "Nur qualitativ passende Stories weiterverarbeiten",
      "Stories an Team-Standards und Projektkontext anpassen",
      "Vollständigkeit der Akzeptanzkriterien sicherstellen",
    ],
    thoughts: [
      `„Entsprechen diese Stories unseren Qualitätsstandards?"`,
      `„Fehlen hier Akzeptanzkriterien oder Edge Cases?"`,
      `„Kann ich mehrere Stories gleichzeitig bearbeiten?"`,
    ],
    painPoints: [
      "Bei vielen Stories wird die Einzelprüfung zeitaufwändig",
      "Fehlende Bulk-Bearbeitungsmöglichkeiten",
      "Schwer, konsistente Qualität über alle Stories sicherzustellen",
    ],
    opportunities: [
      "Bulk-Aktionen für Auswahl, Bearbeitung und Tagging",
      "KI-gestützte Qualitätsprüfung mit Verbesserungsvorschlägen",
      "Story-Vergleichsansicht für ähnliche Stories",
    ],
    emotionScore: 7,
    emotionLabel: "Fokussiert & analytisch",
    isAiHighlight: true,
    isTrustCritical: false,
  },
  {
    id: "jira",
    number: 6,
    title: "Jira-Abgleich",
    subtitle: "Optional: Duplikate & Abhängigkeiten",
    icon: <GitCompare className="w-5 h-5" />,
    color: "bg-orange-600",
    colorLight: "bg-orange-50",
    colorText: "text-orange-700",
    colorBorder: "border-orange-200",
    actions: [
      "Jira-Backlog mit generierten Stories abgleichen",
      "Duplikate und Überschneidungen identifizieren",
      "Abhängigkeiten zwischen neuen und bestehenden Stories erkennen",
    ],
    goals: [
      "Keine doppelten Stories im Backlog",
      "Klare Abhängigkeiten verstehen",
      "Bestehende Arbeit nicht versehentlich überschreiben",
    ],
    thoughts: [
      `„Erkennt das Tool Duplikate wirklich zuverlässig?"`,
      `„Was passiert bei teilweisen Überschneidungen?"`,
      `„Werden die Jira-Daten nur gelesen oder auch verändert?"`,
    ],
    painPoints: [
      "Komplexe Abhängigkeiten sind schwer visuell darzustellen",
      "Unsicherheit bei teilweisen Überschneidungen",
      "Angst vor ungewollten Änderungen im Jira-Backlog",
    ],
    opportunities: [
      "Intelligente Merge-Vorschläge mit Vorschau",
      "Read-Only-Modus als Standard für mehr Sicherheit",
      "Visuelle Dependency-Map für Abhängigkeiten",
    ],
    emotionScore: 5,
    emotionLabel: "Vorsichtig & konzentriert",
    isAiHighlight: true,
    isTrustCritical: true,
  },
  {
    id: "save",
    number: 7,
    title: "Stories speichern",
    subtitle: "Im Projekt ablegen",
    icon: <Save className="w-5 h-5" />,
    color: "bg-green-600",
    colorLight: "bg-green-50",
    colorText: "text-green-700",
    colorBorder: "border-green-200",
    actions: [
      "Ausgewählte Stories im Projekt speichern",
      "Export-Format wählen (PDF, CSV oder Jira-Push)",
      "Bestätigung und Zusammenfassung prüfen",
    ],
    goals: [
      "Ergebnisse sicher und nachvollziehbar ablegen",
      "Flexibler Export in verschiedene Formate",
      "Klare Bestätigung des Speichervorgangs",
    ],
    thoughts: [
      `„Wurden alle meine Änderungen übernommen?"`,
      `„Kann ich später noch Anpassungen vornehmen?"`,
      `„Welches Export-Format passt am besten?"`,
    ],
    painPoints: [
      "Keine Versionierung der gespeicherten Story-Sets",
      "Export-Optionen könnten umfangreicher sein",
      "Unklarheit über Jira-Push-Ergebnisse",
    ],
    opportunities: [
      "Versionierung und Story-Set-Historie",
      "Konfigurierbares Export-Template",
      "Preview des Jira-Push vor Ausführung",
    ],
    emotionScore: 8,
    emotionLabel: "Erleichtert & zufrieden",
    isAiHighlight: false,
    isTrustCritical: false,
  },
  {
    id: "handoff",
    number: 8,
    title: "Team-Übergabe",
    subtitle: "Weiterarbeit & Entwicklung",
    icon: <Users className="w-5 h-5" />,
    color: "bg-indigo-600",
    colorLight: "bg-indigo-50",
    colorText: "text-indigo-700",
    colorBorder: "border-indigo-200",
    actions: [
      "Stories im Sprint Planning mit dem Team besprechen",
      "Entwicklern Kontext und Hintergrunddokumente teilen",
      "Feedback aus dem Team einholen und einarbeiten",
    ],
    goals: [
      "Reibungslose Übergabe an das Entwicklungsteam",
      "Gemeinsames Verständnis der Anforderungen",
      "Schneller Start der Implementierung",
    ],
    thoughts: [
      `„Verstehen die Entwickler den Kontext hinter den Stories?"`,
      `„Wie kann ich Feedback effizient einarbeiten?"`,
      `„Kann das Team direkt in ReqWise kommentieren?"`,
    ],
    painPoints: [
      "Kontextverlust zwischen Requirements und Entwicklung",
      "Kein direkter Feedback-Kanal in der App",
      "Schwierig, den Überblick über alle Story-Änderungen zu behalten",
    ],
    opportunities: [
      "Team-Kommentar-Funktion direkt an Stories",
      "Automatische Kontext-Zusammenfassung für Entwickler",
      "Change-Log und Benachrichtigungen bei Story-Änderungen",
    ],
    emotionScore: 9,
    emotionLabel: "Stolz & produktiv",
    isAiHighlight: false,
    isTrustCritical: false,
  },
];

/* ------------------------------------------------------------------ */
/*  COMPONENTS                                                         */
/* ------------------------------------------------------------------ */

function RowLabel({
  icon,
  label,
  color = "text-slate-500",
}: {
  icon: React.ReactNode;
  label: string;
  color?: string;
}) {
  return (
    <div className={`flex items-center gap-2 ${color}`}>
      {icon}
      <span className="text-xs whitespace-nowrap">{label}</span>
    </div>
  );
}

function CardList({
  items,
  variant = "default",
}: {
  items: string[];
  variant?: "default" | "pain" | "opportunity";
}) {
  const baseClasses = {
    default: "bg-white border-slate-100",
    pain: "bg-red-50/70 border-red-100",
    opportunity: "bg-emerald-50/70 border-emerald-100",
  };
  const dotClasses = {
    default: "bg-slate-300",
    pain: "bg-red-400",
    opportunity: "bg-emerald-500",
  };
  return (
    <div className="space-y-1.5">
      {items.map((item, i) => (
        <div
          key={i}
          className={`rounded-lg border px-3 py-2 ${baseClasses[variant]}`}
        >
          <div className="flex items-start gap-2">
            <div
              className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${dotClasses[variant]}`}
            />
            <span className="text-xs text-slate-600 leading-relaxed">
              {item}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

function BadgePill({
  icon,
  label,
  className,
}: {
  icon: React.ReactNode;
  label: string;
  className: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] ${className}`}
    >
      {icon}
      {label}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  EMOTION CURVE                                                      */
/* ------------------------------------------------------------------ */

function EmotionCurve({
  scores,
  phaseWidth,
}: {
  scores: number[];
  phaseWidth: number;
}) {
  const height = 80;
  const padding = 16;
  const totalWidth = scores.length * phaseWidth;
  const usableHeight = height - padding * 2;

  const points = scores.map((score, i) => ({
    x: i * phaseWidth + phaseWidth / 2,
    y: padding + usableHeight - ((score - 1) / 9) * usableHeight,
  }));

  // Build smooth bezier path
  let path = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const cp1x = points[i].x + (points[i + 1].x - points[i].x) * 0.4;
    const cp1y = points[i].y;
    const cp2x = points[i + 1].x - (points[i + 1].x - points[i].x) * 0.4;
    const cp2y = points[i + 1].y;
    path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${points[i + 1].x} ${points[i + 1].y}`;
  }

  const getColor = (score: number) => {
    if (score >= 7) return "#10b981";
    if (score >= 5) return "#f59e0b";
    return "#ef4444";
  };

  return (
    <svg
      width={totalWidth}
      height={height}
      className="overflow-visible"
      style={{ minWidth: totalWidth }}
    >
      {/* Grid lines */}
      {[2, 4, 6, 8, 10].map((val) => {
        const y =
          padding + usableHeight - ((val - 1) / 9) * usableHeight;
        return (
          <line
            key={val}
            x1={0}
            y1={y}
            x2={totalWidth}
            y2={y}
            stroke="#e2e8f0"
            strokeWidth={0.5}
            strokeDasharray="4 4"
          />
        );
      })}
      {/* Gradient fill under curve */}
      <defs>
        <linearGradient id="curveGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6366f1" stopOpacity={0.15} />
          <stop offset="100%" stopColor="#6366f1" stopOpacity={0.02} />
        </linearGradient>
      </defs>
      <path
        d={`${path} L ${points[points.length - 1].x} ${height} L ${points[0].x} ${height} Z`}
        fill="url(#curveGrad)"
      />
      {/* Line */}
      <path
        d={path}
        fill="none"
        stroke="#6366f1"
        strokeWidth={2.5}
        strokeLinecap="round"
      />
      {/* Dots */}
      {points.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r={12} fill="white" />
          <circle cx={p.x} cy={p.y} r={8} fill={getColor(scores[i])} />
          <circle cx={p.x} cy={p.y} r={5} fill="white" fillOpacity={0.3} />
        </g>
      ))}
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  MAIN COMPONENT                                                     */
/* ------------------------------------------------------------------ */

export function CustomerJourney() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const PHASE_WIDTH = 280;
  const LABEL_WIDTH = 160;

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const el = scrollRef.current;
    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  };

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({
      left: dir === "left" ? -PHASE_WIDTH * 2 : PHASE_WIDTH * 2,
      behavior: "smooth",
    });
  };

  return (
    <div className="min-h-full bg-slate-50/50">
      <div className="p-6 pb-8 max-w-[1440px] mx-auto">
        {/* ── HEADER ── */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-6"
        >
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-md shadow-indigo-200">
                <ClipboardList className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-slate-900">Customer Journey Map</h1>
                <p className="text-sm text-slate-500">
                  ReqWise AI · Vom ersten Dokument bis zur fertigen User Story
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 mr-2">Horizontal scrollen</span>
              <button
                onClick={() => scroll("left")}
                disabled={!canScrollLeft}
                className="w-8 h-8 rounded-lg border border-slate-200 bg-white flex items-center justify-center hover:bg-slate-50 disabled:opacity-30 transition-all"
              >
                <ChevronLeft className="w-4 h-4 text-slate-600" />
              </button>
              <button
                onClick={() => scroll("right")}
                disabled={!canScrollRight}
                className="w-8 h-8 rounded-lg border border-slate-200 bg-white flex items-center justify-center hover:bg-slate-50 disabled:opacity-30 transition-all"
              >
                <ChevronRight className="w-4 h-4 text-slate-600" />
              </button>
            </div>
          </div>

          {/* Persona Card */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <div className="flex items-start gap-8">
              {/* Avatar & Name */}
              <div className="flex items-center gap-4 shrink-0">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-200/60">
                  <User className="w-7 h-7 text-white" />
                </div>
                <div>
                  <div className="text-xs text-indigo-600 mb-0.5">Persona</div>
                  <h3 className="text-slate-900">Requirements Engineer</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Mittelgroßes bis großes Unternehmen
                  </p>
                </div>
              </div>

              {/* Persona Details */}
              <div className="grid grid-cols-3 gap-6 flex-1 min-w-0">
                <div className="flex items-start gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                    <Briefcase className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[11px] text-slate-400 mb-0.5">Situation</div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Arbeitet mit vielen Notizen, Anforderungen und
                      Dokumenten aus verschiedenen Quellen
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center shrink-0">
                    <Target className="w-4 h-4 text-violet-600" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[11px] text-slate-400 mb-0.5">Hauptziel</div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Saubere User Stories erstellen, Compliance-Regeln
                      einhalten und mit dem Jira-Backlog synchronisieren
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center shrink-0">
                    <Building2 className="w-4 h-4 text-amber-600" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[11px] text-slate-400 mb-0.5">
                      Kontext
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Enterprise SaaS, Desktop-Anwendung, arbeitet mit
                      bestehendem Jira-Backlog und Unternehmensstandards
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── LEGEND ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="flex items-center gap-5 mb-4 flex-wrap"
        >
          <div className="flex items-center gap-4 bg-white rounded-lg border border-slate-200 px-4 py-2 shadow-sm">
            <span className="text-[11px] text-slate-400 mr-1">Emotion:</span>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span className="text-[11px] text-slate-500">Positiv (7-10)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span className="text-[11px] text-slate-500">Neutral (5-6)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
              <span className="text-[11px] text-slate-500">Negativ (1-4)</span>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-white rounded-lg border border-slate-200 px-4 py-2 shadow-sm">
            <BadgePill
              icon={<Bot className="w-3 h-3" />}
              label="AI Highlight"
              className="bg-violet-100 text-violet-700"
            />
            <BadgePill
              icon={<ShieldCheck className="w-3 h-3" />}
              label="Vertrauen kritisch"
              className="bg-amber-100 text-amber-700"
            />
          </div>
        </motion.div>

        {/* ── JOURNEY MAP ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden"
        >
          {/* Scrollable Area */}
          <div className="flex">
            {/* ── Sticky Row Labels ── */}
            <div
              className="shrink-0 border-r border-slate-200 bg-slate-50/80 z-10"
              style={{ width: LABEL_WIDTH }}
            >
              {/* Phase header row */}
              <div className="h-[120px] flex items-end px-4 pb-3 border-b border-slate-100">
                <span className="text-[11px] text-slate-400">Phase →</span>
              </div>
              {/* Emotion curve row */}
              <div className="h-[100px] flex items-center px-4 border-b border-slate-100">
                <RowLabel
                  icon={<Heart className="w-3.5 h-3.5" />}
                  label="Emotionale Kurve"
                  color="text-indigo-500"
                />
              </div>
              {/* Actions */}
              <div className="px-4 py-3 border-b border-slate-100 flex items-center min-h-[130px]">
                <RowLabel
                  icon={<MousePointerClick className="w-3.5 h-3.5" />}
                  label="User Actions"
                />
              </div>
              {/* Goals */}
              <div className="px-4 py-3 border-b border-slate-100 flex items-center min-h-[130px]">
                <RowLabel
                  icon={<Crosshair className="w-3.5 h-3.5" />}
                  label="User Goals"
                />
              </div>
              {/* Thoughts */}
              <div className="px-4 py-3 border-b border-slate-100 flex items-center min-h-[130px]">
                <RowLabel
                  icon={<MessageCircleQuestion className="w-3.5 h-3.5" />}
                  label="Thoughts"
                />
              </div>
              {/* Pain Points */}
              <div className="px-4 py-3 border-b border-slate-100 flex items-center min-h-[130px]">
                <RowLabel
                  icon={<AlertTriangle className="w-3.5 h-3.5" />}
                  label="Pain Points"
                  color="text-red-400"
                />
              </div>
              {/* Opportunities */}
              <div className="px-4 py-3 flex items-center min-h-[130px]">
                <RowLabel
                  icon={<Lightbulb className="w-3.5 h-3.5" />}
                  label="Opportunities"
                  color="text-emerald-500"
                />
              </div>
            </div>

            {/* ── Scrollable Phase Columns ── */}
            <div
              ref={scrollRef}
              onScroll={handleScroll}
              className="flex-1 overflow-x-auto overflow-y-hidden"
              style={{ scrollbarWidth: "thin" }}
            >
              <div className="flex" style={{ minWidth: phases.length * PHASE_WIDTH }}>
                {phases.map((phase, idx) => (
                  <div
                    key={phase.id}
                    className={`shrink-0 ${idx < phases.length - 1 ? "border-r border-slate-100" : ""}`}
                    style={{ width: PHASE_WIDTH }}
                  >
                    {/* ── Phase Header ── */}
                    <div className="h-[120px] p-3 border-b border-slate-100">
                      <div className="flex items-start gap-2.5 mb-2">
                        <div
                          className={`w-9 h-9 rounded-xl ${phase.color} flex items-center justify-center text-white shadow-sm shrink-0`}
                        >
                          {phase.icon}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <span className="text-[10px] text-slate-400">
                              Phase {phase.number}
                            </span>
                            {idx < phases.length - 1 && (
                              <ArrowRight className="w-2.5 h-2.5 text-slate-300" />
                            )}
                          </div>
                          <h4 className={`${phase.colorText} text-sm leading-snug`}>
                            {phase.title}
                          </h4>
                          <p className="text-[11px] text-slate-400 leading-snug">
                            {phase.subtitle}
                          </p>
                        </div>
                      </div>
                      {/* Tags */}
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {phase.isAiHighlight && (
                          <BadgePill
                            icon={<Bot className="w-2.5 h-2.5" />}
                            label="AI"
                            className="bg-violet-100 text-violet-600"
                          />
                        )}
                        {phase.isTrustCritical && (
                          <BadgePill
                            icon={<ShieldCheck className="w-2.5 h-2.5" />}
                            label="Trust"
                            className="bg-amber-100 text-amber-600"
                          />
                        )}
                      </div>
                    </div>

                    {/* ── Emotion Row ── */}
                    {idx === 0 ? (
                      <div className="h-[100px] border-b border-slate-100 relative overflow-visible z-20">
                        <div className="absolute top-0 left-0" style={{ width: phases.length * PHASE_WIDTH }}>
                          <EmotionCurve
                            scores={phases.map((p) => p.emotionScore)}
                            phaseWidth={PHASE_WIDTH}
                          />
                        </div>
                        {/* Emotion labels */}
                        <div className="absolute bottom-1 left-0 flex" style={{ width: phases.length * PHASE_WIDTH }}>
                          {phases.map((p) => (
                            <div
                              key={p.id}
                              className="flex items-center justify-center"
                              style={{ width: PHASE_WIDTH }}
                            >
                              <span className="text-[10px] text-slate-400 bg-white/80 px-1.5 py-0.5 rounded">
                                {p.emotionLabel}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div
                        className="h-[100px] border-b border-slate-100"
                        aria-hidden="true"
                      />
                    )}

                    {/* ── Actions ── */}
                    <div className="p-3 border-b border-slate-100 min-h-[130px]">
                      <CardList items={phase.actions} />
                    </div>

                    {/* ── Goals ── */}
                    <div className="p-3 border-b border-slate-100 min-h-[130px]">
                      <CardList items={phase.goals} />
                    </div>

                    {/* ── Thoughts ── */}
                    <div className="p-3 border-b border-slate-100 min-h-[130px]">
                      <div className="space-y-1.5">
                        {phase.thoughts.map((t, i) => (
                          <div
                            key={i}
                            className="bg-indigo-50/60 border border-indigo-100 rounded-lg px-3 py-2"
                          >
                            <p className="text-xs text-indigo-700 italic leading-relaxed">
                              {t}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* ── Pain Points ── */}
                    <div className="p-3 border-b border-slate-100 min-h-[130px]">
                      <CardList items={phase.painPoints} variant="pain" />
                    </div>

                    {/* ── Opportunities ── */}
                    <div className="p-3 min-h-[130px]">
                      <CardList items={phase.opportunities} variant="opportunity" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── BOTTOM SECTION: Insights & Summary ── */}
        <div className="mt-6 grid grid-cols-12 gap-5">
          {/* Key Stats */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="col-span-3 space-y-3"
          >
            {[
              { label: "Phasen", value: "8", color: "from-indigo-500 to-indigo-600", sub: "End-to-End Journey" },
              { label: "Pain Points", value: "24", color: "from-red-400 to-red-500", sub: "Identifizierte Schmerzpunkte" },
              { label: "Opportunities", value: "24", color: "from-emerald-500 to-emerald-600", sub: "Verbesserungspotenziale" },
              { label: "AI Highlights", value: "4", color: "from-violet-500 to-violet-600", sub: "Phasen mit KI-Mehrwert" },
            ].map((stat) => (
              <div
                key={stat.label}
                className={`bg-gradient-to-r ${stat.color} rounded-xl p-4 text-white shadow-md`}
              >
                <div className="flex items-baseline justify-between">
                  <span className="text-2xl">{stat.value}</span>
                  <span className="text-white/70 text-xs">{stat.label}</span>
                </div>
                <p className="text-white/60 text-[11px] mt-1">{stat.sub}</p>
              </div>
            ))}
          </motion.div>

          {/* Key Insights */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="col-span-5 bg-white rounded-xl border border-slate-200 shadow-sm p-5"
          >
            <h3 className="text-slate-900 mb-4 flex items-center gap-2">
              <Brain className="w-4 h-4 text-indigo-600" />
              Key Insights
            </h3>
            <div className="space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <ThumbsUp className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-xs text-emerald-700">Stärken der Journey</span>
                </div>
                <ul className="space-y-1.5">
                  {[
                    "KI-gestützte Story-Generierung schafft den größten emotionalen Hochpunkt",
                    "Der End-to-End-Workflow von Upload bis Team-Übergabe ist durchgängig",
                    "Jira-Abgleich als optionaler Schritt reduziert Komplexität für neue Nutzer",
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <div className="w-1 h-1 rounded-full bg-emerald-400 mt-2 shrink-0" />
                      <span className="text-xs text-slate-600 leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="border-t border-slate-100 pt-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                  <span className="text-xs text-amber-700">Kritische Momente</span>
                </div>
                <ul className="space-y-1.5">
                  {[
                    "Phase 1 (Vorbereitung) hat den niedrigsten Emotionswert – hier verlieren wir Nutzer",
                    "Vertrauen ist in 3 von 8 Phasen entscheidend – besonders beim Upload und Jira-Abgleich",
                    "Die Dokumentenprüfung (Phase 3) ist ein Wendepunkt: Hier entsteht oder zerbricht Vertrauen in die KI",
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <div className="w-1 h-1 rounded-full bg-amber-400 mt-2 shrink-0" />
                      <span className="text-xs text-slate-600 leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>

          {/* AI & Trust Map */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="col-span-4 space-y-3"
          >
            {/* AI Contribution */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
              <h3 className="text-slate-900 mb-3 flex items-center gap-2">
                <Zap className="w-4 h-4 text-violet-600" />
                KI-Mehrwert entlang der Journey
              </h3>
              <div className="space-y-2.5">
                {phases
                  .filter((p) => p.isAiHighlight)
                  .map((p) => (
                    <div
                      key={p.id}
                      className="flex items-start gap-2.5 bg-violet-50/60 rounded-lg p-2.5 border border-violet-100"
                    >
                      <div
                        className={`w-7 h-7 rounded-lg ${p.color} flex items-center justify-center text-white shrink-0`}
                      >
                        {p.icon}
                      </div>
                      <div className="min-w-0">
                        <span className="text-xs text-violet-700">
                          Phase {p.number}: {p.title}
                        </span>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {p.id === "review"
                            ? "KI analysiert Dokumentstruktur und ordnet Abschnitte automatisch zu"
                            : p.id === "generate"
                              ? "Automatische Erstellung qualitativ hochwertiger User Stories"
                              : p.id === "select"
                                ? "KI-gestützte Qualitätsbewertung und Verbesserungsvorschläge"
                                : "Intelligente Duplikaterkennung und Merge-Vorschläge"}
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Trust Points */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
              <h3 className="text-slate-900 mb-3 flex items-center gap-2">
                <Shield className="w-4 h-4 text-amber-600" />
                Vertrauens-kritische Phasen
              </h3>
              <div className="space-y-2.5">
                {phases
                  .filter((p) => p.isTrustCritical)
                  .map((p) => (
                    <div
                      key={p.id}
                      className="flex items-start gap-2.5 bg-amber-50/60 rounded-lg p-2.5 border border-amber-100"
                    >
                      <div
                        className={`w-7 h-7 rounded-lg ${p.color} flex items-center justify-center text-white shrink-0`}
                      >
                        {p.icon}
                      </div>
                      <div className="min-w-0">
                        <span className="text-xs text-amber-700">
                          Phase {p.number}: {p.title}
                        </span>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {p.id === "upload"
                            ? "Nutzer muss darauf vertrauen, dass Daten sicher verarbeitet werden"
                            : p.id === "review"
                              ? "Transparenz der KI-Analyse ist entscheidend für Akzeptanz"
                              : "Read-Only-Garantie für Jira-Daten schafft Sicherheit"}
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* ── RECOMMENDATIONS ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-5 bg-gradient-to-r from-indigo-600 to-violet-600 rounded-xl p-6 shadow-lg shadow-indigo-200/40"
        >
          <h3 className="text-white mb-4 flex items-center gap-2">
            <FileText className="w-4 h-4 text-white/80" />
            Top-3 Empfehlungen aus der Journey-Analyse
          </h3>
          <div className="grid grid-cols-3 gap-4">
            {[
              {
                title: "Onboarding-Assistent für Phase 1",
                desc: "Die Vorbereitung ist der emotionale Tiefpunkt. Ein geführter Import-Wizard mit Checkliste kann Unsicherheit reduzieren und die Drop-off-Rate senken.",
                tag: "Quick Win",
                tagColor: "bg-emerald-400/20 text-emerald-100",
              },
              {
                title: "Explainability in Phase 3 & 4",
                desc: "Vertrauen in die KI entsteht durch Transparenz. Inline-Annotationen und Qualitätsscores machen die Dokumentenprüfung und Story-Generierung nachvollziehbar.",
                tag: "High Impact",
                tagColor: "bg-amber-400/20 text-amber-100",
              },
              {
                title: "Team-Kollaboration in Phase 8",
                desc: "Die Übergabe an die Entwicklung ist der finale Moment of Truth. Ein Kommentar- und Feedback-System direkt in ReqWise verhindert Kontextverlust.",
                tag: "Strategisch",
                tagColor: "bg-blue-400/20 text-blue-100",
              },
            ].map((rec, i) => (
              <div
                key={i}
                className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-white text-sm">{rec.title}</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] ${rec.tagColor}`}
                  >
                    {rec.tag}
                  </span>
                </div>
                <p className="text-white/70 text-xs leading-relaxed">{rec.desc}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}