import type { StoryData, JiraTicketData } from "../../data/stories";

/* ------------------------------------------------------------------ */
/*  Message types                                                      */
/* ------------------------------------------------------------------ */

export type MessageRole = "user" | "assistant";

export type MessageType =
  | "text"
  | "bulk_preview"
  | "query_result"
  | "suggestion_chips";

export interface ChatMessage {
  id: string;
  role: MessageRole;
  type: MessageType;
  content: string;
  timestamp: number;
  metadata?: BulkOperationPreview | QueryResultData | SuggestionChipsData;
}

/* ------------------------------------------------------------------ */
/*  Bulk operations                                                    */
/* ------------------------------------------------------------------ */

export type EntityType = "story" | "jira_ticket";

export interface BulkChange {
  id: string;
  title: string;
  field: string;
  oldValue: string;
  newValue: string;
}

export interface BulkOperationPreview {
  entityType: EntityType;
  field: string;
  newValue: string;
  changes: BulkChange[];
  applied?: boolean;
}

/* ------------------------------------------------------------------ */
/*  Query results                                                      */
/* ------------------------------------------------------------------ */

export interface QueryResultItem {
  id: string;
  title: string;
  type: "story" | "jira_ticket";
  status: string;
  priority?: string;
  project: string;
  effort?: string;
}

export interface QueryResultData {
  summary: string;
  items: QueryResultItem[];
}

/* ------------------------------------------------------------------ */
/*  Suggestion chips                                                   */
/* ------------------------------------------------------------------ */

export interface SuggestionChipsData {
  chips: { label: string; message: string }[];
}

/* ------------------------------------------------------------------ */
/*  Chat service interface                                             */
/* ------------------------------------------------------------------ */

export interface ChatDataContext {
  stories: StoryData[];
  jiraTickets: JiraTicketData[];
}

export interface ChatServiceResponse {
  messages: Omit<ChatMessage, "id" | "timestamp">[];
  pendingOperation?: BulkOperationPreview;
}

export interface ChatService {
  processMessage(
    userMessage: string,
    context: ChatDataContext,
  ): Promise<ChatServiceResponse>;
}
