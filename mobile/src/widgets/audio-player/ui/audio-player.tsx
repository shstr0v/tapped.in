import { Pressable, View } from "react-native";
import { Pause, Play } from "lucide-react-native";

import { Badge, Text } from "@/components/ui";
import type { MusicUpload } from "@/entities/music-upload";
import { BRAND_COLORS } from "@/shared/constants/brand";

type AudioPlayerProps = {
  isPlaying?: boolean;
  track: Pick<MusicUpload, "bpm" | "genre" | "title">;
};

export function AudioPlayer({ isPlaying = false, track }: AudioPlayerProps) {
  const Icon = isPlaying ? Pause : Play;

  return (
    <View className="flex-row items-center gap-3 rounded-lg bg-muted p-3">
      <Pressable
        accessibilityLabel={isPlaying ? "Pause preview" : "Play preview"}
        accessibilityRole="button"
        className="h-12 w-12 items-center justify-center rounded-full bg-primary"
      >
        <Icon color={BRAND_COLORS.foreground} size={22} />
      </Pressable>
      <View className="min-w-0 flex-1 gap-1">
        <Text className="font-semibold" numberOfLines={1}>
          {track.title}
        </Text>
        <View className="flex-row flex-wrap gap-2">
          {track.genre ? <Badge>{track.genre}</Badge> : null}
          {track.bpm ? <Badge>{`${track.bpm} BPM`}</Badge> : null}
        </View>
      </View>
    </View>
  );
}
