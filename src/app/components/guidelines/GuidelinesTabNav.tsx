export type GuidelinesMainTab = "overview" | "rules" | "check";

const TABS: { key: GuidelinesMainTab; label: string }[] = [
  { key: "check", label: "Dokumente prüfen" },
  { key: "overview", label: "Analyse" },
  { key: "rules", label: "Regelwerk" },
];

interface GuidelinesTabNavProps {
  activeTab: GuidelinesMainTab;
  onTabChange: (tab: GuidelinesMainTab) => void;
}

export function GuidelinesTabNav({ activeTab, onTabChange }: GuidelinesTabNavProps) {
  return (
    <div className="flex items-center gap-1 border-b border-border mb-6 overflow-x-auto">
      {TABS.map((tab) => (
        <button
          key={tab.key}
          type="button"
          data-tour={
            tab.key === "check"
              ? "guidelines-nav-check"
              : tab.key === "overview"
                ? "guidelines-nav-overview"
                : "guidelines-nav-rules"
          }
          onClick={() => onTabChange(tab.key)}
          className={`px-4 py-2.5 text-[13px] border-b-2 transition-colors whitespace-nowrap shrink-0 ${
            activeTab === tab.key
              ? "border-[#4f46e5] text-[#4f46e5]"
              : "border-transparent text-muted-foreground hover:text-[#1e1e2e]"
          }`}
          style={{ fontWeight: activeTab === tab.key ? 600 : 400 }}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
