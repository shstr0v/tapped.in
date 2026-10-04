import { TextInput, type TextInputProps } from "react-native";

import { cn } from "@/shared/lib/cn";

export function Input({ className, placeholderTextColor = "#667085", ...props }: TextInputProps) {
  return (
    <TextInput
      className={cn(
        "min-h-12 rounded-lg border border-border bg-card px-4 text-base text-foreground",
        className,
      )}
      placeholderTextColor={placeholderTextColor}
      {...props}
    />
  );
}
