import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { resetAllOnboarding } from "./onboardingStorage";

type OnboardingResetContextValue = {
  /** Erhöht sich bei Reset — Onboarding-Host startet Touren neu. */
  revision: number;
  /** Alle abgeschlossenen Touren löschen und Anzeige neu triggern. */
  resetAllTours: () => void;
};

const OnboardingResetContext =
  createContext<OnboardingResetContextValue | null>(null);

export function OnboardingResetProvider({ children }: { children: ReactNode }) {
  const [revision, setRevision] = useState(0);
  const resetAllTours = useCallback(() => {
    resetAllOnboarding();
    setRevision((r) => r + 1);
  }, []);
  const value = useMemo(
    () => ({ revision, resetAllTours }),
    [revision, resetAllTours],
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
