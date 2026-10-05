import { ActivityIndicator, Pressable, View } from "react-native";

import { Avatar, Text } from "@/components/ui";
import type { BeatPreview, ChatMessage } from "@/entities/conversation";
import PauseIcon from "../../../../assets/icons/pause.svg";
import PlayIcon from "../../../../assets/icons/play.svg";

const CLUSTER_GAP_MS = 15 * 60 * 1000;

function formatClock(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) {
    return "0:00";
  }
  const total = Math.floor(seconds);
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`;
}

export function formatMessageTime(value: string) {
  const date = new Date(value);
  const time = date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  const now = new Date();
  if (date.toDateString() === now.toDateString()) {
    return time;
  }
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) {
    return `Yesterday ${time}`;
  }
  return `${date.toLocaleDateString([], { day: "numeric", month: "short" })} ${time}`;
}

export function startsCluster(messages: ChatMessage[], index: number) {
  if (index === 0) {
    return true;
  }
  const current = Date.parse(messages[index]?.created_at ?? "");
  const previous = Date.parse(messages[index - 1]?.created_at ?? "");
  return !Number.isFinite(current) || !Number.isFinite(previous) || current - previous > CLUSTER_GAP_MS;
}

type Playback = {
  activeKey: string | null;
  live: { current: number; duration: number; paused: boolean };
  toggle: (key: string, url: string) => void;
};

export function BeatCard({
  beat,
  mine,
  playback,
  playbackKey,
}: {
  beat: BeatPreview;
  mine: boolean;
  playback: Playback;
  playbackKey: string;
}) {
  const active = playback.activeKey === playbackKey;
  const ended = active && playback.live.duration > 0 && playback.live.current >= playback.live.duration - 0.25;
  const playing = active && !playback.live.paused && !ended;
  const progress = active && playback.live.duration > 0 ? Math.min(playback.live.current / playback.live.duration, 1) : 0;
  const owner = beat.owner?.artist_name?.trim();
  const meta = [owner, beat.bpm ? `${beat.bpm} BPM` : beat.genre].filter(Boolean).join(" · ");

  return (
    <View
      style={{
        alignSelf: mine ? "flex-end" : "flex-start",
        backgroundColor: "#F7F7F7",
        borderColor: "rgba(0,0,0,0.06)",
        borderRadius: 18,
        borderWidth: 1,
        gap: 8,
        maxWidth: 280,
        padding: 10,
      }}
    >
      <View style={{ alignItems: "center", flexDirection: "row", gap: 10 }}>
        <View style={{ borderColor: "rgba(0,0,0,0.08)", borderRadius: 10, borderWidth: 1 }}>
          <Avatar name={owner || beat.title} size={44} uri={beat.owner?.avatar_url} />
        </View>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text className="font-semibold" numberOfLines={1} style={{ color: "#111111", fontSize: 15, lineHeight: 19 }}>
            {beat.title}
          </Text>
          {meta ? (
            <Text numberOfLines={1} style={{ color: "#6F6F6F", fontSize: 12, fontWeight: "500", lineHeight: 16, marginTop: 2 }}>
              {meta}
            </Text>
          ) : null}
        </View>
        <Pressable
          accessibilityLabel={playing ? `Pause ${beat.title}` : `Play ${beat.title}`}
          accessibilityRole="button"
          hitSlop={8}
          onPress={() => playback.toggle(playbackKey, beat.audio_url)}
          style={({ pressed }) => ({
            alignItems: "center",
            height: 40,
            justifyContent: "center",
            transform: [{ scale: pressed ? 0.97 : 1 }],
            width: 40,
          })}
        >
          {playing && playback.live.duration <= 0 ? (
            <ActivityIndicator color="#111111" size="small" />
          ) : playing ? (
            <PauseIcon height={22} width={22} />
          ) : (
            <View style={{ marginLeft: 2 }}>
              <PlayIcon height={22} width={22} />
            </View>
          )}
        </Pressable>
      </View>
      {active && playback.live.duration > 0 ? (
        <View style={{ gap: 4 }}>
          <View style={{ backgroundColor: "#E6E6E6", borderRadius: 2, height: 3, overflow: "hidden" }}>
            <View style={{ backgroundColor: "#111111", height: 3, width: `${progress * 100}%` }} />
          </View>
          <Text style={{ color: "#6F6F6F", fontSize: 12, fontVariant: ["tabular-nums"], fontWeight: "500" }}>
            {formatClock(ended ? 0 : playback.live.current)} / {formatClock(playback.live.duration)}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

export function MessageRow({
  index,
  message,
  messages,
  mine,
  playback,
}: {
  index: number;
  message: ChatMessage;
  messages: ChatMessage[];
  mine: boolean;
  playback: Playback;
}) {
  const clustered =
    index > 0 && messages[index - 1]?.sender_id === message.sender_id && !startsCluster(messages, index);

  return (
    <View style={{ marginTop: index === 0 ? 0 : clustered ? 4 : 14 }}>
      {startsCluster(messages, index) ? (
        <Text
          style={{
            color: "#6F6F6F",
            fontSize: 12,
            fontWeight: "500",
            lineHeight: 16,
            marginBottom: 8,
            textAlign: "center",
          }}
        >
          {formatMessageTime(message.created_at)}
        </Text>
      ) : null}
      {message.type === "beat" && message.beat ? (
        <BeatCard beat={message.beat} mine={mine} playback={playback} playbackKey={`message:${message.id}`} />
      ) : message.type === "beat" ? (
        <View
          style={{
            alignSelf: mine ? "flex-end" : "flex-start",
            backgroundColor: "#F7F7F7",
            borderRadius: 18,
            maxWidth: "78%",
            paddingHorizontal: 12,
            paddingVertical: 10,
          }}
        >
          <Text style={{ color: "#6F6F6F", fontSize: 15, lineHeight: 20 }}>This beat is no longer available.</Text>
        </View>
      ) : (
        <View
          style={{
            alignSelf: mine ? "flex-end" : "flex-start",
            backgroundColor: mine ? "#111111" : "#F3F4F6",
            borderBottomLeftRadius: mine ? 18 : 6,
            borderBottomRightRadius: mine ? 6 : 18,
            borderRadius: 18,
            maxWidth: "78%",
            paddingHorizontal: 12,
            paddingVertical: 10,
          }}
        >
          <Text style={{ color: mine ? "#FFFFFF" : "#111111", fontSize: 16, lineHeight: 21 }}>{message.text}</Text>
        </View>
      )}
    </View>
  );
}
