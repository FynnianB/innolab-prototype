import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useLocation } from "react-router";
import { getOnboardingKey } from "./routeKeys";
import { resetAllOnboarding, resetRouteTour } from "./onboardingStorage";

type OnboardingResetContextValue = {
  /** Erhöht sich bei Reset — Onboarding-Host startet Touren neu. */
  revision: number;
  /** Alle abgeschlossenen Touren löschen und Anzeige neu triggern. */
  resetAllTours: () => void;
  /** Nur die Tour der aktuellen Route zurücksetzen (falls vorhanden). */
  resetTourForCurrentRoute: () => void;
};

const OnboardingResetContext =
  createContext<OnboardingResetContextValue | null>(null);

export function OnboardingResetProvider({ children }: { children: ReactNode }) {
  const location = useLocation();
  const [revision, setRevision] = useState(0);
  const resetAllTours = useCallback(() => {
    resetAllOnboarding();
    setRevision((r) => r + 1);
  }, []);
  const resetTourForCurrentRoute = useCallback(() => {
    const key = getOnboardingKey(location.pathname);
    if (!key) return;
    resetRouteTour(key);
    setRevision((r) => r + 1);
  }, [location.pathname]);
  const value = useMemo(
    () => ({
      revision,
      resetAllTours,
      resetTourForCurrentRoute,
    }),
    [revision, resetAllTours, resetTourForCurrentRoute],
  );
  return (
    <OnboardingResetContext.Provider value={value}>
      {children}
    </OnboardingResetContext.Provider>
  );
}

export function useOnboardingReset(): OnboardingResetContextValue {
  const ctx = useContext(OnboardingResetContext);
  if (!ctx) {
    throw new Error(
      "useOnboardingReset must be used within OnboardingResetProvider",
    );
  }
  return ctx;
}
