import { useEffect, useState } from "react";
import { useAudioPlayer, useAudioPlayerStatus } from "expo-audio";
import { Music } from "lucide-react-native";
import { ActivityIndicator, Pressable, View } from "react-native";

import { Text } from "@/components/ui";
import PauseIcon from "../../../../assets/icons/pause.svg";
import PlayIcon from "../../../../assets/icons/play.svg";

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) {
    return "0:00";
  }
  const total = Math.floor(seconds);
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`;
}

type SelectedFileProps = {
  locked: boolean;
  name: string;
  onRemove: () => void;
  onReplace: () => void;
  sizeLabel: string | null;
  uri: string;
};

export function SelectedFile({ locked, name, onRemove, onReplace, sizeLabel, uri }: SelectedFileProps) {
  const player = useAudioPlayer(uri, { updateInterval: 250 });
  useAudioPlayerStatus(player);
  const [failed, setFailed] = useState(false);
  const [live, setLive] = useState({ current: 0, duration: 0, loaded: false, paused: true });
  const ended = live.duration > 0 && live.current >= live.duration - 0.2;
  const isPlaying = !live.paused && !ended;
  const progress = live.duration > 0 ? Math.min(live.current / live.duration, 1) : 0;

  useEffect(() => {
    const subscription = (
      player as unknown as {
        addListener: (
          event: string,
          listener: (status: { error?: string | null }) => void,
        ) => { remove: () => void };
      }
    ).addListener("playbackStatusUpdate", (next) => {
      if (next.error) {
        setFailed(true);
      }
    });
    const timer = setInterval(() => {
      setLive({
        current: player.currentTime,
        duration: player.duration,
        loaded: player.isLoaded,
        paused: player.paused,
      });
    }, 250);

    return () => {
      clearInterval(timer);
      subscription.remove();
      player.pause();
    };
  }, [player, uri]);

  const togglePlayback = () => {
    if (isPlaying) {
      player.pause();
      return;
    }
    if (ended) {
      player.seekTo(0);
    }
    player.play();
  };

  return (
    <View style={{ backgroundColor: "#F7F7F7", borderRadius: 16, gap: 10, paddingHorizontal: 14, paddingVertical: 12 }}>
      <View style={{ alignItems: "center", flexDirection: "row", gap: 12 }}>
        <View
          style={{
            alignItems: "center",
            backgroundColor: "#FFFFFF",
            borderRadius: 12,
            height: 40,
            justifyContent: "center",
            width: 40,
          }}
        >
          <Music color="#111111" size={18} strokeWidth={2} />
        </View>
        <View style={{ flex: 1, gap: 2, minWidth: 0 }}>
          <Text className="font-semibold text-black" numberOfLines={1} style={{ fontSize: 15, lineHeight: 20 }}>
            {name}
          </Text>
          <Text style={{ color: "#8F8F8F", fontSize: 12, fontVariant: ["tabular-nums"], fontWeight: "500", lineHeight: 16 }}>
            {sizeLabel ? sizeLabel : "Audio"}
            {live.duration > 0 ? ` · ${formatTime(ended ? 0 : live.current)} / ${formatTime(live.duration)}` : ""}
          </Text>
        </View>
        <Pressable
          accessibilityLabel={isPlaying ? "Pause preview" : ended ? "Replay preview" : "Play preview"}
          accessibilityRole="button"
          disabled={failed}
          hitSlop={8}
          onPress={togglePlayback}
          style={({ pressed }) => ({
            alignItems: "center",
            height: 40,
            justifyContent: "center",
            opacity: failed ? 0.4 : 1,
            transform: [{ scale: pressed ? 0.96 : 1 }],
            width: 40,
          })}
        >
          {!live.loaded && !failed ? (
            <ActivityIndicator color="#111111" size="small" />
          ) : isPlaying ? (
            <PauseIcon height={22} width={22} />
          ) : (
            <PlayIcon height={22} width={22} />
          )}
        </Pressable>
      </View>
      {live.duration > 0 ? (
        <View style={{ backgroundColor: "#E6E6E6", borderRadius: 2, height: 3, overflow: "hidden" }}>
          <View style={{ backgroundColor: "#111111", height: 3, width: `${progress * 100}%` }} />
        </View>
      ) : null}
      {failed ? (
        <Text style={{ color: "#8F8F8F", fontSize: 13, fontWeight: "500", lineHeight: 18 }}>Could not play this file.</Text>
      ) : null}
      <View style={{ flexDirection: "row", gap: 8 }}>
        <Pressable
          accessibilityRole="button"
          disabled={locked}
          onPress={onReplace}
          style={({ pressed }) => ({
            alignItems: "center",
            backgroundColor: "#FFFFFF",
            borderRadius: 14,
            flex: 1,
            height: 36,
            justifyContent: "center",
            opacity: locked ? 0.4 : 1,
            transform: [{ scale: pressed && !locked ? 0.98 : 1 }],
          })}
        >
          <Text className="font-semibold text-black" style={{ fontSize: 14, lineHeight: 18 }}>
            Replace
          </Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          disabled={locked}
          onPress={onRemove}
          style={({ pressed }) => ({
            alignItems: "center",
            backgroundColor: "#FFFFFF",
            borderRadius: 14,
            flex: 1,
            height: 36,
            justifyContent: "center",
            opacity: locked ? 0.4 : 1,
            transform: [{ scale: pressed && !locked ? 0.98 : 1 }],
          })}
        >
          <Text className="font-semibold" style={{ color: "#8F8F8F", fontSize: 14, lineHeight: 18 }}>
            Remove
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
