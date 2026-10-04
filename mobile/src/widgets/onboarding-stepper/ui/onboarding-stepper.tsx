import { View } from "react-native";

import { Text } from "@/components/ui";
import { cn } from "@/shared/lib/cn";

type OnboardingStepperProps = {
  currentStep: number;
  steps: string[];
};

export function OnboardingStepper({ currentStep, steps }: OnboardingStepperProps) {
  return (
    <View className="gap-3">
      <View className="flex-row gap-2">
        {steps.map((step, index) => (
          <View
            key={step}
            className={cn(
              "h-2 flex-1 rounded-full",
              index <= currentStep ? "bg-primary" : "bg-muted",
            )}
          />
        ))}
      </View>
      <Text variant="muted">
        Step {currentStep + 1} of {steps.length}: {steps[currentStep]}
      </Text>
    </View>
  );
}
