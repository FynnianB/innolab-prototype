import { createContext, useContext, useMemo, type ReactNode } from "react";
import { useMatches } from "react-router";
import { useAppContext } from "./AppContext";
import {
  getProjectIdsForWorkspace,
  PROJECT_SEARCH_META,
} from "../data/workspaces";
import { isNewNavEnabled } from "../featureFlags";

export interface ProjectNavContextValue {
  /** Only set when the matched route has `:projectId` (e.g. `/projects/P-101/story-generator`). */
  routeProjectId: string | null;
  /**
   * Effective project: URL param, or first workspace project when new-nav is on and URL has no project.
   */
  projectId: string | null;
  projectName: string | null;
}

const ProjectNavContext = createContext<ProjectNavContextValue>({
  routeProjectId: null,
  projectId: null,
  projectName: null,
});

export function ProjectNavProvider({ children }: { children: ReactNode }) {
  const matches = useMatches();
  const routeProjectId = useMemo(() => {
    for (let i = matches.length - 1; i >= 0; i--) {
      const id = matches[i]?.params?.projectId;
      if (typeof id === "string" && id.length > 0) return id;
    }
    return null;
  }, [matches]);

  const { selectedWorkspaceId } = useAppContext();

  let projectId: string | null = routeProjectId;

  if (!projectId && isNewNavEnabled()) {
    const ids = getProjectIdsForWorkspace(selectedWorkspaceId);
    projectId = ids[0] ?? null;
  }

  const projectName = projectId
    ? (PROJECT_SEARCH_META[projectId]?.name ?? null)
    : null;

  return (
    <ProjectNavContext.Provider
      value={{ routeProjectId, projectId, projectName }}
    >
      {children}
    </ProjectNavContext.Provider>
  );
}

export function useProjectNavContext(): ProjectNavContextValue {
  return useContext(ProjectNavContext);
}
