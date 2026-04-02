import { RuleManagementContent } from "../components/RuleManagementContent";
import { useProjectNavContext } from "../context/ProjectNavContext";

export function RuleManagement() {
  const { routeProjectId } = useProjectNavContext();
  return (
    <RuleManagementContent
      embedded={false}
      lockProjectScopeId={routeProjectId}
    />
  );
}
