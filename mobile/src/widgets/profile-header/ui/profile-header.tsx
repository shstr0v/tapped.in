import { Image, View } from "react-native";

import { Badge, Text } from "@/components/ui";
import type { MusicProfile } from "@/entities/music-profile";

type ProfileHeaderProps = {
  profile: Pick<
    MusicProfile,
    "artist_name" | "avatar_url" | "experience_level" | "location" | "role"
  >;
};

export function ProfileHeader({ profile }: ProfileHeaderProps) {
  return (
    <View className="flex-row items-center gap-4">
      {profile.avatar_url ? (
        <Image className="h-20 w-20 rounded-lg bg-muted" source={{ uri: profile.avatar_url }} />
      ) : (
        <View className="h-20 w-20 items-center justify-center rounded-lg bg-primary">
          <Text className="text-3xl font-bold text-primary-foreground">
            {profile.artist_name.slice(0, 1).toUpperCase()}
          </Text>
        </View>
      )}
      <View className="min-w-0 flex-1 gap-2">
        <Text numberOfLines={1} variant="heading">
          {profile.artist_name}
        </Text>
        <View className="flex-row flex-wrap gap-2">
          <Badge>{profile.role}</Badge>
          <Badge>{profile.experience_level}</Badge>
          {profile.location ? <Badge>{profile.location}</Badge> : null}
        </View>
      </View>
    </View>
  );
}
