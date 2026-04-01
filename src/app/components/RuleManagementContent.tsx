import { useMemo, useState } from "react";
import {
  Plus,
  Search,
  Upload,
  Shield,
  Scale,
  MessageSquare,
  Layers,
  Edit3,
  Trash2,
  Copy,
  MoreHorizontal,
  X,
  Globe,
  FolderOpen,
} from "lucide-react";
import { Card, CardContent } from "./ui/card";
import { cn } from "./ui/utils";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Switch } from "./ui/switch";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "./ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "./ui/dropdown-menu";
import { TooltipProvider } from "./ui/tooltip";
import { useAppContext } from "../context/AppContext";
import { getProjectIdsForWorkspace, PROJECT_SEARCH_META } from "../data/workspaces";

interface Rule {
  id: string;
  name: string;
  description: string;
  category: string;
  severity: "critical" | "major" | "minor";
  active: boolean;
  source: "custom" | "iso" | "spice" | "internal";
  examples?: string;
  /** workspace-weit vs. nur für ein bestimmtes Projekt */
  scope?: "workspace" | "project";
  projectId?: string;
  projectName?: string;
}

const initialRules: Rule[] = [
  {
    id: "R-001",
    name: "Messbare Anforderungen",
    description: "Anforderungen müssen quantifizierbare Metriken enthalten (z.B. Zeitangaben, Mengen, Prozentsätze).",
    category: "Sprachliche Standards",
    severity: "critical",
    active: true,
    source: "iso",
    examples: "Statt 'schnell' -> 'innerhalb von 200ms'",
  },
  {
    id: "R-002",
    name: "Eindeutige Modalverben",
    description: "Verwenden Sie 'muss' für verbindliche und 'sollte' für optionale Anforderungen. Vermeiden Sie 'kann', 'darf', 'könnte'.",
    category: "Sprachliche Standards",
    severity: "major",
    active: true,
    source: "internal",
    examples: "'Das System muss...' (verbindlich), 'Das System sollte...' (optional)",
  },
  {
    id: "R-003",
    name: "Aktive Formulierungen",
    description: "Anforderungen sollen in aktiver Form formuliert werden. Passive Konstruktionen sind zu vermeiden.",
    category: "Sprachliche Standards",
    severity: "minor",
    active: true,
    source: "internal",
  },
  {
    id: "R-004",
    name: "User Story Format",
    description: "Jede User Story muss dem Format 'Als [Rolle] möchte ich [Ziel], damit [Nutzen]' folgen.",
    category: "Strukturvorgaben",
    severity: "critical",
    active: true,
    source: "internal",
  },
  {
    id: "R-005",
    name: "Akzeptanzkriterien erforderlich",
    description: "Jede User Story muss mindestens 2 Akzeptanzkriterien enthalten.",
    category: "Strukturvorgaben",
    severity: "critical",
    active: true,
    source: "spice",
  },
  {
    id: "R-006",
    name: "Eindeutige Identifikation",
    description: "Jede Anforderung muss eine eindeutige ID im Format [PREFIX]-[NNN] haben.",
    category: "Strukturvorgaben",
    severity: "major",
    active: true,
    source: "iso",
  },
  {
    id: "R-007",
    name: "DSGVO-Konformität",
    description: "Anforderungen, die personenbezogene Daten betreffen, müssen DSGVO-konforme Verarbeitungshinweise enthalten.",
    category: "Rechtliche Anforderungen",
    severity: "critical",
    active: true,
    source: "custom",
  },
  {
    id: "R-008",
    name: "Datenschutz-Folgenabschätzung",
    description: "Bei Verarbeitung sensibler Daten muss eine Datenschutz-Folgenabschätzung referenziert werden.",
    category: "Rechtliche Anforderungen",
    severity: "major",
    active: true,
    source: "custom",
  },
  {
    id: "R-009",
    name: "ISO 29148 Konformität",
    description: "Requirements müssen den Qualitätskriterien nach ISO/IEC/IEEE 29148:2018 entsprechen.",
    category: "ISO / Automotive SPICE",
    severity: "critical",
    active: true,
    source: "iso",
  },
  {
    id: "R-010",
    name: "Automotive SPICE Level 3",
    description: "Requirements Engineering Prozess muss Automotive SPICE ENG.1 Level 3 Anforderungen erfüllen.",
    category: "ISO / Automotive SPICE",
    severity: "major",
    active: false,
    source: "spice",
  },
  {
    id: "R-011",
    name: "Traceability-Anforderung",
    description: "Jede Anforderung muss bidirektionale Traceability zu Quell- und Zielartefakten aufweisen.",
    category: "ISO / Automotive SPICE",
    severity: "major",
    active: true,
    source: "spice",
  },
  {
    id: "R-012",
    name: "Keine Implementierungsdetails",
    description: "Anforderungen dürfen keine Implementierungsdetails oder technische Lösungswege vorschreiben.",
    category: "Strukturvorgaben",
    severity: "minor",
    active: false,
    source: "internal",
  },
  {
    id: "R-013",
    name: "BMW Versuchsteile — Engineering-Daten & VVT",
    description:
      "Anforderungen zu Versuchsteilen müssen VVT-/Teilestatus und Freigabenachweise referenzieren (keine produktiven Serienkennzeichen in Demo-Daten).",
    category: "Rechtliche Anforderungen",
    severity: "major",
    active: true,
    source: "custom",
    scope: "project",
    projectId: "P-101",
    projectName: "BMW Group — Versuchsteile & Entwicklungs-Analytics",
  },
  {
    id: "R-014",
    name: "VW Datenraum — Einwilligung & Zweckbindung",
    description:
      "Use Cases im Datenraum Mobilität müssen Zweckbindung, Consent-Nachweis und Datenkategorien je Datenquelle benennen.",
    category: "Strukturvorgaben",
    severity: "critical",
    active: true,
    source: "custom",
    scope: "project",
    projectId: "P-201",
    projectName: "Volkswagen Group — Datenraum Mobilität",
  },
];

const categories = [
  { name: "Sprachliche Standards", icon: MessageSquare, color: "#4f46e5" },
  { name: "Strukturvorgaben", icon: Layers, color: "#8b5cf6" },
  { name: "Rechtliche Anforderungen", icon: Scale, color: "#ef4444" },
  { name: "ISO / Automotive SPICE", icon: Shield, color: "#10b981" },
];

const sourceLabels: Record<string, { label: string; color: string }> = {
  custom: { label: "Benutzerdefiniert", color: "#8b5cf6" },
  iso: { label: "ISO Standard", color: "#4f46e5" },
  spice: { label: "Automotive SPICE", color: "#10b981" },
  internal: { label: "Intern", color: "#64748b" },
};

const severityLabels: Record<string, { label: string; color: string; bg: string }> = {
  critical: { label: "Kritisch", color: "#ef4444", bg: "#fef2f2" },
  major: { label: "Wichtig", color: "#f59e0b", bg: "#fef3c7" },
  minor: { label: "Gering", color: "#64748b", bg: "#f1f5f9" },
};

function ruleScope(rule: Rule): "workspace" | "project" {
  return rule.scope ?? "workspace";
}

/** Nur gesetzt, wenn im Compliance Check ein einzelnes Projekt gewählt ist — dann werden fremde Projektregeln ausgeblendet. */
export type GuidelinesRulesEvalScope = { kind: "project"; projectId: string };

export function RuleManagementContent({
  embedded = false,
  hideGeltungsbereich = false,
  guidelinesEvalScope,
}: {
  embedded?: boolean;
  /** Im Compliance Check eingebettet: Filter „Geltungsbereich“ ausblenden (entspricht globalem Bereich oben). */
  hideGeltungsbereich?: boolean;
  /** Einzelprojekt gewählt → nur Workspace-Regeln plus Regeln dieses Projekts (Gesamter Workspace: alle Regeln). */
  guidelinesEvalScope?: GuidelinesRulesEvalScope;
}) {
  const { selectedWorkspaceId, selectedWorkspace } = useAppContext();
  const ruleScopeRadioName = embedded ? "rule-scope-guidelines" : "rule-scope-rules-page";
  const [rules, setRules] = useState<Rule[]>(initialRules);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [scopeFilter, setScopeFilter] = useState<"all" | "workspace" | "project">("all");
  const [projectScopeId, setProjectScopeId] = useState<string>("all");
  const [showNewRuleDialog, setShowNewRuleDialog] = useState(false);
  const [rulePendingDelete, setRulePendingDelete] = useState<Rule | null>(null);
  const [newRule, setNewRule] = useState({
    name: "",
    description: "",
    category: "Sprachliche Standards",
    severity: "major" as "critical" | "major" | "minor",
    scope: "workspace" as "workspace" | "project",
    projectId: "",
  });

  const workspaceProjectOptions = useMemo(() => {
    return getProjectIdsForWorkspace(selectedWorkspaceId)
      .map((id) => ({
        id,
        name: PROJECT_SEARCH_META[id]?.name ?? id,
      }))
      .filter((p) => p.name);
  }, [selectedWorkspaceId]);

  const workspaceProjectIdSet = useMemo(
    () => new Set(workspaceProjectOptions.map((p) => p.id)),
    [workspaceProjectOptions],
  );

  const toggleRule = (id: string) => {
    setRules((prev) =>
      prev.map((r) => (r.id === id ? { ...r, active: !r.active } : r))
    );
  };

  const removeRule = (id: string) => {
    setRules((prev) => prev.filter((r) => r.id !== id));
    setRulePendingDelete(null);
  };

  const filteredRules = rules.filter((rule) => {
    const sc = ruleScope(rule);
    if (
      guidelinesEvalScope &&
      sc === "project" &&
      rule.projectId !== guidelinesEvalScope.projectId
    ) {
      return false;
    }
    if (sc === "project" && rule.projectId && !workspaceProjectIdSet.has(rule.projectId)) {
      return false;
    }
    if (scopeFilter === "workspace" && sc !== "workspace") return false;
    if (scopeFilter === "project") {
      if (sc !== "project") return false;
      if (projectScopeId !== "all" && rule.projectId !== projectScopeId) return false;
    }
    const matchesCategory = !selectedCategory || rule.category === selectedCategory;
    const matchesSearch =
      !searchQuery ||
      rule.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rule.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const groupedRules = categories.map((cat) => ({
    ...cat,
    rules: filteredRules.filter((r) => r.category === cat.name),
  }));

  const activeCount = rules.filter((r) => r.active).length;
  const totalCount = rules.length;

  return (
    <TooltipProvider>
      <div
        className={
          embedded ? "max-w-[1200px] mx-auto" : "p-8 max-w-[1200px] mx-auto"
        }
      >
        {/* Header */}
        <div
          className={`flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between ${
            embedded ? "mb-6" : "mb-8"
          }`}
        >
          <div className="min-w-0">
            {embedded ? (
              <h2 className="text-[#1e1e2e] text-lg" style={{ fontWeight: 600 }}>
                Regelwerk
              </h2>
            ) : (
              <h1 className="text-[#1e1e2e]">Regel-Management</h1>
            )}
            <p className="text-[14px] text-muted-foreground mt-1">
              Verwalten Sie Regeln und Vorgaben für{" "}
              <span style={{ fontWeight: 500 }}>{selectedWorkspace.name}</span>
              {" — "}
              workspace-weit oder projektspezifisch.{" "}
              <span style={{ fontWeight: 500 }}>{activeCount} von {totalCount}</span> Regeln aktiv.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <Button variant="outline" className="text-[13px] gap-2">
              <Upload className="w-4 h-4" />
              Regeln importieren
            </Button>
            <Button
              className="bg-[#4f46e5] hover:bg-[#4338ca] text-white gap-2 text-[13px]"
              onClick={() => {
                setNewRule({
                  name: "",
                  description: "",
                  category: "Sprachliche Standards",
                  severity: "major",
                  scope: "workspace",
                  projectId: workspaceProjectOptions[0]?.id ?? "",
                });
                setShowNewRuleDialog(true);
              }}
            >
              <Plus className="w-4 h-4" />
              Neue Regel
            </Button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {categories.map((cat) => {
            const catRules = rules.filter((r) => r.category === cat.name);
            const activeInCat = catRules.filter((r) => r.active).length;
            const isSelected = selectedCategory === cat.name;
            return (
              <Card
                key={cat.name}
                className={`border cursor-pointer transition-all duration-200 ${
                  isSelected
                    ? "ring-2 ring-[#4f46e5]/30 border-[#4f46e5] shadow-sm"
                    : "border-border bg-white hover:shadow-sm"
                }`}
                onClick={() => setSelectedCategory(isSelected ? null : cat.name)}
              >
                <CardContent className="p-4 flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${cat.color}15` }}
                  >
                    <cat.icon className="w-5 h-5" style={{ color: cat.color }} />
                  </div>
                  <div>
                    <p className="text-[13px] text-[#1e1e2e]" style={{ fontWeight: 500 }}>{cat.name}</p>
                    <p className="text-[12px] text-muted-foreground">
                      {activeInCat}/{catRules.length} aktiv
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {!hideGeltungsbereich ? (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:flex-wrap mb-4">
            <span className="text-[12px] text-muted-foreground shrink-0" style={{ fontWeight: 500 }}>
              Geltungsbereich
            </span>
            <div className="flex flex-wrap items-center gap-2">
              {(
                [
                  { key: "all" as const, label: "Alle Regeln" },
                  { key: "workspace" as const, label: "Workspace-weit" },
                  { key: "project" as const, label: "Projektspezifisch" },
                ] as const
              ).map(({ key, label }) => (
                <Button
                  key={key}
                  type="button"
                  variant={scopeFilter === key ? "default" : "outline"}
                  size="sm"
                  className={`text-[12px] h-8 ${scopeFilter === key ? "bg-[#4f46e5] hover:bg-[#4338ca] text-white" : ""}`}
                  onClick={() => {
                    setScopeFilter(key);
                    if (key !== "project") setProjectScopeId("all");
                  }}
                >
                  {label}
                </Button>
              ))}
              {scopeFilter === "project" && (
                <select
                  value={projectScopeId}
                  onChange={(e) => setProjectScopeId(e.target.value)}
                  className="text-[12px] px-3 py-1.5 rounded-lg border border-border bg-white outline-none focus:border-[#4f46e5] min-w-[200px]"
                >
                  <option value="all">Alle Projekte (im Workspace)</option>
                  {workspaceProjectOptions.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>
        ) : null}

        {/* Search */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-white flex-1 max-w-md">
            <Search className="w-4 h-4 text-muted-foreground" />
            <input
              placeholder="Regeln durchsuchen..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent outline-none w-full text-[13px] placeholder:text-muted-foreground"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")}>
                <X className="w-4 h-4 text-muted-foreground hover:text-[#1e1e2e]" />
              </button>
            )}
          </div>
          {selectedCategory && (
            <Badge
              variant="secondary"
              className="text-[12px] gap-1 cursor-pointer hover:bg-[#e2e8f0]"
              onClick={() => setSelectedCategory(null)}
            >
              {selectedCategory}
              <X className="w-3 h-3" />
            </Badge>
          )}
        </div>

        {/* Rules List */}
        <div className="space-y-6">
          {groupedRules
            .filter((g) => g.rules.length > 0)
            .map((group) => (
              <div key={group.name}>
                <div className="flex items-center gap-2 mb-3">
                  <group.icon className="w-4 h-4" style={{ color: group.color }} />
                  <h3 className="text-[14px] text-[#1e1e2e]" style={{ fontWeight: 600 }}>
                    {group.name}
                  </h3>
                  <Badge variant="secondary" className="text-[11px] ml-1">
                    {group.rules.length}
                  </Badge>
                </div>
                <div className="space-y-2">
                  {group.rules.map((rule) => {
                    const sev = severityLabels[rule.severity];
                    const src = sourceLabels[rule.source];
                    const isProjectRule = ruleScope(rule) === "project";
                    return (
                      <Card
                        key={rule.id}
                        className={cn(
                          "border transition-all duration-200 hover:shadow-sm overflow-hidden",
                          isProjectRule
                            ? cn(
                                "border-[#5eead4]/90 ring-1 ring-[#5eead4]/35 shadow-sm",
                                rule.active
                                  ? "bg-[#f0fdfa]"
                                  : "bg-[#ecfdf5]/80 opacity-[0.92]",
                                "shadow-[inset_5px_0_0_0_#0d9488]",
                              )
                            : rule.active
                              ? "border-border bg-white"
                              : "border-border bg-[#fafbfc] opacity-70",
                        )}
                      >
                        <CardContent className="p-0">
                          {isProjectRule ? (
                            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 border-b border-[#0d9488]/25 bg-gradient-to-r from-[#0d9488]/18 via-[#14b8a6]/12 to-transparent px-4 py-2.5">
                              <span className="inline-flex items-center gap-1.5 rounded-md bg-[#0d9488] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm">
                                <FolderOpen className="h-3 w-3" aria-hidden />
                                Projektspezifisch
                              </span>
                              <span
                                className="min-w-0 flex-1 text-[12px] font-semibold text-[#134e4a] sm:flex-none sm:max-w-[min(100%,420px)] truncate"
                                title={rule.projectName ?? rule.projectId}
                              >
                                {rule.projectName ?? rule.projectId}
                              </span>
                              <span className="w-full text-[10px] text-[#115e59]/85 sm:w-auto sm:pl-1">
                                Gilt nur für dieses Vorhaben, zusätzlich zu den Workspace-Regeln.
                              </span>
                            </div>
                          ) : null}
                          <div className="p-4">
                          <div className="flex items-start gap-4">
                            {/* Toggle */}
                            <div className="pt-0.5">
                              <Switch
                                checked={rule.active}
                                onCheckedChange={() => toggleRule(rule.id)}
                              />
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1 flex-wrap">
                                <span className="text-[11px] text-muted-foreground" style={{ fontWeight: 500 }}>
                                  {rule.id}
                                </span>
                                <Badge
                                  variant="secondary"
                                  className="text-[10px] px-1.5"
                                  style={{ backgroundColor: sev.bg, color: sev.color, fontWeight: 600 }}
                                >
                                  {sev.label}
                                </Badge>
                                <Badge
                                  variant="outline"
                                  className="text-[10px] px-1.5"
                                  style={{ borderColor: `${src.color}40`, color: src.color }}
                                >
                                  {src.label}
                                </Badge>
                                {!isProjectRule ? (
                                  <Badge
                                    variant="outline"
                                    className="text-[10px] px-1.5 gap-0.5"
                                    style={{ borderColor: "#4f46e540", color: "#4f46e5" }}
                                  >
                                    <Globe className="w-2.5 h-2.5" />
                                    Workspace
                                  </Badge>
                                ) : null}
                              </div>
                              <p
                                className={`text-[14px] mb-1 ${rule.active ? "text-[#1e1e2e]" : "text-muted-foreground"}`}
                                style={{ fontWeight: 500 }}
                              >
                                {rule.name}
                              </p>
                              <p className="text-[12px] text-muted-foreground">{rule.description}</p>
                              {rule.examples && (
                                <div className="mt-2 px-2.5 py-1.5 rounded bg-[#f8fafc] border border-[#e2e8f0] inline-block">
                                  <p className="text-[11px] text-muted-foreground">
                                    <span style={{ fontWeight: 500 }}>Beispiel:</span> {rule.examples}
                                  </p>
                                </div>
                              )}
                            </div>

                            {/* Actions */}
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <button className="p-1.5 rounded hover:bg-[#f1f5f9] transition-colors">
                                  <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                                </button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem className="gap-2 text-[13px]">
                                  <Edit3 className="w-3.5 h-3.5" /> Bearbeiten
                                </DropdownMenuItem>
                                <DropdownMenuItem className="gap-2 text-[13px]">
                                  <Copy className="w-3.5 h-3.5" /> Duplizieren
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="gap-2 text-[13px] text-[#ef4444] focus:text-[#ef4444]"
                                  onSelect={() => setRulePendingDelete(rule)}
                                >
                                  <Trash2 className="w-3.5 h-3.5" /> Löschen
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            ))}
          {rules.length === 0 && (
            <Card className="border border-dashed border-border bg-muted/20">
              <CardContent className="p-10 text-center space-y-3">
                <p className="text-[14px] text-[#1e1e2e]" style={{ fontWeight: 500 }}>
                  Noch keine Regeln im Katalog
                </p>
                <p className="text-[13px] text-muted-foreground max-w-md mx-auto">
                  Legen Sie eine neue Regel an oder importieren Sie ein Regelset für die
                  Compliance-Prüfung an.
                </p>
                <Button
                  className="bg-[#4f46e5] hover:bg-[#4338ca] text-white gap-2 text-[13px] mt-2"
                  onClick={() => {
                    setNewRule({
                      name: "",
                      description: "",
                      category: "Sprachliche Standards",
                      severity: "major",
                      scope: "workspace",
                      projectId: workspaceProjectOptions[0]?.id ?? "",
                    });
                    setShowNewRuleDialog(true);
                  }}
                >
                  <Plus className="w-4 h-4" />
                  Neue Regel
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        <AlertDialog
          open={rulePendingDelete !== null}
          onOpenChange={(open) => {
            if (!open) setRulePendingDelete(null);
          }}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Regel löschen?</AlertDialogTitle>
              <AlertDialogDescription>
                {rulePendingDelete ? (
                  <>
                    Die Regel{" "}
                    <span className="font-medium text-foreground">
                      „{rulePendingDelete.name}“
                    </span>{" "}
                    ({rulePendingDelete.id}) wird dauerhaft aus dem Katalog für
                    diesen Workspace entfernt. Der Compliance Check bezieht sie
                    bei künftigen Läufen nicht mehr ein.
                  </>
                ) : null}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Abbrechen</AlertDialogCancel>
              <AlertDialogAction
                className="bg-[#ef4444] text-white hover:bg-[#dc2626] focus-visible:ring-[#ef4444]/40"
                onClick={() => {
                  if (rulePendingDelete) removeRule(rulePendingDelete.id);
                }}
              >
                Löschen
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* New Rule Dialog */}
        <Dialog
          open={showNewRuleDialog}
          onOpenChange={(open) => {
            setShowNewRuleDialog(open);
            if (!open) {
              setNewRule({
                name: "",
                description: "",
                category: "Sprachliche Standards",
                severity: "major",
                scope: "workspace",
                projectId: workspaceProjectOptions[0]?.id ?? "",
              });
            }
          }}
        >
          <DialogContent className="sm:max-w-[520px]">
            <DialogHeader>
              <DialogTitle>Neue Regel erstellen</DialogTitle>
              <DialogDescription>
                Legen Sie die Regel für den gesamten Workspace oder nur für ein Projekt an — projektspezifische Regeln gelten zusätzlich zu den Workspace-Regeln.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 my-4">
              <div>
                <label className="text-[13px] text-[#475569] mb-1.5 block">Gültigkeit</label>
                <div className="flex flex-col gap-2">
                  <label className="flex items-center gap-2 text-[13px] cursor-pointer">
                    <input
                      type="radio"
                      name={ruleScopeRadioName}
                      className="accent-[#4f46e5]"
                      checked={newRule.scope === "workspace"}
                      onChange={() => setNewRule((r) => ({ ...r, scope: "workspace" }))}
                    />
                    <Globe className="w-4 h-4 text-[#4f46e5]" />
                    Workspace-weit ({selectedWorkspace.name})
                  </label>
                  <label className="flex items-center gap-2 text-[13px] cursor-pointer">
                    <input
                      type="radio"
                      name={ruleScopeRadioName}
                      className="accent-[#4f46e5]"
                      checked={newRule.scope === "project"}
                      onChange={() =>
                        setNewRule((r) => ({
                          ...r,
                          scope: "project",
                          projectId: r.projectId || workspaceProjectOptions[0]?.id || "",
                        }))
                      }
                    />
                    <FolderOpen className="w-4 h-4 text-[#0f766e]" />
                    Projektspezifisch
                  </label>
                  {newRule.scope === "project" && (
                    <select
                      value={newRule.projectId}
                      onChange={(e) => setNewRule((r) => ({ ...r, projectId: e.target.value }))}
                      className="w-full mt-1 px-3 py-2 rounded-lg border border-border bg-white text-[13px] outline-none focus:border-[#4f46e5]"
                      disabled={workspaceProjectOptions.length === 0}
                    >
                      {workspaceProjectOptions.length === 0 ? (
                        <option value="">Kein Projekt im Workspace</option>
                      ) : (
                        workspaceProjectOptions.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name}
                          </option>
                        ))
                      )}
                    </select>
                  )}
                </div>
              </div>
              <div>
                <label className="text-[13px] text-[#475569] mb-1.5 block">Name</label>
                <input
                  value={newRule.name}
                  onChange={(e) => setNewRule({ ...newRule, name: e.target.value })}
                  placeholder="z.B. Maximale Satzlänge"
                  className="w-full px-3 py-2 rounded-lg border border-border bg-white text-[13px] outline-none focus:border-[#4f46e5] focus:ring-2 focus:ring-[#4f46e5]/10 transition-all"
                />
              </div>
              <div>
                <label className="text-[13px] text-[#475569] mb-1.5 block">Beschreibung</label>
                <textarea
                  value={newRule.description}
                  onChange={(e) => setNewRule({ ...newRule, description: e.target.value })}
                  placeholder="Beschreiben Sie die Regel detailliert..."
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-white text-[13px] outline-none focus:border-[#4f46e5] focus:ring-2 focus:ring-[#4f46e5]/10 transition-all resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[13px] text-[#475569] mb-1.5 block">Kategorie</label>
                  <select
                    value={newRule.category}
                    onChange={(e) => setNewRule({ ...newRule, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-white text-[13px] outline-none focus:border-[#4f46e5]"
                  >
                    {categories.map((cat) => (
                      <option key={cat.name} value={cat.name}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[13px] text-[#475569] mb-1.5 block">Schweregrad</label>
                  <select
                    value={newRule.severity}
                    onChange={(e) =>
                      setNewRule({ ...newRule, severity: e.target.value as "critical" | "major" | "minor" })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-border bg-white text-[13px] outline-none focus:border-[#4f46e5]"
                  >
                    <option value="critical">Kritisch</option>
                    <option value="major">Wichtig</option>
                    <option value="minor">Gering</option>
                  </select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowNewRuleDialog(false)}>
                Abbrechen
              </Button>
              <Button
                className="bg-[#4f46e5] hover:bg-[#4338ca] text-white gap-2"
                onClick={() => {
                  const projectOk =
                    newRule.scope === "workspace" ||
                    (newRule.projectId && workspaceProjectIdSet.has(newRule.projectId));
                  if (newRule.name && newRule.description && projectOk) {
                    const meta = PROJECT_SEARCH_META[newRule.projectId];
                    setRules((prev) => [
                      ...prev,
                      {
                        id: `R-${String(prev.length + 1).padStart(3, "0")}`,
                        name: newRule.name,
                        description: newRule.description,
                        category: newRule.category,
                        severity: newRule.severity,
                        active: true,
                        source: "custom",
                        ...(newRule.scope === "project"
                          ? {
                              scope: "project" as const,
                              projectId: newRule.projectId,
                              projectName: meta?.name ?? newRule.projectId,
                            }
                          : { scope: "workspace" as const }),
                      },
                    ]);
                    setNewRule({
                      name: "",
                      description: "",
                      category: "Sprachliche Standards",
                      severity: "major",
                      scope: "workspace",
                      projectId: workspaceProjectOptions[0]?.id ?? "",
                    });
                    setShowNewRuleDialog(false);
                  }
                }}
              >
                <Plus className="w-4 h-4" />
                Erstellen
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
}
