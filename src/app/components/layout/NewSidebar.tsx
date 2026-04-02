import type { LucideIcon } from "lucide-react";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  FolderOpen,
  HelpCircle,
  LayoutDashboard,
  LayoutGrid,
  Plus,
  Scale,
  Settings,
  ShieldCheck,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { ENTERPRISE } from "../../data/enterprise";
import {
  getProjectIdsForWorkspace,
  PROJECT_LOGO_BY_ID,
  PROJECT_SEARCH_META,
} from "../../data/workspaces";
import { hasCustomerJourneyNavCookie } from "../../onboarding/navTourConfig";
import { useOnboardingReset } from "../../onboarding/OnboardingResetContext";
import { useAppContext } from "../../context/AppContext";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import { useIsLgUp } from "../ui/use-mobile";
import { cn } from "../ui/utils";

const workspaceNavItems: Array<{
  icon: LucideIcon;
  label: string;
  path: string;
}> = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/" },
  { icon: Scale, label: "Workspace-Regeln", path: "/rules" },
];

const projectSubNavBase: Array<{
  icon: LucideIcon;
  label: string;
  /** Leer = Projektdetail `/projects/:id` */
  segment: string;
}> = [
  { icon: LayoutGrid, label: "Übersicht", segment: "" },
  { icon: Sparkles, label: "Story-Generator", segment: "story-generator" },
  { icon: ShieldCheck, label: "Compliance Check", segment: "compliance-check" },
  { icon: ClipboardList, label: "Story-Abhängigkeiten", segment: "stories" },
  { icon: Scale, label: "Regeln", segment: "rules" },
];

const customerJourneySubNav = {
  icon: TrendingUp,
  label: "Customer Journey",
  segment: "customer-journey",
};

const bottomItems: Array<{
  icon: LucideIcon;
  label: string;
  path: string;
  resetOnboarding?: boolean;
  stayOnCurrentPage?: boolean;
}> = [
  { icon: Settings, label: "Einstellungen", path: "/settings" },
  {
    icon: HelpCircle,
    label: "Hilfe & Support",
    path: "/help",
    resetOnboarding: true,
    stayOnCurrentPage: true,
  },
];

function projectPath(projectId: string, segment: string) {
  if (!segment) return `/projects/${projectId}`;
  return `/projects/${projectId}/${segment}`;
}

function shortProjectTitle(id: string): string {
  const meta = PROJECT_SEARCH_META[id];
  if (!meta) return id;
  const { name } = meta;
  if (name.length <= 40) return name;
  return `${id} · ${name.slice(0, 32)}…`;
}

type NewSidebarProps = {
  mobileOpen?: boolean;
  onMobileOpenChange?: (open: boolean) => void;
};

export function NewSidebar({
  mobileOpen = false,
  onMobileOpenChange,
}: NewSidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const isLgUp = useIsLgUp();
  const effectiveCollapsed = isLgUp && collapsed;
  const location = useLocation();
  const navigate = useNavigate();
  const { resetTourForCurrentRoute } = useOnboardingReset();
  const { selectedWorkspaceId } = useAppContext();

  const projectSubNav = useMemo(() => {
    if (!hasCustomerJourneyNavCookie()) return projectSubNavBase;
    return [...projectSubNavBase, customerJourneySubNav];
  }, []);

  const projectIds = useMemo(
    () => getProjectIdsForWorkspace(selectedWorkspaceId),
    [selectedWorkspaceId],
  );

  const activeProjectPrefix = useMemo(() => {
    const m = location.pathname.match(/^\/projects\/([^/]+)/);
    return m?.[1] ?? null;
  }, [location.pathname]);

  /** Immer nur ein Projekt aufgeklappt (Accordion). */
  const [expandedProjectId, setExpandedProjectId] = useState<string | null>(null);

  useEffect(() => {
    if (!activeProjectPrefix || !projectIds.includes(activeProjectPrefix)) {
      return;
    }
    setExpandedProjectId(activeProjectPrefix);
  }, [activeProjectPrefix, projectIds]);

  const toggleExpanded = useCallback((id: string) => {
    setExpandedProjectId((prev) => (prev === id ? null : id));
  }, []);

  const isWorkspaceNavActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    if (path === "/rules") return location.pathname === "/rules";
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  const go = (
    path: string,
    options?: { resetOnboarding?: boolean; stayOnCurrentPage?: boolean },
  ) => {
    if (options?.resetOnboarding) {
      resetTourForCurrentRoute();
    }
    if (!options?.stayOnCurrentPage) {
      navigate(path);
    }
    onMobileOpenChange?.(false);
  };

  const renderSubLink = (
    projectId: string,
    item: (typeof projectSubNav)[number],
  ) => {
    const fullPath = projectPath(projectId, item.segment);
    const active = location.pathname === fullPath;
    const btn = (
      <button
        key={`${projectId}-${item.segment}`}
        type="button"
        onClick={() => go(fullPath)}
        className={cn(
          "w-full flex items-center gap-2 pl-9 pr-3 py-2 rounded-lg text-[13px] transition-all duration-150 text-left",
          active
            ? "bg-[#4f46e5]/12 text-[#4f46e5]"
            : "text-[#64748b] hover:bg-[#f1f0ff] hover:text-[#4f46e5]",
        )}
        style={{ fontWeight: active ? 500 : 400 }}
      >
        <item.icon
          className={cn(
            "w-[16px] h-[16px] flex-shrink-0",
            active ? "text-[#4f46e5]" : "text-[#94a3b8]",
          )}
        />
        {!effectiveCollapsed && <span className="truncate">{item.label}</span>}
      </button>
    );
    if (effectiveCollapsed) {
      return (
        <Tooltip key={`${projectId}-${item.segment}`}>
          <TooltipTrigger asChild>{btn}</TooltipTrigger>
          <TooltipContent side="right">
            {item.label} · {projectId}
          </TooltipContent>
        </Tooltip>
      );
    }
    return btn;
  };

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          "h-screen bg-white border-r border-border flex flex-col duration-300 ease-in-out",
          "fixed inset-y-0 left-0 z-40 w-[280px] shadow-xl transition-transform lg:static lg:z-auto lg:shadow-none lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          effectiveCollapsed ? "lg:w-[72px]" : "lg:w-[280px]",
        )}
      >
        <div
          className={cn(
            "h-16 flex items-center border-b border-border gap-3",
            effectiveCollapsed ? "px-3 justify-center" : "px-5",
          )}
        >
          {effectiveCollapsed ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="w-8 h-8 rounded-lg border border-border bg-white flex items-center justify-center flex-shrink-0 overflow-hidden cursor-default">
                  <img
                    src={ENTERPRISE.logoSrc}
                    alt=""
                    className="max-w-[70%] max-h-[70%] w-auto h-auto object-contain"
                  />
                </span>
              </TooltipTrigger>
              <TooltipContent side="right">
                {ENTERPRISE.productName} · {ENTERPRISE.clientName}
              </TooltipContent>
            </Tooltip>
          ) : (
            <>
              <span className="w-8 h-8 rounded-lg border border-border bg-white flex items-center justify-center flex-shrink-0 overflow-hidden">
                <img
                  src={ENTERPRISE.logoSrc}
                  alt=""
                  className="max-w-[70%] max-h-[70%] w-auto h-auto object-contain"
                />
              </span>
              <div className="flex flex-col overflow-hidden min-w-0">
                <span
                  className="text-[15px] tracking-tight truncate"
                  style={{ fontWeight: 600 }}
                >
                  {ENTERPRISE.productName}
                </span>
                <span className="text-[11px] text-muted-foreground -mt-0.5 truncate">
                  {ENTERPRISE.clientName}
                </span>
              </div>
            </>
          )}
        </div>

        <nav
          className="flex-1 py-4 px-3 space-y-1 overflow-y-auto"
          data-tour="nav-main"
        >
          {!effectiveCollapsed && (
            <p
              className="text-[11px] text-muted-foreground px-3 pb-2 uppercase tracking-wider"
              style={{ fontWeight: 500 }}
            >
              Workspace
            </p>
          )}
          {workspaceNavItems.map((item) => {
            const active = isWorkspaceNavActive(item.path);
            const btn = (
              <button
                key={item.path}
                type="button"
                onClick={() => go(item.path)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[14px] transition-all duration-150 group",
                  active
                    ? "bg-[#4f46e5] text-white shadow-sm"
                    : "text-[#475569] hover:bg-[#f1f0ff] hover:text-[#4f46e5]",
                  effectiveCollapsed ? "justify-center" : "",
                )}
                style={{ fontWeight: active ? 500 : 400 }}
              >
                <item.icon
                  className={cn(
                    "w-[18px] h-[18px] flex-shrink-0",
                    active
                      ? "text-white"
                      : "text-[#94a3b8] group-hover:text-[#4f46e5]",
                  )}
                />
                {!effectiveCollapsed && <span>{item.label}</span>}
              </button>
            );
            if (effectiveCollapsed) {
              return (
                <Tooltip key={item.path}>
                  <TooltipTrigger asChild>{btn}</TooltipTrigger>
                  <TooltipContent side="right">{item.label}</TooltipContent>
                </Tooltip>
              );
            }
            return btn;
          })}

          {!effectiveCollapsed && (
            <p
              className="text-[11px] text-muted-foreground px-3 pt-4 pb-2 uppercase tracking-wider"
              style={{ fontWeight: 500 }}
            >
              Projekte
            </p>
          )}

          {projectIds.map((pid) => {
            const expanded = expandedProjectId === pid;
            const projectRowActive = activeProjectPrefix === pid;

            const logo = PROJECT_LOGO_BY_ID[pid];

            const headerBtn = (
              <div
                className={cn(
                  "flex w-full items-center gap-1 rounded-lg",
                  projectRowActive && !expanded
                    ? "bg-[#4f46e5]/8 ring-1 ring-[#4f46e5]/20"
                    : "",
                )}
              >
                {!effectiveCollapsed && (
                  <button
                    type="button"
                    aria-expanded={expanded}
                    aria-label={expanded ? "Projekt einklappen" : "Projekt aufklappen"}
                    onClick={() => toggleExpanded(pid)}
                    className="p-2 rounded-lg text-[#94a3b8] hover:bg-[#f1f5f9] hover:text-[#4f46e5]"
                  >
                    {expanded ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setExpandedProjectId(pid);
                    go(`/projects/${pid}`);
                  }}
                  className={cn(
                    "flex flex-1 items-center gap-2 min-w-0 py-2 pr-2 rounded-lg text-left text-[13px] transition-colors",
                    effectiveCollapsed ? "justify-center px-2" : "pl-0",
                    location.pathname === `/projects/${pid}`
                      ? "text-[#4f46e5] font-medium"
                      : "text-[#475569] hover:text-[#4f46e5]",
                  )}
                >
                  <span className="w-7 h-7 rounded-md border border-border bg-white flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {logo ? (
                      <img
                        src={logo}
                        alt=""
                        className="max-w-[70%] max-h-[70%] object-contain"
                      />
                    ) : (
                      <FolderOpen className="w-3.5 h-3.5 text-[#94a3b8]" />
                    )}
                  </span>
                  {!effectiveCollapsed && (
                    <span className="truncate min-w-0" title={shortProjectTitle(pid)}>
                      <span className="text-[11px] text-muted-foreground block leading-tight">
                        {pid}
                      </span>
                      <span className="leading-snug">{shortProjectTitle(pid)}</span>
                    </span>
                  )}
                </button>
              </div>
            );

            return (
              <div key={pid} className="space-y-0.5">
                {effectiveCollapsed ? (
                  <Tooltip>
                    <TooltipTrigger asChild>{headerBtn}</TooltipTrigger>
                    <TooltipContent side="right">
                      {pid} — {PROJECT_SEARCH_META[pid]?.name ?? pid}
                    </TooltipContent>
                  </Tooltip>
                ) : (
                  headerBtn
                )}
                {expanded &&
                  !effectiveCollapsed &&
                  projectSubNav.map((item) => renderSubLink(pid, item))}
              </div>
            );
          })}

          {!effectiveCollapsed && (
            <button
              type="button"
              onClick={() => go("/projects")}
              className="w-full flex items-center gap-3 px-3 py-2.5 mt-1 rounded-lg text-[14px] text-[#475569] hover:bg-[#f1f0ff] hover:text-[#4f46e5] transition-all duration-150"
              style={{ fontWeight: 400 }}
            >
              <Plus className="w-[18px] h-[18px] text-[#94a3b8]" />
              <span>Projekt hinzufügen</span>
            </button>
          )}
          {effectiveCollapsed && (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={() => go("/projects")}
                  className="w-full flex items-center justify-center px-3 py-2.5 mt-1 rounded-lg text-[#475569] hover:bg-[#f1f0ff] hover:text-[#4f46e5]"
                  aria-label="Projekt hinzufügen"
                >
                  <Plus className="w-[18px] h-[18px] text-[#94a3b8]" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">Projekt hinzufügen</TooltipContent>
            </Tooltip>
          )}
        </nav>

        <div className="px-3 pb-3 space-y-1 border-t border-border pt-3">
          {bottomItems.map((item) => {
            const btn = (
              <button
                key={item.path}
                onClick={() =>
                  go(item.path, {
                    resetOnboarding: Boolean(item.resetOnboarding),
                    stayOnCurrentPage: Boolean(item.stayOnCurrentPage),
                  })
                }
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] text-[#475569] hover:bg-[#f1f5f9] transition-colors",
                  effectiveCollapsed ? "justify-center" : "",
                )}
                style={{ fontWeight: 400 }}
              >
                <item.icon className="w-[18px] h-[18px] text-[#94a3b8]" />
                {!effectiveCollapsed && <span>{item.label}</span>}
              </button>
            );
            if (effectiveCollapsed) {
              return (
                <Tooltip key={item.path}>
                  <TooltipTrigger asChild>{btn}</TooltipTrigger>
                  <TooltipContent side="right">{item.label}</TooltipContent>
                </Tooltip>
              );
            }
            return btn;
          })}

          <button
            type="button"
            onClick={() => setCollapsed(!collapsed)}
            className={cn(
              "hidden lg:flex w-full items-center gap-3 px-3 py-2 rounded-lg text-[13px] text-[#94a3b8] hover:bg-[#f1f5f9] transition-colors",
              effectiveCollapsed ? "justify-center" : "",
            )}
          >
            {effectiveCollapsed ? (
              <ChevronRight className="w-[18px] h-[18px]" />
            ) : (
              <>
                <ChevronLeft className="w-[18px] h-[18px]" />
                <span>Einklappen</span>
              </>
            )}
          </button>
        </div>
      </aside>
    </TooltipProvider>
  );
}
