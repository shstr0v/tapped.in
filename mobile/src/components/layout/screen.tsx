import { type ReactNode } from "react";
import { ScrollView, View } from "react-native";
import { SafeAreaView, type Edge } from "react-native-safe-area-context";

import { cn } from "@/shared/lib/cn";

type ScreenProps = {
  children: ReactNode;
  className?: string;
  edges?: Edge[];
  scroll?: boolean;
};

export function Screen({ children, className, edges, scroll = true }: ScreenProps) {
  const content = <View className={cn("flex-1 gap-4 px-5 py-4", className)}>{children}</View>;

  return (
    <SafeAreaView className="flex-1 bg-background" edges={edges}>
      {scroll ? (
        <ScrollView
          className="flex-1"
          contentContainerClassName="grow"
          keyboardShouldPersistTaps="handled"
        >
          {content}
        </ScrollView>
      ) : (
        content
      )}
    </SafeAreaView>
  );
}
