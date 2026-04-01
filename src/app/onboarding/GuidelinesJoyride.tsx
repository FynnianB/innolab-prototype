import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Joyride, { EVENTS, STATUS, type CallBackProps, type Step } from "react-joyride";
import type { GuidelinesMainTab } from "../components/guidelines/GuidelinesTabNav";
import { OnboardingTooltip } from "./OnboardingTooltip";
import { markRouteTourDone, isRouteTourDone } from "./onboardingStorage";
import { useOnboardingReset } from "./OnboardingResetContext";
import { appJoyrideLocale, appJoyrideStyles } from "./joyrideUi";

const ROUTE_KEY = "route:guidelines";

function sel(id: string): string {
  return `[data-tour="${id}"]`;
}

/** Spotlight auf Navigation (Tab-Zeile), nicht auf den Panel-Inhalt. */
const GUIDELINES_TAB_STEPS: Step[] = [
  {
    target: sel("guidelines-scope-bar"),
    title: "Auswertungsbereich",
    content:
      "Hier wählen Sie **Gesamter Workspace** oder ein **konkretes Projekt** (Auswahl rechts im Feld). Die Einstellung gilt für alle Tabs in dieser Ansicht.\n\n" +
      "Mit **Weiter** folgt der erste Eintrag in der Tab-Navigation: **Übersicht & Analyse**.",
    placement: "bottom",
    disableBeacon: true,
    spotlightPadding: 10,
  },
  {
    target: sel("guidelines-nav-overview"),
    title: "Übersicht & Analyse",
    content:
      "Dieser Tab zeigt **aggregierte Kennzahlen** und den **Projektvergleich** für den gewählten Auswertungsbereich.\n\n" +
      "**Weiter** springt zum nächsten Navigationspunkt (**Regelwerk**) und wechselt dorthin.",
    placement: "bottom",
    disableBeacon: true,
    spotlightPadding: 6,
  },
  {
    target: sel("guidelines-nav-rules"),
    title: "Regelwerk",
    content:
      "Hier pflegen Sie den **Regelkatalog**. Bei Projektauswahl oben werden fremde Projektregeln ausgeblendet; im **gesamten Workspace** sehen Sie alle Regeln.\n\n" +
      "**Weiter** wechselt zum letzten Tab in der Leiste.",
    placement: "bottom",
    disableBeacon: true,
    spotlightPadding: 6,
  },
  {
    target: sel("guidelines-nav-check"),
    title: "Dokumente prüfen",
    content:
      "**Simulierter Upload**, die Liste der Demo-Lastenhefte und unten die Tabelle **Analyse-Verlauf** — alles in diesem Bereich.\n\n" +
      "Eine Karte startet die Review; **Zurück zu Dokumente prüfen** holt Sie hierher zurück.",
    placement: "bottom",
    disableBeacon: true,
    spotlightPadding: 6,
  },
];

interface GuidelinesJoyrideProps {
  setActiveTab: (tab: GuidelinesMainTab) => void;
}

/**
 * Rundgang /compliance-check: Scope-Leiste, dann die drei Tab-Buttons. Tab-Inhalt wechselt per „Weiter“
 * (asynchron, damit react-joyride den Schrittwechsel nicht unterbricht — kein flushSync).
 */
export function GuidelinesJoyride({ setActiveTab }: GuidelinesJoyrideProps) {
  const { revision } = useOnboardingReset();
  const completed = isRouteTourDone(ROUTE_KEY);
  const [run, setRun] = useState(false);
  const setActiveTabRef = useRef(setActiveTab);
  setActiveTabRef.current = setActiveTab;

  const steps = useMemo(() => GUIDELINES_TAB_STEPS, []);

  useEffect(() => {
    if (completed || steps.length === 0) {
      setRun(false);
      return;
    }
    setRun(false);
    setActiveTabRef.current("overview");
    const t = window.setTimeout(() => setRun(true), 320);
    return () => window.clearTimeout(t);
  }, [completed, steps.length, revision]);

  const handleCallback = useCallback((data: CallBackProps) => {
    const { index, status, type } = data;

    if (type === EVENTS.STEP_AFTER && typeof index === "number") {
      const tabAfterStep: Partial<Record<number, GuidelinesMainTab>> = {
        0: "overview",
        1: "rules",
        2: "check",
      };
      const next = tabAfterStep[index];
      if (next) {
        window.setTimeout(() => {
          setActiveTabRef.current(next);
        }, 0);
      }
    }

    if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
      markRouteTourDone(ROUTE_KEY);
      setRun(false);
    }
  }, []);

  if (completed || steps.length === 0) {
    return null;
  }

  return (
    <Joyride
      steps={steps}
      run={run}
      continuous
      showProgress
      showSkipButton
      hideCloseButton
      scrollOffset={80}
      spotlightPadding={8}
      disableOverlayClose
      callback={handleCallback}
      tooltipComponent={OnboardingTooltip}
      locale={appJoyrideLocale}
      styles={appJoyrideStyles}
      floaterProps={{
        styles: {
          floater: { zIndex: 10055 },
        },
      }}
    />
  );
}
