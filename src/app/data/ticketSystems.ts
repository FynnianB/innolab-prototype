/**
 * Ticket-/Backlog-Tools pro Workspace (Jira, Asana, …).
 * UI-Texte und Prototyp-Labels — keine echten API-Clients.
 */

export type TicketSystemId =
  | "jira"
  | "asana"
  | "azure_devops"
  | "linear"
  | "shortcut"
  | "none";

export interface TicketSystemDefinition {
  id: TicketSystemId;
  /** Vollständiger Produktname */
  name: string;
  /** Stepper / kompakte UI */
  shortName: string;
  /** z. B. „Jira-Abgleich“ */
  compareStepLabel: string;
  /** Überschrift auf der Vergleichsseite */
  compareScreenTitle: string;
  /** Plural für Fließtext („bestehende …“) */
  ticketsPlural: string;
  singular: string;
  /** Export-Dialog / Automation */
  exportAutomateTitle: string;
  exportSuccessNoun: string;
  /** Formular: Ziel-Board/Projekt */
  targetProjectLabel: string;
  /** Prototyp-Keys (BMW-401 o. Ä.) */
  keyPrefixPlaceholder: string;
}

export const TICKET_SYSTEM_DEFINITIONS: TicketSystemDefinition[] = [
  {
    id: "jira",
    name: "Jira",
    shortName: "Jira",
    compareStepLabel: "Jira-Abgleich",
    compareScreenTitle: "Jira-Backlog-Abgleich",
    ticketsPlural: "Jira-Tickets",
    singular: "Jira-Ticket",
    exportAutomateTitle: "Jira-Export automatisieren",
    exportSuccessNoun: "Jira-Tickets",
    targetProjectLabel: "Jira-Projekt",
    keyPrefixPlaceholder: "BMW",
  },
  {
    id: "asana",
    name: "Asana",
    shortName: "Asana",
    compareStepLabel: "Asana-Abgleich",
    compareScreenTitle: "Asana-Backlog-Abgleich",
    ticketsPlural: "Asana-Aufgaben",
    singular: "Asana-Aufgabe",
    exportAutomateTitle: "Asana-Export automatisieren",
    exportSuccessNoun: "Asana-Aufgaben",
    targetProjectLabel: "Asana-Projekt / Bereich",
    keyPrefixPlaceholder: "ASANA",
  },
  {
    id: "azure_devops",
    name: "Azure DevOps",
    shortName: "Azure",
    compareStepLabel: "Azure Boards-Abgleich",
    compareScreenTitle: "Azure Boards-Abgleich",
    ticketsPlural: "Work Items",
    singular: "Work Item",
    exportAutomateTitle: "Azure Boards-Export automatisieren",
    exportSuccessNoun: "Work Items",
    targetProjectLabel: "Azure DevOps-Projekt",
    keyPrefixPlaceholder: "ADO",
  },
  {
    id: "linear",
    name: "Linear",
    shortName: "Linear",
    compareStepLabel: "Linear-Abgleich",
    compareScreenTitle: "Linear-Backlog-Abgleich",
    ticketsPlural: "Linear-Issues",
    singular: "Linear-Issue",
    exportAutomateTitle: "Linear-Export automatisieren",
    exportSuccessNoun: "Linear-Issues",
    targetProjectLabel: "Linear-Team / Projekt",
    keyPrefixPlaceholder: "LIN",
  },
  {
    id: "shortcut",
    name: "Shortcut",
    shortName: "Shortcut",
    compareStepLabel: "Shortcut-Abgleich",
    compareScreenTitle: "Shortcut-Backlog-Abgleich",
    ticketsPlural: "Stories (Shortcut)",
    singular: "Story",
    exportAutomateTitle: "Shortcut-Export automatisieren",
    exportSuccessNoun: "Shortcut-Stories",
    targetProjectLabel: "Shortcut-Workspace",
    keyPrefixPlaceholder: "SC",
  },
  {
    id: "none",
    name: "Ohne Tool-Anbindung",
    shortName: "Backlog",
    compareStepLabel: "Backlog-Abgleich",
    compareScreenTitle: "Backlog-Abgleich",
    ticketsPlural: "Backlog-Einträgen",
    singular: "Eintrag",
    exportAutomateTitle: "Backlog-Export vorbereiten",
    exportSuccessNoun: "Einträge",
    targetProjectLabel: "Ziel (CSV / manuell)",
    keyPrefixPlaceholder: "ITEM",
  },
];

export const TICKET_SYSTEM_BY_ID: Record<
  TicketSystemId,
  TicketSystemDefinition
> = Object.fromEntries(
  TICKET_SYSTEM_DEFINITIONS.map((d) => [d.id, d]),
) as Record<TicketSystemId, TicketSystemDefinition>;

export function getTicketSystem(id: TicketSystemId): TicketSystemDefinition {
  return TICKET_SYSTEM_BY_ID[id] ?? TICKET_SYSTEM_BY_ID.jira;
}

export function defaultTicketSystemId(): TicketSystemId {
  return "jira";
}
