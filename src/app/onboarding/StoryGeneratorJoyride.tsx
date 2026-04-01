import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Joyride, { EVENTS, STATUS, type CallBackProps, type Step } from "react-joyride";
import { appJoyrideLocale, appJoyrideStyles } from "./joyrideUi";
import { OnboardingTooltip } from "./OnboardingTooltip";
import { markRouteTourDone, isRouteTourDone } from "./onboardingStorage";

const ROUTE_KEY = "route:story-generator";

function sel(id: string): string {
  return `[data-tour="${id}"]`;
}

type SGPhase =
  | "upload"
  | "doc-analyzing"
  | "doc-review"
  | "generating"
  | "results"
  | "jira-compare"
  | "save";

type TourIdxEntry = { phase: SGPhase; step: Step };

function buildTourSteps(
  compareStepLabel: string,
  exportShortName: string,
): Record<number, TourIdxEntry> {
  return {
    1: {
      phase: "upload",
      step: {
        target: sel("storygen-workflow"),
        title: "Rundgang: Story-Generator",
        content:
          `Auf dieser Seite bündeln Sie **Quellen** (Dateien, optional Confluence/Audio, Freitext) und starten eine Kette aus Analyse → Review → Story-Erzeugung → **${compareStepLabel}** → Speichern.\n\n` +
          "In der Tour sind **Demo-Dateien** bereits eingebunden, damit Sie den kompletten Ablauf ohne eigenes Material durchspielen können.\n\n" +
          "Der Button unten in der Kachel löst dieselbe Aktion aus wie **Generator starten** in der Leiste.",
        placement: "bottom",
        disableBeacon: true,
        data: {
          hidePrimary: true,
        },
      },
    },
    2: {
      phase: "doc-analyzing",
      step: {
        target: sel("storygen-analyzing-panel"),
        title: "Dokumentenprüfung",
        content:
          "In dieser Phase werden Ihre Quellen eingelesen, strukturiert und auf **Widersprüche, Duplikate und Lücken** geprüft.\n\n" +
          "In der Live-Version würde das je nach Umfang länger dauern; hier sehen Sie die Schritte in Kurzform. Anschließend landen Sie automatisch in der **manuellen Review**, um Befunde zu klären.",
        placement: "bottom",
        disableBeacon: true,
        data: {
          hidePrimary: true,
          actionHint: "Warten Sie, bis die Analyse automatisch in die **Dokumentenprüfung** wechselt.",
        },
      },
    },
    3: {
      phase: "doc-review",
      step: {
        target: sel("storygen-doc-bulk-actions"),
        title: "Befunde klären",
        content:
          "Links sehen Sie die **analysierten Quellen** und eine Kurzstatistik; rechts die **konkreten Befunde** mit Schwere und Fundstelle.\n\n" +
          "Pro Eintrag können Sie z. B. eine **automatische Korrektur** prüfen, einzeln **ignorieren** oder per Dialog entscheiden. **Alle ignorieren** schließt alle offenen Punkte auf einmal – sinnvoll für einen schnellen Demo-Durchlauf.\n\n" +
          "Erst wenn kein Befund mehr offen ist, wird die Story-Generierung freigegeben.",
        placement: "bottom",
        disableBeacon: true,
        spotlightPadding: 8,
        data: {
          hidePrimary: true,
        },
      },
    },
    4: {
      phase: "doc-review",
      step: {
        target: sel("storygen-generate-stories-btn"),
        title: "Stories erzeugen",
        content:
          "Jetzt wendet die KI die **bereinigten Fakten** aus den Dokumenten an und erzeugt daraus User-Story-Entwürfe (inkl. späterer Qualitäts- und Konsistenzprüfung in der nächsten Phase).\n\n" +
          "Ohne vorherige Klärung der Dokument-Befunde wäre die Ausgabe unsicher – deshalb ist dieser Schritt bewusst erst jetzt möglich.\n\n" +
          "Der Button in der Kachel entspricht **User Stories erzeugen** oben rechts.",
        placement: "bottom",
        disableBeacon: true,
        data: {
          hidePrimary: true,
        },
      },
    },
    5: {
      phase: "generating",
      step: {
        target: sel("storygen-generating-panel"),
        title: "Story-Generierung",
        content:
          "Die KI wandelt Ihre **bereinigten Anforderungen** in Story-Entwürfe um: Struktur, Formulierung und erste Plausibilitätsprüfung laufen wie in einer echten Pipeline.\n\n" +
          "Die Fortschrittsliste in der Karte zeigt die einzelnen Phasen. **Kein Scrollen nötig** – sobald die Erzeugung fertig ist, wechselt die Ansicht automatisch zur **Story-Liste**.",
        placement: "center",
        disableBeacon: true,
        spotlightPadding: 12,
        data: {
          hidePrimary: true,
          widePanel: true,
          actionHint: "Warten Sie, bis die **generierten Stories** automatisch angezeigt werden.",
        },
      },
    },
    6: {
      phase: "results",
      step: {
        target: sel("storygen-results-header"),
        title: "Stories prüfen",
        content:
          "**Kopfzeile:** Hier finden Sie **Export**, **" +
          exportShortName +
          "-Export** und **Weiter zum " +
          compareStepLabel +
          "** – dieselbe Aktion wie der violette Button in der Tour-Kachel.\n\n" +
          "**Darunter (scrollbar):** Jede Karte ist ein **Entwurf** – übernehmen, ablehnen oder im Editor anpassen. Mit der **Suche** filtern Sie nach ID oder Stichwort.",
        placement: "bottom",
        disableBeacon: true,
        spotlightPadding: 10,
        data: {
          hidePrimary: true,
          widePanel: true,
        },
      },
    },
    7: {
      phase: "jira-compare",
      step: {
        target: sel("storygen-jira-continue"),
        title: compareStepLabel,
        content:
          "Drei Bereiche: **bestehende Tickets**, **erkannte Zusammenhänge** (Überschneidung, Duplikat, Widerspruch, Lücke …) und eine **Kurzübersicht** nach Typ.\n\n" +
          "Pro Karte entscheiden Sie, ob ein Vorschlag **bestätigt**, **zusammengeführt** oder **verworfen** wird – damit Ihr Backlog konsistent bleibt.\n\n" +
          "Wenn Sie fertig sind, geht es zum Speichern ins Workspace-Projekt; der Kachel-Button entspricht **Weiter zum Speichern**.",
        placement: "bottom",
        disableBeacon: true,
        data: {
          hidePrimary: true,
        },
      },
    },
    8: {
      phase: "save",
      step: {
        target: sel("storygen-save-panel"),
        title: "Speichern & Abschluss",
        content:
          "**Ablauf in der Ansicht darunter (gleicher Screen):**\n\n" +
          "1. **Zielprojekt** im Workspace wählen.\n" +
          "2. **Zusammenfassung** prüfen (übernommen / abgelehnt / Dok.-Korrekturen).\n" +
          "3. Optional **Integrationen** (z. B. Confluence-Demo) vormerken.\n" +
          "4. Mit **Speichern** die übernommenen Stories ins Projekt schreiben.\n\n" +
          "Der **Button in der Tour-Kachel** entspricht dem großen Speichern-Button und wählt bei Bedarf automatisch ein Demo-Projekt.",
        placement: "center",
        disableBeacon: true,
        spotlightPadding: 8,
        data: {
          hidePrimary: true,
          widePanel: true,
        },
      },
    },
  };
}

const STORY_GEN_TOUR_TOTAL = 8;

export type StoryGeneratorTourHandlers = {
  startDocAnalysis: () => void;
  ignoreAllDocIssues: () => void;
  startStoryGeneration: () => void;
  goToJiraCompare: () => void;
  goToSave: () => void;
  completeSaveDemo: () => void;
};

function tutorialCardCtaForStep(
  tourIdx: number,
  h: StoryGeneratorTourHandlers,
  opts: {
    pendingDocIssues: number;
    allResolved: boolean;
    storiesToSaveCount: number;
    compareStepLabel: string;
  },
):
  | { label: string; onClick: () => void; disabled?: boolean }
  | undefined {
  switch (tourIdx) {
    case 1:
      return { label: "Generator starten", onClick: h.startDocAnalysis };
    case 3:
      return {
        label: "Alle ignorieren",
        onClick: h.ignoreAllDocIssues,
        disabled: opts.pendingDocIssues === 0,
      };
    case 4:
      return {
        label: "User Stories erzeugen",
        onClick: h.startStoryGeneration,
        disabled: !opts.allResolved,
      };
    case 6:
      return {
        label: `Weiter zum ${opts.compareStepLabel}`,
        onClick: h.goToJiraCompare,
      };
    case 7:
      return { label: "Weiter zum Speichern", onClick: h.goToSave };
    case 8:
      return {
        label: `${opts.storiesToSaveCount} User Stories speichern`,
        onClick: h.completeSaveDemo,
        disabled: opts.storiesToSaveCount === 0,
      };
    default:
      return undefined;
  }
}

type Props = {
  phase: SGPhase;
  allResolved: boolean;
  saveSuccess: boolean;
  revision: number;
  onSeedDemoSources: () => void;
  tourHandlers: StoryGeneratorTourHandlers;
  pendingDocIssues: number;
  storiesToSaveCount: number;
  /** Aus Workspace-Ticket-Tool (z. B. „Jira-Abgleich“). */
  compareStepLabel: string;
  exportShortName: string;
};

export function StoryGeneratorJoyride({
  phase,
  allResolved,
  saveSuccess,
  revision,
  onSeedDemoSources,
  tourHandlers,
  pendingDocIssues,
  storiesToSaveCount,
  compareStepLabel,
  exportShortName,
}: Props) {
  const tourSteps = useMemo(
    () => buildTourSteps(compareStepLabel, exportShortName),
    [compareStepLabel, exportShortName],
  );
  const tourActive = !isRouteTourDone(ROUTE_KEY);
  const [tourIdx, setTourIdx] = useState(0);
  const [run, setRun] = useState(false);
  const uploadSeededRef = useRef(false);

  useEffect(() => {
    uploadSeededRef.current = false;
    setTourIdx(0);
  }, [revision]);

  useEffect(() => {
    if (!tourActive) return;
    if (tourIdx !== 0 || phase !== "upload") return;
    if (uploadSeededRef.current) return;
    uploadSeededRef.current = true;
    onSeedDemoSources();
    setTourIdx(1);
  }, [tourActive, tourIdx, phase, onSeedDemoSources]);

  useEffect(() => {
    if (!tourActive) return;
    if (phase === "doc-analyzing") setTourIdx((i) => Math.max(i, 2));
    if (phase === "doc-review") setTourIdx((i) => Math.max(i, 3));
    if (phase === "generating") setTourIdx((i) => Math.max(i, 5));
    if (phase === "results") setTourIdx((i) => Math.max(i, 6));
    if (phase === "jira-compare") setTourIdx((i) => Math.max(i, 7));
    if (phase === "save") setTourIdx((i) => Math.max(i, 8));
  }, [phase, tourActive]);

  useEffect(() => {
    if (!tourActive) return;
    if (phase === "doc-review" && tourIdx === 3 && allResolved) {
      setTourIdx(4);
    }
  }, [phase, tourActive, tourIdx, allResolved]);

  useEffect(() => {
    if (saveSuccess) {
      markRouteTourDone(ROUTE_KEY);
      setRun(false);
    }
  }, [saveSuccess]);

  const entry = tourSteps[tourIdx];
  const steps = useMemo(() => {
    if (!entry) return [];
    const base = entry.step.data;
    const merged: Record<string, unknown> = {
      ...(base && typeof base === "object" ? base : {}),
      progressLabel: { current: tourIdx, total: STORY_GEN_TOUR_TOTAL },
    };
    const cta = tutorialCardCtaForStep(tourIdx, tourHandlers, {
      pendingDocIssues,
      allResolved,
      storiesToSaveCount,
      compareStepLabel,
    });
    if (cta) merged.tutorialCardCta = cta;
    return [
      {
        ...entry.step,
        data: merged,
      },
    ];
  }, [
    entry,
    tourIdx,
    tourHandlers,
    pendingDocIssues,
    allResolved,
    storiesToSaveCount,
    compareStepLabel,
  ]);
  const phaseOk = entry ? entry.phase === phase : false;

  useEffect(() => {
    if (!tourActive || !entry || !phaseOk || tourIdx < 1) {
      setRun(false);
      return;
    }
    setRun(false);
    const t = window.setTimeout(() => setRun(true), 320);
    return () => window.clearTimeout(t);
  }, [tourActive, entry, phaseOk, tourIdx, phase]);

  const handleCallback = useCallback((data: CallBackProps) => {
    const { status, type } = data;
    if (status === STATUS.SKIPPED || status === STATUS.FINISHED) {
      markRouteTourDone(ROUTE_KEY);
      setRun(false);
      return;
    }
    if (type === EVENTS.TARGET_NOT_FOUND) {
      setRun(false);
    }
  }, []);

  if (!tourActive || !entry || !phaseOk || tourIdx < 1) {
    return null;
  }

  return (
    <Joyride
      key={`sg-tour-${tourIdx}-${phase}`}
      steps={steps}
      run={run}
      continuous={false}
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
