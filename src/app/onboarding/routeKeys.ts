/** Stabile Keys für abgeschlossene Touren (localStorage). */
export type OnboardingRouteKey =
  | "route:dashboard"
  | "route:compliance"
  | "route:stories"
  | "route:story-generator";

/**
 * Ordnet den Pfad einem Tour-Key zu.
 * `/settings` und `/help` liefern null (gleiches Dashboard-Component, keine Doppel-Tour).
 * Story Generator: `route:story-generator` — geführter Prozess-Tour (eigene Joyride in der Seite).
 * Story-Abhängigkeiten: `route:stories` für `/stories`.
 * Projekte (`/projects`, `/projects/:id`): bewusst ohne Tour.
 */
export function getOnboardingKey(pathname: string): OnboardingRouteKey | null {
  const p = pathname.replace(/\/+$/, "") || "/";
  if (p === "/settings" || p === "/help") return null;
  if (p === "/") return "route:dashboard";
  if (p === "/compliance") return "route:compliance";
  if (p === "/stories") return "route:stories";
  if (p === "/story-generator") return "route:story-generator";
  return null;
}
