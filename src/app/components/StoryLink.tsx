import { useNavigate } from "react-router";

interface StoryLinkProps {
  id: string;
  className?: string;
  children?: React.ReactNode;
}

/**
 * Clickable story/ticket ID link that navigates to the detail view.
 * Use this component wherever a story ID (US-xxx) or Jira ticket (PROJ-xxx) is displayed.
 */
export function StoryLink({ id, className = "", children }: StoryLinkProps) {
  const navigate = useNavigate();
  const safeId = (id || "").trim();

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!safeId) return;
    navigate(`/story/${encodeURIComponent(safeId)}`);
  };

  if (!safeId) {
    return <span className={className}>{children || "—"}</span>;
  }

  return (
    <button
      onClick={handleClick}
      className={`inline-flex items-center text-[#4f46e5] hover:text-[#4338ca] hover:underline cursor-pointer transition-colors ${className}`}
      style={{ fontWeight: 600 }}
      title={`Details anzeigen: ${safeId}`}
    >
      {children || safeId}
    </button>
  );
}