import type {
  ChatService,
  ChatServiceResponse,
  ChatDataContext,
  BulkChange,
  QueryResultItem,
  EntityType,
} from "./types";
import type { StoryData, JiraTicketData } from "../../data/stories";

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function normalize(text: string): string {
  return text.toLowerCase().replace(/[äöüß]/g, (c) => {
    const map: Record<string, string> = { ä: "ae", ö: "oe", ü: "ue", ß: "ss" };
    return map[c] ?? c;
  });
}

function storyToQueryItem(s: StoryData): QueryResultItem {
  return {
    id: s.id,
    title: s.title,
    type: "story",
    status: s.status,
    priority: s.priority,
    project: s.project,
    effort: s.effort,
  };
}

function ticketToQueryItem(t: JiraTicketData): QueryResultItem {
  return {
    id: t.key,
    title: t.summary,
    type: "jira_ticket",
    status: t.status,
    project: t.project,
  };
}

/* ------------------------------------------------------------------ */
/*  Intent matchers                                                    */
/* ------------------------------------------------------------------ */

interface IntentResult {
  intent: string;
  params: Record<string, string>;
}

const PRIORITY_SYNONYMS: Record<string, string> = {
  hoch: "Hoch",
  high: "Hoch",
  mittel: "Mittel",
  medium: "Mittel",
  niedrig: "Niedrig",
  low: "Niedrig",
};

const STATUS_SYNONYMS_STORY: Record<string, string> = {
  draft: "Draft",
  entwurf: "Draft",
  "in review": "In Review",
  review: "In Review",
  approved: "Approved",
  genehmigt: "Approved",
  "in progress": "In Progress",
  "in bearbeitung": "In Progress",
  done: "Done",
  fertig: "Done",
  abgeschlossen: "Done",
};

const STATUS_SYNONYMS_JIRA: Record<string, string> = {
  "to do": "To Do",
  offen: "To Do",
  "in progress": "In Progress",
  "in bearbeitung": "In Progress",
  done: "Done",
  fertig: "Done",
  abgeschlossen: "Done",
  "in review": "In Review",
  review: "In Review",
};

const EFFORT_SYNONYMS: Record<string, string> = {
  niedrig: "Niedrig",
  gering: "Niedrig",
  low: "Niedrig",
  mittel: "Mittel",
  medium: "Mittel",
  hoch: "Hoch",
  high: "Hoch",
};

function detectIntent(text: string): IntentResult {
  const n = normalize(text);

  // Bulk priority change
  const prioMatch = n.match(
    /(?:setze|aender[en]?|aendere|stell[en]?)\s+(?:die\s+)?(?:prio(?:ritaet)?|priority)\s+(?:von\s+)?(?:allen?\s+)?(.+?)\s+(?:auf|zu|nach)\s+(\w+)/,
  );
  if (prioMatch) {
    return {
      intent: "bulk_priority",
      params: { filter: prioMatch[1].trim(), value: prioMatch[2].trim() },
    };
  }

  // Bulk status change
  const statusMatch = n.match(
    /(?:setze|aender[en]?|aendere|stell[en]?)\s+(?:den\s+)?(?:status)\s+(?:von\s+)?(?:allen?\s+)?(.+?)\s+(?:auf|zu|nach)\s+(.+)/,
  );
  if (statusMatch) {
    return {
      intent: "bulk_status",
      params: { filter: statusMatch[1].trim(), value: statusMatch[2].trim() },
    };
  }

  // Bulk effort change
  const effortMatch = n.match(
    /(?:setze|aender[en]?|aendere|stell[en]?)\s+(?:den\s+)?(?:aufwand|effort)\s+(?:von\s+)?(?:allen?\s+)?(.+?)\s+(?:auf|zu|nach)\s+(\w+)/,
  );
  if (effortMatch) {
    return {
      intent: "bulk_effort",
      params: { filter: effortMatch[1].trim(), value: effortMatch[2].trim() },
    };
  }

  // Search for tickets about a topic
  if (
    n.match(
      /(?:gibt es|existier|find|such|zeig|hast du).*(?:tickets?|stories?|anforderungen?|thema)/,
    ) ||
    n.match(/(?:tickets?|stories?)\s+(?:zu|zum|ueber|fuer|mit)\s+/)
  ) {
    const topicMatch = n.match(
      /(?:zu[mr]?\s+thema|ueber|zu|fuer|mit|bereich)\s+[""„]?([^""\"?]+)/,
    );
    const topic = topicMatch ? topicMatch[1].replace(/[?."'""]/g, "").trim() : "";
    return { intent: "search_topic", params: { topic } };
  }

  // Project status query
  if (n.match(/(?:aktueller?\s+stand|status|uebersicht|zusammenfassung).*(?:projekt|project)/)) {
    const projMatch = n.match(
      /(?:projekt[es]?\s+|project\s+|vom\s+|von\s+|des\s+)[""„]?([^""\"?]+)/,
    );
    const project = projMatch ? projMatch[1].replace(/[?."'""]/g, "").trim() : "";
    return { intent: "project_status", params: { project } };
  }

  // Show all stories/tickets with a filter
  if (n.match(/(?:zeig|list|gib|welche).*(?:alle|saemtliche)?.*(?:stories?|tickets?|user\s*stories?)/)) {
    const filterMatch = n.match(
      /(?:mit|vom?n?\s+|status|prio(?:ritaet)?)\s+[""„]?([^""\"?]+)/,
    );
    const filter = filterMatch ? filterMatch[1].replace(/[?."'""]/g, "").trim() : "";
    return { intent: "list_entities", params: { filter } };
  }

  // Fallback
  return { intent: "unknown", params: {} };
}

/* ------------------------------------------------------------------ */
/*  Filter helpers                                                     */
/* ------------------------------------------------------------------ */

function filterStoriesByText(
  stories: StoryData[],
  filterText: string,
): StoryData[] {
  const n = normalize(filterText);

  // Filter by status
  for (const [key, val] of Object.entries(STATUS_SYNONYMS_STORY)) {
    if (n.includes(key)) return stories.filter((s) => s.status === val);
  }

  // Filter by priority
  for (const [key, val] of Object.entries(PRIORITY_SYNONYMS)) {
    if (n.includes(key)) return stories.filter((s) => s.priority === val);
  }

  // Filter by project name
  const projectFiltered = stories.filter((s) =>
    normalize(s.project).includes(n),
  );
  if (projectFiltered.length > 0) return projectFiltered;

  // Keyword search in title/description/tags
  const keywords = n.split(/\s+/).filter((w) => w.length > 2);
  if (keywords.length === 0) return stories;

  return stories.filter((s) => {
    const blob = normalize(
      `${s.title} ${s.description} ${s.tags.join(" ")} ${s.project}`,
    );
    return keywords.some((kw) => blob.includes(kw));
  });
}

function filterTicketsByText(
  tickets: JiraTicketData[],
  filterText: string,
): JiraTicketData[] {
  const n = normalize(filterText);

  for (const [key, val] of Object.entries(STATUS_SYNONYMS_JIRA)) {
    if (n.includes(key)) return tickets.filter((t) => t.status === val);
  }

  const projectFiltered = tickets.filter((t) =>
    normalize(t.project).includes(n),
  );
  if (projectFiltered.length > 0) return projectFiltered;

  const keywords = n.split(/\s+/).filter((w) => w.length > 2);
  if (keywords.length === 0) return tickets;

  return tickets.filter((t) => {
    const blob = normalize(`${t.summary} ${t.project} ${t.type}`);
    return keywords.some((kw) => blob.includes(kw));
  });
}

/* ------------------------------------------------------------------ */
/*  Response builders                                                  */
/* ------------------------------------------------------------------ */

function buildBulkPriorityResponse(
  ctx: ChatDataContext,
  filter: string,
  rawValue: string,
): ChatServiceResponse {
  const value = PRIORITY_SYNONYMS[normalize(rawValue)] ?? rawValue;
  const matched = filterStoriesByText(ctx.stories, filter);
  const targets = matched.filter((s) => s.priority !== value);

  if (targets.length === 0) {
    return {
      messages: [
        {
          role: "assistant",
          type: "text",
          content: `Ich konnte keine Stories finden, deren Priorität auf "${value}" geändert werden muss. Entweder haben bereits alle den Wert oder der Filter "${filter}" trifft auf keine Stories zu.`,
        },
      ],
    };
  }

  const changes: BulkChange[] = targets.map((s) => ({
    id: s.id,
    title: s.title,
    field: "priority",
    oldValue: s.priority,
    newValue: value,
  }));

  return {
    messages: [
      {
        role: "assistant",
        type: "text",
        content: `Ich habe **${targets.length} Stories** gefunden, deren Priorität geändert werden kann. Hier ist die Vorschau:`,
      },
      {
        role: "assistant",
        type: "bulk_preview",
        content: "",
        metadata: {
          entityType: "story" as EntityType,
          field: "priority",
          newValue: value,
          changes,
        },
      },
    ],
    pendingOperation: {
      entityType: "story",
      field: "priority",
      newValue: value,
      changes,
    },
  };
}

function buildBulkStatusResponse(
  ctx: ChatDataContext,
  filter: string,
  rawValue: string,
): ChatServiceResponse {
  const n = normalize(rawValue);
  const storyValue = STATUS_SYNONYMS_STORY[n];

  // Try stories first
  if (storyValue) {
    const matched = filterStoriesByText(ctx.stories, filter);
    const targets = matched.filter((s) => s.status !== storyValue);

    if (targets.length > 0) {
      const changes: BulkChange[] = targets.map((s) => ({
        id: s.id,
        title: s.title,
        field: "status",
        oldValue: s.status,
        newValue: storyValue,
      }));

      return {
        messages: [
          {
            role: "assistant",
            type: "text",
            content: `Ich habe **${targets.length} Stories** gefunden, deren Status geändert werden kann:`,
          },
          {
            role: "assistant",
            type: "bulk_preview",
            content: "",
            metadata: {
              entityType: "story" as EntityType,
              field: "status",
              newValue: storyValue,
              changes,
            },
          },
        ],
        pendingOperation: {
          entityType: "story",
          field: "status",
          newValue: storyValue,
          changes,
        },
      };
    }
  }

  return {
    messages: [
      {
        role: "assistant",
        type: "text",
        content: `Ich konnte keine passenden Einträge finden, deren Status geändert werden muss. Versuche es mit einem anderen Filter.`,
      },
    ],
  };
}

function buildBulkEffortResponse(
  ctx: ChatDataContext,
  filter: string,
  rawValue: string,
): ChatServiceResponse {
  const value = EFFORT_SYNONYMS[normalize(rawValue)] ?? rawValue;
  const matched = filterStoriesByText(ctx.stories, filter);
  const targets = matched.filter((s) => s.effort !== value);

  if (targets.length === 0) {
    return {
      messages: [
        {
          role: "assistant",
          type: "text",
          content: `Keine Stories gefunden, deren Aufwand geändert werden muss.`,
        },
      ],
    };
  }

  const changes: BulkChange[] = targets.map((s) => ({
    id: s.id,
    title: s.title,
    field: "effort",
    oldValue: s.effort,
    newValue: value,
  }));

  return {
    messages: [
      {
        role: "assistant",
        type: "text",
        content: `**${targets.length} Stories** gefunden, deren Aufwand angepasst werden kann:`,
      },
      {
        role: "assistant",
        type: "bulk_preview",
        content: "",
        metadata: {
          entityType: "story" as EntityType,
          field: "effort",
          newValue: value,
          changes,
        },
      },
    ],
    pendingOperation: {
      entityType: "story",
      field: "effort",
      newValue: value,
      changes,
    },
  };
}

function buildSearchResponse(
  ctx: ChatDataContext,
  topic: string,
): ChatServiceResponse {
  if (!topic) {
    return {
      messages: [
        {
          role: "assistant",
          type: "text",
          content:
            'Zu welchem Thema soll ich suchen? Gib mir ein Stichwort, z.B. \u201EGibt es Tickets zum Thema Authentifizierung?\u201C',
        },
      ],
    };
  }

  const keywords = normalize(topic).split(/\s+/).filter((w) => w.length > 2);
  const matchStory = (s: StoryData) => {
    const blob = normalize(`${s.title} ${s.description} ${s.tags.join(" ")} ${s.role} ${s.goal}`);
    return keywords.some((kw) => blob.includes(kw));
  };
  const matchTicket = (t: JiraTicketData) => {
    const blob = normalize(`${t.summary} ${t.type} ${t.project}`);
    return keywords.some((kw) => blob.includes(kw));
  };

  const stories = ctx.stories.filter(matchStory).map(storyToQueryItem);
  const tickets = ctx.jiraTickets.filter(matchTicket).map(ticketToQueryItem);
  const items = [...stories, ...tickets];

  if (items.length === 0) {
    return {
      messages: [
        {
          role: "assistant",
          type: "text",
          content: `Ich konnte keine Tickets oder Stories zum Thema „${topic}" finden. Versuche es mit anderen Stichwörtern.`,
        },
      ],
    };
  }

  return {
    messages: [
      {
        role: "assistant",
        type: "text",
        content: `Ich habe **${items.length} relevante Einträge** zum Thema „${topic}" gefunden:`,
      },
      {
        role: "assistant",
        type: "query_result",
        content: "",
        metadata: {
          summary: `${stories.length} User Stories und ${tickets.length} Jira-Tickets gefunden.`,
          items,
        },
      },
    ],
  };
}

function buildProjectStatusResponse(
  ctx: ChatDataContext,
  project: string,
): ChatServiceResponse {
  if (!project) {
    return {
      messages: [
        {
          role: "assistant",
          type: "text",
          content: 'Welches Projekt meinst du? Gib mir den Projektnamen, z.B. \u201EAktueller Stand vom Automobil-Projekt\u201C.',
        },
      ],
    };
  }

  const n = normalize(project);
  const matchedStories = ctx.stories.filter((s) =>
    normalize(s.project).includes(n),
  );
  const matchedTickets = ctx.jiraTickets.filter((t) =>
    normalize(t.project).includes(n),
  );

  if (matchedStories.length === 0 && matchedTickets.length === 0) {
    return {
      messages: [
        {
          role: "assistant",
          type: "text",
          content: `Kein Projekt mit dem Namen „${project}" gefunden. Verfügbare Projekte: ${[...new Set([...ctx.stories.map((s) => s.project), ...ctx.jiraTickets.map((t) => t.project)])].join(", ")}.`,
        },
      ],
    };
  }

  const projName =
    matchedStories[0]?.project ?? matchedTickets[0]?.project ?? project;
  const statusCounts = {
    stories: matchedStories.reduce(
      (acc, s) => {
        acc[s.status] = (acc[s.status] ?? 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    ),
    tickets: matchedTickets.reduce(
      (acc, t) => {
        acc[t.status] = (acc[t.status] ?? 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    ),
  };

  const storyStatusLine = Object.entries(statusCounts.stories)
    .map(([k, v]) => `${k}: ${v}`)
    .join(", ");
  const ticketStatusLine = Object.entries(statusCounts.tickets)
    .map(([k, v]) => `${k}: ${v}`)
    .join(", ");

  const avgCompliance =
    matchedStories.length > 0
      ? Math.round(
          matchedStories.reduce((sum, s) => sum + s.complianceScore, 0) /
            matchedStories.length,
        )
      : 0;

  let summary = `**Projekt: ${projName}**\n\n`;
  summary += `**${matchedStories.length} User Stories:** ${storyStatusLine || "keine"}\n`;
  summary += `**${matchedTickets.length} Jira-Tickets:** ${ticketStatusLine || "keine"}\n`;
  if (matchedStories.length > 0)
    summary += `**Durchschn. Compliance-Score:** ${avgCompliance}%`;

  const items = [
    ...matchedStories.map(storyToQueryItem),
    ...matchedTickets.map(ticketToQueryItem),
  ];

  return {
    messages: [
      { role: "assistant", type: "text", content: summary },
      {
        role: "assistant",
        type: "query_result",
        content: "",
        metadata: {
          summary: `${matchedStories.length} Stories, ${matchedTickets.length} Tickets`,
          items,
        },
      },
    ],
  };
}

function buildListResponse(
  ctx: ChatDataContext,
  filter: string,
): ChatServiceResponse {
  const stories = filterStoriesByText(ctx.stories, filter).map(storyToQueryItem);
  const tickets = filterTicketsByText(ctx.jiraTickets, filter).map(ticketToQueryItem);
  const items = [...stories, ...tickets];

  if (items.length === 0) {
    return {
      messages: [
        {
          role: "assistant",
          type: "text",
          content: `Keine Einträge gefunden für den Filter „${filter}".`,
        },
      ],
    };
  }

  return {
    messages: [
      {
        role: "assistant",
        type: "text",
        content: `Hier sind **${items.length} Einträge** ${filter ? `für „${filter}"` : "insgesamt"}:`,
      },
      {
        role: "assistant",
        type: "query_result",
        content: "",
        metadata: {
          summary: `${stories.length} Stories, ${tickets.length} Jira-Tickets`,
          items,
        },
      },
    ],
  };
}

function buildFallbackResponse(): ChatServiceResponse {
  return {
    messages: [
      {
        role: "assistant",
        type: "text",
        content:
          "Das habe ich leider nicht verstanden. Ich kann dir bei folgenden Dingen helfen:",
      },
      {
        role: "assistant",
        type: "suggestion_chips",
        content: "",
        metadata: {
          chips: [
            {
              label: "Priorität ändern",
              message: "Setze die Priorität aller Draft-Stories auf Hoch",
            },
            {
              label: "Tickets suchen",
              message:
                "Gibt es Tickets zum Thema Authentifizierung?",
            },
            {
              label: "Projektstatus",
              message:
                "Was ist der aktuelle Stand vom Automobil-Projekt?",
            },
            {
              label: "Stories auflisten",
              message: "Zeige alle Stories mit Status In Progress",
            },
          ],
        },
      },
    ],
  };
}

/* ------------------------------------------------------------------ */
/*  Service implementation                                             */
/* ------------------------------------------------------------------ */

export class SimulatedChatService implements ChatService {
  async processMessage(
    userMessage: string,
    context: ChatDataContext,
  ): Promise<ChatServiceResponse> {
    // Simulate network delay
    await new Promise((r) => setTimeout(r, 800 + Math.random() * 1200));

    const { intent, params } = detectIntent(userMessage);

    switch (intent) {
      case "bulk_priority":
        return buildBulkPriorityResponse(context, params.filter, params.value);
      case "bulk_status":
        return buildBulkStatusResponse(context, params.filter, params.value);
      case "bulk_effort":
        return buildBulkEffortResponse(context, params.filter, params.value);
      case "search_topic":
        return buildSearchResponse(context, params.topic);
      case "project_status":
        return buildProjectStatusResponse(context, params.project);
      case "list_entities":
        return buildListResponse(context, params.filter);
      default:
        return buildFallbackResponse();
    }
  }
}
