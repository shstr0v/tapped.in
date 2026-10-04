import { useState } from "react";
import { useLocalSearchParams } from "expo-router";

import { Screen } from "@/components/layout/screen";
import { Button, Card, Chip, Input, Text } from "@/components/ui";
import type { FeedbackCategory } from "@/entities/feedback";
import { useSubmitFeedback } from "@/features/feedback/submit-feedback";

const categories: FeedbackCategory[] = [
  "production",
  "mix",
  "vocals",
  "flow",
  "melody",
  "arrangement",
  "originality",
];

export function FeedbackPage() {
  const { uploadId } = useLocalSearchParams<{ uploadId: string }>();
  const [category, setCategory] = useState<FeedbackCategory>("production");
  const [text, setText] = useState("");
  const submitFeedback = useSubmitFeedback();

  return (
    <Screen>
      <Text variant="heading">Leave feedback</Text>
      <Text variant="muted">Quick structured feedback keeps music discovery useful.</Text>

      <Card className="gap-4">
        <Card className="flex-row flex-wrap gap-2 border-0 bg-transparent p-0 shadow-none">
          {categories.map((item) => (
            <Chip key={item} label={item} onPress={() => setCategory(item)} selected={category === item} />
          ))}
        </Card>
        <Input
          multiline
          onChangeText={setText}
          placeholder="Optional note"
          textAlignVertical="top"
          value={text}
        />
        <Button
          disabled={!uploadId || submitFeedback.isPending}
          onPress={() =>
            submitFeedback.mutate({
              category,
              target_upload_id: uploadId,
              text: text || null,
            })
          }
        >
          Send feedback
        </Button>
      </Card>
    </Screen>
  );
}
