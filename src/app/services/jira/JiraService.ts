import type { TicketRelation, Story } from "../../data/stories";

export interface JiraConnectionInput {
  baseUrl: string;
  projectKeys: string[];
  importScope?: "selected" | "all";
  email: string;
  apiToken: string;
}

export interface JiraImportOptions {
  updatedSince?: string;
  knownIssueIds?: string[];
  signal?: AbortSignal;
  onDebugLog?: (message: string) => void;
}

export interface JiraImportResult {
  stories: Story[];
  relations: TicketRelation[];
  fetchedIssueCount: number;
  touchedIssueIds: string[];
  isIncremental: boolean;
}

interface JiraIssueType {
  name?: string;
  inward?: string;
  outward?: string;
}

interface JiraIssueRef {
  key?: string;
}

interface JiraIssueLink {
  type?: JiraIssueType;
  inwardIssue?: JiraIssueRef;
  outwardIssue?: JiraIssueRef;
}

interface JiraIssueFields {
  summary?: string;
  description?: unknown;
  status?: { name?: string };
  issuetype?: { name?: string };
  priority?: { name?: string };
  assignee?: { displayName?: string } | null;
  project?: { name?: string; key?: string };
  labels?: string[];
  issuelinks?: JiraIssueLink[];
  updated?: string;
  created?: string;
  customfield_10016?: unknown;
  customfield_10020?: unknown;
}

interface JiraIssue {
  id?: string;
  key?: string;
  fields?: JiraIssueFields;
}

interface JiraSearchResponse {
  issues?: JiraIssue[];
  nextPageToken?: string;
  isLast?: boolean;
}

function normalizeBaseUrl(baseUrl: string): string {
  return baseUrl.trim().replace(/\/+$/, "");
}

function normalizeText(value: string): string {
  return value.trim().toLowerCase();
}

function mapIssueType(value: string | undefined): Story["type"] {
  const n = normalizeText(value ?? "");
  if (n.includes("epic")) return "Epic";
  if (n.includes("bug")) return "Bug";
  if (n.includes("task") || n.includes("sub-task") || n.includes("subtask")) {
    return "Task";
  }
  return "Story";
}

function mapStatus(value: string | undefined): Story["status"] {
  const n = normalizeText(value ?? "");
  if (n.includes("done") || n.includes("closed") || n.includes("resolved") || n.includes("fertig") || n.includes("abgeschlossen")) {
    return "Done";
  }
  if (n.includes("review") || n.includes("qa") || n.includes("test")) {
    return "In Review";
  }
  if (n.includes("progress") || n.includes("doing") || n.includes("arbeit") || n.includes("implement")) {
    return "In Progress";
  }
  if (n.includes("approved") || n.includes("freig")) {
    return "Approved";
  }
  if (n.includes("draft") || n.includes("entwurf")) {
    return "Draft";
  }
  return "To Do";
}

function mapPriority(value: string | undefined): Story["priority"] {
  const n = normalizeText(value ?? "");
  if (n.includes("highest") || n.includes("high") || n.includes("blocker") || n.includes("critical") || n.includes("hoch")) {
    return "Hoch";
  }
  if (n.includes("lowest") || n.includes("low") || n.includes("minor") || n.includes("trivial") || n.includes("niedrig")) {
    return "Niedrig";
  }
  return "Mittel";
}

function mapEffort(storyPoints: number | undefined): Story["effort"] {
  if (typeof storyPoints !== "number" || !Number.isFinite(storyPoints)) {
    return "Mittel";
  }
  if (storyPoints >= 8) return "Hoch";
  if (storyPoints >= 3) return "Mittel";
  return "Niedrig";
}

function extractStoryPoints(fields: JiraIssueFields | undefined): number | undefined {
  if (!fields) return undefined;
  const raw = fields.customfield_10016;
  if (typeof raw === "number" && Number.isFinite(raw)) return raw;
  return undefined;
}

function extractSprint(fields: JiraIssueFields | undefined): string | undefined {
  if (!fields) return undefined;
  const raw = fields.customfield_10020;
  if (!raw) return undefined;

  if (typeof raw === "string") {
    return raw;
  }

  if (Array.isArray(raw)) {
    const first = raw[0] as unknown;
    if (first && typeof first === "object") {
      const firstObj = first as Record<string, unknown>;
      if (typeof firstObj.name === "string") return firstObj.name;
    }
    if (typeof first === "string") return first;
    return undefined;
  }

  if (typeof raw === "object") {
    const obj = raw as Record<string, unknown>;
    if (typeof obj.name === "string") return obj.name;
  }

  return undefined;
}

function adfToText(node: unknown): string {
  if (typeof node === "string") return node;
  if (!node || typeof node !== "object") return "";

  const n = node as Record<string, unknown>;
  if (typeof n.text === "string") {
    return n.text;
  }

  const type = typeof n.type === "string" ? n.type : "";
  if (type === "hardBreak") return "\n";

  const content = Array.isArray(n.content) ? n.content : [];
  const children = content.map(adfToText).filter((x) => x.length > 0);

  if (type === "paragraph" || type === "heading" || type === "listItem") {
    const line = children.join("").trim();
    return line ? `${line}\n` : "";
  }

  if (type === "bulletList" || type === "orderedList" || type === "doc") {
    return children.join("");
  }

  return children.join(" ");
}

function descriptionToText(value: unknown): string {
  if (typeof value === "string") return value;
  const text = adfToText(value).replace(/\n{3,}/g, "\n\n").trim();
  return text || "";
}

function mapRelationType(label: string | undefined): TicketRelation["type"] {
  const n = normalizeText(label ?? "");
  if (n.includes("duplic")) return "duplicates";
  if (n.includes("is blocked by") || n.includes("blocked by")) return "depends_on";
  if (n.includes("block")) return "blocks";
  if (n.includes("depend")) return "depends_on";
  return "related_to";
}

function sanitizeIdPart(part: string): string {
  return part.replace(/[^A-Za-z0-9_-]/g, "_");
}

function escapeJqlString(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

function toJqlDateTime(value: string): string | undefined {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return undefined;

  const yyyy = date.getUTCFullYear();
  const mm = String(date.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(date.getUTCDate()).padStart(2, "0");
  const hh = String(date.getUTCHours()).padStart(2, "0");
  const min = String(date.getUTCMinutes()).padStart(2, "0");

  return `${yyyy}-${mm}-${dd} ${hh}:${min}`;
}

function buildProjectClause(projectKeys: string[], importScope: "selected" | "all"): string {
  if (importScope === "all") return "";
  const cleaned = projectKeys
    .map((k) => k.trim())
    .filter(Boolean)
    .map((k) => `"${escapeJqlString(k)}"`);
  if (cleaned.length === 0) return "";
  if (cleaned.length === 1) return `project = ${cleaned[0]}`;
  return `project in (${cleaned.join(", ")})`;
}

function buildJql(
  projectKeys: string[],
  importScope: "selected" | "all",
  updatedSince?: string,
): { jql: string; isIncremental: boolean } {
  const projectClause = buildProjectClause(projectKeys, importScope);
  const since = updatedSince ? toJqlDateTime(updatedSince) : undefined;
  const clauses = [projectClause];
  if (since) clauses.push(`updated >= "${since}"`);
  const where = clauses.filter(Boolean).join(" AND ");
  const order = since ? "updated ASC" : "created DESC";
  const jql = where
    ? `${where} ORDER BY ${order}`
    : `created is not EMPTY ORDER BY ${order}`;

  if (since) {
    return {
      jql,
      isIncremental: true,
    };
  }

  return {
    jql,
    isIncremental: false,
  };
}

function mapIssuesToRelations(
  issues: JiraIssue[],
  workspaceId: string,
  knownIssueIds?: Set<string>,
): TicketRelation[] {
  const localIssueKeys = new Set(
    issues.map((i) => i.key).filter((k): k is string => Boolean(k)),
  );
  const allowedIssueKeys = new Set(localIssueKeys);
  if (knownIssueIds) {
    for (const key of knownIssueIds) {
      allowedIssueKeys.add(key);
    }
  }
  const seen = new Set<string>();
  const relations: TicketRelation[] = [];

  for (const issue of issues) {
    const key = issue.key;
    if (!key) continue;

    const links = Array.isArray(issue.fields?.issuelinks)
      ? issue.fields?.issuelinks
      : [];

    for (const link of links) {
      const outwardKey = link.outwardIssue?.key;
      if (outwardKey && allowedIssueKeys.has(outwardKey)) {
        const relType = mapRelationType(link.type?.outward ?? link.type?.name);
        const dedupe = `${key}|${outwardKey}|${relType}`;
        if (!seen.has(dedupe)) {
          seen.add(dedupe);
          relations.push({
            id: `JR-${sanitizeIdPart(workspaceId)}-${sanitizeIdPart(key)}-${sanitizeIdPart(relType)}-${sanitizeIdPart(outwardKey)}`,
            sourceId: key,
            targetId: outwardKey,
            type: relType,
            confidence: 100,
            description: link.type?.name
              ? `Jira Link: ${link.type.name}`
              : "Jira Link",
          });
        }
      }

      const inwardKey = link.inwardIssue?.key;
      if (inwardKey && allowedIssueKeys.has(inwardKey)) {
        const relType = mapRelationType(link.type?.inward ?? link.type?.name);
        const dedupe = `${inwardKey}|${key}|${relType}`;
        if (!seen.has(dedupe)) {
          seen.add(dedupe);
          relations.push({
            id: `JR-${sanitizeIdPart(workspaceId)}-${sanitizeIdPart(inwardKey)}-${sanitizeIdPart(relType)}-${sanitizeIdPart(key)}`,
            sourceId: inwardKey,
            targetId: key,
            type: relType,
            confidence: 100,
            description: link.type?.name
              ? `Jira Link: ${link.type.name}`
              : "Jira Link",
          });
        }
      }
    }
  }

  return relations;
}

function mapIssuesToStories(
  issues: JiraIssue[],
  workspaceId: string,
  projectLabelFallback: string,
): Story[] {
  const stories: Story[] = [];

  for (const issue of issues) {
    const key = issue.key;
    if (!key) continue;

    const fields = issue.fields;
    const storyPoints = extractStoryPoints(fields);
    const tags = Array.isArray(fields?.labels)
      ? fields.labels.filter((x): x is string => typeof x === "string")
      : [];

    const mapped: Story = {
      id: key,
      title: fields?.summary?.trim() || key,
      description: descriptionToText(fields?.description),
      type: mapIssueType(fields?.issuetype?.name),
      status: mapStatus(fields?.status?.name),
      priority: mapPriority(fields?.priority?.name),
      effort: mapEffort(storyPoints),
      project:
        fields?.project?.name?.trim() ||
        fields?.project?.key?.trim() ||
        projectLabelFallback,
      workspaceId,
      tags,
      source: "jira-import",
      assignee: fields?.assignee?.displayName || undefined,
      sprint: extractSprint(fields),
      storyPoints,
    };

    stories.push(mapped);
  }

  return stories;
}

async function fetchProjectIssues(
  config: JiraConnectionInput,
  options: JiraImportOptions,
): Promise<{ issues: JiraIssue[]; isIncremental: boolean }> {
  const baseUrl = normalizeBaseUrl(config.baseUrl);
  const email = config.email.trim();
  const apiToken = config.apiToken.trim();
  const projectKeys = config.projectKeys
    .map((k) => k.trim())
    .filter(Boolean);
  const importScope = config.importScope ?? "selected";
  const jql = buildJql(projectKeys, importScope, options.updatedSince);

  const fields = [
    "summary",
    "description",
    "status",
    "issuetype",
    "priority",
    "assignee",
    "project",
    "labels",
    "issuelinks",
    "updated",
    "created",
    "customfield_10016",
    "customfield_10020",
  ];

  const issues: JiraIssue[] = [];
  let nextPageToken: string | undefined;
  let page = 1;

  // Punkt 1
  while (true) {
    options.onDebugLog?.("Punkt1");
    const body: Record<string, unknown> = {
      jql: jql.jql,
      maxResults: 100,
      fields,
    };
    if (nextPageToken) body.nextPageToken = nextPageToken;

    // Punkt 2
    options.onDebugLog?.("Punkt2");
    const response = await fetch("/api/jira/search-jql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        baseUrl,
        email,
        apiToken,
        request: body,
      }),
      signal: options.signal,
    });
    // Punkt 3
    options.onDebugLog?.("Punkt3");

    if (!response.ok) {
      const text = await response.text();
      throw new Error(
        `Jira Proxy/API Fehler (${response.status}): ${text || response.statusText}`,
      );
    }

    const data = (await response.json()) as JiraSearchResponse;
    const pageIssues = Array.isArray(data.issues) ? data.issues : [];
    issues.push(...pageIssues);

    if (data.isLast || !data.nextPageToken) {
      break;
    }
    nextPageToken = data.nextPageToken;
    page += 1;
    options.onDebugLog?.(`Pagination: nächste Seite ${page}`);
  }

  return { issues, isIncremental: jql.isIncremental };
}

export async function importJiraProjectData(
  config: JiraConnectionInput,
  workspaceId: string,
  options: JiraImportOptions = {},
): Promise<JiraImportResult> {
  const { issues, isIncremental } = await fetchProjectIssues(config, options);
  const knownIssueIds = new Set(options.knownIssueIds ?? []);
  const fallbackProjectName =
    config.importScope === "all"
      ? "Jira"
      : config.projectKeys.join(", ") || "Jira";
  const stories = mapIssuesToStories(issues, workspaceId, fallbackProjectName);
  const relations = mapIssuesToRelations(issues, workspaceId, knownIssueIds);

  return {
    stories,
    relations,
    fetchedIssueCount: issues.length,
    touchedIssueIds: stories.map((s) => s.id),
    isIncremental,
  };
}
