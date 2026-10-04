import { useLocalSearchParams } from "expo-router";
import { useQuery } from "@tanstack/react-query";

import { Screen } from "@/components/layout/screen";
import { Card, EmptyState, Text } from "@/components/ui";
import { profilesApi } from "@/shared/api";
import { AudioPlayer } from "@/widgets/audio-player";
import { ProfileHeader } from "@/widgets/profile-header";

export function ProfileDetailsPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const profile = useQuery({
    enabled: Boolean(id),
    queryFn: () => profilesApi.getById(id),
    queryKey: ["profiles", id],
  });

  return (
    <Screen>
      {profile.data ? (
        <>
          <ProfileHeader profile={profile.data} />
          <Card className="gap-2">
            <Text variant="label">Sound</Text>
            <Text variant="muted">
              {profile.data.identity?.genres.join(", ") || "No genres listed yet"}
            </Text>
          </Card>
          {profile.data.featured_upload ? <AudioPlayer track={profile.data.featured_upload} /> : null}
        </>
      ) : (
        <EmptyState
          description="This profile can be loaded from a feed card or connection."
          title={profile.isLoading ? "Loading profile" : "Profile unavailable"}
        />
      )}
    </Screen>
  );
}
