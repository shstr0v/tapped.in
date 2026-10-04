import { Pressable, type PressableProps } from "react-native";

import { cn } from "@/shared/lib/cn";

import { Text } from "./text";

type ChipProps = PressableProps & {
  label: string;
  selected?: boolean;
};

export function Chip({ className, label, selected, ...props }: ChipProps & { className?: string }) {
  return (
    <Pressable
      className={cn(
        "rounded-full border px-3 py-2",
        selected ? "border-primary bg-primary" : "border-border bg-card",
        className,
      )}
      {...props}
    >
      <Text className={cn("text-sm font-medium", selected ? "text-primary-foreground" : "text-foreground")}>
        {label}
      </Text>
    </Pressable>
  );
}
