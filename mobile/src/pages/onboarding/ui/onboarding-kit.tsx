import { type ReactNode, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  type TextInputProps,
  type TextStyle,
  View,
  useWindowDimensions,
} from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import { Text } from "@/components/ui";
import { AUTH_COLORS, AuthButton, AuthError, labelStyle } from "@/pages/auth/ui/auth-kit";
import ChevronIcon from "../../../../assets/icons/chevron.svg";

const STEPS = ["Profile", "Sound", "Featured work"];
const MAX_CONTENT_WIDTH = 430;

type OnboardingShellProps = {
  children: ReactNode;
  continueDisabled?: boolean;
  continueLabel?: string;
  hint?: string | null;
  loading?: boolean;
  onContinue: () => void;
  secondary?: { label: string; onPress: () => void };
  step: number;
  subtitle?: string;
  title: string;
};

export function OnboardingShell({
  children,
  continueDisabled,
  continueLabel = "Continue",
  hint,
  loading,
  onContinue,
  secondary,
  step,
  subtitle,
  title,
}: OnboardingShellProps) {
  const { height, width } = useWindowDimensions();
  const pagePadding = width < 380 ? 20 : 24;
  const compact = height < 760;

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top", "bottom"]}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} className="flex-1">
        <View style={[styles.column, { paddingHorizontal: pagePadding, paddingTop: compact ? 6 : 10 }]}>
          <View style={styles.headerRow}>
            {step > 0 ? (
              <Pressable
                accessibilityLabel="Go back"
                accessibilityRole="button"
                hitSlop={8}
                onPress={() => router.canGoBack() && router.back()}
                style={({ pressed }) => [styles.back, { opacity: pressed ? 0.6 : 1 }]}
              >
                <ChevronIcon height={20} width={20} />
                <Text style={text.back}>Back</Text>
              </Pressable>
            ) : (
              <View style={styles.back} />
            )}
            <Text style={text.step}>
              {step + 1} of {STEPS.length}
            </Text>
          </View>
          <View accessibilityLabel={`Step ${step + 1} of ${STEPS.length}`} style={styles.progress}>
            {STEPS.map((name, index) => (
              <View
                key={name}
                style={[styles.segment, { backgroundColor: index <= step ? AUTH_COLORS.ink : "#EDEDED" }]}
              />
            ))}
          </View>
        </View>

        <ScrollView
          contentContainerStyle={{
            paddingBottom: 24,
            paddingHorizontal: pagePadding,
            paddingTop: compact ? 20 : 28,
          }}
          keyboardDismissMode="interactive"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            <View className="items-center">
              <Text style={[text.title, compact && { fontSize: 26, lineHeight: 30 }]}>{title}</Text>
              {subtitle ? <Text style={text.subtitle}>{subtitle}</Text> : null}
            </View>
            <View style={{ gap: 20, marginTop: compact ? 24 : 32 }}>{children}</View>
          </View>
        </ScrollView>

        <View style={[styles.column, { paddingBottom: compact ? 12 : 16, paddingHorizontal: pagePadding, paddingTop: 12 }]}>
          <View style={{ gap: 4 }}>
            {hint ? <Text style={text.hint}>{hint}</Text> : null}
            <View style={{ marginTop: hint ? 6 : 0 }}>
              <AuthButton disabled={continueDisabled} loading={loading} onPress={onContinue}>
                {loading ? "Saving" : continueLabel}
              </AuthButton>
            </View>
            {secondary ? (
              <Pressable
                accessibilityRole="button"
                onPress={secondary.onPress}
                style={({ pressed }) => [styles.secondary, { opacity: pressed ? 0.6 : 1 }]}
              >
                <Text style={text.secondary}>{secondary.label}</Text>
              </Pressable>
            ) : null}
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

type SectionProps = {
  children: ReactNode;
  error?: string | null;
  hint?: string;
  label: string;
};

export function Section({ children, error, hint, label }: SectionProps) {
  return (
    <View style={{ gap: 8 }}>
      <View style={styles.sectionHead}>
        <Text style={labelStyle}>{label}</Text>
        {hint ? <Text style={text.sectionHint}>{hint}</Text> : null}
      </View>
      {children}
      {error ? <Text style={text.error}>{error}</Text> : null}
    </View>
  );
}

type FieldProps = TextInputProps & {
  error?: boolean;
};

export function Field({ error, multiline, onBlur, onFocus, style, ...props }: FieldProps) {
  const [focused, setFocused] = useState(false);

  return (
    <View
      style={[
        styles.field,
        multiline && { height: 104 },
        {
          backgroundColor: focused ? "#FFFFFF" : AUTH_COLORS.field,
          borderColor: error ? AUTH_COLORS.danger : focused ? AUTH_COLORS.borderFocus : "transparent",
        },
      ]}
    >
      <TextInput
        multiline={multiline}
        onBlur={(event) => {
          setFocused(false);
          onBlur?.(event);
        }}
        onFocus={(event) => {
          setFocused(true);
          onFocus?.(event);
        }}
        placeholderTextColor={AUTH_COLORS.subtle}
        style={[styles.input, multiline && styles.inputMultiline, style]}
        textAlignVertical={multiline ? "top" : "center"}
        {...props}
      />
    </View>
  );
}

type ChipProps = {
  label: string;
  onPress: () => void;
  selected: boolean;
  multi?: boolean;
};

function Chip({ label, multi, onPress, selected }: ChipProps) {
  return (
    <Pressable
      accessibilityRole={multi ? "checkbox" : "radio"}
      accessibilityState={multi ? { checked: selected } : { selected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        {
          backgroundColor: selected ? AUTH_COLORS.ink : AUTH_COLORS.field,
          transform: [{ scale: pressed ? 0.96 : 1 }],
        },
      ]}
    >
      <Text style={[text.chip, { color: selected ? "#FFFFFF" : AUTH_COLORS.text }]}>{label}</Text>
    </Pressable>
  );
}

type ChipGroupProps<T extends string> =
  | { multi?: false; onChange: (value: T) => void; options: { label: string; value: T }[]; value: T }
  | { multi: true; onChange: (value: T[]) => void; options: { label: string; value: T }[]; value: T[] };

export function ChipGroup<T extends string>(props: ChipGroupProps<T>) {
  return (
    <View style={styles.chipRow}>
      {props.options.map((option) => {
        if (props.multi) {
          const selected = props.value.includes(option.value);
          return (
            <Chip
              key={option.value}
              label={option.label}
              multi
              onPress={() =>
                props.onChange(
                  selected ? props.value.filter((item) => item !== option.value) : [...props.value, option.value],
                )
              }
              selected={selected}
            />
          );
        }
        return (
          <Chip
            key={option.value}
            label={option.label}
            onPress={() => props.onChange(option.value)}
            selected={props.value === option.value}
          />
        );
      })}
    </View>
  );
}

export function toOptions<T extends string>(values: readonly T[]) {
  return values.map((value) => ({ label: value, value }));
}

export const FormError = AuthError;

const text: Record<string, TextStyle> = {
  back: { color: "#B2B2B2", fontSize: 16, fontWeight: "600", lineHeight: 20 },
  chip: { fontSize: 15, fontWeight: "600", lineHeight: 20 },
  error: { color: AUTH_COLORS.danger, fontSize: 13, fontWeight: "500", paddingLeft: 4 },
  hint: { color: AUTH_COLORS.subtle, fontSize: 13, fontWeight: "500", lineHeight: 17, textAlign: "center" },
  secondary: { color: AUTH_COLORS.text, fontSize: 14, fontWeight: "600" },
  sectionHint: { color: AUTH_COLORS.subtle, fontSize: 13, fontWeight: "500", lineHeight: 16 },
  step: { color: AUTH_COLORS.subtle, fontSize: 13, fontVariant: ["tabular-nums"], fontWeight: "600" },
  subtitle: {
    color: AUTH_COLORS.muted,
    fontSize: 16,
    fontWeight: "500",
    lineHeight: 21,
    marginTop: 8,
    maxWidth: 320,
    textAlign: "center",
  },
  title: {
    color: "#000000",
    fontSize: 28,
    fontWeight: "700",
    lineHeight: 33,
    maxWidth: 340,
    textAlign: "center",
  },
};

const styles = StyleSheet.create({
  back: {
    alignItems: "center",
    flexDirection: "row",
    gap: 2,
    marginLeft: -6,
    minHeight: 44,
    minWidth: 44,
    paddingRight: 8,
  },
  chip: {
    alignItems: "center",
    borderRadius: 22,
    height: 44,
    justifyContent: "center",
    paddingHorizontal: 18,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  column: {
    alignSelf: "center",
    maxWidth: MAX_CONTENT_WIDTH + 48,
    width: "100%",
  },
  content: {
    alignSelf: "center",
    maxWidth: MAX_CONTENT_WIDTH,
    width: "100%",
  },
  field: {
    borderRadius: 18,
    borderWidth: 1.5,
    height: 56,
  },
  headerRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  input: {
    color: AUTH_COLORS.text,
    flex: 1,
    fontSize: 16,
    outlineStyle: "none",
    paddingHorizontal: 18,
  } as TextStyle,
  inputMultiline: {
    paddingBottom: 14,
    paddingTop: 16,
  },
  progress: {
    flexDirection: "row",
    gap: 6,
    marginTop: 4,
  },
  secondary: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 44,
  },
  sectionHead: {
    alignItems: "baseline",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingRight: 4,
  },
  segment: {
    borderRadius: 2,
    flex: 1,
    height: 3,
  },
});
