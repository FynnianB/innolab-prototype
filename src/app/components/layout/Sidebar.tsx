import { useState } from "react";
import { useLocation, useNavigate } from "react-router";
import {
  LayoutDashboard,
  Sparkles,
  ShieldCheck,
  BookOpen,
  FolderOpen,
  Settings,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  BrainCircuit,
  GitCompare,
  TrendingUp,
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";

/** Feature-Cookie: Tab "Customer Journey" nur anzeigen, wenn Cookie "customer-journey" gesetzt ist (z. B. für Devs). */
function hasCustomerJourneyCookie(): boolean {
  if (typeof document === "undefined") return false;
  return document.cookie.split(";").some((part) => part.trim().startsWith("customer-journey="));
}

const baseNavItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/" },
  { icon: Sparkles, label: "Story Generator", path: "/story-generator" },
  { icon: ShieldCheck, label: "Compliance Checker", path: "/compliance" },
  { icon: GitCompare, label: "Jira-Story Abgleich", path: "/jira-comparison" },
  { icon: BookOpen, label: "Regel-Management", path: "/rules" },
  { icon: FolderOpen, label: "Projekte", path: "/projects" },
];

const customerJourneyItem = { icon: TrendingUp, label: "Customer Journey", path: "/customer-journey" };

const bottomItems = [
  { icon: Settings, label: "Einstellungen", path: "/settings" },
  { icon: HelpCircle, label: "Hilfe & Support", path: "/help" },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  const navItems = hasCustomerJourneyCookie()
    ? [...baseNavItems, customerJourneyItem]
    : baseNavItems;

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={`h-screen bg-white border-r border-border flex flex-col transition-all duration-300 ease-in-out ${
          collapsed ? "w-[72px]" : "w-[260px]"
        }`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center px-5 border-b border-border gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#4f46e5] flex items-center justify-center flex-shrink-0">
            <BrainCircuit className="w-5 h-5 text-white" />
          </div>
          {!collapsed && (
            <div className="flex flex-col overflow-hidden">
              <span className="text-[15px] tracking-tight" style={{ fontWeight: 600 }}>
                ReqWise AI
              </span>
              <span className="text-[11px] text-muted-foreground -mt-0.5">Requirements Intelligence</span>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {!collapsed && (
            <p className="text-[11px] text-muted-foreground px-3 pb-2 uppercase tracking-wider" style={{ fontWeight: 500 }}>
              Hauptmenü
            </p>
          )}
          {navItems.map((item) => {
            const active = isActive(item.path);
            const btn = (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[14px] transition-all duration-150 group ${
                  active
                    ? "bg-[#4f46e5] text-white shadow-sm"
                    : "text-[#475569] hover:bg-[#f1f0ff] hover:text-[#4f46e5]"
                } ${collapsed ? "justify-center" : ""}`}
                style={{ fontWeight: active ? 500 : 400 }}
              >
                <item.icon className={`w-[18px] h-[18px] flex-shrink-0 ${active ? "text-white" : "text-[#94a3b8] group-hover:text-[#4f46e5]"}`} />
                {!collapsed && <span>{item.label}</span>}
              </button>
            );
            if (collapsed) {
              return (
                <Tooltip key={item.path}>
                  <TooltipTrigger asChild>{btn}</TooltipTrigger>
                  <TooltipContent side="right">{item.label}</TooltipContent>
                </Tooltip>
              );
            }
            return btn;
          })}
        </nav>

        {/* Bottom */}
        <div className="px-3 pb-3 space-y-1 border-t border-border pt-3">
          {bottomItems.map((item) => {
            const btn = (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] text-[#475569] hover:bg-[#f1f5f9] transition-colors ${
                  collapsed ? "justify-center" : ""
                }`}
                style={{ fontWeight: 400 }}
              >
                <item.icon className="w-[18px] h-[18px] text-[#94a3b8]" />
                {!collapsed && <span>{item.label}</span>}
              </button>
            );
            if (collapsed) {
              return (
                <Tooltip key={item.path}>
                  <TooltipTrigger asChild>{btn}</TooltipTrigger>
                  <TooltipContent side="right">{item.label}</TooltipContent>
                </Tooltip>
              );
            }
            return btn;
          })}

          {/* Collapse button */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] text-[#94a3b8] hover:bg-[#f1f5f9] transition-colors ${
              collapsed ? "justify-center" : ""
            }`}
          >
            {collapsed ? (
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