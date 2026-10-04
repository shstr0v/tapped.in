import { useState } from "react";
import { router } from "expo-router";

import { Screen } from "@/components/layout/screen";
import { Button, Card, Chip, Input, Text } from "@/components/ui";
import type { MusicProfileRole } from "@/entities/music-profile";
import { useCompleteProfile } from "@/features/profile/complete-profile";
import { OnboardingStepper } from "@/widgets/onboarding-stepper";

const roles: MusicProfileRole[] = ["artist", "producer"];

export function OnboardingProfilePage() {
  const [artistName, setArtistName] = useState("");
  const [location, setLocation] = useState("");
  const [role, setRole] = useState<MusicProfileRole>("artist");
  const completeProfile = useCompleteProfile();

  const submit = () => {
    completeProfile.mutate(
      {
        artist_name: artistName,
        collaboration_status: "open",
        experience_level: "beginner",
        identity: {
          genres: [],
          influences: [],
          moods: [],
          type_beats: [],
        },
        location,
        role,
        socials: [],
      },
      {
        onSuccess: () => router.push("/(onboarding)/music"),
      },
    );
  };

  return (
    <Screen>
      <OnboardingStepper currentStep={0} steps={["Profile", "Music identity", "Upload"]} />
      <Text variant="heading">Profile basics</Text>
      <Card className="gap-4">
        <Input onChangeText={setArtistName} placeholder="Artist or producer name" value={artistName} />
        <Input onChangeText={setLocation} placeholder="Location" value={location} />
        <Text variant="label">Role</Text>
        <Card className="flex-row gap-2 border-0 bg-transparent p-0 shadow-none">
          {roles.map((item) => (
            <Chip key={item} label={item} onPress={() => setRole(item)} selected={role === item} />
          ))}
        </Card>
        <Button disabled={completeProfile.isPending || !artistName} onPress={submit}>
          Continue
        </Button>
      </Card>
    </Screen>
  );
}
