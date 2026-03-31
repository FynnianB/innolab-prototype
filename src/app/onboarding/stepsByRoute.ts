import type { Step } from "react-joyride";

function sel(id: string): string {
  return `[data-tour="${id}"]`;
}

/** Dashboard: optional mobiler Menü-Schritt, Navigation, Workspace, Suche, Export, Projekte, Aktivitäten. */
export function getDashboardSteps(includeMobileMenuStep: boolean): Step[] {
  const steps: Step[] = [];

  if (includeMobileMenuStep) {
    steps.push({
      target: sel("topbar-mobile-menu"),
      title: "Navigation auf dem Smartphone",
      content:
        "Tippen Sie hier, um die Seitenleiste zu öffnen. Dort erreichen Sie Dashboard, Story Generator, Projekte und mehr.",
      placement: "bottom",
      disableBeacon: true,
    });
  }

  steps.push(
    {
      target: sel("nav-main"),
      title: "Hauptnavigation",
      content:
        "Wechseln Sie zwischen den Bereichen der App. Alles Wichtige — von der Übersicht bis zu Compliance und Projekten — startet hier.",
      placement: "right",
      disableBeacon: true,
    },
    {
      target: sel("topbar-workspace"),
      title: "Workspace",
      content:
        "Projekte, Stories und Suchergebnisse hängen vom gewählten Workspace ab. Wechseln Sie den Kontext, wenn Sie für ein anderes Team oder Mandant arbeiten.",
      placement: "bottom",
      disableBeacon: true,
    },
    {
      target: sel("topbar-search"),
      title: "Globale Suche",
      content:
        "Schnell zu Stories oder Projekten im aktuellen Workspace: Tippen Sie Titel oder IDs. Tastenkürzel: Strg+K (bzw. Cmd+K).",
      placement: "bottom",
      disableBeacon: true,
    },
    {
      target: sel("topbar-export"),
      title: "Export",
      content:
        "Hier exportieren Sie Inhalte (z. B. Stories) für Berichte oder Weitergabe — je nach gewähltem Umfang im Dialog.",
      placement: "bottom",
      disableBeacon: true,
    },
    {
      target: sel("dashboard-projects-card"),
      title: "Ihre Projekte",
      content:
        "Diese Liste zeigt Projekte, in deren Team Sie sind. Über „Alle anzeigen“ oder die Seitenleiste öffnen Sie die vollständige Projektübersicht.",
      placement: "top",
      disableBeacon: true,
    },
    {
      target: sel("dashboard-activity-card"),
      title: "Letzte Aktivitäten",
      content:
        "Kurzüberblick, was sich in diesem Workspace zuletzt getan hat — ergänzend zu Ihren Projekten in der linken Spalte.",
      placement: "top",
      disableBeacon: true,
    },
  );

  return steps;
}

export function getProjectsListSteps(): Step[] {
  return [
    {
      target: sel("projects-list-search"),
      title: "Projekte durchsuchen",
      content:
        "Filtern Sie die Karten nach Name oder Beschreibung. Klicken Sie eine Karte, um Details, Stories und das Team zu öffnen.",
      placement: "bottom",
      disableBeacon: true,
    },
    {
      target: sel("projects-list-grid"),
      title: "Projektkarten",
      content:
        "Jede Karte fasst Status, Stories und Team-Kürzel zusammen. Von hier springen Sie ins Projekt.",
      placement: "top",
      disableBeacon: true,
    },
  ];
}

export function getProjectsDetailSteps(): Step[] {
  return [
    {
      target: sel("projects-detail-tabs"),
      title: "Projekt-Bereiche",
      content:
        "Übersicht und Versionshistorie fassen Status und Änderungen zusammen. Der Tab Team ist zentral für Ihre Zuordnung zum Projekt.",
      placement: "bottom",
      disableBeacon: true,
    },
    {
      target: sel("projects-detail-tab-team"),
      title: "Team",
      content:
        "Hier sehen Sie alle Projektmitglieder, können Kolleg:innen hinzufügen oder entfernen und sich selbst zum Team hinzufügen. Nur wenn Sie im Team sind, erscheint das Projekt unter „Ihre Projekte“ auf dem Dashboard.",
      placement: "bottom",
      disableBeacon: true,
    },
  ];
}

export function getStepsForRoute(
  key: OnboardingRouteKey,
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
