import type { Step } from "react-joyride";
import { hasCustomerJourneyNavCookie } from "./navTourConfig";

function sel(id: string): string {
  return `[data-tour="${id}"]`;
}

function navOverviewContent(): string {
  const cj = hasCustomerJourneyNavCookie()
    ? "\n\nCustomer Journey · End-to-End-Sicht: von Dokumenten über Stories bis zu Touchpoints – nützlich für Reviews und Management-Summary.\n"
    : "";
  return (
    "Oben links sehen Sie Mandant und Produkt. Über das Hauptmenü wechseln Sie den Arbeitsbereich – jeweils mit eigenem Fokus:\n\n" +
    "Dashboard · Kennzahlen, Trends und Schnellzugriff auf Ihre Projekte im Workspace.\n\n" +
    "Story-Generator · Dokumente und Notizen hochladen, die KI prüft und bereinigt, dann User Stories erzeugen, mit dem Backlog abgleichen und speichern.\n\n" +
    "Compliance Check · Auswertungsbereich, Dokumente prüfen, Analyse sowie Regelwerk inkl. Verlauf; Befunde bearbeiten und exportieren.\n\n" +
    "Story-Abhängigkeiten · Vorgänge filtern; Ticket-Links und erkannte Vorschläge getrennt einsehen, Vorschläge übernehmen oder ignorieren.\n\n" +
    "Projekte · Projekte im Workspace listen, Teams und Versionen in der Detailansicht pflegen." +
    cj +
    "\n\nUnten: Einstellungen sowie Hilfe & Support – dort können Sie die Tour der aktuellen Seite zurücksetzen und neu starten."
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
  "Der Workspace ist Ihre Kundenorganisation (z. B. ein OEM). Alle Projekte, Stories und Prüfungen beziehen sich immer auf genau diesen Kontext.\n\n" +
  "Wechseln Sie hier, wenn Sie Daten einer anderen Organisation einsehen oder daran arbeiten möchten – Kennzahlen und Karten passen sich danach an.";

const EXPORT =
  "Über Export stellen Sie Inhalte aus dem aktuellen Workspace zusammen (z. B. Stories, Berichte) und laden sie als Datei herunter.\n\n" +
  "Typisch für Abstimmung mit Stakeholdern, Audits oder Offline-Reviews – ohne die Quelldaten im Tool zu verändern.";

const PROJECTS_CARD =
  "Diese Karte fasst Ihre Projekte im Workspace kurz zusammen: Status, Teambezug und direkter Einstieg.\n\n" +
  "Von hier aus springen Sie zur vollständigen Projektliste (z. B. „Alle anzeigen“ oder Menüpunkt Projekte), um Details, Team und Historie zu bearbeiten.";

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
          "Auf kleineren Viewports öffnen Sie hier die gleiche Navigation wie in der Seitenleiste.\n\n" +
          "Im nächsten Schritt erfahren Sie, wofür jeder Menüpunkt gedacht ist und welche Aufgaben Sie dort typischerweise erledigen.",
        placement: "bottom",
        disableBeacon: true,
      },
      nav,
      ...tail,
    ];
  }

  return [nav, ...tail];
}

/** Story-Abhängigkeiten (`/stories`): Projekt-Trigger, Filter, Liste, Detail. */
export function getStoryDependenciesSteps(): Step[] {
  return [
    {
      target: sel("stories-project-filter"),
      title: "Projekt-Scope",
      content:
        "Legen Sie fest, für welches Projekt Sie Vorgänge sehen – oder schalten Sie auf „Alle Projekte“, um workspace-weit zu arbeiten.\n\n" +
        "Liste, Kennzahlen und Detail beziehen sich dann konsistent auf diese Auswahl; praktisch für Reviews pro Lieferobjekt oder für Querschnitts-Analysen.",
      placement: "bottom-start",
      disableBeacon: true,
      spotlightPadding: 6,
    },
    {
      target: sel("stories-filters"),
      title: "Suche & Filter",
      content:
        "Eingrenzen nach Text, Typ, Quelle und Art der Beziehung. Darunter helfen Quick-Filter und Optionen wie „Mit Verknüpfungen“, schnell relevante Tickets zu finden.\n\n" +
        "Nutzen Sie die Kombination, um z. B. nur blockierte oder stark vernetzte Vorgänge zu prüfen.",
      placement: "bottom",
      disableBeacon: true,
    },
    {
      target: sel("stories-story-list"),
      title: "Vorgangsliste",
      content:
        "Die Liste funktioniert wie ein kompakter Issue-Navigator: Sie wählen einen Vorgang, das Detail aktualisiert sich sofort.\n\n" +
        "So können Sie der Reihe nach durchsetzen, ohne die Kontextspalte zu verlieren – etwa bei Abnahmen oder Aufräum-Sessions.",
      placement: "right",
      disableBeacon: true,
    },
    {
      target: sel("stories-detail-hero"),
      title: "Detailansicht",
      content:
        "Kopfbereich mit Titel, Kurzbeschreibung und Sprung zur vollständigen Story (z. B. in Jira).\n\n" +
        "Damit klären Sie schnell, worum es im Ticket geht, bevor Sie sich den Beziehungen zuwenden.",
      placement: "left",
      disableBeacon: true,
    },
    {
      target: sel("stories-detail-relations"),
      title: "Zusammenhänge",
      content:
        "Verknüpfungen aus dem Ticket-System sind faktische Links; Vorschläge (Regeln/KI) stehen separat und tragen ein Konfidenz-Badge.\n\n" +
        "Vorschläge können Sie übernehmen oder ignorieren — ignorierte Einträge verschwinden aus der Liste.",
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
    case "route:guidelines":
      return [];
    case "route:stories":
      return getStoryDependenciesSteps();
    case "route:story-generator":
      return [];
    default:
      return [];
  }
}
