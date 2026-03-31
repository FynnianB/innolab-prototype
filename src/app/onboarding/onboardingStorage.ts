export const ONBOARDING_STORAGE_KEY = "reqwise.onboarding.v1";

type CompletedMap = Record<string, boolean>;

function readMap(): CompletedMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(ONBOARDING_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object") return {};
    return parsed as CompletedMap;
  } catch {
    return {};
  }
}

function writeMap(map: CompletedMap): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify(map));
  } catch {
    /* ignore */
  }
}

export function isRouteTourDone(routeKey: string): boolean {
  return !!readMap()[routeKey];
}

export function markRouteTourDone(routeKey: string): void {
  const map = readMap();
  map[routeKey] = true;
  writeMap(map);
}

export function resetAllOnboarding(): void {
  writeMap({});
}

export function resetRouteTour(routeKey: string): void {
  const map = readMap();
  delete map[routeKey];
  writeMap(map);
}
