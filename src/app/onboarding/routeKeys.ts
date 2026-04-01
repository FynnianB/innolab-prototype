/** Stabile Keys für abgeschlossene Touren (localStorage). */
export type OnboardingRouteKey =
  | "route:dashboard"
  | "route:compliance"
  | "route:stories";

/**
 * Ordnet den Pfad einem Tour-Key zu.
 * `/settings` und `/help` liefern null (gleiches Dashboard-Component, keine Doppel-Tour).
 * Story Generator (`/story-generator`) bewusst ohne Tour.
 * Story-Abhängigkeiten: `route:stories` für `/stories`.
 * Projekte (`/projects`, `/projects/:id`): bewusst ohne Tour.
 */
export function getOnboardingKey(pathname: string): OnboardingRouteKey | null {
  const p = pathname.replace(/\/+$/, "") || "/";
  if (p === "/settings" || p === "/help") return null;
  if (p === "/") return "route:dashboard";
  if (p === "/compliance") return "route:compliance";
  if (p === "/stories") return "route:stories";
  return null;
}
