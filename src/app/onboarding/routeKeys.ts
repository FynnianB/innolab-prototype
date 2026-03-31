/** Stabile Keys für abgeschlossene Touren (localStorage). */
export type OnboardingRouteKey =
  | "route:dashboard"
  | "route:projects-list"
  | "route:projects-detail";

/**
 * Ordnet den Pfad einem Tour-Key zu.
 * `/settings` und `/help` liefern null (gleiches Dashboard-Component, keine Doppel-Tour).
 */
export function getOnboardingKey(pathname: string): OnboardingRouteKey | null {
  const p = pathname.replace(/\/+$/, "") || "/";
  if (p === "/settings" || p === "/help") return null;
  if (p === "/") return "route:dashboard";
  if (p === "/projects") return "route:projects-list";
  if (p.startsWith("/projects/")) {
    const id = p.slice("/projects/".length);
    if (!id || id.includes("/")) return null;
    return "route:projects-detail";
  }
  return null;
}
