import { Navigate } from "react-router";

/** Alte URL `/compliance` → `/guidelines`. */
export function LegacyComplianceRouteRedirect() {
  return <Navigate to="/guidelines" replace />;
}
