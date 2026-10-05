import { useCallback, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useFocusEffect, useRouter } from "expo-router";
import { Modal, Pressable, ScrollView, View, useWindowDimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Avatar, Text } from "@/components/ui";
import type { Connection } from "@/entities/connection";
import { conversationKeys, type ConversationSummary } from "@/entities/conversation";
import type { MusicProfile } from "@/entities/music-profile";
import { ApiError, connectionsApi, conversationsApi, profilesApi } from "@/shared/api";
import { useReduceMotion } from "@/shared/lib/reduce-motion";
import { ChatsEmpty, ChatsError, ChatsSkeleton } from "./ui/states";

const MAX_CONTENT_WIDTH = 430;
const ROLE_LABEL = { artist: "Rapper", producer: "Producer" } as const;

function otherProfile(connection: Connection, myId?: string) {
  if (myId && connection.requester_profile_id === myId) {
    return connection.receiver_profile;
  }
  if (myId && connection.receiver_profile_id === myId) {
    return connection.requester_profile;
  }
  return connection.receiver_profile ?? connection.requester_profile;
}

function displayName(name?: string | null) {
  const trimmed = name?.trim();
  return trimmed ? trimmed : "Unknown";
}

function preview(conversation: ConversationSummary) {
  const message = conversation.last_message;
  if (!message) {
    return "No messages yet";
  }
  if (message.type === "beat") {
    return message.beat?.title ? `Sent a beat · ${message.beat.title}` : "Sent a beat";
  }
  return message.text?.trim() || "Message";
}

function activityTime(value: string | null) {
  if (!value) {
    return "";
  }
  const date = new Date(value);
  const diff = Date.now() - date.getTime();
  const minute = 60_000;
  const hour = 60 * minute;
  const day = 24 * hour;
  if (diff < minute) {
    return "Now";
  }
  if (diff < hour) {
    return `${Math.floor(diff / minute)}m`;
  }
  if (diff < day) {
    return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  }
  if (diff < 7 * day) {
    return date.toLocaleDateString([], { weekday: "short" });
  }
  return date.toLocaleDateString([], { day: "numeric", month: "short" });
}

function ConversationRow({ conversation, onPress }: { conversation: ConversationSummary; onPress: () => void }) {
  const name = displayName(conversation.other_user.artist_name);
  const unread = conversation.unread_count > 0;
  const detail = preview(conversation);

  return (
    <Pressable
      accessibilityLabel={unread ? `${name}, ${conversation.unread_count} unread. ${detail}` : `${name}. ${detail}`}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => ({
        alignItems: "center",
        flexDirection: "row",
        minHeight: 72,
        opacity: pressed ? 0.7 : 1,
        transform: [{ scale: pressed ? 0.99 : 1 }],
      })}
    >
      <View style={{ borderColor: "rgba(0,0,0,0.08)", borderRadius: 26, borderWidth: 1 }}>
        <Avatar name={name} size={52} uri={conversation.other_user.avatar_url} />
      </View>
      <View style={{ flex: 1, marginLeft: 14, minWidth: 0 }}>
        <Text className="font-semibold text-black" numberOfLines={1} style={{ fontSize: 16, lineHeight: 20 }}>
          {name}
        </Text>
        <Text
          numberOfLines={1}
          style={{
            color: unread ? "#111111" : "#6F6F6F",
            fontSize: 14,
            fontWeight: unread ? "600" : "500",
            lineHeight: 18,
            marginTop: 3,
          }}
        >
          {detail}
        </Text>
      </View>
      <View style={{ alignItems: "flex-end", gap: 8, marginLeft: 12 }}>
        <Text style={{ color: "#6F6F6F", fontSize: 12, fontWeight: "500", lineHeight: 16 }}>
          {activityTime(conversation.last_message_at ?? conversation.created_at)}
        </Text>
        {unread ? (
          <View
            style={{
              alignItems: "center",
              backgroundColor: "#111111",
              borderRadius: 9,
              height: 18,
              justifyContent: "center",
              minWidth: 18,
              paddingHorizontal: 5,
            }}
          >
            <Text style={{ color: "#FFFFFF", fontSize: 11, fontWeight: "700", lineHeight: 13 }}>
              {conversation.unread_count > 9 ? "9+" : conversation.unread_count}
            </Text>
          </View>
        ) : null}
      </View>
    </Pressable>
  );
}

export function ChatsPage() {
  const router = useRouter();
  const reduceMotion = useReduceMotion();
  const queryClient = useQueryClient();
  const { width } = useWindowDimensions();
  const contentWidth = Math.max(280, Math.min(MAX_CONTENT_WIDTH, width - 32));
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetError, setSheetError] = useState<string | null>(null);
  const conversations = useQuery({
    queryFn: () => conversationsApi.list(),
    queryKey: conversationKeys.list,
  });
  const me = useQuery({
    enabled: sheetOpen,
    queryFn: () => profilesApi.getMe(),
    queryKey: ["profiles", "me"],
  });
  const connections = useQuery({
    enabled: sheetOpen,
    queryFn: () => connectionsApi.list(),
    queryKey: ["connections"],
  });
  const openChat = useMutation({
    mutationFn: (userId: string) => conversationsApi.open(userId),
    onSuccess: (summary) => {
      queryClient.setQueryData<ConversationSummary[]>(conversationKeys.list, (current) => {
        const rest = (current ?? []).filter((item) => item.id !== summary.id);
        return [summary, ...rest];
      });
      setSheetOpen(false);
      router.push(`/chat/${summary.id}`);
    },
  });

  const { refetch: refetchConversations } = conversations;

  useFocusEffect(
    useCallback(() => {
      void refetchConversations();
    }, [refetchConversations]),
  );

  const rows = useMemo(() => {
    return [...(conversations.data ?? [])].sort(
      (left, right) =>
        Date.parse(right.last_message_at ?? right.created_at) - Date.parse(left.last_message_at ?? left.created_at),
    );
  }, [conversations.data]);

  const people = useMemo(() => {
    return (connections.data ?? [])
      .filter((connection) => connection.status === "accepted")
      .map((connection) => otherProfile(connection, me.data?.id))
      .filter((profile): profile is MusicProfile => Boolean(profile?.user_id));
  }, [connections.data, me.data?.id]);

  const startChat = (profile: MusicProfile) => {
    if (openChat.isPending) {
      return;
    }
    setSheetError(null);
    openChat.mutate(profile.user_id, {
      onError: (error) => {
        setSheetError(
          error instanceof ApiError && error.status === 403
            ? "You can only message people you're connected with."
            : "Couldn't open that chat. Try again.",
        );
      },
    });
  };

  return (
    <SafeAreaView edges={["top", "left", "right"]} style={{ backgroundColor: "#FFFFFF", flex: 1 }}>
      <ScrollView
        contentContainerStyle={{ alignItems: "center", flexGrow: 1, paddingBottom: 24, paddingTop: 12 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ flex: 1, width: contentWidth }}>
          <View style={{ alignItems: "center", flexDirection: "row", justifyContent: "space-between", minHeight: 44 }}>
            <Text style={{ color: "#111111", fontSize: 30, fontWeight: "700", lineHeight: 34 }}>Chats</Text>
            <Pressable
              accessibilityLabel="New chat"
              accessibilityRole="button"
              onPress={() => {
                setSheetError(null);
                setSheetOpen(true);
              }}
              style={({ pressed }) => ({
                alignItems: "center",
                justifyContent: "center",
                minHeight: 44,
                minWidth: 44,
                opacity: pressed ? 0.6 : 1,
                transform: [{ scale: pressed ? 0.97 : 1 }],
              })}
            >
              <Text style={{ color: "#111111", fontSize: 16, fontWeight: "600", lineHeight: 20 }}>New</Text>
            </Pressable>
          </View>

          {conversations.isPending ? (
            <ChatsSkeleton />
          ) : conversations.isError ? (
            <ChatsError onRetry={() => void conversations.refetch()} />
          ) : rows.length === 0 ? (
            <ChatsEmpty />
          ) : (
            <View style={{ gap: 4, marginTop: 12 }}>
              {rows.map((conversation) => (
                <ConversationRow
                  conversation={conversation}
                  key={conversation.id}
                  onPress={() => router.push(`/chat/${conversation.id}`)}
                />
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      <Modal
        animationType={reduceMotion ? "none" : "slide"}
        onRequestClose={() => setSheetOpen(false)}
        transparent
        visible={sheetOpen}
      >
        <Pressable
          accessibilityLabel="Close new chat"
          onPress={() => setSheetOpen(false)}
          style={{ backgroundColor: "rgba(0,0,0,0.28)", flex: 1, justifyContent: "flex-end" }}
        >
          <Pressable
            onPress={() => undefined}
            style={{
              backgroundColor: "#FFFFFF",
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              maxHeight: "72%",
              paddingBottom: 28,
              paddingHorizontal: 20,
              paddingTop: 12,
            }}
          >
            <View style={{ alignSelf: "center", backgroundColor: "#E4E4E4", borderRadius: 2, height: 4, marginBottom: 16, width: 36 }} />
            <Text style={{ color: "#111111", fontSize: 20, fontWeight: "700", lineHeight: 24 }}>Message a connection</Text>
            <ScrollView contentContainerStyle={{ paddingTop: 16 }} keyboardShouldPersistTaps="handled">
              {connections.isPending || me.isPending ? (
                <Text style={{ color: "#6F6F6F", fontSize: 15, fontWeight: "500" }}>Loading connections…</Text>
              ) : connections.isError ? (
                <Pressable accessibilityRole="button" onPress={() => void connections.refetch()}>
                  <Text style={{ color: "#111111", fontSize: 15, fontWeight: "600" }}>Could not load connections. Try again.</Text>
                </Pressable>
              ) : people.length === 0 ? (
                <Text style={{ color: "#6F6F6F", fontSize: 15, fontWeight: "500", lineHeight: 20 }}>
                  Connect with someone from Home to start a chat.
                </Text>
              ) : (
                <View style={{ gap: 8 }}>
                  {people.map((profile) => (
                    <Pressable
                      accessibilityRole="button"
                      disabled={openChat.isPending}
                      key={profile.id}
                      onPress={() => startChat(profile)}
                      style={({ pressed }) => ({
                        alignItems: "center",
                        flexDirection: "row",
                        minHeight: 64,
                        opacity: pressed || openChat.isPending ? 0.6 : 1,
                      })}
                    >
                      <Avatar name={profile.artist_name} size={44} uri={profile.avatar_url} />
                      <View style={{ flex: 1, marginLeft: 12 }}>
                        <Text className="font-semibold" numberOfLines={1} style={{ fontSize: 16 }}>
                          {displayName(profile.artist_name)}
                        </Text>
                        <Text numberOfLines={1} style={{ color: "#6F6F6F", fontSize: 13, marginTop: 2 }}>
                          {ROLE_LABEL[profile.role]}
                        </Text>
                      </View>
                    </Pressable>
                  ))}
                </View>
              )}
              {sheetError ? (
                <Text style={{ color: "#111111", fontSize: 14, fontWeight: "500", marginTop: 12 }}>{sheetError}</Text>
              ) : null}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}
