import { useState } from "react";
import {
  Plus,
  Search,
  Upload,
  BookOpen,
  Shield,
  Scale,
  MessageSquare,
  Layers,
  ChevronRight,
  Edit3,
  Trash2,
  Copy,
  MoreHorizontal,
  CheckCircle2,
  Info,
  X,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Switch } from "../components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "../components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../components/ui/tooltip";

interface Rule {
  id: string;
  name: string;
  description: string;
  category: string;
  severity: "critical" | "major" | "minor";
  active: boolean;
  source: "custom" | "iso" | "spice" | "internal";
  examples?: string;
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

export function RuleManagement() {
  const [rules, setRules] = useState<Rule[]>(initialRules);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showNewRuleDialog, setShowNewRuleDialog] = useState(false);
  const [newRule, setNewRule] = useState({
    name: "",
    description: "",
    category: "Sprachliche Standards",
    severity: "major" as "critical" | "major" | "minor",
  });

  const toggleRule = (id: string) => {
    setRules((prev) =>
      prev.map((r) => (r.id === id ? { ...r, active: !r.active } : r))
    );
  };

  const filteredRules = rules.filter((rule) => {
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
      <div className="p-8 max-w-[1200px] mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-[#1e1e2e]">Regel-Management</h1>
            <p className="text-[14px] text-muted-foreground mt-1">
              Verwalten Sie Compliance-Regeln für Ihre Requirements.{" "}
              <span style={{ fontWeight: 500 }}>{activeCount} von {totalCount}</span> Regeln aktiv.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="text-[13px] gap-2">
              <Upload className="w-4 h-4" />
              Regeln importieren
            </Button>
            <Button
              className="bg-[#4f46e5] hover:bg-[#4338ca] text-white gap-2 text-[13px]"
              onClick={() => setShowNewRuleDialog(true)}
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
                    return (
                      <Card
                        key={rule.id}
                        className={`border transition-all duration-200 ${
                          rule.active ? "border-border bg-white" : "border-border bg-[#fafbfc] opacity-70"
                        } hover:shadow-sm`}
                      >
                        <CardContent className="p-4">
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
                              <div className="flex items-center gap-2 mb-1">
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
                                <DropdownMenuItem className="gap-2 text-[13px] text-[#ef4444]">
                                  <Trash2 className="w-3.5 h-3.5" /> Löschen
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            ))}
        </div>

        {/* New Rule Dialog */}
        <Dialog open={showNewRuleDialog} onOpenChange={setShowNewRuleDialog}>
          <DialogContent className="sm:max-w-[520px]">
            <DialogHeader>
              <DialogTitle>Neue Regel erstellen</DialogTitle>
              <DialogDescription>
                Erstellen Sie eine benutzerdefinierte Compliance-Regel für Ihre Requirements.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 my-4">
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
                  if (newRule.name && newRule.description) {
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
                      },
                    ]);
                    setNewRule({ name: "", description: "", category: "Sprachliche Standards", severity: "major" });
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
