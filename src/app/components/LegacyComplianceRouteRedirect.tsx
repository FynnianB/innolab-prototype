import { Navigate } from "react-router";

import { COMPLIANCE_CHECK_PATH } from "../paths";

/** Alte URL `/compliance` → `/compliance-check`. */
export function LegacyComplianceRouteRedirect() {
  return <Navigate to={COMPLIANCE_CHECK_PATH} replace />;
}
