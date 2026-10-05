import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  conversationKeys,
  type BeatPreview,
  type ChatMessage,
  type ConversationSummary,
} from "@/entities/conversation";
import { ApiError } from "@/shared/api";
import { conversationsApi, type SendMessageBody } from "@/shared/api/endpoints/conversations";

export type OutgoingMessage =
  | { text: string; type: "text" }
  | { beat_id: string; preview: BeatPreview; type: "beat" };

type SendContext = {
  pendingId: string;
  previous?: ChatMessage[];
};

function pendingMessage(conversationId: string, senderId: string, message: OutgoingMessage, pendingId: string): ChatMessage {
  return {
    beat: message.type === "beat" ? message.preview : null,
    conversation_id: conversationId,
    created_at: new Date().toISOString(),
    id: pendingId,
    read_at: null,
    sender_id: senderId,
    text: message.type === "text" ? message.text : null,
    type: message.type,
  };
}

function withLatestMessage(current: ConversationSummary[] | undefined, conversationId: string, message: ChatMessage) {
  if (!current) {
    return current;
  }

  const next = current.map((item) =>
    item.id === conversationId
      ? { ...item, last_message: message, last_message_at: message.created_at, unread_count: 0 }
      : item,
  );

  return next.sort(
    (left, right) =>
      Date.parse(right.last_message_at ?? right.created_at) - Date.parse(left.last_message_at ?? left.created_at),
  );
}

export function isConnectionClosed(error: unknown) {
  return error instanceof ApiError && error.status === 403 && error.detail.toLowerCase().includes("connected");
}

export function useSendMessage(conversationId: string, senderId?: string) {
  const queryClient = useQueryClient();
  const messagesKey = conversationKeys.messages(conversationId);

  return useMutation<ChatMessage, Error, OutgoingMessage, SendContext>({
    mutationFn: (message: OutgoingMessage) => {
      const body: SendMessageBody =
        message.type === "text" ? { text: message.text, type: "text" } : { beat_id: message.beat_id, type: "beat" };
      return conversationsApi.send(conversationId, body);
    },
    onError: (_error, _message, context) => {
      if (context?.previous) {
        queryClient.setQueryData(messagesKey, context.previous);
      }
    },
    onMutate: async (message) => {
      await queryClient.cancelQueries({ queryKey: messagesKey });
      const previous = queryClient.getQueryData<ChatMessage[]>(messagesKey);
      const pendingId = `pending-${Date.now()}`;
      if (senderId) {
        const optimistic = pendingMessage(conversationId, senderId, message, pendingId);
        queryClient.setQueryData<ChatMessage[]>(messagesKey, [...(previous ?? []), optimistic]);
        queryClient.setQueryData<ConversationSummary[]>(conversationKeys.list, (current) =>
          withLatestMessage(current, conversationId, optimistic),
        );
      }
      return { pendingId, previous } satisfies SendContext;
    },
    onSuccess: (saved, _message, context) => {
      queryClient.setQueryData<ChatMessage[]>(messagesKey, (current) => {
        const withoutPending = (current ?? []).filter(
          (item) => item.id !== context?.pendingId && item.id !== saved.id,
        );
        return [...withoutPending, saved].sort(
          (left, right) => Date.parse(left.created_at) - Date.parse(right.created_at),
        );
      });
      queryClient.setQueryData<ConversationSummary[]>(conversationKeys.list, (current) =>
        withLatestMessage(current, conversationId, saved),
      );
    },
  });
}
