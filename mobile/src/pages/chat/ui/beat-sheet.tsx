import { ActivityIndicator, Modal, Pressable, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Avatar, Text } from "@/components/ui";
import type { BeatPreview } from "@/entities/conversation";
import type { MusicUpload } from "@/entities/music-upload";
import { useReduceMotion } from "@/shared/lib/reduce-motion";
import PauseIcon from "../../../../assets/icons/pause.svg";
import PlayIcon from "../../../../assets/icons/play.svg";

type Playback = {
  activeKey: string | null;
  live: { current: number; duration: number; paused: boolean };
  toggle: (key: string, url: string) => void;
};

function uploadPreview(upload: MusicUpload, ownerName: string, avatarUrl: string | null): BeatPreview {
  return {
    audio_url: upload.audio_url,
    bpm: upload.bpm,
    genre: upload.genre,
    id: upload.id,
    owner: {
      artist_name: ownerName,
      avatar_url: avatarUrl,
      profile_id: upload.profile_id,
      role: null,
      user_id: "",
    },
    profile_id: upload.profile_id,
    tags: upload.tags,
    title: upload.title,
  };
}

export function BeatSheet({
  avatarUrl,
  error,
  loading,
  onClose,
  onRetry,
  onSelect,
  ownerName,
  playback,
  sending,
  uploads,
  visible,
}: {
  avatarUrl: string | null;
  error: boolean;
  loading: boolean;
  onClose: () => void;
  onRetry: () => void;
  onSelect: (preview: BeatPreview) => void;
  ownerName: string;
  playback: Playback;
  sending: boolean;
  uploads: MusicUpload[];
  visible: boolean;
}) {
  const insets = useSafeAreaInsets();
  const reduceMotion = useReduceMotion();

  return (
    <Modal animationType={reduceMotion ? "none" : "slide"} onRequestClose={onClose} transparent visible={visible}>
      <Pressable
        accessibilityLabel="Close beats"
        onPress={onClose}
        style={{ backgroundColor: "rgba(0,0,0,0.28)", flex: 1, justifyContent: "flex-end" }}
      >
        <Pressable
          onPress={() => undefined}
          style={{
            backgroundColor: "#FFFFFF",
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            maxHeight: "74%",
            paddingBottom: Math.max(insets.bottom, 16),
            paddingHorizontal: 20,
            paddingTop: 12,
          }}
        >
          <View style={{ alignSelf: "center", backgroundColor: "#E4E4E4", borderRadius: 2, height: 4, marginBottom: 16, width: 36 }} />
          <Text style={{ color: "#111111", fontSize: 20, fontWeight: "700", lineHeight: 24 }}>Your beats</Text>
          <ScrollView contentContainerStyle={{ paddingTop: 8 }} keyboardShouldPersistTaps="handled">
            {loading ? (
              <View style={{ gap: 14, paddingVertical: 12 }}>
                {Array.from({ length: 3 }, (_, index) => (
                  <View key={index} style={{ alignItems: "center", flexDirection: "row", minHeight: 64 }}>
                    <View style={{ backgroundColor: "#E8E8E8", borderRadius: 10, height: 44, width: 44 }} />
                    <View style={{ flex: 1, gap: 8, marginLeft: 12 }}>
                      <View style={{ backgroundColor: "#E8E8E8", borderRadius: 6, height: 14, width: "50%" }} />
                      <View style={{ backgroundColor: "#E8E8E8", borderRadius: 6, height: 12, width: "28%" }} />
                    </View>
                  </View>
                ))}
              </View>
            ) : error ? (
              <Pressable accessibilityRole="button" onPress={onRetry} style={{ minHeight: 44, justifyContent: "center" }}>
                <Text style={{ color: "#111111", fontSize: 15, fontWeight: "600" }}>Could not load your beats. Try again.</Text>
              </Pressable>
            ) : uploads.length === 0 ? (
              <Text style={{ color: "#6F6F6F", fontSize: 15, fontWeight: "500", lineHeight: 20, paddingVertical: 12 }}>
                Upload a beat on your profile to share it here.
              </Text>
            ) : (
              uploads.map((upload) => {
                const key = `upload:${upload.id}`;
                const playing = playback.activeKey === key && !playback.live.paused;
                const detail = [upload.bpm ? `${upload.bpm} BPM` : null, upload.genre].filter(Boolean).join(" · ");
                return (
                  <View key={upload.id} style={{ alignItems: "center", flexDirection: "row", minHeight: 68 }}>
                    <Pressable
                      accessibilityLabel={`Send ${upload.title}`}
                      accessibilityRole="button"
                      disabled={sending}
                      onPress={() => onSelect(uploadPreview(upload, ownerName, avatarUrl))}
                      style={({ pressed }) => ({
                        alignItems: "center",
                        flex: 1,
                        flexDirection: "row",
                        minHeight: 64,
                        opacity: pressed || sending ? 0.6 : 1,
                      })}
                    >
                      <View style={{ borderColor: "rgba(0,0,0,0.08)", borderRadius: 10, borderWidth: 1 }}>
                        <Avatar name={ownerName || upload.title} size={44} uri={avatarUrl} />
                      </View>
                      <View style={{ flex: 1, marginLeft: 12, minWidth: 0 }}>
                        <Text className="font-semibold" numberOfLines={1} style={{ fontSize: 16 }}>
                          {upload.title}
                        </Text>
                        {detail ? (
                          <Text numberOfLines={1} style={{ color: "#6F6F6F", fontSize: 13, marginTop: 2 }}>
                            {detail}
                          </Text>
                        ) : null}
                      </View>
                    </Pressable>
                    <Pressable
                      accessibilityLabel={playing ? `Pause ${upload.title}` : `Play ${upload.title}`}
                      accessibilityRole="button"
                      hitSlop={8}
                      onPress={() => playback.toggle(key, upload.audio_url)}
                      style={({ pressed }) => ({
                        alignItems: "center",
                        height: 44,
                        justifyContent: "center",
                        transform: [{ scale: pressed ? 0.97 : 1 }],
                        width: 44,
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
                );
              })
            )}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
