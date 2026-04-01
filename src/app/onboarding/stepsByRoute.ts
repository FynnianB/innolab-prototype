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

/**
 * Compliance Checker: nur Projekt-Auswahl (gleiche DOM-Struktur wie beim ersten Besuch).
 * Nach Klick auf ein Projekt: Review-UI ohne neue Tour — Hinweise im letzten Schritt.
 */
export function getComplianceSteps(): Step[] {
  return [
    {
      target: sel("compliance-intro"),
      title: "Compliance Checker",
      content:
        "Hier prüfen Sie Lastenhefte und Anforderungsdokumente gegen Regeln (z. B. DSGVO, Unternehmensstandards). Projekte sind auf den aktuellen Workspace bezogen.",
      placement: "bottom",
      disableBeacon: true,
    },
    {
      target: sel("compliance-project-list"),
      title: "Projekt wählen",
      content:
        "Jede Karte ist ein prüfbares Dokument. Nach der Auswahl sehen Sie das Volltext-Review: markierte Stellen, Befunde rechts, Seitenwahl unten und Aktionen wie Export oder Auto-Korrektur.",
      placement: "top",
      disableBeacon: true,
    },
    {
      target: sel("compliance-rules-btn"),
      title: "Regeln",
      content:
        "Unter „Regeln verwalten“ passen Sie die Prüfkataloge an. Die Prüfung im Checker nutzt genau diese Regeln.",
      placement: "left",
      disableBeacon: true,
    },
  ];
}

/** Story-Abhängigkeiten (`/stories`): Projekt-Trigger, Filter, Liste, Detail. */
export function getStoryDependenciesSteps(): Step[] {
  return [
    {
      target: sel("stories-project-filter"),
      title: "Projekt-Scope",
      content:
        "Nur dieser Button: wählen Sie ein Projekt oder „Alle Projekte“ – Liste und Zähler beziehen sich auf den aktuellen Workspace.",
      placement: "bottom-start",
      disableBeacon: true,
      spotlightPadding: 6,
    },
    {
      target: sel("stories-filters"),
      title: "Suche & Filter",
      content:
        "Suche, Typ, Quelle und Beziehungen; darunter Quick-Filter und „Mit Verknüpfungen“, um die Vorgangsliste einzugrenzen.",
      placement: "bottom",
      disableBeacon: true,
    },
    {
      target: sel("stories-story-list"),
      title: "Vorgangsliste",
      content:
        "Hier navigieren Sie wie im Jira-Issue-Navigator: ein Eintrag ist vorausgewählt, Sie können jederzeit einen anderen Vorgang wählen.",
      placement: "right",
      disableBeacon: true,
    },
    {
      target: sel("stories-detail-hero"),
      title: "Detailansicht",
      content:
        "Titel, Beschreibung und Link zur vollständigen Story – der Fokus für das ausgewählte Arbeitspaket.",
      placement: "left",
      disableBeacon: true,
    },
    {
      target: sel("stories-detail-relations"),
      title: "Zusammenhänge",
      content:
        "Duplikate, Abhängigkeiten, Blockaden und Verwandtes: pro Verknüpfung können Sie Vorschläge bestätigen oder verwerfen.",
      placement: "left",
      disableBeacon: true,
    },
  ];
}

export function getStepsForRoute(
  key: import("./routeKeys").OnboardingRouteKey,
  options: { includeMobileMenuStep: boolean },
): Step[] {
  switch (key) {
    case "route:dashboard":
      return getDashboardSteps(options.includeMobileMenuStep);
    case "route:compliance":
      return getComplianceSteps();
    case "route:stories":
      return getStoryDependenciesSteps();
    default:
      return [];
  }
}
