import { View, type ViewProps } from "react-native";

import { cn } from "@/shared/lib/cn";

export function Card({ className, ...props }: ViewProps & { className?: string }) {
  return (
    <View
      className={cn("rounded-lg border border-border bg-card p-4 shadow-sm shadow-slate-200", className)}
      {...props}
    />
  );
}
