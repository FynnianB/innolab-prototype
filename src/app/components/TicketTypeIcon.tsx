import { BookOpen, Layers, Bug, ClipboardCheck } from "lucide-react";

const ticketTypeConfig: Record<string, { icon: typeof BookOpen; color: string; bg: string; label: string }> = {
  Story: { icon: BookOpen, color: "#10b981", bg: "#d1fae5", label: "Story" },
  Epic: { icon: Layers, color: "#8b5cf6", bg: "#ede9fe", label: "Epic" },
  Bug: { icon: Bug, color: "#ef4444", bg: "#fef2f2", label: "Bug" },
  Task: { icon: ClipboardCheck, color: "#4f46e5", bg: "#f1f0ff", label: "Task" },
};

interface TicketTypeIconProps {
  type: string;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  className?: string;
}

export function TicketTypeIcon({ type, size = "sm", showLabel = false, className = "" }: TicketTypeIconProps) {
  const config = ticketTypeConfig[type] || ticketTypeConfig.Task;
  const IconComponent = config.icon;

  const sizeMap = {
    sm: { box: "w-5 h-5", icon: "w-3 h-3", text: "text-[10px]" },
    md: { box: "w-6 h-6", icon: "w-3.5 h-3.5", text: "text-[11px]" },
    lg: { box: "w-8 h-8", icon: "w-4 h-4", text: "text-[12px]" },
  };

  const s = sizeMap[size];

  if (showLabel) {
    return (
      <span
        className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded ${s.text} ${className}`}
        style={{ backgroundColor: config.bg, color: config.color, fontWeight: 500 }}
      >
        <IconComponent className={s.icon} />
        {config.label}
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center justify-center rounded ${s.box} flex-shrink-0 ${className}`}
      style={{ backgroundColor: config.bg }}
      title={config.label}
    >
      <IconComponent className={s.icon} style={{ color: config.color }} />
    </span>
  );
}
