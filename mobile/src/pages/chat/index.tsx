import { useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import { Avatar, Text } from "@/components/ui";
import type { Connection } from "@/entities/connection";
import { conversationKeys, type BeatPreview, type ChatMessage, type ConversationSummary } from "@/entities/conversation";
import { isConnectionClosed, useSendMessage } from "@/features/chat/send-message";
import { connectionsApi, conversationsApi, profilesApi, uploadsApi, usersApi } from "@/shared/api";
import ChevronIcon from "../../../assets/icons/chevron.svg";
import StudioIcon from "../../../assets/icons/studio.svg";
import { useChatPlayback } from "./model/use-chat-playback";
import { BeatSheet } from "./ui/beat-sheet";
import { MessageRow } from "./ui/thread";

const ROLE_LABEL = { artist: "Rapper", producer: "Producer" } as const;
const CLOSED_COPY = "You can no longer send messages to this user.";

function routeId(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function stillConnected(connections: Connection[] | undefined, myProfileId?: string, otherProfileId?: string | null) {
  if (!connections || !myProfileId || !otherProfileId) {
    return true;
  }
  return connections.some((connection) => {
    if (connection.status !== "accepted") {
      return false;
    }
    const ids = [connection.requester_profile_id, connection.receiver_profile_id];
    return ids.includes(myProfileId) && ids.includes(otherProfileId);
  });
}

export function ChatPage() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const conversationId = routeId(params.id) ?? "";
  const listRef = useRef<FlatList<ChatMessage>>(null);
  const entered = useRef<string | null>(null);
  const marked = useRef<string | null>(null);
  const [draft, setDraft] = useState("");
  const [sendError, setSendError] = useState<string | null>(null);
  const [closed, setClosed] = useState(false);
  const [beatsOpen, setBeatsOpen] = useState(false);
  const [activeConversationId, setActiveConversationId] = useState(conversationId);
  if (activeConversationId !== conversationId) {
    setActiveConversationId(conversationId);
    setClosed(false);
    setDraft("");
    setSendError(null);
  }
  const playback = useChatPlayback();

  const me = useQuery({ queryFn: () => usersApi.getMe(), queryKey: ["users", "me"] });
  const profile = useQuery({ queryFn: () => profilesApi.getMe(), queryKey: ["profiles", "me"] });
  const connections = useQuery({ queryFn: () => connectionsApi.list(), queryKey: ["connections"] });
  const conversations = useQuery({
    queryFn: () => conversationsApi.list(),
    queryKey: conversationKeys.list,
  });
  const messages = useQuery({
    enabled: Boolean(conversationId),
    queryFn: () => conversationsApi.messages(conversationId),
    queryKey: conversationKeys.messages(conversationId),
    refetchInterval: 8000,
  });
  const uploads = useQuery({
    enabled: beatsOpen,
    queryFn: () => uploadsApi.listMine(),
    queryKey: ["uploads", "me"],
  });
  const send = useSendMessage(conversationId, me.data?.id);

  const summary = conversations.data?.find((item) => item.id === conversationId);
  const other = summary?.other_user;
  const name = other?.artist_name?.trim() || "Chat";
  const role = other?.role ? ROLE_LABEL[other.role] : null;
  const thread = messages.data ?? [];
  const linked = stillConnected(connections.data, profile.data?.id, other?.profile_id);
  const messagingClosed = closed || (connections.isSuccess && other?.profile_id ? !linked : false);
  const canSend = draft.trim().length > 0 && !send.isPending && !messagingClosed && Boolean(me.data?.id);

  useEffect(() => {
    if (!thread.length) {
      return;
    }
    const opening = entered.current !== conversationId;
    entered.current = conversationId;
    requestAnimationFrame(() => listRef.current?.scrollToEnd({ animated: !opening }));
  }, [conversationId, thread.length]);

  useEffect(() => {
    if (!conversationId || !summary || summary.unread_count === 0 || marked.current === summary.id) {
      return;
    }
    marked.current = summary.id;
    void conversationsApi
      .markRead(conversationId)
      .then((next) => {
        queryClient.setQueryData<ConversationSummary[]>(conversationKeys.list, (current) =>
          current?.map((item) => (item.id === next.id ? next : item)),
        );
      })
      .catch(() => {
        if (marked.current === summary.id) {
          marked.current = null;
        }
      });
  }, [conversationId, queryClient, summary]);

  const shareBeat = (preview: BeatPreview) => {
    if (send.isPending || messagingClosed) {
      return;
    }
    setSendError(null);
    setBeatsOpen(false);
    playback.stop();
    send.mutate(
      { beat_id: preview.id, preview, type: "beat" },
      {
        onError: (error) => {
          if (isConnectionClosed(error)) {
            setClosed(true);
            setSendError(null);
            return;
          }
          setSendError("Couldn't send. Try again.");
        },
        onSuccess: () => {
          requestAnimationFrame(() => listRef.current?.scrollToEnd({ animated: true }));
        },
      },
    );
  };

  const submitText = () => {
    const text = draft.trim();
    if (!text || send.isPending || messagingClosed || !me.data?.id) {
      return;
    }
    setDraft("");
    setSendError(null);
    send.mutate(
      { text, type: "text" },
      {
        onError: (error) => {
          setDraft(text);
          if (isConnectionClosed(error)) {
            setClosed(true);
            setSendError(null);
            return;
          }
          setSendError("Couldn't send. Try again.");
        },
        onSuccess: () => {
          requestAnimationFrame(() => listRef.current?.scrollToEnd({ animated: true }));
        },
      },
    );
  };

  const closeBeats = () => {
    if (playback.activeKey?.startsWith("upload:")) {
      playback.stop();
    }
    setBeatsOpen(false);
  };

  return (
    <SafeAreaView edges={["top", "left", "right"]} style={{ backgroundColor: "#FFFFFF", flex: 1 }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <View
          style={{
            alignItems: "center",
            borderBottomColor: "#F0F0F0",
            borderBottomWidth: 1,
            flexDirection: "row",
            minHeight: 56,
            paddingHorizontal: 8,
            paddingVertical: 8,
          }}
        >
          <Pressable
            accessibilityLabel="Back"
            accessibilityRole="button"
            hitSlop={8}
            onPress={() => router.back()}
            style={({ pressed }) => ({
              alignItems: "center",
              height: 44,
              justifyContent: "center",
              transform: [{ scale: pressed ? 0.97 : 1 }],
              width: 44,
            })}
          >
            <ChevronIcon height={22} width={22} />
          </Pressable>
          <View style={{ borderColor: "rgba(0,0,0,0.08)", borderRadius: 18, borderWidth: 1 }}>
            <Avatar name={name} size={36} uri={other?.avatar_url} />
          </View>
          <View style={{ flex: 1, marginLeft: 10, minWidth: 0 }}>
            <Text className="font-semibold" numberOfLines={1} style={{ color: "#111111", fontSize: 16, lineHeight: 20 }}>
              {name}
            </Text>
            {role ? (
              <Text numberOfLines={1} style={{ color: "#6F6F6F", fontSize: 13, fontWeight: "500", lineHeight: 16 }}>
                {role}
              </Text>
            ) : null}
          </View>
        </View>

        {messages.isPending ? (
          <View style={{ flex: 1, gap: 12, paddingHorizontal: 16, paddingTop: 20 }}>
            <View style={{ alignSelf: "flex-start", backgroundColor: "#E8E8E8", borderRadius: 18, height: 42, width: "58%" }} />
            <View style={{ alignSelf: "flex-end", backgroundColor: "#E8E8E8", borderRadius: 18, height: 42, width: "42%" }} />
            <View style={{ alignSelf: "flex-start", backgroundColor: "#E8E8E8", borderRadius: 18, height: 64, width: "70%" }} />
          </View>
        ) : messages.isError ? (
          <View style={{ alignItems: "center", flex: 1, justifyContent: "center", paddingHorizontal: 24 }}>
            <Text style={{ color: "#111111", fontSize: 18, fontWeight: "700", textAlign: "center" }}>
              Something went wrong
            </Text>
            <Text style={{ color: "#6F6F6F", fontSize: 15, fontWeight: "500", marginTop: 6, textAlign: "center" }}>
              We could not load this chat.
            </Text>
            <Pressable
              accessibilityRole="button"
              onPress={() => void messages.refetch()}
              style={({ pressed }) => ({
                marginTop: 16,
                minHeight: 44,
                justifyContent: "center",
                transform: [{ scale: pressed ? 0.97 : 1 }],
              })}
            >
              <Text style={{ color: "#111111", fontSize: 16, fontWeight: "600" }}>Try again</Text>
            </Pressable>
          </View>
        ) : (
          <FlatList
            contentContainerStyle={{
              flexGrow: 1,
              justifyContent: thread.length ? "flex-end" : "center",
              paddingHorizontal: 16,
              paddingVertical: 16,
            }}
            data={thread}
            keyExtractor={(item) => item.id}
            keyboardDismissMode="interactive"
            keyboardShouldPersistTaps="handled"
            ListEmptyComponent={
              <Text style={{ color: "#6F6F6F", fontSize: 15, fontWeight: "500", textAlign: "center" }}>
                No messages yet
              </Text>
            }
            ref={listRef}
            renderItem={({ index, item }) => (
              <MessageRow
                index={index}
                message={item}
                messages={thread}
                mine={item.sender_id === me.data?.id}
                playback={playback}
              />
            )}
          />
        )}

        {messagingClosed ? (
          <View style={{ paddingBottom: Math.max(insets.bottom, 12), paddingHorizontal: 20, paddingTop: 12 }}>
            <Text style={{ color: "#111111", fontSize: 14, fontWeight: "500", lineHeight: 20, textAlign: "center" }}>
              {CLOSED_COPY}
            </Text>
          </View>
        ) : (
          <View
            style={{
              paddingBottom: Math.max(insets.bottom, 10),
              paddingHorizontal: 12,
              paddingTop: 8,
            }}
          >
            {sendError ? (
              <Text style={{ color: "#111111", fontSize: 13, fontWeight: "500", marginBottom: 8, textAlign: "center" }}>
                {sendError}
              </Text>
            ) : null}
            <View style={{ alignItems: "flex-end", flexDirection: "row", gap: 8 }}>
              <Pressable
                accessibilityLabel="Share a beat"
                accessibilityRole="button"
                onPress={() => setBeatsOpen(true)}
                style={({ pressed }) => ({
                  alignItems: "center",
                  backgroundColor: "#F7F7F7",
                  borderRadius: 22,
                  height: 44,
                  justifyContent: "center",
                  transform: [{ scale: pressed ? 0.97 : 1 }],
                  width: 44,
                })}
              >
                <StudioIcon color="#111111" height={22} width={22} />
              </Pressable>
              <TextInput
                multiline
                onChangeText={setDraft}
                placeholder="Message"
                placeholderTextColor="#6F6F6F"
                style={{
                  backgroundColor: "#F7F7F7",
                  borderRadius: 22,
                  color: "#111111",
                  flex: 1,
                  fontSize: 16,
                  lineHeight: 21,
                  maxHeight: 96,
                  minHeight: 44,
                  paddingHorizontal: 16,
                  paddingTop: Platform.OS === "ios" ? 11 : 8,
                  paddingBottom: Platform.OS === "ios" ? 11 : 8,
                }}
                value={draft}
              />
              <Pressable
                accessibilityLabel="Send message"
                accessibilityRole="button"
                accessibilityState={{ disabled: !canSend }}
                disabled={!canSend}
                onPress={submitText}
                style={({ pressed }) => ({
                  alignItems: "center",
                  backgroundColor: canSend ? "#111111" : "#E8E8E8",
                  borderRadius: 22,
                  height: 44,
                  justifyContent: "center",
                  minWidth: 72,
                  opacity: pressed && canSend ? 0.85 : 1,
                  paddingHorizontal: 14,
                  transform: [{ scale: pressed && canSend ? 0.97 : 1 }],
                })}
              >
                <Text style={{ color: canSend ? "#FFFFFF" : "#6F6F6F", fontSize: 15, fontWeight: "600" }}>Send</Text>
              </Pressable>
            </View>
          </View>
        )}
      </KeyboardAvoidingView>

      <BeatSheet
        avatarUrl={profile.data?.avatar_url ?? null}
        error={uploads.isError}
        loading={uploads.isLoading}
        onClose={closeBeats}
        onRetry={() => void uploads.refetch()}
        onSelect={shareBeat}
        ownerName={profile.data?.artist_name ?? "You"}
        playback={playback}
        sending={send.isPending}
        uploads={uploads.data ?? []}
        visible={beatsOpen}
      />
    </SafeAreaView>
  );
}
