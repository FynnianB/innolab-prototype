import { Navigate, useLocation } from "react-router";
import { COMPLIANCE_CHECK_PATH } from "../paths";

/** Legacy-URL `/guidelines` → `/compliance-check` (Query beibehalten). */
export function LegacyGuidelinesRouteRedirect() {
  const { search } = useLocation();
  return <Navigate to={`${COMPLIANCE_CHECK_PATH}${search}`} replace />;
}
