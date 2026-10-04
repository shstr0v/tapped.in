import { useState } from "react";
import { router } from "expo-router";

import { Screen } from "@/components/layout/screen";
import { Button, Card, Input, Text } from "@/components/ui";
import { useUploadFeaturedWork } from "@/features/uploads/upload-featured-work";
import { OnboardingStepper } from "@/widgets/onboarding-stepper";

export function UploadWorkPage() {
  const [audioUrl, setAudioUrl] = useState("");
  const [title, setTitle] = useState("");
  const upload = useUploadFeaturedWork();

  const submit = () => {
    upload.mutate(
      {
        audio_url: audioUrl,
        tags: [],
        title,
      },
      {
        onSuccess: () => router.replace("/(tabs)/feed"),
      },
    );
  };

  return (
    <Screen>
      <OnboardingStepper currentStep={2} steps={["Profile", "Music identity", "Upload"]} />
      <Text variant="heading">Featured work</Text>
      <Text variant="muted">The backend currently accepts an audio URL for fastest MVP iteration.</Text>
      <Card className="gap-4">
        <Input onChangeText={setTitle} placeholder="Track or beat title" value={title} />
        <Input autoCapitalize="none" onChangeText={setAudioUrl} placeholder="Audio URL" value={audioUrl} />
        {upload.isError ? (
          <Text className="text-destructive" variant="muted">
            Could not save this upload.
          </Text>
        ) : null}
        <Button disabled={upload.isPending || !title || !audioUrl} onPress={submit}>
          {upload.isPending ? "Saving" : "Open feed"}
        </Button>
      </Card>
    </Screen>
  );
}
