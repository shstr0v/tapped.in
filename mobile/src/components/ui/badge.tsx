import { View } from "react-native";

import { cn } from "@/shared/lib/cn";

import { Text } from "./text";

type BadgeProps = {
  children: string;
  className?: string;
};

export function Badge({ children, className }: BadgeProps) {
  return (
    <View className={cn("rounded-full bg-muted px-3 py-1", className)}>
      <Text className="text-xs font-semibold text-foreground">{children}</Text>
    </View>
  );
}
