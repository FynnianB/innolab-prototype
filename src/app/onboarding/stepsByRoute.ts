import type { Step } from "react-joyride";
import { hasCustomerJourneyNavCookie } from "./navTourConfig";

function sel(id: string): string {
  return `[data-tour="${id}"]`;
}

function navOverviewContent(): string {
  const cj = hasCustomerJourneyNavCookie()
    ? "\nCustomer Journey · Touchpoints entlang der Experience\n"
    : "";
  return (
    "Oben links: Enterprise-Mandant der Lösung. Im Hauptmenü wechseln Sie zwischen den Bereichen:\n\n" +
    "Dashboard · Überblick und Kennzahlen\n" +
    "Story Generator · Anforderungen mit KI\n" +
    "Compliance Checker · Prüfung gegen Vorgaben\n" +
    "Story-Abhängigkeiten · Verknüpfungen zwischen Stories\n" +
    "Projekte · Teams und Archiv" +
    cj +
    "\n\nDarunter: Einstellungen und Hilfe & Support."
  );
}

const navStep: Step = {
  target: sel("nav-main"),
  title: "Hauptmenü",
  content: "",
  placement: "right-start",
  disableBeacon: true,
};

const WORKSPACE =
  "Workspace = Kundenorganisation (z. B. BMW Group, Volkswagen Group). Projekte und Stories sind immer diesem Kontext zugeordnet – hier wechseln Sie zwischen OEMs.";

const EXPORT =
  "Export: Inhalte aus dem aktuellen Workspace zusammenstellen und herunterladen (z. B. für Berichte).";

const PROJECTS_CARD =
  "Kurzüberblick Ihrer Projekte – volle Liste über „Alle anzeigen“ oder „Projekte“ im Menü.";

/**
 * Dashboard: Nav-Schritt, dann Workspace, Export, Projekte.
 */
export function getDashboardSteps(includeMobileMenuStep: boolean): Step[] {
  const nav: Step = {
    ...navStep,
    content: navOverviewContent(),
  };

  const tail: Step[] = [
    {
      target: sel("topbar-workspace"),
      title: "Workspace",
      content: WORKSPACE,
      placement: "bottom",
      disableBeacon: true,
    },
    {
      target: sel("topbar-export"),
      title: "Export",
      content: EXPORT,
      placement: "bottom",
      disableBeacon: true,
    },
    {
      target: sel("dashboard-projects-card"),
      title: "Ihre Projekte",
      content: PROJECTS_CARD,
      placement: "top",
      disableBeacon: true,
    },
  ];

  if (includeMobileMenuStep) {
    return [
      {
        target: sel("topbar-mobile-menu"),
        title: "Menü",
        content:
          "Seitenleiste öffnen. Im nächsten Schritt erklären wir alle Einträge des Hauptmenüs auf einen Blick.",
        placement: "bottom",
        disableBeacon: true,
      },
      nav,
      ...tail,
    ];
  }

  return [nav, ...tail];
}

/** Vorerst deaktiviert — Fokus liegt auf dem Dashboard. */
export function getProjectsListSteps(): Step[] {
  return [];
}

/** Vorerst deaktiviert — Fokus liegt auf dem Dashboard. */
export function getProjectsDetailSteps(): Step[] {
  return [];
}

export function getStepsForRoute(
  key: import("./routeKeys").OnboardingRouteKey,
  options: { includeMobileMenuStep: boolean },
): Step[] {
  switch (key) {
    case "route:dashboard":
      return getDashboardSteps(options.includeMobileMenuStep);
    case "route:projects-list":
      return getProjectsListSteps();
    case "route:projects-detail":
      return getProjectsDetailSteps();
    default:
      return [];
  }
}
