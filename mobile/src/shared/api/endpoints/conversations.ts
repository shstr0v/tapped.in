import type { ChatMessage, ConversationSummary } from "@/entities/conversation";

import { apiRequest } from "../http-client";

export type SendMessageBody =
  | { text: string; type: "text" }
  | { beat_id: string; type: "beat" };

export const conversationsApi = {
  list: () => apiRequest<ConversationSummary[]>("/conversations"),

  markRead: (conversationId: string) =>
    apiRequest<ConversationSummary>(`/conversations/${conversationId}/read`, {
      method: "POST",
    }),

  messages: (conversationId: string) =>
    apiRequest<ChatMessage[]>(`/conversations/${conversationId}/messages`, {
      query: { limit: 50 },
    }),

  open: (userId: string) =>
    apiRequest<ConversationSummary>(`/conversations/${userId}`, {
      method: "POST",
    }),

  send: (conversationId: string, body: SendMessageBody) =>
    apiRequest<ChatMessage>(`/conversations/${conversationId}/messages`, {
      body,
      method: "POST",
    }),
};
