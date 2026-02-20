import type {
  ChatService,
  ChatServiceResponse,
  ChatDataContext,
  BulkChange,
  QueryResultItem,
} from "./types";
import type { Story } from "../../data/stories";

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function normalize(text: string): string {
  return text.toLowerCase().replace(/[äöüß]/g, (c) => {
    const map: Record<string, string> = { "\u00e4": "ae", "\u00f6": "oe", "\u00fc": "ue", "\u00df": "ss" };
    return map[c] ?? c;
  });
}

function storyToQueryItem(s: Story): QueryResultItem {
  return {
    id: s.id,
    title: s.title,
    type: s.type,
    status: s.status,
    priority: s.priority,
    project: s.project,
    effort: s.effort,
    source: s.source,
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

const STATUS_SYNONYMS: Record<string, string> = {
  draft: "Draft",
  entwurf: "Draft",
  "to do": "To Do",
  offen: "To Do",
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

  const prioMatch = n.match(
    /(?:setze|aender[en]?|aendere|stell[en]?)\s+(?:die\s+)?(?:prio(?:ritaet)?|priority)\s+(?:von\s+)?(?:allen?\s+)?(.+?)\s+(?:auf|zu|nach)\s+(\w+)/,
  );
  if (prioMatch) {
    return {
      intent: "bulk_priority",
      params: { filter: prioMatch[1].trim(), value: prioMatch[2].trim() },
    };
  }

  const statusMatch = n.match(
    /(?:setze|aender[en]?|aendere|stell[en]?)\s+(?:den\s+)?(?:status)\s+(?:von\s+)?(?:allen?\s+)?(.+?)\s+(?:auf|zu|nach)\s+(.+)/,
  );
  if (statusMatch) {
    return {
      intent: "bulk_status",
      params: { filter: statusMatch[1].trim(), value: statusMatch[2].trim() },
    };
  }

  const effortMatch = n.match(
    /(?:setze|aender[en]?|aendere|stell[en]?)\s+(?:den\s+)?(?:aufwand|effort)\s+(?:von\s+)?(?:allen?\s+)?(.+?)\s+(?:auf|zu|nach)\s+(\w+)/,
  );
  if (effortMatch) {
    return {
      intent: "bulk_effort",
      params: { filter: effortMatch[1].trim(), value: effortMatch[2].trim() },
    };
  }

  if (
    n.match(
      /(?:gibt es|existier|find|such|zeig|hast du).*(?:tickets?|stories?|anforderungen?|thema)/,
    ) ||
    n.match(/(?:tickets?|stories?)\s+(?:zu|zum|ueber|fuer|mit)\s+/)
  ) {
    const topicMatch = n.match(
      /(?:zu[mr]?\s+thema|ueber|zu|fuer|mit|bereich)\s+["\u201E\u201C]?([^"\u201E\u201C?]+)/,
    );
    const topic = topicMatch ? topicMatch[1].replace(/[?."'\u201E\u201C]/g, "").trim() : "";
    return { intent: "search_topic", params: { topic } };
  }

  if (n.match(/(?:aktueller?\s+stand|status|uebersicht|zusammenfassung).*(?:projekt|project)/)) {
    const projMatch = n.match(
      /(?:projekt[es]?\s+|project\s+|vom\s+|von\s+|des\s+)["\u201E\u201C]?([^"\u201E\u201C?]+)/,
    );
    const project = projMatch ? projMatch[1].replace(/[?."'\u201E\u201C]/g, "").trim() : "";
    return { intent: "project_status", params: { project } };
  }

  if (n.match(/(?:zeig|list|gib|welche).*(?:alle|saemtliche)?.*(?:stories?|tickets?|user\s*stories?)/)) {
    const filterMatch = n.match(
      /(?:mit|vom?n?\s+|status|prio(?:ritaet)?)\s+["\u201E\u201C]?([^"\u201E\u201C?]+)/,
    );
    const filter = filterMatch ? filterMatch[1].replace(/[?."'\u201E\u201C]/g, "").trim() : "";
    return { intent: "list_entities", params: { filter } };
  }

  return { intent: "unknown", params: {} };
}

/* ------------------------------------------------------------------ */
/*  Filter helpers                                                     */
/* ------------------------------------------------------------------ */

function filterStoriesByText(stories: Story[], filterText: string): Story[] {
  const n = normalize(filterText);

  for (const [key, val] of Object.entries(STATUS_SYNONYMS)) {
    if (n.includes(key)) return stories.filter((s) => s.status === val);
  }

  for (const [key, val] of Object.entries(PRIORITY_SYNONYMS)) {
    if (n.includes(key)) return stories.filter((s) => s.priority === val);
  }

  const projectFiltered = stories.filter((s) =>
    normalize(s.project).includes(n),
  );
  if (projectFiltered.length > 0) return projectFiltered;

  const keywords = n.split(/\s+/).filter((w) => w.length > 2);
  if (keywords.length === 0) return stories;

  return stories.filter((s) => {
    const blob = normalize(
      `${s.title} ${s.description} ${(s.tags || []).join(" ")} ${s.project}`,
    );
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
          content: `Ich konnte keine Stories finden, deren Priorit\u00e4t auf \u201E${value}\u201C ge\u00e4ndert werden muss. Entweder haben bereits alle den Wert oder der Filter \u201E${filter}\u201C trifft auf keine Stories zu.`,
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
        content: `Ich habe **${targets.length} Stories** gefunden, deren Priorit\u00e4t ge\u00e4ndert werden kann. Hier ist die Vorschau:`,
      },
      {
        role: "assistant",
        type: "bulk_preview",
        content: "",
        metadata: { field: "priority", newValue: value, changes },
      },
    ],
    pendingOperation: { field: "priority", newValue: value, changes },
  };
}

function buildBulkStatusResponse(
  ctx: ChatDataContext,
  filter: string,
  rawValue: string,
): ChatServiceResponse {
  const n = normalize(rawValue);
  const value = STATUS_SYNONYMS[n];

  if (value) {
    const matched = filterStoriesByText(ctx.stories, filter);
    const targets = matched.filter((s) => s.status !== value);

    if (targets.length > 0) {
      const changes: BulkChange[] = targets.map((s) => ({
        id: s.id,
        title: s.title,
        field: "status",
        oldValue: s.status,
        newValue: value,
      }));

      return {
        messages: [
          {
            role: "assistant",
            type: "text",
            content: `Ich habe **${targets.length} Stories** gefunden, deren Status ge\u00e4ndert werden kann:`,
          },
          {
            role: "assistant",
            type: "bulk_preview",
            content: "",
            metadata: { field: "status", newValue: value, changes },
          },
        ],
        pendingOperation: { field: "status", newValue: value, changes },
      };
    }
  }

  return {
    messages: [
      {
        role: "assistant",
        type: "text",
        content: "Ich konnte keine passenden Eintr\u00e4ge finden, deren Status ge\u00e4ndert werden muss. Versuche es mit einem anderen Filter.",
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
          content: "Keine Stories gefunden, deren Aufwand ge\u00e4ndert werden muss.",
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
        metadata: { field: "effort", newValue: value, changes },
      },
    ],
    pendingOperation: { field: "effort", newValue: value, changes },
  };
}

function buildSearchResponse(ctx: ChatDataContext, topic: string): ChatServiceResponse {
  if (!topic) {
    return {
      messages: [
        {
          role: "assistant",
          type: "text",
          content: 'Zu welchem Thema soll ich suchen? Gib mir ein Stichwort, z.B. \u201EGibt es Stories zum Thema Authentifizierung?\u201C',
        },
      ],
    };
  }

  const keywords = normalize(topic).split(/\s+/).filter((w) => w.length > 2);
  const matchFn = (s: Story) => {
    const blob = normalize(`${s.title} ${s.description} ${(s.tags || []).join(" ")} ${s.role || ""} ${s.goal || ""}`);
    return keywords.some((kw) => blob.includes(kw));
  };

  const items = ctx.stories.filter(matchFn).map(storyToQueryItem);

  if (items.length === 0) {
    return {
      messages: [
        {
          role: "assistant",
          type: "text",
          content: `Ich konnte keine Stories zum Thema \u201E${topic}\u201C finden. Versuche es mit anderen Stichw\u00f6rtern.`,
        },
      ],
    };
  }

  const aiCount = items.filter((i) => i.source === "ai-generated").length;
  const jiraCount = items.filter((i) => i.source === "jira-import").length;

  return {
    messages: [
      {
        role: "assistant",
        type: "text",
        content: `Ich habe **${items.length} relevante Stories** zum Thema \u201E${topic}\u201C gefunden:`,
      },
      {
        role: "assistant",
        type: "query_result",
        content: "",
        metadata: {
          summary: `${aiCount} AI-generiert, ${jiraCount} Jira-Import`,
          items,
        },
      },
    ],
  };
}

function buildProjectStatusResponse(ctx: ChatDataContext, project: string): ChatServiceResponse {
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
  const matched = ctx.stories.filter((s) => normalize(s.project).includes(n));

  if (matched.length === 0) {
    const projects = [...new Set(ctx.stories.map((s) => s.project))];
    return {
      messages: [
        {
          role: "assistant",
          type: "text",
          content: `Kein Projekt mit dem Namen \u201E${project}\u201C gefunden. Verf\u00fcgbare Projekte: ${projects.join(", ")}.`,
        },
      ],
    };
  }

  const projName = matched[0].project;
  const statusCounts = matched.reduce(
    (acc, s) => {
      acc[s.status] = (acc[s.status] ?? 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );
  const statusLine = Object.entries(statusCounts).map(([k, v]) => `${k}: ${v}`).join(", ");

  const withCompliance = matched.filter((s) => s.complianceScore != null);
  const avgCompliance = withCompliance.length > 0
    ? Math.round(withCompliance.reduce((sum, s) => sum + (s.complianceScore || 0), 0) / withCompliance.length)
    : 0;

  let summary = `**Projekt: ${projName}**\n\n`;
  summary += `**${matched.length} Stories:** ${statusLine}\n`;
  if (withCompliance.length > 0) summary += `**Durchschn. Compliance-Score:** ${avgCompliance}%`;

  return {
    messages: [
      { role: "assistant", type: "text", content: summary },
      {
        role: "assistant",
        type: "query_result",
        content: "",
        metadata: {
          summary: `${matched.length} Stories im Projekt`,
          items: matched.map(storyToQueryItem),
        },
      },
    ],
  };
}

function buildListResponse(ctx: ChatDataContext, filter: string): ChatServiceResponse {
  const items = filterStoriesByText(ctx.stories, filter).map(storyToQueryItem);

  if (items.length === 0) {
    return {
      messages: [
        {
          role: "assistant",
          type: "text",
          content: `Keine Eintr\u00e4ge gefunden f\u00fcr den Filter \u201E${filter}\u201C.`,
        },
      ],
    };
  }

  return {
    messages: [
      {
        role: "assistant",
        type: "text",
        content: `Hier sind **${items.length} Stories** ${filter ? `f\u00fcr \u201E${filter}\u201C` : "insgesamt"}:`,
      },
      {
        role: "assistant",
        type: "query_result",
        content: "",
        metadata: {
          summary: `${items.length} Stories`,
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
        content: "Das habe ich leider nicht verstanden. Ich kann dir bei folgenden Dingen helfen:",
      },
      {
        role: "assistant",
        type: "suggestion_chips",
        content: "",
        metadata: {
          chips: [
            { label: "Priorit\u00e4t \u00e4ndern", message: "Setze die Priorit\u00e4t aller Draft-Stories auf Hoch" },
            { label: "Stories suchen", message: "Gibt es Stories zum Thema Authentifizierung?" },
            { label: "Projektstatus", message: "Was ist der aktuelle Stand vom Automobil-Projekt?" },
            { label: "Stories auflisten", message: "Zeige alle Stories mit Status In Progress" },
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
