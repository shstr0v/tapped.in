import { View } from "react-native";

import { Text } from "./text";

type EmptyStateProps = {
  description?: string;
  title: string;
};

export function EmptyState({ description, title }: EmptyStateProps) {
  return (
    <View className="items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-card p-6">
      <Text className="text-center" variant="label">
        {title}
      </Text>
      {description ? (
        <Text className="text-center" variant="muted">
          {description}
        </Text>
      ) : null}
    </View>
  );
}
