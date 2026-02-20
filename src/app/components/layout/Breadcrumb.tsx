import { useLocation, useNavigate } from "react-router";
import { ChevronRight, Home } from "lucide-react";
import { getItemTitle } from "../../data/stories";

const routeLabels: Record<string, string> = {
  "": "Dashboard",
  "story-generator": "Story Generator",
  compliance: "Compliance Checker",
  "story-analysis": "Story-Analyse",
  rules: "Regel-Management",
  projects: "Projekte",
  "customer-journey": "Customer Journey",
  settings: "Einstellungen",
  help: "Hilfe & Support",
  story: "Story-Detail",
};

interface BreadcrumbItem {
  label: string;
  path: string;
  isCurrent: boolean;
}

export function Breadcrumb() {
  const location = useLocation();
  const navigate = useNavigate();

  const segments = location.pathname.split("/").filter(Boolean);

  // Build breadcrumb items
  const items: BreadcrumbItem[] = [
    { label: "Dashboard", path: "/", isCurrent: segments.length === 0 },
  ];

  if (segments.length > 0) {
    // First segment
    const firstSegment = segments[0];
    const label = routeLabels[firstSegment] || firstSegment;

    if (firstSegment === "story" && segments[1]) {
      // Story detail page: Dashboard > Story-Detail > [ID]
      items.push({ label: "Story-Detail", path: "/projects", isCurrent: false });
      const decodedId = decodeURIComponent(segments[1]);
      const title = getItemTitle(decodedId);
      const displayLabel = title !== decodedId ? `${decodedId} - ${title}` : decodedId;
      items.push({ label: displayLabel, path: location.pathname, isCurrent: true });
    } else if (firstSegment === "projects" && segments[1]) {
      // Project detail: Dashboard > Projekte > [projectId]
      items.push({ label: "Projekte", path: "/projects", isCurrent: false });
      items.push({ label: decodeURIComponent(segments[1]), path: location.pathname, isCurrent: true });
    } else {
      items.push({ label, path: `/${firstSegment}`, isCurrent: true });
    }
  }

  if (items.length <= 1) return null;

  return (
    <nav className="flex items-center gap-1.5 px-4 sm:px-6 lg:px-8 py-2.5 bg-[#fafbfc] border-b border-border text-[12px] min-w-0 overflow-x-auto overflow-y-hidden">
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-1.5">
          {i > 0 && <ChevronRight className="w-3 h-3 text-[#cbd5e1]" />}
          {i === 0 && <Home className="w-3 h-3 text-[#94a3b8] mr-0.5" />}
          {item.isCurrent ? (
            <span className="text-[#1e1e2e] truncate max-w-[300px]" style={{ fontWeight: 500 }}>
              {item.label}
            </span>
          ) : (
            <button
              onClick={() => item.path && navigate(item.path)}
              className="text-[#94a3b8] hover:text-[#4f46e5] transition-colors truncate max-w-[200px]"
              style={{ fontWeight: 400 }}
            >
              {item.label}
            </button>
          )}
        </div>
      ))}
    </nav>
  );
}