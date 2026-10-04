import { router } from "expo-router";

import { Screen } from "@/components/layout/screen";
import { Button, Card, Chip, Text } from "@/components/ui";
import { OnboardingStepper } from "@/widgets/onboarding-stepper";

const starterTags = ["Trap", "Rage", "Hyperpop", "R&B", "Drill", "Melodic"];

export function OnboardingMusicPage() {
  return (
    <Screen>
      <OnboardingStepper currentStep={1} steps={["Profile", "Music identity", "Upload"]} />
      <Text variant="heading">Music identity</Text>
      <Text variant="muted">
        This page is ready for the genre, influence, type beat and BPM controls from the MVP.
      </Text>
      <Card className="gap-4">
        <Text variant="label">Starter tags</Text>
        <Card className="flex-row flex-wrap gap-2 border-0 bg-transparent p-0 shadow-none">
          {starterTags.map((tag) => (
            <Chip key={tag} label={tag} />
          ))}
        </Card>
        <Button onPress={() => router.push("/(onboarding)/upload")}>Continue to upload</Button>
      </Card>
    </Screen>
  );
}
