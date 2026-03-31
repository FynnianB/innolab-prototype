import { Navigate, useLocation } from "react-router";

/** Alte URL `/story-analysis` → `/stories` (Query-String bleibt erhalten). */
export function LegacyStoriesRouteRedirect() {
  const { search } = useLocation();
  return <Navigate to={{ pathname: "/stories", search }} replace />;
}
